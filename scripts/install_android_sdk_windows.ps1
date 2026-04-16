$ErrorActionPreference = "Stop"

$sdkDir = "$env:USERPROFILE\AppData\Local\Android\Sdk"

if (Test-Path $sdkDir) {
  $env:ANDROID_HOME = $sdkDir
  $env:ANDROID_SDK_ROOT = $sdkDir
  setx ANDROID_HOME "$sdkDir" | Out-Null
  setx ANDROID_SDK_ROOT "$sdkDir" | Out-Null
  Write-Host "Android SDK detected and environment variables set: $sdkDir" -ForegroundColor Green
  exit 0
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget not found. Install Android Studio manually, then set ANDROID_HOME to:" -ForegroundColor Red
  Write-Host $sdkDir -ForegroundColor Yellow
  exit 1
}

Write-Host "Android SDK folder not found. Installing Android Studio via winget..."
winget install -e --id Google.AndroidStudio --accept-source-agreements --accept-package-agreements

Write-Host "Android Studio installed. Open Android Studio once and install SDK components from SDK Manager." -ForegroundColor Yellow
Write-Host "Expected SDK path: $sdkDir" -ForegroundColor Yellow
Write-Host "Then run this script again to set ANDROID_HOME automatically." -ForegroundColor Yellow
