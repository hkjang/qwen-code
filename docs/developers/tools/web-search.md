# 웹 검색

Qwen Code는 다음을 통해 웹 검색 기능을 지원합니다.**MCP(모델 컨텍스트 프로토콜)**통합. 내장된 검색 도구가 아닌 외부 MCP 서버에 연결하여 웹 검색이 제공되므로 필요에 가장 적합한 검색 서비스를 선택할 수 있는 완전한 유연성을 제공합니다.

## ⚠️ 획기적인 변화: 내장`web_search`도구가 제거되었습니다.

> **영향을 받는 버전:** `V0.0.7+`내장된 웹 검색 지원이 포함된 마지막 릴리스를 통해.

내장`web_search`도구 및 관련 구성이 모두 완료되었습니다.**제거됨**. 다음 중 하나를 사용하는 경우 이 문서에 설명된 MCP 기반 접근 방식으로 마이그레이션해야 합니다.

| 제거됨                                                                 | 해야 할 일                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `webSearch`막다`settings.json`                                        | MCP 서버 구성`mcpServers`대신 (아래 참조)                                                       |
| `advanced.tavilyApiKey`\~에`settings.json`                           | 사용[Tavily MCP 서버](#tavily-websearch)                                                  |
| `TAVILY_API_KEY`환경 변수                                               | 사용[Tavily MCP 서버](#tavily-websearch)                                                  |
| `DASHSCOPE_API_KEY`웹 검색용                                            | 사용[Alibaba Cloud Bailian WebSearch MCP](#alibaba-cloud-bailian-websearch-recommended) |
| `GLM_API_KEY`웹 검색용                                                  | 사용[GLM 웹서치 프라임 MCP](#glm-websearch-prime-zhipuai)                                     |
| `--tavily-api-key` / `--glm-api-key` / `--dashscope-api-key`CLI 플래그 | 다음을 통해 구성`mcpServers`\~에`settings.json`                                               |

### 마이그레이션 예

**이전(내장 도구를 통한 Tavily):**

```json
{
  "webSearch": {
    "provider": [{ "type": "tavily", "apiKey": "tvly-xxx" }],
    "default": "tavily"
  }
}
```

**이후(MCP를 통한 Tavily):**

```json
{
  "mcpServers": {
    "tavily": {
      "httpUrl": "https://mcp.tavily.com/mcp/?tavilyApiKey=tvly-xxx"
    }
  }
}
```

***

**이전(내장 도구를 통한 DashScope):**

```json
{
  "webSearch": {
    "provider": [{ "type": "dashscope", "apiKey": "sk-xxx" }],
    "default": "dashscope"
  }
}
```

**이후(MCP를 통한 Alibaba Cloud Bailian WebSearch):**

```json
{
  "mcpServers": {
    "WebSearch": {
      "httpUrl": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp",
      "headers": {
        "Authorization": "Bearer sk-xxx"
      }
    }
  }
}
```

***

## 지원되는 MCP 웹 검색 서비스

### Alibaba Cloud Bailian 웹 검색(권장)

DashScope가 지원하는 Alibaba Cloud Bailian 플랫폼에서 제공하는 공식 웹 검색 MCP 서비스입니다.

* **MCP 마켓플레이스:** <https://bailian.console.aliyun.com/cn-beijing?tab=mcp#/mcp-market/detail/WebSearch>
* **비용:**유료(Alibaba Cloud DashScope를 통해 청구)
* **API 키 받기:** <https://help.aliyun.com/zh/model-studio/get-api-key>
* **가장 적합한 대상:**중국어 쿼리, 중국어 웹 콘텐츠 액세스, Alibaba Cloud 생태계와의 통합

#### 설정

**방법 1: CLI 명령**

```bash
qwen mcp add WebSearch \
  -t http \
  "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp" \
  -H "Authorization: Bearer ${DASHSCOPE_API_KEY}"
```

**방법 2:`settings.json`**

```json
{
  "mcpServers": {
    "WebSearch": {
      "httpUrl": "https://dashscope.aliyuncs.com/api/v1/mcps/WebSearch/mcp",
      "headers": {
        "Authorization": "Bearer ${DASHSCOPE_API_KEY}"
      }
    }
  }
}
```

바꾸다`${DASHSCOPE_API_KEY}`실제 API 키를 사용하거나 Qwen Code가 자동으로 선택하도록 환경 변수로 설정하세요.

***

### 타빌리 웹서치

실시간 웹 검색, 추출, 매핑 및 크롤링 기능을 제공하는 프로덕션 지원 MCP 서버입니다.

* **저장소:** <https://github.com/tavily-ai/tavily-mcp>
* **비용:**유료(무료 등급 사용 가능)
* **API 키 받기:** <https://app.tavily.com/home>
* **가장 적합한 대상:**고품질 AI 생성 답변을 갖춘 범용 웹 검색

#### 사용 가능한 도구

* `tavily_search`— 실시간 웹 검색
* `tavily_extract`— 웹 페이지에서 지능형 데이터 추출
* `tavily_map`— 웹사이트의 구조화된 지도를 만듭니다.
* `tavily_crawl`— 체계적으로 웹사이트 탐색

#### 설정

**방법 1: CLI 명령(원격 MCP)**

```bash
qwen mcp add tavily \
  -t http \
  "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"
```

**방법 2:`settings.json`(원격 MCP)**

```json
{
  "mcpServers": {
    "tavily": {
      "httpUrl": "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"
    }
  }
}
```

바꾸다`${TAVILY_API_KEY}`실제 API 키를 사용하거나 환경 변수로 설정하세요.

**방법 3:`settings.json`(로컬 NPX)**

```json
{
  "mcpServers": {
    "tavily-mcp": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

***

### GLM 웹서치 프라임 (ZhipuAI)

GLM Coding Plan 사용자를 위해 설계된 ZhipuAI (지푸AI)에서 제공하는 공식 웹 검색 원격 MCP 서비스입니다. 뉴스, 주가, 날씨 등을 포함한 실시간 웹 검색을 제공합니다.

* **선적 서류 비치:** <https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server>
* **비용:**GLM 코딩 플랜 구독에 포함됨(Lite: 100콜/월, Pro: 1,000/월, 최대: 4,000/월)
* **API 키 받기:** <https://open.bigmodel.cn/apikey/platform>
* **가장 적합한 대상:**중국어 질의, 실시간 정보 검색

#### 사용 가능한 도구

* `webSearchPrime`— 페이지 제목, URL, 요약, 사이트 이름, 파비콘을 반환하는 웹 검색

#### 설정

**방법 1: CLI 명령**

```bash
qwen mcp add web-search-prime \
  -t http \
  "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp" \
  -H "Authorization: Bearer ${GLM_API_KEY}"
```

**방법 2:`settings.json`**

```json
{
  "mcpServers": {
    "web-search-prime": {
      "httpUrl": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer ${GLM_API_KEY}"
      }
    }
  }
}
```

바꾸다`${GLM_API_KEY}`실제 ZhipuAI API 키를 사용하거나 환경 변수로 설정하세요.

***
