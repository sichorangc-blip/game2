# Quant Tracker (수동 퀀트 투자 추적기)


## 진짜 쉬운 실행 방법 (명령어 몰라도 됨)

### 방법 1) 주소 입력해서 쓰기 (추천)

1. 파일 탐색기에서 프로젝트 폴더를 엽니다.
2. `start_web_tracker.sh`(리눅스/맥) 또는 `start_web_tracker.bat`(윈도우)를 실행합니다.
3. 브라우저 주소창에 아래 주소를 입력합니다.

```text
http://127.0.0.1:8501
```

그러면 웹 화면에서 버튼/입력칸으로 매수/마킹/청산/현황 확인을 할 수 있습니다.

### 방법 2) 터미널에서 직접 실행

아래 명령은 **터미널(명령 프롬프트)** 에 입력해야 합니다.

```bash
python3 quant_tracker.py --help
```

직접 자동매매를 하지 않고,
- 매수 포지션 등록
- 매일 가격 마킹
- 익절(TP)/손절(SL) 자동 청산
- 누적 수익률(총자산 기준) 관리
를 할 수 있는 CLI 프로그램입니다.


## 0) 정말 빠르게 실행해보기 (처음 사용자용)

### A. 파이썬 버전 확인

```bash
python3 --version
```

### B. 도움말 보기

```bash
python3 quant_tracker.py --help
```

### C. 예제 한 번에 실행

```bash
./run_example.sh
```

> 위 스크립트는 `tracker_data.json`을 초기화(`--force`)하므로 기존 기록이 있으면 덮어씁니다.

---
## 1) 시작

```bash
python3 quant_tracker.py init --initial-capital 10000000
```

기본 저장 파일은 `tracker_data.json` 입니다.

## 2) 종목 등록(가상 매수)

```bash
python3 quant_tracker.py buy AAPL --price 180 --qty 10 --tp 8 --sl 4
python3 quant_tracker.py buy MSFT --price 420 --qty 5 --tp 6 --sl 3
```

- `--tp 8` => +8% 수익 도달 시 자동 청산
- `--sl 4` => -4% 손실 도달 시 자동 청산

## 3) 매일 가격 입력(트래킹)

단일 종목:

```bash
python3 quant_tracker.py mark AAPL --price 189
```

여러 종목 한번에:

```bash
python3 quant_tracker.py mark-all --prices "AAPL=189,MSFT=408"
```

가격 입력 시 열린 포지션의 수익률을 계산하고,
TP/SL 조건 만족 시 자동으로 청산됩니다.

## 4) 현황 확인

```bash
python3 quant_tracker.py status
```

출력 정보:
- 초기자본
- 현금
- 오픈 포지션 평가금액
- 총자산(Equity)
- 실현손익
- 누적 수익률
- 현재 열린 포지션 목록

## 5) 수동 청산

```bash
python3 quant_tracker.py close 1 --price 192 --reason "event risk"
```

## 운영 팁

- 매일 장 마감 후 `mark-all`로 종가 업데이트
- TP/SL은 전략별로 다르게 설정
- `tracker_data.json` 파일을 백업해두면 기록 관리에 유리
