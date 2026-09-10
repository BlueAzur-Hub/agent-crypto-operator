#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

import requests

try:
    from curl_cffi import requests as curl_requests
except Exception:
    curl_requests = None

UTC = timezone.utc
BUILD = "40.4.198"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Agent-Crypto-ERITH-IA-Commodity-History/40.4.198"
YAHOO_BASES = (
    "https://query2.finance.yahoo.com/v8/finance/chart",
    "https://query1.finance.yahoo.com/v8/finance/chart",
)
YAHOO_CRUMB_URL = "https://query2.finance.yahoo.com/v1/test/getcrumb"

DOMAINS = {
    "energy": (
        {"id":"wti","name":"WTI Crude Oil","symbol":"CL=F","currency":"USD","market":"NYMEX","unit":"USD_per_barrel"},
        {"id":"brent","name":"Brent Crude Oil","symbol":"BZ=F","currency":"USD","market":"NYMEX","unit":"USD_per_barrel"},
        {"id":"natural_gas","name":"Natural Gas","symbol":"NG=F","currency":"USD","market":"NYMEX","unit":"USD_per_MMBtu"},
    ),
    "metals": (
        {"id":"gold","name":"Or","symbol":"GC=F","display_symbol":"XAU","currency":"USD","market":"COMEX","unit":"troy_ounce"},
        {"id":"silver","name":"Argent","symbol":"SI=F","display_symbol":"XAG","currency":"USD","market":"COMEX","unit":"troy_ounce"},
        {"id":"platinum","name":"Platine","symbol":"PL=F","display_symbol":"XPT","currency":"USD","market":"NYMEX","unit":"troy_ounce"},
        {"id":"palladium","name":"Palladium","symbol":"PA=F","display_symbol":"XPD","currency":"USD","market":"NYMEX","unit":"troy_ounce"},
        {"id":"copper","name":"Cuivre","symbol":"HG=F","display_symbol":"HG","currency":"USD","market":"COMEX","unit":"pound"},
    ),
}


def now_iso() -> str:
    return datetime.now(tz=UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def finite(value):
    try:
        n=float(value)
    except (TypeError,ValueError):
        return None
    return n if math.isfinite(n) else None


def atomic_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_suffix(path.suffix+".tmp")
    tmp.write_text(json.dumps(payload,ensure_ascii=False,indent=2,allow_nan=False)+"\n",encoding="utf-8")
    os.replace(tmp,path)


def session_yahoo():
    if curl_requests is not None:
        s=curl_requests.Session(impersonate="chrome")
    else:
        s=requests.Session()
    s.headers.update({
        "User-Agent":USER_AGENT,
        "Accept":"application/json,text/plain,*/*",
        "Accept-Language":"fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer":"https://finance.yahoo.com/",
    })
    return s


def yahoo_crumb(s,timeout:float):
    try: s.get("https://fc.yahoo.com",timeout=timeout,allow_redirects=True)
    except Exception: pass
    try:
        r=s.get(YAHOO_CRUMB_URL,timeout=timeout)
        if r.status_code==200 and r.text.strip(): return r.text.strip()
    except Exception: pass
    return None


def yahoo_payload(s,symbol:str,timeout:float,interval:str,range_value:str,crumb=None):
    params={"interval":interval,"range":range_value,"events":"history","includeAdjustedClose":"true","includePrePost":"false"}
    if crumb: params["crumb"]=crumb
    encoded=quote(symbol,safe="")
    errors=[]
    for base in YAHOO_BASES:
        try:
            r=s.get(f"{base}/{encoded}",params=params,timeout=timeout)
            if r.status_code==429:
                errors.append("HTTP 429")
                continue
            r.raise_for_status()
            payload=r.json()
            chart=payload.get("chart") if isinstance(payload,dict) else None
            if not isinstance(chart,dict) or chart.get("error"):
                raise RuntimeError(str(chart.get("error") if isinstance(chart,dict) else "chart absent"))
            return payload
        except Exception as exc:
            errors.append(str(exc))
    raise RuntimeError(f"Yahoo {symbol} {range_value}/{interval}: "+" ; ".join(errors))


def parse_series(payload,spec,requested_interval:str,requested_range:str):
    result=payload["chart"]["result"][0]
    meta=result.get("meta") or {}
    ts=result.get("timestamp") or []
    q=((result.get("indicators") or {}).get("quote") or [{}])[0]
    closes=q.get("close") or []; opens=q.get("open") or []; highs=q.get("high") or []; lows=q.get("low") or []; volumes=q.get("volume") or []
    points=[]
    for i,stamp in enumerate(ts):
        close=finite(closes[i] if i<len(closes) else None)
        if close is None or close<=0: continue
        dt=datetime.fromtimestamp(float(stamp),tz=UTC)
        points.append({
            "time":dt.isoformat(timespec="seconds").replace("+00:00","Z"),
            "date":dt.date().isoformat(),
            "open":finite(opens[i] if i<len(opens) else None),
            "high":finite(highs[i] if i<len(highs) else None),
            "low":finite(lows[i] if i<len(lows) else None),
            "close":close,
            "volume":finite(volumes[i] if i<len(volumes) else None),
        })
    if len(points)<12: raise RuntimeError(f"{spec['symbol']}: série insuffisante ({len(points)} points)")
    return {
        "asset_id":spec["id"],"name":spec["name"],"symbol":spec.get("display_symbol") or spec["symbol"],
        "provider_symbol":meta.get("symbol") or spec["symbol"],"currency":meta.get("currency") or spec["currency"],
        "unit":spec["unit"],"market":meta.get("exchangeName") or spec["market"],"timezone":meta.get("exchangeTimezoneName"),
        "instrument_type":"future_continuous","source":{"id":"yahoo_finance","name":"Yahoo Finance","provider_symbol":spec["symbol"]},
        "requested_interval":requested_interval,"requested_range":requested_range,"source_interval":meta.get("dataGranularity") or requested_interval,
        "history_points":points,
    }


def span_years(points)->float:
    if len(points)<2: return 0.0
    first=datetime.fromisoformat(points[0]["time"].replace("Z","+00:00")); last=datetime.fromisoformat(points[-1]["time"].replace("Z","+00:00"))
    return max(0.0,(last-first).total_seconds()/(365.2425*86400.0))


def slice_years(points,years:int):
    if not points: return []
    last=datetime.fromisoformat(points[-1]["time"].replace("Z","+00:00")); cutoff=last-timedelta(days=years*365.2425+8)
    return [p for p in points if datetime.fromisoformat(p["time"].replace("Z","+00:00"))>=cutoff]


def clone_asset(asset,points):
    out={k:v for k,v in asset.items() if k!="history_points"}
    out["history_points"]=points; out["points_count"]=len(points); out["history_start"]=points[0]["time"]; out["history_end"]=points[-1]["time"]; out["span_years"]=round(span_years(points),3)
    return out


def resolution(assets):
    vals=sorted({str(a.get("source_interval") or "unknown") for a in assets})
    return vals[0] if len(vals)==1 else "mixed:"+",".join(vals)


def validate(assets,horizon:str):
    min_span={"5a":4.5,"10a":8.8,"max":8.8}[horizon]; min_points={"5a":48,"10a":96,"max":96}[horizon]
    failures=[]
    for a in assets:
        if a["instrument_type"]!="future_continuous" or a["span_years"]<min_span or a["points_count"]<min_points:
            failures.append({"symbol":a["symbol"],"provider":a["provider_symbol"],"span_years":a["span_years"],"points":a["points_count"]})
    if failures: raise RuntimeError(f"{horizon} coverage insufficient: {failures}")


def payload(domain:str,assets,horizon:str,generated_at:str):
    validate(assets,horizon)
    integrity={
        "no_invented_values":True,"provider_series_preserved":True,"provider_granularity_recorded":True,
        "coverage_duration_validated":True,"future_continuous_only":True,"spot_semantics_forbidden":True,
        "lazy_browser_load_required":True,"boot_payload_forbidden":True,"orders_allowed":False,
    }
    if domain=="metals":
        integrity.update({"spot_current_mixing_forbidden":True,"current_gold_api_excluded":True,"futures_history_only":True})
    return {
        "schema":"agent_crypto_commodity_historical_depth_v1","build":BUILD,"domain":domain,"status":"ready","horizon":horizon,
        "resolution":resolution(assets),"generated_at":generated_at,"source":"Yahoo Finance chart endpoint",
        "instrument_scope":"continuous_futures_history","assets_expected":len(DOMAINS[domain]),"assets_count":len(assets),"assets":assets,
        "coverage":{"min_span_years":min(a["span_years"] for a in assets),"max_span_years":max(a["span_years"] for a in assets),"min_points":min(a["points_count"] for a in assets),"max_points":max(a["points_count"] for a in assets)},
        "integrity":integrity,
        "source_note":"FUTURE CONTINU · HISTORIQUE FOURNISSEUR · série historique distincte de toute cotation spot actuelle.",
    }


def collect_domain(root:Path,domain:str,timeout:float,pacing:float):
    specs=DOMAINS[domain]; s=session_yahoo(); crumb=yahoo_crumb(s,timeout); ten=[]; maxs=[]; errors=[]
    for spec in specs:
        try:
            ten.append(parse_series(yahoo_payload(s,spec["symbol"],timeout,"1wk","10y",crumb),spec,"1wk","10y")); time.sleep(pacing)
            maxs.append(parse_series(yahoo_payload(s,spec["symbol"],timeout,"1mo","max",crumb),spec,"1mo","max"))
        except Exception as exc:
            errors.append({"symbol":spec["symbol"],"error":str(exc)[:1000]})
        time.sleep(pacing)
    if len(ten)!=len(specs) or len(maxs)!=len(specs): raise RuntimeError(f"{domain} incomplete: 10y={len(ten)}/{len(specs)} max={len(maxs)}/{len(specs)} {errors}")
    bymax={a["asset_id"]:a for a in maxs}; generated_at=now_iso()
    p5=[clone_asset(a,slice_years(a["history_points"],5)) for a in ten]
    p10=[clone_asset(a,list(a["history_points"])) for a in ten]
    pmax=[clone_asset(bymax[a["asset_id"]],list(bymax[a["asset_id"]]["history_points"])) for a in ten]
    payloads={"5a":payload(domain,p5,"5a",generated_at),"10a":payload(domain,p10,"10a",generated_at),"max":payload(domain,pmax,"max",generated_at)}
    out=root/"data"/domain/("history_long" if domain=="metals" else "history")
    for h,p in payloads.items(): atomic_json(out/f"{h}.json",p)
    atomic_json(out/"status.json",{
        "schema":"agent_crypto_commodity_historical_depth_status_v1","build":BUILD,"domain":domain,"status":"ready","generated_at":generated_at,
        "horizons":{h:{"ready":True,"resolution":p["resolution"],"assets":p["assets_count"],**p["coverage"],"path":f"data/{domain}/{('history_long' if domain=='metals' else 'history')}/{h}.json"} for h,p in payloads.items()},
        "integrity":payloads["max"]["integrity"],"errors":errors,
    })
    return {"domain":domain,"coverage":{h:p["coverage"] for h,p in payloads.items()},"resolution":{h:p["resolution"] for h,p in payloads.items()}}


def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--root",default="public/agent_crypto_erith_ia"); ap.add_argument("--domain",choices=("energy","metals","all"),default="all"); ap.add_argument("--timeout",type=float,default=25.0); ap.add_argument("--pacing",type=float,default=1.5); args=ap.parse_args()
    domains=("energy","metals") if args.domain=="all" else (args.domain,)
    result=[collect_domain(Path(args.root),d,args.timeout,args.pacing) for d in domains]
    print(json.dumps({"status":"ready","build":BUILD,"domains":result},ensure_ascii=False))

if __name__=="__main__": main()
