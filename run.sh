#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "[샤이닝 프린세스] 로컬 서버를 시작합니다..."
echo "브라우저에서 아래 주소를 열어주세요:"
echo "http://localhost:8080"
echo "종료하려면 터미널에서 Ctrl + C"

python3 -m http.server 8080
