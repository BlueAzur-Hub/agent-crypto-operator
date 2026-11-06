#!/usr/bin/env python3
"""Observe isolated Firefox transactions. Runner completion is not data certification.
Only public, read-only network requests are permitted. No production state is changed.
"""
import argparse
import csv
import hashlib
import json
import os
import time
from collections import Counter
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[2]
MODES = {
    'solo': ('Solo', '#btnChartSolo', 1),
    'rank-3': ('Top 3', '#btnChartTop3', 3),
    'rank-5': ('Top 5', '#btnChartTop5', 5),
    'gainers': ('Hausses 5', '#btnChartGainers', 5),
    'losers': ('Baisses 5', '#btnChartLosers', 5),
    'volume': ('Volumes 5', '#btnChartVolume5', 5),
}
PERIODS = (1, 7, 30, 60, 90, 365, 36500)
PROVIDERS = {'api.coingecko.com', 'api.binance.com', 'data-api.binance.vision',
             'api.okx.com', 'www.okx.com', 'api.kraken.com', 'api.bitget.com',
             'api.coinbase.com', 'api.exchange.coinbase.com'}
SNAPSHOT = r'''() => {
  const s = typeof state !== 'undefined' ? state : {};
  const b = s.dataBroker?.comparison || {}, chart = s.dataBroker?.chart || {};
  const engine = s.chartEngineV2 || {};
  const tx = typeof atlasScannerTransaction !== 'undefined' ? atlasScannerTransaction : null;
  const ui = typeof atlasScannerUiState !== 'undefined' ? atlasScannerUiState : {};
  const queued = typeof atlasScannerQueuedRequest !== 'undefined' ? atlasScannerQueuedRequest : null;
  const stats = rows => {
    const pts=(rows||[]).map(p => Array.isArray(p) ? p : [p.x ?? p.t, p.y ?? p.price]);
    const times=pts.map(p=>Number(p[0]));
    let invalid=0, nonmonotonic=0, maxGap=0;
    pts.forEach((p,i)=>{if(!Number.isFinite(Number(p[0])) || !Number.isFinite(Number(p[1])) || Number(p[1])<=0) invalid++;
      if(i){const gap=times[i]-times[i-1];if(gap<=0)nonmonotonic++;maxGap=Math.max(maxGap,gap);}});
    return {points:pts.length,first:times[0]||null,last:times.at(-1)||null,invalid,nonmonotonic,maxGap};
  };
  const history=(id,r)=>({id, ...stats(r?.series), source:r?.originalSource||r?.source||null,
    sourceMode:r?.sourceMode||null, period:r?.periodDays||null,
    provenance:typeof atlasHistoricalDisplayQuote==='function' ? atlasHistoricalDisplayQuote(r) : {},
    identity:typeof atlasHistoryQuoteProvenance==='function' ? atlasHistoryQuoteProvenance(r||{}) : {},
    integrity:r?.integrity||null,
    hourlyNative:r?.atlasNativeEurTwoDay?.cadence==='hourly-native'});
  const entries=chart.result?.entries;
  const histories=Array.isArray(entries) ? entries.map(e=>history(e.coin?.id,e.result)) :
    chart.result?.series ? [history(chart.coinId||s.selectedCoinId,chart.result)] :
    Object.entries(b.results||{}).map(([id,r])=>history(id,r));
  const datasets=(engine.realChart?.data?.datasets||[]).filter(d=>d.atlasCoin && d.type!=='bar')
    .map(d=>({id:d.atlasCoin.id,label:d.label,quote:d.atlasHistoricalQuote,...stats(d.data)}));
  const el=id=>document.getElementById(id)?.textContent?.trim()?.slice(0,1800)||'';
  return {
    at:Date.now(),quote:globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||null,
    period:s.chartPeriodDays,selectedId:s.selectedCoinId,
    market:{liveOk:s.liveOk,coins:s.coins?.length||0,mode:s.sourceLock?.mode||s.dataBroker?.market?.mode,
      timestamp:s.dataBroker?.market?.timestamp,rows:document.querySelectorAll('#marketRows tr').length},
    scannerUi:{...ui},queued:queued ? {preset:queued.preset,period:queued.period}:null,
    transaction:tx ? {id:tx.id,preset:tx.preset,period:tx.period,candidateIds:tx.candidateIds,
      windowEnd:tx.windowEnd,phase:tx.phase,cacheChecked:tx.cacheChecked,cacheHits:tx.cacheHits,
      directAttempts:tx.directAttempts,validCount:tx.validCount,cancelled:tx.cancelled} : null,
    comparison:{preset:b.preset,status:b.status,ids:b.ids||[],renderedIds:b.renderedIds||[],
      pendingIds:b.pendingIds||[],unavailableIds:b.unavailableIds||[],error:b.error},
    chart:{period:chart.period,status:chart.status,contextKey:chart.contextKey,error:chart.error,
      scanner:chart.result?.scanner||null},
    engine:{loading:engine.loading,activeRequestKey:engine.activeRequestKey,lastRenderedKey:engine.lastRenderedKey},
    histories,datasets,
    title:el('atlasChartInsightOverlayTitle'),summary:el('atlasChartInsightOverlaySummary'),
    seriesText:el('atlasChartInsightOverlaySeries'),selectedAsset:el('selectedAssetTitle'),
    chartLibrary:typeof window.Chart,
    activePeriod:[...document.querySelectorAll('button.period-btn.active')].map(x=>x.dataset.period)
  };
}'''


def assess(snap, mode, quote, period, expected, requested_at):
    """Strict independent evidence gate; never infer source currency from the toggle."""
    n = MODES[mode][2]
    if snap.get('quote') != quote or snap.get('period') != period:
        return False, 'Requested quote/period not applied'
    comp = snap.get('comparison', {})
    if mode != 'solo' and comp.get('preset') != mode:
        return False, 'Requested comparison not committed'
    if mode != 'solo' and comp.get('status') != 'ready':
        return False, 'Comparison is not ready'
    if snap.get('chart', {}).get('period') != period:
        return False, 'Chart still belongs to another period'
    datasets = snap.get('datasets', [])
    ids = [d.get('id') for d in datasets]
    if len(expected) != n or ids != expected:
        return False, 'Canvas does not contain the exact requested ordered asset set'
    if mode != 'solo' and comp.get('renderedIds') != expected:
        return False, 'Broker and canvas disagree'
    histories = {h['id']: h for h in snap.get('histories', [])}
    for dataset in datasets:
        h = histories.get(dataset['id'], {})
        if h.get('provenance', {}).get('currency') != quote or not h.get('provenance', {}).get('native'):
            return False, 'Missing/conflicting native historical quote provenance'
        if dataset.get('quote', {}).get('currency') != quote:
            return False, 'Canvas dataset quote disagrees with source'
        if not h.get('source') or not h.get('identity', {}).get('historySourceFamily'):
            return False, 'Historical source family not evidenced'
        for series in (h, dataset):
            if series.get('points', 0) < 2 or series.get('invalid', 1) or series.get('nonmonotonic', 1):
                return False, 'Missing, invalid or nonmonotonic series'
        if not h.get('integrity', {}).get('ok'):
            return False, 'Runtime series integrity is not accepted'
        # MAX records observed bounds, not an invented 100-year coverage guarantee.
        if period != 36500:
            duration = period * 86400000
            tolerance = (5400000 if h.get('hourlyNative') else 720000) if period == 1 else max(86400000, duration * .03)
            if h['first'] > requested_at - duration + tolerance or h['last'] < requested_at - tolerance:
                return False, 'Requested UTC window is not covered by the observed history'
            if h['maxGap'] > (5400000 if period == 1 else max(172800000, duration * .05)):
                return False, 'Observed history contains an excessive time gap'
        if h['last'] > snap['at'] + 720000:
            return False, 'History contains future-dated observations'
    return True, 'Exact rendered IDs, native quote, source, integrity and UTC bounds evidenced'


def self_test():
    from copy import deepcopy
    now = 1800000000000
    series = {'points':289,'first':now-86400000,'last':now,'invalid':0,'nonmonotonic':0,'maxGap':300000}
    h = dict(series,id='bitcoin',source='CoinGecko',provenance={'currency':'USD','native':True},
             identity={'historySourceFamily':'coingecko'},integrity={'ok':True})
    s = {'at':now,'quote':'USD','period':1,'chart':{'period':1},'histories':[h],
         'datasets':[dict(series,id='bitcoin',quote={'currency':'USD'})]}
    assert assess(s,'solo','USD',1,['bitcoin'],now)[0]
    for field, value in [('datasets',[]),('quote','EUR'),('period',7)]:
        bad=deepcopy(s);bad[field]=value;assert not assess(bad,'solo','USD',1,['bitcoin'],now)[0]
    for field,value in [('provenance',{'currency':None,'native':False}),('first',now-3600000),
                        ('last',now-3600000),('maxGap',86400000),('nonmonotonic',1)]:
        bad=deepcopy(s);bad['histories'][0][field]=value
        assert not assess(bad,'solo','USD',1,['bitcoin'],now)[0],field
    bad=deepcopy(s);bad['comparison']={'preset':'gainers','status':'ready','renderedIds':['bitcoin']}
    assert not assess(bad,'gainers','USD',1,['bitcoin'],now)[0]
    print('Evidence classifier: valid proof accepted; nine false-positive cases rejected')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--mode',choices=MODES)
    parser.add_argument('--quote',choices=('USD','EUR'))
    parser.add_argument('--period',type=int,choices=PERIODS)
    parser.add_argument('--deadline',type=int,default=180)
    parser.add_argument('--self-test',action='store_true')
    args=parser.parse_args()
    if args.self_test:
        self_test();return
    from playwright.sync_api import sync_playwright
    modes=[args.mode] if args.mode else list(MODES)
    quotes=[args.quote] if args.quote else ['USD','EUR']
    periods=[args.period] if args.period else list(PERIODS)
    out=ROOT/'operator_scanner_84_evidence';out.mkdir(exist_ok=True)
    rows=[]
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
        def log_message(self,*a):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/public/agent_crypto_erith_ia/administrator/index.html?view=intermediate&profile=yohan&matrix84=stable'
    def persist():
        statuses=dict(Counter(r['status'] for r in rows))
        report={'schema':'erith.operator.scanner84.stable-evidence.v2','at_utc':datetime.now(timezone.utc).isoformat(),
                'runtime_sha256':hashlib.sha256((ROOT/'public/agent_crypto_erith_ia/administrator/app.js').read_bytes()).hexdigest(),
                'tested_commit':os.environ.get('TESTED_COMMIT','local'),
                'scope':'Isolated Firefox Linux, fresh context per case, public read-only sources',
                'deadline_seconds':args.deadline,'cases':rows,'statuses':statuses,
                'certified_cases':sum(r['status']=='PASS_HISTORY_EVIDENCED' for r in rows),
                'max_policy':'MAX proves returned history only, not completeness since asset inception'}
        (out/'cases.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
        with (out/'matrix.csv').open('w',newline='',encoding='utf-8') as f:
            w=csv.DictWriter(f,fieldnames=['mode','quote','period','status','reason','elapsed_seconds','expected_ids'],extrasaction='ignore')
            w.writeheader();w.writerows(rows)
        text='# Stable scanner acceptance observations\n\n'
        text+='Each case uses a fresh Firefox context and waits up to '+str(args.deadline)+' seconds for its own transaction.\n'
        text+='A completed runner is **not** a data certificate. Only PASS_HISTORY_EVIDENCED certifies the recorded case.\n\n'
        text+='| Status | Cases |\n|---|---:|\n'+''.join(f'| {k} | {v} |\n' for k,v in sorted(statuses.items()))
        text+='\nInspect cases.json and each case directory for UTC bounds, IDs, source provenance, network outcomes, progress and screenshot.\n'
        (out/'README.md').write_text(text,encoding='utf-8')
        if os.environ.get('GITHUB_STEP_SUMMARY'):
            Path(os.environ['GITHUB_STEP_SUMMARY']).write_text(text,encoding='utf-8')
    try:
        with sync_playwright() as pw:
            browser=pw.firefox.launch(headless=True)
            for mode in modes:
                for quote in quotes:
                    for period in periods:
                        case_id=f'{mode}-{quote}-{period}';folder=out/case_id;folder.mkdir(exist_ok=True)
                        case={'mode':mode,'quote':quote,'period':period,'status':'HARNESS_ERROR','reason':'',
                              'expected_ids':[],'observations':[],'responses':[],'request_failures':[],
                              'blocked':[],'page_errors':[],'console_warnings':[]}
                        context=browser.new_context(viewport={'width':1600,'height':950},locale='fr-FR',service_workers='block')
                        context.set_default_timeout(10000)
                        def guard(route):
                            r=route.request;p=urlparse(r.url)
                            local=p.hostname=='127.0.0.1' and p.port==server.server_port
                            static=p.hostname=='raw.githubusercontent.com' and any(p.path.startswith('/BlueAzur-Hub/'+repo+'/main/') for repo in ('erith-ia-memory','agent-crypto-operator'))
                            chart=p.hostname=='cdn.jsdelivr.net' and p.path.startswith('/npm/chart.js@')
                            allowed=r.method in ('GET','HEAD','OPTIONS') and (local or (p.scheme=='https' and (p.hostname in PROVIDERS or static or chart)))
                            if allowed:return route.continue_()
                            if len(case['blocked'])<100:case['blocked'].append({'method':r.method,'host':p.hostname,'path':p.path[:180]})
                            return route.abort()
                        context.route('**/*',guard)
                        page=context.new_page()
                        def response_seen(resp):
                            p=urlparse(resp.url)
                            if p.hostname in PROVIDERS or p.hostname=='raw.githubusercontent.com':
                                q=parse_qs(p.query)
                                case['responses'].append({'at':int(time.time()*1000),'host':p.hostname,'path':p.path,
                                  'status':resp.status,'quote':q.get('vs_currency'),'days':q.get('days')})
                        page.on('response',response_seen)
                        page.on('requestfailed',lambda req: case['request_failures'].append({'url':req.url[:250],'failure':req.failure}) if len(case['request_failures'])<100 else None)
                        page.on('pageerror',lambda exc:case['page_errors'].append(str(exc)[:500]) if len(case['page_errors'])<40 else None)
                        page.on('console',lambda msg:case['console_warnings'].append(msg.text[:1600]) if msg.type in ('error','warning') and len(case['console_warnings'])<100 else None)
                        start=time.monotonic();snap={};requested_at=int(time.time()*1000)
                        try:
                            page.goto(base,wait_until='domcontentloaded',timeout=60000)
                            page.wait_for_function("typeof state!=='undefined' && state.liveOk && state.coins?.length>=5 && ['direct','github-public'].includes(state.sourceLock?.mode||state.dataBroker?.market?.mode)",timeout=45000)
                            page.locator(f'#atlasQuoteCurrencyArchitecture [data-aqca="{quote}"]').click(force=True)
                            page.locator(f'button.period-btn[data-period="{period}"]').click(force=True)
                            requested_at=page.evaluate('Date.now()')
                            page.locator(MODES[mode][1]).click(force=True)
                            deadline=time.monotonic()+args.deadline
                            last_progress=None
                            while True:
                                snap=page.evaluate(SNAPSHOT)
                                tx=snap.get('transaction') or {}
                                comp=snap.get('comparison') or {}
                                if tx.get('preset')==mode and tx.get('candidateIds') and not case['expected_ids']:
                                    case['expected_ids']=tx['candidateIds']
                                    case['transaction_id']=tx['id'];case['window_end']=tx.get('windowEnd')
                                elif not case['expected_ids'] and mode=='solo':case['expected_ids']=[snap.get('selectedId')]
                                elif not case['expected_ids'] and mode in ('rank-3','rank-5') and comp.get('preset')==mode:
                                    case['expected_ids']=comp.get('ids',[])
                                elif not case['expected_ids'] and snap.get('chart',{}).get('scanner',{}):
                                    case['expected_ids']=snap['chart']['scanner'].get('requestedIds',[])
                                ok,reason=assess(snap,mode,quote,period,case['expected_ids'],case.get('window_end') or requested_at)
                                progress={'elapsed':round(time.monotonic()-start,1),'transaction':tx,
                                          'scannerUi':snap.get('scannerUi'),'comparison':comp,
                                          'chart':snap.get('chart'),'evidence_reason':reason}
                                signature=json.dumps({k:v for k,v in progress.items() if k!='elapsed'},sort_keys=True)
                                if signature!=last_progress:
                                    case['observations'].append(progress);last_progress=signature
                                    print('PROGRESS '+case_id+' '+json.dumps(progress,ensure_ascii=False)[:1400],flush=True)
                                if ok:
                                    case['status']='PASS_HISTORY_EVIDENCED';case['reason']=reason;break
                                ui=snap.get('scannerUi') or {}
                                if ui.get('preset')==mode and ui.get('status')=='failed':
                                    case['status']='SCANNER_REJECTED';case['reason']=ui.get('message','');break
                                if time.monotonic()>=deadline:
                                    case['status']='DEADLINE_UNVERIFIED';case['reason']=reason;break
                                page.wait_for_timeout(500)
                        except Exception as exc:
                            case['reason']=str(exc)[:1500]
                            try:snap=page.evaluate(SNAPSHOT)
                            except Exception:pass
                            if not snap.get('market',{}).get('liveOk') or snap.get('market',{}).get('coins',0)<5:
                                case['status']='MARKET_UNAVAILABLE'
                        finally:
                            case['elapsed_seconds']=round(time.monotonic()-start,1)
                            case['requested_at']=requested_at;case['final']=snap
                            try:page.locator('#analyste').screenshot(path=str(folder/'chart.png'),timeout=12000)
                            except Exception:
                                try:page.screenshot(path=str(folder/'page.png'),timeout=10000)
                                except Exception:pass
                            (folder/'evidence.json').write_text(json.dumps(case,ensure_ascii=False,indent=2),encoding='utf-8')
                            rows.append(case);persist()
                            print('CASE_RESULT '+json.dumps({k:case[k] for k in ('mode','quote','period','status','reason','elapsed_seconds')},ensure_ascii=False),flush=True)
                            context.close()
            browser.close()
    finally:
        server.shutdown();persist()
    # Source rejection is an observation, not a harness crash. The step summary
    # and artifact explicitly report the separate data-certification count.
    if any(c['status']=='HARNESS_ERROR' for c in rows):raise SystemExit(1)


if __name__=='__main__':main()
