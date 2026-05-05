# 프롬프트 제안(NES) 디자인

> AI가 응답을 완료한 후 사용자가 자연스럽게 다음에 입력할 내용을 예측하여 입력 프롬프트에 고스트 텍스트로 표시합니다.
>
> 구현 상태:`prompt-suggestion-implementation.md`. 추측 엔진:`speculation-design.md`.

## 개요

에이**신속한 제안**(다음 단계 제안/NES)은 각 AI 응답 후 LLM 호출에 의해 생성된 사용자의 다음 입력에 대한 짧은 예측(2-12단어)입니다. 입력 프롬프트에 고스트 텍스트로 나타납니다. 사용자는 Tab/Enter/오른쪽 화살표를 사용하여 수락하거나 입력하여 닫을 수 있습니다.

## 건축학

```
┌─────────────────────────────────────────────────────────────┐
│  AppContainer (CLI)                                         │
│                                                             │
│  Responding → Idle transition                               │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Guard Conditions (11 categories)                    │    │
│  │  settings, interactive, sdk, plan mode, dialogs,    │    │
│  │  elicitation, API error                             │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  generatePromptSuggestion()                         │    │
│  │                                                     │    │
│  │  ┌─── CacheSafeParams available? ───┐               │    │
│  │  │                                  │               │    │
│  │  ▼ YES                         NO ▼                 │    │
│  │  runForkedQuery()      BaseLlmClient.generateJson() │    │
│  │  (cache-aware)         (standalone fallback)        │    │
│  │                                                     │    │
│  │  ──── SUGGESTION_PROMPT ────                        │    │
│  │  ──── 12 filter rules ──────                        │    │
│  │  ──── getFilterReason() ────                        │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                     │
│                       ▼                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  FollowupController (framework-agnostic)            │    │
│  │  300ms delay → show as ghost text                   │    │
│  │                                                     │    │
│  │  Tab    → accept (fill input)                       │    │
│  │  Enter  → accept + submit                           │    │
│  │  Right  → accept (fill input)                       │    │
│  │  Type   → dismiss + abort speculation               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Telemetry (PromptSuggestionEvent)                  │    │
│  │  outcome, accept_method, timing, similarity,        │    │
│  │  keystroke, focus, suppression reason, prompt_id     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 제안 생성

### LLM 프롬프트

```
[SUGGESTION MODE: Suggest what the user might naturally type next.]

FIRST: Read the LAST FEW LINES of the assistant's most recent message — that's where
next-step hints, tips, and actionable suggestions usually appear. Then check the user's
recent messages and original request.

Your job is to predict what THEY would type - not what you think they should do.
THE TEST: Would they think "I was just about to type that"?

PRIORITY: If the assistant's last message contains a tip or hint like "Tip: type X to ..."
or "type X to ...", extract X as the suggestion. These are explicit next-step hints.

EXAMPLES:
Assistant says "Tip: type post comments to publish findings" → "post comments"
Assistant says "type /review to start" → "/review"
User asked "fix the bug and run tests", bug is fixed → "run the tests"
After code written → "try it out"
작업 complete, obvious follow-up → "commit this" or "push it"

Format: 2-12 words, match the user's style. Or nothing.
Reply with ONLY the suggestion, no quotes or explanation.
```

### 필터 규칙(12)

| 규칙              | 예시가 차단됨                         |
| --------------- | ------------------------------- |
| 완료              | "완료"                            |
| 메타\_텍스트         | "아무것도 찾을 수 없습니다", "제안 없음", "침묵" |
| 메타 래핑           | "(침묵)", "\[제안 없음]"              |
| 오류\_메시지         | "API 오류: 500"                   |
| 접두사\_라벨         | "제안: 커밋"                        |
| too\_few\_words | "흠"(그러나 "예", "커밋", "푸시" 등은 허용됨) |
| 너무\_많은\_단어      | > 12단어                          |
| 너무\_긴           | >= 100자                         |
| 여러 문장           | "테스트를 실행하고 커밋하세요."              |
| has\_formatting | 줄 바꿈, 굵은 마크다운                   |
| 평가적인            | "좋아 보인다", "고마워요"(\b 단어 경계 사용)   |
| ai\_voice       | "내가...", "내가...", "여기는..."      |

### 가드 조건

**AppContainer useEffect(코드에서 13개 검사):**

| 경비원          | 확인하다                                                |
| ------------ | --------------------------------------------------- |
| 설정 토글        | `enableFollowupSuggestions`                         |
| 비대화형         | `config.isInteractive()`                            |
| SDK 모드       | `!config.getSdkMode()`                              |
| 스트리밍 전환      | `Responding → Idle`(체크 2개)                          |
| API 오류(기록)   | `historyManager.history[last]?.type !== 'error'`    |
| API 오류(보류 중) | `!pendingGeminiHistoryItems.some(type === 'error')` |
| 확인 대화상자      | 쉘 + 일반 + 루프 감지(3개 검사)                               |
| 권한 대화상자      | `isPermissionsDialogOpen`                           |
| 이끌어 냄        | `settingInputRequests.length === 0`                 |
| 계획 모드        | `ApprovalMode.PLAN`                                 |

**generatePromptSuggestion() 내부:**

| 경비원   | 확인하다             |
| ----- | ---------------- |
| 초기 대화 | `modelTurns < 2` |

**별도의 기능 플래그(가드 블록에 없음):**

| 깃발                   | 통제 수단                                      |
| -------------------- | ------------------------------------------ |
| `enableCacheSharing` | generateJson에 분기된 쿼리를 사용할지 아니면 대체를 사용할지 여부 |
| `enableSpeculation`  | 제안 표시에 대한 추측 시작 여부                         |

## 상태 관리

### 후속 조치 상태

```typescript
interface FollowupState {
  suggestion: string | null;
  isVisible: boolean;
  shownAt: number; // timestamp for telemetry
}
```

### 후속 조치 컨트롤러

CLI(Ink) 및 WebUI(React)가 공유하는 프레임워크 독립적 컨트롤러:

* `setSuggestion(text)`— 300ms 지연된 쇼, null이 즉시 지워짐
* `accept(method)`— 상태를 지우고 화재가 발생합니다.`onAccept`마이크로태스크를 통해 100ms 디바운스 잠금
* `dismiss()`— 상태를 지우고 로그를 남깁니다.`ignored`원격 측정
* `clear()`— 모든 상태 + 타이머를 하드 리셋
* `Object.freeze(INITIAL_FOLLOWUP_STATE)`우발적인 돌연변이 방지

## 키보드 상호 작용

| 열쇠      | CLI           | 웹UI                          |
| ------- | ------------- | ---------------------------- |
| 꼬리표     | 입력 채우기(제출 없음) | 입력 채우기(제출 없음)                |
| 입력하다    | 작성 + 제출       | 채우기 + 제출(`explicitText`매개변수) |
| 오른쪽 화살표 | 입력 채우기(제출 없음) | 입력 채우기(제출 없음)                |
| 타자      | 추측 무시 + 중단    | 해고하다                         |
| 반죽      | 추측 무시 + 중단    | 해고하다                         |

### 키 바인딩 참고 사항

탭 핸들러는 다음을 사용합니다.`key.name === 'tab'`명시적으로(아님`ACCEPT_SUGGESTION`일치자) 왜냐하면`ACCEPT_SUGGESTION`SUBMIT 핸들러로 전달되어야 하는 Enter와도 일치합니다.

## 원격 측정

### 프롬프트제안이벤트

| 필드                           | 유형          | 설명                     |
| ---------------------------- | ----------- | ---------------------- |
| 결과                           | 승인됨/무시됨/억제됨 | 최종 결과                  |
| 프롬프트\_ID                     | 끈           | 기본값: 'user\_intent'    |
| accept\_method               | 탭/입력/오른쪽    | 사용자가 수락한 방법            |
| time\_to\_accept\_ms         | 숫자          | 표시부터 수락까지의 시간          |
| time\_to\_ignore\_ms         | 숫자          | 표시부터 해제까지의 시간          |
| time\_to\_first\_key스트로크\_ms | 숫자          | 표시된 동안 첫 번째 키 입력까지의 시간 |
| 제안\_길이                       | 숫자          | 문자수                    |
| 유사                           | 숫자          | 승인의 경우 1.0, 무시의 경우 0.0 |
| was\_focused\_when\_shown    | 부울          | 터미널에 포커스가 있음           |
| 이유                           | 끈           | 억제된 경우: 필터 규칙 이름       |

### 투기이벤트

| 필드                         | 유형       | 설명              |
| -------------------------- | -------- | --------------- |
| 결과                         | 수락/중단/실패 | 추측 결과           |
| 턴\_사용됨                     | 숫자       | API 왕복          |
| 파일\_작성                     | 숫자       | 오버레이의 파일        |
| 도구\_사용\_개수                 | 숫자       | 실행된 도구          |
| 지속 시간\_ms                  | 숫자       | 벽시계 시간          |
| 경계\_유형                     | 끈        | 추측을 멈춘 이유       |
| had\_pipelined\_suggestion | 부울       | 다음 제안이 생성되었습니다. |

## 기능 플래그 및 설정

| 환경                          | 유형 | 기본 | 설명                                                                |
| --------------------------- | -- | -- | ----------------------------------------------------------------- |
| `enableFollowupSuggestions` | 부울 | 진실 | 프롬프트 제안을 위한 마스터 토글                                                |
| `enableCacheSharing`        | 부울 | 진실 | 캐시 인식 분기 쿼리 사용                                                    |
| `enableSpeculation`         | 부울 | 거짓 | 예측 실행 엔진                                                          |
| `fastModel`(최상위)            | 끈  | "" | 모든 백그라운드 작업을 위한 모델입니다(비어 있음 = 기본 모델 사용). 다음을 통해 설정`/model --fast` |

### 내부 프롬프트 ID 필터링

백그라운드 작업에서는 전용 프롬프트 ID(`INTERNAL_PROMPT_IDS`\~에`utils/internalPromptIds.ts`) API 트래픽 및 도구 호출이 사용자에게 표시되는 UI에 표시되지 않도록 하려면 다음을 수행하세요.

| 프롬프트 ID             | 사용처         |
| ------------------- | ----------- |
| `prompt_suggestion` | 제안 생성       |
| `forked_query`      | 캐시 인식 분기 쿼리 |
| `speculation`       | 추측 엔진       |

**필터링 적용됨:**

* `loggingContentGenerator`— 건너뛰기`logApiRequest`내부 ID에 대한 OpenAI 상호 작용 로깅
* `logApiResponse` / `logApiError`— 건너뛰기`chatRecordingService.recordUiTelemetryEvent`
* `logToolCall`— 건너뛰기`chatRecordingService.recordUiTelemetryEvent`
* `uiTelemetryService.addEvent`—**필터링되지 않음**(보장`/stats`토큰 추적이 작동함)

### 사고 모드

사고/추론이 명시적으로 비활성화되었습니다(`thinkingConfig: { includeThoughts: false }`) 모든 백그라운드 작업 경로에 대해:

* **분기된 쿼리 경로**(`createForkedChat`) — 재정의`thinkingConfig`복제된 상태에서`generationConfig`, 제안 생성과 추측을 모두 포괄
* **BaseLlm 대체 경로**(`generateViaBaseLlm`) — 요청별 구성은 기본 콘텐츠 생성기의 사고 설정을 재정의합니다.

이는 다음과 같은 이유로 안전합니다.

* 캐시 접두사는 systemInstruction + 도구 + 기록에 의해 결정됩니다.`thinkingConfig`— 캐시 적중은 영향을 받지 않습니다.
* 모든 백엔드(Gemini, OpenAI 호환, Anthropic) 처리`includeThoughts: false`사고 필드를 생략함으로써 — 사고 지원이 없는 모델에서는 API 오류가 발생하지 않습니다.
* 제안 생성 및 추측은 추론 토큰의 이점을 얻지 못합니다.
