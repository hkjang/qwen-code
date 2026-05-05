# 포크 하위 에이전트 설계

> 상위의 전체 대화 컨텍스트를 상속하고 비용 효율적인 병렬 작업 실행을 위해 프롬프트 캐시를 공유하는 암시적 포크 하위 에이전트입니다.

## 개요

에이전트 도구가 호출되지 않은 경우`subagent_type`, 이는 암시적인**포크**— 상위 대화 기록, 시스템 프롬프트 및 도구 정의를 상속하는 백그라운드 하위 에이전트입니다. 포크는`CacheSafeParams`API 요청이 상위 요청과 동일한 접두사를 공유하도록 보장하여 DashScope 프롬프트 캐시 적중을 활성화합니다.

## 건축학

```
Parent conversation: [SystemPrompt | Tools | Msg1 | Msg2 | ... | MsgN (model)]
                              ↑ identical prefix for all forks ↑

Fork A: [...MsgN | placeholder results | "Research A"]  ← shared cache
Fork B: [...MsgN | placeholder results | "Modify B"]    ← shared cache
Fork C: [...MsgN | placeholder results | "Test C"]      ← shared cache
```

## 주요 구성 요소

### 1. FORK\_AGENT(`forkSubagent.ts`)

합성 에이전트 구성, 등록되지 않음`builtInAgents`. 대체 기능이 있음`systemPrompt`그러나 실제로는 다음을 통해 상위의 렌더링된 시스템 프롬프트를 사용합니다.`generationConfigOverride`.

### 2. CacheSafeParams 통합(`agent.ts`+`forkedQuery.ts`)

```
agent.ts (fork path)
  │
  ├── getCacheSafeParams()          ← parent's generationConfig snapshot
  │     ├── generationConfig        ← systemInstruction + tools + temp/topP
  │     └── history                 ← (not used — we build extraHistory instead)
  │
  ├── forkGenerationConfig          ← passed as generationConfigOverride
  └── forkToolsOverride             ← FunctionDeclaration[] extracted from tools
        │
        ▼
  AgentHeadless.execute(context, signal, {
    extraHistory,                   ← parent conversation history
    generationConfigOverride,       ← parent's exact systemInstruction + tools
    toolsOverride,                  ← parent's exact tool declarations
  })
        │
        ▼
  AgentCore.createChat(context, {
    extraHistory,
    generationConfigOverride,       ← bypasses buildChatSystemPrompt()
  })                                   AND skips getInitialChatHistory()
        │                              (extraHistory already has env context)
        ▼
  new GeminiChat(config, generationConfig, startHistory)
                          ↑ byte-identical to parent's config
```

### 3. 연혁 구축(`agent.ts`+`forkSubagent.ts`)

포크는`extraHistory`Gemini API의 사용자/모델 교체를 유지하려면 모델 메시지로 끝나야 합니다.`agent-headless`보낸다`task_prompt`.

세 가지 경우:

| 상위 기록은 다음으로 끝납니다. | extraHistory 건설                                                        | 작업\_프롬프트                       |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------ |
| `model`(함수 호출 없음) | `[...rawHistory]`(변하지 않은)                                              | `buildChildMessage(directive)` |
| `model`(함수 호출 포함) | `[...rawHistory, model(clone), user(responses+directive), model(ack)]` | `'Begin.'`                     |
| `user`(특이한)       | `rawHistory.slice(0, -1)`(후행 사용자 삭제)                                   | `buildChildMessage(directive)` |

### 4. 재귀 포크 방지(`forkSubagent.ts`)

`isInForkChild()`대화 기록을 검색합니다.`<fork-boilerplate>`꼬리표. 발견되면 오류 메시지와 함께 포크 시도가 거부됩니다.

### 5. 백그라운드 실행(`agent.ts`)

포크 용도`void executeSubagent()`(fire-and-forget) 및 반환`FORK_PLACEHOLDER_RESULT`즉시 부모에게. 백그라운드 작업의 오류가 포착되어 기록되고 표시 상태에 반영됩니다.

## 데이터 흐름

```
1. Model calls Agent tool (no subagent_type)
2. agent.ts: import forkSubagent.js
3. agent.ts: getCacheSafeParams() → forkGenerationConfig + forkToolsOverride
4. agent.ts: build extraHistory from parent's getHistory(true)
5. agent.ts: build fork작업Prompt (directive or 'Begin.')
6. agent.ts: createAgentHeadless(FORK_AGENT, ...)
7. agent.ts: void executeSubagent() — background
8. agent.ts: return FORK_PLACEHOLDER_RESULT to parent immediately
9. Background:
   a. AgentHeadless.execute(context, signal, {extraHistory, generationConfigOverride, toolsOverride})
   b. AgentCore.createChat() — uses parent's generationConfig (cache-shared)
   c. runReasoningLoop() — uses parent's tool declarations
   d. Fork executes tools, produces result
   e. updateDisplay() with final status
```

## 우아한 저하

만약에`getCacheSafeParams()`null을 반환하면(첫 번째 턴, 아직 기록이 없음) 포크는 다음으로 대체됩니다.

* `FORK_AGENT.systemPrompt`시스템 지시를 위해
* `prepareTools()`도구 선언용

이렇게 하면 캐시 공유 없이도 포크가 항상 작동합니다.

## 파일

| 파일                                                   | 역할                                                                          |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `packages/core/src/agents/runtime/forkSubagent.ts`   | FORK\_AGENT 구성, buildForkedMessages(), isInForkChild(), buildChildMessage() |
| `packages/core/src/tools/agent.ts`                   | 포크 경로: CacheSafeParams 검색, extraHistory 생성, 백그라운드 실행                        |
| `packages/core/src/agents/runtime/agent-headless.ts` | 실행() 옵션: GenerationConfigOverride, toolsOverride                            |
| `packages/core/src/agents/runtime/agent-core.ts`     | CreateChat옵션. GenerationConfigOverride                                      |
| `packages/core/src/followup/forkedQuery.ts`          | CacheSafeParams 인프라(기존, 변경 사항 없음)                                           |
