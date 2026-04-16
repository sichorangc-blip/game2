$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Command,
    [string]$FailMessage
  )

  Write-Host ">> $Command"
  Invoke-Expression $Command
  if ($LASTEXITCODE -ne 0) {
    Write-Host $FailMessage -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not installed. Please install Node.js LTS first." -ForegroundColor Red
  exit 1
}

if (Test-Path "capacitor.config.ts") {
  Write-Host "Found legacy capacitor.config.ts. Renaming to avoid config conflicts..."
  Rename-Item "capacitor.config.ts" "capacitor.config.ts.bak" -Force
}

Write-Host "1) Install dependencies"
Invoke-Step "npm install" "npm install failed."

Write-Host "1-1) Ensure TypeScript exists for Capacitor compatibility"
Invoke-Step "npm install -D typescript --no-save" "TypeScript install failed."

Write-Host "1-2) Prepare web assets for Capacitor (www)"
Invoke-Step "npm run cap:prepare" "Failed to prepare web assets."

if (-not (Test-Path "android")) {
  Write-Host "2) Add Android platform (first time only)"
  Invoke-Step "npx cap add android" "Failed to add Android platform."
}
else {
  Write-Host "2) Android platform already exists. Skipping add step."
}

Write-Host "3) Sync Android platform"
Invoke-Step "npx cap sync android" "Failed to sync Android platform."

if (Test-Path "android\\gradle.properties") {
  $props = Get-Content "android\\gradle.properties" -Raw
  if ($props -notmatch "(?m)^android\\.overridePathCheck=true\\s*$") {
    Add-Content -Path "android\\gradle.properties" -Value "`nandroid.overridePathCheck=true"
    Write-Host "Added android.overridePathCheck=true to android/gradle.properties"
  }
}

$sdkCandidates = @(
  $env:ANDROID_HOME,
  $env:ANDROID_SDK_ROOT,
  "$env:LOCALAPPDATA\\Android\\Sdk",
  "$env:USERPROFILE\\AppData\\Local\\Android\\Sdk",
  "C:\\Android\\Sdk"
) | Where-Object { $_ -and $_.Trim() -ne "" } | Select-Object -Unique

$resolvedSdkDir = $null
foreach ($sdkCandidate in $sdkCandidates) {
  if (Test-Path $sdkCandidate) {
    $resolvedSdkDir = $sdkCandidate
    break
  }
}

if ($resolvedSdkDir) {
  $escapedSdkDir = $resolvedSdkDir.Replace("\", "\\")
  Set-Content -Path "android\\local.properties" -Value "sdk.dir=$escapedSdkDir"
  Write-Host "Set Android SDK path in android/local.properties: $resolvedSdkDir"
}
else {
  Write-Host "Android SDK path not found automatically. Set ANDROID_HOME or ANDROID_SDK_ROOT." -ForegroundColor Yellow
}

Write-Host "Done. Open Android Studio with: npx cap open android" -ForegroundColor Green
