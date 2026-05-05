# Qwen 코드 개요

[![@qwen-code/qwen-code downloads](https://img.shields.io/npm/dw/@qwen-code/qwen-code.svg)](https://npm-compare.com/@qwen-code/qwen-code)
[![@qwen-code/qwen-code version](https://img.shields.io/npm/v/@qwen-code/qwen-code.svg)](https://www.npmjs.com/package/@qwen-code/qwen-code)

> 터미널에 상주하며 이전보다 더 빠르게 아이디어를 코드로 전환하는 데 도움이 되는 Qwen의 에이전트 코딩 도구인 Qwen Code에 대해 알아보세요.

## 30초 안에 시작하세요

### Qwen 코드 설치:

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
> It's recommended to restart your terminal after installation to ensure environment variables take effect. If the installation fails, please refer to [수동 설치](./quickstart#manual-installation)빠른 시작 가이드에서

### Qwen 코드 사용 시작:

```bash
cd your-project
qwen
```

인증 방법을 선택하세요 —**API 키**또는**[Alibaba Cloud 코딩 계획](https://bailian.console.aliyun.com/cn-beijing/?tab=coding-plan#/efm/coding-plan-index)**([국제](https://modelstudio.console.alibabacloud.com/?tab=coding-plan#/efm/coding-plan-index)) — 프롬프트에 따라 구성합니다. API 설정 가이드([베이징](https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc/?type=model\&url=3023091) / [국제](https://modelstudio.console.alibabacloud.com/ap-southeast-1?tab=doc#/doc/?type=model\&url=2974721)) 단계별 지침을 참조하세요. 그런 다음 코드베이스를 이해하는 것부터 시작하겠습니다. 다음 명령 중 하나를 시도해 보십시오.

```
what does this project do?
```

![](https://cloud.video.taobao.com/vod/j7-QtQScn8UEAaEdiv619fSkk5p-t17orpDbSqKVL5A.mp4)

처음 사용할 때 로그인하라는 메시지가 표시됩니다. 그게 다야\![빠른 시작으로 계속하기(5분) →](./quickstart)

> \[!팁]
>
> 보다[문제 해결](./support/troubleshooting)문제가 발생하면.

> \[!메모]
>
> **새로운 VS 코드 확장(베타)**: 그래픽 인터페이스를 선호하시나요? 우리의 새로운**VS 코드 확장**터미널에 익숙하지 않아도 사용하기 쉬운 기본 IDE 환경을 제공합니다. 마켓플레이스에서 간단히 설치하고 사이드바에서 직접 Qwen Code로 코딩을 시작하세요. 다운로드 및 설치[Qwen 코드 동반자](https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion)지금.

## Qwen Code가 당신을 위해 하는 일

* **설명을 통해 기능 구축**: 일반 언어로 빌드하려는 내용을 Qwen Code에 알려줍니다. 계획을 세우고, 코드를 작성하고, 작동하는지 확인합니다.
* **문제 디버그 및 수정**: 버그를 설명하거나 오류 메시지를 붙여넣습니다. Qwen Code는 코드베이스를 분석하고 문제를 식별하고 수정 사항을 구현합니다.
* **모든 코드베이스 탐색**: 팀의 코드베이스에 대해 무엇이든 물어보고 사려 깊은 답변을 받으세요. Qwen Code는 전체 프로젝트 구조에 대한 인식을 유지하고 웹에서 최신 정보를 찾을 수 있으며[MCP](./features/mcp)Google Drive, Figma, Slack과 같은 외부 데이터 소스에서 가져올 수 있습니다.
* **지루한 작업 자동화**: 성가신 린트 문제를 수정하고, 병합 충돌을 해결하고, 릴리스 노트를 작성합니다. 개발자 컴퓨터에서 단일 명령으로 이 모든 작업을 수행하거나 CI에서 자동으로 수행합니다.
* **[후속 제안](./features/followup-suggestions)**: Qwen Code는 다음에 입력할 내용을 예측하고 이를 고스트 텍스트로 표시합니다. 수락하려면 Tab 키를 누르고, 닫으려면 계속 입력하세요.

## 개발자가 Qwen Code를 좋아하는 이유

* **터미널에서 작동**: 다른 채팅창이 아닙니다. 다른 IDE가 아닙니다. Qwen Code는 이미 작업하고 있는 곳에서 이미 좋아하는 도구를 사용하여 여러분을 만납니다.
* **조치를 취합니다**: Qwen Code는 파일을 직접 편집하고, 명령을 실행하고, 커밋을 생성할 수 있습니다. 더 필요하신가요?[MCP](./features/mcp)Qwen Code를 사용하면 Google Drive에서 디자인 문서를 읽고 Jira에서 티켓을 업데이트하거나*당신의*맞춤형 개발자 도구.
* **유닉스 철학**: Qwen Code는 구성 및 스크립트가 가능합니다.`tail -f app.log | qwen -p "Slack me if you see any anomalies appear in this log stream"` *공장*. CI를 실행할 수 있습니다.`qwen -p "If there are new text strings, translate them into French and raise a PR for @lang-fr-team to review"`.
