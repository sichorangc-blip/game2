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

$gradlePropsPath = "android\\gradle.properties"
if (Test-Path $gradlePropsPath) {
  $gradleProps = Get-Content $gradlePropsPath -Raw
  if ($gradleProps -notmatch "(?m)^android\\.overridePathCheck=true\\s*$") {
    Add-Content -Path $gradlePropsPath -Value "`nandroid.overridePathCheck=true"
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

$studioOptionDirs = Get-ChildItem "$env:APPDATA\\Google" -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "AndroidStudio*" }

foreach ($dir in $studioOptionDirs) {
  $xmlFiles = Get-ChildItem "$($dir.FullName)\\options\\*.xml" -File -ErrorAction SilentlyContinue
  foreach ($xml in $xmlFiles) {
    $matches = Select-String -Path $xml.FullName -Pattern 'android\.sdk\.path\" value=\"([^\"]+)\"' -AllMatches -ErrorAction SilentlyContinue
    foreach ($m in $matches) {
      foreach ($g in $m.Matches) {
        if ($g.Groups.Count -gt 1) {
          $sdkCandidates += $g.Groups[1].Value
        }
      }
    }
  }
}

$sdkCandidates = $sdkCandidates | Where-Object { $_ -and $_.Trim() -ne "" } | Select-Object -Unique

$resolvedSdkDir = $null
foreach ($sdkCandidate in $sdkCandidates) {
  if (Test-Path $sdkCandidate) {
    $resolvedSdkDir = $sdkCandidate
    break
  }
}

if (-not $resolvedSdkDir) {
  Write-Host "Android SDK not found." -ForegroundColor Red
  Write-Host "Checked SDK candidates:" -ForegroundColor Yellow
  $sdkCandidates | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
  Write-Host "Install Android Studio SDK or set ANDROID_HOME / ANDROID_SDK_ROOT." -ForegroundColor Yellow
  Write-Host "Example (current shell): `$env:ANDROID_HOME='$env:USERPROFILE\\AppData\\Local\\Android\\Sdk'" -ForegroundColor Yellow
  Write-Host "Example (persist): setx ANDROID_HOME \"$env:USERPROFILE\\AppData\\Local\\Android\\Sdk\"" -ForegroundColor Yellow
  Write-Host "Auto install helper: npm run sdk:install:win" -ForegroundColor Yellow
  exit 1
}

$localPropsPath = "android\\local.properties"
$escapedSdkDir = $resolvedSdkDir.Replace("\", "\\")
Set-Content -Path $localPropsPath -Value "sdk.dir=$escapedSdkDir"
Write-Host "Set Android SDK path in android/local.properties: $resolvedSdkDir"

$javaResolved = $false

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  $javaHomes = @(
    $env:JAVA_HOME,
    [Environment]::GetEnvironmentVariable("JAVA_HOME", "User"),
    [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine"),
    "C:\\Program Files\\Android\\Android Studio\\jbr",
    "C:\\Program Files\\Android\\Android Studio\\jre",
    "$env:LOCALAPPDATA\\Programs\\Android Studio\\jbr",
    "$env:LOCALAPPDATA\\Programs\\Android Studio\\jre"
  ) | Where-Object { $_ -and $_.Trim() -ne "" } | Select-Object -Unique

  $jdkRoots = @("$env:ProgramFiles\\Eclipse Adoptium", "$env:ProgramFiles\\Microsoft", "$env:ProgramFiles\\Java")
  foreach ($root in $jdkRoots) {
    if (Test-Path $root) {
      Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $javaHomes += $_.FullName
      }
    }
  }

  foreach ($javaHomeCandidate in $javaHomes) {
    $javaExe = Join-Path $javaHomeCandidate "bin\\java.exe"
    if (Test-Path $javaExe) {
      $env:JAVA_HOME = $javaHomeCandidate
      if (-not $env:Path.StartsWith("$javaHomeCandidate\\bin")) {
        $env:Path = "$javaHomeCandidate\\bin;$env:Path"
      }
      Write-Host "JAVA_HOME detected/set: $env:JAVA_HOME"
      $javaResolved = $true
      break
    }
  }
}
else {
  $javaResolved = $true
}

if (-not $javaResolved -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "Java not found. Trying automatic JDK install (Temurin 17) via winget..."
    winget install -e --id EclipseAdoptium.Temurin.17.JDK --accept-source-agreements --accept-package-agreements

    $retryHomes = @(
      [Environment]::GetEnvironmentVariable("JAVA_HOME", "User"),
      [Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine"),
      "C:\\Program Files\\Eclipse Adoptium\\jdk-17",
      "C:\\Program Files\\Eclipse Adoptium"
    ) | Where-Object { $_ -and $_.Trim() -ne "" } | Select-Object -Unique

    foreach ($retryJavaHome in $retryHomes) {
      if (Test-Path $retryJavaHome) {
        if ((Get-Item $retryJavaHome).PSIsContainer) {
          $javaExe = Get-ChildItem $retryJavaHome -Filter java.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
          if ($javaExe) {
            $resolvedHome = Split-Path (Split-Path $javaExe.FullName -Parent) -Parent
            $env:JAVA_HOME = $resolvedHome
            $env:Path = "$resolvedHome\\bin;$env:Path"
            setx JAVA_HOME "$resolvedHome" | Out-Null
            $javaResolved = $true
            Write-Host "JDK installed and JAVA_HOME set: $resolvedHome"
            break
          }
        }
      }
    }
  }
}

if (-not $javaResolved -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
  Write-Host "Java (JDK 17+) not found. Install Android Studio (with JDK) or set JAVA_HOME first." -ForegroundColor Red
  Write-Host "Current JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
  Write-Host "Checked common paths under Android Studio / Adoptium / Microsoft / Java folders." -ForegroundColor Yellow
  Write-Host "Example (current shell): `$env:JAVA_HOME='C:\\Program Files\\Android\\Android Studio\\jbr'; `$env:Path=`\"$env:JAVA_HOME\\bin;`$env:Path`\"" -ForegroundColor Yellow
  Write-Host "Example (persist): setx JAVA_HOME \"C:\\Program Files\\Android\\Android Studio\\jbr\"" -ForegroundColor Yellow
  Write-Host "Auto install helper: npm run jdk:install:win" -ForegroundColor Yellow
  Write-Host "If needed, install JDK 17 with: winget install -e --id EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Yellow
  exit 1
}

Write-Host "4) Build Debug APK"
Push-Location android
Invoke-Step ".\gradlew.bat assembleDebug" "Gradle debug build failed."
Pop-Location

Write-Host "Done: android\\app\\build\\outputs\\apk\\debug\\app-debug.apk" -ForegroundColor Green
