#!/usr/bin/env bash
set -euo pipefail

# 추천 발굴 -> 선택 -> 트래킹 데모
python3 quant_tracker.py init --initial-capital 5000000 --force
python3 quant_tracker.py screen --source-csv sample_factors.csv --asof 2026-03-27 --top-n 3
python3 quant_tracker.py reco --asof 2026-03-27
python3 quant_tracker.py select --asof 2026-03-27 --tickers AAPL,META --budget-per-stock 1000000 --tp 8 --sl 4
python3 quant_tracker.py mark-all --prices "AAPL=193,META=495"
python3 quant_tracker.py status
