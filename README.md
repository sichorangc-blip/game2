# 아이셋 또박키즈 (ISET TtoBak Kids)

어린 아이들이 한국어 발음을 재미있게 연습할 수 있도록 만든 웹앱입니다.
이 프로젝트는 **웹 실행**과 **Android APK/AAB 패키징(구글 플레이스토어 등록용)** 모두를 지원합니다.

## 핵심 개선
- 브랜드명 변경: **아이셋 또박키즈**
- 입모양 애니메이션 추가 (ㄹ/ㄴ/ㅅ/ㅍ/이중받침 모드)
- 이미지/스티커 스타일 카드(공룡/곰인형/무지개/로켓) 추가
- 더 화사한 키즈 컬러 테마 적용
- 문제 수 확장: **총 240문제**(10 Grades × 24문제)
- 혼동쌍(최소대립쌍) 게임 추가: ㄹ↔ㄴ, ㅅ↔ㅍ, ㅈ↔ㅊ, ㄱ↔ㅋ, ㄷ↔ㅌ, ㅂ↔ㅍ
- Grade 잠금해제 구조: 80점 이상이면 다음 문제 해금, Grade 완료 시 다음 Grade 해금 + 스티커 보상
- 메인 메뉴 분리: `진도 나가기 / 학습현황 / 애니메이션 가이드 / 학부모 리포트`
- 첫 실행 시 아이 정보 입력(이름/나이) 저장
- 정답/오답 효과음 추가

## 1) 로컬에서 실행

```bash
cd <프로젝트_폴더>
npm install
npm run serve
```

기본적으로 8080을 먼저 시도하고, 사용 중이면 8081/8082/3000/5173 순서로 자동 선택합니다.
터미널에 출력된 `Available on:` 주소로 접속하세요.

### PowerShell에서 아래 로그가 나오면 정상입니다
`Available on: http://127.0.0.1:8080`가 보이면 서버 실행 성공입니다.

- 서버 종료: `Ctrl + C`
- 다음 명령(예: APK 빌드)은 **서버를 종료한 뒤** 같은 PowerShell 창에서 실행하세요.
- PowerShell에 ` ```bash ` 같은 마크다운 표시는 입력하지 마세요(명령어가 아닙니다).

### `EADDRINUSE: address already in use 0.0.0.0:8080` 오류가 나올 때
- 이미 다른 프로세스가 8080 포트를 사용 중이라는 뜻입니다.
- 지금은 `npm run serve`가 자동으로 다른 포트를 찾아 실행하도록 되어 있습니다.
- 꼭 8080을 써야 한다면 아래로 기존 프로세스를 종료하세요.

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID번호> /F
```

## 2) Android APK 만들기 (Windows 기준)

```powershell
npm install
npm run cap:prepare
npx cap add android
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

또는 아래 한 줄로 자동 진행:
```powershell
npm run apk:build:win
```
위 스크립트는 다음을 자동 수행합니다:
- `npm install`
- TypeScript 보정 설치(호환성 목적)
- Capacitor 웹 자산 준비(`www` 폴더 생성)
- `npx cap add android` (없을 때만)
- `npx cap sync android`
- `.\gradlew.bat assembleDebug`

또한 중간 단계 실패 시 즉시 종료하여 다음 단계로 잘못 진행하지 않습니다.

### Windows에서 자주 보이는 오류 빠른 해결
- `Could not find installation of TypeScript`  
  → 스크립트가 TypeScript 보정 설치를 자동으로 시도합니다.  
  네트워크 제한 등으로 실패하면 `npm install -D typescript`를 직접 1회 실행 후 재시도하세요.
- `\".\" is not a valid value for webDir`  
  → 현재 설정은 `webDir: \"www\"`이며, `npm run cap:prepare`가 `www`를 생성합니다.  
  수동 실행 시 `npm run cap:prepare`를 먼저 실행한 뒤 `npx cap add android`를 실행하세요.
  그래도 동일 오류면 이전 압축본의 `capacitor.config.ts`가 남아있을 수 있으니 파일을 삭제(또는 `.bak` 변경) 후 다시 시도하세요.
- PowerShell 파서 오류(문자 깨짐/문자열 종료 안 됨)  
  → `scripts/build_android_debug.ps1`를 ASCII 메시지로 정리해 인코딩 이슈를 줄였습니다.  
  기존 압축본을 재사용 중이라면 최신 파일로 덮어쓴 뒤 다시 실행하세요.
- `JAVA_HOME is not set and no 'java' command could be found`  
  → 스크립트가 Android Studio 기본 JBR 경로를 먼저 자동 탐지합니다.  
  그래도 실패하면 현재 쉘에 먼저 반영한 뒤 재시도하세요.
  ```powershell
  $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
  $env:Path="$env:JAVA_HOME\bin;$env:Path"
  ```
  이후 영구 저장:
  ```powershell
  setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
  ```
  그래도 `java -version`이 안 되면, 실제 java.exe 경로를 먼저 찾아서 지정하세요:
  ```powershell
  Get-ChildItem "C:\Program Files","$env:LOCALAPPDATA\Programs" -Filter java.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5 FullName
  ```
  위 명령 결과가 비어 있으면(아무것도 안 나오면) JDK 자체가 없는 상태입니다. `npm run apk:build:win`은 winget이 있으면 JDK 자동 설치를 시도합니다.
  별도 설치만 먼저 하고 싶다면 아래 자동 설치 스크립트를 사용하세요:
  ```powershell
  npm run jdk:install:win
  ```
  `Missing script: jdk:install:win`가 나오면 오래된 압축본입니다. 최신 코드로 갱신하거나 바로 아래 `winget` 명령을 사용하세요.
  JDK가 없으면 설치:
  ```powershell
  winget install -e --id EclipseAdoptium.Temurin.21.JDK
  ```
- `Your project path contains non-ASCII characters`  
  → Windows 한글 경로에서 나는 Gradle 경고입니다.  
  `apk:build:win` 스크립트는 `android/gradle.properties`에 `android.overridePathCheck=true`를 자동 추가합니다.
- `SDK location not found`  
  → Android SDK 경로를 찾지 못한 경우입니다.  
  `apk:build:win`은 `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `%LOCALAPPDATA%\\Android\\Sdk`를 순서대로 확인해 `android/local.properties`의 `sdk.dir`를 자동 생성합니다.  
  경로에 한글이 포함되면 `sdk.dir`에 8.3 short path(ASCII)를 자동 적용해 aapt2 인코딩 문제를 줄입니다.
  이 오류가 나오면 **Android SDK가 아직 설치되지 않았거나** 경로가 비어있는 상태입니다.
  자동 탐지 실패 시 아래를 실행하세요:
  ```powershell
  $env:ANDROID_HOME="$env:USERPROFILE\AppData\Local\Android\Sdk"
  setx ANDROID_HOME "$env:USERPROFILE\AppData\Local\Android\Sdk"
  ```
  SDK가 없다면 자동 설치 도우미:
  ```powershell
  npm run sdk:install:win
  ```
  Android Studio가 설치된 뒤에도 같은 오류가 나면, **Android Studio를 1회 실행해 초기 설정 마법사에서 SDK Platform/Build-Tools 설치를 완료**해야 합니다.

생성 위치:
- `android\app\build\outputs\apk\debug\app-debug.apk`

## 3) 구글 플레이스토어 등록용 AAB

```powershell
cd android
.\gradlew.bat bundleRelease
```

생성 위치:
- `android\app\build\outputs\bundle\release\app-release.aab`

## 녹음/인식이 안 될 때
1. Chrome/Edge 최신 버전 사용
2. 사이트 마이크 권한 허용
3. 인식 실패 시 `내 목소리 듣기`로 셀프 비교 연습

## 커리큘럼 설계 참고(조사 반영)
- 팬데믹 시기 아동 집단의 언어/의사소통 발달 지연 및 변동성 보고를 참고해 **짧고 반복적인 단계형 구조**로 문제를 확대했습니다.
- 상대적으로 늦게 안정되는 소리(마찰음/유음 계열) 관찰을 반영해 **ㅅ·ㄹ 중심 훈련 비중**을 늘렸습니다.
- 단일 반복보다 변별 연습이 가능한 **최소대립쌍 게임**을 별도 파트로 구성했습니다.

참고 링크:
- ASHA Speech Sound Development Milestones: https://www.asha.org/public/speech/development/speech-sound-development-chart/
- JAMA Network Open (pandemic cohort language/communication 영향 보고): https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2814200
- Communication Sciences & Disorders(국내 /ㅅ/ 계열 발달 연구): https://e-csd.org/upload/4_3.pdf
