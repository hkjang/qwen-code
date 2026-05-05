# Qwen 코드: 서비스 약관 및 개인정보 보호정책

Qwen Code는 Qwen Code 팀에서 관리하는 오픈 소스 AI 코딩 보조 도구입니다. 본 문서에서는 Qwen Code의 인증방식 및 AI 모델 서비스 이용 시 적용되는 이용약관 및 개인정보취급방침을 간략하게 설명합니다.

## 인증 방법을 결정하는 방법

Qwen Code는 AI 모델에 액세스하기 위해 세 가지 인증 방법을 지원합니다. 인증 방법에 따라 사용에 적용되는 서비스 약관 및 개인정보 보호정책이 결정됩니다.

1. **Qwen OAuth**— qwen.ai 계정으로 로그인하세요(무료 등급은 2026년 4월 15일에 중단됨)
2. **Alibaba Cloud 코딩 계획**— Alibaba Cloud의 API 키를 사용하세요.
3. **API 키**— 자체 API 키 가져오기

각 인증 방법에는 기본 서비스 제공업체에 따라 다른 서비스 약관 및 개인정보 보호정책이 적용될 수 있습니다.

| 인증 방법               | 공급자       | 서비스 약관                                                     | 개인정보 보호정책                                                  |
| :------------------ | :-------- | :--------------------------------------------------------- | :--------------------------------------------------------- |
| Qwen OAuth          | 퀀 AI      | [Qwen 서비스 약관](https://qwen.ai/termsservice)                | [Qwen 개인 정보 보호 정책](https://qwen.ai/privacypolicy)          |
| Alibaba Cloud 코딩 계획 | 알리바바 클라우드 | 보다[아래 세부정보](#2-if-you-are-using-alibaba-cloud-coding-plan) | 보다[아래 세부정보](#2-if-you-are-using-alibaba-cloud-coding-plan) |
| API 키               | 다양한 공급자   | 선택한 API 제공업체(OpenAI, Anthropic 등)에 따라 다릅니다.                | 선택한 API 제공업체에 따라 다름                                        |

## 1. Qwen OAuth 인증을 사용하는 경우

qwen.ai 계정을 사용하여 인증하면 다음 서비스 약관 및 개인정보 보호정책 문서가 적용됩니다.

* **서비스 약관:**&#xADC0;하의 사용은 다음에 의해 규율됩니다.[Qwen 서비스 약관](https://qwen.ai/termsservice).
* **개인정보 보호정책:**&#xADC0;하의 데이터 수집 및 사용은 다음에 설명되어 있습니다.[Qwen 개인 정보 보호 정책](https://qwen.ai/privacypolicy).

인증 설정, 할당량, 지원되는 기능에 대한 자세한 내용은 다음을 참조하세요.[인증 설정](../configuration/settings).

## 2. 알리바바 클라우드 코딩 플랜을 사용하는 경우

When you authenticate using an API key from Alibaba Cloud, the applicable Terms of Service and Privacy Notice from Alibaba Cloud apply.

Alibaba Cloud Coding Plan은 두 지역에서 사용할 수 있습니다.

* **알리바바 클라우드 바이리안(aliyun.com)**—[bailian.console.aliyun.com](https://bailian.console.aliyun.com)
* **알리바바 클라우드(alibabacloud.com)**—[bailian.console.alibabacloud.com](https://bailian.console.alibabacloud.com)

> \[!중요한]
>
> Alibaba Cloud Coding Plan을 사용하면 Alibaba Cloud의 약관 및 개인 정보 보호 정책이 적용됩니다. 데이터 사용, 보관 및 개인정보 보호 관행에 대한 구체적인 세부정보는 해당 문서를 검토하세요.

## 3. 자체 API Key를 사용하는 경우

다른 공급자의 API 키를 사용하여 인증하는 경우 해당 서비스 약관 및 개인정보 보호정책은 선택한 공급자에 따라 다릅니다.

> \[!중요한]
>
> 자신의 API 키를 사용하는 경우 Qwen Code의 약관이 아닌 선택한 API 제공업체의 약관 및 개인정보 보호정책이 적용됩니다. 데이터 사용, 보관 및 개인정보 보호 관행에 대한 구체적인 세부정보는 제공업체의 설명서를 검토하세요.

Qwen Code는 다양한 OpenAI 호환 공급자를 지원합니다. 자세한 내용은 해당 제공업체의 서비스 약관 및 개인정보 보호정책을 참조하세요.

## 사용 통계 및 원격 측정

Qwen Code는 익명의 사용 통계를 수집할 수 있으며[원격 측정](../../developers/development/telemetry)사용자 경험과 제품 품질을 개선하기 위한 데이터입니다. 이 데이터 수집은 선택 사항이며 구성 설정을 통해 제어할 수 있습니다.

### 수집되는 데이터

활성화되면 Qwen Code는 다음을 수집할 수 있습니다.

* 익명 사용 통계(명령 실행, 성능 지표)
* 오류 보고서 및 충돌 데이터
* 기능 사용 패턴

### 인증방식에 따른 데이터 수집

* **Qwen OAuth:**&#xC0AC;용 통계는 Qwen의 개인 정보 보호 정책에 따라 관리됩니다. Qwen Code의 구성 설정을 통해 선택 해제할 수 있습니다.
* **Alibaba 클라우드 코딩 계획:**&#xC0AC;용 통계는 Alibaba Cloud의 개인정보 보호정책에 따라 관리됩니다. Qwen Code의 구성 설정을 통해 선택 해제할 수 있습니다.
* **API 키:**&#xADC0;하가 선택한 API 제공업체가 수집하는 것 이상으로 Qwen Code는 추가 데이터를 수집하지 않습니다.

## 자주 묻는 질문(FAQ)

### 1. 프롬프트와 답변을 포함한 내 코드가 AI 모델을 훈련하는 데 사용됩니까?

프롬프트 및 답변을 포함한 코드가 AI 모델을 훈련하는 데 사용되는지 여부는 인증 방법과 사용하는 특정 AI 서비스 공급자에 따라 다릅니다.

* **Qwen OAuth**: 데이터 사용량은 다음에 따라 결정됩니다.[Qwen의 개인 정보 보호 정책](https://qwen.ai/privacy). 데이터 수집 및 모델 학습 관행에 대한 구체적인 세부정보는 해당 정책을 참조하세요.

* **Alibaba Cloud 코딩 계획**: 데이터 사용에는 Alibaba Cloud의 개인정보 보호정책이 적용됩니다. 데이터 수집 및 모델 학습 관행에 대한 구체적인 세부정보는 해당 정책을 참조하세요.

* **API 키**: 데이터 사용량은 전적으로 귀하가 선택한 API 제공업체에 따라 다릅니다. 각 제공업체에는 자체 데이터 사용 정책이 있습니다. 특정 제공업체의 개인정보 보호정책과 서비스 약관을 검토하세요.

**중요한**: Qwen Code 자체는 모델 훈련을 위해 프롬프트, 코드 또는 응답을 사용하지 않습니다. 훈련 목적의 모든 데이터 사용에는 귀하가 인증한 AI 서비스 제공업체의 정책이 적용됩니다.

### 2. 사용 통계란 무엇이며 수신 거부는 무엇을 제어합니까?

그만큼**사용 통계**설정은 사용자 경험과 제품 품질 개선을 위해 Qwen Code의 선택적 데이터 수집을 제어합니다.

활성화되면 Qwen Code는 다음을 수집할 수 있습니다.

* 익명 원격 분석(명령 실행, 성능 지표, 기능 사용)
* 오류 보고서 및 충돌 데이터
* 일반적인 사용 패턴

**Qwen Code가 수집하지 않는 것:**

* 코드 내용
* AI 모델로 전송되는 프롬프트
* AI 모델의 응답
* 개인정보

사용 통계 설정은 Qwen Code 자체의 데이터 수집만 제어합니다. 귀하가 선택한 AI 서비스 제공업체(Qwen, OpenAI 등)가 자체 개인정보 보호정책에 따라 수집할 수 있는 데이터에는 영향을 미치지 않습니다.

### 3. 인증 방법을 어떻게 전환하나요?

언제든지 Qwen OAuth, Alibaba Cloud Coding Plan 및 자체 API 키 간에 전환할 수 있습니다.

1. **시작하는 동안**: 메시지가 표시되면 원하는 인증 방법을 선택하세요.
2. **CLI 내에서**: 사용`/auth`인증 방법을 재구성하는 명령
3. **환경변수**: 설정`.env`자동 API 키 인증을 위한 파일

자세한 지침은 다음을 참조하세요.[인증 설정](../configuration/settings#environment-variables-for-api-access)선적 서류 비치.
