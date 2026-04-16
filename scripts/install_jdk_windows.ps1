$ErrorActionPreference = "Stop"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget not found. Install App Installer from Microsoft Store first." -ForegroundColor Red
  exit 1
}

Write-Host "Installing Temurin JDK 21 via winget..."
winget install -e --id EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements

$candidates = Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending

$javaHome = $null
foreach ($dir in $candidates) {
  $javaExe = Join-Path $dir.FullName "bin\java.exe"
  if (Test-Path $javaExe) {
    $javaHome = $dir.FullName
    break
  }
}

if (-not $javaHome) {
  Write-Host "JDK installed but java.exe path was not found automatically. Please set JAVA_HOME manually." -ForegroundColor Yellow
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
setx JAVA_HOME "$javaHome" | Out-Null

Write-Host "JAVA_HOME set to: $javaHome" -ForegroundColor Green
Write-Host "Open a NEW PowerShell window, then run: java -version" -ForegroundColor Green
