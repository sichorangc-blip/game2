# 아이셋 또박키즈 (ISET TtoBak Kids)

어린 아이들이 한국어 발음을 재미있게 연습할 수 있도록 만든 웹앱입니다.
이 프로젝트는 **웹 실행**과 **Android APK/AAB 패키징(구글 플레이스토어 등록용)** 모두를 지원합니다.

## 핵심 개선
- 브랜드명 변경: **아이셋 또박키즈**
- 입모양 애니메이션 추가 (ㄹ/ㄴ/ㅅ/ㅍ/이중받침 모드)
- 이미지/스티커 스타일 카드(공룡/곰인형/무지개/로켓) 추가
- 더 화사한 키즈 컬러 테마 적용
- 문제 수 확장: **총 32문제**(파트당 8문제)
- 혼동쌍(최소대립쌍) 게임 추가: ㄹ↔ㄴ, ㅅ↔ㅍ, ㅈ↔ㅊ, ㄱ↔ㅋ, ㄷ↔ㅌ, ㅂ↔ㅍ

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

## 커리큘럼 설계 참고(조사 반영)
- 팬데믹 시기 아동 집단의 언어/의사소통 발달 지연 및 변동성 보고를 참고해 **짧고 반복적인 단계형 구조**로 문제를 확대했습니다.
- 상대적으로 늦게 안정되는 소리(마찰음/유음 계열) 관찰을 반영해 **ㅅ·ㄹ 중심 훈련 비중**을 늘렸습니다.
- 단일 반복보다 변별 연습이 가능한 **최소대립쌍 게임**을 별도 파트로 구성했습니다.

참고 링크:
- ASHA Speech Sound Development Milestones: https://www.asha.org/public/speech/development/speech-sound-development-chart/
- JAMA Network Open (pandemic cohort language/communication 영향 보고): https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2814200
- Communication Sciences & Disorders(국내 /ㅅ/ 계열 발달 연구): https://e-csd.org/upload/4_3.pdf
