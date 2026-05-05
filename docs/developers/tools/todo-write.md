# Todo 쓰기 도구(`todo_write`)

이 문서에서는`todo_write`Qwen Code용 도구입니다.

## 설명

사용`todo_write`현재 코딩 세션에 대한 구조화된 작업 목록을 만들고 관리합니다. 이 도구는 AI 보조자가 진행 상황을 추적하고 복잡한 작업을 구성하는 데 도움을 주어 수행 중인 작업에 대한 가시성을 제공합니다.

### 인수

`todo_write`하나의 인수를 사용합니다.

* `todos`(배열, 필수): 할 일 항목의 배열로, 각 항목에는 다음이 포함됩니다.
  * `content`(문자열, 필수): 작업에 대한 설명입니다.
  * `status`(문자열, 필수): 현재 상태(`pending`,`in_progress`, 또는`completed`).
  * `activeForm`(문자열, 필수): 수행 중인 작업을 설명하는 현재 연속형입니다(예: "테스트 실행", "프로젝트 빌드").

## 사용방법`todo_write`퀀코드와 함께

AI 도우미는 복잡한 다단계 작업을 수행할 때 자동으로 이 도구를 사용합니다. 명시적으로 요청할 필요는 없지만 요청에 대해 계획된 접근 방식을 보려면 어시스턴트에게 할 일 목록을 생성하도록 요청할 수 있습니다.

이 도구는 홈 디렉터리(`~/.qwen/todos/`)을 세션별 파일과 함께 사용하므로 각 코딩 세션은 자체 작업 목록을 유지합니다.

## AI가 이 도구를 사용할 때

어시스턴트가 사용하는`todo_write`을 위한:

* 여러 단계가 필요한 복잡한 작업
* 여러 구성요소를 사용한 기능 구현
* 여러 파일에 걸친 리팩토링 작업
* 3개 이상의 개별 작업이 포함된 모든 작업

도우미는 간단한 단일 단계 작업이나 순수 정보 요청에는 이 도구를 사용하지 않습니다.

### `todo_write`예

기능 구현 계획 수립:

```
todo_write(todos=[
  {
    "content": "Create user preferences model",
    "status": "pending",
    "activeForm": "Creating user preferences model"
  },
  {
    "content": "Add API endpoints for preferences",
    "status": "pending",
    "activeForm": "Adding API endpoints for preferences"
  },
  {
    "content": "Implement frontend components",
    "status": "pending",
    "activeForm": "Implementing frontend components"
  }
])
```

## 중요 사항

* **자동 사용법:**AI 도우미는 복잡한 작업 중에 할 일 목록을 자동으로 관리합니다.
* **진행 상황 가시성:**작업이 진행됨에 따라 실시간으로 업데이트된 할 일 목록을 확인할 수 있습니다.
* **세션 격리:**각 코딩 세션에는 다른 세션을 방해하지 않는 자체 할 일 목록이 있습니다.
