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

Write-Host "Done. Open Android Studio with: npx cap open android" -ForegroundColor Green
