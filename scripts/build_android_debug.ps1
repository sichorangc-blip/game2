$ErrorActionPreference = "Stop"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm이 설치되어 있지 않습니다. Node.js LTS를 먼저 설치하세요." -ForegroundColor Red
  exit 1
}

Write-Host "0) 현재 경로 확인: $(Get-Location)"

if (-not (Test-Path "package.json")) {
  Write-Host "현재 폴더에 package.json이 없습니다. 프로젝트 루트로 이동해서 다시 실행하세요." -ForegroundColor Red
  exit 1
}

Write-Host "1) 의존성 설치"
npm install

if (-not (Test-Path "android")) {
  Write-Host "2) Android 폴더가 없어 자동으로 생성합니다."
  npx cap add android
}
else {
  Write-Host "2) Android 폴더 확인 완료"
}

Write-Host "3) Android 동기화"
npx cap sync android

Write-Host "4) Debug APK 빌드"
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

Write-Host "완료: android\\app\\build\\outputs\\apk\\debug\\app-debug.apk" -ForegroundColor Green
