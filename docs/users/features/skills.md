# 에이전트 기술

> Qwen Code의 기능을 확장하기 위해 스킬을 생성, 관리 및 공유하세요.

이 가이드는 상담원 기술을 생성, 사용 및 관리하는 방법을 보여줍니다.**퀀 코드**. 기술은 지침(및 선택적으로 스크립트/리소스)이 포함된 정리된 폴더를 통해 모델의 효율성을 확장하는 모듈식 기능입니다.

## 전제조건

- Qwen 코드(최신 버전)
- Qwen Code에 대한 기본 지식([빠른 시작](../quickstart.md))

## 에이전트 스킬이란 무엇입니까?

상담원 기술은 전문 지식을 검색 가능한 기능으로 패키지화합니다. 각 스킬은 다음으로 구성됩니다.`SKILL.md`관련이 있는 경우 모델이 로드할 수 있는 지침과 스크립트 및 템플릿과 같은 선택적 지원 파일이 포함된 파일입니다.

### 스킬이 호출되는 방식

스킬은**모델 호출**— 모델은 사용자의 요청과 스킬 설명에 따라 언제 사용할지 자동으로 결정합니다. 이는 슬래시 명령과 다릅니다.**사용자 호출**(명시적으로 입력`/command`).

스킬을 명시적으로 호출하려면`/skills`슬래시 명령:

```bash
/skills <skill-name>
```

자동 완성을 사용하여 사용 가능한 기술과 설명을 찾아보세요.

### 이익

- 워크플로우를 위해 Qwen 코드 확장
- Git을 통해 팀 전체에 전문 지식을 공유하세요
- 반복적인 메시지 줄이기
- 복잡한 작업을 위한 여러 기술 구성

## 스킬 생성

스킬은 다음을 포함하는 디렉토리로 저장됩니다.`SKILL.md`파일.

### 개인 기술

개인 기술은 모든 프로젝트에서 사용할 수 있습니다. 다음에 저장하세요.`~/.qwen/skills/`:

```bash
mkdir -p ~/.qwen/skills/my-skill-name
```

다음 용도로 개인 기술을 사용하십시오.

- 귀하의 개별 작업 흐름 및 기본 설정
- 개발 중인 기술
- 개인 생산성 도우미

### 프로젝트 기술

프로젝트 기술은 팀과 공유됩니다. 다음에 저장하세요.`.qwen/skills/`프로젝트 내에서:

```bash
mkdir -p .qwen/skills/my-skill-name
```

다음 목적으로 프로젝트 기술을 사용하세요.

- 팀 워크플로 및 규칙
- 프로젝트별 전문성
- 공유 유틸리티 및 스크립트

프로젝트 기술은 git에 체크인하여 팀원이 자동으로 사용할 수 있게 됩니다.

## 쓰다`SKILL.md`

만들기`SKILL.md`YAML 머리말과 마크다운 콘텐츠가 포함된 파일:

```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Qwen Code.

## Examples
Show concrete examples of using this Skill.
```

### 현장 요구 사항

Qwen Code는 현재 다음을 검증합니다.

- `name`비어 있지 않은 문자열 일치입니다`/^[\p{L}\p{N}_:.-]+$/u`— 유니코드 문자 및 숫자(CJK/키릴 문자/악센트가 있는 라틴어 모두 가능)`_`,`:`,`.`,`-`. 공백, 슬래시, 대괄호 및 기타 구조적으로 안전하지 않은 문자는 구문 분석 시 거부됩니다.
- `description`비어 있지 않은 문자열입니다

권장 규칙:

- 공유 가능한 이름에는 하이픈이 포함된 소문자 ASCII를 선호합니다(예:`tsx-helper`)
- 만들다`description`구체적: 둘 다 포함**무엇**스킬은 그렇습니다.**언제**(사용자가 자연스럽게 언급하게 될 키워드)

### 선택 사항: 파일 경로에 대한 스킬 게이트(`paths:`)

코드베이스의 특정 부분에만 중요한 기술의 경우`paths:`글로브 패턴 목록. 기술은 도구 호출이 일치하는 파일에 닿을 때까지 모델의 사용 가능한 기술 목록에서 제외됩니다.

```yaml
---
name: tsx-helper
description: React TSX component helper
paths:
  - 'src/**/*.tsx'
  - 'packages/*/src/**/*.tsx'
---
```

참고:

- Globs는 프로젝트 루트를 기준으로 일치됩니다.[피코매치](https://github.com/micromatch/picomatch); 프로젝트 루트 외부의 파일은 활성화를 트리거하지 않습니다.
- 경로 제한 스킬**나머지 세션 동안 활성화 상태를 유지합니다.**일치하는 파일을 터치하면. 새 세션 또는`refreshCache`스킬 파일을 편집하면 트리거되고 활성화가 재설정됩니다.
- `paths:`게이트만**모델**발견 및 SkillTool 목록 수준에서만 가능합니다. 다음을 통해 언제든지 경로 제한 스킬을 직접 호출할 수 있습니다.`/<skill-name>`또는`/skills`선택기 — 해당 사용자 경로는 활성화 상태에 관계없이 스킬 본문을 실행합니다. 그러나 모델 측은 일치하는 파일을 터치할 때까지 게이트 상태를 유지합니다. 슬래시 호출은**\~ 아니다**모델 측 활성화를 잠금 해제하여 모델이 호출을 연결 해제하도록 하려면(호출`Skill { skill: ... }`자체), 또한 해당 스킬의 파일과 일치하는 파일에 액세스합니다.`paths:`첫 번째.
- 결합`paths:`\~와 함께`disable-model-invocation: true`허용되지만 게이트는 효과가 없습니다. 스킬은 관계없이 모델에서 숨겨지므로 경로 활성화는 이를 알리지 않습니다.

## 지원 파일 추가

함께 추가 파일 만들기`SKILL.md`:

```text
my-skill/
├── SKILL.md (required)
├── reference.md (optional documentation)
├── examples.md (optional examples)
├── scripts/
│   └── helper.py (optional utility)
└── templates/
    └── template.txt (optional template)
```

다음 파일을 참조하세요.`SKILL.md`:

````markdown
For advanced usage, see [reference.md](reference.md).

Run the helper script:

```bash
python scripts/helper.py input.txt
```
````

## 사용 가능한 스킬 보기

Qwen Code는 다음에서 기술을 발견합니다.

- 개인 기술:`~/.qwen/skills/`
- 프로젝트 기술:`.qwen/skills/`
- 확장 스킬: 설치된 확장에서 제공하는 스킬

### 확장 기술

확장은 확장이 활성화되면 사용할 수 있는 사용자 지정 기술을 제공할 수 있습니다. 이러한 기술은 확장 프로그램의`skills/`개인 및 프로젝트 기술과 동일한 형식을 따릅니다.

확장 기술은 확장이 설치되고 활성화되면 자동으로 검색되고 로드됩니다.

어떤 확장이 기술을 제공하는지 확인하려면 확장의`qwen-extension.json`파일을`skills`필드.

사용 가능한 스킬을 보려면 Qwen Code에게 직접 문의하세요.

```text
What Skills are available?
```

> **주의 사항 — 모델과 사용자 보기.**모델에게 표면만 묻는 것은 모델이 현재 볼 수 있는 기술입니다. 스킬을 사용하는 경우`paths:`(위의 "선택 사항: 파일 경로에 대한 기술 게이트" 참조) 일치하는 파일을 터치할 때까지 해당 목록에서 제외됩니다. 전체 세트는 항상 다음을 통해 볼 수 있습니다.`/skills`슬래시 명령과 디스크에.

또는 슬래시 명령을 사용하여 전체 목록을 탐색합니다(아직 활성화되지 않은 경로 게이트 기술을 포함하여 항상 모든 기술을 표시함).

```text
/skills
```

또는 파일 시스템을 검사하십시오.

```bash
# List personal Skills
ls ~/.qwen/skills/

# List project Skills (if in a project directory)
ls .qwen/skills/

# View a specific Skill's content
cat ~/.qwen/skills/my-skill/SKILL.md
```

## 기술 테스트

스킬을 만든 후 설명과 일치하는 질문을 통해 테스트해 보세요.

예: 설명에 "PDF 파일"이 언급된 경우:

```text
Can you help me extract text from this PDF?
```

모델은 요청과 일치하는 경우 Skill을 사용하기로 자동으로 결정하므로 명시적으로 호출할 필요가 없습니다.

## 스킬 디버그

Qwen Code가 스킬을 사용하지 않는 경우 다음과 같은 일반적인 문제를 확인하세요.

### 설명을 구체적으로 작성하세요

너무 모호함:

```yaml
description: Helps with documents
```

특정한:

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDFs, forms, or document extraction.
```

### 파일 경로 확인

- 개인 기술:`~/.qwen/skills/<skill-name>/SKILL.md`
- 프로젝트 기술:`.qwen/skills/<skill-name>/SKILL.md`

```bash
# Personal
ls ~/.qwen/skills/my-skill/SKILL.md

# Project
ls .qwen/skills/my-skill/SKILL.md
```

### YAML 구문 확인

잘못된 YAML로 인해 Skill 메타데이터가 올바르게 로드되지 않습니다.

```bash
cat SKILL.md | head -n 15
```

보장하다:

- 열기`---`라인 1에
- 폐쇄`---`마크다운 콘텐츠 이전
- 유효한 YAML 구문(탭 없음, 올바른 들여쓰기)

### 오류 보기

스킬 로딩 오류를 확인하려면 디버그 모드로 Qwen 코드를 실행하세요.

```bash
qwen --debug
```

## 팀과 기술 공유

프로젝트 저장소를 통해 기술을 공유할 수 있습니다.

1. 아래에 스킬을 추가하세요.`.qwen/skills/`
2. 커밋 및 푸시
3. 팀원이 변경 사항을 가져옵니다.

```bash
git add .qwen/skills/
git commit -m "Add team Skill for PDF processing"
git push
```

## 스킬 업데이트

편집하다`SKILL.md`곧장:

```bash
# Personal Skill
code ~/.qwen/skills/my-skill/SKILL.md

# Project Skill
code .qwen/skills/my-skill/SKILL.md
```

변경 사항은 다음에 Qwen Code를 시작할 때 적용됩니다. Qwen Code가 이미 실행 중인 경우 다시 시작하여 업데이트를 로드하세요.

## 스킬 제거

Skill 디렉터리를 삭제합니다.

```bash
# Personal
rm -rf ~/.qwen/skills/my-skill

# Project
rm -rf .qwen/skills/my-skill
git commit -m "Remove unused Skill"
```

## 모범 사례

### 기술에 집중하세요

하나의 기술은 하나의 기능을 다루어야 합니다.

- 초점: "PDF 양식 작성", "Excel 분석", "Git 커밋 메시지"
- 너무 광범위함: '문서 처리'(더 작은 기술로 분할)

### 명확한 설명을 작성하세요

특정 트리거를 포함하여 모델이 언제 스킬을 사용해야 하는지 발견하도록 돕습니다.

```yaml
description: Analyze Excel spreadsheets, create pivot tables, and generate charts. Use when working with Excel files, spreadsheets, or .xlsx data.
```

### 팀과 함께 테스트

- 스킬이 예상대로 활성화되나요?
- 지침이 명확합니까?
- 누락된 예시나 극단적인 경우가 있나요?
