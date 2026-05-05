# 제드 편집자

> Zed Editor는 ACP(에이전트 클라이언트 프로토콜)를 통해 AI 코딩 도우미에 대한 기본 지원을 제공합니다. 이 통합을 통해 실시간 코드 제안과 함께 Zed의 인터페이스 내에서 직접 Qwen Code를 사용할 수 있습니다.

![Zed Editor Overview](https://img.alicdn.com/imgextra/i1/O1CN01aAhU311GwEoNh27FP_!!6000000000686-2-tps-3024-1898.png)

### 특징

* **네이티브 에이전트 경험**: Zed 인터페이스 내 통합 AI 보조 패널
* **에이전트 클라이언트 프로토콜**: 고급 IDE 상호 작용이 가능한 ACP에 대한 완벽한 지원
* **파일 관리**: @-멘션 파일을 대화 컨텍스트에 추가합니다.
* **대화 기록**: Zed 내 과거 대화에 접근

### 요구사항

* Zed Editor (최신 버전 권장)
* Qwen 코드 CLI가 설치되었습니다.

### 설치

#### ACP 레지스트리에서 설치(권장)

1. Qwen 코드 CLI를 설치합니다:

```bash
npm install -g @qwen-code/qwen-code
```

2. 다운로드 및 설치[제드 편집자](https://zed.dev/)

3. Zed에서**설정 버튼**오른쪽 상단에&#xC11C;**"대리인 추가"**, 선택하&#xB2E4;**"레지스트리에서 설치"**, 찾다**퀀 코드**을 클릭한 다음**설치하다**.

   ![ACP Registry](https://img.alicdn.com/imgextra/i4/O1CN0186ybL61EeG35fHFjy_!!6000000000376-2-tps-3056-1705.png)

   ![Qwen Code ACP Installed](https://img.alicdn.com/imgextra/i1/O1CN01OXHhoR1J8irAvjs8F_!!6000000000984-2-tps-1247-703.png)

#### 수동 설치

1. Qwen 코드 CLI를 설치합니다:

```bash
npm install -g @qwen-code/qwen-code
```

2. 다운로드 및 설치[제드 편집자](https://zed.dev/)

3. Zed에서**설정 버튼**오른쪽 상단에&#xC11C;**"대리인 추가"**, 선택하&#xB2E4;**"커스텀 에이전트 만들기"**&#xC744; 클릭하고 다음 구성을 추가합니다.

```json
"Qwen Code": {
  "type": "custom",
  "command": "qwen",
  "args": ["--acp"],
  "env": {}
}
```

![Qwen Code Integration](https://img.alicdn.com/imgextra/i1/O1CN013s61L91dSE1J7MTgO_!!6000000003734-2-tps-2592-1234.png)

## 문제 해결

### 에이전트가 나타나지 않음

* 달리다`qwen --version`설치를 확인하기 위해 터미널에서
* JSON 구성이 유효한지 확인하세요.
* Zed 편집기 다시 시작

### Qwen 코드가 응답하지 않습니다

* 인터넷 연결을 확인하세요
* 다음을 실행하여 CLI가 작동하는지 확인하세요.`qwen`터미널에서
* [GitHub에 문제 제출](https://github.com/qwenlm/qwen-code/issues)문제가 지속되는 경우
