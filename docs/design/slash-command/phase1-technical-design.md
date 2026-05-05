# 1단계 기술 설계 문서: 인프라 재구성

## 1. 설계 목표 및 제약

### 1.1 목표

* 소스(source), 실행 유형(commandType), 모드 기능(supportedModes) 및 가시성(userInvocable/modelInvocable)의 4가지 차원을 포괄하는 통합 명령 메타데이터 모델을 설정합니다.
* 비대화형/acp의 하드코딩된 화이트리스트를 기능 기반 필터링으로 대체
* 2/3단계 기능 확장을 위한 안정적인 기본 인터페이스 제공

### 1.2 하드 제약

* **행동 변화 없음**: 비대화형 및 acp 모드에서 사용 가능한 기존 명령 세트는 변경되지 않습니다. (예외: 잘못 가로채는 MCP\_PROMPT 수정, 버그 수정)
* **이전 버전과 호환 가능**：`SlashCommand`인터페이스의 모든 새 필드는 선택 사항이거나 합리적인 기본값을 갖습니다. 기존 명령 코드를 즉시 수정할 필요는 없습니다.
* **새로운 실행자가 추가되지 않았습니다.**: ModeAdapter/CommandExecutor와 같은 새로운 실행 구조를 생성하지 않고 기존 CommandService 및 필터링 로직만 확장합니다.
* **기존 명령 기능을 변경하지 않습니다.**: 명령에 로컬 하위 명령을 추가하지 말고 명령의 작업 구현을 수정하지 마십시오.

***

## 2. 새로운 유형 정의 추가

### 2.1 파일 위치

모든 새로운 유형은 다음에 정의되어 있습니다.`packages/cli/src/ui/commands/types.ts`, 그리고 기존`SlashCommand`인터페이스 파일.

### 2.2 `ExecutionMode`

```typescript
/**
 * 运行模式枚举。
 * - interactive：React/Ink UI 模式（终端交互）
 * - non_interactive：无交互 CLI 模式（文本/JSON 输出）
 * - acp：ACP/Zed 集成模式
 */
export type ExecutionMode = 'interactive' | 'non_interactive' | 'acp';
```

### 2.3 `CommandSource`

```typescript
/**
 * 命令来源枚举，用于 Help 分组、补全 badge、ACP available commands。
 *
 * 与 CommandKind 的区别：
 * - CommandKind 是内部加载器分类（4 种），影响加载逻辑
 * - CommandSource 是面向用户的来源分类（9 种），影响展示和心智模型
 *
 * 两者可能重叠，但职责不同，不合并。
 */
export type CommandSource =
  | 'builtin-command' // 内置命令（BuiltinCommandLoader）
  | 'bundled-skill' // 随包分发的 skill（BundledSkillLoader）
  | 'skill-dir-command' // 用户/项目 .qwen/commands/ 下的文件命令（FileCommandLoader，非插件）
  | 'plugin-command' // 插件提供的命令（FileCommandLoader，extensionName 不为空）
  | 'mcp-prompt'; // MCP server 提供的 prompt（McpPromptLoader）
// 以下来源预留，Phase 1 不实现对应 Loader，但 schema 先定义：
// | 'workflow-command'
// | 'plugin-skill'
// | 'dynamic-skill'
// | 'builtin-plugin-skill'
// | 'mcp-skill'
```

### 2.4 `CommandType`

```typescript
/**
 * 命令执行类型，描述命令"怎么执行"。
 *
 * - prompt：产生 submit_prompt，将内容提交给模型。适用于 skill、file command、MCP prompt。
 *   默认 supportedModes 为所有模式，默认 modelInvocable 为 true。
 *
 * - local：在本地执行逻辑，不依赖 React/Ink UI。可返回 message、stream_messages、
 *   submit_prompt、tool 等类型。适用于查询类、配置类、状态类 built-in 命令。
 *   默认 supportedModes 为 ['interactive']，需显式声明 supportedModes 才能开放给其他模式。
 *   这与 Claude Code 的 supportsNonInteractive: true 语义一致——非交互支持需要显式声明，而非自动推断。
 *
 * - local-jsx：依赖 React/Ink UI 的命令（打开 dialog、渲染 JSX 组件等）。
 *   默认 supportedModes 仅为 ['interactive']。
 */
export type CommandType = 'prompt' | 'local' | 'local-jsx';
```

### 2.5 확장`SlashCommand`인터페이스

기존 인터페이스에 새 필드를 추가합니다.**모두 선택 사항입니다.**&#xC774;전 버전과의 호환성을 보장하려면:

```typescript
export interface SlashCommand {
  // ── 现有字段（保持不变） ──────────────────────────────────────────────
  name: string;
  altNames?: string[];
  description: string;
  hidden?: boolean;
  completionPriority?: number;
  kind: CommandKind;
  extensionName?: string;
  action?: (...) => ...;
  completion?: (...) => ...;
  subCommands?: SlashCommand[];

  // ── Phase 1 新增：来源与执行类型 ──────────────────────────────────────
  /**
   * 命令来源，用于 Help 分组、补全 badge、ACP available commands 展示。
   * 由各 Loader 填充，不由命令自身声明。
   * 未来废弃 CommandKind 时，source 将成为唯一来源标识。
   */
  source?: CommandSource;

  /**
   * 展示用的来源标签，面向用户。
   * - builtin-command → "Built-in"
   * - bundled-skill → "Skill"
   * - skill-dir-command → "Custom"
   * - plugin-command → "Plugin: <extensionName>"
   * - mcp-prompt → "MCP: <serverName>"
   * 由各 Loader 填充，可被命令自身覆盖。
   */
  sourceLabel?: string;

  /**
   * 命令执行类型。
   * - 由各 Loader 填充默认值（prompt/local-jsx）
   * - built-in 命令由各命令文件自身声明（local 或 local-jsx）
   * 未声明时的默认策略见 getEffectiveCommandType()。
   */
  commandType?: CommandType;

  // ── Phase 1 新增：模式能力 ──────────────────────────────────────────
  /**
   * 此命令在哪些运行模式下可用。
   * 未声明时根据 commandType 推断默认值（见 getEffectiveSupportedModes()）。
   * 显式声明优先于推断值。
   */
  supportedModes?: ExecutionMode[];

  // ── Phase 1 新增：可见性 ──────────────────────────────────────────────
  /**
   * 用户是否可通过 slash command 调用此命令。
   * 默认 true（几乎所有命令都是 userInvocable）。
   */
  userInvocable?: boolean;

  /**
   * 模型是否可通过 tool call 调用此命令。
   * 默认 false。prompt 类型的命令（skill、file command、MCP prompt）应设为 true。
   * built-in commands 不允许模型调用（始终为 false）。
   */
  modelInvocable?: boolean;

  // ── Phase 3 预留：体验元数据（Phase 1 仅定义，不使用）──────────────────
  /**
   * 参数提示，显示在补全菜单命令名后。
   * 示例："<model-id>" / "show|list|set <id>" / "[--fast] [<model-id>]"
   */
  argumentHint?: string;

  /**
   * 供模型理解何时调用此命令的说明。
   * 将被注入 modelInvocable 命令的 description 中。
   */
  whenToUse?: string;

  /**
   * 使用示例，供 Help 目录和补全展示。
   */
  examples?: string[];
}
```

***

## 3. 로더별 현장 충진 사양

### 3.1 충전 원리

* `source`그리고`sourceLabel`로더에 의해 구축됨`SlashCommand`명령 자체가 선언되지 않은 경우 채워집니다.
* `commandType`: 로더는 기본값으로 채워집니다. 내장 명령은 명령 파일 자체에 의해 선언됩니다.
* `supportedModes`:통과하다`getEffectiveSupportedModes()`추론됨, 명시적 패딩이 필요하지 않음(기본값 재정의가 필요하지 않은 경우)
* `modelInvocable`:로더 채우기, 내장 명령은 항상`false`, 프롬프트 유형 명령은 다음과 같습니다.`true`

### 3.2 `BuiltinCommandLoader`

```typescript
// 不填充 source/sourceLabel/commandType — 由各命令文件自声明
// 因为 built-in 命令的 commandType 是 local 或 local-jsx，需要逐个标注

// 注入 source 和 sourceLabel：
for (const cmd of rawCommands) {
  enrichedCommands.push({
    ...cmd,
    source: 'builtin-command',
    sourceLabel: 'Built-in',
    userInvocable: cmd.userInvocable ?? true,
    modelInvocable: false, // built-in 命令不允许模型调用
  });
}
```

### 3.3 `BundledSkillLoader`

```typescript
return skills.map((skill) => ({
  name: skill.name,
  description: skill.description,
  kind: CommandKind.SKILL,
  source: 'bundled-skill' as CommandSource,
  sourceLabel: 'Skill',
  commandType: 'prompt' as CommandType,
  userInvocable: true,
  modelInvocable: true,
  action: async (...) => { ... },
}));
```

### 3.4 `FileCommandLoader`

```typescript
// 在 createSlashCommandFromDefinition 中：
return {
  name: baseCommandName,
  description,
  kind: CommandKind.FILE,
  extensionName,
  // source 根据 extensionName 决定：
  source: extensionName ? 'plugin-command' : 'skill-dir-command',
  sourceLabel: extensionName ? `Plugin: ${extensionName}` : 'Custom',
  commandType: 'prompt',
  userInvocable: true,
  modelInvocable: !extensionName, // 插件命令暂不允许模型调用，用户/项目命令允许
  action: async (...) => { ... },
};
```

> **메모**: 플러그인 명령(plugin-command)은 다음과 같이 표시되지 않습니다.`modelInvocable`, 안전 위험을 방지하기 위해. 후속 단계는 요청 시 열릴 수 있으며 구성을 통해 사용자가 제어할 수 있습니다.

### 3.5 `McpPromptLoader`

```typescript
const newPromptCommand: SlashCommand = {
  name: commandName,
  description: prompt.description || `Invoke prompt ${prompt.name}`,
  kind: CommandKind.MCP_PROMPT,
  source: 'mcp-prompt',
  sourceLabel: `MCP: ${serverName}`,
  commandType: 'prompt',
  userInvocable: true,
  modelInvocable: true,
  // ... 其余现有字段
};
```

***

## 4. 내장 명령`commandType`선언 사양

### 4.1 분류기준

| 명령 유형       | 판정기준                                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local`     | 행동은 단지 사용`ui.addItem`(텍스트 유형), 반환`message` / `stream_messages` / `submit_prompt` / `tool`, React 구성 요소 렌더링에 의존하지 않습니다.                                     |
| `local-jsx` | 액션 리턴`dialog`, 또는 실제로 호출됨`ui.addItem`JSX를 포함하는 복합 유형(예:`HistoryItemHelp`、`HistoryItemStats`) 또는 다음 사항에 따라 달라집니다.`confirm_action` / `load_history` / `quit` |

> **알아채다**：`ui.addItem(message/error/info 类型)`예`local`;`ui.addItem(help/stats/tools/about 等复杂 UI 类型)`예`local-jsx`。

### 4.2 내장 명령어 분류표

**`local`친절한**(성명`commandType: 'local'`,`supportedModes`모든 모드에 대해 추론됨):

| 명령 파일                | 명령 이름      | 설명하다                                                |
| -------------------- | ---------- | --------------------------------------------------- |
| `btwCommand.ts`      | `btw`      | 반품`submit_prompt`또는`stream_messages`                |
| `bugCommand.ts`      | `bug`      | 반품`submit_prompt`또는`stream_messages`                |
| `compressCommand.ts` | `compress` | ExecutionMode가 조정되었습니다. 반환`message`/`submit_prompt` |
| `contextCommand.ts`  | `context`  | 반품`message`(UI 렌더링이 포함되어 있지만 텍스트는 대체될 수 있습니다)       |
| `exportCommand.ts`   | `export`   | 파일 I/O, 반환`message`                                 |
| `initCommand.ts`     | `init`     | 반품`submit_prompt`/`message`/`confirm_action`        |
| `memoryCommand.ts`   | `memory`   | 하위 명령 반환`message`(파일 I/O)                           |
| `planCommand.ts`     | `plan`     | 반품`submit_prompt`                                   |
| `summaryCommand.ts`  | `summary`  | ExecutionMode가 조정되었습니다. 반환`submit_prompt`/`message` |
| `insightCommand.ts`  | `insight`  | 반품`stream_messages`                                 |

> **알아채다**：`contextCommand`그리고`insightCommand`현재 복귀하고 있지만`addItem`호출하지만 그 본질은 텍스트 내용이며 다음에 속합니다.`local`。

**`local-jsx`친절한**(성명`commandType: 'local-jsx'`,`supportedModes`다음과 같이 추론됨`['interactive']`)：

| 명령 파일                     | 명령 이름            | 머리가 없을 수 없는 이유                            |
| ------------------------- | ---------------- | ----------------------------------------- |
| `aboutCommand.ts`         | `about`          | `addItem(HistoryItemAbout)`— 복잡한 UI 구성 요소 |
| `agentsCommand.ts`        | `agents`         | `dialog: subagent_create/subagent_list`   |
| `approvalModeCommand.ts`  | `approval-mode`  | `dialog: approval-mode`                   |
| `arenaCommand.ts`         | `arena`          | `dialog: arena_*`                         |
| `authCommand.ts`          | `auth`           | `dialog: auth`                            |
| `clearCommand.ts`         | `clear`          | `ui.clear()`단말기를 직접 운영                    |
| `copyCommand.ts`          | `copy`           | 클립보드 작업, 헤드리스 경로 없음                       |
| `directoryCommand.tsx`    | `directory`      | JSX 구성 요소                                 |
| `docsCommand.ts`          | `docs`           | 브라우저 열기                                   |
| `editorCommand.ts`        | `editor`         | `dialog: editor`                          |
| `extensionsCommand.ts`    | `extensions`     | `dialog: extensions_manage`               |
| `helpCommand.ts`          | `help`           | `addItem(HistoryItemHelp)`— 복잡한 도움말 UI    |
| `hooksCommand.ts`         | `hooks`          | `dialog: hooks`                           |
| `ideCommand.ts`           | `ide`            | IDE 프로세스 감지 및 상호 작용                       |
| `languageCommand.ts`      | `language`       | `dialog`+`reloadCommands`                 |
| `mcpCommand.ts`           | `mcp`            | `dialog: mcp`                             |
| `modelCommand.ts`         | `model`          | `dialog: model/fast-model`                |
| `permissionsCommand.ts`   | `permissions`    | `dialog: permissions`                     |
| `quitCommand.ts`          | `quit`           | `quit`결과 유형                               |
| `restoreCommand.ts`       | `restore`        | `load_history`결과 유형                       |
| `resumeCommand.ts`        | `resume`         | `dialog: resume`                          |
| `settingsCommand.ts`      | `settings`       | `dialog: settings`                        |
| `setupGithubCommand.ts`   | `setup-github`   | `confirm_shell_commands`+ 대화형 작업          |
| `skillsCommand.ts`        | `skills`         | `addItem(HistoryItemSkillsList)`— 복잡한 UI  |
| `statsCommand.ts`         | `stats`          | `addItem(HistoryItemStats)`— 복잡한 UI       |
| `statuslineCommand.ts`    | `statusline`     | UI 상태 구성                                  |
| `terminalSetupCommand.ts` | `terminal-setup` | 터미널 구성 마법사                                |
| `themeCommand.ts`         | `theme`          | `dialog: theme`                           |
| `toolsCommand.ts`         | `tools`          | `addItem(HistoryItemTools)`— 복잡한 UI       |
| `trustCommand.ts`         | `trust`          | `dialog: trust`                           |
| `vimCommand.ts`           | `vim`            | `toggleVimEnabled()`— UI 상태               |

***

## 5. `getEffectiveSupportedModes`추론 규칙

이 기능은 1단계의 핵심 로직입니다. 원래의 화이트리스트를 대체하며`filterCommandsForMode`부르다.

```typescript
/**
 * 获取命令的实际支持模式列表。
 *
 * 推断优先级（从高到低）：
 * 1. 命令显式声明的 supportedModes（最高优先级）
 * 2. 基于 commandType 的推断
 * 3. 基于 CommandKind 的兜底（向后兼容）
 */
export function getEffectiveSupportedModes(cmd: SlashCommand): ExecutionMode[] {
  // 优先级 1：显式声明
  if (cmd.supportedModes !== undefined) {
    return cmd.supportedModes;
  }

  // 优先级 2：基于 commandType 推断
  if (cmd.commandType !== undefined) {
    switch (cmd.commandType) {
      case 'prompt':
        // prompt 类型无 UI 依赖，天然全模式可用
        return ['interactive', 'non_interactive', 'acp'];
      case 'local':
        // local 类型保守默认：仅 interactive。
        // 需要非交互支持的命令须显式声明 supportedModes（对应 Claude Code 的 supportsNonInteractive: true）。
        // Phase 2 中逐个验证并解锁，防止未适配的命令意外暴露给 headless 调用者。
        return ['interactive'];
      case 'local-jsx':
        return ['interactive'];
    }
  }

  // 优先级 3：兜底（基于 CommandKind，向后兼容旧代码）
  switch (cmd.kind) {
    case CommandKind.BUILT_IN:
      // built-in 命令未声明 commandType 时保守默认（interactive only）
      // 这个分支在 Phase 1 完成后应不再被命中（所有 built-in 都有 commandType）
      return ['interactive'];
    case CommandKind.FILE:
    case CommandKind.SKILL:
    case CommandKind.MCP_PROMPT:
      // 这三类命令的 action 天然无 UI 依赖，历史行为也是全模式可用
      return ['interactive', 'non_interactive', 'acp'];
    default:
      return ['interactive'];
  }
}
```

```typescript
/**
 * 根据 supportedModes 过滤适合当前模式的命令。
 * 替代原 filterCommandsForNonInteractive 函数。
 */
export function filterCommandsForMode(
  commands: readonly SlashCommand[],
  mode: ExecutionMode,
): SlashCommand[] {
  return commands.filter((cmd) =>
    getEffectiveSupportedModes(cmd).includes(mode),
  );
}
```

***

## 6. `CommandService`인터페이스 확장

존재하다`packages/cli/src/services/CommandService.ts`두 가지 새로운 방법이 추가되었습니다:

```typescript
export class CommandService {
  // ── 现有方法（保持不变）────────────────────────────────────────────────
  getCommands(): readonly SlashCommand[] {
    return this.commands;
  }

  // ── Phase 1 新增方法 ──────────────────────────────────────────────────

  /**
   * 返回在指定执行模式下可用的命令列表。
   * 替代原有白名单 + filterCommandsForNonInteractive 的组合。
   *
   * @param mode 目标运行模式
   * @returns 适合该模式的命令列表（不含 hidden 命令）
   */
  getCommandsForMode(mode: ExecutionMode): readonly SlashCommand[] {
    return this.commands.filter((cmd) => {
      if (cmd.hidden) return false;
      return getEffectiveSupportedModes(cmd).includes(mode);
    });
  }

  /**
   * 返回所有 modelInvocable 为 true 的命令。
   * Phase 2 中 SkillTool 将消费此方法；Phase 1 仅提供接口。
   *
   * @returns 模型可调用的命令列表
   */
  getModelInvocableCommands(): readonly SlashCommand[] {
    return this.commands.filter(
      (cmd) => !cmd.hidden && cmd.modelInvocable === true,
    );
  }
}
```

> **알아채다**：`getEffectiveSupportedModes`그리고`filterCommandsForMode`다음과 같이 사용해야합니다.`CommandService`내부적으로 사용되거나 독립형으로 추출된 유틸리티 기능`packages/cli/src/services/commandUtils.ts`테스트 및 재사용을 위해 파일을 만들고 내보냅니다.

***

## 7. `nonInteractiveCliCommands.ts`리팩터링

### 7.1 콘텐츠 삭제

```typescript
// ❌ 删除
export const ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE = [
  'init', 'summary', 'compress', 'btw', 'bug', 'context',
] as const;

// ❌ 删除
function filterCommandsForNonInteractive(
  commands: readonly SlashCommand[],
  allowedBuiltinCommandNames: Set<string>,
): SlashCommand[] { ... }
```

### 7.2 새로운 콘텐츠

```typescript
// ✅ 新增（或从 commandUtils 导入）
import { filterCommandsForMode } from '../services/commandUtils.js';
```

### 7.3 `handleSlashCommand`함수 시그니처 변경

```typescript
// ❌ 旧签名
export const handleSlashCommand = async (
  rawQuery: string,
  abortController: AbortController,
  config: Config,
  settings: LoadedSettings,
  allowedBuiltinCommandNames: string[] = [...ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE],
): Promise<NonInteractiveSlashCommandResult>

// ✅ 新签名（移除 allowedBuiltinCommandNames）
export const handleSlashCommand = async (
  rawQuery: string,
  abortController: AbortController,
  config: Config,
  settings: LoadedSettings,
): Promise<NonInteractiveSlashCommandResult>
```

### 7.4 내부 구현 변경

```typescript
// 旧：
const filteredCommands = filterCommandsForNonInteractive(
  allCommands,
  allowedBuiltinSet,
);

// 新：
const executionMode = isAcpMode ? 'acp' : 'non_interactive';
const filteredCommands = filterCommandsForMode(allCommands, executionMode);
```

### 7.5 `getAvailableCommands`함수 시그니처 변경

```typescript
// ❌ 旧签名
export const getAvailableCommands = async (
  config: Config,
  abortSignal: AbortSignal,
  allowedBuiltinCommandNames: string[] = [...ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE],
): Promise<SlashCommand[]>

// ✅ 新签名
export const getAvailableCommands = async (
  config: Config,
  abortSignal: AbortSignal,
  mode: ExecutionMode = 'acp',
): Promise<SlashCommand[]>
```

> 새로운`mode`매개변수는 원래 화이트리스트 매개변수를 대체하며 ACP 세션을 호출할 때 명시적으로 지정할 수 있습니다.`'acp'`, 호출 시 비대화형이 지정됩니다.`'non_interactive'`。

***

## 8. `Session.ts`(ACP) 통화 변경

```typescript
// ❌ 旧调用
const slashCommandResult = await handleSlashCommand(
  inputText,
  abortController,
  this.config,
  this.settings,
  // 不传，使用默认白名单
);

// ✅ 新调用（无变化，移除了不再存在的默认参数）
const slashCommandResult = await handleSlashCommand(
  inputText,
  abortController,
  this.config,
  this.settings,
);

// ─────────────────────────────────────────

// ❌ 旧调用
const slashCommands = await getAvailableCommands(
  this.config,
  abortController.signal,
);

// ✅ 新调用（明确指定 mode）
const slashCommands = await getAvailableCommands(
  this.config,
  abortController.signal,
  'acp',
);
```

***

## 9. 파일 변경 개요

### 9.1 수정된 파일

| 문서                                                                      | 콘텐츠 수정                                                                                    |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `packages/cli/src/ui/commands/types.ts`                                 | 새로운`ExecutionMode`、`CommandSource`、`CommandType`유형; 확대`SlashCommand`인터페이스                 |
| `packages/cli/src/services/CommandService.ts`                           | 새로운`getCommandsForMode()`、`getModelInvocableCommands()`방법                                 |
| `packages/cli/src/nonInteractiveCliCommands.ts`                         | 화이트리스트 상수와 기존 필터 기능을 제거합니다. 내보낸 두 함수의 서명을 업데이트합니다. 소개하다`filterCommandsForMode`            |
| `packages/cli/src/acp-integration/session/Session.ts`                   | 고쳐 쓰다`handleSlashCommand`그리고`getAvailableCommands`부르다                                     |
| `packages/cli/src/services/BuiltinCommandLoader.ts`                     | 명령을 빌드할 때 주입`source: 'builtin-command'`、`sourceLabel: 'Built-in'`、`modelInvocable: false` |
| `packages/cli/src/services/BundledSkillLoader.ts`                       | 주입`source: 'bundled-skill'`、`commandType: 'prompt'`、`modelInvocable: true`                |
| `packages/cli/src/services/FileCommandLoader.ts` / `command-factory.ts` | 주입`source`、`commandType: 'prompt'`、`modelInvocable`(extensionName에 따라)                    |
| `packages/cli/src/services/McpPromptLoader.ts`                          | 주입`source: 'mcp-prompt'`、`commandType: 'prompt'`、`modelInvocable: true`                   |
| **각 내장 명령 파일(10 local + 27 local-jsx)**                                 | 성명`commandType: 'local'`또는`commandType: 'local-jsx'`                                      |

### 9.2 새로 추가된 파일

| 문서                                          | 콘텐츠                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `packages/cli/src/services/commandUtils.ts` | `getEffectiveSupportedModes()`、`filterCommandsForMode()`유틸리티 기능 및 내보내기 |

### 9.3 불변 파일

* `packages/cli/src/utils/commands.ts`（`parseSlashCommand`수정이 필요하지 않습니다)
* `packages/cli/src/ui/hooks/slashCommandProcessor.ts`(대화형 경로는 수정할 필요가 없습니다)
* `packages/cli/src/ui/noninteractive/nonInteractiveUi.ts`(스텁 UI는 수정할 필요가 없습니다)
* 모든 명령 중`action`구현(1단계에서는 명령 동작을 수정하지 않음)

***

## 10. 행동 영향 분석

### 10.1 변경 사항 요약

| 장면                    | 오래된 행동                  | 새로운 행동                                       | 자연        |
| --------------------- | ----------------------- | -------------------------------------------- | --------- |
| 비대화형으로 실행`/init`      | ✅ 허용(허용 목록)             | ✅허용(`commandType: local`)                    | 변화 없음     |
| 비대화형으로 실행`/summary`   | ✅허용                     | ✅허용                                          | 변화 없음     |
| 비대화형으로 실행`/compress`  | ✅허용                     | ✅허용                                          | 변화 없음     |
| 비대화형으로 실행`/btw`       | ✅허용                     | ✅허용                                          | 변화 없음     |
| 비대화형으로 실행`/bug`       | ✅허용                     | ✅허용                                          | 변화 없음     |
| 비대화형으로 실행`/context`   | ✅허용                     | ✅허용                                          | 변화 없음     |
| 비대화형으로 실행`/model`     | ❌ 지원되지 않음               | ❌ 지원되지 않음（`commandType: local-jsx`)          | 변화 없음     |
| 비대화형 모드에서 파일 명령 실행    | ✅ 허용(CommandKind.FILE)  | ✅허용(`commandType: prompt`)                   | 변화 없음     |
| 비대화형 모드에서 번들 스킬 실행    | ✅ 허용(CommandKind.SKILL) | ✅허용(`commandType: prompt`)                   | 변화 없음     |
| 비대화형 모드에서 MCP 프롬프트 실행 | ❌ CommandKind에 의해 차단됨   | ✅허용(`commandType: prompt`)                   | **버그 수정** |
| 비대화형으로 실행`/export`    | ❌ 화이트리스트에 없음            | ❌ 허용되지 않음 (`commandType: local`, 기본 대화형만 해당) | 변화 없음     |
| 비대화형으로 실행`/memory`    | ❌ 화이트리스트에 없음            | ❌ 허용되지 않음 (`commandType: local`, 기본 대화형만 해당) | 변화 없음     |
| 비대화형으로 실행`/plan`      | ❌ 화이트리스트에 없음            | ❌ 허용되지 않음 (`commandType: local`, 기본 대화형만 해당) | 변화 없음     |

> **\~에 대한`local`명령에 대한 보수적인 기본 정책**：`commandType: 'local'`기본값`supportedModes`\~을 위한`['interactive']`, 이는 Claude Code의 디자인과 일치합니다.`local`유형 명령에는 명시적인 선언이 필요합니다.`supportsNonInteractive: true`비대화형 모드로 실행합니다. 1단계 화이트리스트의 명령 6개(`init`、`summary`、`compress`、`btw`、`bug`、`context`) 명시적으로 선언함으로써`supportedModes: ['interactive', 'non_interactive', 'acp']`원래의 화이트리스트 효과를 동등하게 대체합니다. 2단계에서 확장이 필요한 명령(예:`/export`、`/memory`、`/plan`) 액션이 헤드리스 친화적인지 확인한 후 하나씩 잠금을 해제합니다.

***

## 10.2 2단계 모드 차이 명령: 이중 등록 모드

"대화형 모드의 UI 및 비대화형 모드의 텍스트 출력"이 필요한 2단계 명령의 경우(예:`/model`)을 사용해야 한다**이중 등록 모드**, 단일 명령이 아닌`action`내부 지점.

클로드 코드의 표준 모드입니다.`/context`예를 들어 (참조`src/commands/context/index.ts`): 이름이 같은 두 사람`Command`객체, 에`local-jsx`오직 대화형, 또 다른`local`비대화형 전용, 다음을 통해`isEnabled()`상호 배타적입니다.

Qwen Code는 2단계에서 동등한 접근 방식을 채택해야 합니다.`supportedModes`대리자`isEnabled()`상호 배제를 달성하려면:

```typescript
// ① 交互模式版：local-jsx，仅 interactive
export const modelCommandInteractive: SlashCommand = {
  name: 'model',
  kind: CommandKind.BUILT_IN,
  commandType: 'local-jsx',
  supportedModes: ['interactive'], // 显式限定
  // action: 打开 dialog 选择 model
};

// ② 非交互/acp 版：local，显式开放给 headless 调用者
export const modelCommandHeadless: SlashCommand = {
  name: 'model',
  kind: CommandKind.BUILT_IN,
  commandType: 'local',
  supportedModes: ['non_interactive', 'acp'], // 显式限定
  // action: 读取/设置 model，返回 message（纯文本）
};
```

두 개체의 이름이 동일합니다.`supportedModes`상호 배타적,`filterCommandsForMode`올바른 버전을 자동으로 선택합니다. 클로드 코드와 함께`isEnabled()`상호 배제에 비해,`supportedModes`필터링은 더 명확하고 테스트하기 쉬우며 런타임 환경 감지가 필요하지 않습니다.

**1단계에서는 이중 등록 명령을 구현하지 않습니다.**, 이 패턴은 여기에서 2단계 구현 사양으로만 예약되어 있습니다.

***

## 11. 테스트 전략

### 11.1 새로운 도구 기능 테스트

존재하다`packages/cli/src/services/commandUtils.test.ts`(새 파일):

```typescript
describe('getEffectiveSupportedModes', () => {
  it('显式 supportedModes 优先于 commandType 推断', () => {
    const cmd: SlashCommand = {
      name: 'test', description: '', kind: CommandKind.BUILT_IN,
      commandType: 'local',
      supportedModes: ['interactive'], // 显式限制
    };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive']);
  });

  it('commandType: local 推断为 all modes', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.BUILT_IN, commandType: 'local' };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive', 'non_interactive', 'acp']);
  });

  it('commandType: local-jsx 推断为 interactive only', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.BUILT_IN, commandType: 'local-jsx' };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive']);
  });

  it('commandType: prompt 推断为 all modes', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.SKILL, commandType: 'prompt' };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive', 'non_interactive', 'acp']);
  });

  it('未声明 commandType 且 CommandKind.BUILT_IN，兜底为 interactive', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.BUILT_IN };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive']);
  });

  it('未声明 commandType 且 CommandKind.FILE，兜底为 all modes', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.FILE };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive', 'non_interactive', 'acp']);
  });

  it('未声明 commandType 且 CommandKind.MCP_PROMPT，兜底为 all modes（修复原有限制）', () => {
    const cmd: SlashCommand = { name: 'test', description: '', kind: CommandKind.MCP_PROMPT };
    expect(getEffectiveSupportedModes(cmd)).toEqual(['interactive', 'non_interactive', 'acp']);
  });
});

describe('filterCommandsForMode', () => {
  it('正确过滤 non_interactive 模式下的命令', () => { ... });
  it('正确过滤 acp 模式下的命令', () => { ... });
  it('不过滤 hidden 命令（filterCommandsForMode 不处理 hidden，CommandService 处理）', () => { ... });
});
```

### 11.2 업데이트`nonInteractiveCliCommands.test.ts`

* 쌍 삭제`ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`다음에 대한 모든 참조
* 쌍 삭제`allowedBuiltinCommandNames`매개변수 테스트 사례
* 신규: 비대화형에서 commandType: 로컬 통과 필터링이 포함된 명령을 확인합니다.
* 신규: commandType: local-jsx가 포함된 명령이 비대화형으로 필터링되는지 확인합니다.
* 예약됨: 파일 명령/기술 명령이 비대화형 조건에서 필터링을 통과하는지 확인합니다.

### 11.3 업데이트`CommandService.test.ts`

* 새로운`getCommandsForMode`테스트 케이스
* 새로운`getModelInvocableCommands`테스트 케이스

### 11.4 각 로더 테스트

* `BuiltinCommandLoader.test.ts`: 모든 명령에`source: 'builtin-command'`
* `BundledSkillLoader.test.ts`:확인하다`source: 'bundled-skill'`그리고`modelInvocable: true`
* `FileCommandLoader.test.ts`: 사용자 명령이 다음과 같은지 확인하십시오.`source: 'skill-dir-command'`, 플러그인 명령은 다음과 같습니다`source: 'plugin-command'`
* `McpPromptLoader.test.ts`:확인하다`source: 'mcp-prompt'`그리고`modelInvocable: true`

***

## 12. 구현 순서

다음 순서로 구현하는 것이 권장되며, 각 단계는 독립적으로 커밋되고 검토될 수 있습니다.

**1단계**(\~30분): 수정`types.ts`, 추가하다`ExecutionMode`、`CommandSource`、`CommandType`그리고`SlashCommand`새로운 분야
→ 순수 유형 변경, TypeScript 컴파일 확인

**2단계**(\~1시간): 신규`commandUtils.ts`,성취하다`getEffectiveSupportedModes`그리고`filterCommandsForMode`, 새로 동기화`commandUtils.test.ts`→ 단위 테스트는 핵심 로직을 다룹니다.

**3단계**(\~1시간): 리팩토링`nonInteractiveCliCommands.ts`, 화이트리스트 삭제, 소개`filterCommandsForMode`, 함수 서명 업데이트
→ 행동 동등성(1단계 보수 전략: 로컬 클래스 명령을 명시적으로 작성)`supportedModes: ['interactive']`)

**4단계**(\~30분): 업데이트`CommandService.ts`, 두 가지 새로운 메소드 추가

**5단계**(\~2h): 모든 내장 명령 파일에 추가`commandType`성명서
→ 분류의 정확성을 하나씩 확인

**6단계**(\~1.5h): 모든 로더 업데이트, 삽입`source`、`sourceLabel`、`commandType`、`modelInvocable`

**7단계**(\~30분): 업데이트`Session.ts`통화 서명

**8단계**(\~1h): 모든 테스트 실행, 실패한 사례 수정, 스냅샷 업데이트

**9단계**(\~30분): CR 자체 검사: 화이트리스트가 완전히 제거되었으며 누락된 전화가 없는지 확인합니다.

***

## 13. 승인 체크리스트

* [ ] TypeScript는 오류 없이 컴파일됩니다(`npm run typecheck`)
* [ ] `npm run lint`새로운 린트 오류 없음
* [ ] 기존의 모든 테스트를 통과했습니다(`cd packages/cli && npx vitest run`)
* [ ] `commandUtils.test.ts`모든 새로운 테스트를 통과했습니다.
* [ ] `getEffectiveSupportedModes`7가지 사건을 모두 다룬다
* [ ] `filterCommandsForMode`대화형 / non\_interactive / acp 세 가지 모드 커버
* [ ] `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`전체 코드 베이스에 참조가 없습니다(`grep`확인하다)
* [ ] `filterCommandsForNonInteractive`이 함수는 전체 코드 베이스에 참조가 없습니다.
* [ ] 모든 내장 명령에는`commandType`필드
* [ ] Loader가 출력하는 모든 명령은 다음과 같습니다.`source`그리고`sourceLabel`필드
* [ ] `BundledSkillLoader` / `FileCommandLoader`(사용자 명령)/`McpPromptLoader`출력 명령`modelInvocable: true`
* [ ] `BuiltinCommandLoader`출력 명령`modelInvocable: false`
* [ ] `CommandService.getCommandsForMode('non_interactive')`리팩토링 전 동등한 명령 세트를 반환합니다.
* [ ] 비대화형 모드에서 MCP 프롬프트 명령이 더 이상 오류로 인해 차단되지 않습니다.
