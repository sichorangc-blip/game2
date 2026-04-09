# 아이셋 또박키즈 (ISET TtoBak Kids)

어린 아이들이 한국어 발음을 재미있게 연습할 수 있도록 만든 웹앱입니다.
이 프로젝트는 **웹 실행**과 **Android APK/AAB 패키징(구글 플레이스토어 등록용)** 모두를 지원합니다.

## 핵심 개선
- 브랜드명 변경: **아이셋 또박키즈**
- 입모양 애니메이션 추가 (ㄹ/ㄴ/ㅅ/ㅍ/이중받침 모드)
- 이미지/스티커 스타일 카드(공룡/곰인형/무지개/로켓) 추가
- 더 화사한 키즈 컬러 테마 적용

## 1) 로컬에서 실행

```bash
cd <프로젝트_폴더>
npm install
npm run serve
```

브라우저에서 `http://localhost:8080` 접속.

### PowerShell에서 아래 로그가 나오면 정상입니다
`Available on: http://127.0.0.1:8080`가 보이면 서버 실행 성공입니다.

- 서버 종료: `Ctrl + C`
- 다음 명령(예: APK 빌드)은 **서버를 종료한 뒤** 같은 PowerShell 창에서 실행하세요.
- PowerShell에 ` ```bash ` 같은 마크다운 표시는 입력하지 마세요(명령어가 아닙니다).

## 2) Android APK 만들기 (Windows 기준)

```powershell
npm install
npx cap add android
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

또는 아래 한 줄로 자동 진행:
```powershell
npm run apk:build:win
```

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
