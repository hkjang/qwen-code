# Qwen 코드 확장

Qwen 코드 확장 패키지 프롬프트, MCP 서버, 하위 에이전트, 기술 및 사용자 정의 명령을 친숙하고 사용자 친화적인 형식으로 제공합니다. 확장 기능을 사용하면 Qwen Code의 기능을 확장하고 해당 기능을 다른 사람들과 공유할 수 있습니다. 쉽게 설치하고 공유할 수 있도록 설계되었습니다.

확장 및 플러그인[Gemini CLI 확장 갤러리](https://geminicli.com/extensions/)그리고[클로드 코드 마켓플레이스](https://claudemarketplaces.com/)Qwen Code에 직접 설치할 수 있습니다. 이러한 크로스 플랫폼 호환성을 통해 확장 및 플러그인의 풍부한 생태계에 액세스할 수 있으므로 확장 작성자가 별도의 버전을 유지하지 않고도 Qwen Code의 기능을 획기적으로 확장할 수 있습니다.

## 확장 관리

우리는 두 가지를 모두 사용하여 확장 관리 도구 모음을 제공합니다.`qwen extensions`CLI 명령 및`/extensions`대화형 CLI 내의 슬래시 명령.

### 런타임 확장 관리(슬래시 명령)

다음을 사용하여 대화형 CLI 내에서 런타임 시 확장을 관리할 수 있습니다.`/extensions`슬래시 명령. 이러한 명령은 핫 리로드를 지원합니다. 즉, 애플리케이션을 다시 시작하지 않고도 변경 사항이 즉시 적용됩니다.

| 명령                                  | 설명                                             |
| ----------------------------------- | ---------------------------------------------- |
| `/extensions`또는`/extensions manage` | 설치된 모든 확장 프로그램 관리                              |
| `/extensions install <source>`      | git URL, 로컬 경로, npm 패키지 또는 마켓플레이스에서 확장 프로그램 설치 |
| `/extensions explore [source]`      | 브라우저에서 확장 소스 페이지(Gemini 또는 ClaudeCode)를 엽니다.   |

### CLI 확장 관리

다음을 사용하여 확장 프로그램을 관리할 수도 있습니다.`qwen extensions`CLI 명령. CLI 명령을 통해 변경된 사항은 재시작 시 활성 CLI 세션에 반영됩니다.

### 확장 설치

다음을 사용하여 확장 프로그램을 설치할 수 있습니다.`qwen extensions install`여러 소스에서:

#### 클로드 코드 마켓플레이스에서

Qwen Code는 다음 플러그인도 지원합니다.[클로드 코드 마켓플레이스](https://claudemarketplaces.com/). 마켓플레이스에서 설치하고 플러그인을 선택하세요.

```bash
qwen extensions install <marketplace-name>
# or
qwen extensions install <marketplace-github-url>
```

특정 플러그인을 설치하려면 플러그인 이름과 함께 다음 형식을 사용할 수 있습니다.

```bash
qwen extensions install <marketplace-name>:<plugin-name>
# or
qwen extensions install <marketplace-github-url>:<plugin-name>
```

예를 들어,`prompts.chat`플러그인의[f/굉장한-chatgpt-프롬프트](https://claudemarketplaces.com/plugins/f-awesome-chatgpt-prompts)시장:

```bash
qwen extensions install f/awesome-chatgpt-prompts:prompts.chat
# or
qwen extensions install https://github.com/f/awesome-chatgpt-prompts:prompts.chat
```

Claude 플러그인은 설치 중에 자동으로 Qwen Code 형식으로 변환됩니다.

* `claude-plugin.json`로 변환됩니다`qwen-extension.json`
* 에이전트 구성은 Qwen 하위 에이전트 형식으로 변환됩니다.
* 스킬 구성이 Qwen 스킬 형식으로 변환됩니다.
* 도구 매핑이 자동으로 처리됩니다.

다음을 사용하여 다양한 마켓플레이스에서 사용 가능한 확장을 빠르게 찾아볼 수 있습니다.`/extensions explore`명령:

```bash
# Open Gemini CLI Extensions marketplace
/extensions explore Gemini

# Open Claude Code marketplace
/extensions explore ClaudeCode
```

이 명령은 기본 브라우저에서 해당 마켓플레이스를 열어 Qwen Code 경험을 향상시키는 새로운 확장 기능을 찾을 수 있도록 합니다.

> **플랫폼 간 호환성**: 이를 통해 Gemini CLI와 Claude Code의 풍부한 확장 에코시스템을 활용하여 Qwen Code 사용자가 사용할 수 있는 기능을 획기적으로 확장할 수 있습니다.

#### Gemini CLI 확장에서

Qwen Code는 다음의 확장을 완벽하게 지원합니다.[Gemini CLI 확장 갤러리](https://geminicli.com/extensions/). git URL을 사용하여 간단히 설치하세요:

```bash
qwen extensions install <gemini-cli-extension-github-url>
# or
qwen extensions install <owner>/<repo>
```

Gemini 확장은 설치 중에 자동으로 Qwen Code 형식으로 변환됩니다.

* `gemini-extension.json`로 변환됩니다`qwen-extension.json`
* TOML 명령 파일은 자동으로 Markdown 형식으로 마이그레이션됩니다.
* MCP 서버, 컨텍스트 파일 및 설정이 보존됩니다.

#### npm 레지스트리에서

Qwen Code는 범위가 지정된 패키지 이름을 사용하여 npm 레지스트리에서 확장 설치를 지원합니다. 이는 이미 인증, 버전 관리 및 게시 인프라를 갖춘 프라이빗 레지스트리를 갖춘 팀에 이상적입니다.

```bash
# Install the latest version
qwen extensions install @scope/my-extension

# Install a specific version
qwen extensions install @scope/my-extension@1.2.0

# Install from a custom registry
qwen extensions install @scope/my-extension --registry https://your-registry.com
```

범위가 지정된 패키지만(`@scope/package-name`)은 모호함을 피하기 위해 지원됩니다.`owner/repo`GitHub 속기 형식.

**레지스트리 해결**다음 우선순위를 따릅니다.

1. `--registry`CLI 플래그(명시적 재정의)
2. 범위가 지정된 레지스트리`.npmrc`(예:`@scope:registry=https://...`)
3. 기본 레지스트리`.npmrc`
4. 대체:`https://registry.npmjs.org/`

**입증**을 통해 자동으로 처리됩니다.`NPM_TOKEN`환경 변수 또는 레지스트리별`_authToken`귀하의 항목`.npmrc`파일.

> **메모:**&#x6E;pm 확장에는 다음이 포함되어야 합니다.`qwen-extension.json`다른 Qwen Code 확장과 동일한 형식을 따르는 패키지 루트의 파일입니다. 보다[확장 출시](./extension-releasing.md#releasing-through-npm-registry)포장 세부사항을 위해.

#### Git 저장소에서

```bash
qwen extensions install https://github.com/github/github-mcp-server
```

그러면 github mcp 서버 확장이 설치됩니다.

#### 로컬 경로에서

```bash
qwen extensions install /path/to/your/extension
```

설치된 확장의 복사본을 생성하므로 다음을 실행해야 합니다.`qwen extensions update`로컬로 정의된 확장과 GitHub의 확장 모두에서 변경 사항을 가져옵니다.

### 확장 프로그램 제거

제거하려면 다음을 실행하세요.`qwen extensions uninstall extension-name`, 따라서 설치 예의 경우:

```
qwen extensions uninstall qwen-cli-security
```

### 확장 프로그램 비활성화

확장은 기본적으로 모든 작업 영역에서 활성화됩니다. 확장을 완전히 비활성화하거나 특정 작업 영역에 대해 비활성화할 수 있습니다.

예를 들어,`qwen extensions disable extension-name`사용자 수준에서 확장 기능이 비활성화되므로 모든 곳에서 비활성화됩니다.`qwen extensions disable extension-name --scope=workspace`현재 작업 공간에서만 확장 기능이 비활성화됩니다.

### 확장 프로그램 활성화

다음을 사용하여 확장 기능을 활성화할 수 있습니다.`qwen extensions enable extension-name`. 다음을 사용하여 특정 작업 공간에 대한 확장을 활성화할 수도 있습니다.`qwen extensions enable extension-name --scope=workspace`해당 작업 공간 내에서.

이는 최상위 수준에서 확장 기능을 비활성화하고 특정 위치에서만 활성화한 경우에 유용합니다.

### 확장 업데이트

로컬 경로, git 저장소 또는 npm 레지스트리에서 설치된 확장의 경우 다음을 사용하여 명시적으로 최신 버전으로 업데이트할 수 있습니다.`qwen extensions update extension-name`. 버전 핀 없이 설치된 npm 확장의 경우(예:`@scope/pkg`), 업데이트 확인`latest`dist-tag. 특정 dist-tag(예:`@scope/pkg@beta`), 업데이트가 해당 태그를 추적합니다. 정확한 버전에 고정된 확장 프로그램(예:`@scope/pkg@1.2.0`)은 항상 최신 상태로 간주됩니다.

다음을 사용하여 모든 확장을 업데이트할 수 있습니다.

```
qwen extensions update --all
```

## 작동 원리

시작 시 Qwen Code는 다음에서 확장을 찾습니다.`<home>/.qwen/extensions`

확장은 다음을 포함하는 디렉토리로 존재합니다.`qwen-extension.json`파일. 예를 들어:

`<home>/.qwen/extensions/my-extension/qwen-extension.json`

### `qwen-extension.json`

그만큼`qwen-extension.json`파일에는 확장에 대한 구성이 포함되어 있습니다. 파일의 구조는 다음과 같습니다.

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "channels": {
    "my-platform": {
      "entry": "dist/index.js",
      "displayName": "My Platform Channel"
    }
  },
  "contextFileName": "QWEN.md",
  "commands": "commands",
  "skills": "skills",
  "agents": "agents",
  "settings": [
    {
      "name": "API Key",
      "description": "Your API key for the service",
      "envVar": "MY_API_KEY",
      "sensitive": true
    }
  ]
}
```

* `name`: 확장 프로그램의 이름입니다. 이는 확장 명령이 사용자 또는 프로젝트 명령과 동일한 이름을 가질 때 확장을 고유하게 식별하고 충돌 해결을 위해 사용됩니다. 이름은 소문자 또는 숫자여야 하며 밑줄이나 공백 대신 대시를 사용해야 합니다. 이는 사용자가 CLI에서 확장을 참조하는 방법입니다. 이 이름은 확장 디렉터리 이름과 일치할 것으로 예상됩니다.
* `version`: 확장 버전입니다.
* `mcpServers`: 구성할 MCP 서버의 맵입니다. 키는 서버 이름이고 값은 서버 구성입니다. 이러한 서버는 MCP 서버와 마찬가지로 시작 시 로드됩니다.[`settings.json`파일](./cli/configuration.md). 확장 프로그램과`settings.json`파일에 정의된 서버와 동일한 이름으로 MCP 서버를 구성합니다.`settings.json`파일이 우선 적용됩니다.
  * 다음을 제외한 모든 MCP 서버 구성 옵션이 지원됩니다.`trust`.
* `channels`: 사용자 정의 채널 어댑터의 맵입니다. 키는 채널 유형 이름이고 값에는`entry`(컴파일된 JS 진입점 경로) 및 선택 사항`displayName`. 진입점은 다음을 내보내야 합니다.`plugin`에 부합하는 객체`ChannelPlugin`인터페이스. 보다[채널 플러그인](../features/channels/plugins)전체 가이드를 보려면.
* `contextFileName`: 확장에 대한 컨텍스트가 포함된 파일의 이름입니다. 이는 확장 디렉터리에서 컨텍스트를 로드하는 데 사용됩니다. 이 속성이 사용되지 않지만`QWEN.md`파일이 확장 디렉터리에 있으면 해당 파일이 로드됩니다.
* `commands`: 사용자 정의 명령이 포함된 디렉터리(기본값:`commands`). 명령은`.md`프롬프트를 정의하는 파일입니다.
* `skills`: 사용자 정의 기술이 포함된 디렉터리(기본값:`skills`). 기술은 자동으로 발견되며 다음을 통해 사용할 수 있습니다.`/skills`명령.
* `agents`: 사용자 정의 하위 에이전트가 포함된 디렉터리(기본값:`agents`). 하위 에이전트는`.yaml`또는`.md`전문 AI 도우미를 정의하는 파일입니다.
* `settings`: 확장에 필요한 설정 배열입니다. 설치 시 사용자에게 이러한 설정에 대한 값을 제공하라는 메시지가 표시됩니다. 값은 안전하게 저장되며 환경 변수로 MCP 서버에 전달됩니다.
  * 각 설정에는 다음과 같은 속성이 있습니다.
    * `name`: 설정의 표시 이름
    * `description`: 이 설정의 용도에 대한 설명
    * `envVar`: 설정할 환경변수 이름
    * `sensitive`: 값을 숨겨야 하는지 여부를 나타내는 부울(예: API 키, 비밀번호)

### 확장 설정 관리

확장 프로그램에는 설정(예: API 키 또는 자격 증명)을 통한 구성이 필요할 수 있습니다. 이러한 설정은 다음을 사용하여 관리할 수 있습니다.`qwen extensions settings`CLI 명령:

**설정 값을 설정합니다:**

```bash
qwen extensions settings set <extension-name> <setting-name> [--scope user|workspace]
```

**확장 프로그램에 대한 모든 설정을 나열합니다.**

```bash
qwen extensions settings list <extension-name>
```

**현재 값 보기(사용자 및 작업공간):**

```bash
qwen extensions settings show <extension-name> <setting-name>
```

**설정 값 제거:**

```bash
qwen extensions settings unset <extension-name> <setting-name> [--scope user|workspace]
```

설정은 두 가지 수준으로 구성할 수 있습니다.

* **사용자 수준**(기본값): 모든 프로젝트에 설정이 적용됩니다(`~/.qwen/.env`)
* **작업공간 수준**: 설정은 현재 프로젝트에만 적용됩니다(`.qwen/.env`)

작업공간 설정은 사용자 설정보다 우선합니다. 민감한 설정은 안전하게 저장되며 일반 텍스트로 표시되지 않습니다.

Qwen Code가 시작되면 모든 확장을 로드하고 해당 구성을 병합합니다. 충돌이 있는 경우 작업공간 구성이 우선적으로 적용됩니다.

### 사용자 정의 명령

확장 기능은 다음을 제공할 수 있습니다.[사용자 정의 명령](./cli/commands.md#custom-commands)Markdown 파일을`commands/`확장 디렉터리 내의 하위 디렉터리입니다. 이러한 명령은 사용자 및 프로젝트 사용자 정의 명령과 동일한 형식을 따르며 표준 명명 규칙을 사용합니다.

> **메모:**&#xBA85;령 형식이 TOML에서 Markdown으로 업데이트되었습니다. TOML 파일은 더 이상 사용되지 않지만 계속 지원됩니다. TOML 파일이 감지되면 나타나는 자동 마이그레이션 프롬프트를 사용하여 기존 TOML 명령을 마이그레이션할 수 있습니다.

**예**

이름이 붙은 확장자`gcp`다음과 같은 구조를 가지고 있습니다:

```
.qwen/extensions/gcp/
├── qwen-extension.json
└── commands/
    ├── deploy.md
    └── gcs/
        └── sync.md
```

다음 명령을 제공합니다.

* `/deploy`- 다음과 같이 표시됩니다.`[gcp] Custom command from deploy.md`도움을 받아
* `/gcs:sync`- 다음과 같이 표시됩니다.`[gcp] Custom command from sync.md`도움을 받아

### 맞춤형 스킬

확장 기능은 기술 파일을 다음 위치에 배치하여 사용자 정의 기술을 제공할 수 있습니다.`skills/`확장 디렉터리 내의 하위 디렉터리입니다. 각 스킬에는`SKILL.md`스킬의 이름과 설명을 정의하는 YAML 머리말이 포함된 파일입니다.

**예**

```
.qwen/extensions/my-extension/
├── qwen-extension.json
└── skills/
    └── pdf-processor/
        └── SKILL.md
```

해당 스킬은 다음을 통해 사용할 수 있습니다.`/skills`확장이 활성화되면 명령을 실행합니다.

### 사용자 정의 하위 에이전트

확장은 에이전트 구성 파일을 다음 위치에 배치하여 사용자 정의 하위 에이전트를 제공할 수 있습니다.`agents/`확장 디렉터리 내의 하위 디렉터리입니다. 에이전트는 YAML 또는 Markdown 파일을 사용하여 정의됩니다.

**예**

```
.qwen/extensions/my-extension/
├── qwen-extension.json
└── agents/
    └── testing-expert.yaml
```

확장 하위 에이전트는 하위 에이전트 관리자 대화 상자의 "확장 에이전트" 섹션에 나타납니다.

### 갈등 해결

확장 명령의 우선순위가 가장 낮습니다. 사용자 또는 프로젝트 명령과 충돌이 발생하는 경우:

1. **충돌 없음**: 확장 명령은 자연 이름을 사용합니다(예:`/deploy`)
2. **갈등으로**: 확장 명령은 확장 접두사로 이름이 변경됩니다(예:`/gcp.deploy`)

예를 들어, 사용자와`gcp`확장은 정의`deploy`명령:

* `/deploy`- 사용자의 배포 명령을 실행합니다.
* `/gcp.deploy`- 확장의 배포 명령을 실행합니다(표시됨).`[gcp]`꼬리표)

## 변수

Qwen 코드 확장을 사용하면 다음에서 변수 대체가 가능합니다.`qwen-extension.json`. 예를 들어 다음을 사용하여 MCP 서버를 실행하기 위해 현재 디렉터리가 필요한 경우 유용할 수 있습니다.`"cwd": "${extensionPath}${/}run.ts"`.

**지원되는 변수:**

| 변하기 쉬운                     | 설명                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `${extensionPath}`         | 사용자 파일 시스템에 있는 확장의 정규화된 경로(예: '/Users/username/.qwen/extensions/example-extension')입니다. 이것은 심볼릭 링크를 풀지 않습니다. |
| `${workspacePath}`         | 현재 작업공간의 정규화된 경로입니다.                                                                                         |
| `${/} or ${pathSeparator}` | 경로 구분 기호(OS마다 다름)                                                                                            |
