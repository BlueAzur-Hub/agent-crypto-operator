/* Agent-Crypto: public vault reads independent of GitHub Pages. */
(()=>{"use strict";
 const BASE="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/";
 const PREFIX="public/agent_crypto_erith_ia/data/";
 const native=globalThis.fetch.bind(globalThis);
 const observed={routed:0,bypassed:0};
 function route(input,method="GET"){
  if(!/^(GET|HEAD)$/i.test(String(method)))return null;
  try{
   const url=new URL(input instanceof Request?input.url:String(input),document.baseURI);
   if(url.origin!==location.origin)return null;
   const start=url.pathname.indexOf("/"+PREFIX);
   if(start<0)return null;
   const prefixBefore=url.pathname.slice(0,start);
   if(prefixBefore!==""&&prefixBefore!=="/erith-ia-memory"&&prefixBefore!=="/agent-crypto-operator")return null;
   const relative=url.pathname.slice(start+1);
   if(!relative.startsWith(PREFIX)||relative.includes("\\")||/%(?:2f|5c)/i.test(relative))return null;
   const dest=new URL(relative,BASE);dest.search=url.search;
   return dest.href;
  }catch(_){return null;}
 }
 function routedFetch(input,init){
  const method=init?.method||(input instanceof Request?input.method:"GET");
  const dest=route(input,method);
  if(!dest){observed.bypassed++;return native(input,init);}
  const signal=init?.signal||(input instanceof Request?input.signal:undefined);
  const headers=new Headers(),original=new Headers(init?.headers||(input instanceof Request?input.headers:undefined));
  for(const name of ["accept","if-none-match","if-modified-since","range"]){
   if(original.has(name))headers.set(name,original.get(name));
  }
  observed.routed++;
  return native(dest,{method,mode:"cors",credentials:"omit",redirect:"error",cache:init?.cache||"default",signal,headers,referrerPolicy:"no-referrer"});
 }
 globalThis.fetch=routedFetch;
 globalThis.AgentCryptoVaultDataRouter=Object.freeze({route,stats:()=>Object.freeze({...observed}),read_only:true,private_access:false,public_source:BASE,revision:"runtime-pages"});
})();