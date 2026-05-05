# Github 작업:qwen-code-action

## 개요

`qwen-code-action`통합된 GitHub Action입니다.[퀀 코드][Qwen Code]다음을 통해 개발 워크플로우에 추가하세요.[Qwen 코드 CLI][Qwen Code CLI]. 이는 중요한 일상적인 코딩 작업을 위한 자율 에이전트이자 신속하게 작업을 위임할 수 있는 주문형 공동 작업자 역할을 합니다.

이를 사용하여 GitHub 풀 요청 검토, 문제 분류, 코드 분석 및 수정 수행 등을 수행할 수 있습니다.[퀀 코드][Qwen Code]대화적으로(예:`@qwencoder fix this issue`) GitHub 리포지토리 내부에 직접 저장됩니다.

## 특징

* **오토메이션**: 이벤트(예: 이슈 개시) 또는 일정(예: 야간)을 기반으로 워크플로를 트리거합니다.
* **주문형 협업**: 문제가 있는 워크플로 및 끌어오기 요청을 트리거합니다. 
  언급하면서 댓글을 달았다.[Qwen 코드 CLI](./features/commands)(예:`@qwencoder /review`).
* **도구로 확장 가능**: 영향력[퀀 코드](../developers/tools/introduction.md)다음과 같은 다른 CLI와 상호 작용하는 모델의 도구 호출 기능[GitHub CLI]\(`gh`).
* **맞춤형**: 사용`QWEN.md`제공할 저장소의 파일 
  프로젝트별 지침 및 컨텍스트[Qwen 코드 CLI](./features/commands).

## 빠른 시작

단 몇 분만에 저장소에서 Qwen Code CLI를 시작하세요.

### 1. Qwen API 키 받기

다음에서 API 키를 받으세요.[대시스코프](https://help.aliyun.com/zh/model-studio/qwen-code)(알리바바 클라우드의 AI 플랫폼)

### 2. GitHub Secret으로 추가하세요

API 키를 비밀 이름으로 저장하세요.`QWEN_API_KEY`저장소에서:

* 저장소로 이동**설정 > 비밀 및 변수 > 작업**
* 딸깍 하는 소리**새 저장소 비밀**
* 이름:`QWEN_API_KEY`, 값: API 키

### 3. .gitignore 업데이트

다음 항목을`.gitignore`파일:

```gitignore
# qwen-code-cli settings
.qwen/

# GitHub App credentials
gha-creds-*.json
```

### 4. 워크플로 선택

워크플로를 설정하는 데는 두 가지 옵션이 있습니다.

**옵션 A: setup 명령 사용(권장)**

1. 터미널에서 Qwen Code CLI를 시작합니다.

   ```shell
   qwen
   ```

2. 터미널의 Qwen Code CLI에 다음을 입력합니다.

   ```
   /setup-github
   ```

**옵션 B: 워크플로를 수동으로 복사**

1. 사전 구축된 워크플로를 다음에서 복사합니다.[`examples/workflows`](./common-workflow)저장소의 디렉토리`.github/workflows`예배 규칙서. 참고:`qwen-dispatch.yml`워크플로도 복사해야 하며, 그러면 워크플로가 실행됩니다.

### 5. 사용해 보세요

**풀 요청 검토:**

* 저장소에서 풀 요청을 열고 자동 검토를 기다립니다.
* 논평`@qwencoder /review`기존 풀 요청에 대해 수동으로 검토 실행

**문제 분류:**

* 문제를 열고 자동 분류를 기다립니다.
* 논평`@qwencoder /triage`기존 문제에 대해 수동으로 분류를 실행

**일반 AI 지원:**

* 문제나 끌어오기 요청에서 다음을 언급하세요.`@qwencoder`귀하의 요청에 따라
* 예:
  * `@qwencoder explain this code change`
  * `@qwencoder suggest improvements for this function`
  * `@qwencoder help me debug this error`
  * `@qwencoder write unit tests for this component`

## Workflows

이 작업은 다양한 사용 사례에 대해 사전 구축된 여러 워크플로를 제공합니다. 각 워크플로는 저장소의`.github/workflows`디렉토리에 추가하고 필요에 따라 사용자 정의합니다.

### Qwen 코드 파견

이 워크플로는 Qwen Code CLI의 중앙 디스패처 역할을 하며, 주석에 제공된 명령과 트리거 이벤트를 기반으로 요청을 적절한 워크플로로 라우팅합니다. 디스패치 워크플로를 설정하는 방법에 대한 자세한 지침을 보려면[Qwen 코드 디스패치 워크플로우 문서](./common-workflow).

### 문제 분류

이 작업을 사용하면 GitHub 문제를 자동으로 또는 일정에 따라 분류할 수 있습니다. 이슈 분류 시스템 설정 방법에 대한 자세한 안내는 다음을 참조하세요.[GitHub Issue Triage 워크플로 문서](./examples/workflows/issue-triage).

### 풀 요청 검토

이 작업을 사용하면 풀 요청이 열릴 때 자동으로 검토할 수 있습니다. 풀 요청 검토 시스템을 설정하는 방법에 대한 자세한 지침을 보려면[GitHub PR 검토 워크플로 문서](./common-workflow).

### Qwen 코드 CLI 도우미

이러한 유형의 작업은 풀 요청 및 이슈 내에서 범용 대화형 Qwen Code AI 도우미를 호출하여 광범위한 작업을 수행하는 데 사용할 수 있습니다. 범용 Qwen Code CLI 워크플로를 설정하는 방법에 대한 자세한 지침을 보려면 다음으로 이동하세요.[Qwen Code Assistant 워크플로 문서](./common-workflow).

## 구성

### 입력

<!-- BEGIN_AUTOGEN_INPUTS -->

* <a name="__input_qwen_api_key"></a><a href="#user-content-__input_qwen_api_key"><code>qwen\*api\_key</code></a>: \*(선택 사항)\_ Qwen API용 API 키입니다.

* <a name="__input_qwen_cli_version"></a><a href="#user-content-__input_qwen_cli_version"><code>qwen\*cli\_version</code></a>: \*(선택 사항, 기본값:`latest`)\_ 설치할 Qwen Code CLI 버전입니다. "최신", "미리 보기", "nightly", 특정 버전 번호 또는 git 브랜치, 태그 또는 커밋일 수 있습니다. 자세한 내용은 다음을 참조하세요.[Qwen Code CLI 릴리스](https://github.com/QwenLM/qwen-code-action/blob/main/docs/releases.md).

* <a name="__input_qwen_debug"></a><a href="#user-content-__input_qwen_debug"><code>qwen\*디버그</code></a>: \*(선택 사항)\_ 디버그 로깅 및 출력 스트리밍을 활성화합니다.

* <a name="__input_qwen_model"></a><a href="#user-content-__input_qwen_model"><code>qwen\*모델</code></a>: \*(선택)\_ Qwen Code와 함께 사용할 모델입니다.

* <a name="__input_prompt"></a><a href="#user-content-__input_prompt"><code>즉각적인</code></a>:*(선택사항, 기본값:`You are a helpful assistant.`)*Qwen Code CLI에 전달된 문자열[`--prompt`논쟁](https://github.com/QwenLM/qwen-code-action/blob/main/docs/cli/configuration.md#command-line-arguments).

* <a name="__input_settings"></a><a href="#user-content-__input_settings"><code>설정</code></a>:*(선택 과목)*다음에 작성된 JSON 문자열`.qwen/settings.json`CLI를 구성하려면*프로젝트*설정.
  자세한 내용은 에 대한 설명서를 참조하세요.[설정 파일](https://github.com/QwenLM/qwen-code-action/blob/main/docs/cli/configuration.md#settings-files).

* <a name="__input_use_qwen_code_assist"></a><a href="#user-content-__input_use_qwen_code_assist"><code>\*qwen\_code\_assist 사용</code></a>: \*(선택 사항, 기본값:`false`)\_ Qwen Code 모델 액세스를 위해 기본 Qwen Code API 키 대신 Code Assist를 사용할지 여부입니다.
  자세한 내용은 다음을 참조하세요.[Qwen 코드 CLI 문서](https://github.com/QwenLM/qwen-code-action/blob/main/docs/cli/authentication.md).

* <a name="__input_use_vertex_ai"></a><a href="#user-content-__input_use_vertex_ai"><code>사용\*vertex\_ai</code></a>: \*(선택 사항, 기본값:`false`)\_ Qwen Code 모델 액세스에 기본 Qwen Code API 키 대신 Vertex AI를 사용할지 여부입니다.
  자세한 내용은 다음을 참조하세요.[Qwen 코드 CLI 문서](https://github.com/QwenLM/qwen-code-action/blob/main/docs/cli/authentication.md).

* <a name="__input_extensions"></a><a href="#user-content-__input_extensions"><code>확장</code></a>:*(선택 과목)*설치할 Qwen Code CLI 확장 목록입니다.

* <a name="__input_upload_artifacts"></a><a href="#user-content-__input_upload_artifacts"><code>업로드\*아티팩트</code></a>: \*(선택 사항, 기본값:`false`)\_ github 작업에 아티팩트를 업로드할지 여부입니다.

* <a name="__input_use_pnpm"></a><a href="#user-content-__input_use_pnpm"><code>사용\*pnpm</code></a>: \*(선택 사항, 기본값:`false`)\_ qwen-code-cli 설치에 npm 대신 pnpm을 사용할지 여부

* <a name="__input_workflow_name"></a><a href="#user-content-__input_workflow_name"><code>워크플로\*이름</code></a>: \*(선택 사항, 기본값:`${{ github.workflow }}`)\_ 텔레메트리 목적으로 사용되는 GitHub 워크플로 이름입니다.

<!-- END_AUTOGEN_INPUTS -->

### 출력

<!-- BEGIN_AUTOGEN_OUTPUTS -->

* <a name="__output_summary"></a><a href="#user-content-__output_summary"><code>요약</code></a>: Qwen Code CLI 실행의 요약된 출력입니다.

* <a name="__output_error"></a><a href="#user-content-__output_error"><code>오류</code></a>: Qwen Code CLI 실행의 오류 출력(있는 경우)입니다.

<!-- END_AUTOGEN_OUTPUTS -->

### 리포지토리 변수

모든 워크플로에서 재사용할 수 있도록 다음 값을 리포지토리 변수로 설정하는 것이 좋습니다. 또는 개별 워크플로의 작업 입력으로 인라인으로 설정하거나 저장소 수준 값을 재정의할 수 있습니다.

| 이름                 | 설명                                | 유형     | 필수의 | 필요한 경우             |
| ------------------ | --------------------------------- | ------ | --- | ------------------ |
| `DEBUG`            | Qwen Code CLI에 대한 디버그 로깅을 활성화합니다. | 변하기 쉬운 | 아니요 | 절대                 |
| `QWEN_CLI_VERSION` | 설치된 Qwen Code CLI 버전을 제어합니다.      | 변하기 쉬운 | 아니요 | CLI 버전 고정          |
| `APP_ID`           | 사용자 정의 인증을 위한 GitHub 앱 ID입니다.     | 변하기 쉬운 | 아니요 | 사용자 정의 GitHub 앱 사용 |

저장소 변수를 추가하려면 다음을 수행하십시오.

1. 저장소로 이동**설정 > 비밀 및 변수 > 작업 > 새 변수**.
2. 변수 이름과 값을 입력합니다.
3. 구하다.

리포지토리 변수에 대한 자세한 내용은[변수에 대한 GitHub 문서][variables].

### 기미

저장소에서 다음 비밀을 설정할 수 있습니다.

| 이름                | 설명                         | 필수의 | 필요한 경우                     |
| ----------------- | -------------------------- | --- | -------------------------- |
| `QWEN_API_KEY`    | DashScope의 Qwen API 키입니다.  | 예   | Qwen을 호출하는 모든 워크플로에 필요합니다. |
| `APP_PRIVATE_KEY` | GitHub 앱의 개인 키(PEM 형식)입니다. | 아니요 | 사용자 정의 GitHub 앱을 사용합니다.    |

비밀을 추가하려면:

1. 저장소로 이동**설정 > 비밀 및 변수 > 작업 > 새 저장소 비밀**.
2. 비밀 이름과 값을 입력합니다.
3. 구하다.

자세한 내용은 다음을 참조하세요.[암호화된 비밀 생성 및 사용에 대한 공식 GitHub 문서][secrets].

## 입증

이 작업을 수행하려면 GitHub API에 대한 인증이 필요하며 선택적으로 Qwen Code 서비스에 대한 인증이 필요합니다.

### GitHub 인증

다음 두 가지 방법으로 GitHub에 인증할 수 있습니다.

1. **기본`GITHUB_TOKEN`:**더 간단한 사용 사례의 경우 작업에서
   기본값`GITHUB_TOKEN`워크플로에서 제공됩니다.
2. **사용자 정의 GitHub 앱(권장):**가장 안전하고 유연한 솔루션을 위해
   인증을 위해서는 사용자 정의 GitHub 앱을 생성하는 것이 좋습니다.

Qwen 및 GitHub 인증에 대한 자세한 설정 지침을 보려면 다음으로 이동하세요.[**인증 문서**](./configuration/auth).

## 확장

Qwen Code CLI는 확장을 통해 추가 기능으로 확장될 수 있습니다.
이러한 확장은 GitHub 리포지토리의 소스에서 설치됩니다.

확장을 설정하고 구성하는 방법에 대한 자세한 지침을 보려면[확장 문서](../developers/extensions/extension).

## 모범 사례

자동화된 워크플로의 보안, 안정성 및 효율성을 보장하려면 모범 사례를 따르는 것이 좋습니다. 이 지침은 저장소 보안, 워크플로 구성, 모니터링과 같은 주요 영역을 다룹니다.

주요 권장 사항은 다음과 같습니다.

* **저장소 보안:**분기 및 태그 보호를 구현하고 끌어오기 요청 승인자를 제한합니다.
* **모니터링 및 감사:**정기적으로 작업 로그를 검토하고 OpenTelemetry를 활성화하여 성능과 동작에 대한 더 깊은 통찰력을 얻습니다.

리포지토리 및 작업 흐름 보안에 대한 포괄적인 가이드는 다음을 참조하세요.[**모범 사례 문서**](./common-workflow).

## 맞춤화

다음을 제공하기 위해 저장소 루트에 QWEN.md 파일을 생성합니다. 
프로젝트별 컨텍스트 및 지침[Qwen 코드 CLI](./common-workflow). 이는 정의하는 데 유용합니다. 
코딩 규칙, 아키텍처 패턴 또는 모델이 수행해야 하는 기타 지침 
주어진 저장소를 따르십시오.

## 기여

기여를 환영합니다! Qwen 코드 CLI를 확인하세요**기여 가이드**시작하는 방법에 대한 자세한 내용을 알아보세요.

[secrets]: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions

[Qwen Code]: https://github.com/QwenLM/qwen-code

[DashScope]: https://dashscope.console.aliyun.com/apiKey

[Qwen Code CLI]: https://github.com/QwenLM/qwen-code-action/

[variables]: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-variables#creating-configuration-variables-for-a-repository

[GitHub CLI]: https://docs.github.com/en/github-cli/github-cli

[QWEN.md]: https://github.com/QwenLM/qwen-code-action/blob/main/docs/cli/configuration.md#context-files-hierarchical-instructional-context
