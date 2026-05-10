# 에이전트 도구 표시 구현 계획

> **클로드의 경우:**필수 하위 기술: 이 계획을 작업별로 구현하려면 초능력:실행 계획을 사용하세요.

**목표:**에이전트 도구 실행을 위한 전용 VSCode/웹 UI 디스플레이를 추가하여 하위 에이전트 진행 상황, 요약 및 실패가 구조화된 환경에서 렌더링되도록 합니다.`rawOutput`일반 도구 카드로 돌아가는 대신.

**건축학:**ACP 보존`rawOutput`VSCode 세션/업데이트 파이프라인을 통해`ToolCallData`그런 다음 공유 웹 UI 라우터가 감지하도록 합니다.`task_execution`페이로드 및 전용 렌더링`AgentToolCall`요소. 변경사항을 공유된 상태로 유지`packages/webui`그래서 VSCode와`ChatViewer`정렬을 유지하세요.

**기술 스택:**타입스크립트, 리액트, 비테스트, 공유`@qwen-code/webui`도구 호출 구성 요소.

### 작업 1: 실패한 데이터 흐름 동작 잠금

**파일:**

- 수정하다:`packages/vscode-ide-companion/src/services/qwenSessionUpdateHandler.test.ts`
- 만들다:`packages/vscode-ide-companion/src/webview/hooks/useToolCalls.test.tsx`

**1단계: 실패한 테스트 작성**

- 어설션하는 세션 핸들러 테스트 추가`tool_call_update`앞으로`rawOutput`ACP가 보낼 때`task_execution`유효 탑재량.
- 후크 테스트 어설션 추가`useToolCalls`매장 및 업데이트`rawOutput`에이전트 도구 통화의 경우

**2단계: 테스트를 실행하여 실패하는지 확인**

달리다:`npm test --workspace=packages/vscode-ide-companion -- --run qwenSessionUpdateHandler.test.ts useToolCalls.test.tsx`

예상: 실패 이유`rawOutput`현재 핸들러/후크 파이프라인에서는 유지되지 않습니다.

### 작업 2: 실패한 렌더러 동작 고정

**파일:**

- 만들다:`packages/vscode-ide-companion/src/webview/components/messages/toolcalls/index.test.tsx`

**1단계: 실패한 테스트 작성**

- 다음을 사용하여 라우팅된 도구 호출을 렌더링합니다.`kind: 'other'`...을 더한`rawOutput.type === 'task_execution'`.
- 일반 텍스트 출력 대신 전용 에이전트 디스플레이에서 작업 설명, 활성 하위 도구, 요약 및 실패 이유 렌더링을 주장합니다.

**2단계: 테스트를 실행하여 실패하는지 확인**

달리다:`npm test --workspace=packages/vscode-ide-companion -- --run packages/vscode-ide-companion/src/webview/components/messages/toolcalls/index.test.tsx`

예상됨: 라우터가 키를 끄기만 하기 때문에 실패합니다.`kind`전용 에이전트 구성요소가 존재하지 않습니다.

### 작업 3: 구조화된 에이전트 출력을 엔드투엔드 보존

**파일:**

- 수정하다:`packages/vscode-ide-companion/src/types/chatTypes.ts`
- 수정하다:`packages/vscode-ide-companion/src/services/qwenSessionUpdateHandler.ts`
- 수정하다:`packages/vscode-ide-companion/src/webview/hooks/useToolCalls.ts`
- 수정하다:`packages/webui/src/components/toolcalls/shared/types.ts`

**1단계: 최소한의 데이터 모델 변경 구현**

- 선택사항 추가`rawOutput`VSCode 세션/webview 도구 호출 유형에 적용됩니다.
- 앞으로`rawOutput`\~에`QwenSessionUpdateHandler`.
- 저장/병합`rawOutput`\~에`useToolCalls`.
- 폭로하다`rawOutput`공유 웹 UI 도구 호출 데이터 유형.

**2단계: 집중 테스트 실행**

달리다:`npm test --workspace=packages/vscode-ide-companion -- --run qwenSessionUpdateHandler.test.ts useToolCalls.test.tsx`

예상: 합격.

### 작업 4: 공유 에이전트 도구 호출 UI 추가

**파일:**

- 만들다:`packages/webui/src/components/toolcalls/AgentToolCall.tsx`
- 수정하다:`packages/webui/src/components/toolcalls/index.ts`
- 수정하다:`packages/vscode-ide-companion/src/webview/components/messages/toolcalls/index.tsx`
- 수정하다:`packages/webui/src/components/ChatViewer/ChatViewer.tsx`

**1단계: 최소 렌더러 구현**

- 다음에 대한 가드 추가`rawOutput.type === 'task_execution'`.
- 작업 설명을 헤더로 렌더링합니다.
- 에이전트 이름 + 상태, 현재 실행 중인 하위 도구, 완료 요약 및 실패/취소 이유를 표시합니다.
- 각 도구 호출을 독립적으로 렌더링하여 여러 병렬 에이전트 카드와 레이아웃의 호환성을 유지합니다.

**2단계: 집중된 렌더러 테스트 실행**

달리다:`npm test --workspace=packages/vscode-ide-companion -- --run packages/vscode-ide-companion/src/webview/components/messages/toolcalls/index.test.tsx`

예상: 합격.

### 작업 5: 통합된 표면 확인

**파일:**

- 수정하다:`packages/webui/src/index.ts`

**1단계: 필요한 경우 새 공유 구성 요소 내보내기**

- VSCode에 필요한 새 구성 요소/유형을 다시 내보내거나`ChatViewer`.

**2단계: 패키지 확인 실행**

달리다:`npm test --workspace=packages/vscode-ide-companion -- --run qwenSessionUpdateHandler.test.ts useToolCalls.test.tsx packages/vscode-ide-companion/src/webview/components/messages/toolcalls/index.test.tsx`달리다:`npm run check-types --workspace=packages/vscode-ide-companion`달리다:`npm run typecheck --workspace=packages/webui`

예상: 모든 대상 테스트 및 유형 검사가 통과되었습니다.
