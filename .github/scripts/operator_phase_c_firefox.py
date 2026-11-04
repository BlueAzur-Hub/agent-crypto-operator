#!/usr/bin/env python3
"""Phase C read-only Firefox smoke for the Operator PR branch (Linux headless).
Does NOT certify Firefox Windows, external provider data, Bridge or real trading.
"""
import json
import os
import sys
import traceback
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ARTIFACT = ROOT / "phase_c_firefox_evidence"
ARTIFACT.mkdir(exist_ok=True)
checks = []
diagnostics = []
unsafe_requests = []
offline_mode = {"enabled": False}

def safe_url(raw):
    parsed = urlparse(raw)
    if parsed.hostname == "ntfy.sh":
        return "https://ntfy.sh/[topic-redacted]"
    if parsed.hostname not in ("127.0.0.1", "localhost", "::1"):
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path[:110]}"
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path[:110]}"


def check(name, passed, detail=""):
    checks.append({"check": name, "pass": bool(passed), "detail": str(detail)[:400]})
    print(("PASS" if passed else "FAIL") + ": " + name + (" — " + str(detail)[:130] if detail else ""), flush=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        if " 404 " in (format % args):
            diagnostics.append("LOCAL-404 " + (format % args)[:250])


server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_port}/public/agent_crypto_erith_ia"
report = {"at_utc": datetime.now(timezone.utc).isoformat(),
          "browser": "Firefox headless on Linux CI, NOT Windows",
          "mode": "read-only; branch-local HTTP server; private loopback blocked",
          "checks": checks, "diagnostics": diagnostics, "unsafe_requests": unsafe_requests}


def record_page(page, label):
    def err(exc):
        if len(diagnostics) < 70:
            diagnostics.append(label + " page-error: " + str(exc)[:350])
    page.on("pageerror", err)
    def failed(req):
        if len(diagnostics) < 70:
            diagnostics.append(label + " request-failed: " + safe_url(req.url))
    page.on("requestfailed", failed)


try:
    with sync_playwright() as pw:
        browser = pw.firefox.launch(headless=True)
        context = browser.new_context(viewport={"width": 1600, "height": 950},
                                      locale="fr-FR", ignore_https_errors=False)
        context.set_default_timeout(14000)
        def guard(route):
            req = route.request
            url = urlparse(req.url)
            local_site = url.hostname == "127.0.0.1" and url.port == server.server_port
            private = url.hostname in ("127.0.0.1", "localhost", "::1") and not local_site
            if req.method not in ("GET", "HEAD", "OPTIONS") or private or (offline_mode["enabled"] and not local_site):
                if len(unsafe_requests) < 60:
                    unsafe_requests.append({"method": req.method, "url": safe_url(req.url)})
                return route.abort()
            return route.continue_()
        context.route("**/*", guard)
        context.add_init_script("""(() => {
            const oldFetch = window.fetch;
            window.__phaseCNotificationStacks = [];
            window.fetch = function(...args) {
              const candidate = String(typeof args[0] === "string" ? args[0] : (args[0]?.url || ""));
              if (candidate.includes("ntfy.sh"))
                window.__phaseCNotificationStacks.push(new Error("outbound notification attempt").stack.slice(0, 1000));
              return oldFetch.apply(this, args);
            };
        })();""")

        admin = context.new_page()
        record_page(admin, "operator")
        url = base + "/administrator/index.html?view=intermediate&profile=yohan&phase_c=1"
        response = admin.goto(url, wait_until="domcontentloaded", timeout=100000)
        check("Operator HTML served from PR checkout", response is not None and response.status == 200,
              response.status if response else "no response")
        admin.locator("#marketSnapshotPanel").wait_for(state="attached", timeout=25000)
        dom = admin.evaluate("""() => ({
            shell: !!document.querySelector('#marketSnapshotPanel'),
            rows: !!document.querySelector('#marketRows'),
            role: document.documentElement.dataset.atlasRole,
            surface: document.documentElement.dataset.agentCryptoSurface,
            build: document.documentElement.dataset.agentCryptoLoadedBuild,
            limits: [...document.querySelectorAll('[data-market-limit]')].map(x=>x.dataset.marketLimit),
            appScript: !!document.querySelector('script[src^="./app.js?"]'),
            graphScript: !!document.querySelector('script[src*="/graph-native-usd.js?"]'),
            spotScript: !!document.querySelector('script[src*="okx-public-chart-history.js"]')
        })""")
        check("Market shell and canonical table present", dom["shell"] and dom["rows"], dom)
        check("Operator first-paint permission is not Owner", dom["role"] != "administrator", dom["role"])
        check("Operator loads Administrator shared build 40.6.719", dom["build"] == "40.6.719", dom["build"])
        check("Market scope 50/100/250/500/1000", all(str(n) in dom["limits"] for n in (50,100,250,500,1000)), dom["limits"])
        check("Graph and public history script wiring", dom["appScript"] and dom["graphScript"] and dom["spotScript"], dom)

        try:
            admin.wait_for_function("document.querySelectorAll('#marketRows tr').length > 1", timeout=22000)
            admin.wait_for_timeout(600)
        except Exception as exc:
            diagnostics.append("Market data readiness unavailable: " + str(exc)[:200])
        for amount in (100, 50):
            try:
                btn = admin.locator(f'[data-market-limit="{amount}"]').first
                attempts = []
                for attempt in (1, 2):
                    btn.click(timeout=14000, force=True)
                    admin.wait_for_timeout(1000)
                    state = btn.get_attribute("aria-pressed")
                    attempts.append(state)
                    if state == "true":
                        break
                    admin.wait_for_timeout(1300)
                check(f"Firefox Market limit {amount} interactive", state == "true", "aria-pressed attempts=" + repr(attempts))
            except Exception as exc:
                check(f"Firefox Market limit {amount} interactive", False, str(exc))

        try:
            radar = admin.locator('#atlasPublicRadarLink').first
            radar.wait_for(state="attached", timeout=17000)
            radar.click(timeout=14000, force=True)
            admin.wait_for_timeout(2400)
            state = admin.evaluate("""() => ({
               singleMarket: document.querySelectorAll('#marketRows').length === 1,
               duplicateRadarTable: document.querySelectorAll('[data-radar-native="rows"]').length,
               reader: typeof globalThis.AgentCryptoRadarReader?.eligibleResearchCoin === 'function',
               renderer: typeof globalThis.AgentCryptoRadarNative?.mount === 'function',
               filter: document.getElementById('atlasPublicRadarLink')?.className || ''
            })""")
            check("Radar uses one canonical Market table", state["singleMarket"] and state["duplicateRadarTable"] == 0, state)
            check("Radar public reader and renderer loaded", state["reader"] and state["renderer"], state)
        except Exception as exc:
            check("Radar category usable in Firefox", False, str(exc))

        # Graph controls: tests commands and selection state, NOT 5 certified data series.
        for control_id, label in (("btnChartSolo", "Solo"), ("btnChartTop5", "Top 5")):
            try:
                control = admin.locator("#" + control_id)
                control.click(force=True, timeout=14000)
                admin.wait_for_timeout(1000)
                cls = control.get_attribute("class") or ""
                check("Firefox graph control " + label + " responds", "active" in cls.split(), cls)
            except Exception as exc:
                check("Firefox graph control " + label + " responds", False, str(exc))
        for period, label in (("7", "7j"), ("1", "24h")):
            try:
                control = admin.locator('button.period-btn[data-period="' + period + '"]').first
                control.click(force=True, timeout=14000)
                admin.wait_for_timeout(850)
                cls = control.get_attribute("class") or ""
                check("Firefox graph period " + label + " responds", "active" in cls.split(), cls)
            except Exception as exc:
                check("Firefox graph period " + label + " responds", False, str(exc))
        report["chart_display"] = admin.evaluate("""() => ({
          selected: document.getElementById('selectedAssetTitle')?.textContent || '',
          overlay: document.getElementById('atlasChartInsightOverlaySummary')?.textContent || '',
          overlayTitle: document.getElementById('atlasChartInsightOverlayTitle')?.textContent || '',
          overlaySeries: document.getElementById('atlasChartInsightOverlaySeries')?.textContent || '',
          currency: globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency || 'UNKNOWN',
          chartCanvas: !!document.getElementById('mainChart')
        })""")
        # Regression from real Firefox screenshots: a retained USD price
        # must never be captioned as EUR during Solo -> Top 5 transitions.
        title = report["chart_display"]["overlayTitle"].upper()
        values = report["chart_display"]["overlaySeries"]
        mixed_label = ("PRIX EUR" in title and ("$US" in values or "$" in values)) or (
            "PRIX USD" in title and "€" in values)
        check("Firefox retained historical board never labels USD values as EUR",
              not mixed_label, report["chart_display"])

        admin.screenshot(path=str(ARTIFACT / "operator_market_firefox.png"),
                         animations="disabled", timeout=30000)
        report["operator_dom"] = dom
        report["operator_notification_stacks"] = admin.evaluate("window.__phaseCNotificationStacks || []")[:8]

        desk = context.new_page()
        record_page(desk, "trader")
        trader_resp = desk.goto(base + "/trader/trading-desk.html?phase_c=1",
                                wait_until="domcontentloaded", timeout=100000)
        check("Trader entry served", trader_resp is not None and trader_resp.status == 200,
              trader_resp.status if trader_resp else "no response")
        desk.locator("#traderInterfaceRuntime").wait_for(state="attached", timeout=25000)
        trader = desk.evaluate("""() => {
            const el = document.getElementById('traderInterfaceRuntime');
            const u = new URL(el.src);
            return {surface: u.searchParams.get('surface'),
                    profile: u.searchParams.get('profile'),
                    view: u.searchParams.get('view'),
                    mirrorScript: !!document.querySelector('script[src*="trader-runtime-mirror.js"]'),
                    iframe: !!el};
        }""")
        check("Yoann Trader iframe contract", trader["surface"] == "trader" and
              trader["profile"] == "yohan" and trader["view"] == "intermediate" and
              trader["mirrorScript"], trader)
        try:
            inner = desk.frame_locator("#traderInterfaceRuntime")
            inner.locator("#marketSnapshotPanel").wait_for(state="attached", timeout=35000)
            frame_role = inner.locator("html").get_attribute("data-atlas-role")
            check("Trader runtime loads in Operator role", frame_role == "operator", frame_role)
            frame_build = inner.locator("html").get_attribute("data-agent-crypto-loaded-build")
            check("Trader shares Administrator 40.6.719 Version Truth", frame_build == "40.6.719", frame_build)
        except Exception as exc:
            check("Trader runtime loads in Operator role", False, str(exc))
        # The shared Technical Reading accordion must now host the Seven
        # dossier without replacing Concrete or adding another IA control.
        try:
            inner = desk.frame_locator("#traderInterfaceRuntime")
            seven = inner.locator("#sevenAssetReading")
            seven.wait_for(state="attached", timeout=30000)
            dossier = seven.evaluate("""el => {
                const ct = document.getElementById('aiCtPanel');
                const quote = globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.();
                const graph = globalThis.AgentCryptoGraphNativeUsd?.snapshot?.();
                const privateButton = el.querySelector('.seven-asset-actions button:last-child');
                return {
                    nested: !!ct?.contains(el),
                    onlyOneAccordion: document.querySelectorAll('#detailPanelBody > #aiCtPanel').length===1,
                    heading: ct?.querySelector('summary b')?.textContent || '',
                    reason: el.querySelector('.seven-asset-state')?.textContent || '',
                    marketSelected: globalThis.AgentCryptoTraderMarket?.selected?.()?.symbol || null,
                    chartPair: globalThis.AgentCryptoMarketMicroscope?.snapshot?.()?.loadedInstrument || null,
                    displayed: el.hidden===false,
                    nativeCtKept: !!ct?.querySelector('.ai-ct-panel-body'),
                    privateDisabled: privateButton?.disabled===true,
                    privateOwnerAvailable:
                        typeof globalThis.AgentCryptoTraderOkxAccount?.ticketReadOnly==='function' &&
                        typeof globalThis.AgentCryptoTraderOkxAccount?.basePositionReadOnly==='function',
                    currency: quote?.displayCurrency || 'N/D',
                    graphCurrency: graph?.displayCurrency || 'N/D',
                    graphInstalled: graph?.installed===true,
                    realOrders: globalThis.AgentCryptoSevenAssetReadingView?.real_orders
                };
            }""")
            qualified_btc = "Dossier BTC" in dossier["heading"]
            safe_pending = ("Sources en attente" in dossier["heading"] and
                            ("Sélection non qualifiée" in dossier["reason"] or
                             "Conflit" in dossier["reason"]))
            check("Seven native Technical Reading: BTC dossier or honest unqualified state",
                  dossier["nested"] and dossier["onlyOneAccordion"] and
                  dossier["displayed"] and (qualified_btc or safe_pending) and
                  dossier["nativeCtKept"] and dossier["realOrders"] is False, dossier)
            check("Trader initial displayed currency and native graph both USD",
                  dossier["currency"]=="USD" and
                  dossier["graphCurrency"]=="USD" and dossier["graphInstalled"], dossier)
            check("Operator private account remains fail-closed when owner lacks methods",
                  dossier["privateOwnerAvailable"] or dossier["privateDisabled"], dossier)
            # The original manual EUR option must not be removed by the
            # Trader-only default-USD reconciliation. Restore USD afterwards.
            buttons = inner.locator('#atlasQuoteCurrencyArchitecture [data-aqca]')
            buttons.first.wait_for(state="attached", timeout=12000)
            eur = inner.locator('#atlasQuoteCurrencyArchitecture [data-aqca="EUR"]')
            usd = inner.locator('#atlasQuoteCurrencyArchitecture [data-aqca="USD"]')
            eur.click(force=True, timeout=12000)
            eur_state = eur.evaluate("""el => globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency""")
            usd.click(force=True, timeout=12000)
            usd_state = usd.evaluate("""el => globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency""")
            check("Operator manual EUR then USD remains available",
                  eur_state=="EUR" and usd_state=="USD",
                  {"eur":eur_state,"usd":usd_state})
            desk.screenshot(path=str(ARTIFACT / "trader_seven_btc_usd_firefox.png"),
                            animations="disabled", timeout=30000)
        except Exception as exc:
            check("Operator Seven BTC / native USD Firefox regression", False, str(exc))
        # TRADUS is a NESTED section in the existing end-of-page Yoann
        # development handoff, not a Market or global navigation control.
        try:
            inner = desk.frame_locator("#traderInterfaceRuntime")
            owner = inner.locator("#traderYoannOperatorSection")
            owner.wait_for(state="visible", timeout=30000)
            panel = owner.locator("#traderTradusPanel")
            toggle = owner.locator("#traderTradusToggle")
            toggle.wait_for(state="visible", timeout=20000)
            placement = panel.evaluate("""el => {
                const owner = document.querySelector('#traderYoannOperatorSection');
                const paper = document.querySelector('#traderPaperLab');
                return {
                    nested: !!owner?.contains(el) && !!owner.querySelector(':scope > div')?.contains(el),
                    noTopControl: !document.querySelector('#accueil #traderTradusToggle'),
                    afterPaper: !!paper && !!(paper.compareDocumentPosition(owner) & Node.DOCUMENT_POSITION_FOLLOWING),
                    linksPreserved: (owner?.querySelectorAll('a').length || 0) >= 4,
                    closedByDefault: el.tagName === 'DETAILS' && el.open === false
                };
            }""")
            check("TRADUS anchored after PAPER inside Yoann bottom development zone",
                  all(placement.values()), placement)
            toggle.click(timeout=12000)
            panel.locator('[data-tt="status"]').wait_for(state="visible", timeout=12000)
            info = panel.evaluate("""el => ({
                status: el.querySelector('[data-tt="status"]')?.textContent,
                signal: el.querySelector('[data-tt="signal"]')?.textContent,
                expanded: el.open,
                selfTest: window.AgentCryptoTraderTradusView?.self_test?.(),
                sourceButton: !!el.querySelector('#traderTradusRefreshSource')
            })""")
            check("TRADUS bottom SHADOW/PAPER panel visible and read-only",
                  info["expanded"] and bool(info["status"]) and info["sourceButton"] and
                  bool(info["selfTest"] and info["selfTest"]["pass"] and
                  info["selfTest"]["real_orders"] is False), info)
            desk.screenshot(path=str(ARTIFACT / "trader_yohan_bottom_tradus_firefox.png"),
                            animations="disabled", timeout=30000)
            panel.locator("#traderTradusClose").click(timeout=12000)
            check("TRADUS section folds without changing Operator role",
                  panel.evaluate("(el) => el.open === false"))
        except Exception as exc:
            check("TRADUS bottom handoff section visible", False, str(exc))
        desk.screenshot(path=str(ARTIFACT / "trader_firefox.png"),
                        animations="disabled", timeout=30000)

        # Offline: no local Bridge and no network; only shell/fail-closed state tested.
        offline_mode["enabled"] = True
        try:
            admin.reload(wait_until="domcontentloaded", timeout=60000)
            visible = admin.evaluate("""() => ({
               shell: !!document.querySelector('#marketSnapshotPanel'),
               build: document.documentElement.dataset.agentCryptoLoadedBuild,
               role: document.documentElement.dataset.atlasRole
            })""")
            check("Offline Firefox retains Operator shell without elevation",
                  visible["shell"] and visible["role"] != "administrator" and visible["build"] == "40.6.719", visible)
        except Exception as exc:
            check("Offline Firefox retains Operator shell without elevation", False, str(exc))
        report["trader_dom"] = trader
        context.close()
        browser.close()
except Exception as exc:
    check("Firefox harness completed", False, repr(exc))
    diagnostics.append(traceback.format_exc()[:1800])
finally:
    server.shutdown()
    report["summary"] = {"passed": sum(c["pass"] for c in checks),
                         "failed": sum(not c["pass"] for c in checks),
                         "total": len(checks)}
    (ARTIFACT / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report["summary"]), flush=True)
    for message in diagnostics[:10]:
        print("DIAGNOSTIC: " + message[:250], flush=True)

sys.exit(1 if any(not c["pass"] for c in checks) else 0)
