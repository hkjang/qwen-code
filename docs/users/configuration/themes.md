# 테마

Qwen Code는 색 구성표와 모양을 사용자 정의할 수 있는 다양한 테마를 지원합니다. 다음을 통해 원하는 대로 테마를 변경할 수 있습니다.`/theme`명령 또는`"theme":`구성 설정.

## 사용 가능한 테마

Qwen Code에는 미리 정의된 테마가 포함되어 있으며,`/theme`CLI 내의 명령:

- **어두운 테마:**
  - `ANSI`
  - `Atom One`
  - `Ayu`
  - `기본값`
  - `Dracula`
  - `GitHub`
- **가벼운 테마:**
  - `ANSI Light`
  - `Ayu Light`
  - `기본값 Light`
  - `GitHub Light`
  - `Google Code`
  - `Xcode`

### 테마 변경

1. 입력하다`/theme`Qwen 코드에.
2. 사용 가능한 테마를 나열하는 대화 상자 또는 선택 프롬프트가 나타납니다.
3. 화살표 키를 사용하여 테마를 선택합니다. 일부 인터페이스는 선택에 따라 실시간 미리보기 또는 강조표시를 제공할 수 있습니다.
4. 테마를 적용하려면 선택 사항을 확인하세요.

**메모:**테마가 정의되어 있는 경우`settings.json`파일(이름이나 파일 경로로)을 제거해야 합니다.`"theme"`테마를 변경하기 전에 파일에서 설정을`/theme`명령.

### 테마 지속성

선택한 테마는 Qwen Code에 저장됩니다.[구성](../configuration/settings)따라서 귀하의 선호도는 세션 전반에 걸쳐 기억됩니다.

---

## 사용자 정의 색상 테마

Qwen Code를 사용하면 자신만의 사용자 정의 색상 테마를 만들 수 있습니다.`settings.json`파일. 이를 통해 CLI에서 사용되는 색상 팔레트를 완벽하게 제어할 수 있습니다.

### 사용자 정의 테마를 정의하는 방법

추가`customThemes`사용자, 프로젝트 또는 시스템을 차단합니다.`settings.json`파일. 각 사용자 정의 테마는 고유한 이름과 색상 키 세트가 있는 개체로 정의됩니다. 예를 들어:

```json
{
  "ui": {
    "customThemes": {
      "MyCustomTheme": {
        "name": "MyCustomTheme",
        "type": "custom",
        "Background": "#181818",
        ...
      }
    }
  }
}
```

**컬러 키:**

- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`
- `DiffAdded`(선택 사항, diff에 추가된 줄의 경우)
- `Diff제거됨`(선택 사항, diff에서 제거된 줄의 경우)
- `DiffModified`(선택 사항, diff의 수정된 라인의 경우)

**필수 속성:**

- `name`(다음의 키와 일치해야 합니다.`customThemes`객체이고 문자열이어야 함)
- `type`(문자열이어야 합니다.`"custom"`)
- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`

16진수 코드(예:`#FF0000`)**또는**표준 CSS 색상 이름(예:`coral`,`teal`,`blue`) 모든 색상 값에 대해. 보다[CSS 색상 이름](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#color_keywords)지원되는 이름의 전체 목록을 보려면

항목을 더 추가하여 여러 사용자 정의 테마를 정의할 수 있습니다.`customThemes`물체.

### 파일에서 테마 로드

사용자 정의 테마를 정의하는 것 외에도`settings.json`, 파일 경로를 지정하여 JSON 파일에서 직접 테마를 로드할 수도 있습니다.`settings.json`. 이는 테마를 공유하거나 기본 구성과 별도로 유지하는 데 유용합니다.

파일에서 테마를 로드하려면`theme`당신의 재산`settings.json`테마 파일 경로:

```json
{
  "ui": {
    "theme": "/path/to/your/theme.json"
  }
}
```

테마 파일은 다음에 정의된 사용자 정의 테마와 동일한 구조를 따르는 유효한 JSON 파일이어야 합니다.`settings.json`.

**예`my-theme.json`:**

```json
{
  "name": "My File Theme",
  "type": "custom",
  "Background": "#282A36",
  "Foreground": "#F8F8F2",
  "LightBlue": "#82AAFF",
  "AccentBlue": "#61AFEF",
  "AccentPurple": "#BD93F9",
  "AccentCyan": "#8BE9FD",
  "AccentGreen": "#50FA7B",
  "AccentYellow": "#F1FA8C",
  "AccentRed": "#FF5555",
  "Comment": "#6272A4",
  "Gray": "#ABB2BF",
  "DiffAdded": "#A6E3A1",
  "Diff제거됨": "#F38BA8",
  "DiffModified": "#89B4FA",
  "GradientColors": ["#4796E4", "#847ACE", "#C3677F"]
}
```

**보안 참고사항:**안전을 위해 Gemini CLI는 홈 디렉터리에 있는 테마 파일만 로드합니다. 홈 디렉터리 외부에서 테마를 로드하려고 하면 경고가 표시되고 테마가 로드되지 않습니다. 이는 신뢰할 수 없는 소스에서 잠재적으로 악성인 테마 파일이 로드되는 것을 방지하기 위한 것입니다.

### 사용자 정의 테마 예

<img src="https://gw.alicdn.com/imgextra/i1/O1CN01Em30Hc1jYXAdIgls3_!!6000000004560-2-tps-1009-629.png" alt=" " style="zoom:100%;text-align:center;margin: 0 auto;" />

### 사용자 정의 테마 사용

- 다음을 사용하여 사용자 정의 테마를 선택하십시오.`/theme`Qwen Code의 명령. 사용자 정의 테마가 테마 선택 대화 상자에 나타납니다.
- 또는 추가하여 기본값으로 설정하십시오.`"theme": "MyCustomTheme"`에`ui`당신의 반대`settings.json`.
- 사용자 정의 테마는 사용자, 프로젝트 또는 시스템 수준에서 설정하고 동일한 기준을 따를 수 있습니다.[구성 우선순위](../configuration/settings)다른 설정으로.

## 테마 미리보기

| 어두운 테마 |                                                                                 시사                                                                                  |  라이트 테마  |                                                                                 시사                                                                                  |
| :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    안시     |     <img src="https://gw.alicdn.com/imgextra/i2/O1CN01ZInJiq1GdSZc9gHsI_!!6000000000645-2-tps-1140-934.png" style="zoom:30%;text-align:center;margin: 0 auto;" />     |  ANSI 라이트  |     <img src="https://gw.alicdn.com/imgextra/i2/O1CN01IiJQFC1h9E3MXQj6W_!!6000000004234-2-tps-1140-934.png" style="zoom:30%;text-align:center;margin: 0 auto;" />     |
| 아톰 원다크 |     <img src="https://gw.alicdn.com/imgextra/i2/O1CN01Zlx1SO1Sw21SkTKV3_!!6000000002310-2-tps-1140-934.png" style="zoom:30%;text-align:center;margin: 0 auto;" />     |    은어 빛    | <img src="https://gw.alicdn.com/imgextra/i3/O1CN01zEUc1V1jeUJsnCgQb_!!6000000004573-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |
|    아유     | <img src="https://gw.alicdn.com/imgextra/i3/O1CN019upo6v1SmPhmRjzfN_!!6000000002289-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |   기본 조명   | <img src="https://gw.alicdn.com/imgextra/i4/O1CN01RHjrEs1u7TXq3M6l3_!!6000000005990-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |
|    기본     |     <img src="https://gw.alicdn.com/imgextra/i4/O1CN016pIeXz1pFC8owmR4Q_!!6000000005330-2-tps-1140-934.png" style="zoom:30%;text-align:center;margin: 0 auto;" />     | GitHub 라이트 | <img src="https://gw.alicdn.com/imgextra/i4/O1CN01US2b0g1VETCPAVWLA_!!6000000002621-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |
|  드라큘라   |     <img src="https://gw.alicdn.com/imgextra/i4/O1CN016htnWH20c3gd2LpUR_!!6000000006869-2-tps-1140-934.png" style="zoom:30%;text-align:center;margin: 0 auto;" />     |   구글 코드   | <img src="https://gw.alicdn.com/imgextra/i1/O1CN01Ng29ab23iQ2BuYKz8_!!6000000007289-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |
|   GitHub    | <img src="https://gw.alicdn.com/imgextra/i4/O1CN01fFCRda1IQIQ9qDNqv_!!6000000000887-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |     Xcode     | <img src="https://gw.alicdn.com/imgextra/i1/O1CN010E3QAi1Huh5o1E9LN_!!6000000000818-2-tps-1140-934.png" alt=" " style="zoom:30%;text-align:center;margin: 0 auto;" /> |
