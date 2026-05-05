# 슬래시 명령 (Slash Command) 리팩토링 로드맵

## 전반적인 목표

Qwen의 내부 아키텍처 스타일을 유지하면서 사용자 경험 측면에서 Claude Code와 95% 일치하는 명령 플랫폼을 제공합니다. 동시에 3가지 모드(Interactive, Non-interactive, ACP) 분리, 단일 명령 소스 문제, 그리고 모델에서 호출할 수 없는 프롬프트 명령 문제를 해결합니다.

***

## 핵심 설계 원칙

1. **각 단계는 독립적으로 배포 가능해야 함**: 완료된 단계의 동작은 일관성이 있어야 하며 이후 단계에 의존하지 않아야 합니다.
2. **1단계는 순수 인프라 구축**: MCP_PROMPT 관련 오류 수정을 제외하고는 기존 명령 세트의 동작을 변경하지 않습니다.
3. **동작 변경과 아키텍처 변경의 분리**: 1단계는 아키텍처 개선, 2단계는 기능 확장에 집중합니다.
4. **Claude Code의 내부 구조를 그대로 복사하지 않음**: 대신 사용자가 인지할 수 있는 기능적 수준을 맞춥니다.

***

## 1단계: 인프라 재구성 (순수 아키텍처 개선, 동작 변경 없음)

### 목표

후속 단계를 위한 기반을 마련하기 위해 통합된 명령 메타데이터 모델 및 교차 모드 관리 메커니즘을 구축합니다.

### 주요 기능

#### 1.1 `SlashCommand` 메타데이터 모델 확장

기존 `SlashCommand` 인터페이스에 다음 필드들이 추가됩니다.

**소스 필드**

* `source: CommandSource`: 명령 소스 열거형 (`builtin-command` / `bundled-skill` / `skill-dir-command` / `plugin-command` / `mcp-prompt` 등)
* `sourceLabel?: string`: 표시용 소스 라벨 (예: `"Built-in"` / `"MCP: github-server"`)

**스키마 기능 필드**

* `supportedModes: ExecutionMode[]`: 사용 가능한 작동 모드 선언 (`interactive` / `non_interactive` / `acp`)

**실행 유형 필드**

* `commandType: CommandType`: 실행 유형 선언 (`prompt` / `local` / `local-jsx`)

**가시성 필드**

* `userInvocable: boolean`: 사용자가 슬래시 명령을 통해 호출할 수 있는지 여부 (기본값: `true`)
* `modelInvocable: boolean`: 도구 호출을 통해 모델이 호출할 수 있는지 여부 (기본값: `false`)

**보조 메타데이터 필드** (3단계를 위해 예약됨, 1단계에서는 정의만 하고 사용하지 않음)

* `argumentHint?: string`: 매개변수 힌트 (예: `"<model-id>"` / `"show|list|set"`)
* `whenToUse?: string`: 이 명령을 언제 호출해야 하는지에 대한 지침 (모델용)
* `examples?: string[]`: 사용 예시

#### 1.2 로더(Loader)의 source/commandType 필드 자동 채움

각 로더가 `SlashCommand`를 구축할 때 `source`와 `commandType`을 채웁니다.

| 로더 | 소스 (Source) | 명령 유형 (Command Type) |
| ----------------------------- | ------------------- | --------------------------------- |
| `BuiltinCommandLoader` | `builtin-command` | 각 명령에 선언된 유형 (`local` / `local-jsx`) |
| `BundledSkillLoader` | `bundled-skill` | `prompt` |
| `FileCommandLoader` (사용자/프로젝트) | `skill-dir-command` | `prompt` |
| `FileCommandLoader` (플러그인) | `plugin-command` | `prompt` |
| `McpPromptLoader` | `mcp-prompt` | `prompt` |

#### 1.3 내장 명령의 `supportedModes` 및 `commandType` 선언

모든 내장 명령에 대해 명시적으로 선언합니다.

* `commandType`: `local` (UI 의존성 없음) 또는 `local-jsx` (대화/React 컴포넌트에 의존)
* `supportedModes`: `local` 유형 명령은 `['interactive', 'non_interactive', 'acp']` 선언; `local-jsx` 유형 명령은 `['interactive']` 선언

#### 1.4 하드코딩된 화이트리스트를 기능 기반 필터링으로 대체

* `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE` 상수 제거
* `filterCommandsForNonInteractive` 함수 제거
* `supportedModes` 필드를 기반으로 하는 `filterCommandsForMode(commands, mode)` 함수 추가
* `getEffectiveSupportedModes(cmd)` 유틸리티 함수 추가 (CommandKind 기본 전략 고려)
* `handleSlashCommand` / `getAvailableCommands` 함수 시그니처 수정, `allowedBuiltinCommandNames` 파라미터 제거

#### 1.5 CommandService를 통합 레지스트리로 업그레이드

* `getCommandsForMode(mode: ExecutionMode)` 메서드 추가
* `getModelInvocableCommands()` 메서드 추가 (2/3단계에서 사용, 1단계에서는 인터페이스만 제공)
* 기존 `getCommands()`는 변경 없이 유지 (대화형 모드에서 사용)

### 완료 기준

* [ ] `SlashCommand` 인터페이스에 모든 새 필드가 포함되었으며 TypeScript 컴파일이 통과됨.
* [ ] 모든 로더가 `source` 및 `commandType` 필드를 채움.
* [ ] 모든 내장 명령이 `commandType` 및 `supportedModes`를 선언함.
* [ ] `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`가 제거되고 기능 필터로 대체됨.
* [ ] **비대화형 모드에서 사용할 수 있는 명령 세트가 리팩토링 전과 정확히 일치함.** (기존 테스트 통과)
* [ ] MCP 프롬프트 명령이 non-interactive/acp 모드에서 정상적으로 실행됨 (기존의 오류 제한 수정됨).
* [ ] `CommandService.getCommandsForMode('non_interactive')`가 올바른 명령 세트를 반환함.
* [ ] 모든 기존 테스트 통과.

***

## 2단계: 기능 확장 (명령어 구성 및 프롬프트 명령의 모델 호출)

### 목표

1단계의 메타데이터 기반을 바탕으로 세 가지 모드에서 사용 가능한 명령 범위를 확장하고, 프롬프트 명령을 모델이 호출할 수 있는 경로를 엽니다.

### 주요 기능

#### 2.1 비대화형/ACP 사용 가능 명령 세트 확장

**ACP 시맨틱 설계 원칙**

명령을 ACP/비대화형 모드로 확장할 때 다음 설계 원칙을 따릅니다.

1. **수신자 차이**: ACP 모드에서 메시지 수신자는 최종 사용자가 아닌 IDE (Zed/VS Code 플러그인)입니다. 메시지 내용은 일반 텍스트 또는 Markdown 형식이어야 하며 터미널 전용 ANSI 스타일을 포함해서는 안 됩니다.
2. **패턴 분기 추가 방식**: 명령의 `action` 내부에서 모드를 판단하여 처리합니다. 대화형 경로는 기존 UI 렌더링 로직을 유지하고, non_interactive/acp 경로는 기계가 소비하기 적합한 `message` 또는 `submit_prompt`를 반환합니다. 두 경로가 동일한 `action` 함수 내에 공존합니다.
3. **상태 유지 작업의 의미론**: 단일 비대화형 호출(예: CLI `-p` 파라미터)에서 `/model set`, `/language set` 등 상태를 변경하는 명령은 해당 세션 내에서만 유효하며, 명령 응답 텍스트에 결과가 기록되어야 합니다.
4. **읽기 전용 vs 부작용**: 읽기 전용 명령(예: `/about`, `/stats`)은 현재 상태 텍스트를 직접 반환합니다. 부작용이 있는 명령(예: `/model set`, `/language set`)은 응답에서 작업 결과를 확인해주어야 합니다.
5. **환경 의존적 부작용 방지**: 브라우저를 여는 명령 (`/docs`, `/insight`), 클립보드 조작 (`/copy`) 등 그래픽 환경에 의존하는 작업은 non_interactive/acp 경로에서 건너뛰고, 대신 응답 텍스트에 관련 URL이나 콘텐츠 자체를 반환해야 합니다.

**확장 대상 명령 개요**

> 참고: `btw`, `bug`, `compress`, `context`, `init`, `summary`는 1단계에서 이미 전 모드로 확장되었으므로 이 목록에는 포함되지 않습니다.

다음 13개 명령이 `non_interactive` 및 `acp` 모드로 확장됩니다.

**유형 A: `message` 또는 `submit_prompt`를 반환하는 작업 (supportedModes 확장 및 ACP 메시지 내용 설계)**

| 명령 | 반환 유형 | ACP/비대화형 처리 방식 |
| ------------- | --------------- | ---------------------------------------------------- |
| `/copy` | `message` | ACP에는 클립보드가 없으므로, 콘텐츠 자체 또는 안내 메시지를 응답 텍스트로 반환 |
| `/export` | `message` | 내보낸 파일의 전체 경로를 반환 |
| `/plan` | `submit_prompt` | 변경 필요 없음, 모드만 확장 |
| `/restore` | `message` | 복구 작업 결과 설명을 반환 |
| `/language` | `message` | 현재 언어 설정 또는 변경 확인 텍스트를 반환 |
| `/statusline` | `submit_prompt` | 변경 필요 없음, 모드만 확장 |

**유형 A': 매개변수가 있으면 정상 실행, 없으면 대화창 트리거 (매개변수 없는 경로에 대한 비대화형 처리 추가 필요)**

| 명령 | 매개변수 없을 때 대화형 동작 | 매개변수 없을 때 non_interactive/acp 동작 |
| ---------------- | -------------- | ------------------------------- |
| `/model` | 모델 선택 대화창 열기 | 현재 모델 이름 및 설명 텍스트 반환 |
| `/approval-mode` | 승인 모드 대화창 열기 | 현재 승인 모드 및 설명 텍스트 반환 |

**유형 B: `context.ui.addItem()`을 사용하여 React 컴포넌트를 렌더링하는 작업 (일반 텍스트 반환 분기 추가 필요)**

| 명령 | 대화형 동작 | non_interactive/acp 반환 내용 |
| ---------- | ---------------------- | --------------------------------------------------------------------------- |
| `/about` | 버전/설정 정보 React 컴포넌트 | 버전 번호, 현재 모델 및 주요 설정 일반 텍스트 요약 |
| `/stats` | 토큰/비용 통계 React 컴포넌트 | 세션 통계의 일반 텍스트 형식 |
| `/insight` | 분석 컴포넌트 + 브라우저 열기 | `non_interactive`: 파일 경로 동기 생성 및 반환; `acp`: `stream_messages`로 진행 상황 및 결과 전송 |
| `/docs` | 문서 항목 렌더링 + 브라우저 열기 | 브라우저를 열지 않고 문서 URL 반환 |

**유형 C: 특수 처리**

| 명령 | 대화형 동작 | non_interactive/acp 동작 |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `/clear` | `context.ui.clear()`로 터미널 화면 지움 | 컨텍스트 경계 표시 메시지 반환 (`"Context cleared. Previous messages are no longer in context."`) |

#### 2.2 프롬프트 명령의 모델 호출 허용

* `CommandService` (또는 `CommandRegistry`)에서 `getModelInvocableCommands()` 구현, `modelInvocable: true`인 모든 명령 반환
* `BundledSkillLoader`, `FileCommandLoader` (사용자/프로젝트 명령)가 로드한 명령에 `modelInvocable: true` 표시
* **MCP 프롬프트는 `modelInvocable`로 표시하지 않음**: MCP 프롬프트는 별도의 MCP 도구 호출 메커니즘을 통하며, 모델에 의해 `SkillTool`을 통해 호출되지 않음
* `SkillTool` 변환: `SkillManager.listSkills()`만 소비하던 방식에서 `CommandService.getModelInvocableCommands()`도 함께 소비하도록 변경
* 통합된 모델 호출 가능 명령 설명 구축 및 `SkillTool` 설명에 주입

#### 2.3 입력 중간 슬래시 명령 감지 (기본 버전)

* `InputPrompt`에서 줄 시작 부분뿐만 아니라 커서 근처의 슬래시 토큰 감지
* 슬래시 토큰 감지 시 인라인 고스트 텍스트(Ghost Text)를 통해 가장 잘 맞는 명령 이름 제안 (Tab 키로 수락)
* **드롭다운 메뉴, 인수 힌트, 소스 배지 등은 미포함** (3단계에서 구현)
* 고스트 텍스트 후보는 `userInvocable: true`인 명령들로 구성

#### 2.4 슬래시 명령의 하위 명령(Subcommand) 분리 (필수 사항은 아님, 최적화 목적)

* `/model set <id>`와 같이 복잡한 로직을 가진 명령을 하위 명령 단위로 분리하여 관리할 수 있도록 지원

### 완료 기준

**2.1 명령 확장**

* [ ] 유형 A: `/copy`, `/export`, `/plan`, `/restore`, `/language`, `/statusline`이 비대화형 및 ACP 모드에서 정상 실행되고 텍스트 출력을 반환함.
* [ ] 유형 A': 매개변수가 없을 때 `/model`, `/approval-mode`가 non-interactive/acp 모드에서 현재 상태 텍스트를 반환함 (대화창 트리거 안 됨). 매개변수가 있으면 변경을 수행하고 확인 텍스트를 반환함.
* [ ] 유형 B: `/about`, `/stats`, `/docs`가 non-interactive/acp 모드에서 일반 텍스트를 반환함. `/docs`는 브라우저를 열지 않음. `/insight`는 `non_interactive`에서 파일 경로를 반환하고 `acp`에서 `stream_messages`로 진행 상황을 전송함.
* [ ] 유형 C: `/clear`가 non-interactive/acp 모드에서 컨텍스트 경계 메시지를 반환하며 `context.ui.clear()`를 호출하지 않음.
* [ ] 모든 확장된 명령이 대화형 모드에서 리팩토링 전과 동일하게 동작함.

**2.2 모델 호출**

* [ ] 모델이 `SkillTool`을 통해 번들 스킬 및 파일 명령(사용자/프로젝트)을 호출할 수 있음.
* [ ] MCP 프롬프트는 `SkillTool`을 통하지 않고 MCP 도구 호출 메커니즘을 통해 모델이 호출함.
* [ ] 모델은 내장 명령을 호출할 수 없음 (`modelInvocable: false`).
* [ ] `SkillTool` 설명에 모든 `modelInvocable` 명령의 설명이 포함됨.

**2.3 입력 중간 슬래시**

* [ ] 텍스트 입력 중 `/` 입력 시 인라인 고스트 텍스트로 명령 제안 (Tab 키 수락 가능).

***

## 3단계: 경험 정렬 (완성 기능 강화 및 Claude Code와의 기능 패리티)

### 목표

1, 2단계의 메타데이터와 명령 능력을 바탕으로 Claude Code에는 있지만 Qwen Code에는 없는 경험을 보완하고 완성도를 높입니다.

### 주요 기능

#### 3.1 향상된 자동 완성 경험

**소스 배지 (Source Badge)**

* 자동 완성 메뉴에 명령 소스 라벨 표시 (`[MCP]`, `[Skill]`, `[Custom]` 등)
* `source` / `sourceLabel` 필드 정보를 사용하여 렌더링

**인수 힌트 (Argument Hint)**

* 메뉴의 명령 이름 옆에 `argumentHint` 표시 (예: `set <model-id>`)
* 1단계에서 정의한 메타데이터 필드 활용

**최근 사용 순 정렬**

* 사용자가 최근에 사용한 명령 기록 (세션 수준, 영구 저장 불필요)
* 자동 완성 목록 상단에 최근 사용 명령 우선 배치

**별칭(Alias) 매칭 강조**

* 별칭 (`altNames`)으로 검색된 경우 대표 이름 옆에 명시 (예: `help (alias: ?)`)

**이름 충돌 정책 조정**

* 우선순위 명확화: 내장 명령 > 번들/스킬 디렉토리 > 플러그인 > MCP
* 충돌 발생 시 낮은 우선순위 명령의 이름을 변경 (예: `pluginName.commandName`)

#### 3.2 입력 중간 슬래시 명령 정식 버전

* 2단계 기본 버전에 인수 힌트 및 소스 배지 표시 추가
* 고스트 텍스트 제안 기능 고도화
* 유효한 명령 토큰 하이라이팅 (일치하는 슬래시 명령을 다른 색상으로 표시)

#### 3.3 도움말 (/help) 구조 재구성

`/help` 출력을 단순 목록에서 그룹화된 디렉토리 형식으로 변경:

* **내장 명령** (local + local-jsx, 지원 모드 표시)
* **번들 스킬**
* **사용자 정의 명령** (사용자/프로젝트 파일 명령)
* **플러그인 명령**
* **MCP 명령**

각 명령에는 이름, 인수 힌트, 설명, 소스, 지원 모드 라벨이 표시됩니다.

#### 3.4 ACP 사용 가능 명령 메타데이터 강화

`sendAvailableCommandsUpdate()`를 통해 ACP 클라이언트에 더 많은 메타데이터 노출:

* `argumentHint`
* `source`
* `supportedModes`
* `subcommands` (이름 목록)
* `modelInvocable`

#### 3.5 Claude Code의 누락된 명령 구현

현재 Qwen Code에는 없지만 Claude Code에는 있는 유용한 보조 명령 추가:

| 명령 | 유형 | 설명 |
| ---------------- | ------- | ----------------------------- |
| `/doctor` | `local` | 환경 자가 진단, 설정/연결/도구 상태 진단 결과 출력 |
| `/release-notes` | `local` | 현재 버전의 변경 로그(변경log) 표시 |
| `/cost` | `local` | 현재 세션의 토큰 소비량 및 예상 비용 표시 |

> 참고: `/review`, `/commit`과 같은 태스크형 명령은 번들 스킬 형태로 제공되므로 여기에 포함되지 않습니다.

### 완료 기준

* [ ] 자동 완성 메뉴에 소스 배지 표시 (`[MCP]`, `[Skill]`, `[Custom]`).
* [ ] 자동 완성 메뉴에 인수 힌트 표시 (예: `set <model-id>`).
* [ ] 최근 사용 명령이 자동 완성 목록 상단에 노출됨.
* [ ] 별칭 매칭 시 원래 이름을 함께 표시함.
* [ ] 입력 중간 슬래시 제안이 올바르게 렌더링됨.
* [ ] `/help` 출력이 소스별로 그룹화되고 지원 모드 마커가 표시됨.
* [ ] ACP 사용 가능 명령 정보에 `argumentHint`, `source`, `subcommands` 필드가 포함됨.
* [ ] `/doctor`, `/release-notes`, `/cost` 명령 사용 가능.
* [ ] `/doctor`가 비대화형 모드에서 실행 가능함 (`message` 반환).

***

## 단계별 의존성 관계

```
1단계 (메타데이터 + 통합 필터링)
    │
    ├──► 2단계 (기능 확장)
    │        │
    │        ├──► 슬래시 명령 하위 명령 분리
    │        └──► 프롬프트 명령 모델 호출 (getModelInvocableCommands() 필요)
    │
    └──► 3단계 (경험 정렬)
             │
             ├──► 소스 배지 (1단계 source 필드 필요)
             ├──► 인수 힌트 (1단계 argumentHint 필드 필요)
             └──► 도움말 그룹화 (1단계 source 필드 필요)
```

2단계와 3단계는 서로 직접적인 의존성이 없으며 병렬로 진행하거나 우선순위에 따라 하위 항목을 조정하여 진행할 수 있습니다.
