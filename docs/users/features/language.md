# 국제화(i18n) 및 언어

Qwen Code는 다국어 워크플로용으로 제작되었습니다. CLI에서 UI 현지화(i18n/l10n)를 지원하고 보조 출력 언어를 선택할 수 있으며 사용자 정의 UI 언어 팩을 허용합니다.

## 개요

사용자 관점에서 볼 때 Qwen Code의 "국제화"는 여러 계층에 걸쳐 있습니다.

| 기능/설정              | 제어 대상                           | 저장 장소                        |
| ------------------ | ------------------------------- | ---------------------------- |
| `/language ui`     | 터미널 UI 텍스트(메뉴, 시스템 메시지, 프롬프트)   | `~/.qwen/settings.json`      |
| `/language output` | AI가 응답하는 언어(UI 번역이 아닌 출력 기본 설정) | `~/.qwen/output-language.md` |
| 사용자 정의 UI 언어 팩     | 내장된 UI 번역을 재정의/확장합니다.           | `~/.qwen/locales/*.js`       |

## UI 언어

이는 CLI의 UI 현지화 계층(i18n/l10n)으로, 메뉴, 프롬프트 및 시스템 메시지의 언어를 제어합니다.

### UI 언어 설정

사용`/language ui`명령:

```bash
/language ui zh-CN    # Chinese
/language ui en-US    # English
/language ui ru-RU    # Russian
/language ui de-DE    # German
/language ui ja-JP    # Japanese
```

별칭도 지원됩니다.

```bash
/language ui zh       # Chinese
/language ui en       # English
/language ui ru       # Russian
/language ui de       # German
/language ui ja       # Japanese
```

### 자동 감지

처음 시작할 때 Qwen Code는 시스템 로케일을 감지하고 UI 언어를 자동으로 설정합니다.

감지 우선순위:

1. `QWEN_CODE_LANG`환경 변수
2. `LANG`환경 변수
3. JavaScript Intl API를 통한 시스템 로케일
4. 기본값: 영어

## LLM 출력 언어

LLM 출력 언어는 질문을 입력하는 언어에 관계없이 AI 도우미가 응답하는 언어를 제어합니다.

### 작동 방식

LLM 출력 언어는 다음 위치의 규칙 파일에 의해 제어됩니다.`~/.qwen/output-language.md`. 이 파일은 시작 중에 LLM의 컨텍스트에 자동으로 포함되어 지정된 언어로 응답하도록 지시합니다.

### 자동 감지

처음 시작할 때, 그렇지 않은 경우`output-language.md`파일이 존재하면 Qwen Code는 시스템 로케일에 따라 자동으로 파일을 생성합니다. 예를 들어:

* 시스템 로케일`zh`중국어 응답에 대한 규칙을 만듭니다
* 시스템 로케일`en`영어 응답에 대한 규칙을 만듭니다
* 시스템 로케일`ru`러시아 반응에 대한 규칙을 만듭니다
* 시스템 로케일`de`독일 응답에 대한 규칙을 만듭니다.
* 시스템 로케일`ja`일본어 응답에 대한 규칙을 만듭니다.

### 수동 설정

사용`/language output <language>`변경하려면:

```bash
/language output Chinese
/language output English
/language output Japanese
/language output German
```

모든 언어 이름이 작동합니다. LLM은 해당 언어로 응답하도록 지시를 받습니다.

> \[!메모]
>
> 출력 언어를 변경한 후 Qwen Code를 다시 시작하면 변경 사항이 적용됩니다.

### 파일 위치

```
~/.qwen/output-language.md
```

## 구성

### 설정 대화 상자를 통해

1. 달리다`/settings`
2. 일반에서 "언어"를 찾으세요.
3. 선호하는 UI 언어를 선택하세요

### 환경 변수를 통해

```bash
export QWEN_CODE_LANG=zh
```

이는 처음 시작할 때 자동 감지에 영향을 미칩니다(UI 언어를 설정하지 않았고`output-language.md`파일이 아직 존재합니다).

## 사용자 정의 언어 팩

UI 번역의 경우 다음에서 사용자 정의 언어 팩을 만들 수 있습니다.`~/.qwen/locales/`:

* 예:`~/.qwen/locales/es.js`스페인어의 경우
* 예:`~/.qwen/locales/fr.js`프랑스어용

사용자 디렉터리는 기본 제공 번역보다 우선합니다.

> \[!팁]
>
> 기여를 환영합니다! 내장된 번역을 개선하거나 새로운 언어를 추가하려는 경우.&#x20;
> 구체적인 예를 보려면 다음을 참조하세요.[PR #1238: feat(i18n): 러시아어 지원 추가](https://github.com/QwenLM/qwen-code/pull/1238).

### 언어 팩 형식

```javascript
// ~/.qwen/locales/es.js
export default {
  Hello: 'Hola',
  Settings: 'Configuracion',
  // ... more translations
};
```

## 관련 명령

* `/language`- 현재 언어 설정 표시
* `/language ui [lang]`- UI 언어 설정
* `/language output <language>`- LLM 출력 언어 설정
* `/settings`- 설정 대화상자 열기
