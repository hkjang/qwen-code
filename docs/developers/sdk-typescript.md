# 타입스크립트 SDK

## @qwen-코드/sdk

Qwen Code에 프로그래밍 방식으로 액세스하기 위한 최소 실험용 TypeScript SDK입니다.

기능 요청/문제/홍보를 자유롭게 제출해 주세요.

## 설치

```bash
npm install @qwen-code/sdk
```

## 요구사항

* Node.js >= 20.0.0
* [퀀 코드](https://github.com/QwenLM/qwen-code)>= 0.4.0(안정적)이 설치되어 PATH에 액세스 가능

> **nvm 사용자를 위한 참고 사항**: nvm을 사용하여 Node.js 버전을 관리하는 경우 SDK가 Qwen Code 실행 파일을 자동 감지하지 못할 수 있습니다. 명시적으로 설정해야 합니다.`pathToQwenExecutable`전체 경로에 대한 옵션`qwen`바이너리.

## 빠른 시작

```typescript
import { query } from '@qwen-code/sdk';

// Single-turn query
const result = query({
  prompt: 'What files are in the current directory?',
  options: {
    cwd: '/path/to/project',
  },
});

// Iterate over messages
for await (const message of result) {
  if (message.type === 'assistant') {
    console.log('Assistant:', message.message.content);
  } else if (message.type === 'result') {
    console.log('Result:', message.result);
  }
}
```

## API 참조

### `query(config)`

Qwen 코드를 사용하여 새 쿼리 세션을 만듭니다.

#### 매개변수

* `prompt`:`string | AsyncIterable<SDKUserMessage>`- 보내라는 메시지입니다. 단일 턴 쿼리에는 문자열을 사용하고 다중 턴 대화에는 비동기 반복 가능을 사용하십시오.
* `options`:`QueryOptions`- 쿼리 세션에 대한 구성 옵션입니다.

#### 쿼리 옵션

| 옵션                       | 유형                                             | 기본              | 설명                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ---------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cwd`                    | `string`                                       | `process.cwd()` | 쿼리 세션의 작업 디렉터리입니다. 파일 작업 및 명령이 실행되는 컨텍스트를 결정합니다.                                                                                                                                                                                                                                                                                                                                             |
| `model`                  | `string`                                       | -               | 사용할 AI 모델(예:`'qwen-max'`,`'qwen-plus'`,`'qwen-turbo'`). 다음보다 우선합니다.`OPENAI_MODEL`그리고`QWEN_MODEL`환경 변수.                                                                                                                                                                                                                                                                                       |
| `pathToQwenExecutable`   | `string`                                       | 자동 감지           | Qwen Code 실행 파일의 경로입니다. 다양한 형식을 지원합니다:`'qwen'`(PATH의 기본 바이너리),`'/path/to/qwen'`(명시적 경로),`'/path/to/cli.js'`(Node.js 번들),`'node:/path/to/cli.js'`(Node.js 런타임 강제),`'bun:/path/to/cli.js'`(강제 Bun 런타임). 제공되지 않은 경우 다음에서 자동 감지됩니다.`QWEN_CODE_CLI_PATH`환경은,`~/.volta/bin/qwen`,`~/.npm-global/bin/qwen`,`/usr/local/bin/qwen`,`~/.local/bin/qwen`,`~/node_modules/.bin/qwen`,`~/.yarn/bin/qwen`. |
| `permissionMode`         | `'default' \| 'plan' \| 'auto-edit' \| 'yolo'` | `'default'`     | 도구 실행 승인을 제어하는 ​​권한 모드입니다. 보다[권한 모드](#permission-modes)자세한 내용은.                                                                                                                                                                                                                                                                                                                              |
| `canUseTool`             | `CanUseTool`                                   | -               | Custom permission handler for tool execution approval. Invoked when a tool requires confirmation. Must respond within 60 seconds or the request will be auto-denied. See [사용자 정의 권한 처리기](#custom-permission-handler).                                                                                                                                                                        |
| `env`                    | `Record<string, string>`                       | -               | Qwen Code 프로세스에 전달할 환경 변수입니다. 현재 프로세스 환경과 병합됩니다.                                                                                                                                                                                                                                                                                                                                             |
| `systemPrompt`           | `string \| QuerySystemPromptPreset`            | -               | 메인 세션에 대한 시스템 프롬프트 구성입니다. 문자열을 사용하여 내장된 Qwen Code 시스템 프롬프트를 완전히 재정의하거나 사전 설정된 개체를 사용하여 내장 프롬프트를 유지하고 추가 지침을 추가합니다.                                                                                                                                                                                                                                                                           |
| `mcpServers`             | `Record<string, McpServerConfig>`              | -               | 연결할 MCP(모델 컨텍스트 프로토콜) 서버입니다. 외부 서버(stdio/SSE/HTTP) 및 SDK 내장 서버를 지원합니다. 외부 서버는 다음과 같은 전송 옵션으로 구성됩니다.`command`,`args`,`url`,`httpUrl`등 SDK 서버 사용`{ type: 'sdk', name: string, instance: Server }`.                                                                                                                                                                                             |
| `abortController`        | `AbortController`                              | -               | 쿼리 세션을 취소하는 컨트롤러입니다. 부르다`abortController.abort()`세션을 종료하고 리소스를 정리합니다.                                                                                                                                                                                                                                                                                                                        |
| `debug`                  | `boolean`                                      | `false`         | CLI 프로세스에서 자세한 로깅을 위한 디버그 모드를 활성화합니다.                                                                                                                                                                                                                                                                                                                                                        |
| `maxSessionTurns`        | `number`                                       | `-1`(제한 없는)     | 세션이 자동으로 종료되기 전까지의 최대 대화 차례 수입니다. 차례는 사용자 메시지와 보조자 응답으로 구성됩니다.                                                                                                                                                                                                                                                                                                                               |
| `coreTools`              | `string[]`                                     | -               | 동등하다`tool.core`settings.json에 있습니다. 지정된 경우 AI는 이러한 도구만 사용할 수 있습니다. 예:`['read_file', 'write_file', 'run_terminal_cmd']`.                                                                                                                                                                                                                                                                      |
| `excludeTools`           | `string[]`                                     | -               | 동등하다`tool.exclude`settings.json에 있습니다. 제외된 도구는 즉시 권한 오류를 반환합니다. 다른 모든 권한 설정보다 우선순위가 가장 높습니다. 패턴 일치 지원: 도구 이름(`'write_file'`), 도구 클래스(`'ShellTool'`) 또는 쉘 명령 접두사(`'ShellTool(rm )'`).                                                                                                                                                                                                         |
| `allowedTools`           | `string[]`                                     | -               | 동등하다`tool.allowed`settings.json에 있습니다. 매칭 도구 바이패스`canUseTool`콜백하고 자동으로 실행합니다. 도구 확인이 필요한 경우에만 적용됩니다. 와 동일한 패턴 매칭을 지원합니다.`excludeTools`.                                                                                                                                                                                                                                                      |
| `authType`               | `'openai' \| 'qwen-oauth'`                     | `'openai'`      | AI 서비스에 대한 인증 유형입니다. 사용`'qwen-oauth'`자격 증명이 SDK에 저장되므로 SDK에서는 권장되지 않습니다.`~/.qwen`정기적인 새로 고침이 필요할 수 있습니다.                                                                                                                                                                                                                                                                                     |
| `agents`                 | `SubagentConfig[]`                             | -               | 세션 중에 호출할 수 있는 하위 에이전트에 대한 구성입니다. 하위 에이전트는 특정 작업이나 도메인을 위한 전문 AI 에이전트입니다.                                                                                                                                                                                                                                                                                                                    |
| `includePartialMessages` | `boolean`                                      | `false`         | 언제`true`, SDK는 생성되는 동안 불완전한 메시지를 내보내 AI 응답의 실시간 스트리밍을 허용합니다.                                                                                                                                                                                                                                                                                                                                 |

### 시간 초과

SDK는 다음과 같은 기본 시간 제한을 적용합니다.

| 시간 초과            | 기본 | 설명                                                                                                                  |
| ---------------- | -- | ------------------------------------------------------------------------------------------------------------------- |
| `canUseTool`     | 1분 | 최대 시간`canUseTool`응답을 위한 콜백. 초과하면 도구 요청이 자동으로 거부됩니다.                                                                 |
| `mcpRequest`     | 1분 | SDK MCP 도구 호출이 완료되는 최대 시간입니다.                                                                                       |
| `controlRequest` | 1분 | 다음과 같은 제어 작업을 위한 최대 시간`initialize()`,`setModel()`,`setPermissionMode()`,`getContextUsage()`, 그리고`interrupt()`완료합니다. |
| `streamClose`    | 1분 | SDK MCP 서버를 사용하여 다중 턴 모드에서 CLI stdin을 닫기 전에 초기화가 완료될 때까지 기다리는 최대 시간입니다.                                             |

다음을 통해 이러한 시간 초과를 사용자 정의할 수 있습니다.`timeout`옵션:

```typescript
const query = qwen.query('Your prompt', {
  timeout: {
    canUseTool: 60000, // 60 seconds for permission callback
    mcpRequest: 600000, // 10 minutes for MCP tool calls
    controlRequest: 60000, // 60 seconds for control requests
    streamClose: 15000, // 15 seconds for stream close wait
  },
});
```

### 메시지 유형

SDK는 다양한 메시지 유형을 식별하기 위해 유형 가드를 제공합니다.

```typescript
import {
  isSDKUserMessage,
  isSDKAssistantMessage,
  isSDKSystemMessage,
  isSDKResultMessage,
  isSDKPartialAssistantMessage,
} from '@qwen-code/sdk';

for await (const message of result) {
  if (isSDKAssistantMessage(message)) {
    // Handle assistant message
  } else if (isSDKResultMessage(message)) {
    // Handle result message
  }
}
```

### 쿼리 인스턴스 방법

그만큼`Query`다음이 반환한 인스턴스`query()`여러 가지 방법을 제공합니다:

```typescript
const q = query({ prompt: 'Hello', options: {} });

// Get session ID
const sessionId = q.getSessionId();

// Check if closed
const closed = q.isClosed();

// Interrupt the current operation
await q.interrupt();

// Change permission mode mid-session
await q.setPermissionMode('yolo');

// Change model mid-session
await q.setModel('qwen-max');

// Get context window usage breakdown (token counts per category)
const usage = await q.getContextUsage();
// Pass true to hint that per-item details should be displayed
const detail = await q.getContextUsage(true);

// Close the session
await q.close();
```

## 권한 모드

SDK는 도구 실행 제어를 위한 다양한 권한 모드를 지원합니다.

* **`default`**: 쓰기 도구는 다음을 통해 승인되지 않으면 거부됩니다.`canUseTool`콜백 또는`allowedTools`. 읽기 전용 도구는 확인 없이 실행됩니다.
* **`plan`**: 모든 쓰기 도구를 차단하고 AI가 먼저 계획을 제시하도록 지시합니다.
* **`auto-edit`**: 편집 도구(edit, write\_file)는 자동 승인되지만 다른 도구는 확인이 필요합니다.
* **`yolo`**: 모든 도구는 확인 없이 자동으로 실행됩니다.

### 권한 우선순위 체인

1. `excludeTools`- 도구를 완전히 차단합니다.
2. `permissionMode: 'plan'`- 읽기 전용이 아닌 도구를 차단합니다.
3. `permissionMode: 'yolo'`- 모든 도구 자동 승인
4. `allowedTools`- 매칭 도구 자동 승인
5. `canUseTool`콜백 - 맞춤 승인 로직
6. 기본 동작 - SDK 모드에서 자동 거부

## 예

### 다단계 대화

```typescript
import { query, type SDKUserMessage } from '@qwen-code/sdk';

async function* generateMessages(): AsyncIterable<SDKUserMessage> {
  yield {
    type: 'user',
    session_id: 'my-session',
    message: { role: 'user', content: 'Create a hello.txt file' },
    parent_tool_use_id: null,
  };

  // Wait for some condition or user input
  yield {
    type: 'user',
    session_id: 'my-session',
    message: { role: 'user', content: 'Now read the file back' },
    parent_tool_use_id: null,
  };
}

const result = query({
  prompt: generateMessages(),
  options: {
    permissionMode: 'auto-edit',
  },
});

for await (const message of result) {
  console.log(message);
}
```

### 사용자 정의 권한 처리기

```typescript
import { query, type CanUseTool } from '@qwen-code/sdk';

const canUseTool: CanUseTool = async (toolName, input, { signal }) => {
  // Allow all read operations
  if (toolName.startsWith('read_')) {
    return { behavior: 'allow', updatedInput: input };
  }

  // Prompt user for write operations (in a real app)
  const userApproved = await promptUser(`Allow ${toolName}?`);

  if (userApproved) {
    return { behavior: 'allow', updatedInput: input };
  }

  return { behavior: 'deny', message: 'User denied the operation' };
};

const result = query({
  prompt: 'Create a new file',
  options: {
    canUseTool,
  },
});
```

### 외부 MCP 서버 사용

```typescript
import { query } from '@qwen-code/sdk';

const result = query({
  prompt: 'Use the custom tool from my MCP server',
  options: {
    mcpServers: {
      'my-server': {
        command: 'node',
        args: ['path/to/mcp-server.js'],
        env: { PORT: '3000' },
      },
    },
  },
});
```

### 시스템 프롬프트 무시

```typescript
import { query } from '@qwen-code/sdk';

const result = query({
  prompt: 'Say hello in one sentence.',
  options: {
    systemPrompt: 'You are a terse assistant. Answer in exactly one sentence.',
  },
});
```

### 내장 시스템 프롬프트에 추가

```typescript
import { query } from '@qwen-code/sdk';

const result = query({
  prompt: 'Review the current directory.',
  options: {
    systemPrompt: {
      type: 'preset',
      preset: 'qwen_code',
      append: 'Be terse and focus on concrete findings.',
    },
  },
});
```

### SDK 내장 MCP 서버 사용

SDK는 다음을 제공합니다.`tool`그리고`createSdkMcpServer`SDK 애플리케이션과 동일한 프로세스에서 실행되는 MCP 서버를 생성합니다. 이는 별도의 서버 프로세스를 실행하지 않고 AI에 사용자 정의 도구를 노출하려는 경우에 유용합니다.

#### `tool(name, description, inputSchema, handler)`

Zod 스키마 유형 추론을 사용하여 도구 정의를 만듭니다.

| 매개변수          | 유형                                 | 설명                               |
| ------------- | ---------------------------------- | -------------------------------- |
| `name`        | `string`                           | 도구 이름(1-64자, 문자, 영숫자 및 밑줄로 시작)   |
| `description` | `string`                           | 도구의 기능에 대한 사람이 읽을 수 있는 설명        |
| `inputSchema` | `ZodRawShape`                      | 도구의 입력 매개변수를 정의하는 Zod 스키마 객체     |
| `handler`     | `(args, extra) => Promise<Result>` | 도구를 실행하고 MCP 콘텐츠 블록을 반환하는 비동기 함수 |

핸들러는 다음을 반환해야 합니다.`CallToolResult`다음 구조를 가진 객체:

```typescript
{
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: string }
    | { type: 'resource'; uri: string; mimeType?: string; text?: string }
  >;
  isError?: boolean;
}
```

#### `createSdkMcpServer(options)`

SDK 내장 MCP 서버 인스턴스를 생성합니다.

| 옵션        | 유형                       | 기본        | 설명                        |
| --------- | ------------------------ | --------- | ------------------------- |
| `name`    | `string`                 | 필수의       | MCP 서버의 고유 이름             |
| `version` | `string`                 | `'1.0.0'` | 서버 버전                     |
| `tools`   | `SdkMcpToolDefinition[]` | -         | 다음을 사용하여 만든 도구 배열`tool()` |

다음을 반환합니다.`McpSdkServerConfigWithInstance`직접 전달할 수 있는 객체`mcpServers`옵션.

#### 예

```typescript
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@qwen-code/sdk';

// Define a tool with Zod schema
const calculatorTool = tool(
  'calculate_sum',
  'Add two numbers',
  { a: z.number(), b: z.number() },
  async (args) => ({
    content: [{ type: 'text', text: String(args.a + args.b) }],
  }),
);

// Create the MCP server
const server = createSdkMcpServer({
  name: 'calculator',
  tools: [calculatorTool],
});

// Use the server in a query
const result = query({
  prompt: 'What is 42 + 17?',
  options: {
    permissionMode: 'yolo',
    mcpServers: {
      calculator: server,
    },
  },
});

for await (const message of result) {
  console.log(message);
}
```

### 쿼리 중단

```typescript
import { query, isAbortError } from '@qwen-code/sdk';

const abortController = new AbortController();

const result = query({
  prompt: 'Long running task...',
  options: {
    abortController,
  },
});

// Abort after 5 seconds
setTimeout(() => abortController.abort(), 5000);

try {
  for await (const message of result) {
    console.log(message);
  }
} catch (error) {
  if (isAbortError(error)) {
    console.log('Query was aborted');
  } else {
    throw error;
  }
}
```

## 오류 처리

SDK는`AbortError`중단된 쿼리를 처리하기 위한 클래스:

```typescript
import { AbortError, isAbortError } from '@qwen-code/sdk';

try {
  // ... query operations
} catch (error) {
  if (isAbortError(error)) {
    // Handle abort
  } else {
    // Handle other errors
  }
}
```
