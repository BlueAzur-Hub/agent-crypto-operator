#!/usr/bin/env python3
from pathlib import Path
import hashlib,json

root=Path(__file__).resolve().parents[2]
base=root/'public'/'agent_crypto_erith_ia'
build=json.loads((base/'operator'/'build.json').read_text(encoding='utf-8'))
yohan=(base/'administrator'/'yohan.html').read_text(encoding='utf-8')
profile=(base/'administrator'/'js'/'yohan-operator-profile.js').read_text(encoding='utf-8')
client=(base/'administrator'/'js'/'yohan-operator-bridge-client.js').read_text(encoding='utf-8')
package=base/'operator'/'bridge_yohan'/'YOHAN_OPERATOR_BRIDGE_V1.0.0_FULL.zip'
expected='6dd45336225d5ad6938db3df8f778662c01d9529917ef8d20cccbe38170668d9'
checks={
 'build_509':build.get('build')=='40.6.509',
 'master_509':'index-40.6.509.html' in yohan,
 'market_core':build.get('market_core')=='38.15.11',
 'master_repo':build.get('runtime_repository')=='BlueAzur-Hub/erith-ia-memory',
 'no_admin_grant':build.get('grants_administrator_session') is False and 'administrator_grant: false' in profile,
 'query_not_auth':build.get('query_parameter_is_authorization') is False,
 'bridge_operator':build.get('bridge_role')=='operator',
 'bridge_loopback':build.get('bridge_host')=='127.0.0.1' and build.get('bridge_port')==8787,
 'no_github_write':build.get('bridge_github_write') is False,
 'no_exchange':build.get('bridge_private_exchange') is False,
 'no_wallet':build.get('grants_wallet') is False,
 'token_memory':'token_storage: "memory_only"' in client,
 'package_present':package.is_file(),
 'package_sha':package.is_file() and hashlib.sha256(package.read_bytes()).hexdigest()==expected,
}
for k,v in checks.items(): print(f'{k}: {"PASS" if v else "FAIL"}')
failed=[k for k,v in checks.items() if not v]
if failed: raise SystemExit('Guard failed: '+', '.join(failed))
print('YOHAN OPERATOR 40.6.509 + BRIDGE V1.0.0 GUARD PASS')
