#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="/workspace/game2"
OUT_ZIP="/workspace/game2.zip"

if [ ! -d "$SRC_DIR" ]; then
  echo "오류: $SRC_DIR 폴더를 찾을 수 없습니다."
  exit 1
fi

rm -f "$OUT_ZIP"
cd /workspace
zip -r game2.zip game2 >/dev/null

echo "완료: $OUT_ZIP 파일이 생성되었습니다."
echo "이 zip 파일을 다운로드해서 압축을 풀면 됩니다."
