# 입증

Qwen Code는 세 가지 인증 방법을 지원합니다. CLI를 실행하려는 방법과 일치하는 것을 선택하십시오.

* **Qwen OAuth**: 귀하의 계정으로 로그인하세요.`qwen.ai`브라우저에서 계정.**무료 등급은 2026년 4월 15일에 중단되었습니다.**— 다른 방법으로 전환하십시오.
* **Alibaba Cloud 코딩 계획**: Alibaba Cloud의 API 키를 사용하세요. 다양한 모델 옵션과 더 높은 할당량을 갖춘 유료 구독입니다.
* **API 키**: 자신만의 API 키를 가져오세요. 자신의 요구에 맞게 유연하게 — OpenAI, Anthropic, Gemini 및 기타 호환 가능한 엔드포인트를 지원합니다.

## 옵션 1: Qwen OAuth(중단됨)

> \[!경고]
>
> Qwen OAuth 무료 등급은 2026년 4월 15일에 중단되었습니다. 기존 캐시된 토큰은 잠시 동안 계속 작동할 수 있지만 새 요청은 거부됩니다. 알리바바 클라우드 코딩 플랜으로 전환해주세요.[오픈라우터](https://openrouter.ai),[불꽃놀이 AI](https://app.fireworks.ai), 또는 다른 제공업체. 달리다`qwen auth`구성합니다.

* **작동 원리**: 처음 시작할 때 Qwen Code는 브라우저 로그인 페이지를 엽니다. 완료한 후에는 자격 증명이 로컬로 캐시되므로 일반적으로 다시 로그인할 필요가 없습니다.
* **요구사항**: 에`qwen.ai`계정 + 인터넷 접속(적어도 첫 번째 로그인의 경우).
* **이익**: API 키 관리 없음, 자동 자격 증명 새로 고침.
* **비용 및 할당량**: 2026년 4월 15일부터 무료 등급이 중단되었습니다.

CLI를 시작하고 브라우저 흐름을 따릅니다.

```bash
qwen
```

또는 세션을 시작하지 않고 직접 인증합니다.

```bash
qwen auth qwen-oauth
```

> \[!메모]
>
> 비대화형 또는 헤드리스 환경(예: CI, SSH, 컨테이너)에서는 일반적으로**할 수 없다**OAuth 브라우저 로그인 흐름을 완료합니다.\
> 이러한 경우에는 Alibaba Cloud Coding Plan 또는 API Key 인증 방법을 이용하시기 바랍니다.

## 💳 옵션 2: Alibaba Cloud 코딩 계획

다양한 모델 옵션과 더 높은 사용 할당량으로 예측 가능한 비용을 원하는 경우 이를 사용하세요.

* **작동 원리**: 월 고정 요금으로 코딩 플랜을 구독한 후, 전용 엔드포인트와 구독 API 키를 사용하도록 Qwen Code를 구성하세요.
* **요구사항**: 다음에서 활성 코딩 계획 구독을 얻습니다.[Alibaba Cloud ModelStudio(베이징)](https://bailian.console.aliyun.com/cn-beijing?tab=coding-plan#/efm/coding-plan-index)또는[Alibaba Cloud ModelStudio(intl)](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index), 계정 지역에 따라 다릅니다.
* **이익**: 다양한 모델 옵션, 더 높은 사용 할당량, 예측 가능한 월별 비용, 다양한 모델(Qwen, GLM, Kimi, Minimax 등)에 대한 액세스.
* **비용 및 할당량**: Aliyun ModelStudio 코딩 계획 문서 보기[베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model\&url=3005961)[국제](https://modelstudio.console.alibabacloud.com/?tab=doc#/doc/?type=model\&url=2840914).

Alibaba Cloud Coding Plan은 두 지역에서 사용할 수 있습니다.

| 지역                       | 콘솔 URL                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| Aliyun ModelStudio (베이징) | [bailian.console.aliyun.com](https://bailian.console.aliyun.com)             |
| 알리바바 클라우드(intl)          | [bailian.console.alibabacloud.com](https://bailian.console.alibabacloud.com) |

### 대화형 설정

다음 두 가지 방법으로 코딩 계획 인증을 설정할 수 있습니다.

**옵션 A: 터미널에서(최초 설정에 권장)**

```bash
# Interactive — prompts for region and API key
qwen auth coding-plan

# Or non-interactive — pass region and key directly
qwen auth coding-plan --region china --key sk-sp-xxxxxxxxx
```

**옵션 B: Qwen Code 세션 내부**

입력하다`qwen`터미널에서 Qwen Code를 시작한 다음`/auth`명령하고 선택**Alibaba Cloud 코딩 계획**. 지역을 선택한 후 입력하세요.`sk-sp-xxxxxxxxx`열쇠.

인증 후 이용하세요.`/model`모든 Alibaba Cloud Coding Plan 지원 모델(qwen3.5-plus, qwen3-coder-plus, qwen3-coder-next, qwen3-max, glm-4.7 및 Kimi-k2.5 포함) 간에 전환하는 명령입니다.

### 대안: 다음을 통해 구성`settings.json`

대화형을 건너뛰고 싶다면`/auth`흐름에 다음을 추가합니다.`~/.qwen/settings.json`:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus (Coding Plan)",
        "baseUrl": "https://coding.dashscope.aliyuncs.com/v1",
        "description": "qwen3-coder-plus from Alibaba Cloud Coding Plan",
        "envKey": "BAILIAN_CODING_PLAN_API_KEY"
      }
    ]
  },
  "env": {
    "BAILIAN_CODING_PLAN_API_KEY": "sk-sp-xxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3-coder-plus"
  }
}
```

> \[!메모]
>
> 코딩 계획은 전용 엔드포인트(`https://coding.dashscope.aliyuncs.com/v1`) 이는 표준 Dashscope 엔드포인트와 다릅니다. 올바른 사용법을 확인하세요`baseUrl`.

## 🚀 옵션 3: API 키(유연함)

OpenAI, Anthropic, Google, Azure OpenAI, OpenRouter, ModelScope 또는 자체 호스팅 엔드포인트와 같은 타사 공급자에 연결하려는 경우 이를 사용합니다. 여러 프로토콜과 공급자를 지원합니다.

### 권장 사항: 다음을 통한 단일 파일 설정`settings.json`

API 키 인증을 시작하는 가장 간단한 방법은 모든 것을 단일에 넣는 것입니다.`~/.qwen/settings.json`파일. 바로 사용할 수 있는 완전한 예는 다음과 같습니다.

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3-coder-plus",
        "name": "qwen3-coder-plus",
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "description": "Qwen3-Coder via Dashscope",
        "envKey": "DASHSCOPE_API_KEY"
      }
    ]
  },
  "env": {
    "DASHSCOPE_API_KEY": "sk-xxxxxxxxxxxxx"
  },
  "security": {
    "auth": {
      "selectedType": "openai"
    }
  },
  "model": {
    "name": "qwen3-coder-plus"
  }
}
```

각 필드의 역할은 다음과 같습니다.

| 필드                           | 설명                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `modelProviders`             | 사용 가능한 모델과 해당 모델에 연결하는 방법을 선언합니다. 키(`openai`,`anthropic`,`gemini`)는 API 프로토콜을 나타냅니다.           |
| `env`                        | API 키를 직접 저장합니다.`settings.json`대체(가장 낮은 우선순위 — 쉘`export`그리고`.env`파일이 우선 적용됩니다).                |
| `security.auth.selectedType` | 시작 시 사용할 프로토콜을 Qwen Code에 알려줍니다(예:`openai`,`anthropic`,`gemini`). 이것이 없으면 실행해야합니다`/auth`대화식으로. |
| `model.name`                 | Qwen Code 시작 시 활성화되는 기본 모델입니다. 다음 중 하나와 일치해야 합니다.`id`당신의 가치`modelProviders`.                   |

파일을 저장한 후 실행해 보세요.`qwen`— 대화형 없음`/auth`설정이 필요합니다.

> \[!팁]
>
> 아래 섹션에서는 각 부분을 더 자세히 설명합니다. 위의 간단한 예가 효과가 있다면 다음으로 건너뛰셔도 됩니다.[보안 참고사항](#security-notes).

핵심 컨셉은**모델 제공자**(`modelProviders`): Qwen Code는 OpenAI뿐만 아니라 여러 API 프로토콜을 지원합니다. 편집을 통해 사용할 수 있는 공급자와 모델을 구성합니다.`~/.qwen/settings.json`을 사용하여 런타임에 둘 사이를 전환합니다.`/model`명령.

#### 지원되는 프로토콜

| 규약        | `modelProviders`열쇠 | 환경변수                                                       | 공급자                                                                             |
| --------- | ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| OpenAI 호환 | `openai`           | `OPENAI_API_KEY`,`OPENAI_BASE_URL`,`OPENAI_MODEL`          | OpenAI, Azure OpenAI, OpenRouter, ModelScope, Alibaba Cloud, 모든 OpenAI 호환 엔드포인트 |
| 인류학       | `anthropic`        | `ANTHROPIC_API_KEY`,`ANTHROPIC_BASE_URL`,`ANTHROPIC_MODEL` | 인류애적인 클로드                                                                       |
| 구글 젠AI    | `gemini`           | `GEMINI_API_KEY`,`GEMINI_MODEL`                            | 구글 제미니                                                                          |

#### 1단계: 모델 및 공급자 구성`~/.qwen/settings.json`

각 프로토콜에 사용할 수 있는 모델을 정의합니다. 각 모델 항목에는 최소한`id`그리고`envKey`(API 키를 보유하는 환경 변수 이름)

> \[!중요한]
>
> 정의하는 것이 좋습니다.`modelProviders`사용자 범위에서`~/.qwen/settings.json`프로젝트와 사용자 설정 간의 병합 충돌을 방지합니다.

편집하다`~/.qwen/settings.json`(존재하지 않는 경우 생성합니다.) 단일 파일에 여러 프로토콜을 혼합할 수 있습니다. 다음은`modelProviders`부분:

```json
{
  "modelProviders": {
    "openai": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "envKey": "OPENAI_API_KEY",
        "baseUrl": "https://api.openai.com/v1"
      }
    ],
    "anthropic": [
      {
        "id": "claude-sonnet-4-20250514",
        "name": "Claude Sonnet 4",
        "envKey": "ANTHROPIC_API_KEY"
      }
    ],
    "gemini": [
      {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "envKey": "GEMINI_API_KEY"
      }
    ]
  }
}
```

> \[!팁]
>
> 설정하는 것도 잊지 마세요`env`,`security.auth.selectedType`, 그리고`model.name`나란히`modelProviders`— 참조[위의 완전한 예](#recommended-one-file-setup-via-settingsjson)참고용.

**`ModelConfig`필드(내부의 각 항목`modelProviders`):**

| 필드                 | 필수의 | 설명                                                    |
| ------------------ | --- | ----------------------------------------------------- |
| `id`               | 예   | API로 전송된 모델 ID(예:`gpt-4o`,`claude-sonnet-4-20250514`) |
| `name`             | 아니요 | 표시 이름`/model`선택기(기본값은`id`)                            |
| `envKey`           | 예   | API 키의 환경 변수 이름(예:`OPENAI_API_KEY`)                   |
| `baseUrl`          | 아니요 | API 엔드포인트 재정의(프록시 또는 사용자 정의 엔드포인트에 유용함)               |
| `generationConfig` | 아니요 | 미세 조정`timeout`,`maxRetries`,`samplingParams`, 등.      |

> \[!메모]
>
> 사용할 때`env`필드`settings.json`, 자격 증명은 일반 텍스트로 저장됩니다. 보안을 강화하려면 다음을 선호하세요.`.env`파일 또는 셸`export`- 보다[2단계](#step-2-set-environment-variables).

전체를 위해`modelProviders`스키마 및 다음과 같은 고급 옵션`generationConfig`,`customHeaders`, 그리고`extra_body`, 보다[모델 제공자 참조](model-providers.md).

#### 2단계: 환경 변수 설정

Qwen 코드는 환경 변수(다음으로 지정됨)에서 API 키를 읽습니다.`envKey`모델 구성에서). 이를 제공하는 방법에는 여러 가지가 있습니다. 아래 목록에 나와 있습니다.**가장 높은 우선순위에서 가장 낮은 우선순위**:

**1. 쉘 환경 /`export`(가장 높은 우선순위)**

쉘 프로필(`~/.zshrc`,`~/.bashrc`등) 또는 실행 전 인라인:

```bash

# Alibaba Dashscope
export DASHSCOPE_API_KEY="sk-..."

# OpenAI / OpenAI-compatible
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Google GenAI
export GEMINI_API_KEY="AIza..."
```

**2. `.env`파일**

Qwen 코드는 자동으로 로드됩니다.**첫 번째** `.env`찾은 파일(변수는**병합되지 않음**여러 파일에 걸쳐). 아직 존재하지 않는 변수만`process.env`로드됩니다.

검색 순서(현재 디렉토리에서 위쪽 방향으로 이동)`/`):

1. `.qwen/.env`(선호 — Qwen 코드 변수를 다른 도구와 격리된 상태로 유지)
2. `.env`

아무 것도 발견되지 않으면 귀하의 계정으로 돌아갑니다.**홈 디렉토리**:

3. `~/.qwen/.env`
4. `~/.env`

> \[!팁]
>
> `.qwen/.env`위에 추천합니다`.env`다른 도구와의 충돌을 피하기 위해. 일부 변수(예:`DEBUG`그리고`DEBUG_MODE`)는 프로젝트 수준에서 제외됩니다.`.env`Qwen Code 동작을 방해하지 않도록 파일을 삭제하세요.

**3. `settings.json`→`env`필드(가장 낮은 우선순위)**

API 키를 직접 정의할 수도 있습니다.`~/.qwen/settings.json`아래에`env`열쇠. 이들은 다음과 같이 로드됩니다.**우선순위가 가장 낮은 대체**— 시스템 환경에서 변수가 아직 설정되지 않은 경우에만 적용됩니다.`.env`파일.

```json
{
  "env": {
    "DASHSCOPE_API_KEY": "sk-...",
    "OPENAI_API_KEY": "sk-...",
    "ANTHROPIC_API_KEY": "sk-ant-..."
  }
}
```

이는 에서 사용된 접근 방식입니다.[단일 파일 설정 예](#recommended-one-file-setup-via-settingsjson)위에. 모든 것을 한 곳에 보관하면 편리하지만,`settings.json`공유 또는 동기화 가능 - 선호`.env`민감한 비밀을 위한 파일.

**우선순위 요약:**

| 우선 사항    | 원천                          | 동작 무시                             |
| -------- | --------------------------- | --------------------------------- |
| 1(가장 높음) | CLI 플래그(`--openai-api-key`) | 항상 승리                             |
| 2        | 시스템 환경(`export`, 인라인)       | 재정의`.env`그리고`settings.json`→`env` |
| 3        | `.env`파일                    | 시스템 환경에 없는 경우에만 설정됩니다.            |
| 4(최저)    | `settings.json`→`env`       | 시스템 환경에 없는 경우에만 설정됩니다.`.env`      |

#### 3단계: 다음을 사용하여 모델 전환`/model`

Qwen Code를 실행한 후`/model`구성된 모든 모델 사이를 전환하는 명령입니다. 모델은 프로토콜별로 그룹화됩니다.

```
/model
```

선택기는 귀하의 모든 모델을 표시합니다`modelProviders`프로토콜별로 그룹화된 구성(예:`openai`,`anthropic`,`gemini`). 선택 사항은 세션 전반에 걸쳐 유지됩니다.

또한 명령줄 인수를 사용하여 모델을 직접 전환할 수도 있는데, 이는 여러 터미널에서 작업할 때 편리합니다.

```bash
# In one terminal

qwen --model "qwen3-coder-plus"

# In another terminal

qwen --model "qwen3.5-plus"
```

## `qwen auth`CLI 명령

세션 중 외에도`/auth`슬래시 명령, Qwen Code는 독립형을 제공합니다.`qwen auth`대화형 세션을 먼저 시작하지 않고 터미널에서 직접 인증을 관리하기 위한 CLI 명령입니다.

### 대화형 모드

달리다`qwen auth`대화형 메뉴를 얻으려면 인수 없이:

```bash
qwen auth
```

화살표 키 탐색이 가능한 선택기가 표시됩니다.

```
Select authentication method:

  Alibaba Cloud Coding Plan - Paid · Up to 6,000 requests/5 hrs · All Alibaba Cloud Coding Plan Models
  API Key - Bring your own API key
  Qwen OAuth - Discontinued — switch to Coding Plan or API Key

(Use ↑ ↓ arrows to navigate, Enter to select, Ctrl+C to exit)
```

### 하위 명령

| 명령                                                   | 설명                             |
| ---------------------------------------------------- | ------------------------------ |
| `qwen auth`                                          | 대화형 인증 설정                      |
| `qwen auth coding-plan`                              | Alibaba Cloud Coding Plan으로 인증 |
| `qwen auth coding-plan --region china --key sk-sp-…` | 비대화형 코딩 계획 설정(스크립팅용)           |
| `qwen auth api-key`                                  | API 키로 인증                      |
| `qwen auth qwen-oauth`                               | Qwen OAuth로 인증(단종)             |
| `qwen auth status`                                   | 현재 인증 상태 표시                    |

**예:**

```bash
# Authenticate with Qwen OAuth directly
qwen auth qwen-oauth

# Set up Coding Plan interactively (prompts for region and key)
qwen auth coding-plan

# Set up Coding Plan non-interactively (useful for CI/scripting)
qwen auth coding-plan --region china --key sk-sp-xxxxxxxxx

# Set up API key (ModelStudio Standard or custom provider)
qwen auth api-key

# Check your current auth configuration
qwen auth status
```

## 보안 참고사항

* 버전 제어에 API 키를 커밋하지 마세요.
* 선호하다`.qwen/.env`프로젝트-로컬 비밀을 위해(git 외부에 보관)
* 확인을 위해 자격 증명을 인쇄하는 경우 터미널 출력을 민감한 것으로 처리하십시오.
