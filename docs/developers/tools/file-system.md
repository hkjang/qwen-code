# Qwen 코드 파일 시스템 도구

Qwen Code는 로컬 파일 시스템과 상호 작용하기 위한 포괄적인 도구 모음을 제공합니다. 이러한 도구를 사용하면 모델이 파일과 디렉터리를 읽고, 쓰고, 나열하고, 검색하고, 수정할 수 있으며, 이 모든 작업은 사용자가 제어할 수 있으며 일반적으로 민감한 작업에 대한 확인이 필요합니다.

**메모:**모든 파일 시스템 도구는`rootDirectory`(일반적으로 CLI를 시작한 현재 작업 디렉터리) 보안을 위해. 이러한 도구에 제공하는 경로는 일반적으로 절대 경로이거나 이 루트 디렉터리를 기준으로 확인됩니다.

## 1. `list_directory`(목록파일)

`list_directory`지정된 디렉터리 경로 내에 있는 파일 및 하위 디렉터리의 이름을 직접 나열합니다. 제공된 glob 패턴과 일치하는 항목을 선택적으로 무시할 수 있습니다.

- **도구 이름:** `list_directory`
- **표시 이름:**목록파일
- **파일:** `ls.ts`
- **매개변수:**
  - `path`(문자열, 필수): 나열할 디렉터리의 절대 경로입니다.
  - `ignore`(문자열 배열, 선택 사항): 목록에서 제외할 glob 패턴 목록(예:`["*.log", ".git"]`).
  - `respect_git_ignore`(boolean, option): 존중할지 여부`.gitignore`파일을 나열할 때의 패턴 기본값은`true`.
- **행동:**
  - 파일 및 디렉터리 이름 목록을 반환합니다.
  - 각 항목이 디렉터리인지 여부를 나타냅니다.
  - 먼저 디렉토리를 기준으로 항목을 정렬한 다음 알파벳순으로 정렬합니다.
- **출력(`llmContent`):**다음과 같은 문자열:`Directory listing for /path/to/your/folder:\n[DIR] subfolder1\nfile1.txt\nfile2.png`
- **확인:**아니요.

## 2. `read_file`(파일 읽기)

`read_file`지정된 파일의 내용을 읽고 반환합니다. 이 도구는 현재 모델에서 지원되는 형식의 텍스트 파일과 미디어 파일(이미지, PDF, 오디오, 비디오)을 처리합니다. 텍스트 파일의 경우 특정 줄 범위를 읽을 수 있습니다. 현재 모델에서 양식이 지원되지 않는 미디어 파일은 유용한 오류 메시지와 함께 거부됩니다. 다른 바이너리 파일 형식은 일반적으로 건너뜁니다.

- **도구 이름:** `read_file`
- **표시 이름:**파일 읽기
- **파일:** `read-file.ts`
- **매개변수:**
  - `path`(문자열, 필수) : 읽을 파일의 절대 경로입니다.
  - `offset`(숫자, 선택 사항): 텍스트 파일의 경우 읽기를 시작할 0부터 시작하는 줄 번호입니다. 필요하다`limit`설정됩니다.
  - `limit`(숫자, 선택): 텍스트 파일의 경우 읽을 최대 줄 수입니다. 생략하면 기본 최대값(예: 2000줄)을 읽거나 가능한 경우 전체 파일을 읽습니다.
- **행동:**
  - 텍스트 파일의 경우: 콘텐츠를 반환합니다. 만약에`offset`그리고`limit`사용되면 해당 줄 조각만 반환됩니다. 줄 제한 또는 줄 길이 제한으로 인해 내용이 잘렸는지 여부를 나타냅니다.
  - 미디어 파일(이미지, PDF, 오디오, 비디오)의 경우: 현재 모델이 파일의 형식을 지원하는 경우 파일 콘텐츠를 base64로 인코딩된 형식으로 반환합니다.`inlineData`물체. 모델이 양식을 지원하지 않는 경우 지침(예: 기술 또는 외부 도구 제안)과 함께 오류 메시지를 반환합니다.
  - 기타 바이너리 파일의 경우: 해당 파일을 식별하고 건너뛰려고 시도하며 일반 바이너리 파일임을 나타내는 메시지를 반환합니다.
- **산출:**(`llmContent`):
  - 텍스트 파일의 경우: 잘림 메시지가 앞에 붙을 수 있는 파일 콘텐츠(예:`[File content truncated: showing lines 1-100 of 500 total lines...]\nActual file content...`).
  - 지원되는 미디어 파일의 경우: 다음을 포함하는 객체`inlineData`\~와 함께`mimeType`및 base64`data`(예:`{ inlineData: { mimeType: 'image/png', data: 'base64encodedstring' } }`).
  - 지원되지 않는 미디어 파일의 경우: 현재 모델이 이 형식을 지원하지 않음을 설명하는 오류 메시지 문자열과 대안 제안.
  - 기타 바이너리 파일의 경우: 다음과 같은 메시지가 표시됩니다.`Cannot display content of binary file: /path/to/data.bin`.
- **확인:**아니요.

## 3. `write_file`(파일 쓰기)

`write_file`지정된 파일에 콘텐츠를 씁니다. 파일이 있으면 덮어쓰게 됩니다. 파일이 없으면 해당 파일(및 필요한 상위 디렉터리)이 생성됩니다.

- **도구 이름:** `write_file`
- **표시 이름:**파일 쓰기
- **파일:** `write-file.ts`
- **매개변수:**
  - `file_path`(문자열, 필수): 쓸 파일의 절대 경로입니다.
  - `content`(문자열, 필수): 파일에 쓸 내용입니다.
- **행동:**
  - 제공된 내용을 작성합니다.`content`에`file_path`.
  - 존재하지 않는 경우 상위 디렉토리를 만듭니다.
- **출력(`llmContent`):**성공 메시지(예:`Successfully overwrote file: /path/to/your/file.txt`또는`Successfully created and wrote to new file: /path/to/new/file.txt`.
- **확인:**예. 변경 사항의 차이점을 표시하고 쓰기 전에 사용자 승인을 요청합니다.

## 4. `glob`(글로브)

`glob`특정 glob 패턴과 일치하는 파일을 찾습니다(예:`src/**/*.ts`,`*.md`), 수정 시간을 기준으로 정렬된 절대 경로를 반환합니다(최신 항목부터).

- **도구 이름:** `glob`
- **표시 이름:**글로브
- **파일:** `glob.ts`
- **매개변수:**
  - `pattern`(문자열, 필수): 일치시킬 glob 패턴(예:`"*.py"`,`"src/**/*.js"`).
  - `path`(문자열, 선택사항): 검색할 디렉터리입니다. 지정하지 않으면 현재 작업 디렉터리가 사용됩니다.
- **행동:**
  - 지정된 디렉터리 내에서 glob 패턴과 일치하는 파일을 검색합니다.
  - 가장 최근에 수정된 파일을 먼저 정렬하여 절대 경로 목록을 반환합니다.
  - 기본적으로 .gitignore 및 .qwenignore 패턴을 존중합니다.
  - 컨텍스트 오버플로를 방지하기 위해 결과를 100개 파일로 제한합니다.
- **출력(`llmContent`):**다음과 같은 메시지:`Found 5 file(s) matching "*.ts" within /path/to/search/dir, sorted by modification time (newest first):\n---\n/path/to/file1.ts\n/path/to/subdir/file2.ts\n---\n[95 files truncated] ...`
- **확인:**아니요.

## 5. `grep_search`(그렙)

`grep_search`지정된 디렉터리의 파일 내용 내에서 정규식 패턴을 검색합니다. 글로벌 패턴으로 파일을 필터링할 수 있습니다. 파일 경로 및 줄 번호와 함께 일치하는 항목이 포함된 줄을 반환합니다.

- **도구 이름:** `grep_search`

- **표시 이름:**그렙

- **파일:** `grep.ts`(와 함께`ripGrep.ts`대체용으로)

- **매개변수:**
  - `pattern`(문자열, 필수): 파일 콘텐츠에서 검색할 정규식 패턴(예:`"function\\s+myFunction"`,`"log.*Error"`).
  - `path`(문자열, 선택 사항): 검색할 파일 또는 디렉터리. 기본값은 현재 작업 디렉터리입니다.
  - `glob`(문자열, 선택 사항): 파일을 필터링하기 위한 Glob 패턴(예:`"*.js"`,`"src/**/*.{ts,tsx}"`).
  - `limit`(숫자, 선택 사항): 출력을 처음 N개의 일치하는 줄로 제한합니다. 선택 사항 - 지정되지 않은 경우 모든 일치 항목을 표시합니다.

- **행동:**
  - 가능한 경우 빠른 검색을 위해 ripgrep을 사용합니다. 그렇지 않으면 JavaScript 기반 검색 구현으로 대체됩니다.
  - 파일 경로 및 줄 번호와 일치하는 줄을 반환합니다.
  - 기본적으로 대소문자를 구분하지 않습니다.
  - .gitignore 및 .qwenignore 패턴을 존중합니다.
  - 컨텍스트 오버플로를 방지하기 위해 출력을 제한합니다.

- **출력(`llmContent`):**형식화된 일치 문자열입니다. 예:

  ```
  Found 3 matches for pattern "myFunction" in path "." (filter: "*.ts"):
  ---
  src/utils.ts:15:export function myFunction() {
  src/utils.ts:22:  myFunction.call();
  src/index.ts:5:import { myFunction } from './utils';
  ---

  [0 lines truncated] ...
  ```

- **확인:**아니요.

### `grep_search`예

기본 결과 제한이 있는 패턴을 검색합니다.

```
grep_search(pattern="function\\s+myFunction", path="src")
```

사용자 정의 결과 제한을 사용하여 패턴을 검색합니다.

```
grep_search(pattern="function", path="src", limit=50)
```

파일 필터링 및 사용자 정의 결과 제한을 사용하여 패턴을 검색합니다.

```
grep_search(pattern="function", glob="*.js", limit=10)
```

## 6. `edit`(편집하다)

`edit`파일 내의 텍스트를 바꿉니다. 기본적으로 다음이 필요합니다.`old_string`하나의 고유한 위치와 일치시킵니다. 세트`replace_all`에게`true`의도적으로 모든 사건을 변경하고 싶을 때. 이 도구는 정확하고 목표에 맞는 변경을 위해 설계되었으며,`old_string`올바른 위치를 수정하는지 확인하세요.

- **도구 이름:** `edit`

- **표시 이름:**편집하다

- **파일:** `edit.ts`

- **매개변수:**
  - `file_path`(문자열, 필수): 수정할 파일의 절대 경로입니다.

  - `old_string`(문자열, 필수): 대체할 정확한 리터럴 텍스트입니다.

    **비판적인:**이 문자열은 변경할 단일 인스턴스를 고유하게 식별해야 합니다. 공백과 들여쓰기가 정확하게 일치하면서 대상 텍스트 주위에 충분한 컨텍스트가 포함되어야 합니다. 만약에`old_string`비어 있으면 도구는 다음 위치에 새 파일을 생성하려고 시도합니다.`file_path`\~와 함께`new_string`콘텐츠로.

  - `new_string`(문자열, 필수): 대체할 정확한 리터럴 텍스트`old_string`와 함께.

  - `replace_all`(부울, 선택 사항): 다음 항목을 모두 바꿉니다.`old_string`. 기본값은`false`.

- **행동:**
  - 만약에`old_string`비어 있고`file_path`존재하지 않습니다. 다음을 사용하여 새 파일을 만듭니다.`new_string`콘텐츠로.
  - 만약에`old_string`제공되면 다음을 읽습니다.`file_path`그리고 다음과 같은 경우가 아니면 정확히 한 번만 찾으려고 시도합니다.`replace_all`사실이다.
  - 일치하는 항목이 고유한 경우(또는`replace_all`true), 텍스트를 다음으로 바꿉니다.`new_string`.
  - **향상된 신뢰성(다단계 편집 수정):**특히 모델이 제공하는 경우 편집 성공률을 크게 향상시킵니다.`old_string`완벽하게 정확하지 않을 수도 있지만 이 도구에는 다단계 편집 수정 메커니즘이 통합되어 있습니다.
    - 만약 초기`old_string`찾을 수 없거나 여러 위치와 일치하는 경우 도구는 Qwen 모델을 활용하여 반복적으로 개선할 수 있습니다.`old_string`(그리고 잠재적으로`new_string`).
    - 이 자체 수정 프로세스는 모델이 수정하려는 고유 세그먼트를 식별하여`edit`약간 불완전한 초기 컨텍스트에서도 작동이 더욱 강력해졌습니다.

- **실패 조건:**수정 메커니즘에도 불구하고 다음과 같은 경우 도구가 실패합니다.
  - `file_path`절대적이지 않거나 루트 디렉터리 외부에 있습니다.
  - `old_string`비어 있지는 않지만`file_path`존재하지 않습니다.
  - `old_string`비어 있지만`file_path`이미 존재합니다.
  - `old_string`수정을 시도한 후에도 파일에서 찾을 수 없습니다.
  - `old_string`여러 번 발견되고,`replace_all`false이며 자체 수정 메커니즘은 이를 하나의 명확한 일치 항목으로 해결할 수 없습니다.

- **출력(`llmContent`):**
  - 성공 시:`Successfully modified file: /path/to/file.txt (1 replacements).`또는`Created new file: /path/to/new_file.txt with provided content.`
  - 실패 시: 이유를 설명하는 오류 메시지(예:`Failed to edit, 0 occurrences found...`,`Failed to edit because the text matches multiple locations...`).

- **확인:**예. 제안된 변경 사항의 차이점을 표시하고 파일에 쓰기 전에 사용자 승인을 요청합니다.

## 파일 인코딩 및 플랫폼별 동작

### 인코딩 감지 및 보존

파일을 읽을 때 Qwen Code는 다단계 전략을 사용하여 파일의 인코딩을 감지합니다.

1. **UTF-8**— 먼저 시도했습니다(대부분의 최신 도구는 UTF-8을 출력합니다).
2. **근대**— UTF-8이 아닌 콘텐츠에 대한 통계적 탐지
3. **시스템 인코딩**— OS 코드 페이지로 대체됩니다(Windows`chcp`/ 유닉스`LANG`)

둘 다`write_file`그리고`edit`기존 파일의 원래 인코딩과 BOM(바이트 순서 표시)을 보존합니다. UTF-8 BOM을 사용하여 파일을 GBK로 읽은 경우 동일한 방식으로 다시 기록됩니다.

### 새 파일에 대한 기본 인코딩 구성

그만큼`defaultFileEncoding`설정 제어 인코딩**새로 생성된**파일(기존 파일 편집 아님):

| 값                | 행동                                                 |
| ----------------- | ---------------------------------------------------- |
| _(설정되지 않음)_ | BOM이 없는 UTF-8, 자동 플랫폼별 조정 포함(아래 참조) |
| `utf-8`           | BOM이 없는 UTF-8, 자동 조정 없음                     |
| `utf-8-bom`       | 모든 새 파일에 대한 BOM이 포함된 UTF-8               |

설정하세요`.qwen/settings.json`또는`~/.qwen/settings.json`:

```json
{
  "general": {
    "defaultFileEncoding": "utf-8-bom"
  }
}
```

### Windows: 배치 파일용 CRLF

윈도우에서는,`.bat`그리고`.cmd`파일은 자동으로 CRLF(`\r\n`) 줄 끝. 이는 필수입니다.`cmd.exe`CRLF를 줄 구분 기호로 사용합니다. LF 전용 끝은 여러 줄을 나눌 수 있습니다.`if`/`else`,`goto`라벨 및`for`루프. 이는 인코딩 설정에 관계없이 Windows에만 적용됩니다.

### Windows: PowerShell 스크립트용 UTF-8 BOM

Windows에서는**UTF-8이 아닌 시스템 코드 페이지**(예: GBK/cp936, Big5/cp950, Shift_JIS/cp932), 새로 생성됨`.ps1`파일은 UTF-8 BOM을 사용하여 자동으로 작성됩니다. 이는 Windows PowerShell 5.1(Windows 10/11에 기본 제공되는 버전)이 시스템의 ANSI 코드 페이지를 사용하여 BOM 없는 스크립트를 읽기 때문에 필요합니다. BOM이 없으면 스크립트의 ASCII가 아닌 문자가 잘못 해석됩니다.

이 자동 BOM은 다음과 같은 경우에만 적용됩니다.

- 플랫폼은 윈도우
- 시스템 코드 페이지가 UTF-8이 아닙니다(코드 페이지 65001 아님).
- 파일이 새 파일입니다.`.ps1`파일(기존 파일은 원래 인코딩을 유지함)
- 사용자는**\~ 아니다**명시적으로 설정`defaultFileEncoding`설정에서

PowerShell 7+(pwsh)는 기본적으로 UTF-8로 설정되어 있으며 BOM을 투명하게 처리하므로 BOM은 무해합니다.

명시적으로 설정한 경우`defaultFileEncoding`에게`"utf-8"`, 자동 BOM이 비활성화됩니다. 이는 BOM을 거부하는 저장소 또는 도구에 대한 의도적인 탈출구입니다.

### 요약

| 파일 형식     | 플랫폼                            | 자동 행동                |
| ------------- | --------------------------------- | ------------------------ |
| `.bat`,`.cmd` | 윈도우                            | CRLF 줄 끝               |
| `.ps1`        | Windows(UTF-8이 아닌 코드 페이지) | 새 파일의 UTF-8 BOM      |
| 기타 모든     | 모두                              | BOM이 없는 UTF-8(기본값) |

이러한 파일 시스템 도구는 Qwen Code가 로컬 프로젝트 컨텍스트를 이해하고 상호 작용할 수 있는 기반을 제공합니다.
