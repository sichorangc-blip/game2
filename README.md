# 샤이닝 프린세스: 레인보우 드래곤 어드벤처

코딩을 몰라도 바로 사용할 수 있는 **도트 픽셀 어드벤처 게임 + 관리자 툴**입니다.

## 먼저 한 줄 결론 (이번에 가장 중요)

`/workspace/game2`는 **제가 작업한 서버(개발 환경) 안의 경로**입니다.  
즉, 사용자님 PC(Windows PowerShell)에서는 기본적으로 존재하지 않아 정상입니다.

그래서 순서는 항상 아래 2단계입니다.

1. 게임 파일을 먼저 내 PC로 받기(zip 또는 git clone)
2. 내 PC에 생긴 `game2` 폴더에서 실행하기

---

## 1) 아직 파일을 안 받았다면

### 방법 A. ZIP 파일 받기 (추천)
- `game2.zip` 파일을 먼저 받습니다.
- 예: 다운로드 폴더에 `game2.zip` 저장
- 압축 풀기 후 `game2` 폴더가 생겼는지 확인

### 방법 B. Git으로 받기
```bash
git clone <저장소주소>
cd game2
```

> 저장소 주소를 아직 못 받았다면, 먼저 ZIP 파일 전달부터 받으시면 됩니다.

---

## 2) Windows에서 실행 (PowerShell 기준)

아래는 **내 PC에 압축을 푼 뒤** 실행하는 방법입니다.

1. 파일 탐색기에서 압축을 풀어 `game2` 폴더를 만듭니다.  
   (예: `C:\Users\사용자이름\Downloads\game2`)

2. PowerShell에서 해당 폴더로 이동:
```powershell
cd C:\Users\사용자이름\Downloads\game2
```

3. 실행:
```powershell
.\run.bat
```

4. 브라우저에서 접속:
```text
http://localhost:8080
```

---

## Mac/Linux 실행

```bash
cd /내가/압축푼/경로/game2
./run.sh
```

브라우저에서 `http://localhost:8080` 접속.

---

## 왜 이전 명령어가 실패했는가?

사용자님이 실행한 명령어:

```powershell
cd /workspace/game2
./make_zip.sh
```

이 명령은 **제 작업 서버 내부 경로에서 ZIP을 만들 때만** 맞는 명령입니다.  
Windows PC에서는 `/workspace/game2` 자체가 없으므로 실패합니다.

---

## 게임 규칙 (아이용 비폭력)

- 드래곤을 공격하지 않습니다.
- 드래곤이 나오면 **같은 색 하트(💖)** 를 고릅니다.
- 필요한 횟수만큼 맞추면 드래곤과 친구가 됩니다.
- 모든 드래곤과 친구가 되면 클리어입니다.

## 관리자 툴에서 할 수 있는 것

- 게임 제목, 캐릭터 이름, 배경 스토리 수정
- 드래곤 이름/색상/필요 진정 횟수 수정
- 배경 이미지 업로드 + 픽셀 느낌 미리보기
- 설정 JSON 내보내기/불러오기

## 앱으로 올리고 싶을 때 (나중에)

지금 만든 웹게임을 앱 껍데기로 감싸는 방식입니다(추천: Capacitor).

```bash
npm init -y
npm i @capacitor/core @capacitor/cli
npx cap init shining-princess com.example.shiningprincess
npm i @capacitor/android
npx cap add android
npx cap open android
```

(iOS는 Mac에서 `@capacitor/ios` 추가)
