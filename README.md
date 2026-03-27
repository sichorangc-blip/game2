# Quant Tracker (수동 퀀트 투자 추적기)

직접 자동매매를 하지 않고,
- 매수 포지션 등록
- 매일 가격 마킹
- 익절(TP)/손절(SL) 자동 청산
- 누적 수익률(총자산 기준) 관리
를 할 수 있는 CLI 프로그램입니다.

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
