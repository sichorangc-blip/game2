#!/usr/bin/env python3
"""
Quant Investment Tracker
- Daily screening (조건 기반 추천 종목 발굴)
- User selection of recommended stocks
- TP/SL-based tracking and cumulative return management
"""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_DB_PATH = Path("tracker_data.json")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def today_str() -> str:
    return datetime.now(timezone.utc).date().isoformat()


@dataclass
class Position:
    id: int
    ticker: str
    entry_price: float
    quantity: float
    tp_pct: float
    sl_pct: float
    entry_time: str
    source: str = "manual"
    status: str = "open"
    last_price: float | None = None
    last_mark_time: str | None = None
    exit_price: float | None = None
    exit_time: str | None = None
    exit_reason: str | None = None


def default_state(initial_capital: float = 10_000_000.0) -> dict[str, Any]:
    return {
        "meta": {
            "created_at": now_iso(),
            "updated_at": now_iso(),
            "version": 2,
        },
        "account": {
            "initial_capital": initial_capital,
            "cash": initial_capital,
            "realized_pnl": 0.0,
        },
        "positions": [],
        "recommendations": [],
        "next_position_id": 1,
        "logs": [],
    }


def _ensure_compatibility(state: dict[str, Any]) -> dict[str, Any]:
    state.setdefault("recommendations", [])
    state.setdefault("positions", [])
    state.setdefault("logs", [])
    state.setdefault("next_position_id", 1)
    state.setdefault("meta", {"created_at": now_iso(), "updated_at": now_iso(), "version": 2})
    state.setdefault("account", {"initial_capital": 0.0, "cash": 0.0, "realized_pnl": 0.0})
    return state


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        state = default_state()
        save_state(path, state)
        return state
    raw = json.loads(path.read_text(encoding="utf-8"))
    return _ensure_compatibility(raw)


def save_state(path: Path, state: dict[str, Any]) -> None:
    state["meta"]["updated_at"] = now_iso()
    path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def position_from_dict(raw: dict[str, Any]) -> Position:
    return Position(**raw)


def to_dict(position: Position) -> dict[str, Any]:
    return asdict(position)


def parse_prices_arg(prices_arg: str) -> dict[str, float]:
    result: dict[str, float] = {}
    if not prices_arg.strip():
        return result
    for item in prices_arg.split(","):
        if "=" not in item:
            raise ValueError(f"잘못된 가격 형식: {item}. 예) AAPL=187.1")
        ticker, price_str = item.split("=", 1)
        result[ticker.strip().upper()] = float(price_str)
    return result


def calc_return_pct(entry_price: float, current_price: float) -> float:
    return ((current_price / entry_price) - 1.0) * 100.0


def parse_float(row: dict[str, str], key: str, default: float = 0.0) -> float:
    try:
        return float(row.get(key, "") or default)
    except ValueError:
        return default


def run_screening(
    source_csv: Path,
    min_vol20: float,
    max_pe: float,
    min_roe: float,
    top_n: int,
) -> list[dict[str, Any]]:
    if not source_csv.exists():
        raise FileNotFoundError(f"CSV 파일을 찾을 수 없습니다: {source_csv}")

    candidates: list[dict[str, Any]] = []
    with source_csv.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = {"ticker", "close", "ret_20d", "ret_60d", "vol20", "pe", "roe"}
        if not required.issubset(set(reader.fieldnames or [])):
            missing = sorted(required - set(reader.fieldnames or []))
            raise ValueError(f"CSV 컬럼 누락: {', '.join(missing)}")

        for row in reader:
            ticker = (row.get("ticker") or "").strip().upper()
            if not ticker:
                continue
            close = parse_float(row, "close")
            ret20 = parse_float(row, "ret_20d")
            ret60 = parse_float(row, "ret_60d")
            vol20 = parse_float(row, "vol20")
            pe = parse_float(row, "pe")
            roe = parse_float(row, "roe")

            if vol20 < min_vol20:
                continue
            if pe > max_pe:
                continue
            if roe < min_roe:
                continue

            # 단순 예시 점수식 (필요 시 전략에 맞게 조정 가능)
            score = (ret20 * 0.45) + (ret60 * 0.35) + (roe * 0.25) - (pe * 0.10)
            candidates.append(
                {
                    "ticker": ticker,
                    "close": close,
                    "ret_20d": ret20,
                    "ret_60d": ret60,
                    "vol20": vol20,
                    "pe": pe,
                    "roe": roe,
                    "score": score,
                }
            )

    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:top_n]


def save_recommendations(
    state: dict[str, Any],
    asof: str,
    results: list[dict[str, Any]],
    criteria: dict[str, Any],
) -> None:
    state["recommendations"] = [r for r in state["recommendations"] if r.get("asof") != asof]
    for rank, item in enumerate(results, start=1):
        state["recommendations"].append(
            {
                "asof": asof,
                "rank": rank,
                "ticker": item["ticker"],
                "close": item["close"],
                "score": item["score"],
                "ret_20d": item["ret_20d"],
                "ret_60d": item["ret_60d"],
                "vol20": item["vol20"],
                "pe": item["pe"],
                "roe": item["roe"],
                "selected": False,
                "selected_at": None,
                "criteria": criteria,
            }
        )


def close_position(state: dict[str, Any], pos: Position, price: float, reason: str) -> None:
    pos.status = "closed"
    pos.exit_price = price
    pos.exit_time = now_iso()
    pos.exit_reason = reason

    pnl = (price - pos.entry_price) * pos.quantity
    state["account"]["realized_pnl"] += pnl
    state["account"]["cash"] += price * pos.quantity

    state["logs"].append(
        {
            "time": now_iso(),
            "type": "close",
            "position_id": pos.id,
            "ticker": pos.ticker,
            "price": price,
            "reason": reason,
            "pnl": pnl,
        }
    )


def mark_price(state: dict[str, Any], ticker: str, price: float) -> list[str]:
    ticker = ticker.upper()
    messages: list[str] = []
    for idx, raw in enumerate(state["positions"]):
        pos = position_from_dict(raw)
        if pos.status != "open" or pos.ticker != ticker:
            continue

        pos.last_price = price
        pos.last_mark_time = now_iso()
        ret = calc_return_pct(pos.entry_price, price)

        if ret >= pos.tp_pct:
            close_position(state, pos, price, f"TP {pos.tp_pct:.2f}% 도달")
            messages.append(f"[청산] #{pos.id} {ticker} 익절: 수익률 {ret:.2f}%")
        elif ret <= -abs(pos.sl_pct):
            close_position(state, pos, price, f"SL -{abs(pos.sl_pct):.2f}% 도달")
            messages.append(f"[청산] #{pos.id} {ticker} 손절: 수익률 {ret:.2f}%")
        else:
            messages.append(f"[유지] #{pos.id} {ticker} 현재 수익률 {ret:.2f}%")

        state["positions"][idx] = to_dict(pos)

    if not messages:
        messages.append(f"열린 포지션 없음: {ticker}")
    return messages


def account_summary(state: dict[str, Any]) -> dict[str, float]:
    cash = state["account"]["cash"]
    realized = state["account"]["realized_pnl"]
    initial = state["account"]["initial_capital"]

    market_value = 0.0
    for raw in state["positions"]:
        pos = position_from_dict(raw)
        if pos.status == "open" and pos.last_price is not None:
            market_value += pos.last_price * pos.quantity

    equity = cash + market_value
    cumulative_return_pct = ((equity / initial) - 1.0) * 100.0 if initial else 0.0
    return {
        "initial_capital": initial,
        "cash": cash,
        "market_value": market_value,
        "equity": equity,
        "realized_pnl": realized,
        "cumulative_return_pct": cumulative_return_pct,
    }


def create_position(
    state: dict[str, Any],
    ticker: str,
    entry_price: float,
    budget: float,
    tp: float,
    sl: float,
    source: str,
) -> Position:
    qty = budget / entry_price
    cost = entry_price * qty
    if state["account"]["cash"] < cost:
        raise ValueError(f"현금 부족: {ticker} 필요 {cost:,.2f}, 보유 {state['account']['cash']:,.2f}")

    pos = Position(
        id=state["next_position_id"],
        ticker=ticker,
        entry_price=entry_price,
        quantity=qty,
        tp_pct=tp,
        sl_pct=abs(sl),
        entry_time=now_iso(),
        source=source,
        last_price=entry_price,
        last_mark_time=now_iso(),
    )

    state["next_position_id"] += 1
    state["positions"].append(to_dict(pos))
    state["account"]["cash"] -= cost
    state["logs"].append(
        {
            "time": now_iso(),
            "type": "buy",
            "position_id": pos.id,
            "ticker": ticker,
            "price": entry_price,
            "quantity": qty,
            "tp_pct": tp,
            "sl_pct": abs(sl),
            "cost": cost,
            "source": source,
        }
    )
    return pos


def cmd_init(args: argparse.Namespace) -> None:
    path = Path(args.db)
    if path.exists() and not args.force:
        raise SystemExit(f"이미 DB 파일이 존재합니다: {path} (덮어쓰려면 --force)")
    state = default_state(initial_capital=args.initial_capital)
    save_state(path, state)
    print(f"초기화 완료: {path} (초기자본 {args.initial_capital:,.0f})")


def cmd_screen(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    asof = args.asof or today_str()
    results = run_screening(
        source_csv=Path(args.source_csv),
        min_vol20=args.min_vol20,
        max_pe=args.max_pe,
        min_roe=args.min_roe,
        top_n=args.top_n,
    )
    criteria = {
        "min_vol20": args.min_vol20,
        "max_pe": args.max_pe,
        "min_roe": args.min_roe,
        "top_n": args.top_n,
        "source_csv": args.source_csv,
    }
    save_recommendations(state, asof, results, criteria)
    state["logs"].append(
        {
            "time": now_iso(),
            "type": "screen",
            "asof": asof,
            "count": len(results),
            "criteria": criteria,
        }
    )
    save_state(path, state)

    print(f"[{asof}] 추천 종목 {len(results)}개")
    for item in state["recommendations"]:
        if item["asof"] == asof:
            print(
                f"#{item['rank']} {item['ticker']} score={item['score']:.2f} "
                f"close={item['close']:.2f} ret20={item['ret_20d']:.2f} ret60={item['ret_60d']:.2f}"
            )


def cmd_reco(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)
    asof = args.asof or today_str()
    rows = [r for r in state["recommendations"] if r["asof"] == asof]
    if not rows:
        print(f"[{asof}] 추천 종목 없음")
        return

    rows.sort(key=lambda x: x["rank"])
    print(f"[{asof}] 추천 종목 {len(rows)}개")
    for r in rows:
        flag = "선택완료" if r.get("selected") else "미선택"
        print(f"#{r['rank']} {r['ticker']} score={r['score']:.2f} ({flag})")


def cmd_select(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)
    asof = args.asof or today_str()

    tickers = [t.strip().upper() for t in args.tickers.split(",") if t.strip()]
    if not tickers:
        raise SystemExit("선택할 티커가 없습니다.")

    price_map = parse_prices_arg(args.prices)

    rec_map = {
        r["ticker"]: r
        for r in state["recommendations"]
        if r["asof"] == asof
    }

    created: list[Position] = []
    for ticker in tickers:
        if ticker not in rec_map:
            raise SystemExit(f"{ticker}는 {asof} 추천 종목에 없습니다.")

        entry_price = price_map.get(ticker, rec_map[ticker]["close"])
        pos = create_position(
            state=state,
            ticker=ticker,
            entry_price=entry_price,
            budget=args.budget_per_stock,
            tp=args.tp,
            sl=args.sl,
            source=f"recommended:{asof}",
        )
        created.append(pos)

        rec_map[ticker]["selected"] = True
        rec_map[ticker]["selected_at"] = now_iso()

    save_state(path, state)
    for pos in created:
        print(
            f"선택 종목 매수 등록: #{pos.id} {pos.ticker} "
            f"@ {pos.entry_price:.2f}, qty={pos.quantity:.4f}"
        )


def cmd_buy(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    pos = create_position(
        state=state,
        ticker=args.ticker.upper(),
        entry_price=float(args.price),
        budget=float(args.price) * float(args.qty),
        tp=float(args.tp),
        sl=float(args.sl),
        source="manual",
    )

    save_state(path, state)
    print(
        f"매수 등록 완료: #{pos.id} {pos.ticker} {pos.quantity:.4f}주 @ {pos.entry_price:.2f} "
        f"(TP {pos.tp_pct:.2f}%, SL -{pos.sl_pct:.2f}%)"
    )


def cmd_mark(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)
    messages = mark_price(state, args.ticker, float(args.price))
    save_state(path, state)
    print("\n".join(messages))


def cmd_mark_all(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    price_map = parse_prices_arg(args.prices)
    all_messages: list[str] = []
    for ticker, price in price_map.items():
        all_messages.extend(mark_price(state, ticker, price))

    save_state(path, state)
    print("\n".join(all_messages))


def cmd_close(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    target_id = int(args.id)
    price = float(args.price)

    found = False
    for idx, raw in enumerate(state["positions"]):
        pos = position_from_dict(raw)
        if pos.id == target_id and pos.status == "open":
            close_position(state, pos, price, args.reason)
            state["positions"][idx] = to_dict(pos)
            found = True
            print(f"수동 청산 완료: #{pos.id} {pos.ticker} @ {price:.2f}")
            break

    if not found:
        raise SystemExit(f"열린 포지션을 찾을 수 없음: #{target_id}")

    save_state(path, state)


def cmd_status(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    summary = account_summary(state)
    print("=== 계좌 요약 ===")
    print(f"초기자본: {summary['initial_capital']:,.2f}")
    print(f"현금: {summary['cash']:,.2f}")
    print(f"평가금액(오픈 포지션): {summary['market_value']:,.2f}")
    print(f"총자산(Equity): {summary['equity']:,.2f}")
    print(f"실현손익: {summary['realized_pnl']:,.2f}")
    print(f"누적 수익률: {summary['cumulative_return_pct']:.2f}%")

    print("\n=== 열린 포지션 ===")
    open_positions = 0
    for raw in state["positions"]:
        pos = position_from_dict(raw)
        if pos.status != "open":
            continue
        open_positions += 1
        ref_price = pos.last_price if pos.last_price is not None else pos.entry_price
        ret = calc_return_pct(pos.entry_price, ref_price)
        print(
            f"#{pos.id} {pos.ticker} src={pos.source} qty={pos.quantity:.4f} "
            f"entry={pos.entry_price:.2f} last={ref_price:.2f} ret={ret:.2f}% "
            f"TP={pos.tp_pct:.2f}% SL=-{pos.sl_pct:.2f}%"
        )

    if open_positions == 0:
        print("(없음)")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="퀀트 추천+트래킹 수동 추적기")
    p.add_argument("--db", default=str(DEFAULT_DB_PATH), help="상태 파일 경로(JSON)")

    sub = p.add_subparsers(dest="command", required=True)

    s_init = sub.add_parser("init", help="DB 초기화")
    s_init.add_argument("--initial-capital", type=float, default=10_000_000)
    s_init.add_argument("--force", action="store_true")
    s_init.set_defaults(func=cmd_init)

    s_screen = sub.add_parser("screen", help="일일 퀀트 조건 스크리닝(추천 종목 발굴)")
    s_screen.add_argument("--source-csv", required=True, help="입력 CSV 파일")
    s_screen.add_argument("--asof", default=None, help="기준일 (YYYY-MM-DD, 기본: 오늘 UTC)")
    s_screen.add_argument("--min-vol20", type=float, default=500000)
    s_screen.add_argument("--max-pe", type=float, default=25)
    s_screen.add_argument("--min-roe", type=float, default=8)
    s_screen.add_argument("--top-n", type=int, default=10)
    s_screen.set_defaults(func=cmd_screen)

    s_reco = sub.add_parser("reco", help="추천 종목 조회")
    s_reco.add_argument("--asof", default=None)
    s_reco.set_defaults(func=cmd_reco)

    s_select = sub.add_parser("select", help="추천 종목 선택 후 트래킹 시작")
    s_select.add_argument("--asof", default=None)
    s_select.add_argument("--tickers", required=True, help="쉼표 구분: AAPL,MSFT")
    s_select.add_argument("--prices", default="", help="선택 진입가 override: AAPL=187,MSFT=420")
    s_select.add_argument("--budget-per-stock", type=float, default=1_000_000)
    s_select.add_argument("--tp", type=float, default=8)
    s_select.add_argument("--sl", type=float, default=4)
    s_select.set_defaults(func=cmd_select)

    s_buy = sub.add_parser("buy", help="가상 매수 등록(수동)")
    s_buy.add_argument("ticker")
    s_buy.add_argument("--price", required=True, type=float)
    s_buy.add_argument("--qty", required=True, type=float)
    s_buy.add_argument("--tp", required=True, type=float, help="익절 기준(%)")
    s_buy.add_argument("--sl", required=True, type=float, help="손절 기준(%, 양수 입력)")
    s_buy.set_defaults(func=cmd_buy)

    s_mark = sub.add_parser("mark", help="단일 종목 가격 마킹")
    s_mark.add_argument("ticker")
    s_mark.add_argument("--price", required=True, type=float)
    s_mark.set_defaults(func=cmd_mark)

    s_mark_all = sub.add_parser("mark-all", help="다중 종목 가격 마킹")
    s_mark_all.add_argument("--prices", required=True, help='예: "AAPL=181.2,MSFT=420.5"')
    s_mark_all.set_defaults(func=cmd_mark_all)

    s_close = sub.add_parser("close", help="수동 청산")
    s_close.add_argument("id", type=int, help="포지션 ID")
    s_close.add_argument("--price", required=True, type=float)
    s_close.add_argument("--reason", default="manual close")
    s_close.set_defaults(func=cmd_close)

    s_status = sub.add_parser("status", help="현황 및 누적 수익률 출력")
    s_status.set_defaults(func=cmd_status)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
