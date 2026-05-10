# 파일 무시

이 문서는 Qwen Ignore(`.qwenignore`) Qwen Code의 기능입니다.

Qwen Code에는 다음과 유사하게 파일을 자동으로 무시하는 기능이 포함되어 있습니다.`.gitignore`(Git에서 사용). 경로 추가`.qwenignore`파일은 이 기능을 지원하는 도구에서 해당 항목을 제외하지만 다른 서비스(예: Git)에는 계속 표시됩니다.

## 작동 원리

경로를 추가하면`.qwenignore`파일, 이 파일을 존중하는 도구는 작업에서 일치하는 파일 및 디렉터리를 제외합니다. 예를 들어,[`read_many_files`](../../developers/tools/multi-file)명령, 귀하의 모든 경로`.qwenignore`파일은 자동으로 제외됩니다.

대부분의 경우,`.qwenignore`다음의 규칙을 따릅니다.`.gitignore`파일:

- 빈 줄과 다음으로 시작하는 줄`#`무시됩니다.
- 표준 glob 패턴이 지원됩니다(예:`*`,`?`, 그리고`[]`).
- 퍼팅`/`마지막에는 디렉토리만 일치합니다.
- 퍼팅`/`처음에는 경로를 기준으로 고정됩니다.`.qwenignore`파일.
- `!`패턴을 부정합니다.

업데이트할 수 있습니다.`.qwenignore`언제든지 파일. 변경 사항을 적용하려면 Qwen Code 세션을 다시 시작해야 합니다.

## 사용방법`.qwenignore`

| 단계                   | 설명                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **.qwenignore 활성화** | 라는 이름의 파일을 생성합니다.`.qwenignore`프로젝트 루트 디렉터리에                             |
| **무시 규칙 추가**     | 열려 있는`.qwenignore`파일을 삭제하고 무시할 경로를 추가합니다. 예:`/archive/`또는`apikeys.txt` |

### `.qwenignore`예

당신은 사용할 수 있습니다`.qwenignore`디렉토리와 파일을 무시하려면 다음을 수행하십시오.

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

와일드카드를 사용할 수 있습니다.`.qwenignore`파일로`*`:

```
# Exclude all .md files
*.md
```

마지막으로 다음을 사용하여 파일 및 디렉터리를 제외에서 제외할 수 있습니다.`!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

경로를 제거하려면`.qwenignore`파일에서 관련 줄을 삭제하세요.
