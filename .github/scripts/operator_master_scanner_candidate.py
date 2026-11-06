#!/usr/bin/env python3
"""Create a SOURCE-IDENTICAL scanner transplant candidate for CI, no Git write.
Requires pinned MASTER and Operator app.js archived by the read-only audit.
"""
import hashlib
import json
import pathlib
import re

ROOT=pathlib.Path(__file__).resolve().parents[2]
EVIDENCE=ROOT/"phase_c_firefox_evidence"
ROOT_APP=ROOT/"public/agent_crypto_erith_ia/administrator/app.js"
MASTER=EVIDENCE/"master_scanner_source_reference_app.js"
OPERATOR=EVIDENCE/"operator_scanner_source_baseline_app.js"
OUT=EVIDENCE/"operator_scanner_candidate_app.js"
FILES={
 "master":"55014b47dc2afea639403357bf1b1413a793a1ec",
 "operator":"4e3936a40165a5db4a2e4f2426fc2521e487fe3c",
 "integrated":"477c53766a0f412e59a99cf556c65928f4c51b08",
 "integrated_b3_b5":"4db2a0bd85439fe079e55206040b64575f915c06",
}
# Eight existing owners are replaced ONLY from the canonical MASTER source.
REPLACE=[
 "atlasScannerPool","atlasScannerAligned","atlasScannerCommit",
 "atlasScannerRun","atlasScannerStart","atlasScannerFetchDirect",
 "atlasScannerStoredHistory","atlasScannerDecorateEntry",
]
# Seven new MASTER helpers are inserted in the original scanner scope.
INSERT=[
 "atlasScannerSeriesCoversWindow","atlasScannerQualifyNativeEurTwoDay",
 "atlasScannerCoinbaseUsdSpot","atlasScannerNativeUsdRequested",
 "atlasScannerNativeUsdKey","atlasScannerNativeUsdStored",
 "atlasScannerNativeUsdStore",
]
CONST="ATLAS_SCANNER_COINBASE_USD_IDS"

def git_sha(raw):
    return hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\0"+raw).hexdigest()

def function(text,name):
    m=re.search(r"(?m)^(?:async\s+)?function\s+"+re.escape(name)+r"\s*\(",text)
    if not m:return None
    e=text.find("\n}",m.end())
    if e<0:raise ValueError("Unterminated function "+name)
    return text[m.start():e+2]

def main():
    mraw=MASTER.read_bytes()
    oraw=OPERATOR.read_bytes()
    operator_blob=git_sha(oraw)
    if git_sha(mraw)!=FILES["master"] or operator_blob not in (FILES["operator"],FILES["integrated"],FILES["integrated_b3_b5"]):
        raise ValueError("Pinned source blob changed — no integration")
    if ROOT_APP.read_bytes()!=oraw:
        raise ValueError("Operator app.js checkout differs from audited baseline")
    master=mraw.decode("utf-8")
    original=oraw.decode("utf-8")
    if operator_blob in (FILES["integrated"],FILES["integrated_b3_b5"]):
        for name in REPLACE+INSERT:
            if function(original,name)!=function(master,name):
                raise ValueError("Previously integrated owner differs from MASTER: "+name)
        if original.count("const ATLAS_SCANNER_NETWORK_CONCURRENCY = 1;")!=1:
            raise ValueError("Scanner concurrency lost")
        OUT.write_bytes(oraw)
        report={"mode":"ALREADY_INTEGRATED_AND_VERIFIED",
                "pinned_blobs":FILES,"replaced":REPLACE,"inserted":INSERT,
                "status":"BRANCH_CANDIDATE_APPLIED","candidate_sha256":hashlib.sha256(oraw).hexdigest(),
                "candidate_size":len(oraw),"original_size":len(oraw)}
        (EVIDENCE/"scanner_candidate_manifest.json").write_text(
            json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
        print("MASTER_SCANNER_ALREADY_INTEGRATED",operator_blob,flush=True)
        return
    output=original
    report={"mode":"CANDIDATE_NO_GITHUB_COMMIT",
            "pinned_blobs":FILES,"replaced":[],"inserted":[]}
    for name in REPLACE:
        old,new=function(output,name),function(master,name)
        if not old or not new or output.count(old)!=1:
            raise ValueError("Ambiguous or missing function "+name)
        output=output.replace(old,new,1)
        report["replaced"].append(name)
    for name in INSERT:
        if function(output,name) or not function(master,name):
            raise ValueError("Expected MASTER-only helper missing/duplicate "+name)
    anchor="function atlasScannerPool("
    if output.count(anchor)!=1:raise ValueError("Scanner insertion anchor ambiguous")
    added="\n".join(function(master,n) for n in INSERT)+"\n"
    output=output.replace(anchor,added+anchor,1)
    report["inserted"]=INSERT
    pat=r"(?m)^const "+CONST+r"\s*=\s*Object\.freeze\(\{[\s\S]*?^\}\);"
    matches=re.findall(pat,master,re.MULTILINE)
    if len(matches)!=1 or re.search(pat,output,re.MULTILINE):
        raise ValueError("Coinbase public-only mapping not uniquely proven")
    output=output.replace(anchor,matches[0]+"\n"+anchor,1)
    # Restrict concurrency to the already-tested MASTER scanner setting.
    old="const ATLAS_SCANNER_NETWORK_CONCURRENCY = 2;"
    new="const ATLAS_SCANNER_NETWORK_CONCURRENCY = 1;"
    if output.count(old)!=1 or master.count(new)!=1:
        raise ValueError("Scanner network concurrency differs from pinned contract")
    output=output.replace(old,new,1)
    for name in REPLACE+INSERT:
        if function(output,name)!=function(master,name):
            raise ValueError("Transferred function does not match canonical MASTER: "+name)
    # The Operator owns the private profile/Bridge, runtime, CT, TRADUS and
    # Market Core independently; these remain completely outside this file.
    if len(output)<len(original) or "real_orders:true" in output:
        raise ValueError("Unexpected destructive or executable source")
    OUT.write_text(output,encoding="utf-8")
    report.update({"candidate_sha256":hashlib.sha256(output.encode()).hexdigest(),
                   "candidate_size":len(output.encode()),"original_size":len(oraw),
                   "constants_ported":[CONST,"ATLAS_SCANNER_NETWORK_CONCURRENCY=1"],
                   "operator_scope":["administrator/app.js"],
                   "trader_runtime_changed":False,
                   "status":"UNCOMMITTED_VALIDATION_REQUIRED"})
    (EVIDENCE/"scanner_candidate_manifest.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print("MASTER_SCANNER_CANDIDATE_GENERATED",report["candidate_sha256"],
          "owners",len(REPLACE),"helpers",len(INSERT),
          "bytes",report["candidate_size"],flush=True)

if __name__=="__main__":main()
