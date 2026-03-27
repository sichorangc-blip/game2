#!/usr/bin/env python3
"""브라우저에서 사용하는 Quant Tracker (추천 발굴 + 선택 후 트래킹)."""

from __future__ import annotations

from html import escape
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

from quant_tracker import (
    DEFAULT_DB_PATH,
    Position,
    account_summary,
    close_position,
    load_state,
    mark_price,
    now_iso,
    parse_prices_arg,
    position_from_dict,
    run_screening,
    save_recommendations,
    save_state,
    to_dict,
    today_str,
    create_position,
)

DB_PATH = Path(DEFAULT_DB_PATH)


def recommendations_html(state: dict, asof: str) -> str:
    rows = [r for r in state["recommendations"] if r.get("asof") == asof]
    rows.sort(key=lambda x: x["rank"])
    if not rows:
        return "<tr><td colspan='6'>(없음)</td></tr>"
    html_rows = []
    for r in rows:
        flag = "✅" if r.get("selected") else "-"
        html_rows.append(
            f"<tr><td>{r['rank']}</td><td>{escape(r['ticker'])}</td><td>{r['score']:.2f}</td>"
            f"<td>{r['close']:.2f}</td><td>{r['ret_20d']:.2f}</td><td>{flag}</td></tr>"
        )
    return "\n".join(html_rows)


def page_html(message: str = "", asof: str | None = None) -> bytes:
    state = load_state(DB_PATH)
    summary = account_summary(state)
    asof = asof or today_str()

    open_rows = []
    for raw in state["positions"]:
        pos = position_from_dict(raw)
        if pos.status != "open":
            continue
        last = pos.last_price if pos.last_price is not None else pos.entry_price
        open_rows.append(
            f"<tr><td>{pos.id}</td><td>{escape(pos.ticker)}</td><td>{escape(pos.source)}</td>"
            f"<td>{pos.entry_price:.2f}</td><td>{last:.2f}</td><td>{pos.tp_pct:.2f}%</td><td>-{pos.sl_pct:.2f}%</td></tr>"
        )

    open_html = "\n".join(open_rows) if open_rows else "<tr><td colspan='7'>(없음)</td></tr>"
    reco_html = recommendations_html(state, asof)

    html = f"""<!doctype html>
<html lang='ko'>
<head>
  <meta charset='utf-8' />
  <title>Quant Tracker Web</title>
  <style>
    body {{ font-family: sans-serif; max-width: 1100px; margin: 24px auto; padding: 0 16px; }}
    .box {{ border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }}
    form {{ display: grid; gap: 8px; }}
    input {{ padding: 8px; }}
    button {{ padding: 8px 12px; cursor: pointer; }}
    .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th,td {{ border: 1px solid #ddd; padding: 6px; text-align: left; }}
    .msg {{ background: #f2f8ff; border: 1px solid #bcd7ff; padding: 8px; border-radius: 6px; margin-bottom: 10px; }}
  </style>
</head>
<body>
  <h1>Quant Tracker (추천 발굴 + 선택 트래킹)</h1>
  <p>웹 주소: <b>http://127.0.0.1:8501</b></p>
  {f"<div class='msg'>{escape(message)}</div>" if message else ''}

  <div class='box'>
    <h3>계좌 요약</h3>
    <p>총자산: <b>{summary['equity']:,.2f}</b> / 누적수익률: <b>{summary['cumulative_return_pct']:.2f}%</b></p>
    <p>현금: {summary['cash']:,.2f} / 평가금액: {summary['market_value']:,.2f} / 실현손익: {summary['realized_pnl']:,.2f}</p>
  </div>

  <div class='grid'>
    <div class='box'>
      <h3>1) 일일 추천 종목 발굴(screen)</h3>
      <form method='post' action='/screen'>
        <input name='source_csv' placeholder='CSV 경로 (예: data/daily_factors.csv)' required />
        <input name='asof' placeholder='기준일 (기본: 오늘)' />
        <input name='min_vol20' placeholder='min vol20 (기본 500000)' />
        <input name='max_pe' placeholder='max PE (기본 25)' />
        <input name='min_roe' placeholder='min ROE (기본 8)' />
        <input name='top_n' placeholder='top_n (기본 10)' />
        <button type='submit'>추천 발굴 실행</button>
      </form>
    </div>

    <div class='box'>
      <h3>2) 추천 종목 선택(select)</h3>
      <form method='post' action='/select'>
        <input name='asof' placeholder='기준일 (기본: 오늘)' />
        <input name='tickers' placeholder='선택 티커: AAPL,MSFT' required />
        <input name='prices' placeholder='진입가(선택): AAPL=187,MSFT=420' />
        <input name='budget_per_stock' placeholder='종목당 예산 (기본 1000000)' />
        <input name='tp' placeholder='익절% (기본 8)' />
        <input name='sl' placeholder='손절% (기본 4)' />
        <button type='submit'>선택 종목 트래킹 시작</button>
      </form>
    </div>

    <div class='box'>
      <h3>3) 가격 마킹</h3>
      <form method='post' action='/mark-all'>
        <input name='prices' placeholder='AAPL=189,MSFT=408' required />
        <button type='submit'>가격 반영</button>
      </form>
    </div>

    <div class='box'>
      <h3>4) 수동 청산</h3>
      <form method='post' action='/close'>
        <input name='id' placeholder='포지션 ID' required />
        <input name='price' placeholder='청산 가격' required />
        <input name='reason' placeholder='사유 (선택)' />
        <button type='submit'>청산</button>
      </form>
    </div>
  </div>

  <div class='box'>
    <h3>오늘 추천 종목 ({asof})</h3>
    <table>
      <thead><tr><th>Rank</th><th>Ticker</th><th>Score</th><th>Close</th><th>20D</th><th>Selected</th></tr></thead>
      <tbody>{reco_html}</tbody>
    </table>
  </div>

  <div class='box'>
    <h3>열린 포지션</h3>
    <table>
      <thead><tr><th>ID</th><th>Ticker</th><th>Source</th><th>Entry</th><th>Last</th><th>TP</th><th>SL</th></tr></thead>
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
            message, asof = self.handle_action(self.path, form)
            self.respond_html(page_html(message, asof=asof))
        except Exception as exc:
            self.respond_html(page_html(f"오류: {exc}"), status=HTTPStatus.BAD_REQUEST)

    def respond_html(self, body: bytes, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_action(self, path: str, form: dict[str, str]) -> tuple[str, str | None]:
        state = load_state(DB_PATH)

        if path == "/screen":
            asof = (form.get("asof") or "").strip() or today_str()
            min_vol20 = float(form.get("min_vol20") or 500000)
            max_pe = float(form.get("max_pe") or 25)
            min_roe = float(form.get("min_roe") or 8)
            top_n = int(form.get("top_n") or 10)
            source_csv = form["source_csv"]

            results = run_screening(Path(source_csv), min_vol20, max_pe, min_roe, top_n)
            criteria = {
                "min_vol20": min_vol20,
                "max_pe": max_pe,
                "min_roe": min_roe,
                "top_n": top_n,
                "source_csv": source_csv,
            }
            save_recommendations(state, asof, results, criteria)
            save_state(DB_PATH, state)
            return (f"[{asof}] 추천 {len(results)}개 발굴 완료", asof)

        if path == "/select":
            asof = (form.get("asof") or "").strip() or today_str()
            tickers = [t.strip().upper() for t in (form.get("tickers") or "").split(",") if t.strip()]
            prices = parse_prices_arg(form.get("prices") or "")
            budget = float(form.get("budget_per_stock") or 1_000_000)
            tp = float(form.get("tp") or 8)
            sl = float(form.get("sl") or 4)

            if not tickers:
                raise ValueError("선택 티커를 입력하세요.")

            rec_map = {r["ticker"]: r for r in state["recommendations"] if r.get("asof") == asof}
            created = 0
            for ticker in tickers:
                if ticker not in rec_map:
                    raise ValueError(f"{ticker}: 추천 종목({asof})에 없음")
                entry = prices.get(ticker, rec_map[ticker]["close"])
                pos = create_position(
                    state=state,
                    ticker=ticker,
                    entry_price=entry,
                    budget=budget,
                    tp=tp,
                    sl=sl,
                    source=f"recommended:{asof}",
                )
                rec_map[ticker]["selected"] = True
                rec_map[ticker]["selected_at"] = now_iso()
                created += 1
            save_state(DB_PATH, state)
            return (f"선택 종목 {created}개 트래킹 시작", asof)

        if path == "/mark-all":
            prices = parse_prices_arg(form["prices"])
            messages: list[str] = []
            for ticker, price in prices.items():
                messages.extend(mark_price(state, ticker, price))
            save_state(DB_PATH, state)
            return (" / ".join(messages), None)

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
                    return (f"수동 청산 완료: #{pos.id} {pos.ticker}", None)
            raise ValueError("열린 포지션 ID를 찾지 못했습니다.")

        raise ValueError("지원하지 않는 요청입니다.")


def main() -> None:
    host, port = "127.0.0.1", 8501
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"웹 서버 시작: http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
