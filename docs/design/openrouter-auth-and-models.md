# OpenRouter 인증 및 모델 관리 설계

이 문서는 OpenRouter 인증 흐름과
모델 관리 변경 사항이 도입되었습니다. 의도적으로 초점을 맞춘다.
구현 기록이 아닌 제품 및 아키텍처 선택.

## 목표

- 사용자가 CLI와 OpenRouter를 통해 인증하도록 허용`/auth`.
- 새 인증을 추가하는 대신 기존 OpenAI 호환 공급자 경로를 재사용합니다.
  OpenRouter의 유형입니다.
- 사용자에게 수백 개의 관리 작업을 요청하지 않고도 첫 실행 경험을 사용할 수 있게 만듭니다.
  즉시 모델.
- 다음을 통해 더욱 풍부한 모델 관리를 향한 명확한 경로를 유지하세요.`/manage-models`.

## 오픈라우터 인증

OpenRouter는 OpenAI 호환 공급자로 통합됩니다.

- 인증 유형:`AuthType.USE_OPENAI`
- 공급자 설정:`modelProviders.openai`
- API key env var: `OPENROUTER_API_KEY`
- 기본 URL:`https://openrouter.ai/api/v1`

이렇게 하면 OpenRouter 관련 기능을 도입하지 않아도 됩니다.`AuthType`런타임 모델
공급자 경로는 이미 OpenAI와 호환됩니다. 인증 상태, 모델을 유지합니다.
기존 솔루션과 일치하는 해상도, 공급자 선택 및 설정 스키마
공급자 추상화.

사용자 측 흐름은 다음과 같습니다.

- `qwen auth openrouter --key <key>`자동화 또는 직접 API 키 설정을 위해.
- `qwen auth openrouter`브라우저 기반 OAuth용.
- `/auth`→ API 키 → TUI 흐름을 위한 OpenRouter.

브라우저 OAuth는 OpenRouter의 PKCE 흐름을 사용하고 교환된 API 키를
인증을 새로 고치기 전 설정`AuthType.USE_OPENAI`.

## 모델 관리

OpenRouter는 대규모 동적 모델 카탈로그를 공개합니다. 발견된 모든 모델 작성
으로`modelProviders.openai`만들 것이다`/model`시끄럽고 장기적으로 변할 것입니다.
설정 필드를 원격 카탈로그의 캐시에 추가합니다.

주요 디자인 분할은 다음과 같습니다.

- **목록**: 다음과 같은 소스에서 발견된 전체 모델 세트
  오픈라우터.
- **활성화된 세트**: 다음에 나타나야 하는 더 작은 모델 세트입니다.`/model`그리고
  사용자 설정에 유지됩니다.

초기 OpenRouter 흐름의 경우 인증은 유용한 기본값이 활성화된 상태로 완료되어야 합니다.
큰 선택기로 사용자를 방해하는 대신 설정하세요. 추천 세트
작고 안정적이어야 하며 사용자가 제품을 시험해 볼 수 있는 모델에 편향되어야 합니다.
가능한 경우 무료 모델을 포함하여 성공적으로 수행되었습니다.

`/model`빠른 모델 전환기로 남아 있습니다. 그런 곳이 되어서는 안 된다.
사용자는 전체 공급자 카탈로그를 탐색하고 선별합니다.

## `/manage-models`

더욱 풍부한 모델 관리는 별도의 영역에 속합니다.`/manage-models`진입점. 그
흐름을 통해 사용자는 다음을 수행할 수 있어야 합니다.

- 발견된 모델을 찾아보세요.
- ID, 표시 이름, 공급자 접두사 및 파생 태그(예:`free`또는`vision`;
- 현재 어떤 모델이 활성화되어 있는지 확인하세요.
- 모델을 일괄적으로 활성화하거나 비활성화합니다.

소스 차원은 이 디자인의 일부로 유지되어야 합니다. OpenRouter는 유일한
첫 번째 동적 카탈로그 소스; ModelScope 및 ModelStudio와 같은 미래 소스
같은 모양이 맞아야합니다. UI 복잡성은 줄어들 수 있지만 기본
소스 추상화는 확장 지점으로 계속 사용 가능해야 합니다.

## 현재 경계

This change should do the minimum needed to make OpenRouter auth and model setup
pleasant:

- OAuth 또는 키 기반 인증은 기존 인증을 통해 OpenRouter를 구성합니다.
  OpenAI 호환 공급자 경로.
- 전체 카탈로그를 덤프하는 대신 초기 활성화된 모델 세트가 선별됩니다.
  설정으로.
- 전체 카탈로그 저장, 찾아보기, 필터링 및 배치 관리는 다음으로 연기됩니다.`/manage-models`.

디자인 원칙은 간단합니다. 인증을 통해 사용자는 작업을 수행할 수 있어야 합니다.
상태는 신속하게 유지되어야 하며, 모델 큐레이션은 전용 관리 흐름에 따라 진행되어야 합니다.
