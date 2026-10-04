'use client';
import { useRef, useState, useEffect } from 'react';
import './media-uploader.css';
function Icon({size=18,className='',...rest}: {size?:number;className?:string;strokeWidth?:number}) {return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={rest.strokeWidth||1.7} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 17 6-6 4 4 3-3 5 5"/><circle cx="16" cy="8" r="1"/></svg>}
const ImagePlus=Icon;
function Upload({size=18}:{size?:number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/></svg>; }
function Folder({size=18}:{size?:number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 7V4h6l3 3h9v13H3Z"/></svg>; }
function LoaderCircle({size=18,className=''}:{size?:number;className?:string}) { return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/></svg>; }
type Item = { id: string; file: File; preview: string; status: 'queued'|'uploading'|'done'|'error'; progress: number; url?: string; error?: string };
export default function MediaUploader() {
  const [items,setItems] = useState<Item[]>([]);
  const [config,setConfig] = useState<{ready:boolean; folder:string}|null>(null);
  const [configError,setConfigError] = useState('');
  const [busy,setBusy] = useState(false);
  const [drag,setDrag] = useState(false);
  const [copied,setCopied] = useState('');
  const [notice,setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);
  useEffect(()=>()=>previews.current.forEach(URL.revokeObjectURL),[]);
  useEffect(()=>{fetch('/api/admin/media/config',{cache:'no-store'}).then(async r=>{if(!r.ok) throw Error('Could not check your connection. Refresh to try again.');setConfig(await r.json());}).catch(e=>setConfigError(e.message));},[]);
  function add(files: FileList | File[]) {
    const next: Item[]=[]; let rejected=0;
    for(const file of Array.from(files)) {
      if(!['image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif'].includes(file.type)||file.size>10*1024*1024||file.size===0){rejected++;continue;}
      const preview=URL.createObjectURL(file);previews.current.push(preview);
      next.push({id:crypto.randomUUID(),file,preview,status:'queued',progress:0});
    }
    setItems(old=>[...old,...next]);setNotice(rejected?`${rejected} file(s) could not be added. Choose images up to 10 MB each.`:'');
  }
  function update(id:string, patch:Partial<Item>){setItems(old=>old.map(i=>i.id===id?{...i,...patch}:i));}
  async function uploadAll(){
    if(busy)return;setBusy(true);setNotice('');
    for(const item of items.filter(i=>i.status==='queued'||i.status==='error')){
      update(item.id,{status:'uploading',progress:0,error:undefined});
      try {
        const res=await fetch('/api/admin/media/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
        const auth=await res.json() as {error?:string;params:Record<string,string>;apiKey:string;signature:string;endpoint:string};if(!res.ok)throw Error(auth.error||'Unable to start upload.');
        const form=new FormData();form.append('file',item.file);
        Object.entries(auth.params).forEach(([key,value])=>form.append(key,String(value)));
        form.append('api_key',auth.apiKey);form.append('signature',auth.signature);
        const url=await new Promise<string>((resolve,reject)=>{
          const xhr=new XMLHttpRequest();xhr.open('POST',auth.endpoint);xhr.timeout=180000;
          xhr.upload.onprogress=e=>{if(e.lengthComputable)update(item.id,{progress:Math.round(e.loaded/e.total*100)});};
          xhr.onerror=()=>reject(Error('Connection lost. Please try again.'));
          xhr.ontimeout=()=>reject(Error('Upload timed out. Please try again.'));
          xhr.onload=()=>{try{const data=JSON.parse(xhr.responseText);if(xhr.status<200||xhr.status>=300)throw Error(data.error?.message||'Upload failed.');const u=new URL(data.secure_url);if(u.protocol!=='https:'||u.hostname!=='res.cloudinary.com')throw Error('Unexpected image URL.');resolve(u.href);}catch(e){reject(e);}};
          xhr.send(form);
        });
        update(item.id,{status:'done',progress:100,url});
      }catch(e){update(item.id,{status:'error',error:e instanceof Error?e.message:'Upload failed. Please retry.'});}
    }setBusy(false);
  }
  async function copy(item:Item){try{await navigator.clipboard.writeText(`![img](${item.url})`);setCopied(item.id);setTimeout(()=>setCopied(''),2200);}catch{setNotice('Clipboard access is unavailable. Select and copy the Markdown below.');}}
  const pending=items.filter(i=>i.status==='queued'||i.status==='error').length;
  return <div className="media-uploader">
    <div className="intro"><h1>Media</h1><p>Upload images and copy the Markdown into your next post.</p></div>
    <div className="destination"><span><Folder size={17}/>Upload folder</span><strong>{config?.folder||'Waiting for setup'}</strong></div>
    {configError&&<p role="alert" className="alert">{configError}</p>}
    {config&&!config.ready&&<p className="alert">Your Cloudinary connection needs to be completed before uploading.</p>}
    <section className={`dropzone ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(!busy)add(e.dataTransfer.files);}}>
      <div className="upload-icon"><ImagePlus size={32} strokeWidth={1.5}/></div><h2>Drop your images here</h2><p>or choose a few from your device</p><button className="primary" disabled={busy} onClick={()=>input.current?.click()}><Upload size={17}/>Choose images</button><span className="file-hint">JPG, PNG, WebP, GIF, AVIF or HEIC · Up to 10 MB each</span><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif" multiple hidden onChange={e=>{if(e.target.files)add(e.target.files);e.target.value='';}}/>
    </section>
    <div role="status" aria-live="polite">{notice&&<p className="alert">{notice}</p>}</div>
    {items.length>0&&<section className="results"><div className="section-heading"><h2>Your images <span>{items.length}</span></h2>{pending>0&&<button className="primary" disabled={busy||!config?.ready} onClick={uploadAll}>{busy?<LoaderCircle className="spin" size={17}/>:<Upload size={17}/>} {busy?'Uploading…':`Upload ${pending} image${pending===1?'':'s'}`}</button>}</div>
      <div className="image-list">{items.map(item=><article className="image-card" key={item.id}><div className="thumbnail"><img src={item.preview} alt=""/></div><div className="image-details"><div className="item-top"><h3 title={item.file.name}>{item.file.name}</h3>{item.status!=='uploading'&&<button className="icon-button" aria-label={`Remove ${item.file.name} from this list`} onClick={()=>setItems(old=>old.filter(i=>i.id!==item.id))}><span aria-hidden="true">×</span></button>}</div><p className="metadata">{(item.file.size/1024/1024).toFixed(2)} MB <span>·</span> {item.status==='done'?'Uploaded':item.status==='uploading'?`Uploading ${item.progress}%`:item.status==='error'?'Needs retry':'Ready to upload'}</p>{item.status==='uploading'&&<progress max="100" value={item.progress} aria-label={`Uploading ${item.file.name}`}/>}{item.error&&<p role="alert" className="error">{item.error}</p>}{item.url&&<div className="markdown-row"><input aria-label={`Markdown for ${item.file.name}`} readOnly value={`![img](${item.url})`} onFocus={e=>e.target.select()}/><button className={`copy-button ${copied===item.id?'copied':''}`} onClick={()=>copy(item)}>{copied===item.id?'Copied!':'Copy Markdown'}</button></div>}</div></article>)}</div><p className="session-note">This list is for your current session. Your images stay in Cloudinary.</p></section>}
    </div>;
}
