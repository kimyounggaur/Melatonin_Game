import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const files=[
 ['reference/promptpack.md','1d2Y0aORs0dQsA8s5JUicTApE7ci4ha6b'],
 ['reference/design.md','1JvydwaMM3ha5sgdayFlhabsHjfMjQcSv'],
 ['reference/mobile-assets.zip','1vY7Wj3NcMg0uQvu2t8BgpTAcwDVE2GNY'],
 ['reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json','1cx1KieOJzKACIqadGLTRs0P9DFrfydjU'],
 ['reference/original-asset-manifest.json','1cOW2oCFFVkpBevj9Vvwiy7-eKc0SAOqI'],
 ['reference/original-assets-README.md','1JfxVv7UuDhAITj_BPbus6e38vRPVWerR'],
 ['reference/assets/night_thread_mobile_runtime_v1/README.md','178WtBrrvk9LfokOhSc5kFtQfbiZTF8HD']
].map(([file,driveId])=>{const bytes=fs.readFileSync(path.join(root,file));return {file,driveId,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),sourceModified:false};});
const original=JSON.parse(fs.readFileSync(path.join(root,'reference/original-asset-manifest.json'),'utf8'));
const runtime=JSON.parse(fs.readFileSync(path.join(root,'reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json'),'utf8'));
const originalIds=original.assets.map(a=>a.assetId).sort(),runtimeIds=runtime.assets.map(a=>a.assetId).sort();
if(JSON.stringify(originalIds)!==JSON.stringify(runtimeIds))throw new Error('Original/runtime asset ID mismatch');
const report={project:'밤실 공방',contentVersion:'1.0.0',environment:{platform:process.platform,node:process.version,location:root,model:'Codex current session; no model or reasoning UI change was performed or claimed'},files,assets:{logicalCount:runtime.assets.length,originalRuntimeIdsEqual:true,primaryBytes:runtime.assets.reduce((s,a)=>s+a.bytes,0),originalReviewStatus:original.reviewStatus,runtimeUnapprovedCount:runtime.assets.filter(a=>a.releaseApproved===false).length},review:{math:'automated passed; see test reports',humanNotation:'pending',physicalListening:'not run',physicalDevices:'not run',publicDeployment:'not requested; not performed'}};
fs.writeFileSync(path.join(root,'source-provenance.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:files.length,idsEqual:true,logicalAssets:runtime.assets.length,unapproved:report.assets.runtimeUnapprovedCount}));
