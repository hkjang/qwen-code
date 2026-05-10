# 세션 요약 디자인

> 사용자가
> 요청 시(`/recap`) 또는 그 이후
> 터미널이 5분 이상 흐릿해졌습니다.

## 개요

사용자가`/resume`며칠 후 이전 세션입니다. 다시 스크롤하여
기억해야 할 역사의 페이지**그들은 무엇을 하고 있었고 그 다음에 무슨 일이 일어났는가**실제 마찰 지점입니다. 메시지를 다시 로드하는 것만으로는 이 문제가 해결되지 않습니다.
UX 문제.

목표는 사용자가
반환:

- **상위 수준 작업**(그들이 무엇을 하고 있는지) →**다음 단계**(다음에 할 일).
- 실제 비서의 답변과 시각적으로 구별되므로 실수할 일이 없습니다.
  새로운 모델 출력을 위해.
- **최선의 노력**: 실패는 조용해야 하며 주요 흐름을 깨뜨리지 않아야 합니다.

## 트리거

| 방아쇠   | 정황                                                                                                | 구현                                                          |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **수동** | 사용자가 실행`/recap`                                                                               | `recapCommand.ts`동일한 기본 서비스를 호출합니다.             |
| **자동** | ≥ 5분 + 초점 반환 + 스트림 동안 터미널이 흐려짐(DECSET 1004 초점 프로토콜)은 다음과 같습니다.`Idle` | `useAwaySummary.ts`— 5분 블러 타이머 +`useFocus`이벤트 리스너 |

두 경로 모두 단일 기능으로 유입됩니다.`generateSessionRecap()`— \~에게
동일한 동작을 보장합니다. 자동 트리거는 다음에 의해 제어됩니다.`general.showSessionRecap`(기본값: 꺼짐 — 명시적 선택이므로 주변 환경에 맞게 설정됨
LLM 통화는 사용자의 청구서에 자동으로 추가되지 않습니다. 매뉴얼
명령은 해당 설정을 무시합니다.

## 건축학

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AppContainer.tsx                              │
│   isFocused = useFocus()                                               │
│   isIdle = streamingState === Idle                                     │
│       │                                                                │
│       ├─→ useAwaySummary({enabled, config, isFocused, isIdle,          │
│       │       │             addItem})                                  │
│       │       └─→ 5 min blur timer + idle/dedupe gates                 │
│       │              │                                                 │
│       │              ↓                                                 │
│       └─→ recapCommand (slash) ─→ generateSessionRecap(config, signal) │
│                                          │                             │
│                                          ↓                             │
│                              ┌─────────────────────────┐               │
│                              │ packages/core/services/ │               │
│                              │   sessionRecap.ts       │               │
│                              └─────────────────────────┘               │
│                                          │                             │
│                                          ↓                             │
│                              GeminiClient.generateContent              │
│                              (fastModel + tools:[])                    │
│                                                                        │
│   addItem({type: 'away_recap', text}) ─→ HistoryItemDisplay            │
│       └─ AwayRecapMessage rendered inline like any other history       │
│         item (※ + bold "recap: " + italic content, all dim);           │
│         scrolls naturally with the conversation. Mirrors Claude        │
│         Code's away_summary system message.                            │
└────────────────────────────────────────────────────────────────────────┘
```

### 파일

| 파일                                                         | 책임                                                                         |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `packages/core/src/services/sessionRecap.ts`                 | 원샷 LLM 통화 + 내역 필터 + 태그 추출                                        |
| `packages/cli/src/ui/hooks/useAwaySummary.ts`                | 자동 트리거 React 후크                                                       |
| `packages/cli/src/ui/commands/recapCommand.ts`               | `/recap`수동 진입점                                                          |
| `packages/cli/src/ui/components/messages/StatusMessages.tsx` | `AwayRecapMessage`렌더러(`※`+ 굵은 글씨`recap:`+ 기울임꼴 내용, 모두 희미함) |
| `packages/cli/src/ui/types.ts`                               | `HistoryItemAwayRecap`유형                                                   |
| `packages/cli/src/ui/components/HistoryItemDisplay.tsx`      | 파견`away_recap`렌더러에 대한 기록 항목                                      |
| `packages/cli/src/config/settingsSchema.ts`                  | `general.showSessionRecap`+`general.sessionRecapAwayThresholdMinutes`설정    |

## 프롬프트 디자인

### 시스템 프롬프트

`generationConfig.systemInstruction`주 에이전트의 시스템을 대체합니다.
이 단일 호출에 대한 프롬프트가 표시되므로 모델은 요약으로만 작동합니다.
코딩 보조자가 아닌 생성기입니다.

참고하세요`GeminiClient.generateContent()`내부적으로 프롬프트를 실행합니다.
통해`getCustomSystemPrompt()`, 사용자의 메모리를 추가합니다.
(QWEN.md / Managed Auto-Memory)를 접미사로 사용합니다. 최종 시스템 프롬프트는 다음과 같습니다.
그러므로`recap prompt + user memory`— 유용한 프로젝트 컨텍스트
요약이 아니라 누출입니다.

아래 글머리 기호는 다음과 1:1에 해당합니다.`RECAP_SYSTEM_PROMPT`:

- 40단어 이내, 일반 문장 1\~2개(마크다운/목록/제목 없음). 중국어의 경우 예산은 총 80자 정도입니다.
- 첫 번째 문장: 상위 수준 작업입니다. 그런 다음 구체적인 다음 단계입니다.
- 명시적으로 금지: 수행된 작업 나열, 도구 호출 암송, 상태 보고서.
- 대화의 주요 언어(영어 또는 중국어)를 일치시키세요.
- 출력 감싸기`<recap>...</recap>`; 태그 외부에는 아무것도 없습니다.

### 구조화된 출력 + 추출

모델은 답변을 다음으로 감싸도록 지시받습니다.`<recap>...</recap>`:

```
<recap>Refactoring loopDetectionService.ts to address long-session OOM. Next step is to implement option B.</recap>
```

이유: 일부 모델(GLM 제품군, 추론 모델)은 "생각"을 작성합니다.
최종 답변 앞 단락. 원시 텍스트를 반환하면 누출될 수 있습니다.
UI에 대한 추론입니다.

`extractRecap()`세 가지 대체 계층이 있습니다.

1. 두 태그 모두 존재: 그 사이에 있는 것을 가져옴`<recap>...</recap>`(우선의).
2. 열린 태그만(예:`maxOutputTokens`닫기 태그가 잘림):
   오픈 태그 뒤의 모든 것을 가져옵니다.
3. 태그가 완전히 누락됨: 빈 문자열 반환 → 서비스 반환`null`→ UI가 아무것도 렌더링하지 않습니다.

세 번째 계층은 "잘못된 내용을 표시하기보다는 건너뛰기"입니다.
모델의 추론 서문은 요약을 전혀 표시하지 않는 것보다 더 나쁩니다.

### 통화 매개변수

| 매개변수            | 값                             | 이유                                          |
| ------------------- | ------------------------------ | --------------------------------------------- |
| `model`             | `getFastModel() ?? getModel()` | 요약에는 프론티어 모델이 필요하지 않습니다.   |
| `tools`             | `[]`                           | 단일 쿼리, 도구 사용 없음                     |
| `maxOutputTokens`   | `300`                          | 1\~2개의 짧은 문장 + 태그를 위한 헤드룸       |
| `temperature`       | `0.3`                          | 대부분 결정론적이며 약간의 자연적 변동이 있음 |
| `systemInstruction` | 위의 요약 전용 프롬프트        | 주 상담원의 역할 정의를 대체합니다.           |

## 기록 필터링

`geminiClient.getChat().getHistory()`반환합니다`Content[]`그
다음이 포함됩니다:

- `user` / `model`문자 메시지
- `model` `functionCall`부분품
- `user` `functionResponse`부분(전체 파일 내용을 담을 수 있음)
- `model`생각하는 부분(`part.thought` / `part.thoughtSignature`,
  모델의 숨겨진 추론)

`filterToDialog()`만 유지`user` / `model`가지고 있는 부품**비어 있지 않은
텍스트는 생각이 아니다**. 두 가지 이유:

- **도구 호출/응답**: 싱글`functionResponse`10K+일 수 있음
  토큰. 그러한 메시지 30개는 LLM 요약을 관련 없는 내용으로 빠뜨릴 것입니다.
  세부 사항, 토큰 낭비와 요약을 다음으로 편향시키는 것 모두
  "Y 파일을 읽기 위해 X 도구 호출"과 같은 구현 소음.
- **생각하는 부분**: 모델의 내부 추론을 전달합니다. 포함
  그들은 숨겨진 생각의 사슬을 대화로 취급하고
  요약 텍스트에 표시됩니다.

빈 메시지를 삭제한 후,`takeRecentDialog`마지막 30개까지 슬라이스
메시지를 표시하고 매달린 모델/도구에서 슬라이스 시작을 거부합니다.
응답.

## 동시성과 엣지 케이스

### 자동 트리거 후크 상태 머신

`useAwaySummary`세 가지 참조를 유지합니다.

| 참조              | 의미                                               |
| ----------------- | -------------------------------------------------- |
| `blurredAtRef`    | 흐림 시작 시간(초점이 돌아올 때까지 지워지지 않음) |
| `recapPendingRef` | LLM 통화가 진행 중인지 여부                        |
| `inFlightRef`     | 현재 비행 중`AbortController`                      |

`useEffect`부서:`[enabled, config, isFocused, isIdle, addItem, thresholdMs]`.

| 이벤트                                               | 행동                                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `!enabled \|\| !config`                              | 기내통화 중단 + 삭제`inFlightRef`+ 클리어`blurredAtRef`                                                                             |
| `!isFocused`그리고`blurredAtRef === null`            | 세트`blurredAtRef = Date.now()`                                                                                                     |
| `isFocused`그리고`blurredAtRef === null`             | 조기 반환(처리할 블러 주기 없음 - 첫 번째 렌더링 또는 짧은 블러 재설정 직후)                                                        |
| `isFocused`흐림 지속 시간 < 5분                      | 분명한`blurredAtRef`, 다음 흐림 주기를 기다립니다.                                                                                  |
| `isFocused`흐림 ≥ 5분 및`recapPendingRef`            | 반환(중복 제거)                                                                                                                     |
| `isFocused`흐림 ≥ 5분 및`!isIdle`                    | **보존하다** `blurredAtRef`그리고 차례가 끝날 때까지 기다리세요(`isIdle`Dep에 있으므로 스트리밍이 완료되면 효과가 다시 실행됩니다.) |
| `isFocused`흐림 ≥ 5분 및`shouldFireRecap`거짓을 반환 | 분명한`blurredAtRef`및 복귀 — 마지막 요약 이후 대화가 충분히 이동하지 않았습니다(≥ 2개의 사용자 턴 필요, Claude Code 미러링).       |
| `isFocused`그리고 모든 조건이 충족되었습니다         | 분명한`blurredAtRef`, 세트`recapPendingRef = true`, 만들다`AbortController`, LLM 요청 보내기                                        |

그만큼`.then`콜백**다시 확인하다** `isIdleRef.current`: 사용자가
LLM이 실행되는 동안 새로운 차례를 시작했습니다. 늦게 도착한 요약입니다.
회전 중에 삽입되지 않도록 떨어뜨립니다.

그만큼`.finally`클리어하다`recapPendingRef`, 그리고 삭제`inFlightRef`만
만약에`inFlightRef.current === controller`(그래서 덮어쓰지 않습니다.
최신 컨트롤러).

잠시`useEffect`마운트 해제 시 기내 컨트롤러를 중단합니다.

### `/recap`게이팅

`CommandContext.ui.isIdleRef`현재 스트림 상태를 노출합니다.
(기존 미러링`btwAbortControllerRef`무늬). 에서
대화형 모드,`recapCommand`거절할 때`!isIdleRef.current`
**또는** `pendingItem !== null`. `pendingItem`혼자서는 부족하다
일반 모델 응답은 다음과 같이 실행되기 때문에`streamingState === Responding`그리고 널`pendingItem`.

## 구성 및 모델 선택

### 사용자용 손잡이

| 환경                                       | 기본          | 메모                                                                                            |
| ------------------------------------------ | ------------- | ----------------------------------------------------------------------------------------------- |
| `general.showSessionRecap`                 | `false`       | 자동 트리거만 가능합니다. 수동`/recap`이것을 무시합니다.                                        |
| `general.sessionRecapAwayThresholdMinutes` | `5`           | 초점 맞추기 시 자동 요약이 실행되기 전에 몇 분이 흐려집니다. Claude Code의 기본값과 일치합니다. |
| `fastModel`                                | 설정되지 않음 | 권장사항(예:`qwen3-coder-flash`) 빠르고 저렴한 요약을 위해.                                     |

### 모델 대체

`config.getFastModel() ?? config.getModel()`:

- 사용자는`fastModel`설정되었으며 현재 인증 유형에 유효합니다.
  → 사용`fastModel`.
- 그렇지 않으면 → 기본 세션 모델로 돌아갑니다(작동하지만 비용이 더 많이 듭니다)
  그리고 더 느립니다).

## 관찰 가능성

`createDebugLogger('SESSION_RECAP')`방출:

- 요약 경로에서 예외를 발견했습니다(`debugLogger.warn`).

모든 실패는**완전히 투명하다**사용자에게 — 요약은
보조 기능이며 UI에 절대로 포함되지 않습니다. 개발자는 다음을 수행할 수 있습니다.
는`[SESSION_RECAP]`디버그 로그 파일의 태그: 기본적으로 다음 위치에 기록됩니다.`~/.qwen/debug/<sessionId>.txt`(`latest.txt`현재에 대한 심볼릭 링크
세션); 다음을 통해 비활성화`QWEN_DEBUG_LOG_FILE=0`.

## 범위를 벗어남

| 목                                       | 왜 안 돼                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 진행 UI`/recap`(스피너 / 보류 중인 항목) | 3\~5초 정도는 견딜 수 있습니다. 복잡성을 추가합니다.                                                                                       |
| 자동화된 테스트                          | 서비스는 규모가 작으며(\~150줄) 먼저 수동으로 엔드투엔드 테스트를 거칩니다. 단위 테스트는 별도의 PR로 진행될 수 있습니다.                  |
| 현지화된 프롬프트                        | 시스템 프롬프트는 모델용입니다. 영어는 가장 신뢰할 수 있는 기반입니다. 모델은 대화에서 출력 언어를 선택합니다.                             |
| `QWEN_CODE_ENABLE_AWAY_SUMMARY`환경은    | Claude Code는 이를 사용하여 텔레메트리이 비활성화된 경우 기능을 유지합니다. Qwen Code의 현재 텔레메트리 모델에는 이것이 필요하지 않습니다. |
| 자동 요약 켜기`/resume`완성              | 자연스러운 후속 조치지만 훅 포인트가 필요함`useResumeCommand`; 이 PR의 범위를 벗어납니다.                                                  |
