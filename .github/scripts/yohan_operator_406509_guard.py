#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
base=root/'public'/'agent_crypto_erith_ia'
build=json.loads((base/'operator'/'build.json').read_text(encoding='utf-8'))
yohan=(base/'administrator'/'yohan.html').read_text(encoding='utf-8')
profile=(base/'administrator'/'js'/'yohan-operator-profile.js').read_text(encoding='utf-8')
client=(base/'administrator'/'js'/'yohan-operator-bridge-client.js').read_text(encoding='utf-8')
contract=json.loads((base/'operator'/'bridge_yohan'/'R19Y1_OPERATOR_CONTROL_CONTRACT.json').read_text(encoding='utf-8'))

checks={
 'build_509':build.get('build')=='40.6.509',
 'master_509':'index-40.6.509.html' in yohan,
 'market_core':build.get('market_core')=='38.15.11',
 'master_repo':build.get('runtime_repository')=='BlueAzur-Hub/erith-ia-memory',
 'operator_repo_lineage':build.get('schema')=='agent_crypto_operator_delivery_v1',
 'no_admin_grant':build.get('grants_administrator_session') is False and 'administrator_grant: false' in profile,
 'query_not_auth':build.get('query_parameter_is_authorization') is False,
 'bridge_control_r19y1':build.get('bridge_control_center_version')=='2.3.2R19Y1',
 'bridge_1913':build.get('bridge_version')=='1.9.13',
 'bridge_operator':build.get('bridge_role')=='operator',
 'bridge_loopback':build.get('bridge_host')=='127.0.0.1' and build.get('bridge_port')==8787,
 'backend_144':build.get('backend_version')=='1.4.4',
 'backend_loopback':build.get('backend_host')=='127.0.0.1' and build.get('backend_port')==8790,
 'okx_transport':build.get('backend_okx_local_transport') is True,
 'ollama_not_needed_for_okx':build.get('bridge_ollama_required_for_okx_transport') is False,
 'no_github_write':build.get('bridge_github_write') is False,
 'no_remote_publication':build.get('bridge_remote_publication') is False,
 'no_book_publish':build.get('bridge_book_mirror_publication') is False,
 'no_oracle_publish':build.get('bridge_oracle_evidence_publication') is False,
 'no_exchange':build.get('bridge_private_exchange') is False,
 'no_wallet':build.get('grants_wallet') is False,
 'token_memory':'token_storage: "memory_only"' in client,
 'zip_sha':build.get('bridge_package_sha256')=='d1b9c7191144157eec45404657d259c48ee6741a4b9c37c75a07deb50f8ad998',
 'exe_sha':build.get('bridge_exe_sha256')=='2d333589fa4352c6aa3b4a43f563df4d19e26ccff312c0e2525ccdf581acca99',
 'backend_sha':build.get('backend_sha256')=='782e6d1e73b7e1d2c09e1aa19b82e16a17be5d75f49a98a59d6623590f4a5c17',
 'contract_matches':contract.get('control_center')=='2.3.2R19Y1' and contract.get('backend',{}).get('version')=='1.4.4',
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
failed=[k for k,v in checks.items() if not v]
if failed: raise SystemExit('Guard failed: '+', '.join(failed))
print('YOHAN OPERATOR 40.6.509 · CONTROL CENTER R19Y1 · OKX BACKEND 1.4.4 GUARD PASS')
