#!/usr/bin/env python3
"""Reproducible, read-only MASTER -> Operator scanner migration matrix.
No credentials, writes to repositories, or runtime source rewrites.
"""
import difflib
import hashlib
import json
import pathlib
import re
import urllib.request
from datetime import datetime, timezone

ROOT=pathlib.Path(__file__).resolve().parents[2]
ROOT_REL="public/agent_crypto_erith_ia/administrator/app.js"
MASTER_COMMIT="9b48648f2b36f643065993e65abec9243153df7c"
MASTER_BLOB="55014b47dc2afea639403357bf1b1413a793a1ec"
OPERATOR_BLOB="4e3936a40165a5db4a2e4f2426fc2521e487fe3c"
APPLIED_BLOB="477c53766a0f412e59a99cf556c65928f4c51b08"
B3_B5_BLOB="4db2a0bd85439fe079e55206040b64575f915c06"
MASTER_URL=("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/"+
            MASTER_COMMIT+"/"+ROOT_REL)
OUTPUT=ROOT/"phase_c_firefox_evidence"
TARGETS=[
    "atlasScannerPool",
    "atlasScannerSeriesCoversWindow",
    "atlasScannerQualifyNativeEurTwoDay",
    "atlasScannerAligned",
    "atlasScannerCommit",
    "atlasScannerRun",
    "atlasScannerStart",
    "atlasScannerFetchDirect",
    "atlasScannerNativeUsdRequested",
    "atlasScannerNativeUsdStore",
    "atlasScannerHistoryKind",
    "atlasScannerDecorateEntry",
    "atlasScannerCoinbaseUsdSpot",
    "atlasAnnualUsdHistoryCandidate",
    "atlasFetchCanonicalAnnualUsdHistory",
    "atlasNetworkPump",
    "atlasGraphSpotComparisonTruth",
    "atlasGraphProvenanceReadOnlySnapshot"
]

def git_blob(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()

def exact_function(source,name):
    match=re.search(r"(?m)^(?:async\s+)?function\s+"+re.escape(name)+r"\s*\(",source)
    if not match:
        return None
    lines=source[match.start():].splitlines(keepends=True)
    # Top-level function ends at column zero; nested braces remain indented.
    for i,line in enumerate(lines):
        if re.fullmatch(r"};?\s*",line):
            return "".join(lines[:i+1])
    raise ValueError("Top-level function not closed: "+name)

def calls(source):
    return sorted(set(re.findall(r"\b(atlas[A-Za-z0-9_]+)\s*\(",source)))

def audit():
    request=urllib.request.Request(MASTER_URL,headers={"User-Agent":"ERITH-IA-public-readonly-migration-audit"})
    with urllib.request.urlopen(request,timeout=35) as res:
        upstream=res.read(6_000_000)
        if len(upstream)>=6_000_000:
            raise ValueError("Source exceeds read-only bound")
    operator=(ROOT/ROOT_REL).read_bytes()
    msha,osha=git_blob(upstream),git_blob(operator)
    if msha!=MASTER_BLOB or osha not in (OPERATOR_BLOB, APPLIED_BLOB, B3_B5_BLOB):
        raise ValueError("Pinned source SHA mismatch: "+msha+" / "+osha)
    master=upstream.decode("utf-8")
    local=operator.decode("utf-8")
    symbols=[
        "ATLAS_SCANNER_COINBASE_USD_IDS","ATLAS_SCANNER_NETWORK_CONCURRENCY",
        "ATLAS_MARKET_REQUESTED_ASSETS","atlasMarketUniverseCoins",
        "atlasMarketUniverseLimit","atlasHistoryBridgeCanTry",
        "atlasScannerNativeUsdRequested","atlasScannerNativeUsdStore",
        "atlasScannerHistoryKind","atlasScannerDecorateEntry",
        "atlasScannerRetryableError"
    ]
    available={symbol:{"master":bool(re.search(r"\b"+symbol+r"\b",master)),
                       "operator":bool(re.search(r"\b"+symbol+r"\b",local)),
                       "master_definitions":len(re.findall(r"(?m)^(?:async\s+)?function\s+"+symbol+r"\s*\(",master)),
                       "operator_definitions":len(re.findall(r"(?m)^(?:async\s+)?function\s+"+symbol+r"\s*\(",local))}
               for symbol in symbols}
    report={"at_utc":datetime.now(timezone.utc).isoformat(),
            "master_commit":MASTER_COMMIT,"master_blob":msha,"operator_blob":osha,
            "mode":"READ_ONLY_DIFF_AFTER_PORT" if osha in (APPLIED_BLOB,B3_B5_BLOB) else "READ_ONLY_DIFF_BEFORE_PORT",
            "scope":"Scanner/public graph owner functions only",
            "symbols":available,"entries":[]}
    combined=[]
    for name in TARGETS:
        one=exact_function(master,name)
        other=exact_function(local,name)
        missing=[c for c in calls(one or "") if not re.search(r"\b"+re.escape(c)+r"\s*\(",local)]
        state="MASTER_ONLY" if one and not other else ("OPERATOR_ONLY" if other and not one
                else "SAME" if one==other else "DIFFERENT")
        signal_symbols=["ATLAS_MARKET_REQUESTED_ASSETS","ATLAS_NETWORK_MAX_CHART",
                        "ATLAS_NETWORK_MAX_OTHER","atlasMarketUniverseCoins",
                        "atlasScannerSeriesCoversWindow","atlasScannerQualifyNativeEurTwoDay"]
        unresolved=[x for x in signal_symbols if x in (one or "") and x not in local]
        report["entries"].append({
          "function":name,"status":state,"master_lines":len((one or "").splitlines()),
          "operator_lines":len((other or "").splitlines()),
          "master_sha256":hashlib.sha256((one or "").encode()).hexdigest(),
          "operator_sha256":hashlib.sha256((other or "").encode()).hexdigest(),
          "missing_called_names_in_operator":missing,
          "unresolved_references_in_operator":unresolved,
          "first_master_line":(one or "").splitlines()[0] if one else None,
          "first_operator_line":(other or "").splitlines()[0] if other else None})
        if state!="SAME":
            combined.extend(list(difflib.unified_diff(
                (other or "").splitlines(keepends=True),
                (one or "").splitlines(keepends=True),
                fromfile="OPERATOR/"+name,tofile="MASTER/"+name,n=3)))
            combined.append("\n")
    OUTPUT.mkdir(exist_ok=True)
    (OUTPUT/"master_scanner_source_reference_app.js").write_bytes(upstream)
    (OUTPUT/"operator_scanner_source_baseline_app.js").write_bytes(operator)
    (OUTPUT/"scanner_migration_matrix.json").write_text(
        json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    (OUTPUT/"scanner_function_differences.patch").write_text(
        "".join(combined),encoding="utf-8")
    for entry in report["entries"]:
        print("SCANNER_DIFF",entry["function"],entry["status"],
              "MASTER_LINES",entry["master_lines"],
              "OPERATOR_LINES",entry["operator_lines"],
              "MISSING_HELPERS",",".join(entry["missing_called_names_in_operator"]) or "none",
              flush=True)
    print("READ_ONLY_SCANNER_MIGRATION_MATRIX_PASS",len(report["entries"]),flush=True)

if __name__=="__main__":
    audit()
