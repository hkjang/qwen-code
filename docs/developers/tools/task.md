# 작업 도구(`task`)

이 문서에서는`task`Qwen Code용 도구입니다.

## 설명

사용`task`복잡한 다단계 작업을 자율적으로 처리하는 전문 하위 에이전트를 시작합니다. 작업 도구 위임은 자체 도구 세트에 액세스하여 독립적으로 작업할 수 있는 전문 에이전트와 협력하여 병렬 작업 실행 및 전문 지식을 허용합니다.

### 인수

`task`다음 인수를 사용합니다.

* `description`(문자열, 필수): 사용자 가시성 및 추적 목적을 위한 작업에 대한 짧은(3-5단어) 설명입니다.
* `prompt`(문자열, 필수): 하위 에이전트가 실행할 세부 작업 프롬프트입니다. 자율 실행을 위한 포괄적인 지침을 포함해야 합니다.
* `subagent_type`(문자열, 필수): 이 작업에 사용할 전문 에이전트의 유형입니다. 사용 가능한 구성된 하위 에이전트 중 하나와 일치해야 합니다.

## 사용방법`task`퀀코드와 함께

작업 도구는 구성에서 사용 가능한 하위 에이전트를 동적으로 로드하고 해당 하위 에이전트에 작업을 위임합니다. 각 하위 에이전트는 독립적으로 실행되며 자체 도구 세트를 사용할 수 있으므로 전문 지식과 병렬 실행이 가능합니다.

작업 도구를 사용하면 하위 에이전트는 다음을 수행합니다.

1. 완전한 자율성으로 작업 프롬프트 수신
2. 사용 가능한 도구를 사용하여 작업을 실행합니다.
3. 최종 결과 메시지 반환
4. 종료(하위 에이전트는 상태 비저장 및 단일 사용)

용법:

```
task(description="Brief task description", prompt="Detailed task instructions for the subagent", subagent_type="agent_name")
```

## 사용 가능한 하위 에이전트

사용 가능한 하위 에이전트는 구성에 따라 다릅니다. 일반적인 하위 에이전트 유형은 다음과 같습니다.

* **범용**: 다양한 도구가 필요한 복잡한 다단계 작업용
* **코드 검토자**: 코드 품질 검토 및 분석용
* **테스트러너**: 테스트 실행 및 결과 분석을 위해
* **문서 작성자**: 문서 작성 및 업데이트용

다음을 사용하여 사용 가능한 하위 에이전트를 볼 수 있습니다.`/agents`Qwen Code의 명령.

## 작업 도구 기능

### 실시간 진행 업데이트

작업 도구는 다음을 보여주는 실시간 업데이트를 제공합니다.

* 하위 에이전트 실행 상태
* 하위 에이전트에 의해 수행되는 개별 도구 호출
* 도구 호출 결과 및 오류
* 전반적인 업무 진행 및 완료 상태

### 병렬 실행

단일 메시지에서 작업 도구를 여러 번 호출하여 여러 하위 에이전트를 동시에 시작할 수 있으므로 병렬 작업 실행이 가능하고 효율성이 향상됩니다.

### 전문적인 전문성

각 하위 에이전트는 다음을 사용하여 구성할 수 있습니다.

* 특정 도구 액세스 권한
* 특수 시스템 프롬프트 및 지침
* 맞춤형 모델 구성
* 도메인별 지식과 역량

## `task`예

### 범용 에이전트에 위임

```
task(
  description="Code refactoring",
  prompt="Please refactor the authentication module in src/auth/ to use modern async/await patterns instead of callbacks. Ensure all tests still pass and update any related documentation.",
  subagent_type="general-purpose"
)
```

### 병렬 작업 실행

```
# Launch code review and test execution in parallel
task(
  description="Code review",
  prompt="Review the recent changes in the user management module for code quality, security issues, and best practices compliance.",
  subagent_type="code-reviewer"
)

task(
  description="Run tests",
  prompt="Execute the full test suite and analyze any failures. Provide a summary of test coverage and recommendations for improvement.",
  subagent_type="test-runner"
)
```

### 문서 생성

```
task(
  description="Update docs",
  prompt="Generate comprehensive API documentation for the newly implemented REST endpoints in the orders module. Include request/response examples and error codes.",
  subagent_type="documentation-writer"
)
```

## 작업 도구를 사용해야 하는 경우

다음과 같은 경우 작업 도구를 사용하세요.

1. **복잡한 다단계 작업**- 자율적으로 처리할 수 있는 여러 작업이 필요한 작업
2. **전문적인 전문성**- 도메인별 지식이나 도구를 활용하는 작업
3. **병렬 실행**- 동시에 실행할 수 있는 여러 개의 독립적인 작업이 있는 경우
4. **위임 요구**- 단계를 세세하게 관리하기보다는 완전한 작업을 넘겨주고 싶을 때
5. **리소스 집약적인 작업**- 상당한 시간이나 계산 리소스가 소요될 수 있는 작업

## 작업 도구를 사용하지 말아야 할 경우

다음과 같은 경우에는 작업 도구를 사용하지 마세요.

* **간단한 단일 단계 작업**- 읽기, 편집 등과 같은 직접 도구를 사용합니다.
* **대화형 작업**- 앞뒤로 의사소통이 필요한 업무
* **특정 파일 읽기**- 더 나은 성능을 위해 읽기 도구를 직접 사용하십시오.
* **단순 검색**- Grep 또는 Glob 도구를 직접 사용

## 중요 사항

* **무상태 실행**: 각 하위 에이전트 호출은 이전 실행에 대한 메모리 없이 독립적입니다.
* **단일 통신**: 하위 에이전트는 하나의 최종 결과 메시지를 제공하며 지속적인 통신은 없습니다.
* **포괄적인 프롬프트**: 프롬프트에는 자율 실행에 필요한 모든 컨텍스트와 지침이 포함되어야 합니다.
* **도구 액세스**: 하위 에이전트는 특정 구성으로 구성된 도구에만 액세스할 수 있습니다.
* **병렬 기능**: 효율성 향상을 위해 여러 하위 에이전트를 동시에 실행할 수 있습니다.
* **구성에 따라 다름**: 사용 가능한 하위 에이전트 유형은 시스템 구성에 따라 다릅니다.

## 구성

하위 에이전트는 Qwen Code의 에이전트 구성 시스템을 통해 구성됩니다. 사용`/agents`명령:

* 사용 가능한 하위 에이전트 보기
* 새 하위 에이전트 구성 만들기
* 기존 하위 에이전트 설정 수정
* 도구 권한 및 기능 설정

하위 에이전트 구성에 대한 자세한 내용은 하위 에이전트 설명서를 참조하세요.
