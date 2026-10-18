import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.argv[2]??5286);
if(!Number.isInteger(port)||port<1024||port>65535||port>=5180&&port<=5183)throw new Error('허용된 독립 포트를 지정하세요. 기본값은 5286입니다.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=createServer(async(req,res)=>{
  try{const url=new URL(req.url??'/','http://127.0.0.1');const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)&&file!==path.join(root,'index.html')){res.writeHead(403);res.end();return;}if(!(await stat(file)).isFile())throw new Error('not file');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(bytes);}catch{res.writeHead(404);res.end('File not found. Run npm run build first.');}
});
server.on('error',e=>{console.error(`밤실 서버를 열지 못했습니다: ${e.message}. ${port} 포트의 기존 밤실 서버를 확인하세요.`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`밤실 공방: http://127.0.0.1:${port}/ (이 컴퓨터에서만 접근)`));
