# 적응형 출력 토큰 에스컬레이션 설계

> 에스컬레이션된 한도를 초과하는 응답에 대한 다중 턴 복구를 통해 출력 토큰에 대한 "낮은 기본값 + 잘림 시 에스컬레이션" 전략을 통해 GPU 슬롯 초과 예약을 최대 4배까지 줄입니다.

## 문제

모든 API 요청은 다음에 비례하여 고정 GPU 슬롯을 예약합니다.`max_tokens`. 이전 기본값인 32K 토큰은 각 요청이 32K 출력 슬롯을 예약하지만 응답의 99%가 5K 토큰 미만임을 의미합니다. 이는 GPU 용량을 4\~6배 이상 예약하여 서버 동시성을 제한하고 비용을 증가시킵니다.

## 해결책

제한된 기본값을 사용하십시오.**8K**토큰을 출력합니다. 응답이 잘릴 때(모델이`max_tokens`):

1. **차츰 오르다**모델의 전체 출력 제한까지(알 수 없는 모델의 경우 최소 64K)
2. 그래도 잘린 경우**다시 덮다**부분 응답을 기록에 유지하고 연속 메시지를 삽입하여 최대 3회
3. 복구가 소진되면 도구 스케줄러의 잘림 지침으로 돌아갑니다.

요청의 1% 미만이 실제로 잘리기 때문에 이는 긴 응답에 대한 출력 품질을 유지하면서 평균 슬롯 예약을 크게 줄입니다.

## 건축학

```
Request (max_tokens = 8K)
│
▼
┌─────────────────────────┐
│  Response truncated?     │──── No ──▶ Done ✓
│  (MAX_TOKENS)            │
└───────────┬──────────────┘
            │ Yes
            ▼
┌──────────────────────────────────────────────────┐
│  Layer 1: Escalate to model output limit         │
│  ┌────────────────────────────────────────────┐  │
│  │ Pop partial response from history          │  │
│  │ RETRY (isContinuation: false → reset UI)   │  │
│  │ Re-send at max(64K, model output limit)    │  │
│  └────────────────────────────────────────────┘  │
└───────────┬──────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│  Still truncated?        │──── No ──▶ Done ✓
│  (MAX_TOKENS)            │
└───────────┬──────────────┘
            │ Yes
            ▼
┌──────────────────────────────────────────────────┐
│  Layer 2: Multi-turn recovery (up to 3×)         │
│  ┌────────────────────────────────────────────┐  │
│  │ Keep partial response in history           │  │
│  │ Push user message: "Resume directly..."    │  │
│  │ RETRY (isContinuation: true → keep UI buf) │  │
│  │ Re-send with updated history               │  │
│  │ Model continues from where it left off     │  │
│  └──────────────┬─────────────────────────────┘  │
│                 │                                 │
│          ┌──────┴──────┐                          │
│          │ Succeeded?  │── Yes ──▶ Done ✓         │
│          └──────┬──────┘                          │
│                 │ No (still truncated)            │
│                 ▼                                 │
│          attempt < 3? ── Yes ──▶ loop back ↑      │
└───────────┬──────────────────────────────────────┘
            │ No (exhausted)
            ▼
┌──────────────────────────────────────────────────┐
│  Layer 3: Tool scheduler fallback                │
│  ┌────────────────────────────────────────────┐  │
│  │ Reject truncated Edit/Write tool calls     │  │
│  │ Return guidance: "You MUST split into      │  │
│  │ smaller parts — write skeleton first,      │  │
│  │ then edit incrementally."                  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

## 토큰 한도 결정

효과적인`max_tokens`다음 우선순위에 따라 해결됩니다.

| 우선 사항    | 원천                                  | 값(알려진 모델)                    | 값(알 수 없는 모델)       | 에스컬레이션 동작                  |
| -------- | ----------------------------------- | ---------------------------- | ------------------ | -------------------------- |
| 1(가장 높음) | 사용자 구성(`samplingParams.max_tokens`) | `min(userValue, modelLimit)` | `userValue`        | 에스컬레이션 없음                  |
| 2        | 환경변수(`QWEN_CODE_MAX_OUTPUT_TOKENS`) | `min(envValue, modelLimit)`  | `envValue`         | 에스컬레이션 없음                  |
| 3(최저)    | 한도가 있는 기본값                          | `min(modelLimit, 8K)`        | `min(32K, 8K)`= 8K | 모델 제한(64K 층)으로 에스컬레이션 + 복구 |

"알려진 모델"은 다음에 명시적인 항목이 있는 모델입니다.`OUTPUT_PATTERNS`(다음을 통해 확인됨`hasExplicitOutputLimit()`). 알려진 모델의 경우 유효 값은 API 오류를 방지하기 위해 항상 모델이 선언한 출력 제한으로 제한됩니다. 백엔드가 더 큰 제한을 지원할 수 있으므로 알 수 없는 모델(사용자 지정 배포, 자체 호스팅 엔드포인트)은 사용자의 가치를 직접 전달합니다.

이 논리는 세 가지 콘텐츠 생성기에서 구현됩니다.

* `기본값OpenAICompatibleProvider.applyOutputTokenLimit()`— OpenAI 호환 제공업체
* `DashScopeProvider`— 상속`applyOutputTokenLimit()`기본 공급자로부터
* `AnthropicContentGenerator.buildSamplingParameters()`— 인류 공급자

## 에스컬레이션 메커니즘

에스컬레이션 논리는`geminiChat.ts`, 배치됨**밖의**주요 재시도 루프. 이는 의도적인 것입니다:

1. 재시도 루프는 일시적인 오류(속도 제한, 잘못된 스트림, 콘텐츠 유효성 검사)를 처리합니다.
2. 잘림은 오류가 아닙니다. 짧게 잘린 성공적인 응답입니다.
3. 에스컬레이션된 스트림의 오류는 재시도 논리에 의해 포착되지 않고 호출자에게 직접 전파되어야 합니다.

### 에스컬레이션 단계(geminiChat.ts)

```
1. Stream completes successfully (lastError === null)
2. Last chunk has finishReason === MAX_TOKENS
3. Guard checks pass:
   - maxTokensEscalated === false (prevent infinite escalation)
   - hasUserMaxTokensOverride === false (respect user intent)
4. Compute escalated limit: max(ESCALATED_MAX_TOKENS, tokenLimit(model, 'output'))
5. Pop the partial model response from chat history
6. Yield RETRY event (isContinuation: false) → UI discards partial output and resets buffers
7. Re-send the same request with maxOutputTokens: escalatedLimit
```

### 복구 단계(geminiChat.ts)

에스컬레이션된 응답도 잘리는 경우(finishReason === MAX\_TOKENS) 복구 루프는 최대`MAX_OUTPUT_RECOVERY_ATTEMPTS`(3)번:

```
1. Partial model response is already in history (pushed by processStreamResponse)
2. Push a recovery user message: OUTPUT_RECOVERY_MESSAGE
3. Yield RETRY event (isContinuation: true) → UI keeps text buffer for continuation
4. Re-send with updated history (model sees its partial output + recovery instruction)
5. If still truncated and attempts remain, loop back to step 1
6. If recovery attempt throws (empty response, network error):
   - Pop the dangling recovery message from history
   - Break out of recovery loop
```

### RETRY 시 상태 정리(turn.ts)

때`Turn`클래스가 RETRY 이벤트를 수신하면 불일치를 방지하기 위해 누적된 상태를 지웁니다.

* `pendingToolCalls`— 첫 번째 잘린 응답에 에스컬레이션된 응답에서 반복되는 완료된 도구 호출이 포함된 경우 중복 도구 호출을 피하기 위해 지워집니다.
* `pendingCitations`— 중복 인용을 피하기 위해 삭제됨
* `debugResponses`— 오래된 디버그 데이터를 방지하기 위해 지워졌습니다.
* `finishReason`— 재설정`undefined`따라서 새 응답의 종료 이유가 사용됩니다.

그만큼`isContinuation`플래그는 UI를 통해 전달되므로 텍스트 버퍼를 재설정(에스컬레이션)할지 아니면 유지(복구)할지 결정할 수 있습니다.

## 상수

정의됨`geminiChat.ts`그리고`tokenLimits.ts`:

| 끊임없는                           | 값      | 목적                              |
| ------------------------------ | ------ | ------------------------------- |
| `CAPPED_DEFAULT_MAX_TOKENS`    | 8,000  | 사용자 재정의가 설정되지 않은 경우 기본 출력 토큰 제한 |
| `ESCALATED_MAX_TOKENS`         | 64,000 | 에스컬레이션 최소값(모델 한도를 알 수 없는 경우 사용) |
| `MAX_OUTPUT_RECOVERY_ATTEMPTS` | 3      | 에스컬레이션 후 최대 다중 턴 복구 시도 횟수       |

효과적인 에스컬레이션 한도는 다음과 같습니다.`max(ESCALATED_MAX_TOKENS, tokenLimit(model, 'output'))`:

| 모델            | 한도 상향 조정       |
| ------------- | -------------- |
| 직장폐쇄 4.6      | 131,072 (128K) |
| GPT-5 / o 시리즈 | 131,072 (128K) |
| Qwen3.x       | 65,536(64K)    |
| 알 수 없는 모델     | 64,000 (층)     |

## 디자인 결정

### 왜 8K가 기본값인가요?

* 응답의 99%가 5,000개 토큰 미만입니다.
* 8K는 불필요한 재시도를 유발하지 않고 약간 더 긴 응답을 위한 합리적인 헤드룸을 제공합니다.
* 평균 슬롯 예약을 32K에서 8K로 줄입니다(4배 개선).

### 고정 64K 대신 모델 제한으로 확대하는 이유는 무엇입니까?

* 출력 제한이 더 높은 모델(Claude Opus 128K, GPT-5 128K)은 불필요하게 64K로 제한되었습니다.
* 모델의 실제 제한을 사용하면 두 번째 재시도 없이 긴 출력의 대부분을 캡처합니다.
* `ESCALATED_MAX_TOKENS`(64K)는 알려지지 않은 모델의 바닥 역할을 합니다.`tokenLimit()`기본 32K를 반환합니다.

### 점진적인 에스컬레이션 대신 다단계 복구를 수행하는 이유는 무엇입니까?

* 점진적 에스컬레이션(8K → 16K → 32K → 64K)을 수행하려면 매번 전체 응답을 재생성해야 합니다.
* 다중 회전 복구는 부분 응답을 유지하고 모델이 계속되도록 하여 토큰과 대기 시간을 절약합니다.
* 복구 메시지는 대규모 응답을 재생성하는 것에 비해 저렴합니다(각각 최대 40개 토큰).
* 3회 시도 제한은 대부분의 실제 사례를 포괄하면서 무한 루프를 방지합니다.

### 에스컬레이션이 재시도 루프 외부에 있는 이유는 무엇입니까?

* 잘림은 오류가 아닌 성공 사례입니다.
* 에스컬레이션된 스트림의 오류(속도 제한, 네트워크 오류)는 잘못된 매개변수를 사용하여 자동으로 재시도하는 대신 직접 전파되어야 합니다.
* 원래 목적(일시적인 오류 복구)에 초점을 맞춘 재시도 루프를 유지합니다.
* 전체 대화가 중단되는 것을 방지하기 위해 복구 오류가 별도로 포착됩니다.
