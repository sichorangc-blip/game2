$ErrorActionPreference = "Stop"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm이 설치되어 있지 않습니다. Node.js LTS를 먼저 설치하세요." -ForegroundColor Red
  exit 1
}

Write-Host "1) 의존성 설치"
npm install

if (-not (Test-Path "android")) {
  Write-Host "2) Android 프로젝트 생성 (최초 1회)"
  npx cap add android
}
else {
  Write-Host "2) Android 프로젝트가 이미 존재합니다. 생성 단계 생략"
}

Write-Host "3) Android 동기화"
npx cap sync android

Write-Host "완료: Android Studio에서 열기 => npx cap open android" -ForegroundColor Green
