#!/usr/bin/env python3
"""브라우저에서 사용하는 Quant Tracker (표준 라이브러리만 사용)."""

from __future__ import annotations

from html import escape
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

from quant_tracker import (
    DEFAULT_DB_PATH,
    account_summary,
    close_position,
    load_state,
    mark_price,
    parse_prices_arg,
    position_from_dict,
    save_state,
    to_dict,
    Position,
    now_iso,
)

DB_PATH = Path(DEFAULT_DB_PATH)


def page_html(message: str = "") -> bytes:
    state = load_state(DB_PATH)
    summary = account_summary(state)

    open_rows = []
    for raw in state["positions"]:
        pos = position_from_dict(raw)
        if pos.status != "open":
            continue
        last = pos.last_price if pos.last_price is not None else pos.entry_price
        open_rows.append(
            f"<tr><td>{pos.id}</td><td>{escape(pos.ticker)}</td><td>{pos.quantity:g}</td>"
            f"<td>{pos.entry_price:.2f}</td><td>{last:.2f}</td><td>{pos.tp_pct:.2f}%</td><td>-{pos.sl_pct:.2f}%</td></tr>"
        )

    open_html = "\n".join(open_rows) if open_rows else "<tr><td colspan='7'>(없음)</td></tr>"

    html = f"""<!doctype html>
<html lang='ko'>
<head>
  <meta charset='utf-8' />
  <title>Quant Tracker Web</title>
  <style>
    body {{ font-family: sans-serif; max-width: 960px; margin: 24px auto; padding: 0 16px; }}
    h1 {{ margin-bottom: 4px; }}
    .box {{ border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }}
    form {{ display: grid; gap: 8px; }}
    input {{ padding: 8px; }}
    button {{ padding: 8px 12px; cursor: pointer; }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th,td {{ border: 1px solid #ddd; padding: 6px; text-align: left; }}
    .msg {{ background: #f2f8ff; border: 1px solid #bcd7ff; padding: 8px; border-radius: 6px; margin-bottom: 10px; }}
    .muted {{ color: #666; font-size: 13px; }}
  </style>
</head>
<body>
  <h1>Quant Tracker (웹)</h1>
  <p class='muted'>주소창에 <b>http://127.0.0.1:8501</b> 입력해서 사용하세요.</p>
  {f"<div class='msg'>{escape(message)}</div>" if message else ''}

  <div class='box'>
    <h3>계좌 요약</h3>
    <p>초기자본: {summary['initial_capital']:,.2f} / 현금: {summary['cash']:,.2f} / 평가금액: {summary['market_value']:,.2f}</p>
    <p>총자산: <b>{summary['equity']:,.2f}</b> / 실현손익: {summary['realized_pnl']:,.2f} / 누적수익률: <b>{summary['cumulative_return_pct']:.2f}%</b></p>
  </div>

  <div class='grid'>
    <div class='box'>
      <h3>초기화</h3>
      <form method='post' action='/init'>
        <input name='initial_capital' placeholder='초기자본 (예: 10000000)' required />
        <button type='submit'>초기화</button>
      </form>
    </div>

    <div class='box'>
      <h3>매수 등록</h3>
      <form method='post' action='/buy'>
        <input name='ticker' placeholder='티커 (예: AAPL)' required />
        <input name='price' placeholder='매수가' required />
        <input name='qty' placeholder='수량' required />
        <input name='tp' placeholder='익절 % (예: 8)' required />
        <input name='sl' placeholder='손절 % (예: 4)' required />
        <button type='submit'>매수 등록</button>
      </form>
    </div>

    <div class='box'>
      <h3>가격 마킹(여러 종목)</h3>
      <form method='post' action='/mark-all'>
        <input name='prices' placeholder='AAPL=189,MSFT=408' required />
        <button type='submit'>가격 반영</button>
      </form>
    </div>

    <div class='box'>
      <h3>수동 청산</h3>
      <form method='post' action='/close'>
        <input name='id' placeholder='포지션 ID' required />
        <input name='price' placeholder='청산 가격' required />
        <input name='reason' placeholder='사유 (선택)' />
        <button type='submit'>청산</button>
      </form>
    </div>
  </div>

  <div class='box'>
    <h3>열린 포지션</h3>
    <table>
      <thead><tr><th>ID</th><th>Ticker</th><th>수량</th><th>매수가</th><th>최근가</th><th>TP</th><th>SL</th></tr></thead>
      <tbody>{open_html}</tbody>
    </table>
  </div>
</body>
</html>
"""
    return html.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/":
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
            return
        body = page_html()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        form = {k: v[0] for k, v in parse_qs(raw).items()}

        try:
            message = self.handle_action(self.path, form)
            self.respond_html(page_html(message))
        except Exception as exc:  # 사용자 입력 오류를 페이지 메시지로 표시
            self.respond_html(page_html(f"오류: {exc}"), status=HTTPStatus.BAD_REQUEST)

    def respond_html(self, body: bytes, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_action(self, path: str, form: dict[str, str]) -> str:
        state = load_state(DB_PATH)

        if path == "/init":
            initial_capital = float(form["initial_capital"])
            state = {
                "meta": {"created_at": now_iso(), "updated_at": now_iso(), "version": 1},
                "account": {
                    "initial_capital": initial_capital,
                    "cash": initial_capital,
                    "realized_pnl": 0.0,
                },
                "positions": [],
                "next_position_id": 1,
                "logs": [],
            }
            save_state(DB_PATH, state)
            return f"초기화 완료 (초기자본 {initial_capital:,.0f})"

        if path == "/buy":
            ticker = form["ticker"].upper()
            price = float(form["price"])
            qty = float(form["qty"])
            tp = float(form["tp"])
            sl = abs(float(form["sl"]))
            cost = price * qty
            if state["account"]["cash"] < cost:
                raise ValueError("현금이 부족합니다.")

            pos = Position(
                id=state["next_position_id"],
                ticker=ticker,
                entry_price=price,
                quantity=qty,
                tp_pct=tp,
                sl_pct=sl,
                entry_time=now_iso(),
                last_price=price,
                last_mark_time=now_iso(),
            )
            state["next_position_id"] += 1
            state["positions"].append(to_dict(pos))
            state["account"]["cash"] -= cost
            save_state(DB_PATH, state)
            return f"매수 등록: #{pos.id} {ticker}"

        if path == "/mark-all":
            prices = parse_prices_arg(form["prices"])
            messages: list[str] = []
            for ticker, price in prices.items():
                messages.extend(mark_price(state, ticker, price))
            save_state(DB_PATH, state)
            return " / ".join(messages)

        if path == "/close":
            target_id = int(form["id"])
            price = float(form["price"])
            reason = form.get("reason", "manual close") or "manual close"

            for idx, raw_pos in enumerate(state["positions"]):
                pos = position_from_dict(raw_pos)
                if pos.id == target_id and pos.status == "open":
                    close_position(state, pos, price, reason)
                    state["positions"][idx] = to_dict(pos)
                    save_state(DB_PATH, state)
                    return f"수동 청산 완료: #{pos.id} {pos.ticker}"
            raise ValueError("열린 포지션 ID를 찾지 못했습니다.")

        raise ValueError("지원하지 않는 요청입니다.")


def main() -> None:
    host, port = "127.0.0.1", 8501
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"웹 서버 시작: http://{host}:{port}")
    print("브라우저 주소창에 위 주소를 입력하세요.")
    server.serve_forever()


if __name__ == "__main__":
    main()
