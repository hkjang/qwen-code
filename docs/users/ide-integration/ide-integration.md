# IDE 통합

Qwen Code는 IDE와 통합되어 보다 원활하고 상황에 맞는 경험을 제공할 수 있습니다. 이 통합을 통해 CLI는 작업 공간을 더 잘 이해할 수 있으며 기본 편집기 내 비교와 같은 강력한 기능을 사용할 수 있습니다.

현재 지원되는 유일한 IDE는[비주얼 스튜디오 코드](https://code.visualstudio.com/)VS Code 확장을 지원하는 기타 편집기. 다른 편집자에 대한 지원을 구축하려면 다음을 참조하세요.[IDE 동반 확장 사양](../ide-integration/ide-companion-spec).

## 특징

* **작업공간 컨텍스트:**CLI는 작업 공간을 자동으로 인식하여 보다 관련성이 높고 정확한 응답을 제공합니다. 이 컨텍스트에는 다음이 포함됩니다.
  * 그만큼**가장 최근에 액세스한 파일 10개**당신의 작업 공간에서.
  * 활성 커서 위치.
  * 선택한 모든 텍스트(최대 16KB 제한, 더 긴 선택 항목은 잘림)

* **네이티브 비교:**Qwen이 코드 수정을 제안하면 IDE의 기본 diff 뷰어 내에서 직접 변경 사항을 볼 수 있습니다. 이를 통해 제안된 변경 사항을 원활하게 검토, 편집, 수락 또는 거부할 수 있습니다.

* **VS 코드 명령:**VS Code 명령 팔레트(`Cmd+Shift+P`또는`Ctrl+Shift+P`):
  * `Qwen Code: Run`: 통합 터미널에서 새로운 Qwen Code 세션을 시작합니다.
  * `Qwen Code: Accept Diff`: 활성 diff 편집기의 변경 사항을 적용합니다.
  * `Qwen Code: Close Diff Editor`: 변경 사항을 거부하고 활성 diff 편집기를 닫습니다.
  * `Qwen Code: View Third-Party Notices`: 확장 프로그램에 대한 타사 알림을 표시합니다.

## 설치 및 설정

IDE 통합을 설정하는 방법에는 세 가지가 있습니다.

### 1. 자동 넛지(권장)

지원되는 편집기 내에서 Qwen Code를 실행하면 자동으로 환경을 감지하고 연결하라는 메시지가 표시됩니다. "예"라고 대답하면 동반 확장 설치 및 연결 활성화를 포함하여 필요한 설정이 자동으로 실행됩니다.

### 2. CLI에서 수동 설치

이전에 프롬프트를 닫았거나 확장 프로그램을 수동으로 설치하려는 경우 Qwen Code 내에서 다음 명령을 실행할 수 있습니다.

```
/ide install
```

이렇게 하면 IDE에 맞는 확장명을 찾아서 설치합니다.

### 3. 마켓플레이스에서 수동 설치

마켓플레이스에서 직접 확장 프로그램을 설치할 수도 있습니다.

* **Visual Studio 코드의 경우:**다음에서 설치하세요.[VS 코드 마켓플레이스](https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion).
* **VS Code 포크의 경우:**VS Code 포크를 지원하기 위해 확장 기능도 다음 위치에 게시됩니다.[VSX 레지스트리 열기](https://open-vsx.org/extension/qwenlm/qwen-code-vscode-ide-companion). 이 레지스트리에서 확장 기능을 설치하려면 편집자의 지침을 따르세요.

> 참고:
> "Qwen Code Companion" 확장 프로그램은 검색 결과 하단에 나타날 수 있습니다. 즉시 표시되지 않으면 아래로 스크롤하거나 '새 게시됨'으로 정렬해 보세요.
>
> 확장 프로그램을 수동으로 설치한 후 다음을 실행해야 합니다.`/ide enable`CLI에서 통합을 활성화합니다.

## 용법

### 활성화 및 비활성화

CLI 내에서 IDE 통합을 제어할 수 있습니다.

* IDE에 대한 연결을 활성화하려면 다음을 실행하십시오.
  ```
  /ide enable
  ```
* 연결을 비활성화하려면 다음을 실행하십시오.
  ```
  /ide disable
  ```

활성화되면 Qwen Code는 자동으로 IDE 동반 확장에 연결을 시도합니다.

### 상태 확인

연결 상태를 확인하고 CLI가 IDE에서 수신한 컨텍스트를 보려면 다음을 실행하세요.

```
/ide status
```

연결된 경우 이 명령은 연결된 IDE와 최근에 열었던 파일 목록을 표시합니다.

(참고: 파일 목록은 작업 공간 내에서 최근에 액세스한 10개의 파일로 제한되며 디스크의 로컬 파일만 포함됩니다.)

### 차이점 작업

Qwen 모델에 파일 수정을 요청하면 편집기에서 직접 diff 보기를 열 수 있습니다.

**차이점을 수락하려면**, 다음 작업 중 하나를 수행할 수 있습니다.

* 다음을 클릭하세요.**체크 표시 아이콘**diff 편집기의 제목 표시줄에 있습니다.
* 파일을 저장합니다(예:`Cmd+S`또는`Ctrl+S`).
* 명령 팔레트를 열고 실행하십시오.**Qwen 코드: 차이 허용**.
* 다음으로 응답`yes`메시지가 표시되면 CLI에서

**차이점을 거부하려면**, 다음을 수행할 수 있습니다.

* 다음을 클릭하세요.**'x' 아이콘**diff 편집기의 제목 표시줄에 있습니다.
* diff 편집기 탭을 닫습니다.
* 명령 팔레트를 열고 실행하십시오.**Qwen 코드: Diff 편집기 닫기**.
* 다음으로 응답`no`메시지가 표시되면 CLI에서

당신은 또한 할 수 있습니다**제안된 변경 사항을 수정하세요.**수락하기 전에 diff 보기에서 직접 확인하세요.

CLI에서 '예, 항상 허용'을 선택하면 변경 사항이 자동으로 수락되므로 변경 사항이 더 이상 IDE에 표시되지 않습니다.

## 샌드박싱과 함께 사용

샌드박스 내에서 Qwen Code를 사용하는 경우 다음 사항에 유의하세요.

* **macOS의 경우:**IDE 통합에는 IDE 동반 확장과 통신하기 위해 네트워크 액세스가 필요합니다. 네트워크 액세스를 허용하는 안전벨트 프로필을 사용해야 합니다.
* **Docker 컨테이너에서:**Docker(또는 Podman) 컨테이너 내에서 Qwen Code를 실행하는 경우 IDE 통합은 호스트 시스템에서 실행되는 VS Code 확장에 계속 연결할 수 있습니다. CLI는 IDE 서버를 자동으로 찾도록 구성되어 있습니다.`host.docker.internal`. 일반적으로 특별한 구성이 필요하지 않지만 Docker 네트워킹 설정이 컨테이너에서 호스트로의 연결을 허용하는지 확인해야 할 수도 있습니다.

## 문제 해결

IDE 통합에 문제가 발생하는 경우 일반적인 오류 메시지와 해결 방법은 다음과 같습니다.

### 연결 오류

* **메시지:** `🔴 Disconnected: Failed to connect to IDE companion extension for [IDE Name]. Please ensure the extension is running and try restarting your terminal. To install the extension, run /ide install.`
  * **원인:**Qwen 코드가 필요한 환경 변수를 찾을 수 없습니다(`QWEN_CODE_IDE_WORKSPACE_PATH`또는`QWEN_CODE_IDE_SERVER_PORT`)를 사용하여 IDE에 연결합니다. 이는 일반적으로 IDE 동반 확장이 실행되지 않거나 올바르게 초기화되지 않았음을 의미합니다.
  * **해결책:**
    1. 다음을 설치했는지 확인하세요.**Qwen 코드 동반자**확장 프로그램이 활성화되어 있는지 확인하세요.
    2. IDE에서 새 터미널 창을 열어 올바른 환경이 선택되었는지 확인하세요.

* **메시지:** `🔴 Disconnected: IDE connection error. The connection was lost unexpectedly. Please try reconnecting by running /ide enable`
  * **원인:**IDE 컴패니언에 대한 연결이 끊어졌습니다.
  * **해결책:**달리다`/ide enable`다시 연결해 보세요. 문제가 계속되면 새 터미널 창을 열거나 IDE를 다시 시작하세요.

### 구성 오류

* **메시지:** `🔴 Disconnected: Directory mismatch. Qwen Code is running in a different location than the open workspace in [IDE Name]. Please run the CLI from the same directory as your project's root folder.`
  * **원인:**CLI의 현재 작업 디렉터리는 IDE에서 연 폴더나 작업 공간 외부에 있습니다.
  * **해결책:** `cd`IDE에 열려 있는 동일한 디렉터리로 이동하고 CLI를 다시 시작하세요.

* **메시지:** `🔴 Disconnected: To use this feature, please open a workspace folder in [IDE Name] and try again.`
  * **원인:**IDE에 열려 있는 작업공간이 없습니다.
  * **해결책:**IDE에서 작업공간을 열고 CLI를 다시 시작하세요.

### 일반 오류

* **메시지:** `IDE integration is not supported in your current environment. To use this feature, run Qwen Code in one of these supported IDEs: [List of IDEs]`
  * **원인:**지원되는 IDE가 아닌 터미널이나 환경에서 Qwen Code를 실행하고 있습니다.
  * **해결책:**VS Code와 같이 지원되는 IDE의 통합 터미널에서 Qwen Code를 실행하세요.

* **메시지:** `No installer is available for IDE. Please install the Qwen Code Companion extension manually from the marketplace.`
  * **원인:**당신은 달렸다`/ide install`, 그러나 CLI에는 특정 IDE에 대한 자동 설치 프로그램이 없습니다.
  * **해결책:**IDE의 확장 마켓플레이스를 열고 "Qwen Code Companion"을 검색한 후 수동으로 설치하세요.
