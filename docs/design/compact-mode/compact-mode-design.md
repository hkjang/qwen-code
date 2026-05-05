# 컴팩트 모드 설계: 경쟁 분석 및 최적화

> Ctrl+O 컴팩트/상세 모드 전환 — Claude Code와의 경쟁 분석, 현재 구현 검토 및 최적화 권장 사항.
>
> 사용자 문서:[설정 — ui.compactMode](../../users/configuration/settings.md).

## 1. 요약 (Executive Summary)

Qwen Code와 Claude Code 모두 Ctrl+O 단축키를 제공하여 도구 출력 화면을 컴팩트 뷰와 상세 뷰 사이에서 전환할 수 있도록 합니다. 하지만**설계 철학, 기본 상태, 그리고 상호작용 모델은 근본적으로 다릅니다**. 이 문서는 소스 레벨의 심층적인 비교를 제공하고, UX의 차이점을 파악하며, Qwen Code를 위한 최적화 방안을 제안합니다.

| 분류        | 클로드 코드                         | 퀀 코드                                  |
| --------- | ------------------------------ | ------------------------------------- |
| 기본 모드     | 컴팩트 (verbose=false)            | 상세 (compactMode=false)                |
| 전환 의미     | 세부 정보를 임시로 엿보기                 | 지속적인 설정 변경                            |
| 지속성       | 세션 전용, 재시작 시 초기화               | `settings.json`에 영구 저장됨               |
| 범위        | 화면 전체 전환 (prompt ↔ transcript) | 컴포넌트별 렌더링 전환                          |
| 스냅샷 동결    | 없음 (개념 없음)                     | 없음 (제거됨)                              |
| 도구별 확장 힌트 | 있음 ("ctrl+o to expand")        | 있음 ("전체 도구 출력을 표시하려면 Ctrl+O를 누르십시오.") |

## 2. Claude Code 구현 분석

### 2.1 아키텍처

Claude Code는 컴포넌트 수준의 렌더링 토글이 아닌**화면 기반(screen-based)**&#xC811;근 방식을 사용합니다:

```
┌──────────────────────────────────┐
│         AppState (Zustand)       │
│  verbose: boolean (기본값: false) │
│  screen: 'prompt' | 'transcript' │
└──────────┬───────────────────────┘
           │
     ┌─────┴──────┐
     │  Ctrl+O    │  화면 모드 전환
     │  핸들러     │  렌더링 플래그가 아님
     └─────┬──────┘
           │
     ┌─────▼──────────────┐
     │    REPL.tsx        │
     │  screen='prompt'   → 컴팩트 뷰 (기본)
     │  screen='transcript'→ 상세 뷰
     └────────────────────┘
```

### 2.2 주요 소스 파일

| 컴포넌트   | 파일                                                 | 주요 로직                                     |
| ------ | -------------------------------------------------- | ----------------------------------------- |
| 토글 핸들러 | `src/hooks/useGlobalKeybindings.tsx:90-132`        | `screen`을`'prompt'`와`'transcript'`사이에서 전환 |
| 단축키    | `src/keybindings/defaultBindings.ts:44`            | `app:toggleTranscript`                    |
| 상태 정의  | `src/state/AppStateStore.ts:472`                   | `verbose: false`(세션 전용)                   |
| 확장 힌트  | `src/components/CtrlOToExpand.tsx:29-46`           | 개별 도구에 대한 "(ctrl+o to expand)" 텍스트        |
| 메시지 필터 | `src/components/Messages.tsx:93-151`               | 컴팩트 뷰를 위한`filterForBriefTool()`           |
| 권한     | `src/components/permissions/PermissionRequest.tsx` | 오버레이 레이어에서 렌더링되며 절대 숨겨지지 않음               |

### 2.3 설계 결정

1. **기본값은 컴팩트입니다.**&#xC0AC;용자는 처음부터 깔끔하고 미니멀한 인터페이스를 보게 됩니다. 상세 정보는 선택 사항입니다.
2. **세션 범위 (Session-scoped).**&#xC0C8;로운 세션마다`verbose`는`false`로 재설정됩니다. Claude Code는 사용자가 일반적으로 컴팩트 뷰를 선호하며 일시적으로만 세부 정보가 필요하다고 가정합니다.
3. **화면 수준 전환 (Screen-level toggle).**&#x43;trl+O는 컴포넌트 렌더링 방식을 변경하지 않습니다. 전체 화면을 "prompt" 화면(컴팩트)과 "transcript" 화면(상세) 사이에서 전환합니다.
4. **스냅샷 동결 없음.**&#xC2A4;냅샷을 고정하는 개념이 없습니다. 전환 시 현재 상태의 화면이 즉시 업데이트되어 표시됩니다.
5. **권한 대화 상자는 분리되어 있습니다.**&#xB3C4;구 승인 화면은 상세/컴팩트 전환에 영향을 받지 않는 별도의 오버레이 레이어에서 렌더링됩니다.
6. **도구별 힌트.**&#xB3C4;구가 긴 출력을 생성할 때`CtrlOToExpand`컴포넌트가 해당 도구에 상황별 힌트를 표시하며, 하위 에이전트에서는 억제됩니다.

### 2.4 사용자 흐름

```
세션 시작 → 컴팩트 모드 (기본)
     │
     ├─ 도구 출력이 한 줄로 요약됨
     ├─ 긴 도구 출력에는 "(ctrl+o to expand)" 힌트 표시
     │
     ├─ 사용자가 Ctrl+O 누름
     │     └─→ 화면이 transcript (상세 뷰)로 전환됨
     │         └─ 사용자는 모든 도구 출력, 사고 과정 등을 볼 수 있음
     │
     ├─ 사용자가 다시 Ctrl+O 누름
     │     └─→ 화면이 prompt (컴팩트)로 전환됨
     │
     └─ 세션 종료 → verbose는 false로 리셋
```

## 3. Qwen Code 구현 분석

### 3.1 아키텍처

Qwen Code는 각 UI 컴포넌트가 컨텍스트에서 읽어오는**컴포넌트 수준 렌더링 플래그**를 사용합니다:

```
┌─────────────────────────────────────┐
│      CompactModeContext             │
│  compactMode: boolean (기본값: false)│
│  setCompactMode: (v) => void        │
└──────────┬──────────────────────────┘
           │
     ┌─────┴──────┐
     │  Ctrl+O    │  compactMode 전환
     │  핸들러     │  설정에 영구 저장
     └─────┬──────┘
           │
     ┌─────▼──────────────────┐
     │  각 컴포넌트가         │
     │  compactMode를 읽고    │
     │  어떻게 렌더링할지 결정│
     └────────────────────────┘
           │
     ┌─────▼──────────────────────────────┐
     │  ToolGroupMessage                  │
     │    showCompact = compactMode       │
     │      && !hasConfirmingTool         │
     │      && !hasErrorTool              │
     │      && !isEmbeddedShellFocused    │
     │      && !isUserInitiated           │
     └────────────────────────────────────┘
```

### 3.2 주요 소스 파일

| 컴포넌트      | 파일                                    | 주요 로직                           |
| --------- | ------------------------------------- | ------------------------------- |
| 토글 핸들러    | `AppContainer.tsx:1684-1690`          | `compactMode`를 전환하고 설정에 저장      |
| 컨텍스트      | `CompactModeContext.tsx`              | `compactMode`,`setCompactMode`  |
| 도구 그룹     | `ToolGroupMessage.tsx:105-110`        | 4가지 강제 확장 조건을 가진`showCompact`   |
| 도구 메시지    | `ToolMessage.tsx:346-350`             | 컴팩트 모드에서는`displayRenderer`숨김    |
| 컴팩트 디스플레이 | `CompactToolGroupDisplay.tsx:49-108`  | 상태 및 힌트가 포함된 한 줄 요약             |
| 승인        | `ToolConfirmationMessage.tsx:113-147` | 단순화된 3가지 옵션 컴팩트 승인 UI           |
| 팁         | `Tips.tsx:14-29`                      | 시작 팁 로테이션에 컴팩트 모드 힌트 포함         |
| 설정 동기화    | `SettingsDialog.tsx:189-193`          | CompactModeContext와 동기화 + 정적 갱신 |
| 메인 콘텐츠    | `MainContent.tsx:60-76`               | 활성 pendingHistoryItems 렌더링      |
| 사고 과정     | `HistoryItemDisplay.tsx:123-133`      | 컴팩트 모드에서`gemini_thought`숨김      |

### 3.3 설계 결정

1. **상세(Verbose)가 기본값입니다.**&#xC0AC;용자는 기본적으로 모든 도구 출력과 AI의 생각 과정을 볼 수 있습니다.
2. **지속적인 환경설정.** `compactMode`는`settings.json`에 저장되어 세션이 바뀌어도 유지됩니다.
3. **컴포넌트 수준 렌더링.**&#xAC01; 컴포넌트는 컨텍스트에서`compactMode`를 읽고 자체 렌더링을 조정합니다.
4. **강제 확장 보호.**&#xD575;심 UI 요소(승인, 에러, 셸, 사용자 시작 명령)가 항상 보이도록 컴팩트 모드를 무시하는 4가지 조건이 있습니다.
5. **스냅샷 동결 없음.**&#xD1A0;글은 동결된 스냅샷이 아닌 실시간 출력을 항상 표시합니다.
6. **설정 대화 상자 동기화.**&#xC124;정에서 컴팩트 모드를 전환하면`setCompactMode`를 통해 즉시 React 상태가 업데이트됩니다.
7. **방해되지 않는 발견 가능성.**&#xC9C0;속적인 푸터 알림 등으로 UI를 복잡하게 하는 대신, 시작 팁(Tips) 로테이션을 통해 컴팩트 모드가 소개됩니다.

### 3.4 사용자 흐름

```
세션 시작 → 상세 모드 (기본)
     │
     ├─ 모든 도구 출력, 생각 과정, 세부 사항이 보임
     │
     ├─ 사용자가 Ctrl+O 누름 (또는 설정에서 변경)
     │     └─→ compactMode = true, 영구 저장됨
     │         ├─ 도구 그룹이 한 줄 요약으로 축소됨
     │         ├─ 생각/사고 과정 내용이 숨겨짐
     │         └─ 승인, 오류, 셸은 여전히 확장된 상태로 유지됨
     │
     ├─ 사용자가 다시 Ctrl+O 누름
     │     └─→ compactMode = false, 영구 저장됨
     │         └─ 모든 세부 정보가 다시 보임
     │
     └─ 다음 세션 → 이전 세션과 동일한 모드로 시작
```

## 4. 주요 차이점 심층 분석

### 4.1 기본 모드 철학

| 측면     | Claude Code (컴팩트 기본)        | Qwen Code (상세 기본)          |
| ------ | --------------------------- | -------------------------- |
| 첫인상    | 깔끔하고 미니멀 — 전문적인 느낌          | 정보가 풍부 — 완전한 투명성           |
| 학습 곡선  | 세부 정보를 보려면 Ctrl+O를 배워야 함    | 사용자는 즉시 모든 것을 볼 수 있음       |
| 타겟 사용자 | 도구를 신뢰하는 숙련된 사용자            | 무슨 일이 일어나고 있는지 이해하고 싶은 사용자 |
| 정보 과부하 | 기본적으로 회피됨                   | 신규 사용자에게 발생할 수 있음          |
| 발견 가능성 | 도구별 "(ctrl+o to expand)" 힌트 | 시작 팁 로테이션 + ? 단축키 + /help  |

**분석:**&#x43;laude Code의 컴팩트 기본값은 사용자가 도구를 신뢰하고 모든 도구 호출을 볼 필요가 없는 숙련된 개발자일 때 적합합니다. Qwen Code의 상세 기본값은 투명성을 통해 사용자 신뢰를 구축하는 것이 중요한 초기 단계에 적합합니다.

### 4.2 지속성 모델

| 측면       | 클로드 코드         | 퀀 코드                   |
| -------- | -------------- | ---------------------- |
| 영구 저장 여부 | 아니오 — 세션 전용    | 예 —`settings.json`에 저장 |
| 원리       | 상세 모드는 일시적인 확인 | 모드는 사용자의 설정 취향         |
| 재시작 동작   | 항상 컴팩트로 시작     | 마지막으로 사용한 모드로 시작       |

**분석:**&#x43;laude Code는 세부 정보를 보는 것을 확인 후 돌아가는 일시적인 필요로 간주합니다. Qwen Code는 일부 사용자는 항상 세부 정보를 원하고 일부는 항상 컴팩트 모드를 원한다는 안정적인 선호도로 간주합니다. 둘 다 타당하며 Qwen Code의 접근 방식이 더 유연합니다.

### 4.3 승인 보호

| 측면        | 클로드 코드                    | 퀀 코드                          |
| --------- | ------------------------- | ----------------------------- |
| 메커니즘      | 오버레이/모달 레이어 (구조적으로 분리됨)   | `showCompact`의 강제 확장 조건       |
| 적용 범위     | 완벽함 — 승인은 절대 숨겨지지 않음      | 완벽함 — 4가지 조건이 모든 상호작용 상태를 포괄함 |
| 컴팩트 승인 UI | 해당 없음 (오버레이는 항상 전체로 렌더링됨) | 단순화된 3가지 옵션 RadioButtonSelect |

**분석:**&#x43;laude Code의 아키텍처적 분리(오버레이 레이어)가 더 강력합니다. Qwen Code의 강제 확장 접근 방식은 효과적이지만 새로운 대화형 상태가 추가될 때마다 조건 목록에 명시적으로 추가해야 합니다.

### 4.4 렌더링 접근 방식

| 측면    | 클로드 코드                      | 퀀 코드                          |
| ----- | --------------------------- | ----------------------------- |
| 토글 범위 | 화면 수준 (prompt ↔ transcript) | 컴포넌트 수준 (각 컴포넌트가 결정)          |
| 세분성   | 전부 아니면 전무(All-or-nothing)   | 컴포넌트별로 세밀함                    |
| 유연성   | 낮음 — 전역 스위치                 | 높음 — 컴포넌트가 무시(override)할 수 있음 |
| 일관성   | 보장됨                         | 각 컴포넌트의 구현에 따라 달라짐            |

**분석:**&#x51;wen Code의 컴포넌트 수준 접근 방식은 유연하지만(예: 특정 조건에 대한 강제 확장), 일관성을 유지하기 위해 더 많은 규율이 필요합니다. Claude Code의 화면 수준 접근 방식은 더 단순하고 일관된 동작을 보장합니다.

## 5. 최적화 권장 사항

### 5.1 \[P0] 상세를 기본값으로 유지 — 변경 불필요

Qwen Code의 상세 기본값은 현재 단계에 적합한 선택입니다. 도구를 처음 접하는 사용자는 신뢰를 구축하기 위해 투명성이 필요합니다. 제품이 성숙해지면 (Claude Code처럼) 컴팩트를 기본값으로 만드는 것을 고려해 보십시오.

### 5.2 \[P1] 대용량 출력을 위한 도구별 확장 기능

Claude Code는 방대한 출력을 생성하는 개별 도구에 "(ctrl+o to expand)"를 표시합니다. Qwen Code에는 현재 전역 토글만 있습니다. 다음을 고려해 보십시오:

* 단일 도구가 N줄을 초과하는 출력을 생성하면 컴팩트 모드에서 도구별 "expand(확장)" 힌트를 표시합니다.
* 범위: 향후 개선 사항이며 현재 우선순위는 아닙니다.

### 5.3 \[P2] 세션 범위 재정의 고려

일부 사용자는 컴팩트 모드를 기본값으로 원하지만 특정 세션에 대해서만 일시적으로 상세 정보가 필요할 수 있습니다. 두 가지를 모두 지원하는 것을 고려해 보십시오:

* `settings.json`→ 영구적인 기본값 (현재 동작)
* 세션 중 Ctrl+O → 현재 세션에만 적용되는 일시적 재정의 (Claude Code 동작)
* 세션 재시작 시 →`settings.json`값으로 되돌림

이것은 사용자에게 두 가지 장점을 모두 제공합니다. 구현하려면 "설정 기본값"과 "세션 재정의" 상태를 분리해야 합니다.

### 5.4 \[P2] 승인을 위한 구조적 분리

현재 승인 보호는`ToolGroupMessage`의`showCompact`조건에 의존하고 있습니다. 더 강력한 접근 방식을 고려해 보십시오:

* 승인을 별도의 레이어에 렌더링합니다(Claude Code의 오버레이 접근 방식처럼).
* 이렇게 하면 아키텍처적으로 컴팩트 모드가 승인 화면에 영향을 미치는 것이 불가능해집니다.
* 현재의 강제 확장 접근 방식이 올바르게 작동하므로 우선순위는 낮습니다.

## 6. 현재 구현 상태

`feat/compact-mode-optimization`브랜치 변경 이후:

| 기능              | 상태 | 비고                                   |
| --------------- | -- | ------------------------------------ |
| 시작 팁 힌트         | 완료 | 팁 로테이션에 컴팩트 모드 팁 포함 (방해되지 않음)        |
| 단축키의 Ctrl+O (?) | 완료 | KeyboardShortcuts 컴포넌트에 추가됨          |
| /도움말의 Ctrl+O    | 완료 | Help 컴포넌트에 추가됨                       |
| 설정 대화 상자 동기화    | 완료 | compactMode를 CompactModeContext와 동기화 |
| 스냅샷 동결 없음       | 완료 | 토글 시 항상 실시간 출력이 표시됨                  |
| 승인 보호           | 완료 | 강제 확장 + WaitingForConfirmation 가드    |
| 셸 보호            | 완료 | `!isEmbeddedShellFocused`강제 확장       |
| 에러 보호           | 완료 | `!hasErrorTool`강제 확장                 |
| 사용자 문서 업데이트     | 완료 | settings.md, 키보드 단축키.md              |

## 7. 파일 참조

### 퀀 코드

| 파일                                                                    | 목적                       |
| --------------------------------------------------------------------- | ------------------------ |
| `packages/cli/src/ui/AppContainer.tsx`                                | 토글 핸들러, 상태 초기화, 컨텍스트 제공자 |
| `packages/cli/src/ui/contexts/CompactModeContext.tsx`                 | 컨텍스트 정의                  |
| `packages/cli/src/ui/components/messages/ToolGroupMessage.tsx`        | 강제 확장 로직                 |
| `packages/cli/src/ui/components/messages/ToolMessage.tsx`             | 도구별 출력 숨김                |
| `packages/cli/src/ui/components/messages/CompactToolGroupDisplay.tsx` | 컴팩트 뷰 렌더링                |
| `packages/cli/src/ui/components/messages/ToolConfirmationMessage.tsx` | 컴팩트 승인 UI                |
| `packages/cli/src/ui/components/MainContent.tsx`                      | 활성 기록 항목 렌더링             |
| `packages/cli/src/ui/components/Tips.tsx`                             | 컴팩트 모드 힌트가 포함된 시작 팁      |
| `packages/cli/src/ui/components/Help.tsx`                             | /help 단축키 항목             |
| `packages/cli/src/ui/components/KeyboardShortcuts.tsx`                | ? 단축키 항목                 |
| `packages/cli/src/ui/components/SettingsDialog.tsx`                   | 설정 동기화                   |
| `packages/cli/src/ui/components/HistoryItemDisplay.tsx`               | 생각(Thinking) 내용 숨김       |
| `packages/cli/src/config/settingsSchema.ts`                           | 설정 정의                    |
| `packages/cli/src/config/keyBindings.ts`                              | Ctrl+O 바인딩               |

### Claude Code (참조용)

| 파일                                                 | 목적                     |
| -------------------------------------------------- | ---------------------- |
| `src/hooks/useGlobalKeybindings.tsx`               | 토글 핸들러                 |
| `src/state/AppStateStore.ts`                       | 상태 정의 (verbose: false) |
| `src/components/CtrlOToExpand.tsx`                 | 도구별 확장 힌트              |
| `src/components/Messages.tsx`                      | 간략한 메시지 필터             |
| `src/screens/REPL.tsx`                             | 화면 수준 모드 전환            |
| `src/components/permissions/PermissionRequest.tsx` | 오버레이 기반 승인             |
