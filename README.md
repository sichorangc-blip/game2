# Quant Tracker (추천 종목 발굴 + 선택 후 수익률 트래킹)

요청하신 흐름에 맞춘 프로그램입니다.

1. 매일 퀀트 조건으로 **추천 종목 발굴** (`screen`)
2. 사용자가 추천 종목 중 일부를 **선택** (`select`)
3. 선택된 종목만 TP/SL 규칙으로 **수익률 트래킹/매니징** (`mark-all`, `status`)

---

## 1) 가장 쉬운 실행 (웹 화면)

- Windows: `start_web_tracker.bat` 더블클릭
- macOS/Linux: `start_web_tracker.sh` 실행
- 브라우저 주소: `http://127.0.0.1:8501`

웹 화면에서
- `1) 일일 추천 종목 발굴(screen)`
- `2) 추천 종목 선택(select)`
- `3) 가격 마킹`
- `4) 수동 청산`
순으로 사용하면 됩니다.

---

## 2) CLI로 쓰는 방법

### 2-1. 초기화

```bash
python3 quant_tracker.py init --initial-capital 10000000 --force
```

### 2-2. 매일 추천 종목 발굴

```bash
python3 quant_tracker.py screen --source-csv sample_factors.csv --asof 2026-03-27 --top-n 5
python3 quant_tracker.py reco --asof 2026-03-27
```

### 2-3. 추천 종목 중 선택해서 트래킹 시작

```bash
python3 quant_tracker.py select --asof 2026-03-27 --tickers AAPL,MSFT --budget-per-stock 1000000 --tp 8 --sl 4
```

### 2-4. 매일 가격 업데이트(트래킹)

```bash
python3 quant_tracker.py mark-all --prices "AAPL=191,MSFT=417"
python3 quant_tracker.py status
```

---

## 3) 스크리닝 입력 CSV 형식

파일에는 아래 컬럼이 **반드시** 있어야 합니다.

- `ticker`
- `close`
- `ret_20d`
- `ret_60d`
- `vol20`
- `pe`
- `roe`

예시 (`sample_factors.csv`):

```csv
ticker,close,ret_20d,ret_60d,vol20,pe,roe
AAPL,187.2,5.1,12.4,1200000,24.3,18.2
MSFT,421.5,4.8,10.9,900000,30.1,21.0
NVDA,980.0,8.7,20.2,1800000,35.0,32.0
GOOGL,168.3,3.5,8.1,700000,22.4,15.4
AMZN,192.0,4.1,9.3,1100000,27.5,17.0
```

> `screen`은 기본적으로 거래대금/밸류/수익성 조건을 필터하고,
> 점수(score) 기준 상위 종목을 추천합니다.

---

## 4) 실행 파일이 하나만 보일 때

폴더에 `.gitkeep`만 보이면 실제 프로그램 파일이 아직 없는 상태입니다.

- 저장소에서 `Code → Download ZIP`
- 압축 해제 후 아래 파일 확인
  - `quant_tracker.py`
  - `web_tracker.py`
  - `start_web_tracker.bat` / `start_web_tracker.sh`

