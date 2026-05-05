# 하위 에이전트

하위 에이전트는 Qwen Code 내에서 특정 유형의 작업을 처리하는 전문 AI 도우미입니다. 이를 통해 작업별 프롬프트, 도구 및 동작으로 구성된 AI 에이전트에 집중된 작업을 위임할 수 있습니다.

## 하위 에이전트란 ​​무엇입니까?

하위 에이전트는 다음과 같은 기능을 수행하는 독립적인 AI 보조자입니다.

* **특정 업무를 전문적으로 수행**- 각 하위 에이전트는 특정 작업 유형에 대한 집중적인 시스템 프롬프트로 구성됩니다.
* **별도의 컨텍스트가 있음**- 기본 채팅과 별도로 자신의 대화 기록을 유지합니다.
* **통제된 도구를 사용하세요**- 각 하위 에이전트가 액세스할 수 있는 도구를 구성할 수 있습니다.
* **자율적으로 작업**- 한번 임무가 주어지면 완료되거나 실패할 때까지 독립적으로 일함
* **자세한 피드백 제공**- 진행 상황, 도구 사용, 실행 통계를 실시간으로 확인할 수 있습니다.

## 포크 하위 에이전트(암시적 포크)

명명된 하위 에이전트 외에도 Qwen Code는 다음을 지원합니다.**암시적 분기**— AI가`subagent_type`매개변수를 사용하면 상위의 전체 대화 컨텍스트를 상속하는 포크를 트리거합니다.

### 포크가 명명된 하위 에이전트와 다른 점

|          | 명명된 하위 에이전트          | 포크 하위 에이전트                         |
| -------- | -------------------- | ---------------------------------- |
| 문맥       | 새로 시작되며 부모 기록이 없습니다. | 부모의 전체 대화 기록을 상속받습니다.              |
| 시스템 프롬프트 | 자체 구성된 프롬프트를 사용합니다.  | 부모의 정확한 시스템 프롬프트를 사용합니다(캐시 공유를 위해) |
| 실행       | 완료될 때까지 부모를 차단합니다.   | 백그라운드에서 실행되며 상위 항목은 즉시 계속됩니다.      |
| 사용 사례    | 전문업무(테스트, 문서)        | 현재 컨텍스트가 필요한 병렬 작업                 |

### 포크를 사용할 때

AI는 다음과 같은 경우 자동으로 포크를 사용합니다.

* 여러 연구 작업을 병렬로 실행합니다(예: "모듈 A, B 및 C 조사")
* 기본 대화를 계속하면서 백그라운드 작업을 수행합니다.
* 현재 대화 맥락에 대한 이해가 필요한 작업 위임

### 신속한 캐시 공유

모든 포크는 상위의 정확한 API 요청 접두사(시스템 프롬프트, 도구, 대화 기록)를 공유하여 DashScope 프롬프트 캐시 히트를 활성화합니다. 3개의 포크가 병렬로 실행되면 공유 접두사가 한 번 캐시되고 재사용되므로 독립 하위 에이전트에 비해 80% 이상의 토큰 비용이 절약됩니다.

### 재귀 포크 방지

포크 하위 항목은 추가 포크를 생성할 수 없습니다. 이는 런타임에 적용됩니다. 포크가 다른 포크를 생성하려고 하면 작업을 직접 실행하라는 오류가 수신됩니다.

### 현재 제한 사항

* **결과 피드백 없음**: 포크 결과는 UI 진행률 표시에 반영되지만 기본 대화에 자동으로 피드백되지는 않습니다. 상위 AI는 자리 표시자 메시지를 보고 포크의 출력에 대해 조치를 취할 수 없습니다.
* **작업 트리 격리 없음**: 포크는 상위 작업 디렉터리를 공유합니다. 여러 분기에서 동시에 파일을 수정하면 충돌이 발생할 수 있습니다.

## 주요 이점

* **업무 전문화**: 특정 워크플로우(테스트, 문서화, 리팩토링 등)에 최적화된 에이전트 생성
* **컨텍스트 격리**: 전문적인 업무를 주요 대화와 별도로 유지하세요.
* **컨텍스트 상속**: Fork 하위 에이전트는 컨텍스트가 많은 병렬 작업을 위해 전체 대화를 상속합니다.
* **신속한 캐시 공유**: 포크 하위 에이전트는 상위 캐시 접두사를 공유하여 토큰 비용을 줄입니다.
* **재사용성**: 프로젝트와 세션 전체에서 에이전트 구성을 저장하고 재사용합니다.
* **통제된 접근**: 각 에이전트가 보안 및 집중을 위해 사용할 수 있는 도구를 제한합니다.
* **진행 상황 가시성**: 실시간 진행 상황 업데이트로 에이전트 실행을 모니터링합니다.

## 하위 에이전트 작동 방식

1. **구성**: 동작, 도구 및 시스템 프롬프트를 정의하는 하위 에이전트 구성을 생성합니다.
2. **대표단**: 기본 AI는 작업을 적절한 하위 에이전트에 자동으로 위임하거나 특정 하위 에이전트 유형이 필요하지 않은 경우 암시적으로 분기할 수 있습니다.
3. **실행**: 하위 에이전트는 구성된 도구를 사용하여 독립적으로 작업하여 작업을 완료합니다.
4. **결과**: 결과 및 실행 요약을 기본 대화로 다시 반환합니다.

## 시작하기

### 빠른 시작

1. **첫 번째 하위 에이전트 만들기**:

   `/agents create`

   안내 마법사에 따라 전문 에이전트를 생성하세요.

2. **기존 에이전트 관리**:

   `/agents manage`

   구성된 하위 에이전트를 보고 관리합니다.

3. **자동으로 하위 에이전트 사용**: 메인 AI에게 서브에이전트의 전문 분야에 맞는 작업을 수행하도록 요청하기만 하면 됩니다. AI는 자동으로 적절한 작업을 위임합니다.

### 사용 예

```
User: "Please write comprehensive tests for the authentication module"
AI: I'll delegate this to your testing specialist Subagents.
[Delegates to "testing-expert" Subagents]
[Shows real-time progress of test creation]
[Returns with completed test files and execution summary]`
```

## 관리

### CLI 명령

하위 에이전트는 다음을 통해 관리됩니다.`/agents`슬래시 명령 및 해당 하위 명령:

**용법:**：`/agents create`。단계 안내 마법사를 통해 새 하위 에이전트를 생성합니다.

**용법:**：`/agents manage`。기존 하위 에이전트를 보고 관리하기 위한 대화형 관리 대화 상자를 엽니다.

### 저장 위치

하위 에이전트는 여러 위치에 Markdown 파일로 저장됩니다.

* **프로젝트 수준**:`.qwen/agents/`(가장 높은 우선순위)
* **사용자 수준**:`~/.qwen/agents/`(대체)
* **확장 수준**: 설치된 확장 프로그램에서 제공

이를 통해 프로젝트별 에이전트, 모든 프로젝트에서 작동하는 개인 에이전트, 특수 기능을 추가하는 확장 제공 에이전트를 보유할 수 있습니다.

### 확장 하위 에이전트

확장은 확장이 활성화되면 사용할 수 있는 사용자 정의 하위 에이전트를 제공할 수 있습니다. 이러한 에이전트는 확장 프로그램의`agents/`디렉토리이며 개인 및 프로젝트 에이전트와 동일한 형식을 따릅니다.

확장 하위 에이전트:

* 확장이 활성화되면 자동으로 검색됩니다.
* 에 표시`/agents manage`"확장 에이전트" 섹션 아래의 대화 상자
* 직접 편집할 수 없습니다. (대신 확장 소스를 편집하세요.)
* 사용자 정의 에이전트와 동일한 구성 형식을 따릅니다.

하위 에이전트를 제공하는 확장을 보려면 확장의`qwen-extension.json`파일을`agents`필드.

### 파일 형식

하위 에이전트는 YAML 프런트매터가 포함된 Markdown 파일을 사용하여 구성됩니다. 이 형식은 사람이 읽을 수 있고 어떤 텍스트 편집기로도 쉽게 편집할 수 있습니다.

#### 기본 구조

```
---
name: agent-name
description: Brief description of when and how to use this agent
model: inherit # 선택: inherit or model-id
approvalMode: auto-edit # 선택: default, plan, auto-edit, yolo
tools:         # 선택: allowlist of tools
  - tool1
  - tool2
disallowedTools: # 선택: blocklist of tools
  - tool3
---

System prompt content goes here.
Multiple paragraphs are supported.
```

#### 모델 선택

선택사항을 사용하세요`model`하위 에이전트가 사용하는 모델을 제어하는 ​​머리말 필드:

* `inherit`: 기본 대화와 동일한 모델을 사용합니다.
* 필드 생략: 다음과 동일`inherit`
* `glm-5`: 기본 대화의 인증 유형과 함께 해당 모델 ID를 사용합니다.
* `openai:gpt-4o`: 다른 공급자 사용(env vars의 자격 증명 확인)

#### 권한 모드

선택사항을 사용하세요`approvalMode`하위 에이전트의 도구 호출이 승인되는 방식을 제어하는 ​​머리말 필드입니다. 유효한 값:

* `default`: 도구에는 대화형 승인이 필요합니다(메인 세션 기본값과 동일).
* `plan`: 분석 전용 모드 - 에이전트가 변경을 계획하지만 실행하지는 않습니다.
* `auto-edit`: 도구는 메시지 없이 자동 승인됩니다(대부분의 상담원에게 권장).
* `yolo`: 잠재적으로 파괴적인 도구를 포함하여 모든 도구가 자동 승인됩니다.

이 필드를 생략하면 하위 에이전트의 권한 모드가 자동으로 결정됩니다.

* 상위 세션이 있는 경우**욜로**또는**자동 편집**모드인 경우 하위 에이전트는 해당 모드를 상속합니다. 허용적인 부모는 허용적인 태도를 유지합니다.
* 상위 세션이 있는 경우**계획**모드에서는 하위 에이전트가 계획 모드를 유지합니다. 분석 전용 세션에서는 위임된 에이전트를 통해 파일을 변경할 수 없습니다.
* 상위 세션이 있는 경우**기본**모드(신뢰할 수 있는 폴더)에서 하위 에이전트는**자동 편집**그래서 자율적으로 일할 수 있어요.

설정을 하면`approvalMode`, 상위의 허용 모드가 여전히 우선순위를 갖습니다. 예를 들어 상위 에이전트가 Yolo 모드인 경우 하위 에이전트는`approvalMode: plan`여전히 욜로 모드로 실행됩니다.

```
---
name: cautious-reviewer
description: Reviews code without making changes
approvalMode: plan
tools:
  - read_file
  - grep_search
  - glob
---

You are a code reviewer. Analyze the code and report findings.
Do not modify any files.
```

#### 도구 구성

사용`tools`그리고`disallowedTools`하위 에이전트가 액세스할 수 있는 도구를 제어합니다.

**`tools`(허용 목록):**지정된 경우 하위 에이전트는 나열된 도구만 ​​사용할 수 있습니다. 생략하면 하위 에이전트는 상위 세션에서 사용 가능한 모든 도구를 상속합니다.

```
---
name: reader
description: Read-only agent for code exploration
tools:
  - read_file
  - grep_search
  - glob
  - list_directory
---
```

**`disallowedTools`(차단 목록):**지정되면 나열된 도구가 하위 에이전트의 도구 풀에서 제거됩니다. 이는 허용된 모든 도구를 나열하지 않고 "X를 제외한 모든 것"을 원할 때 유용합니다.

```
---
name: safe-worker
description: Agent that cannot modify files
disallowedTools:
  - write_file
  - edit
  - run_shell_command
---
```

둘 다라면`tools`그리고`disallowedTools`설정되면 허용 목록이 먼저 적용된 다음 차단 목록이 해당 집합에서 제거됩니다.

**MCP 도구**동일한 규칙을 따르십시오. 하위 에이전트가 없는 경우`tools`목록에서는 상위 세션의 모든 MCP 도구를 상속합니다. 하위 에이전트에 명시적인 권한이 있는 경우`tools`목록에 있는 경우 해당 목록에 명시적으로 이름이 지정된 MCP 도구만 가져옵니다.

그만큼`disallowedTools`필드는 MCP 서버 수준 패턴을 지원합니다.

* `mcp__server__tool_name`— 특정 MCP 도구를 차단합니다.
* `mcp__server`— 해당 MCP 서버의 모든 도구를 차단합니다.

```
---
name: no-slack
description: Agent without Slack access
disallowedTools:
  - mcp__slack
---
```

#### 사용 예

```
---
name: project-documenter
description: Creates project documentation and README files
---

You are a documentation specialist.

Focus on creating clear, comprehensive documentation that helps both
new contributors and end users understand the project.
```

## 하위 에이전트의 효과적인 사용

### 자동 위임

Qwen Code는 다음을 기반으로 작업을 사전에 위임합니다.

* 요청에 포함된 작업 설명
* 하위 에이전트 구성의 설명 필드
* 현재 상황 및 사용 가능한 도구

보다 적극적인 하위 에이전트 사용을 장려하려면 설명 필드에 "선제적으로 사용" 또는 "반드시 사용해야 함"과 같은 문구를 포함하세요.

### 명시적 호출

명령에 언급하여 특정 하위 에이전트를 요청합니다.

```
Let the testing-expert Subagents create unit tests for the payment module
Have the documentation-writer Subagents update the API reference
Get the react-specialist Subagents to optimize this component's performance
```

## 예

### 개발 워크플로 에이전트

#### 테스트 전문가

포괄적인 테스트 생성 및 테스트 중심 개발에 적합합니다.

```
---
name: testing-expert
description: Writes comprehensive unit tests, integration tests, and handles test automation with best practices
tools:
  - read_file
  - write_file
  - read_many_files
  - run_shell_command
---

You are a testing specialist focused on creating high-quality, maintainable tests.

Your expertise includes:

- Unit testing with appropriate mocking and isolation
- Integration testing for component interactions
- Test-driven development practices
- Edge case identification and comprehensive coverage
- Performance and load testing when appropriate

For each testing task:

1. Analyze the code structure and dependencies
2. Identify key functionality, edge cases, and error conditions
3. Create comprehensive test suites with descriptive names
4. Include proper setup/teardown and meaningful assertions
5. Add comments explaining complex test scenarios
6. Ensure tests are maintainable and follow DRY principles

Always follow testing best practices for the detected language and framework.
Focus on both positive and negative test cases.
```

**사용 사례:**

* “인증 서비스를 위한 단위 테스트 작성”
* “결제 처리 워크플로에 대한 통합 테스트 만들기”
* “데이터 검증 모듈에 극단적인 경우에 대한 테스트 적용 범위를 추가하세요”

#### 문서 작성자

명확하고 포괄적인 문서 작성을 전문으로 합니다.

```
---
name: documentation-writer
description: Creates comprehensive documentation, README files, API docs, and user guides
tools:
  - read_file
  - write_file
  - read_many_files
---

You are a technical documentation specialist.

Your role is to create clear, comprehensive documentation that serves both
developers and end users. Focus on:

**For API 문서:**

- Clear endpoint descriptions with examples
- Parameter details with types and constraints
- Response format documentation
- Error code explanations
- Authentication requirements

**For User 문서:**

- Step-by-step instructions with screenshots when helpful
- Installation and setup guides
- 설정 options and examples
- Troubleshooting sections for common issues
- FAQ sections based on common user questions

**For Developer 문서:**

- Architecture overviews and design decisions
- Code examples that actually work
- Contributing guidelines
- Development environment setup

Always verify code examples and ensure documentation stays current with
the actual implementation. Use clear headings, bullet points, and examples.
```

**사용 사례:**

* “사용자 관리 엔드포인트에 대한 API 문서 생성”
* “이 프로젝트에 대한 포괄적인 README를 작성하세요”
* “문제 해결 단계를 포함하여 배포 프로세스를 문서화하세요”

#### 코드 검토자

코드 품질, 보안 및 모범 사례에 중점을 둡니다.

```
---
name: code-reviewer
description: Reviews code for best practices, security issues, performance, and maintainability
tools:
  - read_file
  - read_many_files
---

You are an experienced code reviewer focused on quality, security, and maintainability.

Review criteria:

- **Code Structure**: Organization, modularity, and separation of concerns
- **Performance**: Algorithmic efficiency and resource usage
- **Security**: Vulnerability assessment and secure coding practices
- **Best Practices**: Language/framework-specific conventions
- **Error Handling**: Proper exception handling and edge case coverage
- **Readability**: Clear naming, comments, and code organization
- **Testing**: Test coverage and testability considerations

Provide constructive feedback with:

1. **Critical Issues**: Security vulnerabilities, major bugs
2. **Important Improvements**: Performance issues, design problems
3. **Minor Suggestions**: Style improvements, refactoring opportunities
4. **Positive Feedback**: Well-implemented patterns and good practices

Focus on actionable feedback with specific examples and suggested solutions.
Prioritize issues by impact and provide rationale for recommendations.
```

**사용 사례:**

* “보안 문제에 대한 인증 구현을 검토하세요”
* "이 데이터베이스 쿼리 로직이 성능에 미치는 영향을 확인하세요."
* “코드 구조를 평가하고 개선 사항을 제안하세요”

### 기술별 에이전트

#### 반응 전문가

React 개발, 후크 및 구성 요소 패턴에 최적화되었습니다.

```
---
name: react-specialist
description: Expert in React development, hooks, component patterns, and modern React best practices
tools:
  - read_file
  - write_file
  - read_many_files
  - run_shell_command
---

You are a React specialist with deep expertise in modern React development.

Your expertise covers:

- **Component Design**: Functional components, custom hooks, composition patterns
- **State Management**: useState, useReducer, Context API, and external libraries
- **Performance**: React.memo, useMemo, useCallback, code splitting
- **Testing**: React Testing Library, Jest, component testing strategies
- **TypeScript Integration**: Proper typing for props, hooks, and components
- **Modern Patterns**: Suspense, Error Boundaries, Concurrent Features

For React tasks:

1. Use functional components and hooks by default
2. Implement proper TypeScript typing
3. Follow React best practices and conventions
4. Consider performance implications
5. Include appropriate error handling
6. Write testable, maintainable code

Always stay current with React best practices and avoid deprecated patterns.
Focus on accessibility and user experience considerations.
```

**사용 사례:**

* “정렬 및 필터링을 통해 재사용 가능한 데이터 테이블 구성 요소 만들기”
* “캐싱을 통해 API 데이터를 가져오기 위한 사용자 정의 후크 구현”
* “최신 React 패턴을 사용하도록 이 클래스 구성 요소를 리팩터링”

#### 파이썬 전문가

Python 개발, 프레임워크 및 모범 사례를 전문으로 합니다.

```
---
name: python-expert
description: Expert in Python development, frameworks, testing, and Python-specific best practices
tools:
  - read_file
  - write_file
  - read_many_files
  - run_shell_command
---

You are a Python expert with deep knowledge of the Python ecosystem.

Your expertise includes:

- **Core Python**: Pythonic patterns, data structures, algorithms
- **Frameworks**: Django, Flask, FastAPI, SQLAlchemy
- **Testing**: pytest, unittest, mocking, test-driven development
- **Data Science**: pandas, numpy, matplotlib, jupyter notebooks
- **Async Programming**: asyncio, async/await patterns
- **Package Management**: pip, poetry, virtual environments
- **Code Quality**: PEP 8, type hints, linting with pylint/flake8

For Python tasks:

1. Follow PEP 8 style guidelines
2. Use type hints for better code documentation
3. Implement proper error handling with specific exceptions
4. Write comprehensive docstrings
5. Consider performance and memory usage
6. Include appropriate logging
7. Write testable, modular code

Focus on writing clean, maintainable Python code that follows community standards.
```

**사용 사례:**

* “JWT 토큰으로 사용자 인증을 위한 FastAPI 서비스 만들기”
* “Pandas 및 오류 처리를 통해 데이터 처리 파이프라인 구현”
* “포괄적인 도움말 문서와 함께 argparse를 사용하여 CLI 도구 작성”

## 모범 사례

### 디자인 원칙

#### 단일 책임 원칙

각 하위 에이전트에는 명확하고 집중된 목적이 있어야 합니다.

**✅ 좋음:**

```
---
name: testing-expert
description: Writes comprehensive unit tests and integration tests
---
```

**❌ 피해야 할 것:**

```
---
name: general-helper
description: Helps with testing, documentation, code review, and deployment
---
```

**왜:**집중된 에이전트는 더 나은 결과를 생성하고 유지 관리가 더 쉽습니다.

#### 명확한 전문화

광범위한 역량보다는 구체적인 전문 분야를 정의하세요.

**✅ 좋음:**

```
---
name: react-performance-optimizer
description: Optimizes React applications for performance using profiling and best practices
---
```

**❌ 피해야 할 것:**

```
---
name: frontend-developer
description: Works on frontend development tasks
---
```

**왜:**특정 전문지식은 보다 목표적이고 효과적인 지원으로 이어집니다.

#### 실행 가능한 설명

에이전트를 언제 사용해야 하는지 명확하게 나타내는 설명을 작성하세요.

**✅ 좋음:**

```
description: Reviews code for security vulnerabilities, performance issues, and maintainability concerns
```

**❌ 피해야 할 것:**

```
description: A helpful code reviewer
```

**왜:**명확한 설명은 기본 AI가 각 작업에 적합한 에이전트를 선택하는 데 도움이 됩니다.

### 구성 모범 사례

#### 시스템 프롬프트 지침

**전문 지식을 구체적으로 기술하십시오:**

```
You are a Python testing specialist with expertise in:

- pytest framework and fixtures
- Mock objects and dependency injection
- Test-driven development practices
- Performance testing with pytest-benchmark
```

**단계별 접근 방식을 포함합니다.**

```
For each testing task:

1. Analyze the code structure and dependencies
2. Identify key functionality and edge cases
3. Create comprehensive test suites with clear naming
4. Include setup/teardown and proper assertions
5. Add comments explaining complex test scenarios
```

**출력 표준 지정:**

```
Always follow these standards:

- Use descriptive test names that explain the scenario
- Include both positive and negative test cases
- Add docstrings for complex test functions
- Ensure tests are independent and can run in any order
```

## 보안 고려 사항

* **도구 제한**: 사용`tools`하위 에이전트가 액세스할 수 있는 도구를 제한하거나`disallowedTools`다른 모든 것을 상속하면서 특정 도구를 차단하려면
* **권한 모드**: 하위 에이전트는 기본적으로 상위 권한 모드를 상속합니다. 계획 모드 세션은 위임된 에이전트를 통해 자동 편집으로 에스컬레이션될 수 없습니다. 신뢰할 수 없는 폴더에서는 권한 있는 모드(자동 편집, 욜로)가 차단됩니다.
* **샌드박싱**: 모든 도구 실행은 직접 도구 사용과 동일한 보안 모델을 따릅니다.
* **감사 추적**: 모든 하위 에이전트 작업이 실시간으로 기록되고 표시됩니다.
* **접근 제어**: 프로젝트와 사용자 수준 분리로 적절한 경계 제공
* **민감한 정보**: 에이전트 구성에 비밀이나 자격 증명을 포함하지 마세요.
* **생산 환경**: 프로덕션 환경과 개발 환경을 위한 별도의 에이전트 고려

## 제한

하위 에이전트 구성에는 다음과 같은 소프트 경고가 적용됩니다(하드 제한은 적용되지 않음).

* **설명 필드**: 설명이 1,000자를 초과하면 경고가 표시됩니다.
* **시스템 프롬프트**: 시스템 프롬프트가 10,000자를 초과하면 경고가 표시됩니다.
