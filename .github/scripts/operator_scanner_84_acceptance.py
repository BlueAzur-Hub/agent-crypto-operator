#!/usr/bin/env python3
"""Read-only Firefox acceptance matrix for Operator scanner: 6 modes x 7 periods x 2 quotes.
This records attempted UI transitions and provenance evidence; it MUST NOT equate
synthetic fixtures, successful button clicks, or unavailable sources to live data validation.
No authentication, private Bridge, real orders or POST requests.
"""
import csv
import json
import re
import sys
import time
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "operator_scanner_84_evidence"
OUT.mkdir(exist_ok=True)
MODES = (
    ("Solo", ("#btnChartSolo",), ("Solo",)),
    ("Top 3", ("#btnChartTop3",), ("Top 3",)),
    ("Top 5", ("#btnChartTop5",), ("Top 5",)),
    ("Hausses 5", ("#btnChartGainers", "#btnChartHausses5", "#btnChartTopGainers",
                  "#btnChartRisers", "#btnChartRise5"), ("Hausses 5", "Hausses")),
    ("Baisses 5", ("#btnChartLosers", "#btnChartBaisses5", "#btnChartTopLosers",
                  "#btnChartFallers", "#btnChartFall5"), ("Baisses 5", "Baisses")),
    ("Volumes 5", ("#btnChartVolumes", "#btnChartVolume5", "#btnChartTopVolumes",
                   "#btnChartVolume"), ("Volumes 5", "Volumes"))
)
PERIODS = (
    ("24 h", "1", ("24h", "24 h")),
    ("7 j", "7", ("7j", "7 j")),
    ("30 j", "30", ("30j", "30 j")),
    ("60 j", "60", ("60j", "60 j")),
    ("90 j", "90", ("90j", "90 j")),
    ("1 an", "365", ("1an", "1 an", "1y", "365j", "365 j")),
    ("Max", "36500", ("Max ?", "max", "maximum"))
)
QUOTES = ("USD", "EUR")
ALLOWED_PUBLIC_HOSTS = (
    "api.coingecko.com", "api.binance.com", "data-api.binance.vision",
    "api.okx.com", "www.okx.com", "api.kraken.com", "api.bitget.com",
    "api.coinbase.com", "api.exchange.coinbase.com", "api.coingecko.com",
)
requests_observed = []
blocked = []
rows = []
diagnostics = []

class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, fmt, *args):
        if " 404 " in (fmt % args) and len(diagnostics) < 60:
            diagnostics.append("LOCAL_404 " + (fmt % args)[:200])

server = ThreadingHTTPServer(("127.0.0.1", 0), StaticHandler)
Thread(target=server.serve_forever, daemon=True).start()
BASE = ("http://127.0.0.1:" + str(server.server_port) +
        "/public/agent_crypto_erith_ia/administrator/index.html?view=intermediate&profile=yohan&matrix84=1")

def is_public_host(host):
    return bool(host) and (host in ALLOWED_PUBLIC_HOSTS or host.endswith(".coingecko.com"))

def classify_request(req):
    parsed = urlparse(req.url)
    local = parsed.hostname == "127.0.0.1" and parsed.port == server.server_port
    if req.method not in ("GET", "HEAD", "OPTIONS"):
        return False, "NON_READ_ONLY_METHOD"
    if local:
        return True, "LOCAL_READ_ONLY"
    if is_public_host(parsed.hostname) and parsed.scheme == "https":
        return True, "PUBLIC_PROVIDER"
    # Public presentation dependencies; never grant a private API or a POST.
    if parsed.scheme == "https" and parsed.hostname == "cdn.jsdelivr.net" and parsed.path.startswith("/npm/chart.js@"):
        return True, "PUBLIC_CHART_LIBRARY"
    if parsed.scheme == "https" and parsed.hostname == "raw.githubusercontent.com" and (
            parsed.path.startswith("/BlueAzur-Hub/erith-ia-memory/main/") or
            parsed.path.startswith("/BlueAzur-Hub/agent-crypto-operator/main/")):
        return True, "PROJECT_PUBLIC_STATIC"
    return False, "NOT_ALLOWLISTED"

def response_seen(response):
    req = response.request
    parsed = urlparse(response.url)
    if is_public_host(parsed.hostname) and len(requests_observed) < 9000:
        args = parse_qs(parsed.query)
        requests_observed.append({
            "at": round(time.time(), 3),
            "provider": parsed.hostname,
            "status": response.status,
            "path": parsed.path[:125],
            "vs_currency": (args.get("vs_currency") or [""])[0][:8],
            "days": (args.get("days") or [""])[0][:15],
            "method": req.method
        })

def select_button(page, selectors, labels):
    for css in selectors:
        loc = page.locator(css)
        if loc.count() > 0:
            return loc.first, css
    all_buttons = page.locator("#market-zone button")
    for label in labels:
        pat = re.compile(r"^\s*" + re.escape(label) + r"\s*$", re.IGNORECASE)
        matched = all_buttons.filter(has_text=pat)
        if matched.count() == 1:
            return matched.first, "text=" + label
    return None, "NO_EXACT_SCANNER_CONTROL"

def select_period(page, key, labels):
    css = 'button.period-btn[data-period="' + key + '"]'
    loc = page.locator(css)
    if loc.count():
        return loc.first, css
    for label in labels:
        pat = re.compile(r"^\s*" + re.escape(label) + r"\s*$", re.IGNORECASE)
        loc = page.locator("#market-zone button.period-btn").filter(has_text=pat)
        if loc.count() == 1:
            return loc.first, "period_text=" + label
    # Do not silently map 1 year to 90 days or MAX to another duration.
    return None, "NO_EXACT_PERIOD_CONTROL"

def state_snapshot(page):
    return page.evaluate("""() => {
      const quote=globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.() || {};
      const graph=globalThis.AgentCryptoGraphNativeUsd?.snapshot?.() || {};
      const scope=globalThis.AgentCryptoMarketMicroscope?.snapshot?.() || {};
      const el=id=>document.getElementById(id)?.textContent?.trim()?.slice(0,1000) || "";
      const compact=o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>
          /currency|quote|source|timestamp|period|instrument|series|count|point|loading|fresh|state|provider|error|cache/i.test(k)
       ).map(([k,v])=>[k,typeof v==="object" ? JSON.stringify(v).slice(0,350) : String(v).slice(0,150)]).slice(0,45));
      const activeMode=[...document.querySelectorAll("#market-zone button.active")]
          .filter(x=>/Chart|scanner/i.test(x.id)||/Top|Hausses|Baisses|Volumes|Solo/i.test(x.textContent))
          .map(x=>({id:x.id,label:x.textContent.trim().slice(0,65)})).slice(0,15);
      const activePeriod=[...document.querySelectorAll("#market-zone button.period-btn.active")]
          .map(x=>({period:x.dataset.period,label:x.textContent.trim()}));
      return {
        quote:quote.displayCurrency||null,
        graph:compact(graph), microscope:compact(scope),
        activeMode,activePeriod,
        title:el("atlasChartInsightOverlayTitle"),
        seriesText:el("atlasChartInsightOverlaySeries"),
        summary:el("atlasChartInsightOverlaySummary"),
        selectedAsset:el("selectedAssetTitle"),
        comparison:(() => {
          try {
            const b = (typeof state !== "undefined" && state?.dataBroker?.comparison) || {};
            return {
              preset:b.preset||null,status:b.status||null,
              ids:[...(b.ids||[])].slice(0,10),
              renderedIds:[...(b.renderedIds||[])].slice(0,10),
              unavailableIds:[...(b.unavailableIds||[])].slice(0,10),
              histories:Object.entries(b.results||{}).slice(0,10).map(([id,r])=>({
                id,source:String(r?.source||"").slice(0,115),
                quoteCurrency:String(r?.quoteCurrency||r?.currency||"UNKNOWN").slice(0,10),
                points:Array.isArray(r?.series)?r.series.length:0,
                first:Number(r?.series?.[0]?.[0]||0),
                last:Number(r?.series?.at?.(-1)?.[0]||0)
              }))
            };
          } catch(e) {return {error:String(e).slice(0,130)};}
        })(),
        shell:!!document.getElementById("marketSnapshotPanel"),
        canvas:!!document.getElementById("mainChart"),
        marketRows:document.querySelectorAll("#marketRows tr").length
      };
    }""")

def persist():
    target = OUT / "operator_scanner_84_cases.json"
    report = {
        "schema": "erith.operator.scanner84.live-ui-evidence.v1",
        "at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "Operator Firefox Linux CI, 6 modes x 7 periods x 2 quotes",
        "baseline": "487c1586c4a587d30e90e790e7ced3fdabe487eb",
        "meaning": "A click alone is NOT proof of a quote-qualified, complete historical series",
        "cases": rows, "blocked_requests": blocked[:70],
        "diagnostics": diagnostics[:70],
        "provider_requests": requests_observed[-1500:]
    }
    target.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    with (OUT / "operator_scanner_84_matrix.csv").open("w", newline="", encoding="utf-8") as f:
        cols = ("quote", "period", "mode", "status", "reason", "mode_control",
                "period_control", "selected_quote", "active_mode", "active_period",
                "response_count", "responses_ok", "responses_429",
                "source_evidence", "view_title", "view_selected_asset",
                "scanner_state", "comparison_proof")
        writer = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    summary = {}
    for row in rows:
        summary[row["status"]] = summary.get(row["status"], 0) + 1
    md = [
        "# Operator scanner — 84-scenario acceptance evidence",
        "",
        "Source: Operator branch-local Firefox, public read-only API requests only.",
        "A passing CI runner proves execution of the harness; it does not itself certify all live histories.",
        "",
        "## Result counts",
        "",
        "| State | Count |", "|---|---:|",
        *["| " + k + " | " + str(v) + " |" for k,v in sorted(summary.items())],
        "",
        "Scenarios executed: " + str(len(rows)) + "/84.",
        "See CSV for every mode/period/quote and JSON for timestamped raw observations.",
        "",
        "Unverified means provenance/coverage has not been independently demonstrated.",
        "Provider HTTP 429 and unavailable feeds are recorded, never converted to success.",
        "No real orders, credentials, Bridge calls, auth, or private history.",
        ""
    ]
    (OUT / "README.md").write_text("\n".join(md), encoding="utf-8")
    print("MATRIX_SUMMARY " + json.dumps({"count":len(rows), "statuses":summary,
                                         "blocked":len(blocked)}, ensure_ascii=False), flush=True)

try:
    with sync_playwright() as pw:
        browser = pw.firefox.launch(headless=True)
        context = browser.new_context(viewport={"width": 1600, "height": 950},
                                      locale="fr-FR", ignore_https_errors=False)
        context.set_default_timeout(8000)
        def guard(route):
            ok, why = classify_request(route.request)
            if not ok:
                if len(blocked) < 120:
                    p = urlparse(route.request.url)
                    blocked.append({"method":route.request.method,
                                    "host":p.hostname or "", "path":p.path[:100], "reason":why})
                return route.abort()
            return route.continue_()
        context.route("**/*", guard)
        page = context.new_page()
        page.on("response", response_seen)
        page.on("pageerror", lambda exc: diagnostics.append("PAGE_ERROR " + str(exc)[:220])
                if len(diagnostics) < 70 else None)
        response = page.goto(BASE, wait_until="domcontentloaded", timeout=90000)
        if not response or response.status != 200:
            diagnostics.append("ENTRY_NOT_AVAILABLE " + str(response.status if response else "no_response"))
        page.locator("#marketSnapshotPanel").wait_for(state="attached", timeout=30000)
        try:
            page.wait_for_function("document.querySelectorAll('#marketRows tr').length > 1", timeout=18000)
        except Exception:
            diagnostics.append("MARKET_ROWS_NOT_READY")
        page.wait_for_timeout(700)
        inventory = page.evaluate("""() => ({
            scannerButtons:[...document.querySelectorAll('#market-zone button')]
              .filter(x=>/Chart|scanner|Top|Hausses|Baisses|Volumes|Solo/i.test(x.id+" "+x.textContent))
              .map(x=>({id:x.id,label:x.textContent.trim().slice(0,75),classes:x.className}))
              .slice(0,70),
            periods:[...document.querySelectorAll('button.period-btn')].map(x=>({
              id:x.id, period:x.dataset.period, label:x.textContent.trim()})),
            currency:[...document.querySelectorAll('#atlasQuoteCurrencyArchitecture [data-aqca]')]
              .map(x=>({key:x.dataset.aqca,label:x.textContent.trim()}))
        })""")
        (OUT / "control_inventory.json").write_text(
            json.dumps(inventory, indent=2, ensure_ascii=False), encoding="utf-8")
        print("CONTROL_INVENTORY " + json.dumps(inventory, ensure_ascii=False)[:5000], flush=True)
        for quote in QUOTES:
            control = page.locator('#atlasQuoteCurrencyArchitecture [data-aqca="' + quote + '"]')
            quote_available = control.count() > 0
            if quote_available:
                try:
                    control.first.click(force=True, timeout=8000)
                    page.wait_for_timeout(400)
                except Exception as exc:
                    quote_available = False
                    diagnostics.append("CURRENCY_" + quote + "_CLICK " + str(exc)[:170])
            for label, key, labels in PERIODS:
                for mode, mode_ids, mode_labels in MODES:
                    case = {
                        "quote":quote, "period":label, "mode":mode,
                        "status":"NOT_EXECUTED", "reason":"",
                        "mode_control":"", "period_control":"", "selected_quote":"",
                        "active_mode":"", "active_period":"", "response_count":0,
                        "responses_ok":0, "responses_429":0,
                        "source_evidence":"", "view_title":"", "view_selected_asset":"",
                        "scanner_state":"", "comparison_proof":""
                    }
                    before = len(requests_observed)
                    if not quote_available:
                        case["status"],case["reason"] = "BLOCKED_CONTROL","No currency toggle"
                    else:
                        try:
                            period_control, period_src = select_period(page,key,labels)
                            mode_control, mode_src = select_button(page,mode_ids,mode_labels)
                            case["mode_control"],case["period_control"] = mode_src,period_src
                            if period_control is None or mode_control is None:
                                case["status"],case["reason"] = "BLOCKED_CONTROL","Exact mode or period control absent"
                            else:
                                period_control.click(force=True,timeout=7500)
                                mode_control.click(force=True,timeout=7500)
                                # Scanner movers become "active" ONLY on an atomic
                                # five-history commit; pending is a supported state.
                                # One controlled long probe per quote distinguishes
                                # true completion/failure from a too-fast click check.
                                if mode == "Hausses 5" and label == "24 h":
                                    try:
                                        page.wait_for_function(
                                            """css => {const b=document.querySelector(css);
                                            return !!b && (b.classList.contains('active')
                                              || ['committed','failed'].includes(b.dataset.scannerState));}""",
                                            arg=mode_src, timeout=18000)
                                    except Exception:
                                        pass
                                else:
                                    page.wait_for_timeout(2100 if mode in ("Top 3","Top 5") else 1200)
                                snap=state_snapshot(page)
                                case["scanner_state"]=mode_control.get_attribute("data-scanner-state") or ""
                                case["comparison_proof"]=json.dumps(snap["comparison"],ensure_ascii=False)[:2200]
                                case["selected_quote"]=snap["quote"] or ""
                                case["active_mode"]=json.dumps(snap["activeMode"],ensure_ascii=False)[:230]
                                case["active_period"]=json.dumps(snap["activePeriod"],ensure_ascii=False)[:130]
                                case["view_title"]=snap["title"][:180]
                                case["view_selected_asset"]=snap["selectedAsset"][:180]
                                case["source_evidence"]=json.dumps({
                                    "graph":snap["graph"], "microscope":snap["microscope"],
                                    "seriesText":snap["seriesText"][:300],
                                    "summary":snap["summary"][:200],
                                    "marketRows":snap["marketRows"]
                                },ensure_ascii=False)[:1600]
                                active_period=any(x.get("period")==key for x in snap["activePeriod"])
                                id_mode=mode_control.get_attribute("id") or ""
                                active_mode=any(x.get("id")==id_mode and id_mode
                                                for x in snap["activeMode"])
                                no_data = (
                                    snap["marketRows"] <= 1 and
                                    ("aucune courbe valide" in snap["summary"].lower() or
                                     "première série réelle" in snap["seriesText"].lower() or
                                     "aucun actif sélectionné" in snap["selectedAsset"].lower())
                                )
                                if snap["quote"] != quote:
                                    case["status"],case["reason"]="FAIL_QUOTE","Displayed currency did not match selected toggle"
                                elif no_data:
                                    case["status"],case["reason"]="BLOCKED_MARKET_DATA",(
                                        "No qualifying historical chart or market rows; never label this as a passed market test")
                                elif not active_period:
                                    case["status"],case["reason"]="FAIL_UI","Selected period not active"
                                elif not active_mode and case["scanner_state"] in ("waiting-direct","warming","running"):
                                    case["status"],case["reason"]="SCANNER_PENDING",(
                                        "Five historical series not committed; previous chart intentionally retained")
                                elif not active_mode and case["scanner_state"] == "failed":
                                    case["status"],case["reason"]="SCANNER_FAILED",(
                                        "Scanner explicitly rejected/failed this transaction; inspect Market and source availability")
                                elif not active_mode:
                                    case["status"],case["reason"]="FAIL_UI","Scanner inactive without a pending/failed state"
                                else:
                                    # A UI control transition does NOT demonstrate full history or provenance.
                                    case["status"],case["reason"]="UI_OK_SOURCE_UNVERIFIED",(
                                        "UI state confirmed; independent source/coverage and chart/table quote not certified")
                                if mode=="Top 5" and label in ("24 h","1 an") and quote in QUOTES:
                                    page.screenshot(path=str(OUT / (
                                        "operator_" + quote.lower() + "_" + key + "_top5.png")),
                                        animations="disabled",timeout=20000)
                        except Exception as exc:
                            case["status"],case["reason"]="FAIL_UI",str(exc)[:230]
                    observed = requests_observed[before:]
                    case["response_count"]=len(observed)
                    case["responses_ok"]=sum(1 for x in observed if x["status"]==200)
                    case["responses_429"]=sum(1 for x in observed if x["status"]==429)
                    if case["status"]=="UI_OK_SOURCE_UNVERIFIED" and case["responses_429"]:
                        case["status"],case["reason"]="PROVIDER_RATE_LIMIT","HTTP 429 observed; UI state not live-data proof"
                    rows.append(case)
                    print("CASE %02d/84 %-4s %-4s %-10s %s" % (
                        len(rows),quote,label,mode,case["status"]),flush=True)
        browser.close()
finally:
    server.shutdown()
    persist()
if len(rows)!=84:
    print("FATAL: matrix incomplete",file=sys.stderr)
    sys.exit(1)
if any(x["status"].startswith("FAIL_") for x in rows):
    print("FAIL: UI/currency failures are documented in the CSV/JSON",file=sys.stderr)
    sys.exit(1)
