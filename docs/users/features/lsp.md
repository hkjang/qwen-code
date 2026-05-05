# LSP(언어 서버 프로토콜) 지원

Qwen Code는 기본 LSP(언어 서버 프로토콜) 지원을 제공하여 정의로 이동, 참조 찾기, 진단 및 코드 작업과 같은 고급 코드 인텔리전스 기능을 활성화합니다. 이러한 통합을 통해 AI 에이전트는 코드를 더 깊이 이해하고 더 정확한 지원을 제공할 수 있습니다.

## 개요

Qwen Code의 LSP 지원은 코드를 이해하는 언어 서버에 연결하여 작동합니다. 다음을 통해 서버를 구성하면`.lsp.json`(또는 확장), Qwen Code는 이를 시작하고 다음 용도로 사용할 수 있습니다.

* 기호 정의로 이동
* 기호에 대한 모든 참조 찾기
* 호버 정보 가져오기(문서, 유형 정보)
* 진단 메시지 보기(오류, 경고)
* 액세스 코드 작업(빠른 수정, 리팩터링)
* 통화 계층 분석

## 빠른 시작

LSP는 Qwen Code의 실험적인 기능입니다. 활성화하려면`--experimental-lsp`명령줄 플래그:

```bash
qwen --experimental-lsp
```

LSP 서버는 구성 중심입니다. 다음에서 정의해야 합니다.`.lsp.json`(또는 확장을 통해) Qwen Code가 이를 시작하도록 합니다.

### 전제조건

프로그래밍 언어에 대한 언어 서버가 설치되어 있어야 합니다.

| 언어            | 언어 서버         | 설치 명령                                                              |
| ------------- | ------------- | ------------------------------------------------------------------ |
| 타입스크립트/자바스크립트 | 타이프스크립트-언어-서버 | `npm install -g typescript-language-server typescript`             |
| 파이썬           | 필스프           | `pip install python-lsp-server`                                    |
| 가다            | 고플            | `go install golang.org/x/tools/gopls@latest`                       |
| 녹             | 녹 분석기         | [설치 가이드](https://rust-analyzer.github.io/manual.html#installation) |
| C/C++         | 쾅쾅            | 패키지 관리자를 통해 LLVM/clangd 설치                                         |
| 자바            | jdtls         | JDTLS 및 JDK 설치                                                     |

## 구성

### .lsp.json 파일

다음을 사용하여 언어 서버를 구성할 수 있습니다.`.lsp.json`프로젝트 루트에 파일을 넣으세요. 각 최상위 키는 언어 식별자이며 해당 값은 서버 구성 개체입니다.

**기본 형식:**

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact",
      ".js": "javascript",
      ".jsx": "javascriptreact"
    }
  }
}
```

### C/C++(clangd) 구성

종속성:

* clangd(LLVM)가 설치되어 PATH에 사용 가능해야 합니다.
* 컴파일 데이터베이스(`compile_commands.json`) 또는`compile_flags.txt`정확한 결과를 위해서는 필요합니다.

예:

```json
{
  "cpp": {
    "command": "clangd",
    "args": [
      "--background-index",
      "--clang-tidy",
      "--header-insertion=iwyu",
      "--completion-style=detailed"
    ]
  }
}
```

### 자바(jdtls) 구성

종속성:

* JDK가 설치되어 PATH에 사용 가능(`java`).
* JDTLS가 설치되어 PATH에 사용 가능(`jdtls`).

예:

```json
{
  "java": {
    "command": "jdtls",
    "args": ["-configuration", ".jdtls-config", "-data", ".jdtls-workspace"]
  }
}
```

### 구성 옵션

#### 필수항목

| 옵션        | 유형 | 설명                                                                                                  |
| --------- | -- | --------------------------------------------------------------------------------------------------- |
| `command` | 끈  | LSP 서버를 시작하는 명령입니다. 다음을 통해 확인된 베어 명령 이름을 지원합니다.`PATH`(예:`clangd`) 및 절대 경로(예:`/opt/llvm/bin/clangd`) |

#### 선택 필드

| 옵션                      | 유형   | 기본        | 설명                                          |
| ----------------------- | ---- | --------- | ------------------------------------------- |
| `args`                  | 끈\[] | `[]`      | 명령줄 인수                                      |
| `transport`             | 끈    | `"stdio"` | 운송 유형:`stdio`,`tcp`, 또는`socket`             |
| `env`                   | 물체   | -         | 환경변수                                        |
| `initializationOptions` | 물체   | -         | LSP 초기화 옵션                                  |
| `settings`              | 물체   | -         | 서버 설정을 통해`workspace/did변경설정` |
| `extensionToLanguage`   | 물체   | -         | 파일 확장자를 언어 식별자에 매핑합니다.                      |
| `workspaceFolder`       | 끈    | -         | 작업공간 폴더 재정의(프로젝트 루트 내에 있어야 함)               |
| `startupTimeout`        | 숫자   | `10000`   | 시작 시간 초과(밀리초)                               |
| `shutdownTimeout`       | 숫자   | `5000`    | 종료 시간 초과(밀리초)                               |
| `restartOnCrash`        | 부울   | `false`   | 충돌 시 자동 재시작                                 |
| `maxRestarts`           | 숫자   | `3`       | 최대 다시 시작 시도                                 |
| `trust필수`         | 부울   | `true`    | 신뢰할 수 있는 작업 공간 필요                           |

### TCP/소켓 전송

TCP 또는 Unix 소켓 전송을 사용하는 서버의 경우:

```json
{
  "remote-lsp": {
    "transport": "tcp",
    "socket": {
      "host": "127.0.0.1",
      "port": 9999
    },
    "extensionToLanguage": {
      ".custom": "custom"
    }
  }
}
```

## 사용 가능한 LSP 작업

Qwen Code는 통합을 통해 LSP 기능을 노출합니다.`lsp`도구. 사용 가능한 작업은 다음과 같습니다.

위치 기반 운영(`goToDefinition`,`findReferences`,`hover`,`goToImplementation`, 그리고`prepareCallHierarchy`) 정확한 정보가 필요합니다.`filePath`+`line`+`character`위치. 정확한 위치를 모르는 경우에는`workspaceSymbol`또는`documentSymbol`먼저 기호를 찾으세요.

### 코드 탐색

#### 정의로 이동

기호가 정의된 위치를 찾으세요.

```
Operation: goToDefinition
Parameters:
  - filePath: Path to the file
  - line: Line number (1-based)
  - character: Column number (1-based)
```

#### 참고자료 찾기

기호에 대한 모든 참조를 찾습니다.

```
Operation: findReferences
Parameters:
  - filePath: Path to the file
  - line: Line number (1-based)
  - character: Column number (1-based)
  - includeDeclaration: Include the declaration itself (optional)
```

#### 구현으로 이동

인터페이스 또는 추상 메소드의 구현을 찾으십시오.

```
Operation: goToImplementation
Parameters:
  - filePath: Path to the file
  - line: Line number (1-based)
  - character: Column number (1-based)
```

### 기호정보

#### 호버

기호에 대한 문서 및 유형 정보를 가져옵니다.

```
Operation: hover
Parameters:
  - filePath: Path to the file
  - line: Line number (1-based)
  - character: Column number (1-based)
```

#### 문서 기호

문서의 모든 기호를 가져옵니다.

```
Operation: documentSymbol
Parameters:
  - filePath: Path to the file
```

#### 작업공간 기호 검색

작업 공간 전체에서 기호를 검색합니다.

```
Operation: workspaceSymbol
Parameters:
  - query: Search query string
  - limit: Maximum results (optional)
```

### 호출 계층

#### 통화 계층 준비

특정 위치에서 통화 계층 항목을 가져옵니다.

```
Operation: prepareCallHierarchy
Parameters:
  - filePath: Path to the file
  - line: Line number (1-based)
  - character: Column number (1-based)
```

#### 수신 전화

주어진 함수를 호출하는 모든 함수를 찾습니다.

```
Operation: incomingCalls
Parameters:
  - callHierarchyItem: Item from prepareCallHierarchy
```

#### 발신 전화

주어진 함수에 의해 호출되는 모든 함수를 찾습니다.

```
Operation: outgoingCalls
Parameters:
  - callHierarchyItem: Item from prepareCallHierarchy
```

### 진단

#### 파일 진단

파일에 대한 진단 메시지(오류, 경고)를 가져옵니다.

```
Operation: diagnostics
Parameters:
  - filePath: Path to the file
```

#### 작업공간 진단

작업 영역 전반에 걸쳐 모든 진단 메시지를 가져옵니다.

```
Operation: workspaceDiagnostics
Parameters:
  - limit: Maximum results (optional)
```

### 코드 작업

#### 코드 작업 가져오기

특정 위치에서 사용 가능한 코드 작업(빠른 수정, 리팩토링)을 가져옵니다.

```
Operation: codeActions
Parameters:
  - filePath: Path to the file
  - line: Start line number (1-based)
  - character: Start column number (1-based)
  - endLine: End line number (optional, defaults to line)
  - endCharacter: End column (optional, defaults to character)
  - diagnostics: Diagnostics to get actions for (optional)
  - codeActionKinds: Filter by action kind (optional)
```

코드 작업 종류:

* `quickfix`- 오류/경고에 대한 빠른 수정
* `refactor`- 리팩토링 작업
* `refactor.extract`- 함수/변수로 추출
* `refactor.inline`- 인라인 함수/변수
* `source`- 소스코드 액션
* `source.organizeImports`- 수입품 정리
* `source.fixAll`- 자동 수정 가능한 모든 문제 수정

## 보안

LSP 서버는 기본적으로 신뢰할 수 있는 작업 공간에서만 시작됩니다. 이는 언어 서버가 사용자 권한으로 실행되고 코드를 실행할 수 있기 때문입니다.

### 신뢰 제어

* **신뢰할 수 있는 작업 공간**: 구성된 경우 LSP 서버가 시작됩니다.
* **신뢰할 수 없는 작업공간**: LSP 서버는 다음이 아니면 시작되지 않습니다.`trust필수: false`서버 구성에 설정되어 있습니다

작업공간을 신뢰할 수 있는 것으로 표시하려면 다음을 사용하세요.`/trust`명령.

### 서버별 신뢰 재정의

구성에서 특정 서버에 대한 신뢰 요구 사항을 재정의할 수 있습니다.

```json
{
  "safe-server": {
    "command": "safe-language-server",
    "args": ["--stdio"],
    "trust필수": false,
    "extensionToLanguage": {
      ".safe": "safe"
    }
  }
}
```

## 문제 해결

### 서버가 시작되지 않음

1. **확인하다`--experimental-lsp`깃발**: Qwen Code를 시작할 때 플래그를 사용하고 있는지 확인하십시오.
2. **서버가 설치되어 있는지 확인**: 명령을 수동으로 실행합니다(예:`clangd --version`) 확인하기 위해
3. **명령을 확인하세요**: 서버 바이너리가 시스템에 있어야 합니다.`PATH`, 또는 절대 경로로 지정됩니다(예:`/opt/llvm/bin/clangd`). 작업공간을 벗어나는 상대 경로는 차단됩니다.
4. **작업 공간 신뢰 확인**: 작업공간은 LSP에 대해 신뢰되어야 합니다(사용`/trust`)
5. **로그 확인**: 찾아보세요`[LSP]`디버그 로그 항목(아래 디버깅 섹션 참조)
6. **프로세스를 확인하세요**: 달리다`ps aux | grep <server-name>`서버 프로세스가 실행 중인지 확인하려면

### 느린 성능

1. **대규모 프로젝트**: 제외를 고려하세요`node_modules`및 기타 큰 디렉토리
2. **서버 시간 초과**: 증가하다`startupTimeout`느린 서버에 대한 서버 구성

### 결과 없음

1. **서버가 준비되지 않았습니다**: 서버가 아직 인덱싱 중일 수 있습니다. clangd를 사용하는 C/C++ 프로젝트의 경우 다음을 확인하세요.`--background-index`args에 있고`compile_commands.json`(또는`compile_flags.txt`)가 프로젝트 루트 또는 상위 디렉터리에 존재합니다. 사용`--compile-commands-dir=<path>`빌드 하위 디렉터리에 있는 경우
2. **파일이 저장되지 않았습니다.**: 서버가 변경 사항을 적용할 수 있도록 파일을 저장하세요.
3. **잘못된 언어**: 귀하의 언어에 맞는 서버가 실행되고 있는지 확인하세요.
4. **프로세스를 확인하세요**: 달리다`ps aux | grep <server-name>`서버가 실제로 실행 중인지 확인하기 위해

### 디버깅

LSP 디버그 로그는 자동으로 세션 로그 파일에 기록됩니다.`~/.qwen/debug/`. LSP 관련 항목을 확인하려면:

```bash
# View the latest session log
grep '\[LSP\]' ~/.qwen/debug/latest

# Common error messages to look for:
#   "command path is unsafe"  → relative path escapes workspace, use absolute path or add to PATH
#   "command not found"       → server binary not installed or not in PATH
#   "requires trusted workspace" → run /trust first
```

서버 프로세스가 실행 중인지 확인할 수도 있습니다.

```bash
ps aux | grep clangd   # or typescript-language-server, jdtls, etc.
```

## 확장 LSP 구성

확장은 다음을 통해 LSP 서버 구성을 제공할 수 있습니다.`lspServers`그들의 분야`plugin.json`. 이는 인라인 개체이거나`.lsp.json`파일. Qwen Code는 확장이 활성화되면 이러한 구성을 로드합니다. 형식은 프로젝트에 사용된 것과 동일한 언어 키 레이아웃입니다.`.lsp.json`파일.

## 모범 사례

1. **전역적으로 언어 서버 설치**: 이렇게 하면 모든 프로젝트에서 사용할 수 있습니다.
2. **프로젝트별 설정 사용**: 필요할 때 프로젝트별로 서버 옵션을 구성합니다.`.lsp.json`
3. **서버를 최신 상태로 유지**: 최상의 결과를 얻으려면 정기적으로 언어 서버를 업데이트하세요.
4. **현명하게 신뢰하세요**: 신뢰할 수 있는 소스의 작업공간만 신뢰하세요.

## FAQ

### Q: LSP를 어떻게 활성화합니까?

사용`--experimental-lsp`Qwen 코드를 시작할 때 플래그:

```bash
qwen --experimental-lsp
```

### Q: 어떤 언어 서버가 실행되고 있는지 어떻게 알 수 있나요?

디버그 로그를 확인하세요.`[LSP]`항목(`grep '\[LSP\]' ~/.qwen/debug/latest`) 또는 직접 프로세스를 확인하세요.`ps aux | grep <server-name>`.

### Q: 동일한 파일 형식에 대해 여러 언어 서버를 사용할 수 있습니까?

예, 하지만 각 작업에는 하나만 사용됩니다. 결과를 반환하는 첫 번째 서버가 승리합니다.

### Q: LSP는 샌드박스 모드에서 작동합니까?

LSP 서버는 샌드박스 외부에서 실행되어 코드에 액세스합니다. 작업 공간 신뢰 제어가 적용됩니다.
