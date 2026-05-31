import { useState } from "react";

function getYtId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
function parseTs(ts) {
  if (!ts) return 0;
  const p = ts.split(":").map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return parseInt(ts) || 0;
}
function fmtDur(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function fmtTs(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function safeJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); } catch {}
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}
async function callClaude(messages, system = "", maxTokens = 5000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages }),
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.content?.map(b => b.text || "").join("") || "";
}

const CATEGORIES = [
  { id:"podcast", label:"Podcast & Blogging", emoji:"🎙️" },
  { id:"gaming",  label:"Gaming",             emoji:"🎮" },
  { id:"edu",     label:"Education",          emoji:"📚" },
  { id:"vlog",    label:"Vlog & Lifestyle",   emoji:"🌟" },
  { id:"tech",    label:"Teknologi",          emoji:"💻" },
  { id:"bisnis",  label:"Bisnis & Finance",   emoji:"💰" },
  { id:"masak",   label:"Masak & Kuliner",    emoji:"🍳" },
  { id:"otomotif",label:"Otomotif",           emoji:"🚗" },
];
const DURATIONS   = ["15-30s","30-60s","60-90s","1-3 menit"];
const RESOLUTIONS = ["480p","720p","1080p"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#0d0d0d;color:#f0f0f0;-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px #c9973355}50%{box-shadow:0 0 40px #c9973388}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#c9973344;border-radius:2px}
input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
`;

function Spinner({ size=16, color="#c99733" }) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>;
}

function CopyBtn({ text, label="Copy" }) {
  const [ok,setOk] = useState(false);
  return (
    <button onClick={()=>{navigator.clipboard?.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}}
      style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${ok?"#22c55e44":"rgba(255,255,255,.1)"}`,background:ok?"rgba(34,197,94,.1)":"rgba(255,255,255,.05)",color:ok?"#22c55e":"#777",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .15s",whiteSpace:"nowrap"}}>
      {ok?"✓ Tersalin":"📋 "+label}
    </button>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
      <div onClick={()=>onChange(!value)} style={{width:38,height:21,borderRadius:11,position:"relative",background:value?"#c99733":"rgba(255,255,255,.1)",transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",top:2.5,left:value?18:2.5,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.4)"}}/>
      </div>
      <span style={{fontSize:12,color:"#666"}}>{label}</span>
    </label>
  );
}

function SectionLabel({ children }) {
  return <div style={{fontSize:10,color:"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:9}}>{children}</div>;
}

function DownloadBtn({ ytId, startS, endS, dur, filename }) {
  const [phase, setPhase] = useState("idle");
  const [dlUrl, setDlUrl] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [progress, setProgress] = useState(0);

  const fetchLink = async () => {
    setPhase("fetching"); setErrMsg("");
    try {
      const body = { url:`https://www.youtube.com/watch?v=${ytId}`, videoQuality:"720", filenameStyle:"pretty", downloadMode:"auto" };
      const res = await fetch("https://api.cobalt.tools/", { method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.error?.code || "cobalt error");
      const url = data.url || (data.picker && data.picker[0]?.url);
      if (!url) throw new Error("No download URL returned");
      setDlUrl(url); setPhase("ready");
    } catch (e) {
      const ytCutter = `https://ytcutter.cc/?url=${encodeURIComponent("https://www.youtube.com/watch?v="+ytId)}&start=${startS}&end=${endS}`;
      setDlUrl(ytCutter);
      setErrMsg("API gagal — menggunakan YT Cutter sebagai fallback");
      setPhase("ready");
    }
  };

  const triggerSave = async () => {
    setPhase("saving"); setProgress(0);
    try {
      const response = await fetch(dlUrl, { mode:"cors" });
      if (!response.ok || !response.body) throw new Error("stream failed");
      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength) : 0;
      const reader = response.body.getReader();
      const chunks = []; let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); received += value.length;
        if (total) setProgress(Math.round((received/total)*100));
        else setProgress(prev => Math.min(prev+4, 90));
      }
      setProgress(100);
      const blob = new Blob(chunks, {type:"video/mp4"});
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = filename || `klip_${ytId}_${startS}-${endS}.mp4`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      setPhase("done");
    } catch {
      window.open(dlUrl, "_blank"); setPhase("done");
    }
  };

  const reset = () => { setPhase("idle"); setDlUrl(null); setProgress(0); setErrMsg(""); };
  const btnBase = { display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"15px",borderRadius:12,border:"none",width:"100%",fontWeight:800,fontSize:14,cursor:"pointer",transition:"all .2s",fontFamily:"'Plus Jakarta Sans',sans-serif" };

  if (phase==="idle") return (
    <button onClick={fetchLink} style={{...btnBase,background:"linear-gradient(135deg,#c99733,#a07828)",color:"#000",boxShadow:"0 4px 24px rgba(201,151,51,.35)",animation:"glow 2s ease-in-out infinite"}}>
      ✂️ Siapkan Download Klip
      <span style={{fontSize:10,background:"rgba(0,0,0,.2)",borderRadius:4,padding:"2px 6px"}}>Step 1</span>
    </button>
  );
  if (phase==="fetching") return (
    <div style={{...btnBase,background:"rgba(201,151,51,.08)",border:"1px solid rgba(201,151,51,.3)",color:"#c99733",cursor:"default"}}>
      <Spinner color="#c99733"/><span>AI sedang mengambil link klip...</span>
    </div>
  );
  if (phase==="ready") return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {errMsg && <div style={{fontSize:10,color:"#fb923c",background:"rgba(251,146,60,.08)",border:"1px solid rgba(251,146,60,.2)",borderRadius:8,padding:"6px 10px"}}>⚠️ {errMsg}</div>}
      <div style={{background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:"10px 13px",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16}}>✅</span>
        <div><div style={{fontSize:11,color:"#22c55e",fontWeight:700}}>Link klip berhasil didapat!</div>
        <div style={{fontSize:10,color:"#555",marginTop:1}}>{fmtTs(startS)} → {fmtTs(endS)} · {fmtDur(dur)}</div></div>
      </div>
      <button onClick={triggerSave} style={{...btnBase,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",boxShadow:"0 4px 24px rgba(34,197,94,.3)"}}>
        ⬇️ Download & Simpan ke Perangkat
        <span style={{fontSize:10,background:"rgba(0,0,0,.2)",borderRadius:4,padding:"2px 6px"}}>Step 2</span>
      </button>
      <button onClick={reset} style={{background:"none",border:"none",color:"#444",fontSize:11,cursor:"pointer",textDecoration:"underline",padding:"2px"}}>Batal / Ulangi</button>
    </div>
  );
  if (phase==="saving") return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{...btnBase,background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",color:"#22c55e",cursor:"default"}}>
        <Spinner color="#22c55e"/><span>{progress>0?`Mengunduh... ${progress}%`:"Menyiapkan file..."}</span>
      </div>
      {progress>0 && <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#22c55e77,#22c55e)",borderRadius:2,transition:"width .3s"}}/></div>}
    </div>
  );
  if (phase==="done") return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{...btnBase,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.3)",color:"#22c55e",cursor:"default"}}>🎉 Video tersimpan di perangkat kamu!</div>
      <button onClick={reset} style={{background:"none",border:"1px solid rgba(255,255,255,.08)",color:"#666",fontSize:11,cursor:"pointer",padding:"8px",borderRadius:8,fontWeight:600}}>↩ Download Lagi</button>
    </div>
  );
  return null;
}

function PlayerModal({ clip, ytId, onClose }) {
  const [tab, setTab] = useState("info");
  const startS = parseTs(clip.timestamp_start);
  const endS   = parseTs(clip.timestamp_end);
  const dur    = Math.max(0, endS - startS);
  const sc     = clip.viral_score || 78;
  const scCol  = sc>=90?"#22c55e":sc>=80?"#84cc16":sc>=70?"#c99733":"#fb923c";
  const tags   = (clip.hashtags||[]).map(h=>h.startsWith("#")?h:"#"+h).join(" ");
  const desc   = clip.description || "";
  const copyAll = `${clip.title}\n\n${desc}\n\n${tags}`;
  const embedUrl = `https://www.youtube.com/embed/${ytId}?start=${startS}&end=${endS}&autoplay=1&rel=0&modestbranding=1`;
  const safeTitle = (clip.title||"klip").replace(/[^a-zA-Z0-9\s]/g,"").replace(/\s+/g,"_").slice(0,40);
  const filename = `${safeTitle}_${fmtTs(startS).replace(/:/g,"-")}-${fmtTs(endS).replace(/:/g,"-")}.mp4`;

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.92)",backdropFilter:"blur(10px)",overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{maxWidth:480,margin:"0 auto",background:"#111",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",position:"sticky",top:0,zIndex:10}}>
          <span style={{fontSize:13,fontWeight:800,color:"#f0f0f0"}}>📹 Detail Klip</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",color:"#aaa",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{position:"relative",paddingTop:"56.25%",background:"#000"}}>
          <iframe src={embedUrl} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen allow="autoplay; encrypted-media"/>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          {[{id:"info",l:"📋 Info"},{id:"copy",l:"✏️ Caption"},{id:"dl",l:"⬇️ Download"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#c99733":"transparent"}`,color:tab===t.id?"#c99733":"#555",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s"}}>{t.l}</button>
          ))}
        </div>
        <div style={{padding:"16px",flex:1}}>
          {tab==="info" && (
            <div style={{animation:"fadeUp .2s ease"}}>
              <div style={{fontSize:14,fontWeight:800,color:"#f0f0f0",lineHeight:1.4,marginBottom:12}}>{clip.title}</div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[{l:"Mulai",v:clip.timestamp_start},{l:"Selesai",v:clip.timestamp_end},{l:"Durasi",v:fmtDur(dur)}].map(item=>(
                  <div key={item.l} style={{flex:1,background:"rgba(201,151,51,.07)",border:"1px solid rgba(201,151,51,.2)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#666",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{item.l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#c99733",fontFamily:"monospace"}}>{item.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,color:"#666",fontWeight:700,textTransform:"uppercase",letterSpacing:.6}}>🔥 Potensi Viral</span>
                  <span style={{fontSize:20,fontWeight:900,color:scCol}}>{sc}%</span>
                </div>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginBottom:8}}>
                  <div style={{height:"100%",width:`${sc}%`,background:`linear-gradient(90deg,${scCol}77,${scCol})`,borderRadius:3}}/>
                </div>
                <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{clip.reason||"Klip ini memiliki potensi viral tinggi."}</div>
              </div>
              {clip.hook && (
                <div style={{background:"rgba(201,151,51,.06)",border:"1px solid rgba(201,151,51,.2)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:9,color:"#888",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>💡 Hook Pembuka</div>
                  <div style={{fontSize:13,color:"#e0e0e0",fontWeight:600,lineHeight:1.5,fontStyle:"italic"}}>"{clip.hook}"</div>
                </div>
              )}
            </div>
          )}
          {tab==="copy" && (
            <div style={{animation:"fadeUp .2s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:"#c99733",fontWeight:700,textTransform:"uppercase",letterSpacing:.6}}>Judul + Caption + Hashtag</span>
                <CopyBtn text={copyAll} label="Copy Semua"/>
              </div>
              <div style={{background:"rgba(201,151,51,.05)",border:"1px solid rgba(201,151,51,.2)",borderRadius:12,padding:"14px",marginBottom:12}}>
                <div style={{fontSize:14,color:"#f0f0f0",fontWeight:800,lineHeight:1.4,paddingBottom:10,marginBottom:10,borderBottom:"1px solid rgba(255,255,255,.06)"}}>{clip.title}</div>
                <div style={{fontSize:12,color:"#ccc",lineHeight:1.7,paddingBottom:10,marginBottom:10,borderBottom:"1px solid rgba(255,255,255,.06)"}}>{desc}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {(clip.hashtags||[]).map((h,i)=>(
                    <span key={i} style={{fontSize:11,color:"#60a5fa",background:"rgba(96,165,250,.07)",border:"1px solid rgba(96,165,250,.15)",borderRadius:5,padding:"2px 8px",fontWeight:600}}>{h.startsWith("#")?h:"#"+h}</span>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
                <CopyBtn text={clip.title} label="Judul"/>
                <CopyBtn text={desc} label="Caption"/>
                <CopyBtn text={tags} label="Hashtag"/>
              </div>
              {clip.thumbnail_text && (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:10,color:"#666",fontWeight:700,textTransform:"uppercase"}}>🖼 Teks Thumbnail</span>
                    <CopyBtn text={clip.thumbnail_text} label="Copy"/>
                  </div>
                  <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:"10px 13px",fontSize:13,color:"#e0e0e0",fontWeight:800,letterSpacing:.5}}>{clip.thumbnail_text}</div>
                </div>
              )}
            </div>
          )}
          {tab==="dl" && (
            <div style={{animation:"fadeUp .2s ease"}}>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
                <div style={{fontSize:10,color:"#555",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>🎬 Klip yang akan didownload</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#c99733",fontFamily:"monospace",fontWeight:700}}>{clip.timestamp_start} → {clip.timestamp_end}</span>
                  <span style={{fontSize:11,color:"#444"}}>·</span>
                  <span style={{fontSize:11,color:"#666",fontFamily:"monospace"}}>{fmtDur(dur)}</span>
                </div>
              </div>
              <DownloadBtn ytId={ytId} startS={startS} endS={endS} dur={dur} filename={filename}/>
              <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,255,255,.02)",borderRadius:8,border:"1px solid rgba(255,255,255,.05)"}}>
                <div style={{fontSize:10,color:"#444",lineHeight:1.6}}>
                  💡 <strong style={{color:"#555"}}>Tips:</strong> Jika download otomatis tidak berhasil, kamu akan diarahkan ke YT Cutter untuk download manual.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClipCard({ clip, ytId, rank, onClick }) {
  const [hov, setHov] = useState(false);
  const sc = clip.viral_score || 75;
  const scCol = sc>=90?"#22c55e":sc>=80?"#84cc16":sc>=70?"#c99733":"#fb923c";
  const startS = parseTs(clip.timestamp_start);
  const endS = parseTs(clip.timestamp_end);
  const dur = Math.max(0, endS - startS);
  const thumb = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;

  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:hov?"rgba(255,255,255,.06)":"rgba(255,255,255,.025)",border:`1px solid ${hov?"rgba(201,151,51,.4)":"rgba(255,255,255,.07)"}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s",transform:hov?"translateY(-2px)":"none",animation:"fadeUp .3s ease both",animationDelay:`${rank*0.06}s`}}>
      <div style={{position:"relative",paddingTop:"52%",background:"#111",overflow:"hidden"}}>
        <img src={thumb} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.7}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:800,color:"#c99733"}}>#{rank+1}</div>
        <div style={{position:"absolute",top:8,right:8,background:`${scCol}22`,border:`1px solid ${scCol}55`,backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:900,color:scCol}}>{sc}%</div>
        <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#ddd",fontFamily:"monospace"}}>{fmtTs(startS)} – {fmtTs(endS)}</div>
        <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#aaa",fontFamily:"monospace"}}>{fmtDur(dur)}</div>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(0,0,0,.6)",border:"2px solid rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,opacity:hov?1:0,transition:"opacity .2s"}}>▶</div>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#e0e0e0",lineHeight:1.4,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{clip.title}</div>
        {clip.hook && <div style={{fontSize:11,color:"#666",fontStyle:"italic",lineHeight:1.4,marginBottom:8,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{clip.hook}"</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {(clip.hashtags||[]).slice(0,3).map((h,i)=>(
            <span key={i} style={{fontSize:10,color:"#60a5fa",background:"rgba(96,165,250,.07)",border:"1px solid rgba(96,165,250,.12)",borderRadius:4,padding:"1px 6px",fontWeight:600}}>{h.startsWith("#")?h:"#"+h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [url, setUrl]           = useState("");
  const [ytId, setYtId]         = useState(null);
  const [category, setCategory] = useState("podcast");
  const [duration, setDuration] = useState("30-60s");
  const [resolution, setResolution] = useState("720p");
  const [clipCount, setClipCount] = useState(5);
  const [addContext, setAddContext] = useState("");
  const [useSubtitles, setUseSubtitles] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | analyzing | done | error
  const [clips, setClips]       = useState([]);
  const [errMsg, setErrMsg]     = useState("");
  const [selected, setSelected] = useState(null);
  const [urlErr, setUrlErr]     = useState("");

  const catObj = CATEGORIES.find(c=>c.id===category) || CATEGORIES[0];

  const handleAnalyze = async () => {
    const id = getYtId(url.trim());
    if (!id) { setUrlErr("URL YouTube tidak valid. Contoh: https://youtu.be/xxxx"); return; }
    setUrlErr("");
    setYtId(id);
    setPhase("analyzing");
    setClips([]);
    setErrMsg("");

    const system = `Kamu adalah AI spesialis konten viral untuk platform ${catObj.label}. Tugasmu menganalisis video YouTube dan menemukan klip terbaik yang berpotensi viral di TikTok, Reels, dan YouTube Shorts.

Selalu balas HANYA dengan JSON array yang valid. Tidak ada teks lain di luar JSON.`;

    const prompt = `Analisis video YouTube dengan ID: ${id}
Kategori: ${catObj.label} ${catObj.emoji}
Target durasi klip: ${duration}
Jumlah klip: ${clipCount}
${addContext ? `Konteks tambahan: ${addContext}` : ""}

Temukan ${clipCount} momen terbaik yang berpotensi viral. Untuk setiap klip, berikan:

[
  {
    "title": "Judul menarik untuk klip (maks 60 karakter)",
    "timestamp_start": "MM:SS",
    "timestamp_end": "MM:SS",
    "viral_score": 85,
    "reason": "Alasan singkat kenapa klip ini viral (1-2 kalimat)",
    "hook": "Hook kalimat pembuka yang menarik perhatian",
    "description": "Caption lengkap untuk posting (2-3 kalimat)",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "thumbnail_text": "TEKS THUMBNAIL SINGKAT"
  }
]

Pastikan timestamp realistis dan sesuai dengan konten video. Viral score antara 60-98.`;

    try {
      const raw = await callClaude([{ role:"user", content:prompt }], system, 4000);
      const parsed = safeJSON(raw);
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) throw new Error("Gagal parse JSON dari AI");
      setClips(parsed);
      setPhase("done");
    } catch (e) {
      setErrMsg(e.message || "Terjadi kesalahan saat menganalisis video.");
      setPhase("error");
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0d0d0d",color:"#f0f0f0",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{background:"rgba(255,255,255,.02)",borderBottom:"1px solid rgba(255,255,255,.06)",padding:"14px 20px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50,backdropFilter:"blur(10px)"}}>
        <div style={{width:32,height:32,background:"linear-gradient(135deg,#c99733,#a07828)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 16px rgba(201,151,51,.4)"}}>✂</div>
        <div>
          <div style={{fontSize:15,fontWeight:900,letterSpacing:-.3}}>Mager<span style={{color:"#c99733"}}>Klip</span></div>
          <div style={{fontSize:9,color:"#444",letterSpacing:.5,fontWeight:600}}>AI VIRAL CLIP FINDER</div>
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 100px"}}>

        {/* URL Input */}
        <div style={{marginBottom:20}}>
          <SectionLabel>Link YouTube</SectionLabel>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,position:"relative"}}>
              <input value={url} onChange={e=>{setUrl(e.target.value);setUrlErr("");}} placeholder="https://youtu.be/... atau youtube.com/watch?v=..."
                style={{width:"100%",background:"rgba(255,255,255,.05)",border:`1px solid ${urlErr?"#ef4444":"rgba(255,255,255,.1)"}`,borderRadius:11,padding:"13px 14px",color:"#f0f0f0",fontSize:13,outline:"none",transition:"border .15s"}}
                onKeyDown={e=>e.key==="Enter"&&handleAnalyze()}/>
            </div>
          </div>
          {urlErr && <div style={{fontSize:11,color:"#ef4444",marginTop:5}}>{urlErr}</div>}
        </div>

        {/* Settings */}
        <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"16px",marginBottom:16}}>
          <SectionLabel>Pengaturan Analisis</SectionLabel>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:"#555",marginBottom:5,fontWeight:600}}>Kategori Konten</div>
              <select value={category} onChange={e=>setCategory(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 10px",color:"#e0e0e0",fontSize:12,cursor:"pointer",outline:"none"}}>
                {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:"#555",marginBottom:5,fontWeight:600}}>Durasi Klip</div>
              <select value={duration} onChange={e=>setDuration(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 10px",color:"#e0e0e0",fontSize:12,cursor:"pointer",outline:"none"}}>
                {DURATIONS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:"#555",marginBottom:5,fontWeight:600}}>Jumlah Klip</div>
              <select value={clipCount} onChange={e=>setClipCount(Number(e.target.value))} style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 10px",color:"#e0e0e0",fontSize:12,cursor:"pointer",outline:"none"}}>
                {[3,5,7,10].map(n=><option key={n} value={n}>{n} klip</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:"#555",marginBottom:5,fontWeight:600}}>Resolusi</div>
              <select value={resolution} onChange={e=>setResolution(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"9px 10px",color:"#e0e0e0",fontSize:12,cursor:"pointer",outline:"none"}}>
                {RESOLUTIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"#555",marginBottom:5,fontWeight:600}}>Konteks Tambahan (opsional)</div>
            <input value={addContext} onChange={e=>setAddContext(e.target.value)} placeholder="Contoh: fokus pada momen lucu, bagian Q&A..." style={{width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"9px 12px",color:"#ddd",fontSize:12,outline:"none"}}/>
          </div>
          <Toggle label="Gunakan subtitle untuk analisis lebih akurat" value={useSubtitles} onChange={setUseSubtitles}/>
        </div>

        {/* Analyze Button */}
        <button onClick={handleAnalyze} disabled={phase==="analyzing"} style={{
          width:"100%",padding:"16px",borderRadius:12,border:"none",cursor:phase==="analyzing"?"not-allowed":"pointer",
          background:phase==="analyzing"?"rgba(201,151,51,.15)":"linear-gradient(135deg,#c99733,#a07828)",
          color:phase==="analyzing"?"#c99733":"#000",fontWeight:800,fontSize:15,
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          boxShadow:phase==="analyzing"?"none":"0 4px 24px rgba(201,151,51,.35)",
          animation:phase==="analyzing"?"none":"glow 3s ease-in-out infinite",
          marginBottom:24,transition:"all .2s"
        }}>
          {phase==="analyzing" ? <><Spinner size={18} color="#c99733"/>Menganalisis dengan AI...</> : "✨ Analisis & Temukan Klip Viral"}
        </button>

        {/* Error */}
        {phase==="error" && (
          <div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:"14px 16px",marginBottom:20,animation:"fadeUp .3s ease"}}>
            <div style={{fontSize:13,color:"#ef4444",fontWeight:700,marginBottom:4}}>❌ Analisis Gagal</div>
            <div style={{fontSize:12,color:"#777"}}>{errMsg}</div>
          </div>
        )}

        {/* Results */}
        {phase==="done" && clips.length > 0 && (
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"#f0f0f0"}}>🎯 {clips.length} Klip Viral Ditemukan</div>
                <div style={{fontSize:11,color:"#555",marginTop:2}}>Tap klip untuk lihat detail & download</div>
              </div>
              <div style={{fontSize:10,color:"#666",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:6,padding:"4px 8px",fontWeight:700}}>{catObj.emoji} {catObj.label}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {clips.map((clip,i)=>(
                <ClipCard key={i} clip={clip} ytId={ytId} rank={i} onClick={()=>setSelected(clip)}/>
              ))}
            </div>
          </div>
        )}

        {/* Idle state hint */}
        {phase==="idle" && (
          <div style={{textAlign:"center",padding:"30px 20px",color:"#333"}}>
            <div style={{fontSize:40,marginBottom:12}}>✂️</div>
            <div style={{fontSize:14,fontWeight:700,color:"#444",marginBottom:6}}>Paste link YouTube di atas</div>
            <div style={{fontSize:12,color:"#333",lineHeight:1.6}}>AI akan menemukan momen terbaik dari video kamu yang berpotensi viral di TikTok & Reels</div>
          </div>
        )}
      </div>

      {selected && ytId && <PlayerModal clip={selected} ytId={ytId} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
