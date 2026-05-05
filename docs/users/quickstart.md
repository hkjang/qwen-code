# 빠른 시작

> 👏 Qwen Code에 오신 것을 환영합니다!

이 빠른 시작 가이드에서는 단 몇 분 만에 AI 기반 코딩 지원을 사용할 수 있습니다. 마지막에는 일반적인 개발 작업에 Qwen Code를 사용하는 방법을 이해하게 됩니다.

## 시작하기 전에

다음 사항을 확인하세요.

* 에이**단말기**또는 명령 프롬프트 열기
* 작업할 코드 프로젝트
* Alibaba Cloud Model Studio의 API 키([베이징](https://bailian.console.aliyun.com/) / [국제](https://modelstudio.console.alibabacloud.com/)) 또는 Alibaba Cloud 코딩 계획([베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=coding-plan#/efm/coding-plan-index) / [국제](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index)) 구독

## 1단계: Qwen 코드 설치

Qwen Code를 설치하려면 다음 방법 중 하나를 사용하십시오.

### 빠른 설치(권장)

**리눅스/맥OS**

```sh
curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen.sh | bash
```

**Windows(관리자 권한으로 실행)**

```cmd
powershell -Command "Invoke-WebRequest 'https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen.bat' -OutFile (Join-Path $env:TEMP 'install-qwen.bat'); & (Join-Path $env:TEMP 'install-qwen.bat')"
```

> \[!메모]
>
> 환경 변수가 적용되도록 설치 후 터미널을 다시 시작하는 것이 좋습니다.

### 수동 설치

**전제조건**

Node.js 20 이상이 설치되어 있는지 확인하세요. 다음에서 다운로드하세요.[nodejs.org](https://nodejs.org/en/download).

**NPM**

```bash
npm install -g @qwen-code/qwen-code@latest
```

**홈브루(macOS, Linux)**

```bash
brew install qwen-code
```

## 2단계: 인증 설정

대화형 세션을 시작하면`qwen`명령을 실행하면 인증을 구성하라는 메시지가 표시됩니다.

```bash
# You'll be prompted to set up authentication on first use
qwen
```

```bash
# Or run /auth anytime to change authentication method
/auth
```

원하는 인증 방법을 선택하세요:

* **Alibaba Cloud 코딩 계획**: 선택하다`Alibaba Cloud Coding Plan`다양한 모델 옵션이 포함된 월 고정 요금으로 이용 가능합니다. 참조[코딩 계획 가이드](https://bailian.console.aliyun.com/cn-beijing/?tab=coding-plan#/efm/coding-plan-index)([국제](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index)) 설정 지침을 확인하세요.
* **API 키**: 선택하다`API Key`을 클릭한 다음 Alibaba Cloud Model Studio의 API 키([베이징](https://bailian.console.aliyun.com/) / [국제](https://modelstudio.console.alibabacloud.com/)). API 설정 가이드([베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model\&url=3023091) / [국제](https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model\&url=2974721)) 자세한 내용은

> ⚠️**메모**: Qwen OAuth는 2026년 4월 15일부로 서비스가 중단되었습니다. 이전에 Qwen OAuth를 사용 중이셨다면 위 방법 중 하나로 전환해주세요.

> \[!메모]
>
> Qwen 계정으로 Qwen 코드를 처음 인증하면 ".qwen"이라는 작업 공간이 자동으로 생성됩니다. 이 작업 공간은 조직의 모든 Qwen Code 사용에 대한 중앙 집중식 비용 추적 및 관리를 제공합니다.

> \[!팁]
>
> 다음을 실행하여 세션을 시작하지 않고 터미널에서 직접 인증을 구성할 수도 있습니다.`qwen auth`. 사용`qwen auth status`언제든지 현재 구성을 확인할 수 있습니다. 참조[입증](./configuration/auth)자세한 내용은 페이지를 참조하세요.

## 3단계: 첫 번째 세션 시작

프로젝트 디렉터리에서 터미널을 열고 Qwen Code를 시작합니다.

```bash
# optiona
cd /path/to/your/project
# start qwen
qwen
```

세션 정보, 최근 대화 및 최신 업데이트가 포함된 Qwen Code 시작 화면이 표시됩니다. 유형`/help`사용 가능한 명령에 대해

## Qwen Code와 채팅

### 첫 번째 질문을 해보세요

Qwen Code는 파일을 분석하고 요약을 제공합니다. 더 구체적인 질문을 할 수도 있습니다.

```
explain the folder structure
```

Qwen Code에 자체 기능에 대해 문의할 수도 있습니다.

```
what can Qwen Code do?
```

> \[!메모]
>
> Qwen Code는 필요에 따라 파일을 읽습니다. 컨텍스트를 수동으로 추가할 필요가 없습니다. Qwen Code는 또한 자체 문서에 액세스할 수 있으며 해당 기능에 대한 질문에 답할 수 있습니다.

### 첫 번째 코드 변경

이제 Qwen Code가 실제 코딩을 수행하도록 합시다. 간단한 작업을 시도해 보세요.

```
add a hello world function to the main file
```

Qwen 코드는 다음을 수행합니다.

1. 적절한 파일 찾기
2. 제안된 변경사항 표시
3. 승인을 요청하세요.
4. 수정하세요

> \[!메모]
>
> Qwen Code는 파일을 수정하기 전에 항상 권한을 요청합니다. 개별 변경 사항을 승인하거나 세션에 대해 "모두 수락" 모드를 활성화할 수 있습니다.

### Qwen 코드와 함께 Git 사용

Qwen Code는 Git 작업을 대화식으로 만듭니다.

```
what files have I changed?
```

```
commit my changes with a descriptive message
```

더 복잡한 Git 작업을 요청하는 메시지를 표시할 수도 있습니다.

```
create a new branch called feature/quickstart
```

```
show me the last 5 commits
```

```
help me resolve merge conflicts
```

### 버그 수정 또는 기능 추가

Qwen Code는 디버깅 및 기능 구현에 능숙합니다.

원하는 것이 무엇인지 자연어로 설명하세요.

```
add input validation to the user registration form
```

또는 기존 문제를 해결하세요.

```
there's a bug where users can submit empty forms - fix it
```

Qwen 코드는 다음을 수행합니다.

* 관련 코드를 찾으세요
* 맥락을 이해하라
* 솔루션 구현
* 가능한 경우 테스트 실행

### 다른 일반적인 워크플로 테스트

Qwen Code로 작업하는 방법에는 여러 가지가 있습니다.

**리팩토링 코드**

```
refactor the authentication module to use async/await instead of callbacks
```

**테스트 작성**

```
write unit tests for the calculator functions
```

**문서 업데이트**

```
update the README with installation instructions
```

**코드 검토**

```
review my changes and suggest improvements
```

> \[!팁]
>
> **기억하다**: Qwen Code는 AI 쌍 프로그래머입니다. 도움이 되는 동료처럼 대화하세요. 달성하고 싶은 것이 무엇인지 설명하면 목표를 달성하는 데 도움이 될 것입니다.

## 필수 명령

일상적으로 사용하는 가장 중요한 명령은 다음과 같습니다.

| 명령                   | 기능                           | 예                          |
| -------------------- | ---------------------------- | -------------------------- |
| `qwen`               | Qwen 코드 시작                   | `qwen`                     |
| `/auth`              | 인증 방법 변경(세션 중)               | `/auth`                    |
| `qwen auth`          | 터미널에서 인증 구성                  | `qwen auth`                |
| `qwen auth api-key`  | API 키 인증 구성                  | `qwen auth api-key`        |
| `qwen auth status`   | 현재 인증 상태 확인                  | `qwen auth status`         |
| `/help`              | 사용 가능한 명령에 대한 도움말 정보 표시      | `/help`또는`/?`              |
| `/compress`          | 토큰을 저장하려면 채팅 기록을 요약으로 대체하세요. | `/compress`                |
| `/clear`             | 터미널 화면 내용 지우기                | `/clear`(지름길:`Ctrl+L`)     |
| `/theme`             | Qwen Code 시각적 테마 변경          | `/theme`                   |
| `/language`          | 언어 설정 보기 또는 변경               | `/language`                |
| →`ui [language]`     | UI 인터페이스 언어 설정               | `/language ui zh-CN`       |
| →`output [language]` | LLM 출력 언어 설정                 | `/language output Chinese` |
| `/quit`              | 즉시 Qwen 코드 종료                | `/quit`또는`/exit`           |

참조[CLI 참조](./features/commands)전체 명령 목록을 보려면

## 초보자를 위한 전문가의 팁

**귀하의 요청을 구체적으로 작성하십시오**

* 대신: "버그 수정"
* 시도: "잘못된 자격 증명을 입력한 후 사용자에게 빈 화면이 표시되는 로그인 버그 수정"

**단계별 지침 사용**

* 복잡한 작업을 여러 단계로 나누세요.

```
1. create a new database table for user profiles
2. create an API endpoint to get and update user profiles
3. build a webpage that allows users to see and edit their information
```

**Qwen Code를 먼저 탐색해 보세요.**

* 변경하기 전에 Qwen Code가 코드를 이해하도록 하세요.

```
analyze the database schema
```

```
build a dashboard showing products that are most frequently returned by our UK customers
```

**바로가기로 시간을 절약하세요**

* 누르다`?`사용 가능한 모든 키보드 단축키를 보려면
* 명령 완성을 위해 Tab 사용
* 명령 기록을 보려면 ↑를 누르세요.
* 유형`/`모든 슬래시 명령을 보려면

## 도움 받기

* **퀀코드에서**: 유형`/help`아니면 "어떻게..."라고 물어보세요.
* **선적 서류 비치**: 당신은 여기에 있습니다! 다른 가이드 찾아보기
* **지역 사회**: 우리와 함께하세요[GitHub 토론](https://github.com/QwenLM/qwen-code/discussions)팁과 지원을 받으려면
