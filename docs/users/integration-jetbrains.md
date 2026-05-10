# JetBrains IDE

> JetBrains IDE는 ACP(에이전트 클라이언트 프로토콜)를 통해 AI 코딩 도우미에 대한 기본 지원을 제공합니다. 이 통합을 통해 실시간 코드 제안을 통해 JetBrains IDE 내에서 직접 Qwen Code를 사용할 수 있습니다.

### 특징

- **네이티브 에이전트 경험**: JetBrains IDE 내에 통합된 AI 보조 패널
- **에이전트 클라이언트 프로토콜**: 고급 IDE 상호 작용이 가능한 ACP에 대한 완벽한 지원
- **기호 관리**: 대화 컨텍스트에 추가하기 위한 #-멘션 파일
- **대화 기록**: IDE 내 과거 대화에 접근

### 요구사항

- ACP를 지원하는 JetBrains IDE(IntelliJ IDEA, WebStorm, PyCharm 등)
- Qwen 코드 CLI가 설치되었습니다.

### 설치

#### ACP 레지스트리에서 설치(권장)

1. Qwen 코드 CLI를 설치합니다:

   ```bash
   npm install -g @qwen-code/qwen-code
   ```

2. JetBrains IDE를 열고 AI Chat 도구 창으로 이동하세요.

3. 딸깍 하는 소리**ACP 에이전트 추가**을 클릭한 다음**설치하다**.

   ![Install](https://img.alicdn.com/imgextra/i4/O1CN01qNdPCW1y8AcqxRgCy_!!6000000006533-2-tps-2490-1788.png)

   JetBrains AI Assistant 및/또는 기타 ACP 에이전트를 사용하는 사용자의 경우**ACP 레지스트리에서 설치**Agents List에서 Qwen Code ACP를 설치하세요.

   ![Add from Agents List](https://img.alicdn.com/imgextra/i2/O1CN01ZyOugP26BOKzNgZXx_!!6000000007623-2-tps-479-523.png)

4. 이제 AI Assistant 패널에서 Qwen Code 에이전트를 사용할 수 있습니다.

   ![Qwen Code in JetBrains AI Chat](https://img.alicdn.com/imgextra/i4/O1CN013kAVE41XVzbIZOxyv_!!6000000002930-2-tps-3188-2170.png)

#### 수동 설치(이전 버전의 JetBrains IDE용)

1. Qwen 코드 CLI를 설치합니다:

   ```bash
   npm install -g @qwen-code/qwen-code
   ```

2. JetBrains IDE를 열고 AI Chat 도구 창으로 이동하세요.

3. 오른쪽 상단에 있는 점 3개 메뉴를 클릭하고**ACP 에이전트 구성**다음 설정으로 Qwen Code를 구성합니다.

```json
{
  "agent_servers": {
    "qwen": {
      "command": "/path/to/qwen",
      "args": ["--acp"],
      "env": {}
    }
  }
}
```

4. 이제 AI Assistant 패널에서 Qwen Code 에이전트를 사용할 수 있습니다.

![Qwen Code in JetBrains AI Chat](https://img.alicdn.com/imgextra/i3/O1CN01ZxYel21y433Ci6eg0_!!6000000006524-2-tps-2774-1494.png)

## 문제 해결

### 에이전트가 나타나지 않음

- 달리다`qwen --version`설치를 확인하기 위해 터미널에서
- JetBrains IDE 버전이 ACP를 지원하는지 확인하세요.
- JetBrains IDE를 다시 시작하세요.

### Qwen 코드가 응답하지 않습니다

- 인터넷 연결을 확인하세요
- 다음을 실행하여 CLI가 작동하는지 확인하세요.`qwen`터미널에서
- [GitHub에 문제 제출](https://github.com/qwenlm/qwen-code/issues)문제가 지속되는 경우
