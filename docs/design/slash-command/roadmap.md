# 슬래시 명령 리팩토링 로드맵

## 전반적인 목표

Qwen의 내부 아키텍처 스타일을 사용하여 외부 경험 측면에서 Claude Code와 95% 일치하는 명령 플랫폼을 제공하는 동시에 3가지 모드 분할, 단일 명령 소스 및 모델에서 호출할 수 없는 프롬프트 명령의 세 가지 핵심 문제를 해결합니다.

***

## 핵심 디자인 원칙

1. **각 단계는 독립적으로 배송될 수 있습니다.**: 완료 후 동작은 일관성이 있으며 이후 실행 단계에 의존하지 않습니다.
2. **1단계는 순수 인프라입니다.**: 오류로 인해 차단되는 MCP\_PROMPT를 수정하는 것 외에 사용 가능한 기존 명령 세트를 변경하지 않습니다.
3. **동작 변경과 아키텍처 변경을 분리하세요.**: 1단계는 아키텍처, 2단계는 역량 확장
4. **Claude Code의 내부 구조를 복사하지 마십시오.**: 하지만 사용자가 인지할 수 있는 기능을 정렬합니다.

***

## 1단계: 인프라 재구성(순수한 아키텍처, 동작 변경 없음)

### 목표

모든 후속 단계에 대한 기본 지원을 제공하기 위해 통합 명령 메타데이터 모델 및 교차 모드 관리 메커니즘을 설정합니다.

### 기능 점수

#### 1.1 확장`SlashCommand`메타데이터 모델

기존에`SlashCommand`인터페이스에 다음 필드가 추가됩니다.

**소스 필드**

* `source: CommandSource`: 명령 소스 열거형(`builtin-command` / `bundled-skill` / `skill-dir-command` / `plugin-command` / `mcp-prompt`기다리다)
* `sourceLabel?: string`: 표시용 소스 태그(예:`"Built-in"` / `"MCP: github-server"`)

**스키마 기능 필드**

* `supportedModes: ExecutionMode[]`: 사용 가능한 작동 모드를 선언합니다(`interactive` / `non_interactive` / `acp`)

**실행 유형 필드**

* `commandType: CommandType`: 실행 유형 선언(`prompt` / `local` / `local-jsx`)

**가시성 필드**

* `userInvocable: boolean`: 사용자가 슬래시 명령을 통해 호출할 수 있는지 여부(기본값)`true`)
* `modelInvocable: boolean`: 도구 호출을 통해 모델을 호출할 수 있는지 여부(기본값)`false`)

**보조 메타데이터 필드**(3단계용으로 예약됨, 1단계만 정의되고 사용되지 않음)

* `argumentHint?: string`: 다음과 같은 매개변수 프롬프트`"<model-id>"` / `"show|list|set"`
* `whenToUse?: string`: 이 명령을 언제 호출해야 하는지에 대한 지침(모델용)
* `examples?: string[]`: 사용예

#### 1.2 로더가 source/commandType 필드를 채웁니다.

각 로더가 구축 중입니다.`SlashCommand`언제 채워야합니까?`source`그리고`commandType`：

| 짐을 싣는 사람                      | 원천                  | 명령 유형                             |
| ----------------------------- | ------------------- | --------------------------------- |
| `BuiltinCommandLoader`        | `builtin-command`   | 각 명령으로 선언됨(`local` / `local-jsx`) |
| `BundledSkillLoader`          | `bundled-skill`     | `prompt`                          |
| `FileCommandLoader`(사용자/프로젝트) | `skill-dir-command` | `prompt`                          |
| `FileCommandLoader`(플러그인)     | `plugin-command`    | `prompt`                          |
| `McpPromptLoader`             | `mcp-prompt`        | `prompt`                          |

#### 1.3 내장 명령 선언`supportedModes`그리고`commandType`

모든 내장 명령에 대해 명시적으로 선언합니다.

* `commandType`：`local`(UI 종속성 없음) 또는`local-jsx`(대화/반응에 따라 다름)
* `supportedModes`：`local`클래스 명령 선언`['interactive', 'non_interactive', 'acp']`;`local-jsx`클래스 명령 선언`['interactive']`

#### 1.4 하드 코딩된 화이트리스트를 기능 기반 필터링으로 대체

* 삭제`ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`끊임없는
* 삭제`filterCommandsForNonInteractive`기능
* 새로운`filterCommandsForMode(commands, mode)`기능을 기반으로`supportedModes`필드 필터링
* 새로운`getEffectiveSupportedModes(cmd)`유틸리티 기능(CommandKind 기본 전략 고려)
* 개정하다`handleSlashCommand` / `getAvailableCommands`함수 서명, 제거됨`allowedBuiltinCommandNames`매개변수

#### 1.5 CommandService가 통합 레지스트리로 업그레이드됨

* 새로운`getCommandsForMode(mode: ExecutionMode)`방법
* 새로운`getModelInvocableCommands()`방식 (2/3단계에서 사용, 1단계에서 인터페이스 제공)
* 기존의`getCommands()`변경되지 않은 상태로 유지(대화식으로 사용)

### 합격 기준

* [ ] `SlashCommand`인터페이스에는 모든 새로운 필드가 포함되어 있으며 TypeScript는 이를 통해 컴파일됩니다.
* [ ] 모든 로더가 채워졌습니다.`source`그리고`commandType`필드
* [ ] 모든 내장 명령 선언`commandType`그리고`supportedModes`
* [ ] `ALLOWED_BUILTIN_COMMANDS_NON_INTERACTIVE`제거되고 기능 필터로 대체됨
* [ ] **비대화형에서 사용할 수 있는 명령 세트는 재구성 전과 정확히 동일합니다.**(기존 테스트는 깨지지 않습니다)
* [ ] MCP 프롬프트 명령은 non-interactive/acp에서 정상적으로 실행될 수 있습니다(원래 오류 제한이 수정됨).
* [ ] `CommandService.getCommandsForMode('non_interactive')`올바른 명령 세트를 반환합니다.
* [ ] 기존 테스트 모두 통과

***

## 2단계: 기능 확장(명령 구성 및 프롬프트 명령 모델 호출)

### 목표

1단계의 메타데이터 기반을 기반으로 세 가지 모드에서 사용 가능한 명령 범위가 확장되고 프롬프트 명령의 모델 호출 채널이 열립니다.

### 기능 점수

#### 2.1 확장된 비대화형/acp 사용 가능 명령 세트

**ACP 의미론적 설계 원칙**

명령을 ACP/비대화형 모드로 확장하기 전에 다음 설계 원칙을 따르십시오.

1. **받는 사람이 달라요**: ACP 모드에서 메시지 수신자는 최종 사용자가 아닌 IDE(Zed/VS Code 플러그인)입니다. 메시지 내용은 일반 텍스트 또는 Markdown 형식이어야 하며 터미널별 ANSI 스타일을 포함해서는 안 됩니다.
2. **구현 전략은 패턴 분기를 교체하는 것이 아니라 추가하는 것입니다.**: 올바른 접근 방식은 명령에 있습니다`action`내부 새 모드 판단 - 대화형 경로는 기존 UI 렌더링 로직을 변경하지 않고 유지하며 non\_interactive/acp 경로는 머신 소비에 적합하게 반환됩니다.`message`또는`submit_prompt`. 두 가지 경로가 동일한 경로에 공존합니다.`action`기능상.
3. **상태 저장 작업에는 의미 체계가 필요합니다.**: 단일 비대화형 호출(예: CLI`-p`매개변수),`/model set`、`/language set`상태 저장 명령에 대한 변경 사항은 이 세션 내에서만 유효하며 명령 응답 텍스트에 기록되어야 합니다.
4. **읽기 전용 vs 부작용**: 읽기 전용 명령(예:`/about`、`/stats`)는 현재 상태 텍스트를 직접 반환합니다. 부작용 명령이 있습니다(예:`/model set`、`/language set`) 응답에서 작업 결과를 확인해야 합니다.
5. **환경 관련 부작용을 피하세요**: 브라우저를 엽니다(`/docs`、`/insight`), 클립보드를 조작합니다(`/copy`) 및 그래픽 환경에 의존하는 기타 작업은 non\_interactive/acp 경로에서 건너뛰고 대신 응답 텍스트에 관련 URL이나 콘텐츠 자체를 반환해야 합니다.

**확장할 명령 개요**

> 메모:`btw`、`bug`、`compress`、`context`、`init`、`summary`1단계에서 전체 모드로 확장되었으며 이 단계 목록에는 없습니다.

다음 13개 명령이 확장됩니다.`non_interactive`그리고`acp`모델:

**카테고리 A: 작업이 반환됨`message`또는`submit_prompt`, 그냥 연장하세요`supportedModes`ACP 메시지 내용 설계**

| 주문하다          | 반환 유형           | ACP/비대화형 처리 지점                                       |
| ------------- | --------------- | ---------------------------------------------------- |
| `/copy`       | `message`       | ACP 아래에는 클립보드가 없습니다. 대신 콘텐츠 자체나 프롬프트가 응답 텍스트로 반환됩니다. |
| `/export`     | `message`       | 내보낸 파일의 전체 경로를 반환합니다.                                |
| `/plan`       | `submit_prompt` | 변경이 필요하지 않으며 모델을 직접 확장합니다.                           |
| `/restore`    | `message`       | 복구 작업의 결과 설명을 반환합니다.                                 |
| `/language`   | `message`       | 현재 언어 설정 또는 변경 확인 텍스트를 반환합니다.                        |
| `/statusline` | `submit_prompt` | 변경이 필요하지 않으며 모델을 직접 확장합니다.                           |

**클래스 A': 매개변수가 있는 경우 정상적으로 실행되고, 매개변수가 없는 경우 대화 상자가 트리거됩니다(매개변수가 없는 경로의 비대화형 처리를 추가해야 함).**

| 주문하다             | 매개변수 없음 대화형 동작 | 매개변수 없음 non\_interactive/acp 동작 |
| ---------------- | -------------- | ------------------------------- |
| `/model`         | 모델 선택 대화 상자 열기 | 현재 모델 이름과 설명 텍스트를 반환합니다.        |
| `/approval-mode` | 승인 모드 대화상자 열기  | 현재 승인 모드 및 설명 텍스트를 반환합니다.       |

**카테고리 B: 작업 내부 사용`context.ui.addItem()`React 구성 요소를 렌더링하려면 일반 텍스트를 반환하는 모드 분기를 추가해야 합니다.**

| 주문하다       | 대화형 행동                 | non\_interactive/acp 반환 콘텐츠                                                 |
| ---------- | ---------------------- | --------------------------------------------------------------------------- |
| `/about`   | React 구성요소의 렌더링된 버전/구성 | 버전 번호, 현재 모델 및 키 구성에 대한 일반 텍스트 요약                                           |
| `/stats`   | 렌더링 토큰/비용 통계 구성요소      | 세션 통계의 일반 텍스트 형식                                                            |
| `/insight` | 렌더 분석 구성 요소 + 브라우저 열기  | `non_interactive`반환 파일 경로를 동기적으로 생성합니다.`acp`통과하다`stream_messages`푸시 진행 및 결과 |
| `/docs`    | 문서 항목 렌더링 + 브라우저 열기    | 브라우저를 열지 않고 문서 URL을 반환합니다.                                                  |

**카테고리 C: 특별 취급**

| 주문하다     | 대화형 행동                               | non\_interactive/acp 동작                                                                             |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `/clear` | 부르다`context.ui.clear()`터미널 디스플레이 지우기 | 컨텍스트 경계 표시 메시지를 반환하며, 내용은 다음과 같습니다.`"Context cleared. Previous messages are no longer in context."` |

#### 2.2 프롬프트 명령 모델 호출이 열립니다

* 존재하다`CommandService`(또는`CommandRegistry`)에서 구현`getModelInvocableCommands()`, 모두 반환`modelInvocable: true`명령
* 할 것이다`BundledSkillLoader`、`FileCommandLoader`(사용자/프로젝트 명령) 레이블이 지정된 로드된 명령`modelInvocable: true`
* **MCP 프롬프트가 다음으로 표시되지 않았습니다.`modelInvocable`**:MCP 프롬프트는 별도의 MCP 도구 호출 메커니즘을 거치지 않고 모델에 의해 호출됩니다.`SkillTool`운송
* 변환`SkillTool`: 소비만으로`SkillManager.listSkills()`동시소비로 변경`CommandService.getModelInvocableCommands()`
* 통합 모델 호출 가능 명령 설명 구축, 주입`SkillTool`설명

#### 2.3 중간 입력 슬래시 명령 감지(기본 버전)

* 존재하다`InputPrompt`커서 근처의 슬래시 토큰 감지(줄 시작 부분에만 국한되지 않음)
* 슬래시 토큰을 감지한 후 인라인 고스트 텍스트를 통해 가장 일치하는 명령 이름을 묻는 메시지를 표시합니다(탭에서 허용).
* **아니요**드롭다운 완성 메뉴, 인수 힌트, 소스 배지 등 포함(3단계에서 제작)
* 고스트 텍스트 후보 세트만`modelInvocable: true`명령어(스킬/파일 명령어)

### 합격 기준

**2.1 명령 확장**

* [ ] 카테고리 A:`/copy`、`/export`、`/plan`、`/restore`、`/language`、`/statusline`비대화형 및 acp 모드에서 정상적으로 실행하고 의미 있는 텍스트 출력을 반환합니다.
* [ ] 클래스 A':`/model`、`/approval-mode`매개변수가 없으면 현재 상태 텍스트가 non-interactive/acp 아래에 반환됩니다(대화상자가 트리거되지 않음). 매개변수가 있는 경우 변경이 수행되고 확인 텍스트가 반환됩니다.
* [ ] 카테고리 B:`/about`、`/stats`、`/docs`non-interactive/acp에서 일반 텍스트를 반환합니다.`/docs`브라우저를 열지 마십시오.`/insight`존재하다`non_interactive`파일 경로 메시지를 동기적으로 생성하고 반환합니다.`acp`아래로 지나가다`stream_messages`푸시 진행
* [ ] 카테고리 C:`/clear`non-interactive/acp에서 컨텍스트 경계 표시 메시지를 반환합니다. 호출하지 마세요.`context.ui.clear()`
* [ ] 모든 확장 명령은 리팩토링 전과 동일하게 대화형 모드에서 작동합니다(성능 저하 없음).

**2.2 모델 호출**

* [ ] 대화에서 모델을 전달할 수 있습니다.`SkillTool`번들 스킬, 파일 명령어 호출(사용자/프로젝트)
* [ ] MCP 프롬프트가 통과되지 않습니다.`SkillTool`, MCP 도구 호출 메커니즘을 통해 모델에서 기본적으로 호출됩니다.
* [ ] 모델은 내장 명령을 호출할 수 없습니다(`userInvocable: true`,`modelInvocable: false`)
* [ ] `SkillTool`설명에는 모든 내용이 포함되어 있습니다.`modelInvocable`명령 설명

**2.3 중간 입력 슬래시**

* [ ] 중간 입력 슬래시: 텍스트에 입력`/`그런 다음 인라인 고스트 텍스트를 통해 가장 일치하는 명령을 프롬프트합니다(탭 허용).

***

## 3단계: 경험 정렬(완성 강화 + Claude Code 명령 완성)

### 목표

Phase 1/2의 메타데이터와 명령어 능력을 바탕으로 클로드코드에는 존재하지만 Qwen Code에서는 누락된 명령어를 보완하고 경험을 완성해 나갈 것입니다.

### 기능 점수

#### 3.1 향상된 완료 경험

**소스 배지**

* 완성 메뉴에 명령 소스 태그 표시(`[MCP]`이미 다음으로 확장되었습니다.`[Skill]`、`[Custom]`기다리다)
* 사용`source` / `sourceLabel`필드 렌더링

**인수 힌트**

* 메뉴에서 명령어 이름을 입력한 후 표시됩니다.`argumentHint`(좋다`set <model-id>`)
* `argumentHint`1단계 메타데이터 필드에서 제공

**최근에 사용한 정렬**

* 사용자가 가장 최근에 사용한 명령을 기록합니다(세션 수준, 지속성이 필요하지 않음).
* 완성 정렬에서 최근에 사용한 가중치 명령

**별칭 적중 강조 표시**

* 완료되면`altNames`대표명이 아닌 경우 표시 시 명시합니다(예:`help (alias: ?)`)

**정책 조정이 충돌함**

* 우선순위 지우기: 내장 > 번들/스킬-디렉터리 > 플러그인 > mcp
* 충돌이 발생할 경우 우선순위가 낮은 명령의 이름을 바꿉니다(예:`pluginName.commandName`)

#### 3.2 중간 입력 슬래시 명령 정식 버전

* 2단계 기본 버전에 인수 힌트 및 소스 배지 표시 추가
* 고스트 텍스트 프롬프트(입력`/he`시간 표시`/help`밝은 색상 팁)
* 유효한 명령 토큰 강조 표시(일치하는 슬래시 명령은 다른 색상으로 표시됨)

#### 3.3 도움말 디렉토리 재구성

할 것이다`/help`타일식 목록에서 그룹화된 디렉터리로 변경:

* **내장 명령**(local + local-jsx, 모드 표시)
* **번들 스킬**
* **사용자 정의 명령**(사용자/프로젝트 파일 명령)
* **플러그인 명령**
* **MCP 명령**

각 명령에는 이름, 인수 힌트, 설명, 소스, 지원 모드 태그가 표시됩니다.

#### 3.4 ACP 사용 가능 명령 메타데이터 향상

존재하다`sendAvailableCommandsUpdate()`다음에서 ACP 클라이언트에 더 많은 메타데이터를 노출합니다.

* `argumentHint`
* `source`
* `supportedModes`
* `subcommands`(이름 목록)
* `modelInvocable`

#### 3.5 Claude Code에서 누락된 명령 완성

현재 Qwen Code에서는 사용할 수 없지만 Claude Code에서는 사용할 수 있는 보조 명령:

| 주문하다             | 유형      | 설명하다                          |
| ---------------- | ------- | ----------------------------- |
| `/doctor`        | `local` | 환경 자체 테스트, 출력 구성/연결/도구 상태 진단  |
| `/release-notes` | `local` | 현재 버전의 변경 로그 표시               |
| `/cost`          | `local` | 현재 세션의 토큰 소비 및 수수료 추정을 표시합니다. |

> 메모:`/review`、`/commit`태스크와 유사한 명령어는 번들 스킬 형태로 제공되며 여기에는 포함되지 않습니다.

### 합격 기준

* [ ] 완성 메뉴 표시 소스 뱃지(`[MCP]`、`[Skill]`、`[Custom]`)
* [ ] 완성 메뉴에는 인수힌트가 표시됩니다(예:`set <model-id>`)
* [ ] 최근에 사용한 명령이 완성 목록의 첫 번째로 나타납니다.
* [ ] 별명이 적중되면 완성 항목에 원래 이름을 표시하십시오.
* [ ] 중간 입력 슬래시: 올바른 렌더링을 위한 고스트 텍스트 프롬프트
* [ ] `/help`출력은 소스별로 그룹화되며 각 명령은 지원되는 패턴 마커를 표시합니다.
* [ ] ACP에서 사용할 수 있는 명령은 다음과 같습니다.`argumentHint`、`source`、`subcommands`필드
* [ ] `/doctor`、`/release-notes`、`/cost`세 가지 명령을 사용할 수 있습니다
* [ ] `/doctor`비대화형 모드에서 실행 가능(반환`message`)

***

## 각 단계의 종속성

```
Phase 1（元数据 + 统一过滤）
    │
    ├──► Phase 2（能力扩展）
    │        │
    │        ├──► slash command 子命令拆分
    │        └──► prompt command 模型调用（需要 getModelInvocableCommands()）
    │
    └──► Phase 3（体验对齐）
             │
             ├──► source badge（需要 Phase 1 source 字段）
             ├──► argument hint（需要 Phase 1 argumentHint 字段）
             └──► Help 分组（需要 Phase 1 source 字段）
```

2단계와 3단계는 서로 종속되지 않으며 병렬로 진행할 수 있습니다(또는 우선순위에 따라 일부 하위 항목을 교체).
