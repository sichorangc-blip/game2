$ErrorActionPreference = "Stop"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not installed. Please install Node.js LTS first." -ForegroundColor Red
  exit 1
}

Write-Host "1) Install dependencies"
npm install

if (-not (Test-Path "android")) {
  Write-Host "2) Add Android platform (first time only)"
  npx cap add android
}
else {
  Write-Host "2) Android platform already exists. Skipping add step."
}

Write-Host "3) Sync Android platform"
npx cap sync android

Write-Host "Done. Open Android Studio with: npx cap open android" -ForegroundColor Green
