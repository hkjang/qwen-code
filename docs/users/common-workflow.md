# 일반적인 작업 흐름

> Qwen Code의 일반적인 작업 흐름에 대해 알아보세요.

이 문서의 각 작업에는 Qwen Code를 최대한 활용하는 데 도움이 되는 명확한 지침, 예제 명령 및 모범 사례가 포함되어 있습니다.

## 새로운 코드베이스 이해

### 빠른 코드베이스 개요 보기

방금 새 프로젝트에 참여했고 해당 프로젝트의 구조를 빠르게 이해해야 한다고 가정해 보겠습니다.

**1. 프로젝트 루트 디렉터리로 이동합니다.**

```bash
cd /path/to/project
```

**2. Qwen 코드 시작**

```bash
qwen
```

**3. 높은 수준의 개요를 요청하세요**

```
give me an overview of this codebase
```

**4. 특정 구성 요소에 대해 자세히 알아보기**

```
explain the main architecture patterns used here
```

```
what are the key data models?
```

```
how is authentication handled?
```

> \[!팁]
>
> * 광범위한 질문으로 시작한 다음 특정 영역으로 범위를 좁히세요.
> * 프로젝트에 사용된 코딩 규칙 및 패턴에 대해 문의하세요.
> * 프로젝트별 용어집 요청

### 관련 코드 찾기

특정 기능과 관련된 코드를 찾아야 한다고 가정해 보겠습니다.

**1. Qwen Code에 문의하여 관련 파일 찾기**

```
find the files that handle user authentication
```

**2. 구성 요소가 상호 작용하는 방식에 대한 컨텍스트 파악**

```
how do these authentication files work together?
```

**3. 실행 흐름 이해**

```
trace the login process from front-end to database
```

> \[!팁]
>
> * 찾고 있는 것이 무엇인지 구체적으로 설명하세요.
> * 프로젝트의 도메인 언어 사용

## 효율적으로 버그 수정

오류 메시지가 표시되어 해당 소스를 찾아 수정해야 한다고 가정해 보겠습니다.

**1. Qwen Code로 오류 공유**

```
I'm seeing an error when I run npm test
```

**2. 수정 권장사항 요청**

```
suggest a few ways to fix the @ts-ignore in user.ts
```

**3. 수정사항 적용**

```
update user.tsto add the null check you suggested
```

> \[!팁]
>
> * Qwen Code에게 문제를 재현하고 스택 추적을 가져오는 명령을 알려주세요.
> * 오류를 재현하는 단계를 언급하세요.
> * 오류가 간헐적이거나 일관된 경우 Qwen Code에 알리기

## 리팩토링 코드

최신 패턴과 방식을 사용하기 위해 기존 코드를 업데이트해야 한다고 가정해 보겠습니다.

**1. 리팩토링을 위한 레거시 코드 식별**

```
find deprecated API usage in our codebase
```

**2. 리팩토링 권장사항 받기**

```
suggest how to refactor utils.js to use modern JavaScript features
```

**3. 변경사항을 안전하게 적용하세요**

```
refactor utils.js to use ES 2024 features while maintaining the same behavior
```

**4. 리팩토링 확인**

```
run tests for the refactored code
```

> \[!팁]
>
> * Qwen Code에게 최신 접근 방식의 이점을 설명해달라고 요청하세요.
> * 필요한 경우 변경 사항이 이전 버전과의 호환성을 유지하도록 요청
> * 테스트 가능한 작은 단위로 리팩토링 수행

## Use specialized subagents

특정 작업을 보다 효과적으로 처리하기 위해 특수 AI 하위 에이전트를 사용한다고 가정해 보겠습니다.

**1. 사용 가능한 하위 에이전트 보기**

```
/agents
```

사용 가능한 모든 하위 에이전트가 표시되며 새 하위 에이전트를 생성할 수 있습니다.

**2. 자동으로 하위 에이전트 사용**

Qwen Code는 전문 하위 에이전트에 적절한 작업을 자동으로 위임합니다.

```
review my recent code changes for security issues
```

```
run all tests and fix any failures
```

**3. 특정 하위 에이전트를 명시적으로 요청**

```
use the code-reviewer subagent to check the auth module
```

```
have the debugger subagent investigate why users can't log in
```

**4. 워크플로에 대한 사용자 정의 하위 에이전트 만들기**

```
/agents
```

그런 다음 "만들기"를 선택하고 프롬프트에 따라 다음을 정의합니다.

* 하위 에이전트의 목적을 설명하는 고유 식별자(예:`code-reviewer`,`api-designer`).
* Qwen Code가 이 에이전트를 사용해야 하는 경우
* 액세스할 수 있는 도구
* 상담원의 역할과 행동을 설명하는 시스템 프롬프트

> \[!팁]
>
> * 프로젝트별 하위 에이전트 생성`.qwen/agents/`팀 공유를 위해
> * 설명을 사용하세요`description`자동 위임을 활성화하는 필드
> * Limit tool access to what each subagent actually needs
> * 자세히 알아보기[하위 에이전트](./features/sub-agents)
> * 자세히 알아보기[승인 모드](./features/approval-mode)

## 테스트 작업

발견되지 않은 코드에 대한 테스트를 추가해야 한다고 가정해 보겠습니다.

**1. 테스트되지 않은 코드 식별**

```
find functions in NotificationsService.swift that are not covered by tests
```

**2. 테스트 스캐폴딩 생성**

```
add tests for the notification service
```

**3. 의미 있는 테스트 케이스 추가**

```
add test cases for edge conditions in the notification service
```

**4. 테스트 실행 및 확인**

```
run the new tests and fix any failures
```

Qwen Code는 프로젝트의 기존 패턴과 규칙을 따르는 테스트를 생성할 수 있습니다. 테스트를 요청할 때 확인하려는 동작이 무엇인지 구체적으로 설명하세요. Qwen Code는 기존 테스트 파일을 검사하여 이미 사용 중인 스타일, 프레임워크 및 어설션 패턴과 일치하는지 확인합니다.

포괄적인 적용 범위를 얻으려면 Qwen Code에 문의하여 놓쳤을 수 있는 극단적인 사례를 식별하세요. Qwen Code는 코드 경로를 분석하고 간과하기 쉬운 오류 조건, 경계 값 및 예상치 못한 입력에 대한 테스트를 제안할 수 있습니다.

## 풀 요청 생성

변경 사항에 대해 잘 문서화된 끌어오기 요청을 생성해야 한다고 가정해 보겠습니다.

**1. 변경사항을 요약하세요.**

```
summarize the changes I've made to the authentication module
```

**2. Qwen Code로 풀 요청 생성**

```
create a pr
```

**3. 검토 및 개선**

```
enhance the PR description with more context about the security improvements
```

**4. 테스트 세부정보 추가**

```
add information about how these changes were tested
```

> \[!팁]
>
> * Qwen Code에게 직접 PR을 요청하세요.
> * 제출하기 전에 Qwen Code가 생성한 PR을 검토하세요.
> * Qwen Code에 질문하여 잠재적인 위험이나 고려 사항을 강조하세요.

## 문서 처리

코드에 대한 문서를 추가하거나 업데이트해야 한다고 가정해 보겠습니다.

**1. 문서화되지 않은 코드 식별**

```
find functions without proper JSDoc comments in the auth module
```

**2. 문서 생성**

```
add JSDoc comments to the undocumented functions in auth.js
```

**3. 검토 및 개선**

```
improve the generated documentation with more context and examples
```

**4. 문서 확인**

```
check if the documentation follows our project standards
```

> \[!팁]
>
> * 원하는 문서 스타일(JSDoc, Docstring 등)을 지정하세요.
> * 문서에서 예시를 요청하세요.
> * 공개 API, 인터페이스, 복잡한 로직에 대한 문서 요청

## 참조 파일 및 디렉터리

사용`@`Qwen Code가 파일이나 디렉터리를 읽을 때까지 기다리지 않고 파일이나 디렉터리를 빠르게 포함합니다.

**1. 단일 파일 참조**

```
Explain the logic in @src/utils/auth.js
```

여기에는 대화에 있는 파일의 전체 내용이 포함됩니다.

**2. 디렉토리 참조**

```
What's the structure of @src/components?
```

이는 파일 정보가 포함된 디렉토리 목록을 제공합니다.

**3. MCP 리소스 참조**

```
Show me the data from @github: repos/owner/repo/issues
```

@server:resource 형식을 사용하여 연결된 MCP 서버에서 데이터를 가져옵니다. 보다[MCP](./features/mcp)자세한 내용은.

> \[!팁]
>
> * 파일 경로는 상대 경로이거나 절대 경로일 수 있습니다.
> * @ 파일 참조 추가`QWEN.md`파일의 디렉토리와 상위 디렉토리에서 컨텍스트에 맞게
> * 디렉토리 참조는 내용이 아닌 파일 목록을 표시합니다.
> * 단일 메시지에서 여러 파일을 참조할 수 있습니다(예: '`@file 1.js`그리고`@file 2.js`")

## 이전 대화 재개

Qwen Code를 사용하여 작업을 진행 중이고 이후 세션에서 중단한 부분부터 계속해야 한다고 가정해 보겠습니다.

Qwen Code는 이전 대화를 재개하기 위한 두 가지 옵션을 제공합니다.

* `--continue`가장 최근 대화를 자동으로 계속하려면
* `--resume`대화 선택기를 표시하려면

**1. 가장 최근 대화를 계속하세요**

```bash
qwen --continue
```

그러면 프롬프트 없이 가장 최근 대화가 즉시 재개됩니다.

**2. 비대화형 모드에서 계속**

```bash
qwen --continue --p "Continue with my task"
```

사용`--print`\~와 함께`--continue`비대화형 모드에서 가장 최근 대화를 재개하기 위해 스크립트 또는 자동화에 적합합니다.

**3. 대화 선택기 표시**

```bash
qwen --resume
```

그러면 다음을 보여주는 깔끔한 목록 보기와 함께 대화형 대화 선택기가 표시됩니다.

* 세션 요약(또는 초기 프롬프트)
* 메타데이터: 경과 시간, 메시지 수, git 분기

화살표 키를 사용하여 탐색하고 Enter를 눌러 대화를 선택하세요. 종료하려면 Esc를 누르세요.

> \[!팁]
>
> * 대화 기록은 컴퓨터에 로컬로 저장됩니다.
> * 사용`--continue`가장 최근 대화에 빠르게 액세스하려면
> * 사용`--resume`특정 과거 대화를 선택해야 할 때
> * 재개하면 계속하기 전에 전체 대화 기록이 표시됩니다.
> * 재개된 대화는 원본과 동일한 모델 및 구성으로 시작됩니다.
>
> **작동 원리**:
>
> 1. **대화 저장**: 모든 대화는 전체 메시지 기록과 함께 자동으로 로컬에 저장됩니다.
> 2. **메시지 역직렬화**: 재개 시 전체 메시지 기록이 복원되어 컨텍스트를 유지합니다.
> 3. **도구 상태**: 이전 대화의 도구 사용 및 결과가 보존됩니다.
> 4. **컨텍스트 복원**: 이전의 모든 컨텍스트를 그대로 유지하면서 대화가 재개됩니다.
>
> **예**:
>
> ```bash
> # Continue most recent conversation
> qwen --continue
>
> # Continue most recent conversation with a specific prompt
> qwen --continue --p "Show me our progress"
>
> # Show conversation picker
> qwen --resume
>
> # Continue most recent conversation in non-interactive mode
> qwen --continue --p "Run the tests again"
> ```

## Git 작업 트리를 사용하여 병렬 Qwen Code 세션 실행

Qwen Code 인스턴스 간의 완전한 코드 격리를 통해 여러 작업을 동시에 작업해야 한다고 가정해 보겠습니다.

**1. Git 작업 트리 이해**

Git 작업 트리를 사용하면 동일한 저장소의 여러 분기를 별도의 디렉터리로 체크아웃할 수 있습니다. 각 작업 트리에는 격리된 파일이 포함된 자체 작업 디렉터리가 있으며 동일한 Git 기록을 공유합니다. 자세한 내용은 다음에서 확인하세요.[공식 Git 작업 트리 문서](https://git-scm.com/docs/git-worktree).

**2. 새 작업 트리 만들기**

```bash
# Create a new worktree with a new branch
git worktree add ../project-feature-a -b feature-a

# Or create a worktree with an existing branch
git worktree add ../project-bugfix bugfix-123
```

그러면 저장소의 별도 작업 복사본이 포함된 새 디렉터리가 생성됩니다.

**3. 각 작업트리에서 Qwen 코드 실행**

```bash
# Navigate to your worktree
cd ../project-feature-a

# Run Qwen Code in this isolated environment
qwen
```

**4. 다른 작업트리에서 Qwen Code 실행**

```bash
cd ../project-bugfix
qwen
```

**5. 작업 트리 관리**

```bash
# List all worktrees
git worktree list

# Remove a worktree when done
git worktree remove ../project-feature-a
```

> \[!팁]
>
> * 각 작업 트리에는 고유한 독립적인 파일 상태가 있어 병렬 Qwen Code 세션에 적합합니다.
> * 한 작업 트리의 변경 사항은 다른 작업 트리에 영향을 주지 않으므로 Qwen Code 인스턴스가 서로 간섭하는 것을 방지합니다.
> * 모든 작업 트리는 동일한 Git 기록과 원격 연결을 공유합니다.
> * 장기 실행 작업의 경우 Qwen Code가 한 작업 트리에서 작동하면서 다른 작업 트리에서 개발을 계속할 수 있습니다.
> * 설명이 포함된 디렉터리 이름을 사용하여 각 작업 트리의 작업을 쉽게 식별할 수 있습니다.
> * 프로젝트 설정에 따라 각각의 새 작업 트리에서 개발 환경을 초기화하는 것을 잊지 마세요. 스택에 따라 여기에는 다음이 포함될 수 있습니다.
>   * JavaScript 프로젝트: 종속성 설치 실행(`npm install`,`yarn`)
>   * Python 프로젝트: 가상 환경 설정 또는 패키지 관리자를 사용하여 설치
>   * 기타 언어: 프로젝트의 표준 설정 프로세스를 따릅니다.

## Qwen Code를 Unix 스타일 유틸리티로 사용

### 확인 프로세스에 Qwen 코드를 추가하세요.

Qwen Code를 린터 또는 코드 검토자로 사용한다고 가정해 보겠습니다.

**빌드 스크립트에 Qwen 코드를 추가합니다.**

```json
// package.json
{
    ...
    "scripts": {
        ...
        "lint:Qwen Code": "qwen -p 'you are a linter. please look at the changes vs. main and report any issues related to typos. report the filename and line number on one line, and a description of the issue on the second line. do not return any other text.'"
    }
}
```

> \[!팁]
>
> * CI/CD 파이프라인에서 자동화된 코드 검토를 위해 Qwen Code를 사용하세요.
> * 프로젝트와 관련된 특정 문제를 확인하기 위한 프롬프트를 사용자 정의하세요.
> * 다양한 유형의 확인을 위해 여러 스크립트를 만드는 것을 고려해보세요.

### 파이프 인, 파이프 아웃

데이터를 Qwen Code로 파이프하고 구조화된 형식으로 데이터를 가져오고 싶다고 가정해 보겠습니다.

**Qwen Code를 통해 데이터를 파이프합니다.**

```bash
cat build-error.txt | qwen -p 'concisely explain the root cause of this build error' > output.txt
```

> \[!팁]
>
> * 파이프를 사용하여 Qwen-Code를 기존 쉘 스크립트에 통합
> * 강력한 작업 흐름을 위해 다른 Unix 도구와 결합
> * 구조화된 출력에는 --output-format 사용을 고려하세요.

### 제어 출력 형식

특히 Qwen Code를 스크립트나 기타 도구에 통합할 때 특정 형식의 Qwen Code 출력이 필요하다고 가정해 보겠습니다.

**1. 텍스트 형식 사용(기본값)**

```bash
cat data.txt | qwen -p 'summarize this data' --output-format text > summary.txt
```

그러면 Qwen Code의 일반 텍스트 응답만 출력됩니다(기본 동작).

**2. JSON 형식을 사용하세요**

```bash
cat code.py | qwen -p 'analyze this code for bugs' --output-format json > analysis.json
```

그러면 비용 및 기간을 포함한 메타데이터가 포함된 메시지의 JSON 배열이 출력됩니다.

**3. 스트리밍 JSON 형식 사용**

```bash
cat log.txt | qwen -p 'parse this log file for errors' --output-format stream-json
```

Qwen Code가 요청을 처리하는 동안 일련의 JSON 개체가 실시간으로 출력됩니다. 각 메시지는 유효한 JSON 개체이지만, 연결된 경우 전체 출력은 유효한 JSON이 아닙니다.

> \[!팁]
>
> * 사용`--output-format text`Qwen Code의 응답만 필요한 간단한 통합의 경우
> * 사용`--output-format json`전체 대화 기록이 필요할 때
> * 사용`--output-format stream-json`각 대화 차례의 실시간 출력을 위해

## Qwen Code에게 그 기능에 대해 물어보세요

Qwen Code에는 문서에 대한 액세스가 내장되어 있으며 자체 기능 및 제한 사항에 대한 질문에 답할 수 있습니다.

### 예시 질문

```
can Qwen Code create pull requests?
```

```
how does Qwen Code handle permissions?
```

```
what slash commands are available?
```

```
how do I use MCP with Qwen Code?
```

```
how do I configure Qwen Code for Amazon Bedrock?
```

```
what are the limitations of Qwen Code?
```

> \[!메모]
>
> Qwen Code는 이러한 질문에 대한 문서 기반 답변을 제공합니다. 실행 가능한 예제와 실습 데모를 보려면 위의 특정 워크플로 섹션을 참조하세요.

> \[!팁]
>
> * Qwen Code는 사용 중인 버전에 관계없이 항상 최신 Qwen Code 문서에 액세스할 수 있습니다.
> * 자세한 답변을 얻으려면 구체적인 질문을 하세요.
> * Qwen Code는 MCP 통합, 엔터프라이즈 구성 및 고급 워크플로와 같은 복잡한 기능을 설명할 수 있습니다.
