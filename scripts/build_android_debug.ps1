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

Write-Host "0) Current directory: $(Get-Location)"

if (-not (Test-Path "package.json")) {
  Write-Host "package.json not found. Move to project root and run again." -ForegroundColor Red
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
  Write-Host "2) Android folder not found. Creating Android platform..."
  Invoke-Step "npx cap add android" "Failed to add Android platform."
}
else {
  Write-Host "2) Android folder already exists. Skipping add step."
}

Write-Host "3) Sync Android platform"
Invoke-Step "npx cap sync android" "Failed to sync Android platform."

if (-not (Test-Path "android")) {
  Write-Host "Android folder is still missing after setup. Build stopped." -ForegroundColor Red
  exit 1
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  $studioJbr = "C:\\Program Files\\Android\\Android Studio\\jbr"
  if (Test-Path $studioJbr) {
    $env:JAVA_HOME = $studioJbr
    $env:Path = "$env:JAVA_HOME\\bin;$env:Path"
    Write-Host "JAVA_HOME auto-set from Android Studio: $env:JAVA_HOME"
  }
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  Write-Host "Java (JDK 17+) not found. Install Android Studio (with JDK) or set JAVA_HOME first." -ForegroundColor Red
  Write-Host "Example: setx JAVA_HOME \"C:\\Program Files\\Android\\Android Studio\\jbr\\\"" -ForegroundColor Yellow
  exit 1
}

Write-Host "4) Build Debug APK"
Push-Location android
Invoke-Step ".\gradlew.bat assembleDebug" "Gradle debug build failed."
Pop-Location

Write-Host "Done: android\\app\\build\\outputs\\apk\\debug\\app-debug.apk" -ForegroundColor Green
