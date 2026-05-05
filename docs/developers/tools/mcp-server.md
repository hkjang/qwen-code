# Qwen 코드가 포함된 MCP 서버

이 문서에서는 Qwen Code를 사용하여 MCP(Model Context Protocol) 서버를 구성하고 사용하는 방법에 대한 지침을 제공합니다.

## MCP 서버란 무엇입니까?

MCP 서버는 모델 컨텍스트 프로토콜을 통해 CLI에 도구와 리소스를 노출하여 외부 시스템 및 데이터 소스와 상호 작용할 수 있도록 하는 애플리케이션입니다. MCP 서버는 모델과 로컬 환경 또는 API와 같은 기타 서비스 간의 브리지 역할을 합니다.

MCP 서버는 CLI를 통해 다음을 수행합니다.

* **도구 검색:**표준화된 스키마 정의를 통해 사용 가능한 도구, 설명 및 매개변수를 나열합니다.
* **도구 실행:**정의된 인수로 특정 도구를 호출하고 구조화된 응답을 받습니다.
* **리소스에 액세스:**특정 리소스에서 데이터를 읽습니다(CLI는 주로 도구 실행에 중점을 둡니다).

MCP 서버를 사용하면 CLI 기능을 확장하여 데이터베이스, API, 사용자 정의 스크립트 또는 특수 워크플로우와의 상호 작용과 같은 기본 제공 기능 이상의 작업을 수행할 수 있습니다.

## 핵심 통합 아키텍처

Qwen Code는 핵심 패키지에 내장된 정교한 검색 및 실행 시스템을 통해 MCP 서버와 통합됩니다(`packages/core/src/tools/`):

### 검색 계층(`mcp-client.ts`)

검색 프로세스는 다음에 의해 조정됩니다.`discoverMcpTools()`, 어느:

1. **구성된 서버를 반복합니다.**당신의`settings.json` `mcpServers`구성
2. **연결을 설정합니다.**적절한 전송 메커니즘(Stdio, SSE 또는 Streamable HTTP) 사용
3. **도구 정의를 가져옵니다.**MCP 프로토콜을 사용하는 각 서버에서
4. **정리 및 유효성 검사**Qwen API와의 호환성을 위한 도구 스키마
5. **도구 등록**충돌 해결 기능이 있는 전역 도구 레지스트리

### 실행 계층(`mcp-tool.ts`)

발견된 각 MCP 도구는`DiscoveredMCPTool`다음과 같은 경우:

* **확인 논리를 처리합니다.**서버 신뢰 설정 및 사용자 기본 설정에 따라
* **도구 실행을 관리합니다.**적절한 매개변수를 사용하여 MCP 서버를 호출하여
* **응답 처리**LLM 컨텍스트와 사용자 디스플레이 모두에 대해
* **연결 상태를 유지합니다**시간 초과를 처리합니다.

### 운송 메커니즘

CLI는 세 가지 MCP 전송 유형을 지원합니다.

* **스튜디오 전송:**하위 프로세스를 생성하고 stdin/stdout을 통해 통신합니다.
* **SSE 전송:**서버에서 보낸 이벤트 엔드포인트에 연결
* **스트리밍 가능한 HTTP 전송:**통신에 HTTP 스트리밍을 사용합니다.

## MCP 서버를 설정하는 방법

Qwen 코드는`mcpServers`당신의 구성`settings.json`파일을 사용하여 MCP 서버를 찾고 연결합니다. 이 구성은 다양한 전송 메커니즘을 사용하는 여러 서버를 지원합니다.

### settings.json에서 MCP 서버 구성

MCP 서버를 구성할 수 있습니다.`settings.json`두 가지 주요 방법으로 파일을 제출합니다. 최상위 수준을 통해`mcpServers`특정 서버 정의에 대한 개체 및`mcp`서버 검색 및 실행을 제어하는 ​​전역 설정에 대한 개체입니다.

#### 전역 MCP 설정(`mcp`)

그만큼`mcp`당신의 반대`settings.json`모든 MCP 서버에 대한 전역 규칙을 정의할 수 있습니다.

* **`mcp.serverCommand`**(문자열): MCP 서버를 시작하는 전역 명령입니다.
* **`mcp.allowed`**(문자열 배열): 허용할 MCP 서버 이름 목록입니다. 이것이 설정되면 이 목록의 서버만(`mcpServers`개체)에 연결됩니다.
* **`mcp.excluded`**(문자열 배열): 제외할 MCP 서버 이름 목록입니다. 이 목록의 서버는 연결되지 않습니다.

**예:**

```json
{
  "mcp": {
    "allowed": ["my-trusted-server"],
    "excluded": ["experimental-server"]
  }
}
```

#### 서버별 구성(`mcpServers`)

그만큼`mcpServers`개체는 CLI를 연결하려는 개별 MCP 서버를 정의하는 곳입니다.

### 구성 구조

추가`mcpServers`당신의 반대`settings.json`파일:

```json
{ ...file contains other config objects
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

### 구성 속성

각 서버 구성은 다음 속성을 지원합니다.

#### 필수(다음 중 하나)

* **`command`**(문자열): Stdio 전송을 위한 실행 파일 경로
* **`url`**(문자열): SSE 엔드포인트 URL(예:`"http://localhost:8080/sse"`)
* **`httpUrl`**(문자열): HTTP 스트리밍 엔드포인트 URL

#### 선택 과목

* **`args`**(string\[]): Stdio 전송을 위한 명령줄 인수
* **`headers`**(객체): 사용 시 사용자 정의 HTTP 헤더`url`또는`httpUrl`
* **`env`**(객체): 서버 프로세스에 대한 환경 변수입니다. 값은 다음을 사용하여 환경 변수를 참조할 수 있습니다.`$VAR_NAME`또는`${VAR_NAME}`통사론
* **`cwd`**(문자열): Stdio 전송을 위한 작업 디렉터리
* **`timeout`**(숫자): 요청 제한 시간(밀리초)(기본값: 600,000ms = 10분)
* **`trust`**(부울): 언제`true`, 이 서버에 대한 모든 도구 호출 확인을 우회합니다(기본값:`false`)
* **`includeTools`**(string\[]): 이 MCP 서버에서 포함할 도구 이름 목록입니다. 지정하면 여기에 나열된 도구만 ​​이 서버에서 사용할 수 있습니다(허용 목록 동작). 지정하지 않으면 서버의 모든 도구가 기본적으로 활성화됩니다.
* **`excludeTools`**(string\[]): 이 MCP 서버에서 제외할 도구 이름 목록입니다. 여기에 나열된 도구는 서버에서 노출되더라도 모델에서 사용할 수 없습니다.**메모:** `excludeTools`우선한다`includeTools`- 도구가 두 목록에 모두 있으면 제외됩니다.
* **`targetAudience`**(문자열): 액세스하려는 IAP 보호 애플리케이션에 허용된 OAuth 클라이언트 ID입니다. 함께 사용`authProviderType: 'service_account_impersonation'`.
* **`targetServiceAccount`**(문자열): 가장할 Google 클라우드 서비스 계정의 이메일 주소입니다. 함께 사용`authProviderType: 'service_account_impersonation'`.

### 원격 MCP 서버에 대한 OAuth 지원

Qwen Code는 SSE 또는 HTTP 전송을 사용하여 원격 MCP 서버에 대한 OAuth 2.0 인증을 지원합니다. 이를 통해 인증이 필요한 MCP 서버에 안전하게 액세스할 수 있습니다.

#### 자동 OAuth 검색

OAuth 검색을 지원하는 서버의 경우 OAuth 구성을 생략하고 CLI가 자동으로 검색하도록 할 수 있습니다.

```json
{
  "mcpServers": {
    "discoveredServer": {
      "url": "https://api.example.com/sse"
    }
  }
}
```

CLI는 자동으로 다음을 수행합니다.

* 서버에 OAuth 인증이 필요한 시기 감지(401 응답)
* 서버 메타데이터에서 OAuth 엔드포인트 검색
* 지원되는 경우 동적 클라이언트 등록 수행
* OAuth 흐름 및 토큰 관리 처리

#### 인증 흐름

OAuth 지원 서버에 연결하는 경우:

1. **초기 연결 시도**401 Unauthorized로 실패
2. **OAuth 검색**인증 및 토큰 엔드포인트를 찾습니다.
3. **브라우저가 열립니다**사용자 인증을 위해 (로컬 브라우저 접속 필요)
4. **인증 코드**액세스 토큰으로 교환됩니다.
5. **토큰이 저장됩니다**향후 사용을 위해 안전하게
6. **연결 재시도**유효한 토큰으로 성공

#### 브라우저 리디렉션 요구 사항

**중요한:**OAuth 인증을 위해서는 리디렉션 URI에 액세스할 수 있어야 합니다.

* **기본 동작**: 다음으로 리디렉션됩니다.`http://localhost:7777/oauth/callback`(로컬 설정에서 작동)
* **사용자 정의 리디렉션 URI**: 사용`--oauth-redirect-uri`또는 구성`redirectUri`settings.json에서 다른 URL을 지정

을 위한**원격/클라우드 서버 배포**(예: 웹 터미널, SSH 세션, 클라우드 IDE):

* 기본값`localhost`리디렉션이 작동하지 않습니다
* 사용자 정의를 구성해야 합니다.`redirectUri`공개적으로 접근 가능한 URL을 가리키는 것
* 사용자의 브라우저는 이 URL에 접속하여 서버로 다시 리디렉션할 수 있어야 합니다.

원격 서버의 예:

```bash
qwen mcp add --transport sse remote-server https://api.example.com/sse/ \
  --oauth-redirect-uri https://your-remote-server.example.com/oauth/callback
```

OAuth는 다음에서 작동하지 않습니다.

* 브라우저 액세스가 없는 헤드리스 환경
* 구성된 환경`redirectUri`사용자의 브라우저에서 접근할 수 없습니다

#### OAuth 인증 관리

사용`/mcp auth`OAuth 인증을 관리하는 명령:

```bash
# List servers requiring authentication
/mcp auth

# Authenticate with a specific server
/mcp auth serverName

# Re-authenticate if tokens expire
/mcp auth serverName
```

#### OAuth 구성 속성

* **`enabled`**(부울): 이 서버에 대해 OAuth를 활성화합니다.
* **`clientId`**(문자열): OAuth 클라이언트 식별자(동적 등록의 경우 선택 사항)
* **`clientSecret`**(문자열): OAuth 클라이언트 비밀번호(퍼블릭 클라이언트의 경우 선택 사항)
* **`authorizationUrl`**(문자열): OAuth 인증 엔드포인트(생략 시 자동 검색)
* **`tokenUrl`**(문자열): OAuth 토큰 엔드포인트(생략 시 자동 검색)
* **`scopes`**(string\[]): 필수 OAuth 범위
* **`redirectUri`**(문자열): 사용자 정의 리디렉션 URI.**원격 배포에 중요**: 기본값은`http://localhost:7777/oauth/callback`. 원격/클라우드 서버에서 Qwen Code를 실행할 때 이를 공개적으로 액세스할 수 있는 URL로 설정합니다(예:`https://your-server.com/oauth/callback`). 다음을 통해 구성할 수 있습니다.`qwen mcp add --oauth-redirect-uri`또는 settings.json에서 직접.
* **`tokenParamName`**(문자열): SSE URL의 토큰에 대한 쿼리 매개변수 이름
* **`audiences`**(string\[]): 토큰이 유효한 대상

#### 토큰 관리

OAuth 토큰은 자동으로 다음과 같습니다.

* **안전하게 보관됨**\~에`~/.qwen/mcp-oauth-tokens.json`
* **새로 고침**만료된 경우(새로 고침 토큰을 사용할 수 있는 경우)
* **검증됨**각 연결 시도 전
* **정리됨**유효하지 않거나 만료된 경우

#### 인증 공급자 유형

다음을 사용하여 인증 공급자 유형을 지정할 수 있습니다.`authProviderType`재산:

* **`authProviderType`**(문자열): 인증 공급자를 지정합니다. 다음 중 하나일 수 있습니다.
  * **`dynamic_discovery`**(기본값): CLI가 서버에서 OAuth 구성을 자동으로 검색합니다.
  * **`google_credentials`**: CLI는 Google 애플리케이션 기본 자격 증명(ADC)을 사용하여 서버를 인증합니다. 이 공급자를 사용할 때는 필수 범위를 지정해야 합니다.
  * **`service_account_impersonation`**: CLI는 서버 인증을 위해 Google 클라우드 서비스 계정을 가장합니다. 이는 IAP로 보호되는 서비스에 액세스하는 데 유용합니다(Cloud Run 서비스용으로 특별히 설계됨).

#### Google 자격 증명

```json
{
  "mcpServers": {
    "googleCloudServer": {
      "httpUrl": "https://my-gcp-service.run.app/mcp",
      "authProviderType": "google_credentials",
      "oauth": {
        "scopes": ["https://www.googleapis.com/auth/userinfo.email"]
      }
    }
  }
}
```

#### 서비스 계정 가장

서비스 계정 가장을 사용하여 서버에 인증하려면 다음을 설정해야 합니다.`authProviderType`에게`service_account_impersonation`다음 속성을 제공합니다.

* **`targetAudience`**(문자열): 액세스하려는 IAP 보호 애플리케이션에 허용 목록에 있는 OAuth 클라이언트 ID입니다.
* **`targetServiceAccount`**(문자열): 가장할 Google 클라우드 서비스 계정의 이메일 주소입니다.

CLI는 로컬 ADC(애플리케이션 기본 자격 증명)를 사용하여 지정된 서비스 계정 및 대상에 대한 OIDC ID 토큰을 생성합니다. 그런 다음 이 토큰은 MCP 서버를 인증하는 데 사용됩니다.

#### 설정 지침

1. **[만들다](https://cloud.google.com/iap/docs/oauth-client-creation)또는 기존 OAuth 2.0 클라이언트 ID를 사용하세요.**기존 OAuth 2.0 클라이언트 ID를 사용하려면 다음 단계를 따르세요.[OAuth 클라이언트를 공유하는 방법](https://cloud.google.com/iap/docs/sharing-oauth-clients).
2. **다음의 허용 목록에 OAuth ID를 추가하세요.[프로그래밍 방식의 액세스](https://cloud.google.com/iap/docs/sharing-oauth-clients#programmatic_access)신청을 위해.**Cloud Run은 아직 gcloud iap에서 지원되는 리소스 유형이 아니므로 프로젝트에서 클라이언트 ID를 허용 목록에 추가해야 합니다.
3. **서비스 계정을 만듭니다.** [선적 서류 비치](https://cloud.google.com/iam/docs/service-accounts-create#creating),[Cloud 콘솔 링크](https://console.cloud.google.com/iam-admin/serviceaccounts)
4. **IAP 정책에 서비스 계정과 사용자를 모두 추가합니다.**Cloud Run 서비스 자체의 '보안' 탭에서 또는 gcloud를 통해
5. **모든 사용자 및 그룹에 부여**MCP 서버에 액세스하는 데 필요한 권한은 누구에게 있습니까?[서비스 계정을 가장](https://cloud.google.com/docs/authentication/use-service-account-impersonation)(즉.,`roles/iam.serviceAccountTokenCreator`).
6. **[할 수 있게 하다](https://console.cloud.google.com/apis/library/iamcredentials.googleapis.com)IAM 자격 증명 API**당신의 프로젝트를 위해.

### 구성 예

#### Python MCP 서버(Stdio)

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

#### Node.js MCP 서버(Stdio)

```json
{
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["dist/server.js", "--verbose"],
      "cwd": "./mcp-servers/node",
      "trust": true
    }
  }
}
```

#### Docker 기반 MCP 서버

```json
{
  "mcpServers": {
    "dockerizedServer": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "API_KEY",
        "-v",
        "${PWD}:/workspace",
        "my-mcp-server:latest"
      ],
      "env": {
        "API_KEY": "$EXTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

#### HTTP 기반 MCP 서버

```json
{
  "mcpServers": {
    "httpServer": {
      "httpUrl": "http://localhost:3000/mcp",
      "timeout": 5000
    }
  }
}
```

#### 사용자 정의 헤더가 있는 HTTP 기반 MCP 서버

```json
{
  "mcpServers": {
    "httpServerWithAuth": {
      "httpUrl": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token",
        "X-Custom-Header": "custom-value",
        "Content-Type": "application/json"
      },
      "timeout": 5000
    }
  }
}
```

#### 도구 필터링 기능이 있는 MCP 서버

```json
{
  "mcpServers": {
    "filteredServer": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "includeTools": ["safe_tool", "file_reader", "data_processor"],
      // "excludeTools": ["dangerous_tool", "file_deleter"],
      "timeout": 30000
    }
  }
}
```

### SA 가장을 사용하는 SSE MCP 서버

```json
{
  "mcpServers": {
    "myIapProtectedServer": {
      "url": "https://my-iap-service.run.app/sse",
      "authProviderType": "service_account_impersonation",
      "targetAudience": "YOUR_IAP_CLIENT_ID.apps.googleusercontent.com",
      "targetServiceAccount": "your-sa@your-project.iam.gserviceaccount.com"
    }
  }
}
```

## 발견 프로세스 심층 분석

Qwen Code가 시작되면 다음과 같은 세부 프로세스를 통해 MCP 서버 검색을 수행합니다.

### 1. 서버 반복 및 연결

구성된 각 서버에 대해`mcpServers`:

1. **상태 추적이 시작됩니다.**서버 상태가 다음으로 설정되었습니다.`CONNECTING`
2. **운송 선택:**구성 속성을 기반으로 합니다.
   * `httpUrl`→`StreamableHTTPClientTransport`
   * `url`→`SSEClientTransport`
   * `command`→`StdioClientTransport`
3. **연결 설정:**MCP 클라이언트는 구성된 시간 초과로 연결을 시도합니다.
4. **오류 처리:**연결 실패가 기록되고 서버 상태가 다음으로 설정됩니다.`DISCONNECTED`

### 2. 도구 발견

성공적으로 연결되면:

1. **도구 목록:**클라이언트는 MCP 서버의 도구 목록 끝점을 호출합니다.
2. **스키마 유효성 검사:**각 도구의 기능 선언이 검증되었습니다.
3. **도구 필터링:**도구는 다음을 기준으로 필터링됩니다.`includeTools`그리고`excludeTools`구성
4. **이름 삭제:**Qwen API 요구 사항을 충족하도록 도구 이름이 정리되었습니다.
   * 잘못된 문자(영숫자가 아닌 문자, 밑줄, 점, 하이픈)는 밑줄로 대체됩니다.
   * 63자를 초과하는 이름은 중간 대체(`___`)

### 3. 갈등 해결

여러 서버가 동일한 이름의 도구를 노출하는 경우:

1. **첫 번째 등록 승리:**도구 이름을 등록하는 첫 번째 서버는 접두사가 없는 이름을 얻습니다.
2. **자동 접두어 지정:**후속 서버에는 접두사가 붙은 이름이 붙습니다.`serverName__toolName`
3. **레지스트리 추적:**도구 레지스트리는 서버 이름과 해당 도구 간의 매핑을 유지합니다.

### 4. 스키마 처리

도구 매개변수 스키마는 API 호환성을 위해 정리됩니다.

* **`$schema`속성**제거되었습니다
* **`additionalProperties`**벗겨졌다
* **`anyOf`\~와 함께`default`**기본값이 제거되었습니다(Vertex AI 호환성).
* **재귀적 처리**중첩된 스키마에 적용

### 5. 연결 관리

발견 후:

* **지속적인 연결:**도구를 성공적으로 등록한 서버는 연결을 유지합니다.
* **대청소:**사용 가능한 도구를 제공하지 않는 서버는 연결이 닫혀 있습니다.
* **상태 업데이트:**최종 서버 상태는 다음과 같이 설정됩니다.`CONNECTED`또는`DISCONNECTED`

## 도구 실행 흐름

모델이 MCP 도구를 사용하기로 결정하면 다음과 같은 실행 흐름이 발생합니다.

### 1. 도구 호출

모델은`FunctionCall`와 함께:

* **도구 이름:**등록된 이름(접두사가 붙을 수 있음)
* **인수:**도구의 매개변수 스키마와 일치하는 JSON 객체

### 2. 확인절차

각`DiscoveredMCPTool`정교한 확인 논리를 구현합니다.

#### 신뢰 기반 우회

```typescript
if (this.trust) {
  return false; // No confirmation needed
}
```

#### 동적 허용 목록

시스템은 다음에 대한 내부 허용 목록을 유지합니다.

* **서버 수준:** `serverName`→ 이 서버의 모든 도구는 신뢰할 수 있습니다
* **도구 수준:** `serverName.toolName`→ 이 특정 도구는 신뢰할 수 있습니다

#### 사용자 선택 처리

확인이 필요한 경우 사용자는 다음을 선택할 수 있습니다.

* **한 번만 진행하세요.**이번만 실행
* **이 도구를 항상 허용합니다.**도구 수준 허용 목록에 추가
* **항상 이 서버를 허용합니다.**서버 수준 허용 목록에 추가
* **취소:**실행 중단

### 3. 실행

확인 시(또는 신뢰 우회):

1. **매개변수 준비:**인수는 도구의 스키마에 대해 검증됩니다.

2. **MCP 호출:**기본`CallableTool`다음을 사용하여 서버를 호출합니다.

   ```typescript
   const functionCalls = [
     {
       name: this.serverToolName, // Original server tool name
       args: params,
     },
   ];
   ```

3. **응답 처리:**결과는 LLM 컨텍스트와 사용자 디스플레이 모두에 맞게 형식화됩니다.

### 4. 응답 처리

실행 결과에는 다음이 포함됩니다.

* **`llmContent`:**언어 모델의 컨텍스트에 대한 원시 응답 부분
* **`returnDisplay`:**사용자 표시를 위한 형식화된 출력(종종 마크다운 코드 블록의 JSON)

## MCP 서버와 상호 작용하는 방법

### 사용하여`/mcp`명령

그만큼`/mcp`명령은 MCP 서버 설정에 대한 포괄적인 정보를 제공합니다.

```bash
/mcp
```

다음이 표시됩니다.

* **서버 목록:**구성된 모든 MCP 서버
* **연결 상태:** `CONNECTED`,`CONNECTING`, 또는`DISCONNECTED`
* **서버 세부정보:**구성 요약(민감한 데이터 제외)
* **사용 가능한 도구:**설명이 포함된 각 서버의 도구 목록
* **검색 상태:**전반적인 검색 프로세스 상태

### 예`/mcp`산출

```
MCP Servers Status:

📡 pythonTools (CONNECTED)
  Command: python -m my_mcp_server --port 8080
  Working Directory: ./mcp-servers/python
  Timeout: 15000ms
  Tools: calculate_sum, file_analyzer, data_processor

🔌 nodeServer (DISCONNECTED)
  Command: node dist/server.js --verbose
  Error: Connection refused

🐳 dockerizedServer (CONNECTED)
  Command: docker run -i --rm -e API_KEY my-mcp-server:latest
  Tools: docker__deploy, docker__status

Discovery State: COMPLETED
```

### 도구 사용법

일단 발견되면 MCP 도구는 내장 도구처럼 Qwen 모델에서 사용할 수 있습니다. 모델은 자동으로 다음을 수행합니다.

1. **적절한 도구 선택**귀하의 요청에 따라
2. **확인 대화상자 표시**(서버를 신뢰할 수 없는 경우)
3. **도구 실행**적절한 매개변수를 사용하여
4. **결과 표시**사용자 친화적인 형식으로

## 상태 모니터링 및 문제 해결

### 연결 상태

MCP 통합은 다음과 같은 여러 상태를 추적합니다.

#### 서버상태(`MCPServerStatus`)

* **`DISCONNECTED`:**서버가 연결되지 않았거나 오류가 있습니다
* **`CONNECTING`:**연결 시도 진행 중
* **`CONNECTED`:**서버가 연결되어 준비되었습니다.

#### 검색 상태(`MCPDiscoveryState`)

* **`NOT_STARTED`:**검색이 시작되지 않았습니다.
* **`IN_PROGRESS`:**현재 서버를 검색하는 중입니다.
* **`COMPLETED`:**검색 완료(오류 유무)

### 일반적인 문제 및 해결 방법

#### 서버가 연결되지 않음

**증상:**서버 쇼`DISCONNECTED`상태

**문제 해결:**

1. **구성을 확인하세요.**확인하다`command`,`args`, 그리고`cwd`맞다
2. **수동으로 테스트:**서버 명령을 직접 실행하여 작동하는지 확인하세요.
3. **종속성을 확인합니다.**필요한 모든 패키지가 설치되어 있는지 확인하십시오.
4. **로그 검토:**CLI 출력에서 ​​오류 메시지를 찾습니다.
5. **권한 확인:**CLI가 서버 명령을 실행할 수 있는지 확인

#### 발견된 도구 없음

**증상:**서버가 연결되었지만 사용할 수 있는 도구가 없습니다.

**문제 해결:**

1. **도구 등록 확인:**서버가 실제로 도구를 등록하는지 확인하세요.
2. **MCP 프로토콜을 확인하십시오.**서버가 MCP 도구 목록을 올바르게 구현하는지 확인하세요.
3. **서버 로그 검토:**서버 측 오류에 대한 stderr 출력을 확인하십시오.
4. **테스트 도구 목록:**서버의 도구 검색 엔드포인트를 수동으로 테스트하세요.

#### 도구가 실행되지 않음

**증상:**도구가 발견되었지만 실행 중에 실패함

**문제 해결:**

1. **매개변수 검증:**도구가 예상 매개변수를 수용하는지 확인하세요.
2. **스키마 호환성:**입력 스키마가 유효한 JSON 스키마인지 확인하세요.
3. **오류 처리:**도구에서 처리되지 않은 예외가 발생하는지 확인하세요.
4. **시간 초과 문제:**증가하는 것을 고려하십시오.`timeout`환경

#### 샌드박스 호환성

**증상:**샌드박싱이 활성화되면 MCP 서버가 실패합니다.

**솔루션:**

1. **Docker 기반 서버:**모든 종속성을 포함하는 Docker 컨테이너 사용
2. **경로 접근성:**샌드박스에서 서버 실행 파일을 사용할 수 있는지 확인하세요.
3. **네트워크 액세스:**필요한 네트워크 연결을 허용하도록 샌드박스 구성
4. **환경 변수:**필수 환경 변수가 전달되는지 확인

### 디버깅 팁

1. **디버그 모드 활성화:**다음으로 CLI를 실행하세요.`--debug`자세한 출력을 위해
2. **표준 오류를 확인하십시오.**MCP 서버 stderr이 캡처되고 기록됩니다(INFO 메시지가 필터링됨).
3. **테스트 격리:**통합하기 전에 MCP 서버를 독립적으로 테스트하십시오.
4. **증분 설정:**복잡한 기능을 추가하기 전에 간단한 도구로 시작하세요
5. **사용`/mcp`자주:**개발 중 서버 상태 모니터링

## 중요 사항

### 보안 고려 사항

* **신뢰 설정:**그만큼`trust`옵션은 모든 확인 대화 상자를 무시합니다. 주의 깊게 사용하고 완전히 제어하는 ​​서버에만 사용하세요.
* **액세스 토큰:**API 키 또는 토큰이 포함된 환경 변수를 구성할 때 보안에 유의하세요.
* **샌드박스 호환성:**샌드박싱을 사용할 때 샌드박스 환경 내에서 MCP 서버를 사용할 수 있는지 확인하십시오.
* **개인 데이터:**광범위한 개인 액세스 토큰을 사용하면 저장소 간 정보 유출이 발생할 수 있습니다.

### 성능 및 자원 관리

* **연결 지속성:**CLI는 도구를 성공적으로 등록하는 서버에 대한 지속적인 연결을 유지합니다.
* **자동 정리:**도구를 제공하지 않는 서버에 대한 연결은 자동으로 닫힙니다.
* **시간 초과 관리:**서버의 응답 특성에 따라 적절한 시간 제한을 구성하세요.
* **리소스 모니터링:**MCP 서버는 별도의 프로세스로 실행되고 시스템 리소스를 소비합니다.

### 스키마 호환성

* **스키마 준수 모드:**기본적으로 (`schemaCompliance: "auto"`), 도구 스키마는 있는 그대로 전달됩니다. 세트`"model": { "generationConfig": { "schemaCompliance": "openapi_30" } }`당신의`settings.json`모델을 Strict OpenAPI 3.0 형식으로 변환합니다.
* **OpenAPI 3.0 변환:**언제`openapi_30`모드가 활성화되면 시스템은 다음을 처리합니다.
  * Null 허용 유형:`["string", "null"]`->`type: "string", nullable: true`
  * 상수 값:`const: "foo"`->`enum: ["foo"]`
  * 배타적 제한: 숫자`exclusiveMinimum`-> 부울 형식`minimum`
  * 키워드 제거:`$schema`,`$id`,`dependencies`,`patternProperties`
* **이름 삭제:**도구 이름은 API 요구 사항을 충족하기 위해 자동으로 삭제됩니다.
* **충돌 해결:**서버 간의 도구 이름 충돌은 자동 접두사 지정을 통해 해결됩니다.

이러한 포괄적인 통합을 통해 MCP 서버는 보안, 안정성 및 사용 편의성을 유지하면서 CLI의 기능을 확장할 수 있는 강력한 방법이 됩니다.

## 도구에서 리치 콘텐츠 반환

MCP 도구는 단순 텍스트 반환에만 국한되지 않습니다. 단일 도구 응답으로 텍스트, 이미지, 오디오 및 기타 이진 데이터를 포함한 풍부한 다중 부분 콘텐츠를 반환할 수 있습니다. 이를 통해 한 번에 모델에 다양한 정보를 제공할 수 있는 강력한 도구를 구축할 수 있습니다.

도구에서 반환된 모든 데이터는 처리되어 차세대를 위한 컨텍스트로 모델에 전송되어 제공된 정보에 대해 추론하거나 요약할 수 있습니다.

### 작동 방식

풍부한 콘텐츠를 반환하려면 도구의 응답이 MCP 사양을 준수해야 합니다.[`CallToolResult`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result). 그만큼`content`결과 필드는 다음의 배열이어야 합니다.`ContentBlock`사물. CLI는 이 배열을 올바르게 처리하여 이진 데이터에서 텍스트를 분리하고 모델에 맞게 패키징합니다.

다양한 콘텐츠 블록 유형을 혼합하고 일치시킬 수 있습니다.`content`정렬. 지원되는 블록 유형은 다음과 같습니다.

* `text`
* `image`
* `audio`
* `resource`(내장된 콘텐츠)
* `resource_link`

### 예: 텍스트 및 이미지 반환

다음은 텍스트 설명과 이미지를 모두 반환하는 MCP 도구의 유효한 JSON 응답 예입니다.

```json
{
  "content": [
    {
      "type": "text",
      "text": "Here is the logo you requested."
    },
    {
      "type": "image",
      "data": "BASE64_ENCODED_IMAGE_DATA_HERE",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "The logo was created in 2025."
    }
  ]
}
```

Qwen Code가 이 응답을 받으면 다음을 수행합니다.

1. 모든 텍스트를 추출하여 하나의 텍스트로 결합합니다.`functionResponse`모델에 대한 부분입니다.
2. 이미지 데이터를 별도로 표시`inlineData`부분.
3. CLI에서 텍스트와 이미지가 모두 수신되었음을 나타내는 깔끔하고 사용자 친화적인 요약을 제공합니다.

이를 통해 Qwen 모델에 풍부한 다중 모드 컨텍스트를 제공할 수 있는 정교한 도구를 구축할 수 있습니다.

## 슬래시 명령으로 MCP 프롬프트

도구 외에도 MCP 서버는 Qwen Code 내에서 슬래시 명령으로 실행할 수 있는 사전 정의된 프롬프트를 노출할 수 있습니다. 이를 통해 이름으로 쉽게 호출할 수 있는 일반 쿼리 또는 복잡한 쿼리에 대한 바로 가기를 만들 수 있습니다.

### 서버에서 프롬프트 정의

다음은 프롬프트를 정의하는 stdio MCP 서버의 작은 예입니다.

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompt-server',
  version: '1.0.0',
});

server.registerPrompt(
  'poem-writer',
  {
    title: 'Poem Writer',
    description: 'Write a nice haiku',
    argsSchema: { title: z.string(), mood: z.string().optional() },
  },
  ({ title, mood }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Write a haiku${mood ? ` with the mood ${mood}` : ''} called ${title}. Note that a haiku is 5 syllables followed by 7 syllables followed by 5 syllables `,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

이는 다음 항목에 포함될 수 있습니다.`settings.json`아래에`mcpServers`와 함께:

```json
{
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["filename.ts"]
    }
  }
}
```

### 프롬프트 호출

프롬프트가 발견되면 해당 이름을 슬래시 명령으로 사용하여 호출할 수 있습니다. CLI는 구문 분석 인수를 자동으로 처리합니다.

```bash
/poem-writer --title="Qwen Code" --mood="reverent"
```

또는 위치 인수를 사용하여:

```bash
/poem-writer "Qwen Code" reverent
```

이 명령을 실행하면 CLI가 다음을 실행합니다.`prompts/get`제공된 인수를 사용하여 MCP 서버의 메서드입니다. 서버는 인수를 프롬프트 템플릿으로 대체하고 최종 프롬프트 텍스트를 반환하는 일을 담당합니다. 그런 다음 CLI는 실행을 위해 이 프롬프트를 모델에 보냅니다. 이는 일반적인 작업 흐름을 자동화하고 공유하는 편리한 방법을 제공합니다.

## MCP 서버 관리`qwen mcp`

수동으로 편집하여 언제든지 MCP 서버를 구성할 수 있습니다.`settings.json`파일에서 CLI는 프로그래밍 방식으로 서버 구성을 관리할 수 있는 편리한 명령 세트를 제공합니다. 이러한 명령은 JSON 파일을 직접 편집할 필요 없이 MCP 서버를 추가, 나열 및 제거하는 프로세스를 간소화합니다.

### 서버 추가(`qwen mcp add`)

그만큼`add`명령은 새 MCP 서버를 구성합니다.`settings.json`. 범위(`-s, --scope`), 사용자 구성에 추가됩니다.`~/.qwen/settings.json`또는 프로젝트 구성`.qwen/settings.json`파일.

**명령:**

```bash
qwen mcp add [options] <name> <commandOrUrl> [args...]
```

* `<name>`: 서버의 고유 이름입니다.
* `<commandOrUrl>`: 실행할 명령(`stdio`) 또는 URL(`http`/`sse`).
* `[args...]`: a에 대한 선택적 인수`stdio`명령.

**옵션(플래그):**

* `-s, --scope`: 구성 범위(사용자 또는 프로젝트). \[기본값: "프로젝트"]
* `-t, --transport`: 전송 유형(stdio, sse, http). \[기본값: "stdio"]
* `-e, --env`: 환경 변수를 설정합니다(예: -e KEY=value).
* `-H, --header`: SSE 및 HTTP 전송을 위한 HTTP 헤더를 설정합니다(예: -H "X-Api-Key: abc123" -H "Authorization: Bearer abc123").
* `--timeout`: 연결 시간 초과를 밀리초 단위로 설정합니다.
* `--trust`: 서버를 신뢰합니다(모든 도구 호출 확인 메시지를 무시합니다).
* `--description`: 서버에 대한 설명을 설정합니다.
* `--include-tools`: 포함할 도구의 쉼표로 구분된 목록입니다.
* `--exclude-tools`: 제외할 도구의 쉼표로 구분된 목록입니다.
* `--oauth-client-id`: MCP 서버 인증을 위한 OAuth 클라이언트 ID입니다.
* `--oauth-client-secret`: MCP 서버 인증을 위한 OAuth 클라이언트 비밀번호입니다.
* `--oauth-redirect-uri`: OAuth 리디렉션 URI(예:`https://your-server.com/oauth/callback`). 기본값은`http://localhost:7777/oauth/callback`로컬 설정용.**원격 배포에 중요**: 원격/클라우드 서버에서 Qwen Code를 실행하는 경우 공개적으로 액세스할 수 있는 URL로 설정합니다.
* `--oauth-authorization-url`: OAuth 인증 URL입니다.
* `--oauth-token-url`: OAuth 토큰 URL.
* `--oauth-scopes`: OAuth 범위(쉼표로 구분).

#### stdio 서버 추가

이는 로컬 서버를 실행하기 위한 기본 전송입니다.

```bash
# Basic syntax
qwen mcp add <name> <command> [args...]

# Example: Adding a local server
qwen mcp add my-stdio-server -e API_KEY=123 /path/to/server arg1 arg2 arg3

# Example: Adding a local python server
qwen mcp add python-server python server.py --port 8080
```

#### HTTP 서버 추가

이 전송은 스트리밍 가능한 HTTP 전송을 사용하는 서버용입니다.

```bash
# Basic syntax
qwen mcp add --transport http <name> <url>

# Example: Adding an HTTP server
qwen mcp add --transport http http-server https://api.example.com/mcp/

# Example: Adding an HTTP server with an authentication header
qwen mcp add --transport http secure-http https://api.example.com/mcp/ --header "Authorization: Bearer abc123"
```

#### SSE 서버 추가

이 전송은 SSE(Server-Sent Events)를 사용하는 서버용입니다.

```bash
# Basic syntax
qwen mcp add --transport sse <name> <url>

# Example: Adding an SSE server
qwen mcp add --transport sse sse-server https://api.example.com/sse/

# Example: Adding an SSE server with an authentication header
qwen mcp add --transport sse secure-sse https://api.example.com/sse/ --header "Authorization: Bearer abc123"

# Example: Adding an OAuth-enabled SSE server
qwen mcp add --transport sse oauth-server https://api.example.com/sse/ \
  --oauth-client-id your-client-id \
  --oauth-redirect-uri https://your-server.com/oauth/callback \
  --oauth-authorization-url https://provider.example.com/authorize \
  --oauth-token-url https://provider.example.com/token
```

### 서버 관리(`qwen mcp`)

현재 구성된 모든 MCP 서버를 보고 관리하려면`manage`명령을 내리거나 간단히`qwen mcp`. 그러면 다음을 수행할 수 있는 대화형 TUI 대화 상자가 열립니다.

* 연결 상태와 함께 모든 MCP 서버 보기
* 서버 활성화/비활성화
* 연결이 끊긴 서버에 다시 연결
* 각 서버에서 제공하는 도구 및 프롬프트 보기
* 서버 로그 보기

**명령:**

```bash
qwen mcp
# or
qwen mcp manage
```

관리 대화 상자는 각 서버의 이름, 구성 세부 정보, 연결 상태 및 사용 가능한 도구/프롬프트를 보여주는 시각적 인터페이스를 제공합니다.

### 서버 제거(`qwen mcp remove`)

구성에서 서버를 삭제하려면`remove`서버 이름으로 명령을 실행하세요.

**명령:**

```bash
qwen mcp remove <name>
```

**예:**

```bash
qwen mcp remove my-server
```

그러면 "my-server" 항목이 검색되어 삭제됩니다.`mcpServers`적절한 개체`settings.json`범위에 따른 파일(`-s, --scope`).
