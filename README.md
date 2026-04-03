# 또박키즈 (TtoBak Kids)

어린 아이들이 한국어 발음을 재미있게 연습할 수 있도록 만든 웹앱입니다.
이 프로젝트는 **웹 실행**과 **Android APK/AAB 패키징(구글 플레이스토어 등록용)** 모두를 지원합니다.

## 1) 로컬에서 바로 실행 (웹)

### 가장 쉬운 방법 (Windows / macOS / Linux 공통)

```bash
npm install
npm run serve
```

브라우저에서 `http://localhost:8080` 접속 후 사용하세요.

### Windows PowerShell에서 Python으로 실행하고 싶다면

```powershell
python -m http.server 8080
```

> `python3`는 PowerShell 기본 환경에서 없을 수 있습니다.
> `bash python3 ...` 형태는 WSL이 필요하므로, WSL이 없다면 위 `python` 또는 `npm run serve`를 사용하세요.

---

## 2) 모바일 앱(Android)으로 만들기

이 프로젝트는 Capacitor를 사용해 웹 코드를 Android 앱으로 패키징합니다.

### 준비물
- Node.js LTS
- Android Studio (SDK/Build-Tools 포함)
- Java 17

### 최초 1회 설정

```bash
npm install
npx cap add android
npx cap sync android
```

또는 아래 스크립트 한 번으로 진행할 수 있습니다.

```bash
./scripts/setup_android.sh
```

### Android Studio 열기

```bash
npx cap open android
```

---

## 3) APK 파일 만들기 (테스트 배포용)

```bash
cd android
./gradlew assembleDebug
```

생성 위치:
- `android/app/build/outputs/apk/debug/app-debug.apk`

> 실사용 배포/스토어 업로드에는 보통 debug APK 대신 **release 서명 APK 또는 AAB**를 사용합니다.

---

## 4) 구글 플레이스토어 등록용 파일 만들기 (권장: AAB)

```bash
cd android
./gradlew bundleRelease
```

생성 위치:
- `android/app/build/outputs/bundle/release/app-release.aab`

### 등록 시 체크 포인트
1. 앱 서명 키스토어 생성/설정
2. `versionCode`, `versionName` 관리
3. 앱 아이콘/스플래시/스크린샷 준비
4. 개인정보처리방침 URL 준비 (마이크 권한 사용)
5. Play Console에서 내부 테스트 트랙 업로드 후 검증

---

## 기능 요약
- 오늘의 미션 문장 랜덤 선택
- 문장 듣기(TTS)
- 마이크 녹음 + 브라우저 음성 인식(ko-KR)
- 목표 문장과 인식 문장 유사도 기반 점수화
- 학부모용 연습 히스토리 표시

## 참고
- 음성 인식 정확도는 브라우저 엔진/기기 마이크 품질에 따라 달라집니다.
- 점수는 Levenshtein 거리 기반의 간단한 예시 모델입니다.
