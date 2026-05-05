# Qwen 코드 확장 시작하기

이 가이드는 첫 번째 Qwen Code 확장을 만드는 과정을 안내합니다. 새로운 확장을 설정하고, MCP 서버를 통해 사용자 정의 도구를 추가하고, 사용자 정의 명령을 생성하고, 모델에 컨텍스트를 제공하는 방법을 배우게 됩니다.`QWEN.md`파일.

## 전제조건

시작하기 전에 Qwen Code가 설치되어 있고 Node.js 및 TypeScript에 대한 기본적인 이해가 있는지 확인하세요.

## 1단계: 새 확장 만들기

시작하는 가장 쉬운 방법은 기본 제공 템플릿 중 하나를 사용하는 것입니다. 우리는`mcp-server`예를 들어 우리의 기초로 삼았습니다.

다음 명령을 실행하여라는 새 디렉터리를 만듭니다.`my-first-extension`템플릿 파일을 사용하여:

```bash
qwen extensions new my-first-extension mcp-server
```

그러면 다음 구조의 새 디렉터리가 생성됩니다.

```
my-first-extension/
├── example.ts
├── qwen-extension.json
├── package.json
└── tsconfig.json
```

## 2단계: 확장 파일 이해

새 확장의 주요 파일을 살펴보겠습니다.

### `qwen-extension.json`

이는 확장 프로그램의 매니페스트 파일입니다. Qwen Code에 확장 프로그램을 로드하고 사용하는 방법을 알려줍니다.

```json
{
  "name": "my-first-extension",
  "version": "1.0.0",
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["${extensionPath}${/}dist${/}example.js"],
      "cwd": "${extensionPath}"
    }
  }
}
```

* `name`: 확장 프로그램의 고유한 이름입니다.
* `version`: 확장 버전입니다.
* `mcpServers`: 이 섹션에서는 하나 이상의 MCP(Model Context Protocol) 서버를 정의합니다. MCP 서버는 모델이 사용할 새로운 도구를 추가하는 방법입니다.
  * `command`,`args`,`cwd`: 이 필드는 서버를 시작하는 방법을 지정합니다. 의 사용에 주목하세요.`${extensionPath}`Qwen Code는 확장 프로그램 설치 디렉터리의 절대 경로로 대체하는 변수입니다. 이렇게 하면 확장 프로그램이 설치된 위치에 관계없이 작동할 수 있습니다.

### `example.ts`

이 파일에는 MCP 서버의 소스 코드가 포함되어 있습니다. 이는 다음을 사용하는 간단한 Node.js 서버입니다.`@modelcontextprotocol/sdk`.

```typescript
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompt-server',
  version: '1.0.0',
});

// Registers a new tool named 'fetch_posts'
server.registerTool(
  'fetch_posts',
  {
    description: 'Fetches a list of posts from a public API.',
    inputSchema: z.object({}).shape,
  },
  async () => {
    const apiResponse = await fetch(
      'https://jsonplaceholder.typicode.com/posts',
    );
    const posts = await apiResponse.json();
    const response = { posts: posts.slice(0, 5) };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response),
        },
      ],
    };
  },
);

// ... (prompt registration omitted for brevity)

const transport = new StdioServerTransport();
await server.connect(transport);
```

이 서버는 다음과 같은 단일 도구를 정의합니다.`fetch_posts`공개 API에서 데이터를 가져오는 것입니다.

### `package.json`그리고`tsconfig.json`

TypeScript 프로젝트의 표준 구성 파일입니다. 그만큼`package.json`파일은 종속성을 정의하고`build`스크립트, 그리고`tsconfig.json`TypeScript 컴파일러를 구성합니다.

## 3단계: 확장 구축 및 연결

확장을 사용하려면 먼저 TypeScript 코드를 컴파일하고 로컬 개발을 위해 Qwen Code 설치에 확장을 연결해야 합니다.

1. **종속성을 설치합니다.**

   ```bash
   cd my-first-extension
   npm install
   ```

2. **서버를 구축하세요:**

   ```bash
   npm run build
   ```

   이것은 컴파일됩니다`example.ts`\~ 안으로`dist/example.js`은(는)`qwen-extension.json`.

3. **확장 프로그램을 연결합니다:**

   그만큼`link`명령은 Qwen Code 확장 디렉터리에서 개발 디렉터리로의 심볼릭 링크를 생성합니다. 즉, 모든 변경 사항은 다시 설치할 필요 없이 즉시 반영됩니다.

   ```bash
   qwen extensions link .
   ```

이제 Qwen Code 세션을 다시 시작하세요. 새로운`fetch_posts`도구를 사용할 수 있습니다. "게시물 가져오기"라고 요청하여 테스트할 수 있습니다.

## 4단계: 사용자 정의 명령 추가

사용자 정의 명령은 복잡한 프롬프트에 대한 바로가기를 생성하는 방법을 제공합니다. 코드에서 패턴을 검색하는 명령을 추가해 보겠습니다.

1. 만들기`commands`명령 그룹의 디렉터리 및 하위 디렉터리:

   ```bash
   mkdir -p commands/fs
   ```

2. 라는 이름의 파일을 생성합니다.`commands/fs/grep-code.md`:

   ```markdown
   ---
   description: Search for a pattern in code and summarize findings
   ---

   Please summarize the findings for the pattern `{{args}}`.

   Search Results:
   !{grep -r {{args}} .}
   ```

   이 명령은,`/fs:grep-code`, 인수를 받아 다음을 실행합니다.`grep`셸 명령을 사용하여 결과를 요약 프롬프트로 연결합니다.

> **메모:**명령은 선택적 YAML 머리말과 함께 Markdown 형식을 사용합니다. TOML 형식은 더 이상 사용되지 않지만 이전 버전과의 호환성을 위해 계속 지원됩니다.

파일을 저장한 후 Qwen Code를 다시 시작하세요. 이제 실행할 수 있습니다`/fs:grep-code "some pattern"`새 명령을 사용합니다.

## 5단계: 사용자 정의 기술 및 하위 에이전트 추가(선택 사항)

확장은 Qwen Code의 기능을 확장하기 위해 사용자 정의 기술과 하위 에이전트를 제공할 수도 있습니다.

### 사용자 정의 스킬 추가

기술은 AI가 관련될 때 자동으로 사용할 수 있는 모델 호출 기능입니다.

1. 만들기`skills`기술 하위 디렉터리가 있는 디렉터리:

   ```bash
   mkdir -p skills/code-analyzer
   ```

2. 만들기`skills/code-analyzer/SKILL.md`파일:

   ```markdown
   ---
   name: code-analyzer
   description: Analyzes code structure and provides insights about complexity, dependencies, and potential improvements
   ---

   # Code Analyzer

   ## Instructions

   When analyzing code, focus on:

   - Code complexity and maintainability
   - Dependencies and coupling
   - Potential performance issues
   - Suggestions for improvements

   ## Examples

   - "Analyze the complexity of this function"
   - "What are the dependencies of this module?"
   ```

### 사용자 정의 하위 에이전트 추가

하위 에이전트는 특정 작업을 위한 전문 AI 도우미입니다.

1. 만들기`agents`예배 규칙서:

   ```bash
   mkdir -p agents
   ```

2. 만들기`agents/refactoring-expert.md`파일:

   ```markdown
   ---
   name: refactoring-expert
   description: Specialized in code refactoring, improving code structure and maintainability
   tools:
     - read_file
     - write_file
     - read_many_files
   ---

   You are a refactoring specialist focused on improving code quality.

   Your expertise includes:

   - Identifying code smells and anti-patterns
   - Applying SOLID principles
   - Improving code readability and maintainability
   - Safe refactoring with minimal risk

   For each refactoring task:

   1. Analyze the current code structure
   2. Identify areas for improvement
   3. Propose refactoring steps
   4. Implement changes incrementally
   5. Verify functionality is preserved
   ```

Qwen Code를 다시 시작하면 다음을 통해 사용자 정의 기술을 사용할 수 있습니다.`/skills`및 하위 에이전트를 통해`/agents manage`.

## 6단계: 사용자 정의 추가`QWEN.md`

다음을 추가하여 모델에 지속적인 컨텍스트를 제공할 수 있습니다.`QWEN.md`확장명에 파일을 추가하세요. 이는 확장 도구에 대한 정보나 작동 방법에 대한 모델 지침을 제공하는 데 유용합니다. 명령과 프롬프트를 노출하기 위해 구축된 확장에 대해 항상 이것이 필요한 것은 아닙니다.

1. 라는 이름의 파일을 생성합니다.`QWEN.md`확장 디렉토리 루트에:

   ```markdown
   # My First Extension Instructions

   You are an expert developer assistant. When the user asks you to fetch posts, use the `fetch_posts` tool. Be concise in your responses.
   ```

2. 업데이트하세요`qwen-extension.json`CLI에 이 파일을 로드하라고 지시하려면:

   ```json
   {
     "name": "my-first-extension",
     "version": "1.0.0",
     "contextFileName": "QWEN.md",
     "mcpServers": {
       "nodeServer": {
         "command": "node",
         "args": ["${extensionPath}${/}dist${/}example.js"],
         "cwd": "${extensionPath}"
       }
     }
   }
   ```

CLI를 다시 시작하십시오. 이제 모델은 귀하의 컨텍스트를 갖게 됩니다.`QWEN.md`확장이 활성화된 모든 세션에 파일을 저장합니다.

## 7단계: 확장 기능 릴리스

확장 프로그램이 만족스러우면 다른 사람과 공유할 수 있습니다. 확장 기능을 릴리스하는 두 가지 주요 방법은 Git 저장소 또는 GitHub 릴리스를 통하는 것입니다. 공개 Git 저장소를 사용하는 것이 가장 간단한 방법입니다.

두 가지 방법에 대한 자세한 지침은 다음을 참조하세요.[확장 출시 가이드](extension-releasing.md).

## 결론

Qwen Code 확장 프로그램을 성공적으로 만들었습니다! 다음 방법을 배웠습니다.

* 템플릿에서 새 확장을 부트스트랩합니다.
* MCP 서버로 사용자 정의 도구를 추가합니다.
* 편리한 사용자 정의 명령을 만드세요.
* 사용자 정의 기술 및 하위 에이전트를 추가합니다.
* 모델에 지속적인 컨텍스트를 제공합니다.
* 로컬 개발을 위해 확장 프로그램을 연결하세요.

여기에서 더 많은 고급 기능을 탐색하고 Qwen Code에 강력한 새 기능을 구축할 수 있습니다.
