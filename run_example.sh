#!/usr/bin/env bash
set -euo pipefail

# 빠른 실행 데모 스크립트
# 사용법: ./run_example.sh

python3 quant_tracker.py init --initial-capital 1000000 --force
python3 quant_tracker.py buy AAPL --price 100 --qty 10 --tp 5 --sl 3
python3 quant_tracker.py buy MSFT --price 200 --qty 5 --tp 7 --sl 4
python3 quant_tracker.py mark-all --prices "AAPL=104,MSFT=190"
python3 quant_tracker.py status

echo
echo "완료: tracker_data.json 파일에 결과가 저장되었습니다."
