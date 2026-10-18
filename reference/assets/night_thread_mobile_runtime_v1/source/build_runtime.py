from pathlib import Path
from PIL import Image,ImageChops
import hashlib,json,math,shutil,collections,zipfile,subprocess
P=Path(__file__).resolve().parents[1];M=P.parent/'dream'
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def scaled(v,sx,sy):return [round(v[0]*sx,4),round(v[1]*sy,4)]
def pngmetrics(im):
 if im.mode!='RGBA':return {'opaque':True}
 a=im.getchannel('A');return {'extrema':list(a.getextrema()),'alphaBounds':a.getbbox(),'visibleBoundsAlpha128':a.point(lambda v:255 if v>=128 else 0).getbbox(),'fullyTransparentFraction':round(a.histogram()[0]/(im.width*im.height),6)}
master=json.loads((M/'asset_manifest.json').read_text());rows=[];checks=[]
for a in master['assets']:
 path=M/a['path'];r={'assetId':a['assetId'],'category':a['category'],'scene':a.get('scene'),'state':a.get('state'),'usage':a.get('usage'),'masterPath':a['path'],'masterSha256':h(path),'masterDimensions':[a['width'],a['height']],'releaseApproved':False,'notationReview':a.get('notationReview'),'listeningReview':a.get('listeningReview'),'releaseGate':'Artwork user approval, music educator review where relevant, runtime and physical-device integration remain pending.'}
 if a['sourceType']=='built-in-imagegen':
  target=(1152,768) if a['category']=='background' else (384,384) if 'somsae' in a['assetId'] else (512,512)
  im=Image.open(path);im.load()
  # Premultiplied filtering prevents hidden RGB from bleeding through translucent borders.
  targetim=im.convert('RGBa').resize(target,Image.Resampling.LANCZOS).convert('RGBA') if im.mode=='RGBA' else im.convert('RGB').resize(target,Image.Resampling.LANCZOS)
  primary=Path(a['path']).with_suffix('.webp');out=P/primary;out.parent.mkdir(parents=True,exist_ok=True)
  params={'lossless':True,'quality':100,'method':6,'exact':True,'alpha_quality':100} if im.mode=='RGBA' else {'quality':82,'method':6}
  targetim.save(out,'WEBP',**params)
  fallback=Path('png_fallbacks')/a['path'];f=P/fallback;f.parent.mkdir(parents=True,exist_ok=True);targetim.save(f,'PNG',optimize=True)
  decoded=Image.open(out);decoded.load();decoded=decoded.convert(targetim.mode)
  if im.mode=='RGBA':
   alphaeq=ImageChops.difference(decoded.getchannel('A'),targetim.getchannel('A')).getbbox() is None
   pixeq=decoded.tobytes()==targetim.tobytes();checks += [{'assetId':a['assetId'],'check':'lossless-rgba-roundtrip','passed':pixeq},{'assetId':a['assetId'],'check':'alpha-roundtrip','passed':alphaeq}]
   metric={'losslessPixelIdenticalToResizedPNG':pixeq,'alphaPixelIdenticalToResizedPNG':alphaeq}
  else:
   hist=ImageChops.difference(targetim,decoded).histogram();mse=sum((i%256)**2*n for i,n in enumerate(hist))/(target[0]*target[1]*3);psnr=10*math.log10(255*255/mse) if mse else 99
   metric={'rgbPSNRdBvsResizedPNG':round(psnr,3),'note':'Codec fidelity measurement only, not device display quality.'};checks.append({'assetId':a['assetId'],'check':'background-psnr-at-least-32dB','passed':psnr>=32})
  sx=target[0]/a['width'];sy=target[1]/a['height']
  r.update({'path':str(primary),'format':'image/webp','width':target[0],'height':target[1],'bytes':out.stat().st_size,'sha256':h(out),'pngFallbackPath':str(fallback),'pngFallbackBytes':f.stat().st_size,'pngFallbackSha256':h(f),'resample':'premultiplied-alpha Lanczos' if im.mode=='RGBA' else 'RGB Lanczos','codec':params,'anchorPx':scaled(a['anchorPx'],sx,sy),'anchorNormalized':a['anchorNormalized'],'alpha':pngmetrics(decoded),'codecValidation':metric,'decodedRGBABytesEstimate':target[0]*target[1]*4})
  if 'cropRects' in a:r['cropRects']={k:[round(v[0]*sx,6),round(v[1]*sy,6),round(v[2]*sx,6),round(v[3]*sy,6)] for k,v in a['cropRects'].items()};r['safeGameplayMasterNormalized']=a['safeGameplayMasterNormalized'];r['reducedMotionPath']=str(primary)
 else:
  out=P/a['path'];out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,out);r.update({'path':a['path'],'format':'image/svg+xml','width':a['width'],'height':a['height'],'bytes':out.stat().st_size,'sha256':h(out),'anchors':a.get('anchors',{}),'decodedRGBABytesEstimate':a['width']*a['height']*4,'memoryEstimateAssumption':'SVG rasterized once at intrinsic viewBox size; actual DPR/raster scale changes memory quadratically.','svgByteIdenticalToMaster':h(out)==h(path)})
  checks.append({'assetId':a['assetId'],'check':'svg-master-byte-match','passed':h(out)==h(path)})
 rows.append(r)
# Copy labels, data and necessary licensing/geometry notes unchanged.
for p in ['ui/labels.ko.json','source/dream_level_examples.json','docs/DejaVu_fonts_license.txt','docs/Noto_fonts_license.txt','docs/VECTOR_GUIDE.md','vector_QA.json']:
 out=P/p;out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(M/p,out)
lookup={r['assetId']:r for r in rows};common=[r['assetId'] for r in rows if r['scene']=='shared']
# Main art mode uses generated flower poses; do not also load vector alternative flowers.
profiles={}
for scene in ['thread-bridge','crescent-greenhouse','folding-room','cloud-post']:
 ids=common+[r['assetId'] for r in rows if r['scene']==scene and not r['assetId'].startswith('greenhouse_flower_')]
 primary=sum(lookup[i]['bytes'] for i in ids);fallback=sum(lookup[i].get('pngFallbackBytes',lookup[i]['bytes']) for i in ids);memory=sum(lookup[i]['decodedRGBABytesEstimate'] for i in ids)
 profiles[scene]={'assetIds':ids,'primaryAssetFileBytes':primary,'pngFallbackAssetFileBytes':fallback,'decodedRGBABytesEstimate':memory,'decodedMiBEstimate':round(memory/1048576,3),'withOneEducationDiagramBytesEstimate':memory+1024*640*4,'withMipmapsBytesEstimate':math.ceil(memory*4/3),'rasterizationScaleForSVG':1,'audioReserveBytes':2000000,'primaryAssetsPlusAudioReserveBytes':primary+2000000,'under8MBBeforeAppCodeAndHeaders':primary+2000000<8000000,'notes':['Choose either WebP or fallback PNG, never both.','Includes all common key poses and both normal/high-contrast UI as a conservative resident estimate.','No simultaneous old/new background transition texture; unload unused scene textures.','One diagram allocated on results only; do not preload all ten.']}
manifest={'schemaVersion':1,'packVersion':'night-thread-mobile-runtime/1.0.0','createdDate':'2026-10-18','masterPackVersion':master['packVersion'],'masterManifestSha256':h(M/'asset_manifest.json'),'logicalAssetCount':len(rows),'designBudgets':{'initialTransferBytes':8000000,'essentialAudioBytes':2000000,'decodedTextureBudgetSpecified':False,'note':'Targets from design11.2. Memory estimates below are planning figures; no source-design GPU-memory limit was specified.'},'rasterPresets':{'background':[1152,768],'yeoulAndFlower':[512,512],'somsae':[384,384]},'cropPolicy':'Central4:3=1024x768; central16:9=1152x648. Use runtime cropRects; do not apply master-pixel crop to derivative.','loadProfiles':profiles,'levelSceneBindings':master['levelSceneBindings'],'assets':rows,'testStatus':{'staticVisual':'pending','codecAndAlpha':'passed' if all(x['passed'] for x in checks) else 'failed','humanNotation':'pending','listening':'pending','runtimeAnimation':'notRun','browserDecode':'notRun','physicalDevice':'notRun','releaseApproved':False}}
write(P/'runtime_manifest.json',manifest);write(P/'docs/RUNTIME_QA.json',{'checks':checks,'passed':sum(x['passed'] for x in checks),'total':len(checks),'masterFilesModified':False,'notRun':['browser feature detection and WebP decode','physical iPhone/Android tests','animation switching and timing','audio','GPU memory profiling']})
assert all(c['passed'] for c in checks),[c for c in checks if not c['passed']]
print(json.dumps({'assets':len(rows),'primaryRasterBytes':sum(r['bytes'] for r in rows if r['format']=='image/webp'),'allPrimaryBytes':sum(r['bytes'] for r in rows),'allFallbackBytes':sum(r.get('pngFallbackBytes',0) for r in rows),'loadProfiles':profiles},ensure_ascii=False,indent=2))
