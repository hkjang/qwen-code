# 다중 파일 읽기 도구(`read_many_files`)

이 문서에서는`read_many_files`Qwen Code용 도구입니다.

## 설명

사용`read_many_files`경로 또는 glob 패턴으로 지정된 여러 파일의 콘텐츠를 읽습니다. 이 도구의 동작은 제공된 파일에 따라 다릅니다.

* 텍스트 파일의 경우 이 도구는 해당 내용을 단일 문자열로 연결합니다.
* 이미지(예: PNG, JPEG), PDF, 오디오(MP3, WAV) 및 비디오(MP4, MOV) 파일의 경우 이름이나 확장명으로 명시적으로 요청된 경우 해당 파일을 읽고 base64 인코딩 데이터로 반환합니다.

`read_many_files`코드베이스 개요 가져오기, 특정 기능이 구현된 위치 찾기, 문서 검토 또는 여러 구성 파일에서 컨텍스트 수집과 같은 작업을 수행하는 데 사용할 수 있습니다.

**메모:** `read_many_files`제공된 경로나 glob 패턴을 따라 파일을 찾습니다. 다음과 같은 디렉토리 경로`"/docs"`빈 결과를 반환합니다. 도구에는 다음과 같은 패턴이 필요합니다.`"/docs/*"`또는`"/docs/*.md"`관련 파일을 식별합니다.

### 인수

`read_many_files`다음 인수를 사용합니다.

* `paths`(list\[string], 필수): 도구의 대상 디렉터리에 상대적인 glob 패턴 또는 경로의 배열(예:`["src/**/*.ts"]`,`["README.md", "docs/*", "assets/logo.png"]`).
* `exclude`(list\[string], 선택 사항): 제외할 파일/디렉터리에 대한 Glob 패턴(예:`["**/*.log", "temp/"]`). 다음과 같은 경우 기본 제외 항목에 추가됩니다.`useDefaultExcludes`사실이다.
* `include`(list\[string], option): 포함할 추가 glob 패턴입니다. 이들은 다음과 병합됩니다.`paths`(예:`["*.test.ts"]`광범위하게 제외된 경우 테스트 파일을 구체적으로 추가하거나`["images/*.jpg"]`특정 이미지 유형을 포함하려면).
* `recursive`(boolean, option): 재귀적으로 검색할지 여부입니다. 이는 주로 다음에 의해 제어됩니다.`**`글로브 패턴으로. 기본값은`true`.
* `useDefaultExcludes`(boolean, option): 기본 제외 패턴 목록을 적용할지 여부(예:`node_modules`,`.git`, 이미지/PDF 바이너리 파일이 아님). 기본값은`true`.
* `respect_git_ignore`(부울, 선택 사항): 파일을 찾을 때 .gitignore 패턴을 존중할지 여부입니다. 기본값은 true입니다.

## 사용방법`read_many_files`퀀코드와 함께

`read_many_files`제공된 것과 일치하는 파일을 검색합니다.`paths`그리고`include`패턴을 존중하면서`exclude`패턴 및 기본 제외(활성화된 경우)

* 텍스트 파일의 경우: 일치하는 각 파일의 내용을 읽고(이미지/PDF로 명시적으로 요청되지 않은 바이너리 파일을 건너뛰려고 시도함) 구분 기호를 사용하여 단일 문자열로 연결합니다.`--- {filePath} ---`각 파일의 내용 사이. 기본적으로 UTF-8 인코딩을 사용합니다.
* 이 도구는`--- End of content ---`마지막 파일 이후.
* 이미지 및 PDF 파일의 경우: 이름이나 확장자로 명시적으로 요청된 경우(예:`paths: ["logo.png"]`또는`include: ["*.pdf"]`), 도구는 파일을 읽고 해당 콘텐츠를 base64로 인코딩된 문자열로 반환합니다.
* 이 도구는 초기 콘텐츠에서 null 바이트를 확인하여 다른 바이너리 파일(일반 이미지/PDF 유형과 일치하지 않거나 명시적으로 요청되지 않은 파일)을 감지하고 건너뛰려고 시도합니다.

용법:

```
read_many_files(paths=["Your files or paths here."], include=["Additional files to include."], exclude=["Files to exclude."], recursive=False, useDefaultExcludes=false, respect_git_ignore=true)
```

## `read_many_files`예

다음의 모든 TypeScript 파일을 읽습니다.`src`예배 규칙서:

```
read_many_files(paths=["src/**/*.ts"])
```

기본 README, 모든 Markdown 파일을 읽어보세요.`docs`특정 파일을 제외한 디렉토리 및 특정 로고 이미지:

```
read_many_files(paths=["README.md", "docs/**/*.md", "assets/logo.png"], exclude=["docs/OLD_README.md"])
```

모든 JavaScript 파일을 읽지만 테스트 파일과 모든 JPEG를 명시적으로 포함합니다.`images`접는 사람:

```
read_many_files(paths=["**/*.js"], include=["**/*.test.js", "images/**/*.jpg"], useDefaultExcludes=False)
```

## 중요 사항

* **바이너리 파일 처리:**
  * **이미지/PDF/오디오/비디오 파일:**&#xC774; 도구는 일반적인 이미지 유형(PNG, JPEG 등), PDF, 오디오(mp3, wav) 및 비디오(mp4, mov) 파일을 읽고 이를 base64로 인코딩된 데이터로 반환할 수 있습니다. 이 파일&#xB4E4;*\~ 해야 하다*명시적으로 타겟이 되다`paths`또는`include`패턴(예: 다음과 같이 정확한 파일 이름을 지정하여)`video.mp4`또는 다음과 같은 패턴`*.mov`).
  * **기타 바이너리 파일:**&#xC774; 도구는 초기 콘텐츠의 null 바이트를 검사하여 다른 유형의 바이너리 파일을 감지하고 건너뛰려고 시도합니다. 도구는 출력에서 ​​이러한 파일을 제외합니다.
* **성능:**&#xB9E4;우 많은 수의 파일이나 매우 큰 개별 파일을 읽으면 리소스가 많이 소모될 수 있습니다.
* **경로 특이성:**&#xB3C4;구의 대상 디렉터리를 기준으로 경로와 glob 패턴이 올바르게 지정되었는지 확인하세요. 이미지/PDF 파일의 경우 패턴이 해당 파일을 포함할 만큼 구체적인지 확인하세요.
* **기본값은 다음을 제외합니다.**&#xAE30;본 제외 패턴(예:`node_modules`,`.git`) 그리고 사용`useDefaultExcludes=False`재정의해야 하는 경우에는 신중하게 수행하세요.
