# 추측 엔진 설계

> 쓰기 중 복사 파일 격리를 사용하여 사용자가 확인하기 전에 수락된 제안을 추론적으로 실행합니다. 사용자가 Tab을 누르면 결과가 즉시 나타납니다.

## 개요

프롬프트 제안이 표시되면**추측 엔진**즉시 포크된 GeminiChat을 사용하여 백그라운드에서 실행을 시작합니다. 파일 쓰기는 임시 오버레이 디렉터리로 이동합니다. 사용자가 제안을 수락하면 오버레이 파일이 실제 파일 시스템에 복사되고 추측된 대화가 기본 채팅 기록에 삽입됩니다. 사용자가 다른 것을 입력하면 추측이 중단되고 오버레이가 정리됩니다.

## 건축학

```
User sees suggestion "commit this"
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│  startSpeculation()                                          │
│                                                              │
│  ┌─────────────────┐    ┌────────────────────┐               │
│  │ Forked GeminiChat│    │  OverlayFs          │              │
│  │ (cache-shared)   │    │  /tmp/qwen-         │              │
│  │                  │    │   speculation/       │              │
│  │  systemInstruction│   │   {pid}/{id}/        │              │
│  │  + tools          │   │                      │              │
│  │  + history prefix │   │  COW: first write    │              │
│  │                  │    │  copies original     │              │
│  └────────┬─────────┘    └──────────┬───────────┘             │
│           │                         │                         │
│           ▼                         │                         │
│  ┌──────────────────────────────────┴──────────────────────┐  │
│  │  Speculative Loop (max 20 turns, 100 messages)          │  │
│  │                                                         │  │
│  │  Model response                                         │  │
│  │       │                                                 │  │
│  │       ▼                                                 │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  speculationToolGate                             │   │  │
│  │  │                                                  │   │  │
│  │  │  Read/Grep/Glob/LS/LSP → allow (+ overlay read) │   │  │
│  │  │  Edit/WriteFile → redirect to overlay            │   │  │
│  │  │    (only in auto-edit/yolo mode)                 │   │  │
│  │  │  Shell → AST check read-only? allow : boundary   │   │  │
│  │  │  WebFetch/WebSearch → boundary                   │   │  │
│  │  │  Agent/Skill/Memory/Ask → boundary               │   │  │
│  │  │  Unknown/MCP → boundary                          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │       │                                                 │  │
│  │       ▼                                                 │  │
│  │  Tool execution: toolRegistry.getTool → build → execute │  │
│  │  (bypasses CoreToolScheduler — gated by toolGate)       │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  On completion → generatePipelinedSuggestion()               │
└──────────────────────────────────────────────────────────────┘
           │
           │  User presses Tab / Enter
           ▼
     ┌─── status === 'completed'? ───┐
     │ YES                      NO (boundary) │
     ▼                                ▼
┌─────────────────────────┐  ┌────────────────────────┐
│  acceptSpeculation()    │  │  Discard speculation    │
│                         │  │  abort + cleanup        │
│  1. applyToReal()       │  │  Submit query normally  │
│  2. ensureToolPairing() │  │  (addMessage)           │
│  3. addHistory()        │  └────────────────────────┘
│  4. render tool_group   │
│  5. cleanup overlay     │
│  6. pipelined suggest   │
└─────────────────────────┘
           │
           │  User types instead
           ▼
┌──────────────────────────────────────────────────────────────┐
│  abortSpeculation()                                          │
│                                                              │
│  1. abortController.abort() — cancel LLM call               │
│  2. overlayFs.cleanup() — delete temp directory              │
│  3. Update speculation state (no telemetry on abort)         │
└──────────────────────────────────────────────────────────────┘
```

## 기록 중 복사 오버레이

```
Real CWD: /home/user/project/
Overlay:  /tmp/qwen-speculation/12345/a1b2c3d4/

Write to src/app.ts:
  1. Copy /home/user/project/src/app.ts → overlay/src/app.ts (first time only)
  2. Tool writes to overlay/src/app.ts

Read from src/app.ts:
  - If in writtenFiles → read from overlay/src/app.ts
  - Otherwise → read from /home/user/project/src/app.ts

New file (src/new.ts):
  - Create overlay/src/new.ts directly (no original to copy)

Accept:
  - copyFile(overlay/src/app.ts → /home/user/project/src/app.ts)
  - copyFile(overlay/src/new.ts → /home/user/project/src/new.ts)
  - rm -rf overlay/

Abort:
  - rm -rf overlay/
```

## 툴 게이트 보안

| 도구                                                        | 행동     | 상태                                            |
| ----------------------------------------------------------- | -------- | ----------------------------------------------- |
| read_file, grep, glob, ls, lsp                              | 허용하다 | 오버레이를 통해 확인된 읽기 경로                |
| 편집, 쓰기\_파일                                            | 리디렉션 | 자동 편집/Yolo 승인 모드에서만                  |
| 편집, 쓰기\_파일                                            | 경계     | 기본/계획 승인 모드                             |
| 껍데기                                                      | 허용하다 | `isShellCommandReadOnlyAST()`true를 반환합니다. |
| 껍데기                                                      | 경계     | 읽기 전용이 아닌 명령                           |
| 웹\_페치, 웹\_검색                                          | 경계     | 네트워크 요청에는 사용자 동의가 필요합니다.     |
| 에이전트, 스킬, 메모리, Ask_user, todo_write,exit_plan_mode | 경계     | 추측 중에는 사용자와 상호작용할 수 없습니다.    |
| 알 수 없음/MCP 도구                                         | 경계     | 안전한 기본값                                   |

### 경로 재작성

- **쓰기 도구**:`rewritePathArgs()`리디렉션`file_path`다음을 통해 오버레이`overlayFs.redirectWrite()`
- **도구 읽기**:`resolveReadPaths()`리디렉션`file_path`다음을 통해 오버레이`overlayFs.resolveReadPath()`이전에 작성했다면
- **다시 쓰기 실패**: 경계로 처리됨(예: cwd 외부의 절대 경로가 포함됨)`redirectWrite`)

## 경계 처리

턴 도중에 경계에 부딪힐 때:

1. 이미 실행된 도구 호출이 유지됩니다(이름 기반이 아닌 인덱스 기반 추적).
2. 실행되지 않은 함수 호출은 모델 메시지에서 제거됩니다.
3. 부분적인 도구 응답이 기록에 추가됩니다.
4. `ensureToolResultPairing()`주입 전 완전성을 검증합니다.

## 파이프라인 제안

추측이 완료된 후(경계 없음) 두 번째 LLM 호출이**다음**제안:

```
Context: original conversation + "commit this" + speculated messages
→ LLM predicts: "push it"
→ Stored in state.pipelinedSuggestion
→ On accept: setPromptSuggestion("push it") — appears instantly
```

이를 통해 각 수락이 즉시 다음 단계를 표시하는 탭-탭-탭 워크플로가 가능해집니다.

파이프라인 제안은 내보낸 제안을 재사용합니다.`SUGGESTION_PROMPT`에서 상수`suggestionGenerator.ts`(로컬 복사본이 아님) 초기 제안과 일관된 품질을 보장합니다.

## 빠른 모델

`startSpeculation`선택 사항을 받아들입니다`options.model`매개변수, 스레드 통과`runSpeculativeLoop`그리고`generatePipelinedSuggestion`에게`runForkedQuery`. 최상위 수준을 통해 구성됨`fastModel`설정(비어 있음 = 메인 모델 사용). 같은`fastModel`제안 생성, 추측, 파이프라인 제안 등 모든 백그라운드 작업에 사용됩니다. 다음을 통해 설정`/model --fast <name>`또는`settings.json`.

## UI 렌더링

추측이 완료되면,`acceptSpeculation`다음을 통해 결과를 렌더링합니다.`historyManager.addItem()`:

- **사용자 메시지**: 다음과 같이 렌더링됨`type: 'user'`아이템
- **입체 문자**: 다음과 같이 렌더링됨`type: 'gemini'`아이템
- **도구 호출**: 다음과 같이 렌더링됨`type: 'tool_group'`구조화된 아이템`IndividualToolCallDisplay`항목(도구 이름, 인수 설명, 결과 텍스트, 상태)

이는 단순한 텍스트가 아닌 도구 호출 세부 정보를 포함한 전체 추측 결과를 사용자에게 보여줍니다.

## 분기 쿼리(캐시 공유)

### CacheSafeParams

```typescript
interface CacheSafeParams {
  generationConfig: GenerateContentConfig; // systemInstruction + tools
  history: Content[]; // curated, max 40 entries
  model: string;
  version: number; // increments on config changes
}
```

- 메인 턴이 성공할 때마다 저장됨`GeminiClient.sendMessageStream()`
- 다음 날짜에 지워짐`startChat()` / `resetChat()`세션 간 유출을 방지하기 위해
- 기록이 40개 항목으로 잘렸습니다.`createForkedChat`얕은 복사본을 사용합니다(매개변수는 이미 심층 복제된 스냅샷입니다).
- 사고 모드가 명시적으로 비활성화되었습니다(`thinkingConfig: { includeThoughts: false }`) — 추론 토큰은 추측에 필요하지 않으며 비용/레이턴시을 낭비합니다. 이는 캐시 접두사 일치에 영향을 미치지 않습니다(systemInstruction + 도구 + 기록으로만 결정됨).
- 버전 감지를 통해`JSON.stringify`시스템명령 + 도구 비교

### 캐시 메커니즘

DashScope는 이미 다음을 통해 접두사 캐싱을 활성화합니다.

- `X-DashScope-CacheControl: enable`헤더
- `cache_control: { type: 'ephemeral' }`메시지 및 도구에 대한 주석

갈래`GeminiChat`동일하게 사용`generationConfig`(도구 포함) 및 기록 접두사를 사용하므로 DashScope의 기존 캐시 메커니즘은 자동으로 캐시 적중을 생성합니다.

## 상수

| 끊임없는                 | 값  | 설명                               |
| ------------------------ | --- | ---------------------------------- |
| MAX_SPECULATION_TURNS    | 20  | 최대 API 왕복                      |
| MAX_SPECULATION_MESSAGES | 100 | 추측된 기록의 최대 메시지 수       |
| SUGGESTION_DELAY_MS      | 300 | 제안 표시 전 지연                  |
| ACCEPT_DEBOUNCE_MS       | 100 | 신속한 승인을 위한 디바운스 잠금   |
| MAX_HISTORY_FOR_CACHE    | 40  | CacheSafeParams에 저장된 기록 항목 |

## 파일 구조

```
packages/core/src/followup/
├── followupState.ts          # Framework-agnostic state controller
├── suggestionGenerator.ts    # LLM-based suggestion generation + 12 filter rules
├── forkedQuery.ts            # Cache-aware forked query infrastructure
├── overlayFs.ts              # Copy-on-write overlay filesystem
├── speculationToolGate.ts    # Tool boundary enforcement
├── speculation.ts            # Speculation engine (start/accept/abort)
└── index.ts                  # Module exports
```
