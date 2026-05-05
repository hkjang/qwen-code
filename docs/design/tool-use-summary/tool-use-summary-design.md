# 도구 사용 요약 디자인

> 병렬 도구 배치를 위한 빠른 모델 레이블 — 동기 부여, Claude Code를 사용한 경쟁 분석, 아키텍처 및 현재 전체 모드 렌더링을 주도한 추가 전용 정적 근거.
>
> 사용자 문서:[도구 사용 요약](../../users/features/tool-use-summaries.md).

## 1. 요약

각 도구 배치가 완료된 후 Qwen Code는 배치를 요약하는 git-commit-subject-style 레이블을 반환하는 짧은 빠른 모델 호출을 실행합니다. 레이블이 인라인 희미하게 표시됩니다.`● <label>`전체 모드의 라인을 대체하고 일반 모드를 대체합니다.`Tool × N`컴팩트 모드의 헤더. 세대는 다음 차례의 API 스트림과 병렬로 실행되므로 최대 1초의 대기 시간이 메인 모델 스트리밍 뒤에 숨겨져 있습니다.

| 차원         | 클로드 코드                                             | 퀀 코드                                                              |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| 트리거 포인트    | `query.ts`— 도구 배치가 완료된 후                           | `useGeminiStream.ts`→`handleCompletedTools`— 동일한 수명주기 지점          |
| 세대 모델      | 하이쿠 결점`queryHaiku`                                 | 구성됨`fastModel`\~을 통해`GeminiClient.generateContent`                |
| 하위 에이전트 동작 | `!toolUseContext.agentId`— 메인 세션만                  | 암시적 - 하위 에이전트가 실행됩니다.`agents/runtime/`, 아니다`useGeminiStream`      |
| 스케줄링       | Fire-and-forget, 다음 턴의 스트림이 방출되기 직전에 대기            | Fire-and-forget, 해결 시 기록에 추가됨                                     |
| 출력 형태      | `ToolUseSummaryMessage`SDK 스트림으로 생성됨               | `HistoryItemToolUseSummary`UI 기록에 추가 + 향후 SDK 사용을 위해 공장 내보내기      |
| 문          | `CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES`환경, 기본값**끄다** | `experimental.emitToolUseSummaries`설정(기본&#xAC12;**\~에**) + 환경 재정의 |
| 1차 소비자     | 모바일/SDK 클라이언트                                      | CLI 컴팩트 모드 + 전체 모드, 향후 SDK                                        |
| 즉각적인       | Git-commit-subject, 과거형, 가장 구별되는 명사(verbatim port) | 동일한 시스템 프롬프트                                                      |
| 입력 잘림      | 도구 필드당 300자`truncateJson`                          | 동일한                                                               |
| 인텐트 접두사    | 어시스턴트 마지막 메시지의 처음 200자                             | 동일한                                                               |
| 프롬프트 캐싱    | `enablePromptCaching: true`하이쿠 통화 중                | 아직 연결되지 않음(분기된 에이전트 경로 사용 가능, 향후 최적화로 플래그 지정됨)                    |
| 라벨 후처리     | 원시 모델 텍스트                                          | `cleanSummary`(마크다운, 따옴표, 오류 접두사 제거, 최대 100자, ReDoS 제한)           |
| 세션 지속성     | 스트림 전용; 각 세션이 재생성됩니다.                              | UI 기록만;`ChatRecordingService`지속되지 않는다`tool_use_summary`항목         |

## 2. 클로드 코드 구현 분석

### 2.1 흐름

Claude Code는 다음에서 도구 루프를 실행합니다.`query.ts`. 도구 배치가 실행되고 그 결과가 정규화된 후 생성기 함수는 Haiku 호출을 분기하고 보류 중인 약속을 유지합니다.`nextPendingToolUseSummary`, 다음 차례의 API 호출을 계속합니다. Haiku 지연 시간(\~1초)은 기본 모델의 스트리밍(5\~30초)과 겹치므로 사용자에게는 추가된 지연 시간이 전혀 표시되지 않습니다. 다음 턴의 콘텐츠를 방출하기 직전에 생성기는 보류 중인 요약을 기다리고 다음을 생성합니다.`tool_use_summary`스트림에 메시지를 보냅니다.

```
tool_batch_complete → fork queryHaiku (fire-and-forget)
                          ↓
               next_turn_stream_starts
                          ↓
       ← summary Promise resolves during streaming →
                          ↓
       await pendingToolUseSummary → yield ToolUseSummaryMessage
                          ↓
                continue with next turn
```

### 2.2 주요 소스 파일

| 요소      | 파일                                                         | 핵심 논리                                                                                   |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 발전기     | `services/toolUseSummary/toolUseSummaryGenerator.ts:45-97` | `generateToolUseSummary({ tools, signal, isNonInteractiveSession, lastAssistantText })` |
| 방아쇠     | `query.ts:1411-1482`                                       | 가드`emitToolUseSummaries`게이트 + 하위 에이전트 없음; 포크 하이쿠; 약속을 지키다                               |
| 대기 + 방출 | `query.ts:1055-1060`                                       | 기다리다`pendingToolUseSummary`다음 회전 경계에서 양보 메시지                                            |
| 메시지 팩토리 | `utils/messages.ts:5105-5116`                              | `createToolUseSummaryMessage(summary, precedingToolUseIds)`                             |
| 기능 게이트  | `query/config.ts:23,36-38`                                 | `emitToolUseSummaries: isEnvTruthy(CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES)`                |

### 2.3 디자인 결정

1. **컴팩트/디테일 상태와 상관없이 항상 게이트가 켜져 있을 때 생성됩니다.**&#xC694;약은 스트림 수준 아티팩트입니다. UI는 렌더링 여부를 결정합니다.
2. **최고 수준의 메시지 유형으로 내보냅니다.** `tool_use_summary`나란히 앉다`user`,`assistant`,`tool_result`SDK 스트림에서`precedingToolUseIds`소비자가 배치와 상관 관계를 맺을 수 있는 필드입니다.
3. **하위 에이전트는 제외됩니다.** `!toolUseContext.agentId`— 하위 에이전트 출력이 업스트림으로 집계됩니다. 개별 하위 에이전트 배치는 기본 UI에 표시되지 않는 시끄러운 레이블을 생성합니다.
4. **기본값은 꺼져 있습니다.**&#x65;nv 전용 게이트는 다운스트림 SDK 소비자가 선택하지 않는 한 비용을 0으로 유지합니다. CC 터미널 자체는 메시지를 렌더링하지 않습니다.
5. **필드당 300자 단위로 입력이 잘립니다.**&#xB77C;벨에 대한 충분한 신호를 유지하면서 지배적인 비용 위험(단일 대형 도구로 인해 메시지가 표시될 수 있음)을 커버합니다.

## 3. Qwen 코드 구현

### 3.1 흐름

Qwen 코드는 동일한 수명 주기 지점(`useGeminiStream.handleCompletedTools`) 그러나 양쪽에서 렌더링됩니다.`ui.compactMode`따라서 이 기능은 SDK 배관 없이 CLI 사용자에게 유용합니다.

```
tool_batch_complete (handleCompletedTools)
           ↓
  config.getEmitToolUseSummaries()?
           ↓
   fork generateToolUseSummary (fire-and-forget)
           ↓
  submitQuery() for next turn (streaming starts)
           ↓
   ← summary Promise resolves during streaming →
           ↓
  addItem({type:'tool_use_summary', summary, precedingToolUseIds})
           ↓
  HistoryItemDisplay renders:
    compactMode=false → ● <label> standalone line
    compactMode=true  → hidden; MainContent lookup injects into CompactToolGroupDisplay header
```

### 3.2 주요 소스 파일

| 요소        | 파일                                                                    | 핵심 논리                                                           |
| --------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| 서비스       | `packages/core/src/services/toolUseSummary.ts`                        | `generateToolUseSummary`,`truncateJson`,`cleanSummary`, 메시지 팩토리 |
| 구성 게이트    | `packages/core/src/config/config.ts:getEmitToolUseSummaries`          | 환경 재정의 → 설정 → 기본값(true)                                         |
| 방아쇠       | `packages/cli/src/ui/hooks/useGeminiStream.ts:handleCompletedTools`   | 빠른 모델 호출을 실행하고 해결 시 addItem을 실행합니다.                             |
| 풀 모드 렌더링  | `packages/cli/src/ui/components/HistoryItemDisplay.tsx`               | 렌더`● <label>`언제 줄`!compactMode`                                 |
| 컴팩트 모드 조회 | `packages/cli/src/ui/components/MainContent.tsx`                      | `summaryByCallId`지도 →`compactLabel`각 tool\_group에 대한 소품         |
| 컴팩트 헤더    | `packages/cli/src/ui/components/messages/CompactToolGroupDisplay.tsx` | 기본값을 대체합니다.`Tool × N`\~와 함께`<Summary> · N tools`라벨이 있을 때        |
| 병합 처리     | `packages/cli/src/ui/utils/mergeCompactToolGroups.ts`                 | 간식`tool_use_summary`인접성을 위해 콤팩트하게 숨겨져 있음                        |
| UI 유형     | `packages/cli/src/ui/types.ts:HistoryItemToolUseSummary`              | `{ type: 'tool_use_summary', summary, precedingToolUseIds }`    |

### 3.3`<Static>`추가 전용 제약조건

이 PR의 핵심 아키텍처 결정은 다음과 같습니다.**전체 모드 레이블이 도구 그룹 자체의 장식이 아닌 독립형 기록 항목인 이유**.

Qwen Code는 Ink를 통해 성적표를 렌더링합니다.`<Static>`. 정적은 추가 전용입니다. 항목이 터미널 버퍼에 커밋되면 잉크는 다음을 제외하고 해당 영역을 다시 칠하지 않습니다.`refreshStatic()`전체 기록을 지우고 다시 렌더링하도록 호출됩니다. 이는 CLI가 의존하는 성능 모델입니다. 정적 항목은 키를 누를 때마다 다시 렌더링되지 않습니다.

이제 빠른 모델 호출의 타이밍을 고려하십시오.

```
T0   tool batch completes, tool_group is pushed to history
T0+ε tool_group renders through <Static> and is committed to the buffer
T0+1s fast-model call resolves with a label
```

T0+1에서는 이미 커밋된 tool\_group에 라벨을 소급하여 추가할 수 없습니다. 두 가지 옵션이 있습니다:

1. **tool\_group의 props + 호출 업데이트`refreshStatic()`.**&#xC791;동하지만 모든 배치에서 전체 기록 다시 그리기가 발생합니다. 이는 앱에서 가장 비용이 많이 드는 UI 작업 중 하나입니다. 보이는 플래시. 화장품 라벨에는 허용되지 않습니다.
2. **추가된 새로운 기록 항목으로 요약을 렌더링합니다.*\~ 후에*도구 그룹.**&#x53;tatic은 이를 기본적으로 처리합니다. 새 항목은 다시 칠하지 않고 깔끔하게 추가됩니다.

이 PR은 전체 모드에서 옵션 2를 사용합니다. 그만큼`tool_use_summary`항목은 단일 희미하게 렌더링된 실제 기록 항목입니다.`● <label>`줄을 서다`HistoryItemDisplay`. 아니요`refreshStatic`필요합니다.

컴팩트 모드는 다음과 같은 이유로 다릅니다.`mergeCompactToolGroups`. 연속공구일 때*그룹 병합,`MainContent`이미 전화해`refreshStatic()`— 이는 기존 코드 경로이며, 기록에서 조회한 레이블을 사용하여 병합된 그룹을 다시 렌더링합니다. 그래서 컴팩트 모드는 \_그렇습니다*헤더 교체로 레이블을 가져옵니다. 동일한 레이블을 두 번 렌더링하지 않으려면(한 번은 압축 헤더로, 한 번은 후행 헤더로)`● <label>`선),`HistoryItemDisplay`다음과 같은 경우 독립형 라인을 숨깁니다.`compactMode`사실이다.

```
Full mode              Compact mode (with merge)
───────────            ─────────────────────────
[tool_group]           [merged tool_group — header replaced via lookup]
● <label>              (● <label> line is hidden)
```

### 3.4 게이트 의미론

우선 순위에 따라 해결되는 3개의 레이어:

1. `QWEN_CODE_EMIT_TOOL_USE_SUMMARIES=0|1|true|false`— 환경 재정의, 우선순위가 가장 높습니다.
2. `experimental.emitToolUseSummaries`\~에`settings.json`- 기본`true`.
3. 암시적 건너뛰기 — if`config.getFastModel()`보고`undefined`, 게이트에 관계없이 생성을 건너뜁니다. 오류가 없으며 사용자가 볼 수 있는 변경 사항이 없습니다.

### 3.5 출력 청소

`cleanSummary`기록에 추가되기 전에 모든 모델 응답에서 실행됩니다.

1. 첫 번째 줄만 선택합니다(모델 추론 서문 삭제).
2. 글머리 기호 접두어 제거(`-`,`*`,`•`) — 모델은 때때로 라벨을 목록 항목으로 반환합니다.
3. 경계를 통해 주변 따옴표/백틱 제거`{1,10}`정규식(CodeQL 안전; 실제 레이블에는 소수의 래핑 따옴표 이상이 없습니다).
4. 스트립 접두사 레이블(`Label:`,`Summary:`,`Result:`,`Output:`) 일부 모델이 앞에 추가됩니다.
5. 오류 메시지 모양 거부(`API error: ...`,`Error: ...`,`I cannot ...`,`I can't ...`,`Unable to ...`) - 빈 문자열을 반환하므로 기록 항목이 추가되지 않습니다.
6. 하드캡 길이는 100자입니다(모바일 UI는 약 30자에서 잘립니다. 여유 부분은 CJK 구문을 포함합니다).

### 3.6 원격 측정

요약 생성 호출 세트`promptId: 'tool_use_summary_generation'`따라서 토큰 사용량은 별도로 계산됩니다.`/stats`. 이를 통해 사용자는 프롬프트 제안이나 기본 세션 사용량과 혼동하지 않고도 기능의 정확한 증분 비용을 확인할 수 있습니다.

## 4. 클로드 코드의 편차(그리고 그 이유)

| 편차                                             | 왜                                                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 환경 게이트 외에 설정 레이어                               | Qwen Code는 CLI에서 라벨을 렌더링합니다. 사용자에게는 셸별 환경 내보내기가 아닌 영구 스위치가 필요합니다.                                                    |
| 기&#xBCF8;**\~에**끄는 대신                          | 라벨은 두 디스플레이 모드 모두에서 즉시 사용자에게 표시됩니다. 사용자 구성`fastModel`이미 빠른 모델 기능을 선택하고 있습니다.                                         |
| 헌신적인`cleanSummary`후처리                          | Qwen Code는 CC보다 더 많은 이기종 공급자를 지원합니다. 일부 모델은 앞에 추가`Label:`또는 따옴표로 묶으십시오. 경계에서 정규화하면 UI의 일관성이 유지됩니다.                   |
| 백화점`HistoryItemToolUseSummary`스트림 메시지를 내보내는 대신 | CLI 우선 구현; SDK 스트림 경로는 향후 PR입니다. 그만큼`ToolUseSummaryMessage`해당 작업을 위해 공장이 이미 수출되었습니다.                                 |
| 프롬프트 캐싱이 아직 연결되지 않았습니다.                        | 별도의 모델을 구성하지 않은 사용자의 경우 빠른 모델이 기본 모델과 동일한 경우가 많습니다. 캐시 공유를 추가하려면 다음을 통한 라우팅이 필요합니다.`forkedAgent.ts`; 후속 조치로 추적되었습니다. |
| 듀얼 렌더 경로(풀 모드 인라인 + 컴팩트 모드 헤더)                 | Qwen Code의 기본값은`ui.compactMode: false`; 인라인 전체 모드 렌더링이 없으면 대부분의 사용자에게 이 기능이 표시되지 않습니다.                               |

## 5. 알려진 제한사항

* **세션 지속성이 없습니다.** `tool_use_summary`채팅 녹음 JSONL에 기록되지 않습니다. 세션을 재개하면 라벨이 손실됩니다. 도구 그룹은 대체 헤더로 일반 헤더를 사용하여 렌더링됩니다. 낮은 우선순위: 사용자가 세션을 계속하면 레이블이 자연스럽게 재생성됩니다.
* **아직 SDK 스트림 방출이 없습니다.**&#xBA54;시지 팩토리를 내보냈지만 CLI가 아직 피드하지 않습니다.`tool_use_summary`SDK 브리지로 들어갑니다. 후속홍보.
* **즉각적인 캐싱이 없습니다.**&#xAC01; 배치에는 새로운 입력 토큰 비용이 발생합니다. 절대적 측면에서는 무시할 수 있지만(토큰 최대 300개) 턴당 수십 개의 배치를 실행하면 측정 가능합니다.
* **병합된 압축 그룹에 대한 요약은 첫 번째 기여 배치의 레이블을 선택합니다.**&#xC0AC;용자가 10개의 서로 다른 배치를 연속적으로 실행하는 경우(일반적이지 않은 긴밀한 루프) 병합된 압축 헤더에는 선행 배치의 의도만 표시됩니다. 절충안 허용: 병합된 보기에서 배치별 레이블을 펼치는 것은 첫 번째를 취하는 것보다 시각적으로 더 복잡합니다.
* **빠른 모델이 필요합니다.**&#xAD6C;성하지 않고`fastModel`, 생성을 건너뜁니다. 비용 프로필을 제한하기 위해 기본 모델로 돌아가는 것은 의도적으로 허용되지 않습니다.

## 6. 향후 작업

1. 철사`ToolUseSummaryMessage`기존 공장이 다운스트림으로 사용되도록 SDK 브리지에 추가합니다.
2. 경로 생성을 통해`forkedAgent.ts`\~와 함께`enablePromptCaching`따라서 반복되는 도구 이름 접두사는 공급자 캐시에 도달합니다.
3. 선택사항: 지속`tool_use_summary`항목`ChatRecordingService`세션 재개 시 다시 재생합니다.
4. 선택사항: 도구 이름별 라벨 단축키(예: 항상`Read <filename>`싱글을 위해`read_file`호출)을 LLM 이전 빠른 경로로 사용합니다.
