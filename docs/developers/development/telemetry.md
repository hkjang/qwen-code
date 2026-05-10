# OpenTelemetry를 통한 관찰 가능성

Qwen Code용 OpenTelemetry를 활성화하고 설정하는 방법을 알아보세요.

- [OpenTelemetry를 통한 관찰 가능성](#observability-with-opentelemetry)
  - [주요 이점](#key-benefits)
  - [OpenTelemetry 통합](#opentelemetry-integration)
  - [구성](#configuration)
  - [Aliyun 텔레메트리](#aliyun-telemetry)
    - [수동 OTLP 내보내기](#manual-otlp-export)
  - [로컬 텔레메트리](#local-telemetry)
    - [파일 기반 출력(권장)](#file-based-output-recommended)
    - [수집기 기반 내보내기(고급)](#collector-based-export-advanced)
  - [로그 및 지표](#logs-and-metrics)
    - [로그](#logs)
    - [측정항목](#metrics)

## 주요 이점

- **🔍 사용 분석**: 상호작용 패턴 및 기능 채택 이해
  팀 전반에 걸쳐
- **⚡ 성능 모니터링**: 응답 시간, 토큰 소비 및
  리소스 활용
- **🐛 실시간 디버깅**: 병목 현상, 장애, 오류 패턴을 식별합니다.
  발생하는 대로
- **📊 작업 흐름 최적화**: 개선을 위해 정보에 입각한 결정을 내립니다.
  구성 및 프로세스
- **🏢 기업 거버넌스**: 팀 전체의 사용량을 모니터링하고, 비용을 추적하고,
  규정 준수 및 기존 모니터링 인프라와 통합

## OpenTelemetry 통합

기반**[오픈텔레메트리][OpenTelemetry]**— 공급업체 중립적, 업계 표준
관찰 가능성 프레임워크 — Qwen Code의 관찰 가능성 시스템은 다음을 제공합니다.

- **범용 호환성**: OpenTelemetry 백엔드로 내보내기(Aliyun,
  예거, 프로메테우스, 데이터독 등)
- **표준화된 데이터**: 전 세계에 걸쳐 일관된 형식과 수집 방법을 사용합니다.
  당신의 툴체인
- **미래 지향적 통합**: 기존 및 미래의 관측성과 연결
  인프라
- **공급업체 종속 없음**: 변경하지 않고 백엔드 간 전환
  계측

[OpenTelemetry]: https://opentelemetry.io/
[aliyun-opentelemetry-overview]: https://www.alibabacloud.com/help/en/arms/tracing-analysis/product-overview/what-is-tracing-analysis
[aliyun-opentelemetry-get-started]: https://www.alibabacloud.com/help/en/arms/tracing-analysis/before-you-begin
[aliyun-opentelemetry-console-cn]: https://trace.console.aliyun.com
[aliyun-opentelemetry-console-cn-legacy]: https://tracing.console.aliyun.com
[aliyun-opentelemetry-console-intl]: https://arms.console.alibabacloud.com

## 구성

> \[!메모]
>
> **⚠️ 특별 참고 사항: 이 기능을 사용하려면 해당 코드 변경이 필요합니다. 이 문서는 사전에 제공됩니다. 실제 기능에 대해서는 향후 코드 업데이트를 참조하세요.**

모든 텔레메트리 동작은 다음을 통해 제어됩니다.`.qwen/settings.json`파일.
이러한 설정은 환경 변수 또는 CLI 플래그로 재정의될 수 있습니다.

| 환경                  | 환경변수                               | CLI 플래그                                               | 설명                                                | 가치              | 기본                    |
| --------------------- | -------------------------------------- | -------------------------------------------------------- | --------------------------------------------------- | ----------------- | ----------------------- |
| `enabled`             | `QWEN_TELEMETRY_ENABLED`               | `--telemetry` / `--no-telemetry`                         | 텔레메트리 활성화 또는 비활성화                     | `true`/`false`    | `false`                 |
| `target`              | `QWEN_TELEMETRY_TARGET`                | `--telemetry-target <local\|gcp>`                        | 텔레메트리 데이터를 보낼 위치                       | `"gcp"`/`"local"` | `"local"`               |
| `otlpEndpoint`        | `QWEN_TELEMETRY_OTLP_ENDPOINT`         | `--telemetry-otlp-endpoint <URL>`                        | OTLP 수집기 끝점                                    | URL 문자열        | `http://localhost:4317` |
| `otlpProtocol`        | `QWEN_TELEMETRY_OTLP_PROTOCOL`         | `--telemetry-otlp-protocol <grpc\|http>`                 | OTLP 전송 프로토콜                                  | `"grpc"`/`"http"` | `"grpc"`                |
| `otlpTracesEndpoint`  | `QWEN_TELEMETRY_OTLP_TRACES_ENDPOINT`  | -                                                        | 추적에 대한 신호별 엔드포인트 재정의(HTTP에만 해당) | URL 문자열        | -                       |
| `otlpLogsEndpoint`    | `QWEN_TELEMETRY_OTLP_LOGS_ENDPOINT`    | -                                                        | 로그에 대한 신호별 엔드포인트 재정의(HTTP에만 해당) | URL 문자열        | -                       |
| `otlpMetricsEndpoint` | `QWEN_TELEMETRY_OTLP_METRICS_ENDPOINT` | -                                                        | 지표에 대한 신호별 엔드포인트 재정의(HTTP에만 해당) | URL 문자열        | -                       |
| `outfile`             | `QWEN_TELEMETRY_OUTFILE`               | `--telemetry-outfile <path>`                             | 텔레메트리을 파일에 저장(재정의`otlpEndpoint`)      | 파일 경로         | -                       |
| `logPrompts`          | `QWEN_TELEMETRY_LOG_PROMPTS`           | `--telemetry-log-prompts` / `--no-telemetry-log-prompts` | 원격 분석 로그에 프롬프트 포함                      | `true`/`false`    | `true`                  |
| `useCollector`        | `QWEN_TELEMETRY_USE_COLLECTOR`         | -                                                        | 외부 OTLP 수집기 사용(고급)                         | `true`/`false`    | `false`                 |

**부울 환경 변수에 대한 참고 사항:**부울 설정의 경우(`enabled`,`logPrompts`,`useCollector`), 해당 환경 변수를 다음으로 설정합니다.`true`또는`1`기능을 활성화하겠습니다. 다른 값을 사용하면 비활성화됩니다.

**HTTP OTLP 신호 라우팅:**HTTP 프로토콜을 사용하는 경우(`otlpProtocol: "http"`),
Qwen 코드는 신호별 경로를 자동으로 추가합니다(`/v1/traces`,`/v1/logs`,`/v1/metrics`) 베이스로`otlpEndpoint`. 예를 들어,`http://collector:4318`된다`http://collector:4318/v1/traces`흔적을 위해. URL이 이미 끝나는 경우
신호 경로가 있으면 그대로 사용됩니다. 신호별 엔드포인트 재정의
(`otlpTracesEndpoint`등)은 기본 끝점보다 우선하며 사용됩니다.
말 그대로. gRPC 프로토콜은 서비스 기반 라우팅을 사용하며 경로를 추가하지 않습니다.

신호별 엔드포인트 환경 변수도 표준을 허용합니다.
OpenTelemetry 이름:`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`,`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`,`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`.
그만큼`QWEN_TELEMETRY_OTLP_*`변형이 다음보다 우선합니다.`OTEL_*`변형.

모든 구성 옵션에 대한 자세한 내용은 다음을 참조하세요.[구성 가이드](./cli/configuration.md).

## Aliyun 텔레메트리

### 수동 OTLP 내보내기

Alibaba Cloud Managed Service에서 Qwen Code 텔레메트리을 보려면
OpenTelemetry, OTLP 끝점으로 내보내도록 Qwen 코드 구성
ARMS에서 제공합니다.

환경`"target": "gcp"`혼자서는 내보내기를 구성하지 않습니다
목적지. 만약에`otlpEndpoint`설정되지 않은 경우에도 Qwen 코드는 여전히 기본값입니다.`http://localhost:4317`. 만약에`outfile`설정되어 있으면 재정의됩니다.`otlpEndpoint`원격 분석이 파일에 기록되는 대신
Alibaba Cloud로 전송되었습니다.

1. 텔레메트리을 활성화합니다.`.qwen/settings.json`OTLP를 설정하고
   끝점:

   **옵션 A: gRPC 프로토콜**(표준 OTLP 엔드포인트):

   ```json
   {
     "telemetry": {
       "enabled": true,
       "target": "gcp",
       "otlpEndpoint": "https://<your-otlp-endpoint>",
       "otlpProtocol": "grpc"
     }
   }
   ```

   **옵션 B: 신호별 엔드포인트가 있는 HTTP 프로토콜**(백엔드의 경우
   비표준 경로를 사용하는 경로(예:`/api/otlp/traces`대신에`/v1/traces`):

   ```json
   {
     "telemetry": {
       "enabled": true,
       "otlpProtocol": "http",
       "otlpTracesEndpoint": "http://<host>/<token>/api/otlp/traces",
       "otlpLogsEndpoint": "http://<host>/<token>/api/otlp/logs",
       "otlpMetricsEndpoint": "http://<host>/<token>/api/otlp/metrics"
     }
   }
   ```

   > **메모:**HTTP 프로토콜을 사용하는 경우`otlpEndpoint`(아니요
   > 신호별 재정의), Qwen 코드는 표준 OTLP 경로를 추가합니다.
   > (`/v1/traces`,`/v1/logs`,`/v1/metrics`)를 기본 URL로 변경합니다. 만약 당신의
   > 백엔드는 다른 경로를 사용합니다. 신호별 엔드포인트 재정의를 다음과 같이 사용하세요.
   > 옵션 B에 표시됩니다.

2. Alibaba Cloud 엔드포인트에 인증이 필요한 경우 OTLP를 제공하세요.
   다음과 같은 표준 OpenTelemetry 환경 변수를 통한 헤더`OTEL_EXPORTER_OTLP_HEADERS`(또는 신호별 변형). 퀀
   코드는 현재 OTLP 인증 헤더를 직접 노출하지 않습니다.`.qwen/settings.json`.

3. Qwen Code를 실행하고 프롬프트를 보냅니다.

4. OpenTelemetry용 관리형 서비스에서 원격 분석 보기:
   - 제품 개요:[OpenTelemetry용 관리형 서비스란 무엇입니까?][aliyun-opentelemetry-overview]
   - 시작하기:[OpenTelemetry용 관리형 서비스 시작하기][aliyun-opentelemetry-get-started]
   - 콘솔 진입점:
     - 중국 본토:[추적.console.aliyun.com][aliyun-opentelemetry-console-cn]\(기존 콘솔:[tracing.console.aliyun.com][aliyun-opentelemetry-console-cn-legacy])
     - 국제적인:[arms.console.alibabacloud.com][aliyun-opentelemetry-console-intl]
   - 콘솔에서 다음을 사용하십시오.`Applications`추적 및 서비스 검사
     토폴로지.
   - OTLP 엔드포인트를 찾고 정보에 액세스하려면:
     - **새 콘솔**(`trace.console.aliyun.com`또는 국제):
       다음으로 이동`Integration Center`.
     - **레거시 콘솔**(`tracing.console.aliyun.com`): 다음으로 이동`Cluster 설정s`→`Access point information`.

## 로컬 텔레메트리

로컬 개발 및 디버깅의 경우 원격 분석 데이터를 로컬로 캡처할 수 있습니다.

### 파일 기반 출력(권장)

1. 텔레메트리을 활성화합니다.`.qwen/settings.json`:
   ```json
   {
     "telemetry": {
       "enabled": true,
       "target": "local",
       "otlpEndpoint": "",
       "outfile": ".qwen/telemetry.log"
     }
   }
   ```
2. Qwen Code를 실행하고 프롬프트를 보냅니다.
3. 지정된 파일(예:`.qwen/telemetry.log`).

### 수집기 기반 내보내기(고급)

1. 자동화 스크립트를 실행합니다.
   ```bash
   npm run telemetry -- --target=local
   ```
   이는 다음을 수행합니다.
   - Jaeger 및 OTEL 수집기 다운로드 및 시작
   - 로컬 텔레메트리을 위한 작업 공간 구성
   - Jaeger UI 제공:<http://localhost:16686>
   - 로그/측정항목을 다음에 저장`~/.qwen/tmp/<projectHash>/otel/collector.log`
   - 종료 시 수집기를 중지합니다(예:`Ctrl+C`)
2. Qwen Code를 실행하고 프롬프트를 보냅니다.
3. 다음에서 추적 보기<http://localhost:16686>및 수집기 로그의 로그/메트릭
   파일.

## 로그 및 지표

다음 섹션에서는 생성된 로그 및 측정항목의 구조를 설명합니다.
퀀코드.

- 에이`sessionId`모든 로그 및 지표에 공통 속성으로 포함됩니다.

### 로그

로그는 특정 이벤트에 대한 타임스탬프 기록입니다. Qwen Code에 대해 다음 이벤트가 기록됩니다.

- `qwen-code.config`: 이 이벤트는 CLI 구성 시작 시 한 번 발생합니다.
  - **속성**:
    - `model`(끈)
    - `sandbox_enabled`(부울)
    - `core_tools_enabled`(끈)
    - `approval_mode`(끈)
    - `file_filtering_respect_git_ignore`(부울)
    - `debug_mode`(부울)
    - `truncate_tool_output_threshold`(숫자)
    - `truncate_tool_output_lines`(숫자)
    - `hooks`(문자열, 쉼표로 구분된 후크 이벤트 유형, 후크가 비활성화된 경우 생략됨)
    - `ide_enabled`(부울)
    - `interactive_shell_enabled`(부울)
    - `mcp_servers`(끈)
    - `output_format`(문자열: "text" 또는 "json")

- `qwen-code.user_prompt`: 이 이벤트는 사용자가 프롬프트를 제출할 때 발생합니다.
  - **속성**:
    - `prompt_length`(정수)
    - `prompt_id`(끈)
    - `prompt`(문자열, 다음의 경우 이 속성은 제외됩니다.`log_prompts_enabled`이다
      으로 구성`false`)
    - `auth_type`(끈)

- `qwen-code.tool_call`: 이 이벤트는 함수 호출마다 발생합니다.
  - **속성**:
    - `function_name`
    - `function_args`
    - `duration_ms`
    - `success`(부울)
    - `decision`(문자열: "accept", "reject", "auto_accept" 또는 "modify"인 경우
      해당)
    - `error`(해당하는 경우)
    - `error_type`(해당되는 경우)
    - `content_length`(int, 해당되는 경우)
    - `metadata`(해당되는 경우 문자열 사전 -> 임의)

- `qwen-code.file_operation`: 이 이벤트는 파일 작업마다 발생합니다.
  - **속성**:
    - `tool_name`(끈)
    - `operation`(문자열: "만들기", "읽기", "업데이트")
    - `lines`(int, 해당되는 경우)
    - `mimetype`(해당되는 경우 문자열)
    - `extension`(해당되는 경우 문자열)
    - `programming_language`(해당되는 경우 문자열)
    - `diff_stat`(해당되는 경우 json 문자열): 다음 멤버가 포함된 JSON 문자열입니다.
      - `ai_added_lines`(정수)
      - `ai_removed_lines`(정수)
      - `user_added_lines`(정수)
      - `user_removed_lines`(정수)

- `qwen-code.api_request`: Qwen API에 요청 시 발생하는 이벤트입니다.
  - **속성**:
    - `model`
    - `request_text`(해당되는 경우)

- `qwen-code.api_error`: API 요청이 실패할 경우 발생하는 이벤트입니다.
  - **속성**:
    - `model`
    - `error`
    - `error_type`
    - `status_code`
    - `duration_ms`
    - `auth_type`

- `qwen-code.api_response`: Qwen API로부터 응답을 받았을 때 발생하는 이벤트입니다.
  - **속성**:
    - `model`
    - `status_code`
    - `duration_ms`
    - `error`(선택 과목)
    - `input_token_count`
    - `output_token_count`
    - `cached_content_token_count`
    - `thoughts_token_count`
    - `response_text`(해당되는 경우)
    - `auth_type`

- `qwen-code.tool_output_truncated`: 이 이벤트는 도구 호출의 출력이 너무 커서 잘릴 때 발생합니다.
  - **속성**:
    - `tool_name`(끈)
    - `original_content_length`(정수)
    - `truncated_content_length`(정수)
    - `threshold`(정수)
    - `lines`(정수)
    - `prompt_id`(끈)

- `qwen-code.malformed_json_response`: 이 이벤트는 다음과 같은 경우에 발생합니다.`generateJson`Qwen API의 응답을 json으로 구문 분석할 수 없습니다.
  - **속성**:
    - `model`

- `qwen-code.flash_fallback`: Qwen Code가 대체적으로 플래시로 전환될 때 발생하는 이벤트입니다.
  - **속성**:
    - `auth_type`

- `qwen-code.slash_command`: 이 이벤트는 사용자가 슬래시 명령을 실행할 때 발생합니다.
  - **속성**:
    - `command`(끈)
    - `subcommand`(해당되는 경우 문자열)

- `qwen-code.extension_enable`: 확장 기능이 활성화되면 이 이벤트가 발생합니다.

- `qwen-code.extension_install`: 확장 기능이 설치되면 발생하는 이벤트입니다.
  - **속성**:
    - `extension_name`(끈)
    - `extension_version`(끈)
    - `extension_source`(끈)
    - `status`(끈)

- `qwen-code.extension_uninstall`: 이 이벤트는 확장 프로그램이 제거될 때 발생합니다.

### 측정항목

측정항목은 시간 경과에 따른 행동을 수치적으로 측정한 것입니다. Qwen Code에 대해 다음 측정항목이 수집됩니다(측정항목 이름은 그대로 유지됨).`qwen-code.*`호환성을 위해):

- `qwen-code.session.count`(카운터, Int): CLI 시작마다 한 번씩 증가합니다.

- `qwen-code.tool.call.count`(Counter, Int): 도구 호출을 계산합니다.
  - **속성**:
    - `function_name`
    - `success`(부울)
    - `decision`(문자열: "수락", "거부" 또는 "수정"(해당되는 경우))
    - `tool_type`(문자열: "mcp" 또는 해당하는 경우 "네이티브")

- `qwen-code.tool.call.latency`(히스토그램, ms): 도구 호출 대기 시간을 측정합니다.
  - **속성**:
    - `function_name`
    - `decision`(문자열: "수락", "거부" 또는 "수정"(해당되는 경우))

- `qwen-code.api.request.count`(Counter, Int): 모든 API 요청을 계산합니다.
  - **속성**:
    - `model`
    - `status_code`
    - `error_type`(해당되는 경우)

- `qwen-code.api.request.latency`(히스토그램, ms): API 요청 대기 시간을 측정합니다.
  - **속성**:
    - `model`

- `qwen-code.token.usage`(Counter, Int): 사용된 토큰 수를 계산합니다.
  - **속성**:
    - `model`
    - `type`(문자열: "입력", "출력", "생각" 또는 "캐시")

- `qwen-code.file.operation.count`(Counter, Int): 파일 작업을 계산합니다.
  - **속성**:
    - `operation`(문자열: "create", "read", "update"): 파일 작업 유형입니다.
    - `lines`(해당되는 경우 Int): 파일의 줄 수입니다.
    - `mimetype`(해당되는 경우 문자열): 파일의 MIME 유형입니다.
    - `extension`(해당되는 경우 문자열): 파일의 파일 확장자입니다.
    - `model_added_lines`(Int, 해당되는 경우): 모델에 의해 추가/변경된 라인 수입니다.
    - `model_removed_lines`(해당되는 경우 Int): 모델에 의해 제거/변경된 줄 수입니다.
    - `user_added_lines`(해당되는 경우 Int): AI 제안 변경 사항에서 사용자가 추가/변경한 줄 수입니다.
    - `user_removed_lines`(해당되는 경우 Int): AI 제안 변경 사항에서 사용자가 제거/변경한 줄 수입니다.
    - `programming_language`(해당되는 경우 문자열): 파일의 프로그래밍 언어입니다.

- `qwen-code.chat_compression`(Counter, Int): 채팅 압축 작업 수를 계산합니다.
  - **속성**:
    - `tokens_before`: (Int): 압축 전 컨텍스트의 토큰 수
    - `tokens_after`: (Int): 압축 후 컨텍스트의 토큰 수
