#!/usr/bin/env python3
"""
Quant Investment Tracker (manual execution)
- Records selected stocks daily
- Auto-closes positions by take-profit / stop-loss thresholds
- Tracks cumulative return based on virtual capital
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DEFAULT_DB_PATH = Path("tracker_data.json")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Position:
    id: int
    ticker: str
    entry_price: float
    quantity: float
    tp_pct: float
    sl_pct: float
    entry_time: str
    status: str = "open"
    last_price: float | None = None
    last_mark_time: str | None = None
    exit_price: float | None = None
    exit_time: str | None = None
    exit_reason: str | None = None

    @property
    def invested(self) -> float:
        return self.entry_price * self.quantity


def default_state(initial_capital: float = 10_000_000.0) -> dict[str, Any]:
    return {
        "meta": {
            "created_at": now_iso(),
            "updated_at": now_iso(),
            "version": 1,
        },
        "account": {
            "initial_capital": initial_capital,
            "cash": initial_capital,
            "realized_pnl": 0.0,
        },
        "positions": [],
        "next_position_id": 1,
        "logs": [],
    }


def load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        state = default_state()
        save_state(path, state)
        return state
    return json.loads(path.read_text(encoding="utf-8"))


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
    cumulative_return_pct = ((equity / initial) - 1.0) * 100.0
    return {
        "initial_capital": initial,
        "cash": cash,
        "market_value": market_value,
        "equity": equity,
        "realized_pnl": realized,
        "cumulative_return_pct": cumulative_return_pct,
    }


def cmd_init(args: argparse.Namespace) -> None:
    path = Path(args.db)
    if path.exists() and not args.force:
        raise SystemExit(f"이미 DB 파일이 존재합니다: {path} (덮어쓰려면 --force)")
    state = default_state(initial_capital=args.initial_capital)
    save_state(path, state)
    print(f"초기화 완료: {path} (초기자본 {args.initial_capital:,.0f})")


def cmd_buy(args: argparse.Namespace) -> None:
    path = Path(args.db)
    state = load_state(path)

    ticker = args.ticker.upper()
    entry_price = float(args.price)
    qty = float(args.qty)
    tp = float(args.tp)
    sl = abs(float(args.sl))

    cost = entry_price * qty
    if state["account"]["cash"] < cost:
        raise SystemExit(
            f"현금 부족: 필요 {cost:,.2f}, 보유 {state['account']['cash']:,.2f}"
        )

    pos = Position(
        id=state["next_position_id"],
        ticker=ticker,
        entry_price=entry_price,
        quantity=qty,
        tp_pct=tp,
        sl_pct=sl,
        entry_time=now_iso(),
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
            "sl_pct": sl,
            "cost": cost,
        }
    )

    save_state(path, state)
    print(
        f"매수 등록 완료: #{pos.id} {ticker} {qty}주 @ {entry_price:.2f} "
        f"(TP {tp:.2f}%, SL -{sl:.2f}%)"
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
            f"#{pos.id} {pos.ticker} qty={pos.quantity:g} entry={pos.entry_price:.2f} "
            f"last={ref_price:.2f} ret={ret:.2f}% TP={pos.tp_pct:.2f}% SL=-{pos.sl_pct:.2f}%"
        )

    if open_positions == 0:
        print("(없음)")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="퀀트 투자 수동 추적기")
    p.add_argument("--db", default=str(DEFAULT_DB_PATH), help="상태 파일 경로(JSON)")

    sub = p.add_subparsers(dest="command", required=True)

    s_init = sub.add_parser("init", help="DB 초기화")
    s_init.add_argument("--initial-capital", type=float, default=10_000_000)
    s_init.add_argument("--force", action="store_true")
    s_init.set_defaults(func=cmd_init)

    s_buy = sub.add_parser("buy", help="가상 매수 등록")
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
    s_mark_all.add_argument(
        "--prices",
        required=True,
        help='예: "AAPL=181.2,MSFT=420.5,TSLA=195.0"',
    )
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
