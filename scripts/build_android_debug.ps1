$ErrorActionPreference = "Stop"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not installed. Please install Node.js LTS first." -ForegroundColor Red
  exit 1
}

Write-Host "0) Current directory: $(Get-Location)"

if (-not (Test-Path "package.json")) {
  Write-Host "package.json not found. Move to project root and run again." -ForegroundColor Red
  exit 1
}

Write-Host "1) Install dependencies"
npm install

if (-not (Test-Path "android")) {
  Write-Host "2) Android folder not found. Creating Android platform..."
  npx cap add android
}
else {
  Write-Host "2) Android folder already exists. Skipping add step."
}

Write-Host "3) Sync Android platform"
npx cap sync android

Write-Host "4) Build Debug APK"
Push-Location android
.\gradlew.bat assembleDebug
Pop-Location

Write-Host "Done: android\\app\\build\\outputs\\apk\\debug\\app-debug.apk" -ForegroundColor Green
