# 2단계 기술 설계 문서: 기능 확장

## 1. 설계 목표 및 제약 조건

### 1.1 목표

- 13개의 내장 명령을 `supportedModes`에 `non_interactive` 및/또는 `acp`를 포함하도록 확장합니다.
- ACP/비대화형 경로에서 각 확장 명령이 IDE 사용에 적합한 텍스트 내용을 반환하도록 보장합니다.
- 프롬프트 명령에 대한 모델 호출 경로를 엽니다 (`SkillTool`이 `getModelInvocableCommands()`를 소비하도록 함).
- 입력 중간에서의 슬래시 명령 감지 기본 구현을 수행합니다.

### 1.2 제약 조건

- **대화형 경로의 무결성**: 모든 확장 명령의 기존 대화형 동작은 엄격하게 유지되어야 합니다. 작업(action) 내부에 새로운 모드 분기만 추가하며, 대화형 경로 코드는 최대한 건드리지 않습니다.
- **구현 전략: 이중 등록 대신 모드 분기 사용**: 13개 명령 모두 `action` 내부에서 `executionMode`를 판단하는 방식을 사용합니다. 1단계 설계 문서 §10.2에서 언급된 이중 등록(Dual-registration) 방식은 사용하지 않습니다. (이중 등록은 대화형과 비대화형 간의 로직 차이가 매우 크고, 명령의 복잡도가 임계치를 넘을 때만 필요합니다.)
- **ACP 메시지 형식**: ACP 경로에서 반환되는 텍스트 내용은 ANSI 스타일(색상 코드 등)을 포함하지 않아야 합니다. Markdown 또는 일반 텍스트 형식이 권장되며, 이는 IDE 플러그인에서의 활용을 위함입니다.
- **환경 의존적 부작용 방지**: 브라우저 열기 (`open()`), 클립보드 조작 (`copyToClipboard()`) 등 그래픽 환경에 의존하는 작업은 비대화형/ACP 경로에서 건너뛰어야 합니다.

---

## 2. 1단계 완료 후 기본 상태

1단계 완료 후의 아키텍처 하이라이트 (2단계는 이를 기반으로 확장됨):

- `commandType` 필드가 `SlashCommand` 인터페이스에서 제거되었습니다. 모든 명령은 명시적으로 `supportedModes`를 사용합니다.
- `getEffectiveSupportedModes()` 유틸리티 함수: 명시적 `supportedModes`가 없으면 `CommandKind`를 기반으로 기본값을 추론합니다.
- `CommandService.getCommandsForMode(mode)`가 기존의 `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE` 화이트리스트를 대체합니다.
- `btw`, `bug`, `compress`, `context`, `init`, `summary`는 1단계에서 이미 전 모드로 확장되었으므로 **이 단계의 작업 목록에는 포함되지 않습니다.**
- `createNonInteractiveUI()`의 모든 메서드는 No-op(동작 없음)으로 구현되어 있습니다. (`addItem`, `clear`, `setDebugMessage`, `setPendingItem`, `reloadCommands` 호출은 자동으로 무시됨)

---

## 3. 변경 범위 개요

이번 단계에서는 총 13개의 명령을 다루며, 구현 복잡도에 따라 4가지 범주로 나뉩니다.

| 범주            | 명령                                         | 변경 핵심 포인트                                                                                                           |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **유형 A**      | `export`                                     | `supportedModes`만 변경. 기존 작업 경로가 이미 올바른 형식을 반환하고 있음.                                                |
| **대화형 전용** | `plan`, `statusline`                         | 설계 결정: 이 명령들은 의미론적으로 대화형 인터페이스와 밀접하게 결합되어 있으므로 `supportedModes: ['interactive']` 유지. |
| **유형 A+**     | `language`                                   | `supportedModes` 변경 + 소량의 비대화형 분기 처리 추가.                                                                    |
| **대화형 전용** | `copy`, `restore`                            | 설계 결정: 복사 및 스냅샷 복구는 본질적으로 대화형 작업이므로 `supportedModes: ['interactive']` 유지.                      |
| **유형 A'**     | `model`, `approval-mode`                     | 매개변수가 있는 경로는 이미 `message`를 반환함. 매개변수가 없는 경로(원래 대화창 트리거)에 비대화형 분기 추가 필요.        |
| **유형 B**      | `about`, `stats`, `insight`, `docs`, `clear` | 작업에 반환값이 없거나 `addItem`/`clear`를 호출함. 완전한 비대화형 분기 추가 필요.                                         |

---

## 4. 유형 A: `supportedModes`만 수정

이 명령들은 `action` 경로에서 이미 `message` 또는 `submit_prompt`를 반환하고 있으며, UI 의존성이 전혀 없어 `handleCommandResult`에서 직접 처리가 가능합니다.

### 4.1 `/export` (및 하위 명령)

**현황**: `supportedModes: ['interactive']`, 모든 하위 명령의 작업이 `MessageActionReturn`을 반환합니다.

**변경**: 부모 명령과 4개의 하위 명령 (`md`, `html`, `json`, `jsonl`)의 `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.

**ACP 메시지 내용**: 기존에 반환되던 내용에 이미 전체 파일 경로가 포함되어 있어 (예: `Session exported to markdown: qwen-export-2024-01-01T12-00-00.md`) IDE 사용에 적합하므로 텍스트 수정이 필요하지 않습니다.

> **참고**: `/export` 부모 명령 자체에는 `action`이 없고 하위 명령에만 있습니다. 부모 명령의 `supportedModes`를 확장하면 `parseSlashCommand`가 하위 명령 경로를 매칭할 수 있게 됩니다. 사용자가 하위 명령 없이 `/export`만 입력하면 `commandToExecute.action`이 `undefined`가 되어 `handleSlashCommand`가 `no_command`를 반환하고, 호출자에게 사용 가능한 하위 명령 목록이 표시됩니다. 이는 의도된 동작입니다.

### 4.2 `/plan`

**현황**: `supportedModes: ['interactive']`, 작업이 `MessageActionReturn` 또는 `SubmitPromptActionReturn`을 반환합니다.

**설계 결정**: `/plan`은 사용자가 여러 단계의 대화형 계획을 수립하도록 안내하는 명령으로, 대화형 인터페이스와 밀접하게 결합되어 있습니다. 따라서 `supportedModes: ['interactive']`를 유지하고 비대화형/ACP 모드로 확장하지 않습니다.

### 4.3 `/statusline`

**현황**: `supportedModes: ['interactive']`, 작업이 항상 `SubmitPromptActionReturn`을 반환합니다 (서브 에이전트를 호출하여 요약을 수행함).

**설계 결정**: `/statusline`은 현재 상태를 요약하기 위해 서브 에이전트를 트리거하는 명령으로, 대화형 인터페이스와 의미론적으로 밀접하게 결합되어 있습니다. 따라서 `supportedModes: ['interactive']`를 유지하고 비대화형/ACP 모드로 확장하지 않습니다.

---

## 5. 유형 A+: 소량의 비대화형 분기 처리

### 5.1 `/language`

**현황**: 작업의 모든 경로가 `MessageActionReturn`을 반환합니다 (언어 설정 읽기/설정).

**부작용 처리**: 언어 설정 시 호출되는 `context.ui.reloadCommands()`는 비대화형 UI에서 이미 No-op이므로 추가 처리가 필요하지 않습니다.

**변경**:

- 부모 명령과 하위 명령 (`ui`, `output` 및 동적으로 생성되는 `SUPPORTED_LANGUAGES` 하위 명령)의 `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
- 작업 내부의 분기 추가는 필요하지 않으며, 기존의 반환 텍스트가 이미 기계적 사용에 적합합니다.

**ACP 의미론**: 비대화형 모드에서 `/language ui zh-CN`을 실행하면 영구 설정이 수정되어 파일에 기록됩니다. 변경 사항은 이후 세션에 적용되며, 현재 세션의 i18n도 즉시 반영됩니다. 이는 사용자의 기대와 일치합니다.

### 5.2 `/copy`

**현황**: 작업이 `copyToClipboard()`를 호출하며, ACP/헤드리스 환경에서는 예외가 발생하거나 자동으로 실패할 수 있습니다.

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 작업 내부에 새로운 모드 분기를 추가합니다.

```typescript
// 마지막 AI 메시지 가져오기 (기존 로직 재사용 가능)
if (context.executionMode !== 'interactive') {
  // 비대화형/ACP: 클립보드 건너뛰고 내용 자체를 반환
  if (!lastAiOutput) {
    return {
      type: 'message',
      messageType: 'info',
      content: 'No output in history.',
    };
  }
  return {
    type: 'message',
    messageType: 'info',
    content: lastAiOutput,
  };
}
// interactive 경로: 기존 클립보드 로직 유지
await copyToClipboard(lastAiOutput);
return {
  type: 'message',
  messageType: 'info',
  content: 'Last output copied to the clipboard',
};
```

**ACP 의미론**: IDE는 마지막 모델 출력의 원본 텍스트를 수신하여 클립보드에 기록할지 아니면 사용자에게 표시할지 결정할 수 있습니다.

### 5.3 `/restore`

**현황**: `supportedModes: ['interactive']`.

**설계 결정**: 스냅샷 복구는 대화형 인터페이스와 밀접하게 결합된 도구 재실행을 포함합니다. 따라서 `supportedModes: ['interactive']`를 유지하고 비대화형/ACP 모드로 확장하지 않습니다.

---

## 6. 유형 A': 매개변수 없는 대화형 경로의 비대화형 처리

### 6.1 `/model`

**현황**:

| 입력                          | 현재 동작                                                      |
| ----------------------------- | -------------------------------------------------------------- |
| `/model` (매개변수 없음)      | → `{ type: 'dialog', dialog: 'model' }` (비대화형 미지원)      |
| `/model <model-id>`           | 미구현 (`--fast` 분기만 있음)                                  |
| `/model --fast` (모델명 없음) | → `{ type: 'dialog', dialog: 'fast-model' }` (비대화형 미지원) |
| `/model --fast <model-id>`    | → `MessageActionReturn` ✅                                     |

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 작업의 각 대화창 경로 앞에 비대화형 분기를 삽입합니다.

```typescript
// 매개변수 없는 경로 (기존에는 dialog: 'model' 반환)
if (!args.trim()) {
  if (context.executionMode !== 'interactive') {
    const currentModel = config.getModel() ?? 'unknown';
    return {
      type: 'message',
      messageType: 'info',
      content: `Current model: ${currentModel}\nUse "/model <model-id>" to switch models.`,
    };
  }
  return { type: 'dialog', dialog: 'model' };
}

// --fast 매개변수 없는 경로 (기존에는 dialog: 'fast-model' 반환)
if (args.startsWith('--fast') && !modelName) {
  if (context.executionMode !== 'interactive') {
    const fastModel = context.services.settings?.merged?.fastModel ?? 'not set';
    return {
      type: 'message',
      messageType: 'info',
      content: `Current fast model: ${fastModel}\nUse "/model --fast <model-id>" to set fast model.`,
    };
  }
  return { type: 'dialog', dialog: 'fast-model' };
}
```

**ACP 의미론**: IDE는 사용자가 참고할 수 있도록 현재 모델 이름을 표시합니다. 모델 전환은 `/model <model-id>`와 같이 매개변수를 사용하여 수행할 수 있습니다.

> **참고**: 현재 `/model <model-id>` (`--fast` 없이)를 통해 현재 세션의 모델을 설정하는 로직은 아직 구현되지 않았습니다. 2단계에서 ACP 하의 모델 전환을 지원하려면 `/model <model-id>` 설정 로직을 동기적으로 구현해야 합니다. 이번 설계에서는 이 경로를 예약해 두었지만, 2단계의 선택 사항(선택)으로 표시하여 "현재 모델 보기"라는 읽기 전용 경로를 먼저 보장하는 데 우선순위를 둡니다.

### 6.2 `/approval-mode`

**현황**:

| 입력                             | 현재 동작                                                         |
| -------------------------------- | ----------------------------------------------------------------- |
| `/approval-mode` (매개변수 없음) | → `{ type: 'dialog', dialog: 'approval-mode' }` (비대화형 미지원) |
| `/approval-mode <mode>`          | → `MessageActionReturn` ✅                                        |
| `/approval-mode <invalid>`       | → `MessageActionReturn` (오류) ✅                                 |

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 매개변수 없는 경로 (`!args.trim()`)에 비대화형 분기를 삽입합니다.

```typescript
if (!args.trim()) {
  if (context.executionMode !== 'interactive') {
    const currentMode = config?.getApprovalMode() ?? 'unknown';
    return {
      type: 'message',
      messageType: 'info',
      content: `Current approval mode: ${currentMode}\nAvailable modes: ${APPROVAL_MODES.join(', ')}\nUse "/approval-mode <mode>" to change.`,
    };
  }
  return { type: 'dialog', dialog: 'approval-mode' };
}
```

---

## 7. 유형 B: 완전한 비대화형 분기 필요

이 5개 명령은 대화형 모드에서 `context.ui.addItem()`을 호출하여 React 컴포넌트를 렌더링하거나 `context.ui.clear()`를 호출하며, 반환값은 `void`입니다. 비대화형 모드에서는 이러한 호출이 무시되므로 `handleSlashCommand`가 아무런 내용도 출력하지 않게 됩니다.

**구현 원리**: 작업(action)의 **최상단**에서 `executionMode`를 확인하여, 비대화형일 경우 실제 내용이 포함된 `message`를 **조기 반환(Early Return)**합니다. 이렇게 하면 대화형 경로 코드는 전혀 수정할 필요가 없습니다.

### 7.1 `/about` (별칭: `status`)

**데이터 소스**: `getExtendedSystemInfo(context)`가 `ExtendedSystemInfo`를 반환합니다. 여기에는 `cliVersion`, `osPlatform`, `nodeVersion`, `modelVersion`, `sessionId` 등이 포함됩니다. 모든 필드는 비대화형 모드에서도 사용 가능합니다.

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. `getExtendedSystemInfo` 호출 후 대화형 경로 앞에 모드 분기를 삽입합니다.

```typescript
action: async (context) => {
  const systemInfo = await getExtendedSystemInfo(context);

  if (context.executionMode !== 'interactive') {
    const lines = [
      `Qwen Code v${systemInfo.cliVersion}`,
      `Model: ${systemInfo.modelVersion}`,
      `Fast Model: ${systemInfo.fastModel ?? 'not set'}`,
      `Auth: ${systemInfo.selectedAuthType}`,
      `Platform: ${systemInfo.osPlatform} ${systemInfo.osArch} (${systemInfo.osRelease})`,
      `Node.js: ${systemInfo.nodeVersion}`,
      `Session: ${systemInfo.sessionId}`,
      ...(systemInfo.gitCommit ? [`Git commit: ${systemInfo.gitCommit}`] : []),
      ...(systemInfo.ideClient ? [`IDE: ${systemInfo.ideClient}`] : []),
    ];
    return {
      type: 'message',
      messageType: 'info',
      content: lines.join('\n'),
    };
  }

  // interactive 경로: 기존 addItem 로직 유지
  const aboutItem: Omit<HistoryItemAbout, 'id'> = { type: MessageType.ABOUT, systemInfo };
  context.ui.addItem(aboutItem, Date.now());
},
```

### 7.2 `/stats` (및 하위 명령 `model`, `tools`)

**데이터 소스**: `context.session.stats` (`SessionStatsState`)가 `metrics` (모델별 토큰, 도구 호출 수 등)를 포함합니다.

**변경**:

1. 부모 명령 `stats` 및 하위 명령 `model`, `tools`의 `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 각 명령의 작업에 모드 분기를 삽입하여 텍스트 형식의 통계치를 반환합니다.

```typescript
// /stats 부모 명령
action: (context) => {
  if (context.executionMode !== 'interactive') {
    const now = new Date();
    const { sessionStartTime, promptCount, metrics } = context.session.stats;
    // ... 통계 계산 로직 ...
    const lines = [
      `Session duration: ${formatDuration(wallDuration)}`,
      `Prompts: ${promptCount}`,
      `API requests: ${totalRequests}`,
      `Tokens — prompt: ${totalPromptTokens}, output: ${totalCandidateTokens}`,
      `Tool calls: ${metrics.tools.totalCalls} (${metrics.tools.totalSuccess} ok, ${metrics.tools.totalFail} fail)`,
      `Files: +${metrics.files.totalLinesAdded} / -${metrics.files.totalLines제거됨} lines`,
    ];
    return { type: 'message', messageType: 'info', content: lines.join('\n') };
  }
  // interactive 경로: 기존 로직 유지
},
```

하위 명령 `model`과 `tools`도 각각 모드 분기를 삽입하여 모델별 사용량 또는 도구별 호출 횟수를 텍스트로 반환합니다.

### 7.3 `/insight`

**현황**: 작업이 `void`를 반환하며, `addItem`으로 진행 상황을 보여준 뒤 마지막에 `open(outputPath)`로 브라우저를 엽니다. 핵심 로직은 `insightGenerator.generateStaticInsight()`입니다.

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. `executionMode`에 따라 세 갈래로 분기합니다:
   - `non_interactive`: 동기식 생성, 진행 콜백 무시, 브라우저를 열지 않고 즉시 `message`(파일 경로) 반환.
   - `acp`: 비동기 생성을 시작하고 `stream_messages`를 통해 진행 상황(`encodeInsightProgressMessage`) 및 완료(`encodeInsightReadyMessage`) 알림을 IDE로 전송.
   - `interactive`: 기존의 `addItem` + `open()` 로직 유지.

**설계 이유**: `non_interactive` 모드(CLI 파이프라인)는 `stream_messages`를 지원하지 않으므로 단일 `message`만 반환 가능합니다. ACP 모드(IDE 플러그인)는 진행 상황을 실시간으로 보여줄 수 있어야 하므로 스트리밍 경로를 제공합니다.

### 7.4 `/docs`

**현황**: 작업이 `void`를 반환하고 브라우저를 엽니다.

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 작업의 반환 타입을 `Promise<void | MessageActionReturn>`으로 수정합니다.
3. 작업 최상단에 비대화형 분기를 삽입하여 브라우저를 열지 않고 URL만 반환합니다.

### 7.5 `/clear` (별칭: `reset`, `new`)

**현황**: 작업이 세션 종료 이벤트 발화, 새 세션 ID 생성, 채팅 기록 리셋 등을 수행하고 `ui.clear()`를 호출합니다.

**변경**:

1. `supportedModes`를 `['interactive', 'non_interactive', 'acp']`로 변경합니다.
2. 작업 끝부분에서 모드에 따라 `message` 또는 `void`를 반환하도록 수정합니다. 비대화형 모드에서는 `ui.clear()`가 이미 동작하지 않으므로 추가 조건 없이 호출해도 무방하지만, 사용자에게 "컨텍스트가 초기화되었습니다"라는 명시적인 메시지를 반환해 주어야 합니다.

---

## 8. `handleCommandResult` 변경 사항

**결론: 수정 불필요.**
2단계에서 모든 명령의 수정이 완료되면, 비대화형/ACP 경로의 반환 타입은 `message` 또는 `submit_prompt`가 되며, 이는 이미 `handleCommandResult`에서 올바르게 처리되고 있습니다.

---

## 9. `createNonInteractiveUI()` 변경 사항

**결론: 수정 불필요.**
현재의 No-op 구현으로 충분합니다. 유형 B 명령의 비대화형 경로에서는 이러한 메서드들이 호출되지 않거나 (조기 반환으로 인해) 호출되더라도 무시됩니다.

---

## 10. 2.2단계: 프롬프트 명령의 모델 호출 허용

1단계에서 `CommandService.getModelInvocableCommands()`가 구현되었으며, 로더들을 통해 `modelInvocable: true`가 설정되었습니다. 2.2단계의 작업은 `SkillTool`이 기존의 `SkillManager.listSkills()`뿐만 아니라 `CommandService.getModelInvocableCommands()`도 함께 소비하도록 하여 모델 호출 가능 명령의 통합 입구가 되도록 하는 것입니다.

**수정 파일**: `packages/core/src/tools/SkillTool.ts`

---

## 11. 2.3단계: 입력 중간 슬래시 명령 감지 (기본 버전)

`InputPrompt` 컴포넌트에서 줄의 시작 부분만이 아니라 커서 근처에 있는 슬래시 토큰을 감지하여 자동 완성 메뉴를 트리거합니다.

**감지 규칙**:

- 커서 앞의 문자가 `/`로 시작하고 공백을 포함하지 않는 토큰인 경우 자동 완성을 트리거합니다.
- 후보 목록은 `getCommandsForMode('interactive')`에서 가져옵니다.
- 기본 버전에서는 명령 이름과 설명만 표시합니다. (3단계에서 인수 힌트 등 추가 예정)

---

## 12. 파일 변경 개요

### 12.1 명령 파일 수정 (2.1단계)

| 파일                     | 변경 유형   | 구체적 내용                                                             |
| ------------------------ | ----------- | ----------------------------------------------------------------------- |
| `exportCommand.ts`       | 유형 A      | 부모 + 4개 하위 명령: `supportedModes`를 모든 모드로 확장               |
| `planCommand.ts`         | 대화형 전용 | 설계 결정: `supportedModes: ['interactive']` 유지                       |
| `statuslineCommand.ts`   | 대화형 전용 | 설계 결정: `supportedModes: ['interactive']` 유지                       |
| `languageCommand.ts`     | 유형 A+     | 부모 + 하위 명령: `supportedModes`를 모든 모드로 확장                   |
| `copyCommand.ts`         | 유형 A+     | `supportedModes` 확장 + 비대화형 경로에서 클립보드 대신 내용 반환       |
| `restoreCommand.ts`      | 대화형 전용 | 설계 결정: `supportedModes: ['interactive']` 유지                       |
| `modelCommand.ts`        | 유형 A'     | `supportedModes` 확장 + 매개변수 없는 경로에 대한 비대화형 분기 추가    |
| `approvalModeCommand.ts` | 유형 A'     | `supportedModes` 확장 + 매개변수 없는 경로에 대한 비대화형 분기 추가    |
| `aboutCommand.ts`        | 유형 B      | `supportedModes` 확장 + 비대화형 경로에서 요약 정보 `message` 반환      |
| `statsCommand.ts`        | 유형 B      | `supportedModes` 확장 + 비대화형 경로에서 통계 텍스트 `message` 반환    |
| `insightCommand.ts`      | 유형 B      | `supportedModes` 확장 + 모드별 분기 (파일 경로 반환 또는 스트리밍 푸시) |
| `docsCommand.ts`         | 유형 B      | `supportedModes` 확장 + 비대화형 경로에서 브라우저 열지 않고 URL 반환   |
| `clearCommand.ts`        | 유형 B      | `supportedModes` 확장 + 비대화형 경로에서 컨텍스트 초기화 메시지 반환   |

---

## 13. 테스트 전략

각 수정된 명령에 대해 동일 디렉토리에 있는 `*.test.ts` 파일을 업데이트하거나 추가하여 다음 케이스들을 검증합니다:

- `supportedModes`가 `non_interactive` 및 `acp`를 올바르게 포함하는지 확인.
- `executionMode: 'non_interactive'`일 때 작업이 `MessageActionReturn` 등을 반환하고 `ui.*` 메서드를 호출하지 않는지 확인.
- 대화형 경로의 동작이 이전과 동일한지 (스냅샷 테스트 등) 확인.
- 비대화형 모드에서 `/clear`를 실행해도 채팅 리셋 등의 부작용이 여전히 발생하는지 확인.

---

## 14. 구현 순서 권장

1. **유형 A**: `export` 등 단순 모드 확장.
2. **유형 A+**: `language`, `copy` 등 소량의 분기 추가.
3. **유형 A'**: `model`, `approval-mode` 등 대화창 대체 로직.
4. **유형 B**: `about`, `stats`, `docs` 등 완전한 텍스트 출력 분기 추가.
5. **유형 B 특수**: `insight`, `clear` 등 부작용이 많은 명령 처리.
6. **2.2단계**: `SkillTool`을 통한 모델 호출 연동.
7. **2.3단계**: `InputPrompt` UI 변경.
8. **최종 확인**: 전체 타입 체크 및 테스트 실행.
