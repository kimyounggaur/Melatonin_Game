from pathlib import Path
from xml.sax.saxutils import escape
import subprocess,base64,io
from PIL import Image
P=Path(__file__).resolve().parents[1]
s=['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1650" viewBox="0 0 1600 1650"><rect width="1600" height="1650" fill="#0D1E27"/>']
def t(x,y,text,size=22):s.append(f'<text x="{x}" y="{y}" fill="#F3E8C9" font-family="Noto Sans CJK KR, sans-serif" font-size="{size}">{escape(text)}</text>')
def im(p,x,y,w,h):
 uri='../'+p
 if p.endswith('.webp'):
  # Inkscape build lacks WebP image import. Embed actual Pillow-decoded WebP pixels as lossless PNG for the comparison document.
  b=io.BytesIO();Image.open(P/p).save(b,'PNG');uri='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
 s.append(f'<image href="{uri}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet"/>')
t(52,62,'밤실 공방 · 모바일 전달본 비교',40)
t(52,103,'왼쪽: 같은 크기 PNG 기준본  /  오른쪽: WebP 전달본',22)
t(52,137,'4개 배경 1152×768 · 여울/꽃 512×512 · 솜새 384×384 · 내용과 투명 배경 유지',20)
for i,name in enumerate(['scene_a_thread_bridge','scene_b_crescent_greenhouse','scene_c_folding_room','scene_d_cloud_post_station']):
 x=48+(i%2)*780;y=178+(i//2)*345
 t(x,y+24,['실빛다리','반달 온실','접히는 방','구름 우체역'][i],24)
 for j,(folder,ext) in enumerate([('png_fallbacks/backgrounds','png'),('backgrounds','webp')]):
  im(f'{folder}/{name}.{ext}',x+j*378,y+44,366,244)
  t(x+j*378+8,y+316,['PNG reference','WebP quality 82'][j],18)
t(52,922,'투명 스프라이트 · 손실 없는 WebP',30)
for i,(folder,name) in enumerate([('characters','yeoul_hold'),('characters','somsae_encourage'),('objects','flower_open')]):
 x=48+i*516;y=952
 for j,back in enumerate(['#142A35','#F3E8C9']):
  s.append(f'<rect x="{x+j*250}" y="{y}" width="242" height="510" rx="14" fill="{back}"/>')
  im(f'{"png_fallbacks/" if j==0 else ""}{folder}/{name}.{"png" if j==0 else "webp"}',x+j*250+4,y+30,234,390)
  t(x+j*250+8,y+543,['PNG reference','WebP lossless'][j],18)
 t(x+8,y+582,name,20)
t(52,1602,'정지 파일·코덱 비교 완료. 브라우저 디코드·실기기 성능·애니메이션 검증은 별도입니다.',20)
s.append('</svg>');p=P/'previews/mobile_runtime_comparison.svg';p.write_text(''.join(s))
r=subprocess.run(['inkscape',str(p),'--export-type=png',f'--export-filename={p.with_suffix(".png")}'],capture_output=True);print(r.returncode)
if r.returncode==0:p.unlink()
