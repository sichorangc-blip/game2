#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm이 설치되어 있지 않습니다. Node.js LTS를 먼저 설치하세요."
  exit 1
fi

echo "1) 의존성 설치"
npm install

echo "2) Android 프로젝트 생성 (최초 1회)"
npx cap add android

echo "3) 웹 자산 동기화"
npx cap sync android

echo "완료: Android Studio에서 프로젝트를 열어 APK/AAB를 빌드하세요."
