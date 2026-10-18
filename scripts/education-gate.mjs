import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../public/assets/night-thread/runtime_manifest.json',import.meta.url),'utf8'));
const assets=Array.isArray(manifest.assets)?manifest.assets:Object.values(manifest.assets);
const pending=assets.filter(a=>a.releaseApproved!==true);
if(pending.length){console.error(`교육 공개 출고 차단: ${pending.length}/${assets.length} 자산의 사람 승인 근거가 미완료입니다. 내부 프리뷰만 허용됩니다.`);process.exitCode=1;}else{console.log('승인 파일 상태를 확인했습니다. 별도의 수동 승인 근거도 검토하세요.');}
