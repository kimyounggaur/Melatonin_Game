import fs from 'node:fs';
const base=process.argv[2]??'http://127.0.0.1:5289';
const r=await fetch(base),html=await r.text();
const paths=[...html.matchAll(/(?:src|href)="([^"]+)/g)].map(m=>m[1]).filter(p=>p.startsWith('./'));
const manifest=JSON.parse(fs.readFileSync(new URL('../public/assets/night-thread/runtime_manifest.json',import.meta.url),'utf8'));
const results=[{path:'/',status:r.status}];
for(const p of [...paths,`/assets/night-thread/${manifest.assets.find(a=>a.category==='background').path}`,'/assets/night-thread/runtime_manifest.json']){
  const response=await fetch(new URL(p,base));results.push({path:p,status:response.status,bytes:(await response.arrayBuffer()).byteLength});
}
fs.writeFileSync(new URL('../reports/local-server-check.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
console.log(results);if(results.some(r=>r.status!==200))process.exitCode=1;
