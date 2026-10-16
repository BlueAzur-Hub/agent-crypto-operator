/* Seven Heaven · authenticated historical reader, isolated from orders and charts. */
(()=>{"use strict";
const ROOT=new URL("../data/historical_archive_prototype/verified_periods/",
 globalThis.location?.href||"https://example.invalid/public/agent_crypto_erith_ia/trader/verified-reader.html");
const PATH=/^(bitcoin|ethereum|binancecoin|ripple|solana)-(24h|7j|30j|60j|90j|1an|Max)\.json\.gz$/;
const STEP={"1m":60000,"5m":300000,"1h":3600000,"1d":86400000};
function need(ok,why){if(!ok)throw Error("Lecteur Coffre : "+why);}
async function digest(bytes){
 const hash=await crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function inflate(bytes){
 need(typeof DecompressionStream==="function","décompression gzip indisponible");
 const result=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
 need(result.byteLength>0&&result.byteLength<10000000,"projection décompressée trop volumineuse");
 return JSON.parse(new TextDecoder().decode(result));
}
function validate(data,meta,assetId,symbol){
 need(data?.schema==="seven.crypto.verified-period-projection","schéma de la projection");
 need(data.asset_id===assetId&&data.pair===symbol+"USDT"&&data.quote==="USDT",
  "identité ou devise échangée");
 need(data.period===meta.period&&data.resolution===meta.resolution&&data.is_live===false,
  "période ou statut non fiable");
 need(data.scope==="materialized_verified_history"||
  data.scope==="last_verified_closed_archive_window","portée non reconnue");
 need(Array.isArray(data.rows)&&data.rows.length===meta.points,"nombre de bougies incompatible");
 need(Array.isArray(data.gaps),"déclaration des lacunes absente");
 const step=STEP[meta.resolution];need(step>0,"résolution invalide");
 let previous=null,gaps=0;
 for(const row of data.rows){
  need(Array.isArray(row)&&row.length===8,"OHLCV incomplète");
  const [t,o,h,l,c,base,quote,trades]=row;
  need(Number.isSafeInteger(t)&&t>0&&Number.isFinite(o)&&o>0&&Number.isFinite(h)&&
   Number.isFinite(l)&&Number.isFinite(c)&&Number.isFinite(base)&&Number.isFinite(quote)&&
   Number.isFinite(trades)&&base>=0&&quote>=0&&trades>=0&&
   l>0&&h>=Math.max(o,c,l)&&l<=Math.min(o,c,h),"prix ou volume invalide");
  if(previous!==null){need(t>previous&&(t-previous)%step===0,"ordre ou intervalle invalide");
   if(t-previous>step)gaps++;}
  previous=t;
 }
 need(data.rows[0][0]===data.start_ms&&previous+step===data.end_exclusive_ms,
  "bornes UTC incohérentes");
 need(data.gaps.length===gaps,"liste de lacunes contradictoire");
 need(meta.period==="Max"||gaps===0,"rupture sur une période annoncée continue");
 return Object.freeze({source:"Binance Spot vérifié · projection archivée",assetId,
  symbol,period:meta.period,quote:"USDT",resolution:meta.resolution,points:data.rows.length,
  firstMs:data.start_ms,endExclusiveMs:data.end_exclusive_ms,gaps:gaps,
  isLive:false,isAllTime:false,sha256:meta.sha256,rows:data.rows});
}
async function read({assetId,period,signal}){
 const source=globalThis.AgentCryptoHistorySourceCatalog;
 need(source&&typeof source.query==="function","catalogue de sources absent");
 const catalog=source.snapshot()||await source.load();
 const q=source.query(catalog,{id:assetId,period});
 need(q.status==="PREPARED_SNAPSHOT","période exacte non préparée");
 const m=q.source;
 need(PATH.test(m.file)&&m.file===assetId+"-"+period+".json.gz",
  "chemin canonique refusé");
 need(m.quote==="USDT"&&m.venue==="Binance Spot"&&m.snapshot===true&&!m.isLive,
  "source ou cotation inattendue");
 const url=new URL(m.file,ROOT);
 need(url.origin===ROOT.origin&&url.pathname.startsWith(ROOT.pathname),"chemin extérieur");
 const resp=await fetch(url.href,{credentials:"omit",cache:"force-cache",redirect:"error",signal});
 need(resp.ok,"téléchargement HTTP "+resp.status);
 const raw=await resp.arrayBuffer();
 need(raw.byteLength===m.bytes&&raw.byteLength>0&&raw.byteLength<500000,
  "taille de l'archive falsifiée");
 need(await digest(raw)===m.sha256,"SHA-256 invalide, données rejetées");
 const data=await inflate(raw);
 return validate(data,m,assetId,q.symbol);
}
globalThis.AgentCryptoVerifiedHistoryReader=Object.freeze({read,validate,read_only:true,real_orders:false});
})();
