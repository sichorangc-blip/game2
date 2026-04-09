#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm이 설치되어 있지 않습니다. Node.js LTS를 먼저 설치하세요."
  exit 1
fi

if [ -f "capacitor.config.ts" ]; then
  echo "legacy capacitor.config.ts 발견: 설정 충돌 방지를 위해 .bak으로 변경"
  mv -f capacitor.config.ts capacitor.config.ts.bak
fi

echo "1) 의존성 설치"
npm install

echo "1-1) Capacitor용 웹 자산 준비(www)"
npm run cap:prepare

if [ ! -d "android" ]; then
  echo "2) Android 프로젝트 생성 (최초 1회)"
  npx cap add android
else
  echo "2) Android 프로젝트가 이미 존재합니다. 생성 단계 생략"
fi

echo "3) 웹 자산 동기화"
npx cap sync android

echo "완료: Android Studio에서 프로젝트를 열어 APK/AAB를 빌드하세요."
