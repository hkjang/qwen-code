# 제거

제거 방법은 CLI를 실행한 방법에 따라 다릅니다. npx 또는 글로벌 npm 설치 지침을 따르세요.

## 방법 1: npx 사용

npx는 영구 설치 없이 임시 캐시에서 패키지를 실행합니다. CLI를 "제거"하려면 이 캐시를 지워야 하며, 그러면 이전에 npx로 실행된 qwen-code 및 기타 패키지가 제거됩니다.

npx 캐시는 다음과 같은 디렉터리입니다.`_npx`기본 npm 캐시 폴더 안에 있습니다. 다음을 실행하여 npm 캐시 경로를 찾을 수 있습니다.`npm config get cache`.

**macOS/리눅스의 경우**

```bash
# 경로는 일반적으로 다음과 같습니다 ~/.npm/_npx
rm -rf "$(npm config get cache)/_npx"
```

**윈도우의 경우**

*명령 프롬프트*

```cmd
:: 경로는 일반적으로 다음과 같습니다 %LocalAppData%\npm-cache\_npx
rmdir /s /q "%LocalAppData%\npm-cache\_npx"
```

*파워셸*

```powershell
# 경로는 일반적으로 다음과 같습니다 $env:LocalAppData\npm-cache\_npx
Remove-Item -Path (Join-Path $env:LocalAppData "npm-cache\_npx") -Recurse -Force
```

## 방법 2: npm 사용(전역 설치)

CLI를 전역적으로 설치한 경우(예:`npm install -g @qwen-code/qwen-code`),`npm uninstall`명령을 사용하여`-g`제거하려면 플래그를 지정하세요.

```bash
npm uninstall -g @qwen-code/qwen-code
```

이 명령은 시스템에서 패키지를 완전히 제거합니다.
