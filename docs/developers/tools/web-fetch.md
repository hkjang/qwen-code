# 웹 가져오기 도구(`web_fetch`)

이 문서에서는`web_fetch`Qwen Code용 도구입니다.

## 설명

사용`web_fetch`지정된 URL에서 콘텐츠를 가져와 AI 모델을 사용하여 처리합니다. 이 도구는 URL과 프롬프트를 입력으로 사용하여 URL 콘텐츠를 가져온 다음 작고 빠른 모델을 사용하여 프롬프트가 포함된 콘텐츠를 처리합니다.

### 인수

`web_fetch`세 가지 인수를 사용합니다.

- `url`(문자열, 필수): 콘텐츠를 가져올 URL입니다. 다음으로 시작하는 완전한 형식의 유효한 URL이어야 합니다.`http://`또는`https://`.
- `prompt`(문자열, 필수): 페이지 콘텐츠에서 추출하려는 정보를 설명하는 프롬프트입니다.
- `format`(문자열, 선택사항):`Accept`귀하의 콘텐츠 선호도를 나타내는 헤더가 서버로 전송됩니다.**가져온 모든 콘텐츠는 LLM 처리를 위해 일반 텍스트로 정규화됩니다.**, 지정된 형식에 관계없이. 기본값은`"auto"`지정되지 않은 경우.
  - `"auto"`(기본값): 콘텐츠 협상을 통한 마크다운을 선호합니다(`Accept: text/markdown, text/html`), HTML을 대체 항목으로 허용합니다.**대부분의 사용 사례에 권장됨**마크다운을 지원하는 서버의 경우 토큰 사용량을 최대 80%까지 줄일 수 있기 때문입니다.
  - `"markdown"`: 보낸다`Accept: text/markdown`. 마크다운 콘텐츠가 명시적으로 필요할 때 사용하세요.
  - `"html"`: 보낸다`Accept: text/html`. 서버가 Accept 헤더에 HTML을 요구할 때 사용합니다. 콘텐츠는 LLM 처리를 위해 계속 일반 텍스트로 변환됩니다.
  - `"text"`: 보낸다`Accept: text/plain`. 특별히 일반 텍스트 콘텐츠가 필요할 때 사용하세요.

## 사용방법`web_fetch`퀀코드와 함께

사용하려면`web_fetch`Qwen Code를 사용하여 URL과 해당 URL에서 추출하려는 내용을 설명하는 프롬프트를 제공하세요. 도구는 URL을 가져오기 전에 확인을 요청합니다. 확인되면 도구는 콘텐츠를 직접 가져와 AI 모델을 사용하여 처리합니다.

도구가 자동으로 다음을 수행합니다.

- 필요한 경우 HTML을 텍스트로 변환합니다.
- GitHub Blob URL을 처리합니다(원시 URL로 변환).
- 보안을 위해 HTTP URL을 HTTPS로 업그레이드합니다.
- 마크다운을 위한 콘텐츠 협상 지원(토큰 사용량 대폭 감소)

용법:

```
web_fetch(url="https://example.com", prompt="Summarize the main points of this article")
```

형식 사양:

```
web_fetch(url="https://example.com", prompt="Get the raw content", format="markdown")
```

## `web_fetch`예

단일 기사를 요약하면 다음과 같습니다.

```
web_fetch(url="https://example.com/news/latest", prompt="Can you summarize the main points of this article?")
```

특정 정보 추출:

```
web_fetch(url="https://arxiv.org/abs/2401.0001", prompt="What are the key findings and methodology described in this paper?")
```

GitHub 문서 분석:

```
web_fetch(url="https://github.com/QwenLM/Qwen/blob/main/README.md", prompt="What are the installation steps and main features?")
```

마크다운 콘텐츠 가져오기(에이전트용 마크다운을 지원하는 서버의 경우):

```
web_fetch(url="https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/", prompt="Extract the key information", format="markdown")
```

## 중요 사항

- **단일 URL 처리:** `web_fetch`한 번에 하나의 URL을 처리합니다. 여러 URL을 분석하려면 도구를 별도로 호출하세요.
- **URL 형식:**이 도구는 자동으로 HTTP URL을 HTTPS로 업그레이드하고 GitHub Blob URL을 원시 형식으로 변환하여 더 나은 콘텐츠 액세스를 제공합니다.
- **콘텐츠 협상:**이 도구는 "에이전트에 대한 마크다운" 콘텐츠 협상을 지원합니다. 사용시`format="auto"`(기본값), 보냅니다`Accept: text/markdown, text/html`헤더를 사용하면 마크다운을 지원하는 서버가 HTML 대신 헤더를 직접 반환할 수 있습니다. 이를 통해 토큰 사용량을 최대 80%까지 줄일 수 있습니다.
- **콘텐츠 처리:**이 도구는 콘텐츠를 직접 가져와 AI 모델을 사용하여 처리합니다. 서버가 HTML을 반환하면 이를 읽을 수 있는 텍스트 형식으로 변환합니다. 서버가 마크다운이나 일반 텍스트를 반환하면 콘텐츠를 있는 그대로 사용합니다.
- **출력 품질:**출력 품질은 프롬프트 지침의 명확성에 따라 달라집니다.
- **MCP 도구:**MCP 제공 웹 가져오기 도구를 사용할 수 있는 경우("mcp\_\_"로 시작) 제한 사항이 더 적을 수 있으므로 해당 도구를 사용하는 것이 좋습니다.

## 에이전트 지원을 위한 마크다운

퀀 코드의`web_fetch`도구는 다음에 대한 지원을 구현합니다.[에이전트를 위한 Cloudflare의 마크다운](https://blog.cloudflare.com/markdown-for-agents/)사양. 이 기능을 사용하면 웹사이트에서 마크다운 콘텐츠를 AI 에이전트에 직접 제공할 수 있어 HTML 구문 분석에 비해 토큰 사용량이 크게 줄어듭니다.

### 작동 원리

1. 그만큼`format`매개변수 컨트롤**오직**그만큼`Accept`서버로 전송되는 헤더(출력 형식에는 영향을 주지 않음):
   - `format="auto"`: 보낸다`Accept: text/markdown, text/html`
   - `format="markdown"`: 보낸다`Accept: text/markdown`
   - `format="html"`: 보낸다`Accept: text/html`
   - `format="text"`: 보낸다`Accept: text/plain`
2. 서버가 마크다운을 지원하는 경우 반환됩니다.`Content-Type: text/markdown`
3. 이 도구는 변환 없이 마크다운 또는 일반 텍스트 콘텐츠를 직접 사용합니다.
4. 서버가 HTML을 반환하면 LLM 처리를 위해 읽을 수 있는 텍스트 형식으로 변환됩니다.
5. 모든 콘텐츠는 AI 모델에서 처리되기 전에 텍스트로 정규화됩니다.

### 이익

- **토큰 효율성:**마크다운 콘텐츠는 일반적으로 동등한 HTML보다 80% 더 적은 토큰을 사용합니다.
- **더 나은 구조:**마크다운은 의미 구조(제목, 목록 등)를 보존합니다.
- **이전 버전과 호환:**모든 웹사이트에서 작동하며 서버 지원을 위한 향상된 경험

### 마크다운을 지원하는 예시 서버

- Cloudflare 개발자 문서
- Cloudflare 블로그
- Cloudflare의 "에이전트용 마크다운" 기능을 사용하는 모든 웹사이트
