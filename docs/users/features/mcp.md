# MCP를 통해 Qwen Code를 도구에 연결

Qwen Code는 다음을 통해 외부 도구 및 데이터 소스에 연결할 수 있습니다.[모델 컨텍스트 프로토콜(MCP)](https://modelcontextprotocol.io/introduction). MCP 서버는 Qwen Code에 도구, 데이터베이스 및 API에 대한 액세스를 제공합니다.

## MCP로 할 수 있는 일

MCP 서버가 연결되면 Qwen Code에 다음을 요청할 수 있습니다.

- 파일 및 저장소 작업(활성화한 도구에 따라 읽기/검색/쓰기)
- 데이터베이스 쿼리(스키마 검사, 쿼리, 보고)
- 내부 서비스 통합(API를 MCP 도구로 래핑)
- 워크플로우 자동화(도구/프롬프트로 노출되는 반복 가능한 작업)

> \[!팁]
>
> "시작하기 위한 단 하나의 명령"을 찾고 있다면 다음으로 이동하세요.[빠른 시작](#quick-start).

## 빠른 시작

Qwen 코드는 다음에서 MCP 서버를 로드합니다.`mcpServers`당신의`settings.json`. 다음 중 하나로 서버를 구성할 수 있습니다.

- 편집하여`settings.json`곧장
- 사용하여`qwen mcp`명령(참조[CLI 참조](#qwen-mcp-cli))

### 첫 번째 서버 추가

1. 서버를 추가합니다(예: 원격 HTTP MCP 서버):

```bash
qwen mcp add --transport http my-server http://localhost:3000/mcp
```

2. MCP 관리 대화 상자를 열어 서버를 보고 관리합니다.

```bash
qwen mcp
```

3. 동일한 프로젝트에서 Qwen Code를 다시 시작한 다음(또는 아직 실행되지 않은 경우 시작) 모델에 해당 서버의 도구를 사용하도록 요청합니다.

## 구성이 저장되는 위치(범위)

대부분의 사용자에게는 다음 두 가지 범위만 필요합니다.

- **프로젝트 범위(기본값)**:`.qwen/settings.json`프로젝트 루트에서
- **사용자 범위**:`~/.qwen/settings.json`컴퓨터의 모든 프로젝트에서

사용자 범위에 쓰기:

```bash
qwen mcp add --scope user --transport http my-server http://localhost:3000/mcp
```

> \[!팁]
>
> 고급 구성 레이어(시스템 기본값/시스템 설정 및 우선 순위 규칙)는 다음을 참조하세요.[설정](../configuration/settings).

## 서버 구성

### 교통수단을 선택하세요

| 수송    | 언제 사용하나요?                                              | JSON 필드                               |
| ------- | ------------------------------------------------------------- | --------------------------------------- |
| `http`  | 원격 서비스에 권장됩니다. 클라우드 MCP 서버에 잘 작동         | `httpUrl`(+ 선택사항`headers`)          |
| `sse`   | 서버 전송 이벤트만 지원하는 레거시/더 이상 사용되지 않는 서버 | `url`(+ 선택사항`headers`)              |
| `stdio` | 머신의 로컬 프로세스(스크립트, CLI, Docker)                   | `command`,`args`(+ 선택사항`cwd`,`env`) |

> \[!메모]
>
> 서버가 두 가지를 모두 지원하는 경우 선호**HTTP**\~ 위에**SSE**.

### 다음을 통해 구성`settings.json`대`qwen mcp add`

두 접근 방식 모두 동일한 결과를 생성합니다.`mcpServers`귀하의 항목`settings.json`—원하는 것을 사용하세요.

#### Stdio 서버(로컬 프로세스)

JSON(`.qwen/settings.json`):

```json
{
  "mcpServers": {
    "pythonTools": {
      "command": "python",
      "args": ["-m", "my_mcp_server", "--port", "8080"],
      "cwd": "./mcp-servers/python",
      "env": {
        "DATABASE_URL": "$DB_CONNECTION_STRING",
        "API_KEY": "${EXTERNAL_API_KEY}"
      },
      "timeout": 15000
    }
  }
}
```

CLI(기본적으로 프로젝트 범위에 기록):

```bash
qwen mcp add pythonTools -e DATABASE_URL=$DB_CONNECTION_STRING -e API_KEY=$EXTERNAL_API_KEY \
  --timeout 15000 python -m my_mcp_server --port 8080
```

#### HTTP 서버(원격 스트리밍 가능 HTTP)

JSON:

```json
{
  "mcpServers": {
    "httpServerWithAuth": {
      "httpUrl": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token"
      },
      "timeout": 5000
    }
  }
}
```

CLI:

```bash
qwen mcp add --transport http httpServerWithAuth http://localhost:3000/mcp \
  --header "Authorization: Bearer your-api-token" --timeout 5000
```

#### SSE 서버(원격 서버에서 보낸 이벤트)

JSON:

```json
{
  "mcpServers": {
    "sseServer": {
      "url": "http://localhost:8080/sse",
      "timeout": 30000
    }
  }
}
```

CLI:

```bash
qwen mcp add --transport sse sseServer http://localhost:8080/sse --timeout 30000
```

## 안전 및 제어

### 신뢰(확인 건너뛰기)

- **서버 신뢰**(`trust: true`): 해당 서버에 대한 확인 프롬프트를 우회합니다(아껴서 사용).

### OAuth 인증

Qwen Code는 MCP 서버에 대한 OAuth 2.0 인증을 지원합니다. 이는 인증이 필요한 원격 서버에 액세스할 때 유용합니다.

#### 기본 사용법

OAuth 자격 증명을 사용하여 MCP 서버를 추가하면 Qwen Code가 자동으로 인증 흐름을 처리합니다.

```bash
qwen mcp add --transport sse oauth-server https://api.example.com/sse/ \
  --oauth-client-id your-client-id \
  --oauth-redirect-uri https://your-server.com/oauth/callback \
  --oauth-authorization-url https://provider.example.com/authorize \
  --oauth-token-url https://provider.example.com/token
```

#### 중요: 리디렉션 URI 구성

OAuth 흐름에는 인증 공급자가 인증 코드를 보내는 리디렉션 URI가 필요합니다.

- **지역 발전**: 기본적으로 Qwen Code는 다음을 사용합니다.`http://localhost:7777/oauth/callback`. 이는 로컬 브라우저를 사용하여 로컬 컴퓨터에서 Qwen Code를 실행할 때 작동합니다.

- **원격/클라우드 배포**: 원격 서버, 클라우드 IDE, 웹 터미널에서 Qwen Code를 실행하는 경우 기본적으로`localhost`리디렉션이 작동하지 않습니다. 구성해야 합니다.`--oauth-redirect-uri`OAuth 콜백을 수신할 수 있는 공개적으로 액세스 가능한 URL을 가리킵니다.

원격 서버의 예:

```bash
qwen mcp add --transport sse remote-server https://api.example.com/sse/ \
  --oauth-redirect-uri https://your-remote-server.example.com/oauth/callback
```

#### settings.json을 통한 수동 구성

편집하여 OAuth를 구성할 수도 있습니다.`settings.json`곧장:

```json
{
  "mcpServers": {
    "oauthServer": {
      "url": "https://api.example.com/sse/",
      "oauth": {
        "enabled": true,
        "clientId": "your-client-id",
        "clientSecret": "your-client-secret",
        "authorizationUrl": "https://provider.example.com/authorize",
        "tokenUrl": "https://provider.example.com/token",
        "redirectUri": "https://your-server.com/oauth/callback",
        "scopes": ["read", "write"]
      }
    }
  }
}
```

OAuth 구성 속성:

| 재산               | 설명                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `enabled`          | 이 서버에 대해 OAuth 활성화(부울)                                                                           |
| `clientId`         | OAuth 클라이언트 식별자(문자열, 동적 등록의 경우 선택 사항)                                                 |
| `clientSecret`     | OAuth 클라이언트 비밀(문자열, 공개 클라이언트의 경우 선택 사항)                                             |
| `authorizationUrl` | OAuth 인증 엔드포인트(문자열, 생략 시 자동 검색)                                                            |
| `tokenUrl`         | OAuth 토큰 엔드포인트(문자열, 생략 시 자동 검색)                                                            |
| `scopes`           | 필수 OAuth 범위(문자열 배열)                                                                                |
| `redirectUri`      | 사용자 정의 리디렉션 URI(문자열)입니다.**원격 배포에 중요**. 기본값은`http://localhost:7777/oauth/callback` |
| `tokenParamName`   | SSE URL의 토큰에 대한 쿼리 매개변수 이름(문자열)                                                            |
| `audiences`        | 토큰이 유효한 대상(문자열 배열)                                                                             |

#### 토큰 관리

OAuth 토큰은 자동으로 다음과 같습니다.

- **안전하게 보관됨**\~에`~/.qwen/mcp-oauth-tokens.json`
- **새로 고침**만료된 경우(새로 고침 토큰을 사용할 수 있는 경우)
- **검증됨**각 연결 시도 전

사용`/mcp auth`Qwen Code 내의 명령을 사용하여 OAuth 인증을 대화형으로 관리합니다.

### 도구 필터링(서버별 도구 허용/거부)

사용`includeTools` / `excludeTools`서버에서 노출되는 도구를 제한합니다(Qwen Code의 관점에서).

예: 몇 가지 도구만 포함:

```json
{
  "mcpServers": {
    "filteredServer": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "includeTools": ["safe_tool", "file_reader", "data_processor"],
      "timeout": 30000
    }
  }
}
```

### 전역 허용/거부 목록

그만큼`mcp`당신의 반대`settings.json`모든 MCP 서버에 대한 전역 규칙을 정의합니다.

- `mcp.allowed`: MCP 서버 이름의 허용 목록(키`mcpServers`)
- `mcp.excluded`: MCP 서버 이름 거부 목록

예:

```json
{
  "mcp": {
    "allowed": ["my-trusted-server"],
    "excluded": ["experimental-server"]
  }
}
```

## 문제 해결

- **서버에 "연결 끊김"이 표시됩니다.`qwen mcp list`**: URL/명령이 올바른지 확인한 다음 증가시킵니다.`timeout`.
- **Stdio 서버가 시작되지 않습니다.**: 절대값 사용`command`경로를 확인하고 다시 확인하세요.`cwd`/`env`.
- **JSON의 환경 변수가 확인되지 않습니다.**: Qwen Code가 실행되는 환경에 존재하는지 확인합니다(셸과 GUI 앱 환경은 다를 수 있음).

## 참조

### `settings.json`구조

#### 서버별 구성(`mcpServers`)

추가`mcpServers`당신의 반대`settings.json`파일:

```json
// ... file contains other config objects
{
  "mcpServers": {
    "serverName": {
      "command": "path/to/server",
      "args": ["--arg1", "value1"],
      "env": {
        "API_KEY": "$MY_API_TOKEN"
      },
      "cwd": "./server-directory",
      "timeout": 30000,
      "trust": false
    }
  }
}
```

구성 속성:

필수(다음 중 하나):

| 재산      | 설명                                                 |
| --------- | ---------------------------------------------------- |
| `command` | Stdio 전송을 위한 실행 파일 경로                     |
| `url`     | SSE 엔드포인트 URL(예:`"http://localhost:8080/sse"`) |
| `httpUrl` | HTTP 스트리밍 엔드포인트 URL                         |

선택 과목:

| 재산                   | 유형/기본값               | 설명                                                                                                                                                                                                        |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`                 | 정렬                      | Stdio 전송을 위한 명령줄 인수                                                                                                                                                                               |
| `headers`              | 물체                      | 사용 시 사용자 정의 HTTP 헤더`url`또는`httpUrl`                                                                                                                                                             |
| `env`                  | 물체                      | 서버 프로세스의 환경 변수입니다. 값은 다음을 사용하여 환경 변수를 참조할 수 있습니다.`$VAR_NAME`또는`${VAR_NAME}`통사론                                                                                     |
| `cwd`                  | 끈                        | Stdio 전송을 위한 작업 디렉토리                                                                                                                                                                             |
| `timeout`              | 숫자<br>(기본값: 600,000) | 요청 제한 시간(밀리초)(기본값: 600,000ms = 10분)                                                                                                                                                            |
| `trust`                | 부울<br>(기본값: 거짓)    | 언제`true`, 이 서버에 대한 모든 도구 호출 확인을 우회합니다(기본값:`false`)                                                                                                                                 |
| `includeTools`         | 정렬                      | 이 MCP 서버에서 포함할 도구 이름 목록입니다. 지정하면 여기에 나열된 도구만 ​​이 서버에서 사용할 수 있습니다(허용 목록 동작). 지정하지 않으면 서버의 모든 도구가 기본적으로 활성화됩니다.                    |
| `excludeTools`         | 정렬                      | 이 MCP 서버에서 제외할 도구 이름 목록입니다. 여기에 나열된 도구는 서버에서 노출되더라도 모델에서 사용할 수 없습니다.<br>메모:`excludeTools`우선한다`includeTools`- 도구가 두 목록에 모두 있으면 제외됩니다. |
| `targetAudience`       | 끈                        | 액세스하려는 IAP로 보호되는 애플리케이션에 허용된 OAuth 클라이언트 ID입니다. 함께 사용`authProviderType: 'service_account_impersonation'`.                                                                  |
| `targetServiceAccount` | 끈                        | 가장할 Google 클라우드 서비스 계정의 이메일 주소입니다. 함께 사용`authProviderType: 'service_account_impersonation'`.                                                                                       |

<a id="qwen-mcp-cli"></a>

### MCP 서버 관리`qwen mcp`

수동으로 편집하여 언제든지 MCP 서버를 구성할 수 있습니다.`settings.json`, 그러나 일반적으로 CLI가 더 빠릅니다.

#### 서버 추가(`qwen mcp add`)

```bash
qwen mcp add [options] <name> <commandOrUrl> [args...]
```

| 인수/옵션                   | 설명                                                      | 기본                                   | 예                                                                 |
| --------------------------- | --------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `<name>`                    | 서버의 고유한 이름입니다.                                 | —                                      | `example-server`                                                   |
| `<commandOrUrl>`            | 실행할 명령(`stdio`) 또는 URL(`http`/`sse`).              | —                                      | `/usr/bin/python`또는`http://localhost:8`                          |
| `[args...]`                 | a에 대한 선택적 인수`stdio`명령.                          | —                                      | `--port 5000`                                                      |
| `-s`,`--scope`              | 구성 범위(사용자 또는 프로젝트).                          | `project`                              | `-s user`                                                          |
| `-t`,`--transport`          | 운송 유형(`stdio`,`sse`,`http`).                          | `stdio`                                | `-t sse`                                                           |
| `-e`,`--env`                | 환경 변수를 설정합니다.                                   | —                                      | `-e KEY=value`                                                     |
| `-H`,`--header`             | SSE 및 HTTP 전송을 위한 HTTP 헤더를 설정합니다.           | —                                      | `-H "X-Api-Key: abc123"`                                           |
| `--timeout`                 | 연결 시간 초과를 밀리초 단위로 설정합니다.                | —                                      | `--timeout 30000`                                                  |
| `--trust`                   | 서버를 신뢰하십시오(모든 도구 호출 확인 프롬프트를 우회). | — (`false`)                            | `--trust`                                                          |
| `--description`             | 서버에 대한 설명을 설정합니다.                            | —                                      | `--description "Local tools"`                                      |
| `--include-tools`           | 포함할 도구의 쉼표로 구분된 목록입니다.                   | 모든 도구 포함                         | `--include-tools mytool,othertool`                                 |
| `--exclude-tools`           | 제외할 도구의 쉼표로 구분된 목록입니다.                   | 없음                                   | `--exclude-tools mytool`                                           |
| `--oauth-client-id`         | MCP 서버 인증을 위한 OAuth 클라이언트 ID입니다.           | —                                      | `--oauth-client-id your-client-id`                                 |
| `--oauth-client-secret`     | MCP 서버 인증을 위한 OAuth 클라이언트 비밀번호입니다.     | —                                      | `--oauth-client-secret your-client-secret`                         |
| `--oauth-redirect-uri`      | 인증 콜백을 위한 OAuth 리디렉션 URI입니다.                | `http://localhost:7777/oauth/callback` | `--oauth-redirect-uri https://your-server.com/oauth/callback`      |
| `--oauth-authorization-url` | OAuth 인증 URL입니다.                                     | —                                      | `--oauth-authorization-url https://provider.example.com/authorize` |
| `--oauth-token-url`         | OAuth 토큰 URL.                                           | —                                      | `--oauth-token-url https://provider.example.com/token`             |
| `--oauth-scopes`            | OAuth 범위(쉼표로 구분)                                   | —                                      | `--oauth-scopes scope1,scope2`                                     |

> `--oauth-*`플래그는 다음에만 적용됩니다.`--transport sse`그리고`--transport http`. 그것들을 결합하여`--transport stdio`거부됩니다.

#### 서버 제거(`qwen mcp remove`)

```bash
qwen mcp remove <name>
```
