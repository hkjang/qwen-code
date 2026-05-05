# 2단계 기술 설계 문서: 기능 확장

## 1. 설계 목표 및 제약

### 1.1 목표

* 13개의 내장 명령을 다음으로 변환합니다.`supportedModes`포함하도록 확장`non_interactive`및/또는`acp`
* ACP/비대화형 경로 아래의 각 확장 명령이 IDE 사용에 적합한 텍스트 콘텐츠를 반환하는지 확인하세요.
* 프롬프트 명령의 모델 호출 경로를 엽니다(`SkillTool`소비`getModelInvocableCommands()`)
* 중간 입력 슬래시 명령의 기본 감지 구현

### 1.2 하드 제약

* **성능 저하가 전혀 없는 대화형 경로**: 모든 확장 명령의 기존 대화형 동작은 엄격하게 변경되지 않고 새 모드 분기만 작업 내부에 추가되며 대화형 경로 코드는 건드리지 않습니다.
* **구현 전략: 이중 등록 대신 모드 분기**: 13개의 명령어가 모두 사용됩니다.`action`내부 증가`executionMode`판단 방법은 1단계 설계 문서 §10.2에 설명된 이중 등록 모드를 사용하지 않습니다. (이중 등록은 대화형과 비대화형 간의 논리 차이가 극도로 다르고 이 단계의 명령 복잡성이 이 임계값에 도달하지 않는 경우에만 필요합니다.)
* **ACP 메시지 형식**: ACP 경로에서 반환된 텍스트 콘텐츠에는 ANSI 스타일이 포함되어 있지 않습니다. Markdown 또는 일반 텍스트가 적합하며 IDE 플러그인 사용을 위한 것입니다.
* **환경 관련 부작용 건너뛰기**: 브라우저를 엽니다(`open()`), 클립보드를 조작합니다(`copyToClipboard()`) 및 그래픽 환경에 따른 기타 작업은 비대화형/ACP 경로에서 건너뛰어야 합니다.

***

## 2. 1단계 완료 후 기본상태

1단계 종료 후 아키텍처 하이라이트(2단계는 이를 기반으로 직접 확장):

* `commandType`필드가 다음에서 변경되었습니다.`SlashCommand`인터페이스에서 제거되었습니다. 모든 명령은 명시적 사용을 사용합니다.`supportedModes`
* `getEffectiveSupportedModes()`2단계 추론의 경우: 명시적`supportedModes`→`CommandKind`모든 세부 사항을 공개
* `CommandService.getCommandsForMode(mode)`원본 교체`ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`화이트리스트
* `btw`、`bug`、`compress`、`context`、`init`、`summary`1단계에서는 전체 모드로 확장되었으며,**이 단계 목록에 없음**
* `createNonInteractiveUI()`모든 메소드는 작동하지 않습니다.`addItem`、`clear`、`setDebugMessage`、`setPendingItem`、`reloadCommands`전화는 자동으로 무시됩니다.

***

## 3. 변경 범위 개요

이 단계에는 총 13개의 명령이 포함되며 구현 복잡성에 따라 4가지 범주로 나뉩니다.

| 범주         | 주문하다                                     | 변화의 핵심 포인트                                                                      |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------- |
| **클래스 A**  | `export`                                 | 변화만`supportedModes`, 모든 작업 경로가 올바른 유형을 반환했습니다.                                  |
| **대화형 전용** | `plan`、`statusline`                      | 디자인 결정: 이 두 명령은 의미상 대화형 인터페이스와 밀접하게 결합되어 있습니다.`supportedModes: ['interactive']` |
| **클래스 A+** | `language`                               | 변화`supportedModes`+ 소량의 비대화형 분기 처리                                              |
| **대화형 전용** | `copy`、`restore`                         | 설계 결정: 스트리핑 및 스냅샷 복구는 본질적으로 대화형 작업이므로`supportedModes: ['interactive']`          |
| **클래스 A'** | `model`、`approval-mode`                  | 매개변수 경로가 반환되었습니다.`message`, 비대화형 분기를 추가할 필요가 없는 매개변수 경로(이제 대화 상자가 트리거됨)         |
| **카테고리 B** | `about`、`stats`、`insight`、`docs`、`clear` | 작업에 반환 값이 없거나 모든 경로에서 호출이 없습니다.`addItem`/`clear`, 완전한 비대화형 분기를 추가해야 합니다.        |

***

## 4. 카테고리 A: 수정만 가능`supportedModes`

이 세 가지 명령 모두`action`경로가 반환되었습니다.`message`또는`submit_prompt`, UI 종속성이 전혀 없습니다.`handleCommandResult`직접 처리가 가능합니다.

### 4.1 `/export`(및 하위 명령)

**현황**：`supportedModes: ['interactive']`, 모든 하위 명령 작업이 반환됩니다.`MessageActionReturn`。

**변화**: 상위 명령과 네 가지 하위 명령을 모두 결합합니다(`md`、`html`、`json`、`jsonl`)의`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。

**ACP 메시지 내용**:action 기존에 반환된 콘텐츠에는 이미 전체 파일 경로(예:`Session exported to markdown: qwen-export-2024-01-01T12-00-00.md`), IDE 사용에 친숙하므로 텍스트를 수정할 필요가 없습니다.

> **알아채다**：`/export`상위 명령 자체에는 없습니다.`action`, 하위 명령만. 상위 명령`supportedModes`풀모드로 변경 후,`parseSlashCommand`하위 명령 경로를 일치시킬 수 있지만 사용자가 입력만 하는 경우`/export`하위 명령이 없으면`commandToExecute.action`为 정의되지 않음，`handleSlashCommand`반품`no_command`, 호출자에게 사용 가능한 하위 명령에 대한 프롬프트가 표시됩니다. 이는 예상된 동작입니다.

### 4.2 `/plan`

**현황**：`supportedModes: ['interactive']`, 작업은 모든 경로를 반환합니다.`MessageActionReturn`또는`SubmitPromptActionReturn`。

**디자인 결정**：`/plan`이는 사용자가 여러 라운드의 대화형 계획을 수행하도록 안내하는 명령이며 의미상 대화형 인터페이스와 긴밀하게 결합됩니다. 논의 끝에 유지하기로 결정했습니다.`supportedModes: ['interactive']`, 비대화형/acp 모드로 확장되지 않습니다.

### 4.3 `/statusline`

**현황**：`supportedModes: ['interactive']`, 작업은 항상 반환됩니다.`SubmitPromptActionReturn`(하위 에이전트 호출은 모델에 대한 프롬프트를 표시합니다).

**디자인 결정**：`/statusline`현재 상태를 요약하기 위해 하위 에이전트를 트리거하는 명령이며 대화형 인터페이스와 의미상 긴밀하게 결합됩니다. 논의 끝에 유지하기로 결정했습니다.`supportedModes: ['interactive']`, 비대화형/acp 모드로 확장되지 않습니다.

***

## 5. 카테고리 A+: 소량의 비대화형 분기 처리

### 5.1 `/language`

**현황**:action 모든 경로가 반환됩니다.`MessageActionReturn`(언어 설정 읽기/설정).

**대처해야 할 부작용**：`setUiLanguage()`이내에 전화`context.ui.reloadCommands()`, 이미 비대화형 UI에서는 작동하지 않으므로 추가 처리가 필요하지 않습니다.

**변화**：

* 상위 명령과 하위 명령 결합(`ui`、`output`,게다가`SUPPORTED_LANGUAGES`동적으로 생성된 하위 명령)`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
* 작업에 패턴 분기를 추가할 필요가 없으며 기존 반환 텍스트는 이미 기계 사용에 적합합니다.

**ACP 의미론적 설명**: 비대화형(단일 호출)으로 실행됩니다.`/language ui zh-CN`지속성 설정이 수정됩니다(설정 파일에 기록됨). 변경 사항은 후속 세션에 적용되며, 이 세션의 i18n도 즉시 적용됩니다. 이는 사용자 기대와 일치합니다.

### 5.2 `/copy`

**현황**:액션 호출`copyToClipboard()`, ACP/헤드리스 환경에서는 예외가 발생하거나 자동으로 실패할 수 있습니다(클립보드를 사용할 수 없음).

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 작업 내에 새 패턴 분기를 추가합니다.

```typescript
// 获取 last AI message（现有逻辑，可复用）
if (context.executionMode !== 'interactive') {
  // 非交互/ACP：跳过剪贴板，返回内容本身
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
// interactive 路径：原有剪贴板逻辑不变
await copyToClipboard(lastAiOutput);
return {
  type: 'message',
  messageType: 'info',
  content: 'Last output copied to the clipboard',
};
```

**ACP 의미론**: IDE는 마지막 모델 출력의 원본 텍스트를 받아 클립보드에 쓸지 사용자에게 표시할지 결정할 수 있습니다.

### 5.3 `/restore`

**현황**：`supportedModes: ['interactive']`。

**디자인 결정**: 스냅샷 복구는 대화형 인터페이스와 의미상 긴밀하게 결합된 도구 호출을 추가로 다시 실행합니다. 논의 끝에 유지하기로 결정했습니다.`supportedModes: ['interactive']`, 비대화형/acp 모드로 확장되지 않습니다.

**ACP 의미론**: Checkpoint의 git 상태 복원 및 gemini 클라이언트 기록 설정이 모두 부작용으로 실행됩니다. 확인 메시지를 받은 후 IDE는 사용자에게 "상태가 복원되었습니다"라는 메시지를 표시할 수 있으며 IDE의 재량에 따라 도구 재실행이 트리거됩니다.

***

## 6. 클래스 A': 매개변수 없는 대화 경로의 비대화식 처리

### 6.1 `/model`

**현황**：

| 입력하다                       | 현재 행동                                                        |
| -------------------------- | ------------------------------------------------------------ |
| `/model`(매개변수 없음)          | →`{ type: 'dialog', dialog: 'model' }`(비대화형 下变 지원되지 않음)      |
| `/model <model-id>`        | 구현되지 않음(만`--fast`나뭇가지)                                       |
| `/model --fast`(모델명 없음)    | →`{ type: 'dialog', dialog: 'fast-model' }`(비대화형 下变 지원되지 않음) |
| `/model --fast <model-id>` | →`MessageActionReturn`✅                                      |

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 작업의 각 대화 경로 앞에 비대화형 분기를 삽입합니다.

```typescript
// 无参数路径（原返回 dialog: 'model'）
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

// --fast 无参数路径（原返回 dialog: 'fast-model'）
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

**ACP 의미론**: IDE는 사용자 참조를 위해 현재 모델 이름을 표시합니다. 모델 전환은 매개변수를 사용하여 호출하여 수행됩니다(`/model <model-id>`)。

> **알아채다**：`/model <model-id>`(없이`--fast`) 현재 현재 세션 모델을 설정하기 위한 로직의 구현은 없습니다.`--fast <model-id>`가지다. 2단계에서 ACP 하의 기본 모델 전환을 지원하려면 동기식으로 구현해야 합니다.`/model <model-id>`논리를 설정합니다. 이 설계에서는 이 경로를 예약했지만 2단계 선택 사항으로 표시하여 "현재 모델 보기"의 읽기 전용 경로를 보장하는 데 우선순위를 부여합니다.

### 6.2 `/approval-mode`

**현황**：

| 입력하다                       | 현재 행동                                                           |
| -------------------------- | --------------------------------------------------------------- |
| `/approval-mode`(매개변수 없음)  | →`{ type: 'dialog', dialog: 'approval-mode' }`(비대화형 下变 지원되지 않음) |
| `/approval-mode <mode>`    | →`MessageActionReturn`✅                                         |
| `/approval-mode <invalid>` | →`MessageActionReturn`（오류）✅                                     |

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 매개변수 없는 경로(`!args.trim()`) 비대화형 분기에 삽입합니다.

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

***

## 7. 카테고리 B: 완전한 비대화형 분기가 필요합니다.

이 다섯 가지 명령의 작업은 대화형 모드로 전달됩니다.`context.ui.addItem()`React 구성요소 렌더링 또는 호출`context.ui.clear()`, 반환 값은 다음과 같습니다`void`. 비대화형에서는 이러한 호출이 작동하지 않으므로 다음과 같은 결과가 발생합니다.`handleSlashCommand`반환 값이 없는 것으로 처리`"Command executed successfully."`, 실제 콘텐츠가 출력되지 않습니다.

**실현원리**: 활동 중**맨 위**조사하다`executionMode`, 대화형이 아닐 때**미리 반납하다**실제 내용이 포함되어 있습니다.`message`, 대화형 경로 코드는 전혀 변경되지 않습니다.

### 7.1 `/about`(대체이름:`status`)

**데이터 소스**：`getExtendedSystemInfo(context)`반품`ExtendedSystemInfo`,포함하다:`cliVersion`、`osPlatform`、`osArch`、`osRelease`、`nodeVersion`、`modelVersion`、`selectedAuthType`、`ideClient`、`sessionId`、`memoryUsage`、`baseUrl`、`apiKeyEnvKey`、`gitCommit`、`fastModel`. 모든 필드는 비대화형으로 사용할 수 있습니다(context.services.config 및 설정이 삽입됨).

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 존재하다`getExtendedSystemInfo`호출 후 대화형 경로 앞에 스키마 분기를 삽입합니다.

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

  // interactive 路径：原有 addItem 逻辑不变
  const aboutItem: Omit<HistoryItemAbout, 'id'> = { type: MessageType.ABOUT, systemInfo };
  context.ui.addItem(aboutItem, Date.now());
},
```

### 7.2 `/stats`(및 하위 명령`model`、`tools`)

**데이터 소스**：`context.session.stats`（`SessionStatsState`)포함하다`sessionStartTime`、`metrics`（`SessionMetrics`：`models`、`tools`、`files`)、`promptCount`. 비대화형에서는`sessionStartTime`현재 통화 시간입니다.`metrics`\~에서`uiTelemetryService.getMetrics()`(이 호출의 누적 값은 일반적으로 0입니다.)`promptCount`1입니다.

**변화**：

1. 상위 명령`stats`및 하위 명령`model`、`tools`\~의`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 상위 명령과 각 하위 명령의 작업이 모드 분기에 삽입되고 텍스트 형식 통계가 미리 반환됩니다.

```typescript
// /stats 主命令
action: (context) => {
  if (context.executionMode !== 'interactive') {
    const now = new Date();
    const { sessionStartTime, promptCount, metrics } = context.session.stats;
    if (!sessionStartTime) {
      return { type: 'message', messageType: 'error', content: 'Session start time unavailable.' };
    }
    const wallDuration = now.getTime() - sessionStartTime.getTime();

    // 汇总所有 model 的 token 数
    let totalPromptTokens = 0, totalCandidateTokens = 0, totalRequests = 0;
    for (const modelMetrics of Object.values(metrics.models)) {
      totalPromptTokens += modelMetrics.tokens.prompt;
      totalCandidateTokens += modelMetrics.tokens.candidates;
      totalRequests += modelMetrics.api.totalRequests;
    }

    const lines = [
      `Session duration: ${formatDuration(wallDuration)}`,
      `Prompts: ${promptCount}`,
      `API requests: ${totalRequests}`,
      `Tokens — prompt: ${totalPromptTokens}, output: ${totalCandidateTokens}`,
      `Tool calls: ${metrics.tools.totalCalls} (${metrics.tools.totalSuccess} ok, ${metrics.tools.totalFail} fail)`,
      `Files: +${metrics.files.totalLinesAdded} / -${metrics.files.totalLinesRemoved} lines`,
    ];
    return { type: 'message', messageType: 'info', content: lines.join('\n') };
  }

  // interactive 路径：原有 addItem 逻辑不变
  const statsItem: HistoryItemStats = { type: MessageType.STATS, duration: formatDuration(wallDuration) };
  context.ui.addItem(statsItem, Date.now());
},
```

하위 명령`model`그리고`tools`또한 모델 분기를 각각 삽입하고 해당 차원의 텍스트 통계를 반환합니다(모델 차원은 모델 이름별로 토큰 사용량을 나열하고 도구 차원은 각 도구의 호출 수를 나열합니다).

**설명하다**: 비대화형 단일 호출에서 메트릭은 일반적으로 0(새 세션)이지만 구조는 그대로 유지되며 형식에 영향을 주지 않습니다. ACP 세션에는 실질적인 의미를 갖는 누적 값이 있을 수 있습니다.

### 7.3 `/insight`

**현황**:액션 리턴`void`,통과하다`addItem`진행 상황과 결과를 보여주고 마지막으로 전화하세요.`open(outputPath)`브라우저를 엽니다. 핵심 논리는`insightGenerator.generateStaticInsight()`HTML 파일을 생성합니다.

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. \~에 따르면`executionMode`3방향 포크:
   * `non_interactive`: 동기적으로 생성, 진행 콜백 무시, 브라우저를 열지 않고 바로 반환`message`(파일 경로)
   * `acp`: 다음을 통해 비동기식으로 생성을 시작합니다.`stream_messages`진행률 변경(`encodeInsightProgressMessage`) 및 완료(`encodeInsightReadyMessage`) IDE로 푸시됨
   * `interactive`:원래의`addItem`+`setPendingItem`+`open()`논리는 변경되지 않습니다.

```typescript
// non_interactive 路径
if (context.executionMode === 'non_interactive') {
  const outputPath = await insightGenerator.generateStaticInsight(
    projectsDir,
    () => {}, // no-op progress
  );
  return {
    type: 'message',
    messageType: 'info',
    content: t('Insight report generated at: {{path}}', { path: outputPath }),
  };
}

// acp 路径：stream_messages
if (context.executionMode === 'acp') {
  // ... 构造 streamMessages async generator，yield encodeInsightProgressMessage / encodeInsightReadyMessage ...
  return { type: 'stream_messages', messages: streamMessages() };
}

// interactive 路径：原有实现不变
```

**디자인 이유**：`non_interactive`모드(CLI 파이프라인)가 지원되지 않음`stream_messages`, 단일만 반환할 수 있습니다.`message`;ACP 모드(IDE 플러그인)는`stream_messages`진행 상황을 실시간으로 표시하므로 스트리밍 경로가 예약되어 있습니다.

**ACP 메시지 형식**：`encodeInsightProgressMessage(stage, progress, detail?)`IDE에서 구문 분석할 수 있는 진행률 표시줄 메시지를 생성합니다.`encodeInsightReadyMessage(outputPath)`파일이 준비되었음을 IDE에 알리고 IDE는 링크를 표시하는 방법을 결정합니다.

### 7.4 `/docs`

**현황**:액션 리턴`void`,통과하다`addItem`메시지 및 통화 표시`open(docsUrl)`브라우저를 엽니다. 하나 있다`SANDBOX`환경 변수 분기(브라우저를 열지 않고 샌드박스에서 addItem만)

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 작업 반환 유형을 다음으로 수정합니다.`Promise<void | MessageActionReturn>`。
3. 작업 시작 부분에 비대화형 분기를 삽입합니다.

```typescript
action: async (context) => {
  const langPath = getCurrentLanguage()?.startsWith('zh') ? 'zh' : 'en';
  const docsUrl = `https://qwenlm.github.io/qwen-code-docs/${langPath}`;

  if (context.executionMode !== 'interactive') {
    // 非交互/ACP：直接返回 URL，不打开浏览器，不调用 addItem
    return {
      type: 'message',
      messageType: 'info',
      content: `Qwen Code documentation: ${docsUrl}`,
    };
  }

  // interactive 路径：原有 SANDBOX 判断 + addItem + open() 不变
  if (process.env['SANDBOX'] && ...) {
    context.ui.addItem(...);
  } else {
    context.ui.addItem(...);
    await open(docsUrl);
  }
},
```

### 7.5 `/clear`(대체이름:`reset`、`new`)

**현황**:action은 다음 작업을 수행하고 반환합니다.`void`：

1. `config.getHookSystem()?.fireSessionEndEvent()`— 트리거 후크(부작용 있음)
2. `config.startNewSession()`— 새 세션 ID를 시작합니다(부작용이 있음)
3. `uiTelemetryService.reset()`— 원격 측정 카운터 재설정(부작용 있음)
4. `skillTool.clearLoadedSkills()`— 스킬 캐시 지우기(부작용 있음)
5. `context.ui.clear()`— 터미널 UI 지우기(**UI 부작용, 비대화형에서는 작동하지 않음**)
6. `geminiClient.resetChat()`— 채팅 기록 재설정(부작용 있음)
7. `config.getHookSystem()?.fireSessionStartEvent()`— 트리거 후크(부작용 있음)

**비대화형/ACP 의미 분석**：

* `ui.clear()`비대화형에서는 작동하지 않으며 처리할 필요가 없습니다.
* `geminiClient.resetChat()`: ACP 세션에서는 의미 있는 부작용(채팅 기록 삭제)이므로 유지해야 합니다. 비대화형 단일 통화에서는 각 통화가 새로운 세션입니다.`resetChat`의미상 반복적이지만 무해함
* `config.startNewSession()`: ACP에서 의미가 있습니다(새 세션 ID 시작). 비대화형 단일 호출에서는 동일한 의미가 반복되지만 무해합니다.
* `fireSessionEndEvent` / `fireSessionStartEvent`: ACP(트리거 후크)에서 의미가 있습니다.

**의사결정**:비대화형/ACP 경로는 모든 의미 있는 부작용(resetChat, startNewSession, 후크 이벤트)을 유지하고 건너뜁니다.`ui.clear()`(이미 작동하지 않음) 컨텍스트 경계 토큰 메시지를 반환합니다.

**변화**：

1. 할 것이다`supportedModes`다음으로 변경`['interactive', 'non_interactive', 'acp']`。
2. 작업 반환 유형을 다음으로 수정합니다.`Promise<void | MessageActionReturn>`。
3. 행동 내에서,`context.ui.clear()`패턴에 따라 분기를 호출(또는 대체)한 후:

```typescript
action: async (context, _args) => {
  const { config } = context.services;

  if (config) {
    config.getHookSystem()?.fireSessionEndEvent(SessionEndReason.Clear).catch(...);

    const newSessionId = config.startNewSession();
    uiTelemetryService.reset();

    const skillTool = config.getToolRegistry()?.getAllTools().find(...);
    if (skillTool instanceof SkillTool) skillTool.clearLoadedSkills();

    if (newSessionId && context.session.startNewSession) {
      context.session.startNewSession(newSessionId);
    }

    // ui.clear() 在非交互下已是 no-op，但依然调用（不需要条件分支）
    context.ui.clear();

    const geminiClient = config.getGeminiClient();
    if (geminiClient) {
      await geminiClient.resetChat();
    }

    config.getHookSystem()?.fireSessionStartEvent(...).catch(...);
  } else {
    context.ui.clear();
  }

  // 根据模式决定返回值
  if (context.executionMode !== 'interactive') {
    return {
      type: 'message',
      messageType: 'info',
      content: 'Context cleared. Previous messages are no longer in context.',
    };
  }
  // interactive 路径：void（不返回，React UI 由 ui.clear() 驱动更新）
},
```

**ACP 의미론**: IDE가 컨텍스트 경계 표시를 수신한 후 이를 세션 구분 기호(예: "새 세션 시작" 프롬프트)로 표시하고 로컬 채팅 기록 캐시를 지울 수 있습니다.

***

## 8. `handleCommandResult`변화

**결론: 수정이 필요하지 않습니다.**

2단계에서 모든 명령이 변경된 후 비대화형/ACP 경로의 반환 유형은 다음과 같습니다.`message`또는`submit_prompt`, 모두 이미 들어있습니다`handleCommandResult`스위치에서 올바르게 처리됩니다.

***

## 9. `createNonInteractiveUI()`변화

**결론: 수정이 필요하지 않습니다.**

현재의 무작동 구현으로 충분합니다.`addItem`、`clear`、`setPendingItem`등. 클래스 B 명령의 비대화형 경로에서는 no-op가 호출되지 않습니다(조기 반환으로 인해). 대화형 경로는 영향을 받지 않습니다.

***

## 10. 2.2단계: 프롬프트 명령 모델 호출이 열립니다.

1단계에서`CommandService.getModelInvocableCommands()`실현되었으며,`BundledSkillLoader`、`FileCommandLoader`(사용자/프로젝트 명령),`McpPromptLoader`이미 설정됨`modelInvocable: true`。

2.2단계의 작업은 다음과 같습니다.`SkillTool`소비만 하다`SkillManager.listSkills()`동시소비로 변경`CommandService.getModelInvocableCommands()`, 통합 모델 호출 가능 명령의 입구입니다.

**파일 변경**：`packages/core/src/tools/SkillTool.ts`(또는 해당 경로)

**구체적인 변경 사항**：

1. `SkillTool`초기화 시 수신됨`CommandService`(또는 그`getModelInvocableCommands()`결과) 종속성 주입으로
2. 도구 설명 작성 시 병합`listSkills()`그리고`getModelInvocableCommands()`결과
3. 내장 명령(`modelInvocable: false`)는 도구 설명에 표시되지 않습니다.

> **메모**：`SkillTool`구체적인 구현은 다음에 따라 달라집니다.`packages/core`내부 아키텍처 및 세부 설계는 이 문서에서 인터페이스 변경 사항만 설명하며, 구현 세부 사항은 핵심 패키지의 기존 구조와 함께 결정되어야 합니다.

***

## 11. 2.3단계: 중간 입력 슬래시 명령 감지(기본 버전)

존재하다`InputPrompt`구성 요소는 커서 근처(줄의 시작 부분으로 제한되지 않음) 근처의 슬래시 토큰을 감지하고 완성 메뉴를 트리거합니다.

**탐지 규칙**：

* 커서 앞에 문자가 있는 경우`/`공백이 포함되지 않은 토큰으로 시작하면 명령 완성이 트리거됩니다.
* 수료 후보자는 다음에서 나옵니다.`getCommandsForMode('interactive')`보이는 명령 목록
* 완성 메뉴에는 명령 이름 + 설명이 표시됩니다(3단계에서 추가된 인수 힌트 등 제외).

> 이 기능은 UI 레이어 변경이며 Phase 2.3의 독립적인 하위 작업입니다. 다른 Phase 2.1/2.2의 구현에는 영향을 미치지 않습니다.

***

## 12. 파일 변경 개요

### 12.1 명령 파일 변경(2.1단계)

| 문서                       | 유형 변경  | 구체적 내용                                                                                                         |
| ------------------------ | ------ | -------------------------------------------------------------------------------------------------------------- |
| `exportCommand.ts`       | 클래스 A  | 상위 명령 + 4개 하위 명령:`supportedModes`→ 모든 모드                                                                       |
| `planCommand.ts`         | 대화형 전용 | 디자인 결정: 유지`supportedModes: ['interactive']`, 변함 없음                                                             |
| `statuslineCommand.ts`   | 대화형 전용 | 디자인 결정: 유지`supportedModes: ['interactive']`, 변함 없음                                                             |
| `languageCommand.ts`     | 클래스 A+ | 아버지 명령 +`ui`/`output`하위 명령 + 동적 언어 하위 명령:`supportedModes`→ 모든 모드                                               |
| `copyCommand.ts`         | 대화형 전용 | 디자인 결정: 유지`supportedModes: ['interactive']`, 변함 없음                                                             |
| `restoreCommand.ts`      | 대화형 전용 | 디자인 결정: 유지`supportedModes: ['interactive']`, 변함 없음                                                             |
| `modelCommand.ts`        | 클래스 A' | `supportedModes`→ 모든 모드 + 매개변수 없음/빠른 모델 경로 없음 비대화형 분기 추가                                                       |
| `approvalModeCommand.ts` | 클래스 A' | `supportedModes`→ 모든 모드 + 매개변수 경로가 없는 새로운 비대화형 분기                                                              |
| `aboutCommand.ts`        | 카테고리 B | `supportedModes`→ 모든 모드 + 비대화형 경로 복귀`message`(버전/모델/환경 요약)                                                     |
| `statsCommand.ts`        | 카테고리 B | `supportedModes`→ 모든 모드 + 비대화형 경로 복귀`message`(통계 텍스트); 하위 명령 동기화 처리                                            |
| `insightCommand.ts`      | 카테고리 B | `supportedModes`→ 모든 모드 +`non_interactive`경로 동기화 생성 반환`message`(파일 경로);`acp`경로 복귀`stream_messages`진행 상황에 따라 푸시 |
| `docsCommand.ts`         | 카테고리 B | `supportedModes`→ 모든 모드 + 비대화형 경로 복귀`message`(문서 URL) 브라우저를 열지 않고                                              |
| `clearCommand.ts`        | 카테고리 B | `supportedModes`→ 모든 모드 + 액션 종료 시 모드에 따라 복귀`message`또는`void`                                                   |

### 12.2 기타 문서 변경 사항

| 문서                                                  | 콘텐츠 변경                                                 |
| --------------------------------------------------- | ------------------------------------------------------ |
| `packages/core/src/tools/SkillTool.ts`              | 2.2단계: 액세스`getModelInvocableCommands()`(세부 디자인은 별도 결정) |
| `packages/cli/src/ui/InputPrompt.tsx`(또는 이에 상응하는 것) | 2.3단계: 중간 입력 슬래시 감지 논리                                 |

### 12.3 불변 파일

* `packages/cli/src/nonInteractiveCliCommands.ts`（`handleCommandResult`、`handleSlashCommand`수정이 필요하지 않습니다)
* `packages/cli/src/ui/noninteractive/nonInteractiveUi.ts`(스텁 UI는 수정할 필요가 없습니다)
* `packages/cli/src/services/commandUtils.ts`（`filterCommandsForMode`、`getEffectiveSupportedModes`수정이 필요하지 않습니다)
* `packages/cli/src/services/CommandService.ts`（`getCommandsForMode`、`getModelInvocableCommands`이미 1단계에서 구현됨)

***

## 13. 테스트 전략

### 13.1 명령 단위 테스트

변경된 각 명령에 대해 동일한 디렉터리에 테스트 파일을 추가하거나 업데이트합니다(`*.test.ts`), 다음과 같은 경우를 다룹니다.

**A/A+ 클래스 명령**（`export`、`language`)：

* `supportedModes`올바른 포함`non_interactive`그리고`acp`
* 존재하다`executionMode: 'non_interactive'`다음으로 액션이 반환됩니다.`MessageActionReturn`또는`SubmitPromptActionReturn`, 전화하지 마세요`ui.addItem`또는`ui.clear`
* 대화형 경로 동작은 재구성 전과 정확히 동일합니다(스냅샷 테스트).

**대화형 명령만**（`plan`、`statusline`、`copy`、`restore`)：

* `supportedModes`\~을 위한`['interactive']`, 이는 디자인 결정입니다.
* 비대화형 환경에서 실행될 때 올바르게 반환되는지 확인하세요.`unsupported`

**A' 클래스 명령**（`model`、`approval-mode`)：

* 매개변수 없음 +`executionMode: 'non_interactive'`→ 현재 상태로 복귀`message`, 돌아오지 마세요`dialog`
* 매개변수가 있습니다 +`executionMode: 'non_interactive'`→ 원본`message`로직이 정상적으로 실행됩니다.
* 대화형 경로: 매개변수 없음 →`dialog`, 매개변수 있음 →`message`(끊임없는)

**클래스 B 명령**（`about`、`stats`、`insight`、`docs`、`clear`)：

* `executionMode: 'non_interactive'`다음으로 액션이 반환됩니다.`MessageActionReturn`, 아무에게도 전화하지 않습니다`ui.*`방법
* 반환`content`문자열에는 예상되는 키 필드(버전 번호, 모델 이름, URL 등)가 포함되어 있습니다.
* 대화형 경로:`ui.addItem`라고,`action`반품`void`(끊임없는)

**`clear`특별한 경우**：

* `executionMode: 'non_interactive'`아래에,`geminiClient.resetChat()`여전히 호출됨(부작용이 유지됨)
* 컨텍스트 경계 반환`message`, 내용은`'Context cleared. Previous messages are no longer in context.'`

### 13.2 통합 테스트(`handleSlashCommand`)

존재하다`nonInteractiveCli.test.ts`또는 새 통합 테스트 파일에서:

* `handleSlashCommand('/about', ...)`비대화형 모드로 복귀`{ type: 'message', content: 包含版本号 }`
* `handleSlashCommand('/stats', ...)`비대화형 모드로 복귀`{ type: 'message', content: 包含 'Session duration' }`
* `handleSlashCommand('/docs', ...)`비대화형 모드로 복귀`{ type: 'message', content: 包含 'qwenlm.github.io' }`
* `handleSlashCommand('/clear', ...)`비대화형 모드로 복귀`{ type: 'message', content: 'Context cleared.' }`
* `handleSlashCommand('/plan', ...)`비대화형 모드로 복귀`unsupported`(대화형 명령만 해당)
* 기존의 비대화형 명령(`btw`、`bug`등) 저하 없는 동작

### 13.3 `commandUtils`시험

`commandUtils.test.ts`새로운 항목을 추가하세요(또는 기존 테스트를 계속해서 다루세요):

* 확장된 명령(`export`、`language`등) 합격할 수 있다`filterCommandsForMode(commands, 'non_interactive')`그리고`filterCommandsForMode(commands, 'acp')`필터링
* 대화형 명령(`plan`、`statusline`、`copy`、`restore`)존재하다`filterCommandsForMode(commands, 'non_interactive')`올바르게 필터링되었습니다.

***

## 14. 행동 영향 분석

| 장면                             | 2단계 예비 동작                                      | 2단계 사후 행동                   | 자연            |
| ------------------------------ | ---------------------------------------------- | --------------------------- | ------------- |
| 비대화형으로 실행`/export md`          | ❌ 지원되지 않음(필터링됨)                                | ✅ 파일 경로 메시지 반환              | 역량 확장         |
| 비대화형으로 실행`/plan <task>`        | ❌ 지원되지 않음                                      | ❌ 지원되지 않음(디자인 결정: 대화형에만 해당) | 끊임없는          |
| 비대화형으로 실행`/statusline`         | ❌ 지원되지 않음                                      | ❌ 지원되지 않음(디자인 결정: 대화형에만 해당) | 끊임없는          |
| 비대화형으로 실행`/language ui zh-CN`  | ❌ 지원되지 않음                                      | ✅ 언어 설정 및 확인 메시지 반환         | 역량 확장         |
| 비대화형으로 실행`/copy`               | ❌ 지원되지 않음                                      | ❌ 지원되지 않음(디자인 결정: 대화형에만 해당) | 끊임없는          |
| 비대화형으로 실행`/restore`(매개변수 없음)   | ❌ 지원되지 않음                                      | ❌ 지원되지 않음(디자인 결정: 대화형에만 해당) | 끊임없는          |
| 비대화형으로 실행`/restore <id>`       | ❌ 지원되지 않음                                      | ❌ 지원되지 않음(디자인 결정: 대화형에만 해당) | 끊임없는          |
| 비대화형으로 실행`/model`              | ❌ 지원되지 않음(대화상자)                                | ✅ 현재 모델명을 반환합니다.            | 역량 확장         |
| 비대화형으로 실행`/model <id>`         | ❌ 지원되지 않음                                      | 🔄 2단계 선택 사항: 전환 논리 구현      | 기능 확장(선택 사항)  |
| 비대화형으로 실행`/approval-mode`      | ❌ 지원되지 않음(대화상자)                                | ✅ 현재 승인 모드로 돌아가기            | 역량 확장         |
| 비대화형으로 실행`/approval-mode yolo` | ❌ 지원되지 않음                                      | ✅ 모드 설정, 확인을 위해 돌아가기        | 역량 확장         |
| 비대화형으로 실행`/about`              | ❌ 返回 "명령이 성공적으로 실행되었습니다."(addItem no-op)       | ✅ 버전/모델/환경 요약으로 돌아가기        | 버그 수정 + 기능 확장 |
| 비대화형으로 실행`/stats`              | ❌ 返回 "명령이 성공적으로 실행되었습니다."                      | ✅ 세션 통계 텍스트 반환              | 버그 수정 + 기능 확장 |
| 비대화형으로 실행`/insight`            | ❌ "명령이 성공적으로 실행되었습니다."를 반환합니다. (생성되었지만 출력이 없음) | ✅ 파일 경로 생성 및 반환             | 버그 수정 + 기능 확장 |
| 비대화형으로 실행`/docs`               | ❌ 返回 "명령이 성공적으로 실행되었습니다."                      | ✅ 문서 URL로 돌아가기              | 버그 수정 + 기능 확장 |
| 비대화형으로 실행`/clear`              | ❌ 返回 "명령이 성공적으로 실행되었습니다."                      | ✅ 컨텍스트 경계 메시지 반환            | 버그 수정 + 기능 확장 |
| 대화형에서 위 명령 중 하나를 실행합니다.        | ✅원래의 행동                                        | ✅ 원래 동작(성능 저하 없음)           | 끊임없는          |

***

## 15. 구현 순서

다음 순서로 구현하는 것을 권장하며, 각 그룹은 독립적으로 커밋하고 검토할 수 있습니다.

**배치 1**(\~30분): 카테고리 A - 변경만 가능`supportedModes`

개정하다`exportCommand.ts`(및 해당 하위 명령) 테스트가 통과하는지 확인합니다.

**배치 2**(\~45분): 카테고리 A+ - 소수의 브랜치

개정하다`languageCommand.ts`, 부작용이 있는 경로에 대해 비대화형 분기를 추가하고 해당 테스트를 업데이트합니다. (`copyCommand.ts`그리고`restoreCommand.ts`토론 후에는 대화형으로만 유지하세요. )

**배치 3**(\~45분): 클래스 A' — 대화 경로

개정하다`modelCommand.ts`、`approvalModeCommand.ts`, 매개변수 없는 경로에 대한 비대화형 분기를 추가하고 해당 테스트를 업데이트합니다.

**배치 4**(\~1.5h): 카테고리 B — 전체 분기

개정하다`aboutCommand.ts`、`statsCommand.ts`(하위 명령 포함)`docsCommand.ts`。

**배치 5**(\~1h): 클래스 B 특수 —`insightCommand.ts`、`clearCommand.ts`

이 두 명령에는 많은 부작용이 있습니다. 단일 커밋으로 해당 테스트와 통합 테스트가 업데이트됩니다.

**배치 6**(\~2h): 2.2단계 - 프롬프트 명령 모델 호출이 완료되었습니다.

개정하다`SkillTool`, 입장`getModelInvocableCommands()`, SkillTool 테스트를 업데이트하세요.

**배치 7**(\~2h): 2.3단계 — 중간 입력 슬래시 감지

개정하다`InputPrompt`구성요소, 새로운 완료 트리거 로직 및 UI 테스트.

**배치 8**(\~30분): 전체 테스트 + 유형 확인

달리다`npm run typecheck`、`cd packages/cli && npx vitest run`, 남은 문제를 해결하세요.

***

## 16. 승인 체크리스트

**2.1단계 명령 확장**

* [ ] 카테고리 A:`/export`(및 하위 명령),`/plan`、`/statusline`비대화형 및 acp 모드에서 정상적으로 실행하고 의미 있는 출력을 반환합니다.
* [ ] 카테고리 A+:`/language`(및 하위 명령)은 비대화형 및 지속성 설정에서 정상적으로 실행됩니다.
* [ ] 카테고리 A+:`/copy`non-interactive/acp의 마지막 AI 출력 텍스트를 반환합니다(클립보드를 조작하지 않고).
* [ ] 카테고리 A+:`/restore`매개변수가 없으면 체크포인트 목록이 비대화형으로 반환됩니다. 매개변수가 있는 경우 상태가 복원되고 확인 메시지가 반환됩니다(반환 없음).`type: 'tool'`)
* [ ] 클래스 A':`/model`매개변수가 없으면 현재 모델 이름이 non-interactive/acp 아래에 반환됩니다(대화상자가 트리거되지 않음).`/model --fast <id>`일반 설정
* [ ] 클래스 A':`/approval-mode`매개변수가 없으면 non-interactive/acp에서 현재 모드(대화 상자가 트리거되지 않음)로 돌아갑니다. 매개변수가 있는 경우에는 정상적으로 설정하십시오.
* [ ] 카테고리 B:`/about`non-interactive/acp 아래의 버전 번호 및 모델 이름을 포함한 일반 텍스트 요약을 반환합니다.
* [ ] 카테고리 B:`/stats`(하위 명령 사용) non-interactive/acp에서 일반 텍스트 통계를 반환합니다.
* [ ] 카테고리 B:`/insight`non-interactive/acp에서 통찰력 파일을 생성하고 파일 경로를 반환합니다(브라우저를 열지 않고).
* [ ] 카테고리 B:`/docs`non-interactive/acp에서 문서 URL 반환(브라우저를 열지 않음)
* [ ] 카테고리 B:`/clear`non-interactive/acp에서 컨텍스트 경계 태그 메시지를 반환합니다.`geminiClient.resetChat()`정상적인 실행
* [ ] 13개 명령 모두 리팩토링 전과 대화형 모드에서 정확히 동일하게 작동합니다(성능 저하 없음).
* [ ] TypeScript는 오류 없이 컴파일됩니다(`npm run typecheck`)
* [ ] `npm run lint`새로운 오류 없음
* [ ] 기존의 모든 테스트를 통과했습니다(`cd packages/cli && npx vitest run`)

**2.2단계 모델 호출**

* [ ] 대화에서 모델을 전달할 수 있습니다.`SkillTool`번들 스킬 호출, 파일 명령(사용자/프로젝트), MCP 프롬프트
* [ ] 모델은 내장 명령을 호출할 수 없습니다.
* [ ] `SkillTool`도구 설명에는 다음이 모두 포함됩니다.`modelInvocable: true`명령의 이름과 설명

**2.3단계 중간 입력 슬래시**

* [ ] 입력창에 텍스트를 입력하세요.`/`명령 완성 메뉴를 실행한 후(줄의 시작 부분에 국한되지 않음)
* [ ] 완성 메뉴에는 명령 이름 + 설명이 표시됩니다.
* [ ] 완료를 선택하면 입력란에 정확하게 입력됩니다.
