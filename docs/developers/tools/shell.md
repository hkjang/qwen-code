# 쉘 도구(`run_shell_command`)

이 문서에서는`run_shell_command`Qwen Code용 도구입니다.

## 설명

사용`run_shell_command`기본 시스템과 상호 작용하거나, 스크립트를 실행하거나, 명령줄 작업을 수행합니다.`run_shell_command`사용자 입력이 필요한 대화형 명령(예:`vim`,`git rebase -i`) 만약`tools.shell.enableInteractiveShell`설정은 다음과 같이 설정됩니다.`true`.

Windows에서는 명령이 다음과 같이 실행됩니다.`cmd.exe /c`. 다른 플랫폼에서는 다음과 같이 실행됩니다.`bash -c`.

### 인수

`run_shell_command`다음 인수를 사용합니다.

* `command`(문자열, 필수): 실행할 정확한 쉘 명령입니다.
* `description`(문자열, 선택 사항): 사용자에게 표시되는 명령 목적에 대한 간략한 설명입니다.
* `directory`(문자열, 선택 사항): 명령을 실행할 디렉터리(프로젝트 루트 기준)입니다. 제공되지 않으면 명령은 프로젝트 루트에서 실행됩니다.
* `is_background`(부울, 필수): 명령을 백그라운드에서 실행할지 여부입니다. 이 매개변수는 명령 실행 모드에 대한 명시적인 결정을 보장하는 데 필요합니다. 추가 명령을 차단하지 않고 계속 실행해야 하는 개발 서버, 감시자 또는 데몬과 같은 장기 실행 프로세스의 경우 true로 설정합니다. 계속하기 전에 완료해야 하는 일회성 명령의 경우 false로 설정합니다.

## 사용방법`run_shell_command`퀀코드와 함께

사용시`run_shell_command`, 명령은 하위 프로세스로 실행됩니다. 다음을 사용하여 명령이 백그라운드에서 실행되는지 포그라운드에서 실행되는지 제어할 수 있습니다.`is_background`매개변수를 사용하거나 명시적으로 추가하여`&`명령에. 이 도구는 다음을 포함하여 실행에 대한 자세한 정보를 반환합니다.

### 필수 배경 매개변수

그만큼`is_background`매개변수는**필수의**모든 명령 실행에 대해. 이 설계를 통해 LLM(및 사용자)은 각 명령이 백그라운드에서 실행되어야 하는지 포그라운드에서 실행되어야 하는지 명시적으로 결정하여 의도적이고 예측 가능한 명령 실행 동작을 촉진합니다. 이 매개변수를 필수로 설정함으로써 장기 실행 프로세스를 처리할 때 후속 작업을 차단할 수 있는 의도치 않은 포그라운드 실행 폴백을 방지합니다.

### 백그라운드 실행과 포그라운드 실행

이 도구는 명시적인 선택에 따라 백그라운드 및 포그라운드 실행을 지능적으로 처리합니다.

**백그라운드 실행 사용(`is_background: true`) 을 위한:**

* 장기 실행 개발 서버:`npm run start`,`npm run dev`,`yarn dev`
* 감시자 빌드:`npm run watch`,`webpack --watch`
* 데이터베이스 서버:`mongod`,`mysql`,`redis-server`
* 웹 서버:`python -m http.server`,`php -S localhost:8000`
* 수동으로 중지할 때까지 무기한 실행될 것으로 예상되는 모든 명령

**포그라운드 실행 사용(`is_background: false`) 을 위한:**

* 일회성 명령:`ls`,`cat`,`grep`
* 빌드 명령:`npm run build`,`make`
* 설치 명령:`npm install`,`pip install`
* Git 작업:`git commit`,`git push`
* 테스트 실행:`npm test`,`pytest`

### 실행정보

이 도구는 다음을 포함하여 실행에 대한 자세한 정보를 반환합니다.

* `Command`: 실행된 명령입니다.
* `Directory`: 명령이 실행된 디렉터리입니다.
* `Stdout`: 표준 출력 스트림의 출력입니다.
* `Stderr`: 표준 오류 스트림의 출력입니다.
* `Error`: 하위 프로세스에서 보고된 오류 메시지입니다.
* `Exit Code`: 명령의 종료 코드입니다.
* `Signal`: 명령이 신호에 의해 종료된 경우 신호 번호입니다.
* `Background PIDs`: 시작된 모든 백그라운드 프로세스에 대한 PID 목록입니다.

용법:

```bash
run_shell_command(command="Your commands.", description="Your description of the command.", directory="Your execution directory.", is_background=false)
```

**메모:**&#xADF8;만큼`is_background`매개변수는 필수이며 모든 명령 실행에 대해 명시적으로 지정되어야 합니다.

## `run_shell_command`예

현재 디렉터리의 파일을 나열합니다.

```bash
run_shell_command(command="ls -la", is_background=false)
```

특정 디렉터리에서 스크립트를 실행합니다.

```bash
run_shell_command(command="./my_script.sh", directory="scripts", description="Run my custom script", is_background=false)
```

백그라운드 개발 서버를 시작합니다(권장 방법):

```bash
run_shell_command(command="npm run dev", description="Start development server in background", is_background=true)
```

백그라운드 서버를 시작합니다(명시적 &로 대체 가능).

```bash
run_shell_command(command="npm run dev &", description="Start development server in background", is_background=false)
```

포그라운드에서 빌드 명령을 실행합니다.

```bash
run_shell_command(command="npm run build", description="Build the project", is_background=false)
```

여러 백그라운드 서비스를 시작합니다.

```bash
run_shell_command(command="docker-compose up", description="Start all services", is_background=true)
```

## 구성

의 동작을 구성할 수 있습니다.`run_shell_command`도구를 수정하여`settings.json`파일을 사용하거나`/settings`Qwen 코드의 명령.

### 대화형 명령 활성화

그만큼`tools.shell.enableInteractiveShell`설정은 쉘 명령이 다음을 통해 실행되는지 여부를 제어합니다.`node-pty`(대화형 PTY) 또는 일반`child_process`백엔드. 활성화되면 다음과 같은 대화형 세션이`vim`,`git rebase -i`및 TUI 프로그램이 올바르게 작동합니다.

이 설정의 기본값은`true`대부분의 플랫폼에서. Windows 빌드에&#xC11C;**<= 19041**(Windows 10 버전 2004 이전) 기본값은 다음과 같습니다.`false`이전 ConPTY 구현에는 알려진 신뢰성 문제(출력 누락, 정지)가 있기 때문입니다. 이는 VS Code에서 사용하는 것과 동일한 컷오프와 일치합니다([마이크로소프트/vscode#123725](https://github.com/microsoft/vscode/issues/123725)). 만약에`node-pty`런타임에 사용할 수 없는 경우 도구는 다음으로 대체됩니다.`child_process`이 설정과 상관없이.

기본값을 명시적으로 재정의하려면 다음 값을 설정하세요.`settings.json`:

**예`settings.json`:**

```json
{
  "tools": {
    "shell": {
      "enableInteractiveShell": true
    }
  }
}
```

### 출력에 색상 표시

쉘 출력에 색상을 표시하려면 다음을 설정해야 합니다.`tools.shell.showColor`설정`true`. **참고: 이 설정은 다음 경우에만 적용됩니다.`tools.shell.enableInteractiveShell`활성화되었습니다.**

**예`settings.json`:**

```json
{
  "tools": {
    "shell": {
      "showColor": true
    }
  }
}
```

### 호출기 설정

다음을 설정하여 셸 출력에 대한 사용자 정의 호출기를 설정할 수 있습니다.`tools.shell.pager`환경. 기본 호출기는 다음과 같습니다.`cat`. **참고: 이 설정은 다음 경우에만 적용됩니다.`tools.shell.enableInteractiveShell`활성화되었습니다.**

**예`settings.json`:**

```json
{
  "tools": {
    "shell": {
      "pager": "less"
    }
  }
}
```

## 대화형 명령

그만큼`run_shell_command`이제 도구는 의사 터미널(pty)을 통합하여 대화형 명령을 지원합니다. 이를 통해 텍스트 편집기(`vim`,`nano`), 터미널 기반 UI(`htop`) 및 대화형 버전 제어 작업(`git rebase -i`).

대화형 명령이 실행 중일 때 Qwen 코드에서 입력을 보낼 수 있습니다. 대화형 셸에 집중하려면 다음을 누르세요.`ctrl+f`. 복잡한 TUI를 포함한 터미널 출력이 올바르게 렌더링됩니다.

## 중요 사항

* **보안:**&#xBCF4;안 취약성을 방지하려면 명령, 특히 사용자 입력으로 구성된 명령을 실행할 때 주의하십시오.
* **오류 처리:**&#xD655;인해보세요`Stderr`,`Error`, 그리고`Exit Code`명령이 성공적으로 실행되었는지 확인하는 필드입니다.
* **백그라운드 프로세스:**&#xC5B8;제`is_background=true`또는 명령에 다음이 포함된 경우`&`, 도구가 즉시 반환되고 프로세스는 백그라운드에서 계속 실행됩니다. 그만큼`Background PIDs`필드에는 백그라운드 프로세스의 프로세스 ID가 포함됩니다.
* **백그라운드 실행 선택:**&#xADF8;만큼`is_background`매개변수는 필수이며 실행 모드에 대한 명시적인 제어를 제공합니다. 추가할 수도 있습니다.`&`수동 백그라운드 실행 명령에`is_background`매개변수는 계속 지정되어야 합니다. 매개변수는 보다 명확한 의도를 제공하고 백그라운드 실행 설정을 자동으로 처리합니다.
* **명령 설명:**&#xC0AC;용시`is_background=true`, 명령 설명에는 다음이 포함됩니다.`[background]`실행 모드를 명확하게 표시하는 표시기입니다.

## 환경 변수

언제`run_shell_command`명령을 실행하면`QWEN_CODE=1`하위 프로세스 환경의 환경 변수입니다. 이를 통해 스크립트나 도구가 CLI 내에서 실행되고 있는지 감지할 수 있습니다.

## 명령 제한

실행할 수 있는 명령을 제한할 수 있습니다.`run_shell_command`도구를 사용하여`tools.core`그리고`tools.exclude`구성 파일의 설정.

* `tools.core`: 제한하다`run_shell_command`특정 명령 세트에 항목을 추가합니다.`core`아래에 나열`tools`형식의 카테고리`run_shell_command(<command>)`. 예를 들어,`"tools": {"core": ["run_shell_command(git)"]}`만 허용합니다`git`명령. 일반 포함`run_shell_command`와일드카드 역할을 하여 명시적으로 차단되지 않은 모든 명령을 허용합니다.
* `tools.exclude`: 특정 명령을 차단하려면`exclude`아래에 나열`tools`형식의 카테고리`run_shell_command(<command>)`. 예를 들어,`"tools": {"exclude": ["run_shell_command(rm)"]}`차단할 것이다`rm`명령.

유효성 검사 논리는 안전하고 유연하도록 설계되었습니다.

1. **명령 연결 비활성화됨**: 이 도구는 연결된 명령을 자동으로 분할합니다.`&&`,`||`, 또는`;`그리고 각 부분을 개별적으로 검증합니다. 체인의 일부가 허용되지 않으면 전체 명령이 차단됩니다.
2. **접두사 일치**: 이 도구는 접두사 일치를 사용합니다. 예를 들어, 허용하는 경우`git`, 당신은 실행할 수 있습니다`git status`또는`git log`.
3. **차단 목록 우선 순위**:`tools.exclude`목록은 항상 먼저 확인됩니다. 명령이 차단된 접두사와 일치하면 명령이 허용된 접두사와 일치하더라도 거부됩니다.`tools.core`.

### 명령 제한 예

**특정 명령 접두사만 허용**

만 허용하려면`git`그리고`npm`명령을 내리고 다른 모든 명령을 차단합니다.

```json
{
  "tools": {
    "core": ["run_shell_command(git)", "run_shell_command(npm)"]
  }
}
```

* `git status`: 허용된
* `npm install`: 허용된
* `ls -l`: 차단됨

**특정 명령 접두사 차단**

차단하려면`rm`다른 모든 명령을 허용합니다.

```json
{
  "tools": {
    "core": ["run_shell_command"],
    "exclude": ["run_shell_command(rm)"]
  }
}
```

* `rm -rf /`: 차단됨
* `git status`: 허용된
* `npm install`: 허용된

**차단 목록이 우선 적용됩니다.**

명령 접두사가 둘 다에 있는 경우`tools.core`그리고`tools.exclude`, 차단됩니다.

```json
{
  "tools": {
    "core": ["run_shell_command(git)"],
    "exclude": ["run_shell_command(git push)"]
  }
}
```

* `git push origin main`: 차단됨
* `git status`: 허용된

**모든 쉘 명령 차단**

모든 쉘 명령을 차단하려면 다음을 추가하십시오.`run_shell_command`와일드카드`tools.exclude`:

```json
{
  "tools": {
    "exclude": ["run_shell_command"]
  }
}
```

* `ls -l`: 차단됨
* `any other command`: 차단됨

## 다음에 대한 보안 참고 사항`excludeTools`

명령별 제한 사항`excludeTools`\~을 위한`run_shell_command`간단한 문자열 일치를 기반으로 하며 쉽게 우회할 수 있습니다. 이 기능은**보안 메커니즘이 아님**신뢰할 수 없는 코드를 안전하게 실행하기 위해 의존해서는 안 됩니다. 사용하는 것이 좋습니다`coreTools`명령을 명시적으로 선택하려면
실행이 가능한 것입니다.
