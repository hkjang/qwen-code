# Qwen 코드 도우미 플러그인: 인터페이스 사양

> 최종 업데이트: 2025년 9월 15일

이 문서는 Qwen Code의 IDE 모드를 활성화하기 위한 동반 플러그인을 구축하기 위한 계약을 정의합니다. VS Code의 경우 이러한 기능(네이티브 비교, 컨텍스트 인식)은 공식 확장([시장](https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion)). 이 사양은 JetBrains IDE, Sublime Text 등과 같은 다른 편집기에 유사한 기능을 제공하려는 기여자를 위한 것입니다.

## I. 통신 인터페이스

Qwen Code와 IDE 플러그인은 로컬 통신 채널을 통해 통신합니다.

### 1. 전송 계층: HTTP를 통한 MCP

플러그인**해야 하다**구현하는 로컬 HTTP 서버를 실행합니다.**모델 컨텍스트 프로토콜(MCP)**.

* **규약:**서버는 유효한 MCP 서버여야 합니다. 가능한 경우 선택한 언어에 기존 MCP SDK를 사용하는 것이 좋습니다.
* **끝점:**서버는 단일 엔드포인트를 노출해야 합니다(예:`/mcp`) 모든 MCP 통신에 사용됩니다.
* **포트:**서버**해야 하다**동적으로 할당된 포트에서 수신 대기(즉, 포트에서 수신 대기)`0`).

### 2. 검색 메커니즘: 잠금 파일

Qwen Code를 연결하려면 서버가 어떤 포트를 사용하고 있는지 검색해야 합니다. 플러그인**해야 하다**"잠금 파일"을 만들고 포트 환경 변수를 설정하면 이를 쉽게 할 수 있습니다.

* **CLI가 파일을 찾는 방법:**CLI는 다음에서 포트를 읽습니다.`QWEN_CODE_IDE_SERVER_PORT`, 그런 다음 읽습니다.`~/.qwen/ide/<PORT>.lock`. (이전 확장에 대한 레거시 폴백이 존재합니다. 아래 참고를 참조하세요.)

* **파일 위치:**파일은 특정 디렉터리에 생성되어야 합니다.`~/.qwen/ide/`. 플러그인이 존재하지 않는 경우 이 디렉터리를 생성해야 합니다.

* **파일 명명 규칙:**파일 이름이 중요하며**해야 하다**다음 패턴을 따르세요:`<PORT>.lock`
  * `<PORT>`: MCP 서버가 수신 대기 중인 포트입니다.

* **파일 콘텐츠 및 작업공간 검증:**파일**해야 하다**다음 구조의 JSON 객체를 포함합니다.

  ```json
  {
    "port": 12345,
    "workspacePath": "/path/to/project1:/path/to/project2",
    "authToken": "a-very-secret-token",
    "ppid": 1234,
    "ideName": "VS Code"
  }
  ```

  * `port`(번호, 필수): MCP 서버의 포트입니다.
  * `workspacePath`(문자열, 필수): OS별 경로 구분 기호(`:`리눅스/맥OS용,`;`Windows의 경우). CLI는 이 경로를 사용하여 IDE에 열려 있는 동일한 프로젝트 폴더에서 실행되고 있는지 확인합니다. CLI의 현재 작업 디렉터리가 다음의 하위 디렉터리가 아닌 경우`workspacePath`, 연결이 거부됩니다. 귀하의 플러그인**해야 하다**열려 있는 작업공간의 루트에 대한 올바른 절대 경로를 제공하십시오.
  * `authToken`(문자열, 필수): 연결 보안을 위한 비밀 토큰입니다. CLI는 이 토큰을`Authorization: Bearer <token>`모든 요청의 헤더.
  * `ppid`(숫자, 필수): IDE 프로세스의 상위 프로세스 ID입니다.
  * `ideName`(문자열, 필수): 사용자에게 친숙한 IDE 이름(예:`VS Code`,`JetBrains IDE`).

* **입증:**연결을 보호하기 위해 플러그인**해야 하다**고유한 비밀 토큰을 생성하고 이를 검색 파일에 포함합니다. 그러면 CLI는 이 토큰을`Authorization`MCP 서버에 대한 모든 요청의 헤더(예:`Authorization: Bearer a-very-secret-token`). 귀하의 서버**해야 하다**모든 요청에서 이 토큰을 검증하고 승인되지 않은 토큰을 거부합니다.

* **환경 변수(필수):**귀하의 플러그인**해야 하다**세트`QWEN_CODE_IDE_SERVER_PORT`CLI가 올바른 위치를 찾을 수 있도록 통합 터미널에서`<PORT>.lock`파일.

**기존 참고사항:**v0.5.1 이전 확장의 경우 Qwen Code는 다음과 같은 시스템 임시 디렉터리에서 JSON 파일을 읽는 것으로 대체될 수 있습니다.`qwen-code-ide-server-<PID>.json`또는`qwen-code-ide-server-<PORT>.json`. 새로운 통합은 이러한 레거시 파일에 의존해서는 안 됩니다.

## II. 컨텍스트 인터페이스

상황 인식을 활성화하려면 플러그인**5월**IDE에서의 사용자 활동에 대한 실시간 정보를 CLI에 제공합니다.

### `ide/contextUpdate`공고

플러그인**5월**보내다`ide/contextUpdate` [공고](https://modelcontextprotocol.io/specification/2025-06-18/basic/index#notifications)사용자의 컨텍스트가 변경될 때마다 CLI에

* **트리거링 이벤트:**이 알림은 다음과 같은 경우 전송되어야 합니다(권장 디바운스 50ms).
  * 파일이 열리거나 닫히거나 초점이 맞춰집니다.
  * 활성 파일에서 사용자의 커서 위치 또는 텍스트 선택이 변경됩니다.
* **페이로드(`IdeContext`):**알림 매개변수**해야 하다**가 되다`IdeContext`물체:

  ```typescript
  interface IdeContext {
    workspaceState?: {
      openFiles?: File[];
      isTrusted?: boolean;
    };
  }

  interface File {
    // Absolute path to the file
    path: string;
    // Last focused Unix timestamp (for ordering)
    timestamp: number;
    // True if this is the currently focused file
    isActive?: boolean;
    cursor?: {
      // 1-based line number
      line: number;
      // 1-based character number
      character: number;
    };
    // The text currently selected by the user
    selectedText?: string;
  }
  ```

  **메모:**그만큼`openFiles`목록에는 디스크에 존재하는 파일만 포함되어야 합니다. 가상 파일(예: 경로 없이 저장되지 않은 파일, 편집기 설정 페이지)**해야 하다**제외됩니다.

### CLI가 이 컨텍스트를 사용하는 방법

수신 후`IdeContext`객체에 대해 CLI는 정보를 모델에 보내기 전에 여러 정규화 및 자르기 단계를 수행합니다.

* **파일 순서:**CLI는 다음을 사용합니다.`timestamp`필드를 사용하여 가장 최근에 사용한 파일을 확인합니다. 그것은 정렬`openFiles`이 값을 기준으로 목록을 작성합니다. 따라서 귀하의 플러그인은**해야 하다**파일이 마지막으로 집중된 시점에 대한 정확한 Unix 타임스탬프를 제공합니다.
* **활성 파일:**CLI는 정렬 후 가장 최근 파일만 "활성" 파일로 간주합니다. 그것은 무시할 것입니다`isActive`다른 모든 파일에 플래그를 지정하고 해당 파일을 지웁니다.`cursor`그리고`selectedText`전지. 플러그인은 설정에 중점을 두어야 합니다.`isActive: true`현재 초점을 맞춘 파일에 대해서만 커서/선택 세부 정보를 제공합니다.
* **잘림:**토큰 제한을 관리하기 위해 CLI는 파일 목록(최대 10개 파일)과`selectedText`(16KB까지).

CLI가 최종 잘림을 처리하는 동안 플러그인이 전송하는 컨텍스트의 양도 제한하는 것이 좋습니다.

## III. 차이점 인터페이스

대화형 코드 수정을 활성화하려면 플러그인**5월**차이점이 있는 인터페이스를 노출합니다. 이를 통해 CLI는 IDE가 diff 보기를 열어 파일에 제안된 변경 사항을 표시하도록 요청할 수 있습니다. 그런 다음 사용자는 IDE 내에서 직접 이러한 변경 사항을 검토, 편집하고 최종적으로 수락하거나 거부할 수 있습니다.

### `openDiff`도구

플러그인**해야 하다**등록하다`openDiff`MCP 서버의 도구입니다.

* **설명:**이 도구는 IDE에 특정 파일에 대해 수정 가능한 diff 보기를 열도록 지시합니다.

* **요구 (`OpenDiffRequest`):**이 도구는 다음을 통해 호출됩니다.`tools/call`요구. 그만큼`arguments`요청 내의 필드`params` **해야 하다**가 되다`OpenDiffRequest`물체.

  ```typescript
  interface OpenDiffRequest {
    // The absolute path to the file to be diffed.
    filePath: string;
    // The proposed new content for the file.
    newContent: string;
  }
  ```

* **응답 (`CallToolResult`):**도구**해야 하다**즉시 반환`CallToolResult`요청을 승인하고 diff 보기가 성공적으로 열렸는지 보고합니다.

  * 성공 시: diff 보기가 성공적으로 열리면 응답이 표시됩니다.**해야 하다**빈 콘텐츠(예:`content: []`).
  * 실패 시: 오류로 인해 diff 보기가 열리지 않는 경우 응답은**해야 하다**가지다`isError: true`그리고`TextContent`에서 차단`content`오류를 설명하는 배열입니다.

  차이점(수락 또는 거부)의 실제 결과는 알림을 통해 비동기적으로 전달됩니다.

### `closeDiff`도구

플러그인**해야 하다**등록하다`closeDiff`MCP 서버의 도구입니다.

* **설명:**이 도구는 IDE에 특정 파일에 대해 열려 있는 diff 보기를 닫도록 지시합니다.

* **요구 (`CloseDiffRequest`):**이 도구는 다음을 통해 호출됩니다.`tools/call`요구. 그만큼`arguments`요청 내의 필드`params` **해야 하다**가 되다`CloseDiffRequest` object.

  ```typescript
  interface CloseDiffRequest {
    // The absolute path to the file whose diff view should be closed.
    filePath: string;
  }
  ```

* **응답 (`CallToolResult`):**도구**해야 하다**반환하다`CallToolResult`.
  * 성공 시: diff 보기가 성공적으로 닫힌 경우 응답은 다음과 같습니다.**해야 하다**하나를 포함하다**텍스트 콘텐츠**닫기 전에 파일의 최종 내용을 포함하는 내용 배열을 차단합니다.
  * 실패 시: 오류로 인해 diff 보기가 닫히지 못한 경우 응답은**해야 하다**가지다`isError: true`그리고`TextContent`에서 차단`content`오류를 설명하는 배열입니다.

### `ide/diffAccepted`공고

When the user accepts the changes in a diff view (e.g., by clicking an "Apply" or "Save" button), the plugin **해야 하다**보내다`ide/diffAccepted`CLI에 알림.

* **유효 탑재량:**알림 매개변수**해야 하다**파일 경로와 파일의 최종 내용을 포함합니다. 내용은 원본과 다를 수 있습니다`newContent`사용자가 diff 보기에서 수동으로 편집한 경우.

  ```typescript
  {
    // The absolute path to the file that was diffed.
    filePath: string;
    // The full content of the file after acceptance.
    content: string;
  }
  ```

### `ide/diffRejected`공고

사용자가 변경 사항을 거부하면(예: 수락하지 않고 diff 보기를 닫음) 플러그인은**해야 하다**보내다`ide/diffRejected`CLI에 알림.

* **유효 탑재량:**알림 매개변수**해야 하다**거부된 diff의 파일 경로를 포함합니다.

  ```typescript
  {
    // The absolute path to the file that was diffed.
    filePath: string;
  }
  ```

## IV. 라이프사이클 인터페이스

플러그인**해야 하다**IDE의 수명주기에 따라 리소스와 검색 파일을 올바르게 관리합니다.

* **활성화 시(IDE 시작/플러그인 활성화):**
  1. MCP 서버를 시작합니다.
  2. 검색 파일을 만듭니다.
* **비활성화 시(IDE 종료/플러그인 비활성화):**
  1. MCP 서버를 중지합니다.
  2. 검색 파일을 삭제합니다.
