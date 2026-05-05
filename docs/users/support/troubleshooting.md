# 문제 해결

이 가이드에서는 다음 주제를 포함하여 일반적인 문제에 대한 솔루션과 디버깅 팁을 제공합니다.

* 인증 또는 로그인 오류
* 자주 묻는 질문(FAQ)
* 디버깅 팁
* 귀하와 유사한 기존 GitHub 문제 또는 새 문제 생성

## 인증 또는 로그인 오류

* **오류:`Qwen OAuth free tier was discontinued on 2026-04-15`**
  * **원인:**&#x32;026년 4월 15일부터 Qwen OAuth를 더 이상 사용할 수 없습니다.
  * **해결책:**&#xB2E4;른 인증 방법으로 전환하세요. 달리다`qwen`→`/auth`다음 중 하나를 선택하세요.
    * **API 키**: Alibaba Cloud Model Studio의 API 키를 사용합니다([베이징](https://bailian.console.aliyun.com/) / [국제](https://modelstudio.console.alibabacloud.com/)). API 설정 가이드([베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model\&url=3023091) / [국제](https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model\&url=2974721)).
    * **Alibaba Cloud 코딩 계획**: 더 높은 할당량으로 고정된 월간 요금을 구독하세요. 코딩 계획 가이드([베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=coding-plan#/efm/coding-plan-index) / [국제](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index)).

* **오류:`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`,`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, 또는`unable to get local issuer certificate`**
  * **원인:**&#x53;SL/TLS 트래픽을 가로채서 검사하는 방화벽이 있는 회사 네트워크에 있을 수 있습니다. Node.js에서 신뢰하려면 사용자 지정 루트 CA 인증서가 필요한 경우가 많습니다.
  * **해결책:**&#xC124;정`NODE_EXTRA_CA_CERTS`환경 변수를 회사 루트 CA 인증서 파일의 절대 경로로 설정합니다.
    * 예:`export NODE_EXTRA_CA_CERTS=/path/to/your/corporate-ca.crt`

* **오류:`Device authorization flow failed: fetch failed`**
  * **원인:**&#x4E;ode.js가 Qwen OAuth 엔드포인트에 도달할 수 없습니다(종종 프록시 또는 SSL/TLS 신뢰 문제). 사용 가능한 경우 Qwen Code는 기본 오류 원인도 인쇄합니다(예:`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). 참고: 이 오류는 기존 Qwen OAuth 흐름에만 해당됩니다.
  * **해결책:**
    * 아직 Qwen OAuth를 사용하고 있다면 다음을 통해 API 키 또는 코딩 계획으로 전환하세요.`/auth`.
    * 프록시 뒤에 있는 경우 다음을 통해 설정하세요.`qwen --proxy <url>`(또는`proxy`설정`settings.json`).
    * 네트워크에서 기업 TLS 검사 CA를 사용하는 경우 다음을 설정하세요.`NODE_EXTRA_CA_CERTS`위에서 설명한대로.

* **문제: 인증 실패 후 UI를 표시할 수 없습니다.**
  * **원인:**&#xC778;증 유형을 선택한 후 인증에 실패할 경우,`security.auth.selectedType`설정은 계속 유지될 수 있습니다.`settings.json`. 다시 시작하면 CLI가 실패한 인증 유형으로 인증을 시도하다가 중단되고 UI가 표시되지 않을 수 있습니다.
  * **해결책:**&#xC9C0;우기`security.auth.selectedType`구성 항목`settings.json`파일:
    * 열려 있는`~/.qwen/settings.json`(또는`./.qwen/settings.json`프로젝트별 설정의 경우)
    * 제거`security.auth.selectedType`필드
    * 인증을 다시 묻는 메시지를 표시하려면 CLI를 다시 시작하세요.

## 자주 묻는 질문(FAQ)

* **Q: Qwen Code를 최신 버전으로 업데이트하려면 어떻게 해야 하나요?**
  * A: 다음을 통해 전역적으로 설치한 경우`npm`, 명령을 사용하여 업데이트하십시오.`npm install -g @qwen-code/qwen-code@latest`. 소스에서 컴파일한 경우 저장소에서 최신 변경 사항을 가져온 다음 다음 명령을 사용하여 다시 빌드하세요.`npm run build`.

* **Q: Qwen 코드 구성 또는 설정 파일은 어디에 저장됩니까?**
  * A: Qwen 코드 구성은 두 군데에 저장됩니다.`settings.json`파일:

    1. 홈 디렉토리에서:`~/.qwen/settings.json`.
    2. 프로젝트의 루트 디렉터리에서:`./.qwen/settings.json`.

    참조[Qwen 코드 구성](../configuration/settings)자세한 내용은

* **Q: 통계 출력에 캐시된 토큰 수가 표시되지 않는 이유는 무엇입니까?**
  * A: 캐시된 토큰 정보는 캐시된 토큰을 사용하는 경우에만 표시됩니다. 이 기능은 API 키 사용자(예: Alibaba Cloud Model Studio API 키 또는 Google Cloud Vertex AI)가 사용할 수 있습니다. 다음을 사용하여 총 토큰 사용량을 계속 확인할 수 있습니다.`/stats`명령.

## 일반적인 오류 메시지 및 해결 방법

* **오류:`EADDRINUSE`(이미 사용 중인 주소) MCP 서버를 시작할 때.**
  * **원인:**&#xB2E4;른 프로세스가 이미 MCP 서버가 바인딩하려는 포트를 사용하고 있습니다.
  * **해결책:**&#xD574;당 포트를 사용 중인 다른 프로세스를 중지하거나 다른 포트를 사용하도록 MCP 서버를 구성하십시오.

* **오류: 명령을 찾을 수 없습니다(Qwen 코드를 다음과 같이 실행하려고 할 때).`qwen`).**
  * **원인:**&#x43;LI가 올바르게 설치되지 않았거나 시스템에 없습니다.`PATH`.
  * **해결책:**&#xC5C5;데이트는 Qwen Code를 설치한 방법에 따라 다릅니다.
    * 설치한 경우`qwen`전 세계적으로`npm`전역 바이너리 디렉토리는`PATH`. 명령을 사용하여 업데이트할 수 있습니다.`npm install -g @qwen-code/qwen-code@latest`.
    * 달리고 있는 경우`qwen`소스에서 올바른 명령을 사용하여 호출하고 있는지 확인하세요(예:`node packages/cli/dist/index.js ...`). 업데이트하려면 저장소에서 최신 변경 사항을 가져온 다음 다음 명령을 사용하여 다시 빌드하세요.`npm run build`.

* **오류:`MODULE_NOT_FOUND`또는 가져오기 오류입니다.**
  * **원인:**&#xC885;속성이 올바르게 설치되지 않았거나 프로젝트가 빌드되지 않았습니다.
  * **해결책:**
    1. 달리다`npm install`모든 종속성이 존재하는지 확인합니다.
    2. 달리다`npm run build` to compile the project.
    3. 다음을 사용하여 빌드가 성공적으로 완료되었는지 확인합니다.`npm run start`.

* **오류: "작업이 허용되지 않습니다", "권한이 거부되었습니다" 또는 이와 유사합니다.**
  * **원인:**&#xC0CC;드박싱이 활성화되면 Qwen Code는 프로젝트 디렉터리 또는 시스템 임시 디렉터리 외부에 쓰기와 같이 샌드박스 구성에 의해 제한되는 작업을 시도할 수 있습니다.
  * **해결책:**&#xB2E4;음을 참조하세요.[구성: 샌드박싱](../features/sandbox)샌드박스 구성을 사용자 정의하는 방법을 포함한 자세한 내용은 설명서를 참조하세요.

* **Qwen Code가 "CI" 환경에서 대화형 모드로 실행되지 않습니다.**
  * **문제:**&#x51;wen 코드는 다음으로 시작하는 환경 변수인 경우 대화형 모드로 들어가지 않습니다(프롬프트가 표시되지 않음).`CI_`(예:`CI_TOKEN`)이 설정되었습니다. 이는`is-in-ci`기본 UI 프레임워크에서 사용되는 패키지는 이러한 변수를 감지하고 비대화형 CI 환경을 가정합니다.
  * **원인:**&#xADF8;만큼`is-in-ci`패키지의 존재 여부를 확인합니다.`CI`,`CONTINUOUS_INTEGRATION`또는`CI_`접두사. 이들 중 하나라도 발견되면 환경이 비대화형이라는 신호를 보내므로 CLI가 대화형 모드에서 시작되지 않습니다.
  * **해결책:**&#xB9CC;약`CI_`접두사가 붙은 변수는 CLI가 작동하는 데 필요하지 않으며 명령에 대해 일시적으로 설정을 해제할 수 있습니다. 예를 들어`env -u CI_TOKEN qwen`

* **프로젝트 .env 파일에서 디버그 모드가 작동하지 않습니다.**
  * **문제:**&#xD658;경`DEBUG=true`프로젝트에서`.env`파일은 CLI에 대해 디버그 모드를 활성화하지 않습니다.
  * **원인:**&#xADF8;만큼`DEBUG`그리고`DEBUG_MODE`변수는 프로젝트에서 자동으로 제외됩니다.`.env`CLI 동작에 대한 간섭을 방지하기 위한 파일입니다.
  * **해결책:**&#xC0AC;용`.qwen/.env`대신 파일을 작성하거나`advanced.excludedEnvVars`당신의 설정`settings.json`더 적은 수의 변수를 제외합니다.

## IDE Companion이 연결되지 않음

* VS Code에 단일 작업 영역 폴더가 열려 있는지 확인하세요.
* 확장을 설치한 후 통합 터미널을 다시 시작하여 다음을 상속합니다.
  * `QWEN_CODE_IDE_WORKSPACE_PATH`
  * `QWEN_CODE_IDE_SERVER_PORT`
* 컨테이너에서 실행 중인 경우 확인하세요.`host.docker.internal`해결합니다. 그렇지 않으면 호스트를 적절하게 매핑하십시오.
* 다음을 사용하여 컴패니언을 다시 설치하십시오.`/ide install`명령 팔레트에서 "Qwen Code: Run"을 사용하여 실행되는지 확인하세요.

## 종료 코드

Qwen 코드는 특정 종료 코드를 사용하여 종료 이유를 나타냅니다. 이는 스크립팅 및 자동화에 특히 유용합니다.

| 종료 코드 | 오류 유형                      | 설명                                                  |
| ----- | -------------------------- | --------------------------------------------------- |
| 41    | `FatalAuthenticationError` | 인증 과정에서 오류가 발생했습니다.                                 |
| 42    | `FatalInputError`          | CLI에 입력이 잘못되었거나 누락되었습니다. (비대화형 모드에만 해당)             |
| 44    | `FatalSandboxError`        | 샌드박스 환경(예: Docker, Podman 또는 Seatbelt)에 오류가 발생했습니다. |
| 52    | `FatalConfigError`         | 구성 파일(`settings.json`)이 잘못되었거나 오류가 포함되어 있습니다.       |
| 53    | `FatalTurnLimitedError`    | 세션의 최대 대화 차례 수에 도달했습니다. (비대화형 모드에만 해당)              |

## 디버깅 팁

* **CLI 디버깅:**
  * 사용`--verbose`플래그(사용 가능한 경우)를 CLI 명령과 함께 사용하면 더 자세한 출력을 얻을 수 있습니다.
  * 사용자별 구성이나 캐시 디렉터리에서 흔히 발견되는 CLI 로그를 확인하세요.

* **핵심 디버깅:**
  * 오류 메시지나 스택 추적에 대해서는 서버 콘솔 출력을 확인하십시오.
  * 구성 가능한 경우 로그의 자세한 정도를 늘립니다.
  * Node.js 디버깅 도구를 사용하세요(예:`node --inspect`) 서버 측 코드를 단계별로 실행해야 하는 경우.

* **도구 문제:**
  * 특정 도구가 실패하는 경우 도구가 수행하는 명령이나 작업의 가장 간단한 버전을 실행하여 문제를 격리해 보십시오.
  * 을 위한`run_shell_command`, 먼저 명령이 셸에서 직접 작동하는지 확인하세요.
  * 을 위한*파일 시스템 도구*, 경로가 올바른지 확인하고 권한을 확인하세요.

* **비행 전 점검:**
  * 항상 실행`npm run preflight`코드를 커밋하기 전에. 이를 통해 서식 지정, 보푸라기 및 유형 오류와 관련된 많은 일반적인 문제를 포착할 수 있습니다.

## 귀하와 유사한 기존 GitHub 문제 또는 새 문제 생성

이 문서에서 다루지 않은 문제가 발생하는 경우*문제 해결 가이드*, Qwen 코드 검색을 고려해보세요[GitHub의 이슈 트래커](https://github.com/QwenLM/qwen-code/issues). 귀하와 유사한 문제를 찾을 수 없다면 자세한 설명이 포함된 새 GitHub 문제를 생성해 보세요. Pull Request도 환영합니다!
