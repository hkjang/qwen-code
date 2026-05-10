# 1단계 기술 설계 문서: 인프라 재구성

## 1. 설계 목표 및 제약 조건

### 1.1 목표

- 소스(Source), 실행 유형(CommandType), 모드 기능(SupportedModes) 및 가시성(UserInvocable/ModelInvocable)의 4가지 차원을 포괄하는 통합 명령 메타데이터 모델을 구축합니다.
- 비대화형/ACP 모드에서의 하드코딩된 화이트리스트를 기능 기반 필터링으로 대체합니다.
- 2/3단계 기능 확장을 위한 안정적인 기반 인터페이스를 제공합니다.

### 1.2 제약 조건

- **동작 변경 없음**: 비대화형 및 ACP 모드에서 사용 가능한 기존 명령 세트는 변경되지 않습니다. (예외: 잘못 차단되던 MCP_PROMPT 수정 등 버그 수정 사항 제외)
- **하위 호환성**: `SlashCommand` 인터페이스의 모든 새 필드는 선택 사항이거나 합리적인 기본값을 가집니다. 기존 명령 코드를 즉시 대량으로 수정할 필요는 없습니다.
- **새로운 실행 구조 없음**: ModeAdapter 또는 CommandExecutor와 같은 새로운 실행 구조를 도입하지 않고, 기존의 `CommandService` 및 필터링 로직만 확장합니다.
- **기존 기능 유지**: 명령에 로컬 하위 명령을 추가하거나 작업(Action) 구현을 수정하지 않습니다.

---

## 2. 새로운 타입 정의

### 2.1 파일 위치

모든 새로운 타입은 `packages/cli/src/ui/commands/types.ts` 또는 기존 `SlashCommand` 인터페이스 파일에 정의됩니다.

### 2.2 `ExecutionMode`

```typescript
/**
 * 실행 모드 열거형
 * - interactive: React/Ink UI 모드 (터미널 대화형)
 * - non_interactive: 비대화형 CLI 모드 (텍스트/JSON 출력)
 * - acp: ACP/Zed 통합 모드
 */
export type ExecutionMode = 'interactive' | 'non_interactive' | 'acp';
```

### 2.3 `CommandSource`

```typescript
/**
 * 명령 소스 열거형. 도움말 그룹화, 자동 완성 배지, ACP 사용 가능 명령 목록에 사용됩니다.
 */
export type CommandSource =
  | 'builtin-command' // 내장 명령 (BuiltinCommandLoader)
  | 'bundled-skill' // 패키지와 함께 배포되는 스킬 (BundledSkillLoader)
  | 'skill-dir-command' // 사용자/프로젝트 .qwen/commands/ 폴더의 파일 명령 (FileCommandLoader)
  | 'plugin-command' // 플러그인이 제공하는 명령 (FileCommandLoader, extensionName 존재 시)
  | 'mcp-prompt'; // MCP 서버가 제공하는 프롬프트 (McpPromptLoader)
```

### 2.4 `CommandType`

```typescript
/**
 * 명령 실행 유형. 명령이 "어떻게 실행되는지"를 설명합니다.
 */
export type CommandType = 'prompt' | 'local' | 'local-jsx';
```

### 2.5 `SlashCommand` 인터페이스 확장

기존 인터페이스에 새 필드를 추가합니다. 하위 호환성을 위해 **모두 선택 사항**입니다.

```typescript
export interface SlashCommand {
  // ... 기존 필드 (유지) ...

  /** 명령 소스 */
  source?: CommandSource;

  /** 사용자에게 표시될 소스 라벨 */
  sourceLabel?: string;

  /** 명령 실행 유형 (prompt, local, local-jsx) */
  commandType?: CommandType;

  /** 사용 가능한 실행 모드 목록 */
  supportedModes?: ExecutionMode[];

  /** 사용자가 호출 가능한지 여부 */
  userInvocable?: boolean;

  /** 모델이 도구 호출을 통해 호출 가능한지 여부 */
  modelInvocable?: boolean;

  // ... 3단계용 메타데이터 (argumentHint, whenToUse, examples 등) ...
}
```

---

## 3. 로더(Loader)별 필드 채움 사양

각 로더는 명령을 로드할 때 해당 메타데이터를 채웁니다. 예를 들어, `BuiltinCommandLoader`는 `source: 'builtin-command'`를 설정하고, `McpPromptLoader`는 `source: 'mcp-prompt'` 및 `commandType: 'prompt'`를 설정합니다.

---

## 4. 내장 명령 분류 기준

내장 명령은 `commandType`에 따라 `local` 또는 `local-jsx`로 분류됩니다.

- `local`: UI 렌더링에 의존하지 않고 텍스트 기반의 메시지나 프롬프트를 반환하는 명령 (예: `btw`, `bug`, `export`).
- `local-jsx`: React/Ink UI 컴포넌트 렌더링이나 대화창(Dialog) 노출이 필요한 명령 (예: `about`, `help`, `settings`).

---

## 5. `getEffectiveSupportedModes` 추론 규칙

이 함수는 1단계의 핵심 로직으로, 기존의 화이트리스트를 대체합니다.

1. `supportedModes`가 명시적으로 선언되어 있으면 해당 값을 사용합니다.
2. `commandType`이 `prompt`이면 모든 모드 (`['interactive', 'non_interactive', 'acp']`)를 허용합니다.
3. `commandType`이 `local` 또는 `local-jsx`이면 기본적으로 `['interactive']`만 허용하며, 비대화형 지원을 위해서는 명시적인 선언이 필요합니다. (Claude Code의 설계 철학 반영)

---

## 6. `CommandService` 확장

`getCommandsForMode(mode)`와 `getModelInvocableCommands()` 메서드가 추가되어 모드별 필터링과 모델 호출 가능 명령 조회를 담당합니다.

---

## 7. `nonInteractiveCliCommands.ts` 리팩토링

하드코딩된 `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE` 화이트리스트 상수를 제거하고, `filterCommandsForMode` 함수를 사용하도록 수정합니다. `handleSlashCommand` 함수의 파라미터에서 화이트리스트 관련 인자도 제거됩니다.

---

## 8. 행동 영향 분석

리팩토링 후에도 기존 비대화형 모드에서 작동하던 명령들은 동일하게 작동하며, 기존에 MCP_PROMPT가 비대화형 모드에서 차단되던 버그가 해결됩니다. 그 외의 내장 명령들은 2단계에서 하나씩 검증하며 기능을 열어줄 예정입니다.

---

## 9. 테스트 전략

`commandUtils.test.ts`를 신설하여 추론 규칙과 필터링 로직을 검증하고, `CommandService` 및 각 로더의 단위 테스트를 업데이트하여 메타데이터가 올바르게 주입되는지 확인합니다.
