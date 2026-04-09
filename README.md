# 또박키즈 (TtoBak Kids)

어린 아이들이 한국어 발음을 재미있게 연습할 수 있도록 만든 웹앱입니다.
이 프로젝트는 **웹 실행**과 **Android APK/AAB 패키징(구글 플레이스토어 등록용)** 모두를 지원합니다.

## 1) 로컬에서 실행

```bash
cd <프로젝트_폴더>
npm install
npm run serve
```

브라우저에서 `http://localhost:8080` 접속.

### Windows PowerShell 예시

```powershell
cd "C:\Users\유정곤\Downloads\game2-codex-l2oamo\game2-codex-l2oamo"
npm install
npm run serve
```

## 2) 녹음이 안 될 때 체크

1. 브라우저는 **Chrome/Edge 최신 버전 권장**
2. 주소창 자물쇠/사이트 권한에서 마이크 허용
3. 다른 앱(줌/디스코드)이 마이크 독점 중인지 확인
4. 그래도 인식이 안 되면 `내 목소리 듣기` 버튼으로 셀프 비교 연습 가능

## 3) Android APK 만들기 (Windows 기준)

> 기존 실패 원인: PowerShell에서 `bash`, `./scripts/setup_android.sh`, `./gradlew`는 WSL/리눅스 쉘이 없으면 동작하지 않습니다.

### 3-1. Android 프로젝트 생성

```powershell
npm install
npx cap add android
npx cap sync android
```

또는 PowerShell 스크립트 사용:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup_android.ps1
```

성공 후 `android` 폴더가 생겨야 합니다.

### 3-2. APK 빌드

```powershell
cd android
.\gradlew.bat assembleDebug
```

생성 위치:
- `android\app\build\outputs\apk\debug\app-debug.apk`

## 4) 구글 플레이스토어 등록용 AAB (권장)

```powershell
cd android
.\gradlew.bat bundleRelease
```

생성 위치:
- `android\app\build\outputs\bundle\release\app-release.aab`

## 5) 이번 개선 사항

- 단계별 커리큘럼(기초 자음 → 단어 연결 → 이중받침)
- 게임 요소(점수/연속 성공)
- 발음 방법 가이드(입모양/혀 위치/단계별 설명)
- 다정한 코치 톤을 위한 음성 선택 + 속도 조절
- 음성 인식 실패 시에도 녹음 재생으로 연습 가능
