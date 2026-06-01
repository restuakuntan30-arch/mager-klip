import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ============= CONFIG =============
const WHATSAPP_NUMBER = "6282250931638"; // GANTI dengan nomor admin
const PRICE_MONTHLY = "Rp 49.000";
const PRICE_YEARLY = "Rp 399.000";

// ⚡ GANTI dengan URL backend Render kamu setelah deploy:
const BACKEND_URL = "https://mager-klip-backend.onrender.com";

// ============= HELPERS =============
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
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function fmtTs(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s/60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s/3600)} jam lalu`;
  if (s < 604800) return `${Math.floor(s/86400)} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID");
}
function safeJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}
async function callAI(messages, system = "") {
  const prompt = (system ? system + "\n\n" : "") + messages.map(m => m.content).join("\n");
  const res = await fetch("/api/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error);
  return d.text || "";
}

const CATEGORIES = [
  { id:"podcast",  label:"Podcast",    emoji:"🎙️" },
  { id:"gaming",   label:"Gaming",     emoji:"🎮" },
  { id:"edu",      label:"Edukasi",    emoji:"📚" },
  { id:"vlog",     label:"Vlog",       emoji:"🌟" },
  { id:"tech",     label:"Teknologi",  emoji:"💻" },
  { id:"bisnis",   label:"Bisnis",     emoji:"💰" },
  { id:"masak",    label:"Kuliner",    emoji:"🍳" },
  { id:"otomotif", label:"Otomotif",   emoji:"🚗" },
  { id:"comedy",   label:"Komedi",     emoji:"😂" },
  { id:"music",    label:"Musik",      emoji:"🎵" },
];
const DURATIONS = ["15-30s","30-60s","60-90s","1-3 menit"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#0a0a0a;color:#f0f0f0;-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px #c9973355}50%{box-shadow:0 0 40px #c9973388}}
@keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:#c9973333;border-radius:6px}
input,select,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}
input:focus,select:focus,textarea:focus{outline:none}
`;

function Spinner({ size=16, color="#c99733" }) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}30`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>;
}

function CopyBtn({ text, label="Copy" }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${ok?"#22c55e44":"rgba(255,255,255,.1)"}`,background:ok?"rgba(34,197,94,.1)":"rgba(255,255,255,.05)",color:ok?"#22c55e":"#777",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
      {ok ? "✓ Tersalin" : "📋 " + label}
    </button>
  );
}

// =====================================================
// AUTH SCREEN
// =====================================================
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState("input");
  const [err, setErr] = useState("");

  const handleLogin = async () => {
    if (!email || !email.includes("@")) { setErr("Masukkan email yang valid"); return; }
    setPhase("sending"); setErr("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      if (error) throw error;
      setPhase("sent");
    } catch (e) {
      setErr(e.message || "Gagal mengirim email"); setPhase("error");
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a0a0a 0%,#1a1410 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{CSS}</style>
      <div style={{maxWidth:420,width:"100%",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",borderRadius:20,padding:"40px 32px",animation:"fadeUp .4s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32,justifyContent:"center"}}>
          <div style={{width:48,height:48,background:"linear-gradient(135deg,#c99733,#a07828)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 0 24px rgba(201,151,51,.4)"}}>✂</div>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:-.5}}>Mager<span style={{color:"#c99733"}}>Klip</span></div>
            <div style={{fontSize:10,color:"#666",fontWeight:600,letterSpacing:.5}}>AI VIRAL CLIP FINDER</div>
          </div>
        </div>
        {phase === "sent" ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>📧</div>
            <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>Cek email kamu!</div>
            <div style={{fontSize:13,color:"#777",lineHeight:1.6,marginBottom:20}}>Kami mengirim link login ke<br/><span style={{color:"#c99733",fontWeight:700}}>{email}</span><br/>Klik link di email untuk masuk.</div>
            <button onClick={() => { setPhase("input"); setEmail(""); }} style={{background:"none",border:"1px solid rgba(255,255,255,.1)",color:"#888",borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>← Email lain</button>
          </div>
        ) : (
          <>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:18,fontWeight:800,marginBottom:6}}>Login atau Daftar</div>
              <div style={{fontSize:13,color:"#666"}}>Masuk dengan email — gratis, tanpa password</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:10,color:"#666",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6,display:"block"}}>Email kamu</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="nama@email.com"
                style={{width:"100%",background:"rgba(255,255,255,.06)",border:`1px solid ${err?"#ef4444":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"12px 14px",color:"#f0f0f0",fontSize:14}}/>
              {err && <div style={{fontSize:11,color:"#ef4444",marginTop:6}}>{err}</div>}
            </div>
            <button onClick={handleLogin} disabled={phase === "sending"}
              style={{width:"100%",padding:"14px",borderRadius:10,border:"none",cursor:phase==="sending"?"not-allowed":"pointer",background:phase==="sending"?"rgba(201,151,51,.2)":"linear-gradient(135deg,#c99733,#a07828)",color:phase==="sending"?"#c99733":"#000",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:phase==="sending"?"none":"0 4px 20px rgba(201,151,51,.3)"}}>
              {phase === "sending" ? <><Spinner color="#c99733"/>Mengirim...</> : "✉️ Kirim Link Login"}
            </button>
            <div style={{fontSize:11,color:"#444",textAlign:"center",marginTop:16,lineHeight:1.6}}>Tidak ada spam. Email hanya untuk verifikasi login.</div>
          </>
        )}
      </div>
    </div>
  );
}

// =====================================================
// DOWNLOAD BUTTON — DIRECT DOWNLOAD FROM BACKEND!
// =====================================================
function DownloadBtn({ ytId, startS, endS, dur }) {
  const [phase, setPhase] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");

  const ytUrl = `https://www.youtube.com/watch?v=${ytId}`;
  const startTs = fmtTs(startS);
  const endTs = fmtTs(endS);
  const cobaltUrl = `https://cobalt.tools/?url=${encodeURIComponent(ytUrl)}`;

  const handleDownload = async () => {
    setErrMsg("");
    setFallbackUrl("");
    setPhase("downloading");

    try {
      const downloadUrl = `${BACKEND_URL}/download?url=${encodeURIComponent(ytUrl)}&start=${startTs}&end=${endTs}`;
      const response = await fetch(downloadUrl);
      const contentType = response.headers.get("content-type") || "";

      // Backend return JSON = ada error
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.fallback) {
          // Auto-open Cobalt fallback
          setFallbackUrl(data.fallback);
          setPhase("fallback");
          // Auto-open in new tab
          window.open(data.fallback, "_blank");
          return;
        }
        throw new Error(data.error || data.details || "Download gagal");
      }

      if (!response.ok) throw new Error(`Server error ${response.status}`);

      // Backend return video file
      const blob = await response.blob();
      if (blob.size < 10000) throw new Error("File terlalu kecil");

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `klip_${ytId}_${startTs.replace(/:/g, "-")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      setPhase("done");
      setTimeout(() => setPhase("idle"), 5000);
    } catch (e) {
      setErrMsg(e.message || "Tidak bisa terhubung ke server");
      setPhase("error");
    }
  };

  const btnPrimary = {display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 16px",borderRadius:10,border:"none",width:"100%",fontWeight:800,fontSize:14,cursor:"pointer",background:"linear-gradient(135deg,#c99733,#a07828)",color:"#000",boxShadow:"0 4px 20px rgba(201,151,51,.3)",fontFamily:"inherit"};

  if (phase === "downloading") {
    return (
      <div style={{background:"rgba(201,151,51,.08)",border:"1px solid rgba(201,151,51,.3)",borderRadius:10,padding:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <Spinner color="#c99733" size={18}/>
          <span style={{fontSize:13,fontWeight:700,color:"#c99733"}}>Memproses video...</span>
        </div>
        <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>
          ⏳ Tunggu 30-90 detik (kalau server baru bangun, bisa lebih lama)<br/>
          💡 Jangan tutup tab ini
        </div>
      </div>
    );
  }

  if (phase === "fallback") {
    return (
      <div style={{background:"rgba(96,165,250,.08)",border:"1px solid rgba(96,165,250,.3)",borderRadius:10,padding:"14px"}}>
        <div style={{fontSize:13,fontWeight:800,color:"#60a5fa",marginBottom:6}}>🔄 Pakai Cobalt sebagai gantinya</div>
        <div style={{fontSize:11,color:"#888",lineHeight:1.6,marginBottom:10}}>
          YouTube blok video ini dari server. Cobalt sudah otomatis terbuka di tab baru — tinggal klik <strong>Download</strong> di sana.
        </div>
        <a href={fallbackUrl || cobaltUrl} target="_blank" rel="noopener noreferrer"
          style={{display:"block",textAlign:"center",padding:"10px",borderRadius:8,background:"rgba(96,165,250,.15)",color:"#60a5fa",fontSize:12,fontWeight:700,textDecoration:"none",marginBottom:8}}>
          ⭐ Buka Cobalt lagi (kalau pop-up diblok)
        </a>
        <button onClick={() => setPhase("idle")} style={{width:"100%",background:"none",border:"1px solid rgba(255,255,255,.08)",color:"#666",fontSize:11,padding:"8px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>↩ Kembali</button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.3)",borderRadius:10,padding:"14px",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:6}}>🎉</div>
        <div style={{fontSize:14,fontWeight:800,color:"#22c55e",marginBottom:4}}>Download Selesai!</div>
        <div style={{fontSize:11,color:"#888",lineHeight:1.5}}>File MP4 tersimpan di folder Downloads</div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div>
        <div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.25)",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#ef4444",marginBottom:4}}>❌ Gagal terhubung</div>
          <div style={{fontSize:11,color:"#888"}}>{errMsg}</div>
        </div>
        <button onClick={handleDownload} style={{...btnPrimary,marginBottom:8}}>🔄 Coba Lagi</button>
        <a href={cobaltUrl} target="_blank" rel="noopener noreferrer"
          style={{display:"block",textAlign:"center",padding:"10px",borderRadius:8,border:"1px solid rgba(255,255,255,.08)",color:"#888",fontSize:11,textDecoration:"none"}}>
          ⭐ Atau pakai Cobalt langsung
        </a>
      </div>
    );
  }

  // Idle state
  return (
    <div>
      <div style={{background:"rgba(201,151,51,.07)",border:"1px solid rgba(201,151,51,.2)",borderRadius:10,padding:"10px 12px",marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:10,color:"#888",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>⏱ Segmen</div>
        <div style={{fontSize:14,color:"#c99733",fontFamily:"monospace",fontWeight:800}}>{startTs} → {endTs} <span style={{color:"#666",fontSize:11}}>({fmtDur(dur)})</span></div>
      </div>
      <button onClick={handleDownload} style={btnPrimary}>⬇️ Download Klip</button>
      <div style={{fontSize:10,color:"#555",textAlign:"center",marginTop:8,lineHeight:1.5}}>
        Server akan coba download langsung. Kalau YouTube blok, otomatis pakai Cobalt.
      </div>
    </div>
  );
}
// =====================================================
// CLIP CARD
// =====================================================
function ClipCard({ clip, ytId, rank, onClick }) {
  const [hov, setHov] = useState(false);
  const sc = clip.viral_score || 75;
  const scCol = sc>=90?"#22c55e":sc>=80?"#84cc16":sc>=70?"#c99733":"#fb923c";
  const startS = parseTs(clip.timestamp_start);
  const endS = parseTs(clip.timestamp_end);
  const dur = Math.max(0, endS - startS);
  const thumb = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{background:hov?"rgba(255,255,255,.06)":"rgba(255,255,255,.025)",border:`1px solid ${hov?"rgba(201,151,51,.4)":"rgba(255,255,255,.07)"}`,borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s",transform:hov?"translateY(-2px)":"none",animation:"fadeUp .3s ease both",animationDelay:`${rank*0.06}s`}}>
      <div style={{position:"relative",paddingTop:"52%",background:"#111",overflow:"hidden"}}>
        <img src={thumb} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.7}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.8) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:800,color:"#c99733"}}>#{rank+1}</div>
        <div style={{position:"absolute",top:8,right:8,background:`${scCol}22`,border:`1px solid ${scCol}55`,backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:900,color:scCol}}>{sc}%</div>
        <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#ddd",fontFamily:"monospace"}}>{fmtTs(startS)} – {fmtTs(endS)}</div>
        <div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700,color:"#aaa"}}>{fmtDur(dur)}</div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:13,fontWeight:700,lineHeight:1.4,marginBottom:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{clip.title}</div>
        {clip.hook && <div style={{fontSize:11,color:"#666",fontStyle:"italic",lineHeight:1.4,marginBottom:6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{clip.hook}"</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {(clip.hashtags||[]).slice(0,3).map((h,i)=>(
            <span key={i} style={{fontSize:10,color:"#60a5fa",background:"rgba(96,165,250,.07)",border:"1px solid rgba(96,165,250,.12)",borderRadius:4,padding:"1px 6px",fontWeight:600}}>{h.startsWith("#")?h:"#"+h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PLAYER MODAL
// =====================================================
function PlayerModal({ clip, ytId, onClose }) {
  const [tab, setTab] = useState("info");
  const startS = parseTs(clip.timestamp_start);
  const endS = parseTs(clip.timestamp_end);
  const dur = Math.max(0, endS - startS);
  const sc = clip.viral_score || 78;
  const scCol = sc>=90?"#22c55e":sc>=80?"#84cc16":sc>=70?"#c99733":"#fb923c";
  const tags = (clip.hashtags||[]).map(h=>h.startsWith("#")?h:"#"+h).join(" ");
  const desc = clip.description || "";
  const copyAll = `${clip.title}\n\n${desc}\n\n${tags}`;
  const embedUrl = `https://www.youtube.com/embed/${ytId}?start=${startS}&end=${endS}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.95)",backdropFilter:"blur(10px)",overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{maxWidth:520,margin:"0 auto",background:"#111",minHeight:"100vh"}}>
        <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.07)",background:"rgba(0,0,0,.8)",position:"sticky",top:0,zIndex:10}}>
          <span style={{fontSize:13,fontWeight:800}}>📹 Detail Klip</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",color:"#aaa",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:14,fontWeight:700}}>✕</button>
        </div>
        <div style={{position:"relative",paddingTop:"56.25%",background:"#000"}}>
          <iframe src={embedUrl} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen allow="autoplay; encrypted-media" title="player"/>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
          {[{id:"info",l:"📋 Info"},{id:"copy",l:"✏️ Caption"},{id:"dl",l:"⬇️ Download"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"11px 4px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#c99733":"transparent"}`,color:tab===t.id?"#c99733":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.l}</button>
          ))}
        </div>
        <div style={{padding:"16px"}}>
          {tab==="info" && (
            <div>
              <div style={{fontSize:15,fontWeight:800,lineHeight:1.4,marginBottom:12}}>{clip.title}</div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[{l:"Mulai",v:clip.timestamp_start},{l:"Selesai",v:clip.timestamp_end},{l:"Durasi",v:fmtDur(dur)}].map(it=>(
                  <div key={it.l} style={{flex:1,background:"rgba(201,151,51,.07)",border:"1px solid rgba(201,151,51,.2)",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#666",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{it.l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:"#c99733",fontFamily:"monospace"}}>{it.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,color:"#666",fontWeight:700}}>🔥 Potensi Viral</span>
                  <span style={{fontSize:22,fontWeight:900,color:scCol}}>{sc}%</span>
                </div>
                <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.06)",overflow:"hidden",marginBottom:8}}>
                  <div style={{height:"100%",width:`${sc}%`,background:`linear-gradient(90deg,${scCol}77,${scCol})`,borderRadius:3}}/>
                </div>
                <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{clip.reason}</div>
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
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:"#c99733",fontWeight:700,textTransform:"uppercase"}}>Caption Lengkap</span>
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
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                <CopyBtn text={clip.title} label="Judul"/>
                <CopyBtn text={desc} label="Caption"/>
                <CopyBtn text={tags} label="Hashtag"/>
              </div>
            </div>
          )}
          {tab==="dl" && (
            <div>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
                <div style={{fontSize:10,color:"#555",marginBottom:4,fontWeight:700,textTransform:"uppercase"}}>🎬 Segmen</div>
                <div style={{fontSize:12,color:"#c99733",fontFamily:"monospace",fontWeight:700}}>{clip.timestamp_start} → {clip.timestamp_end} · {fmtDur(dur)}</div>
              </div>
              <DownloadBtn ytId={ytId} startS={startS} endS={endS} dur={dur}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CLIP FINDER
// =====================================================
function ClipFinderView({ profile, onAnalysisSaved, restoreData }) {
  const [url, setUrl] = useState(restoreData?.url || "");
  const [ytId, setYtId] = useState(restoreData?.yt_id || null);
  const [category, setCategory] = useState(restoreData?.category || "podcast");
  const [duration, setDuration] = useState(restoreData?.duration || "30-60s");
  const [clipCount, setClipCount] = useState(5);
  const [addContext, setAddContext] = useState("");
  const [phase, setPhase] = useState(restoreData?.clips?.length ? "done" : "idle");
  const [clips, setClips] = useState(restoreData?.clips || []);
  const [errMsg, setErrMsg] = useState("");
  const [selected, setSelected] = useState(null);
  const [urlErr, setUrlErr] = useState("");

  const catObj = CATEGORIES.find(c=>c.id===category) || CATEGORIES[0];

  const handleAnalyze = async () => {
    const id = getYtId(url.trim());
    if (!id) { setUrlErr("URL YouTube tidak valid"); return; }
    setUrlErr(""); setYtId(id); setPhase("analyzing"); setClips([]); setErrMsg("");

    const system = `Kamu adalah AI spesialis konten viral untuk platform ${catObj.label}. Tugasmu menganalisis video YouTube dan menemukan klip terbaik yang berpotensi viral di TikTok, Reels, dan YouTube Shorts. Selalu balas HANYA dengan JSON array yang valid.`;
    const prompt = `Analisis video YouTube dengan ID: ${id}
Kategori: ${catObj.label} ${catObj.emoji}
Target durasi klip: ${duration}
Jumlah klip: ${clipCount}
${addContext ? `Konteks: ${addContext}` : ""}

Temukan ${clipCount} momen terbaik. Balas HANYA JSON array:
[{"title":"...","timestamp_start":"MM:SS","timestamp_end":"MM:SS","viral_score":85,"reason":"...","hook":"...","description":"...","hashtags":["#tag1"],"thumbnail_text":"..."}]`;

    try {
      const raw = await callAI([{role:"user",content:prompt}], system);
      const parsed = safeJSON(raw);
      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) throw new Error("Gagal parse respons AI");
      setClips(parsed); setPhase("done");
      await onAnalysisSaved({ yt_id: id, url, category, duration, clips: parsed });
    } catch (e) {
      setErrMsg(e.message || "Error"); setPhase("error");
    }
  };

  const clearResults = () => { setClips([]); setPhase("idle"); setUrl(""); setYtId(null); };

  return (
    <>
      <div style={{padding:"48px 40px 32px",textAlign:"center",background:"linear-gradient(180deg,rgba(201,151,51,.05) 0%,transparent 100%)",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
        <div style={{fontSize:32,fontWeight:900,marginBottom:8,lineHeight:1.2}}>Satu Video,<br/><span style={{color:"#c99733"}}>Puluhan Klip Viral!</span></div>
        <div style={{fontSize:14,color:"#555",marginBottom:28}}>Paste link YouTube → AI analisis → Download langsung</div>
        <div style={{maxWidth:640,margin:"0 auto",display:"flex",gap:10,marginBottom:12}}>
          <input value={url} onChange={e=>{setUrl(e.target.value);setUrlErr("");}} placeholder="https://www.youtube.com/watch?v=..." onKeyDown={e=>e.key==="Enter"&&handleAnalyze()}
            style={{flex:1,background:"rgba(255,255,255,.06)",border:`1px solid ${urlErr?"#ef4444":"rgba(255,255,255,.12)"}`,borderRadius:12,padding:"14px 16px",color:"#f0f0f0",fontSize:14}}/>
          <button onClick={handleAnalyze} disabled={phase==="analyzing"} style={{padding:"14px 24px",borderRadius:12,border:"none",cursor:phase==="analyzing"?"not-allowed":"pointer",background:phase==="analyzing"?"rgba(201,151,51,.2)":"linear-gradient(135deg,#c99733,#a07828)",color:phase==="analyzing"?"#c99733":"#000",fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",boxShadow:phase==="analyzing"?"none":"0 4px 20px rgba(201,151,51,.3)"}}>
            {phase==="analyzing" ? <><Spinner color="#c99733"/>Menganalisis...</> : "✨ Analisis Klip"}
          </button>
        </div>
        {urlErr && <div style={{fontSize:12,color:"#ef4444",marginBottom:8}}>{urlErr}</div>}
        <div style={{maxWidth:640,margin:"0 auto",display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          <select value={duration} onChange={e=>setDuration(e.target.value)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 12px",color:"#ccc",fontSize:12,cursor:"pointer"}}>
            {DURATIONS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <select value={clipCount} onChange={e=>setClipCount(Number(e.target.value))} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 12px",color:"#ccc",fontSize:12,cursor:"pointer"}}>
            {[3,5,7,10].map(n=><option key={n} value={n}>{n} klip</option>)}
          </select>
          <input value={addContext} onChange={e=>setAddContext(e.target.value)} placeholder="Konteks tambahan (opsional)..." style={{flex:1,minWidth:180,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px 12px",color:"#ddd",fontSize:12}}/>
        </div>
      </div>
      <div style={{padding:"28px 40px",flex:1}}>
        {phase==="error" && (<div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:"14px 16px",maxWidth:800,margin:"0 auto 20px"}}><div style={{fontSize:13,color:"#ef4444",fontWeight:700,marginBottom:4}}>❌ Analisis Gagal</div><div style={{fontSize:12,color:"#777"}}>{errMsg}</div></div>)}
        {phase==="done" && clips.length > 0 && (
          <div style={{maxWidth:1000,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:18,fontWeight:800}}>🎯 {clips.length} Klip Viral Ditemukan</div>
                <div style={{fontSize:12,color:"#555",marginTop:2}}>Klik klip untuk preview & download • {catObj.emoji} {catObj.label}</div>
              </div>
              <button onClick={clearResults} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"8px 14px",color:"#555",fontSize:12,cursor:"pointer",fontWeight:600}}>🔄 Analisis Baru</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
              {clips.map((c,i)=><ClipCard key={i} clip={c} ytId={ytId} rank={i} onClick={()=>setSelected(c)}/>)}
            </div>
          </div>
        )}
        {phase==="idle" && (<div style={{textAlign:"center",padding:"60px 20px",maxWidth:500,margin:"0 auto"}}><div style={{fontSize:48,marginBottom:16}}>✂️</div><div style={{fontSize:16,fontWeight:700,color:"#444",marginBottom:8}}>Paste link YouTube di atas</div><div style={{fontSize:13,color:"#333",lineHeight:1.7}}>AI akan menemukan momen terbaik, lalu kamu bisa download langsung dari sini.</div></div>)}
        {phase==="analyzing" && (<div style={{textAlign:"center",padding:"60px 20px",maxWidth:400,margin:"0 auto"}}><Spinner size={40} color="#c99733"/><div style={{fontSize:15,fontWeight:700,marginTop:16,marginBottom:8}}>AI sedang menganalisis...</div><div style={{fontSize:12,color:"#555"}}>Mencari momen terbaik dari video kamu</div></div>)}
      </div>
      {selected && ytId && <PlayerModal clip={selected} ytId={ytId} onClose={()=>setSelected(null)}/>}
    </>
  );
}

// =====================================================
// CLIPS SAYA / LEADERBOARD / PRO / UPGRADE / SIDEBAR (sama seperti sebelumnya)
// =====================================================
function ClipsSayaView({ history, loading, onSelect, onDelete }) {
  return (
    <div style={{padding:"32px 40px",flex:1}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{marginBottom:24}}><div style={{fontSize:24,fontWeight:900,marginBottom:6}}>🎬 Clips Saya</div><div style={{fontSize:13,color:"#555"}}>Semua analisis yang pernah kamu buat</div></div>
        {loading ? (<div style={{textAlign:"center",padding:60}}><Spinner size={32}/></div>) : history.length === 0 ? (<div style={{textAlign:"center",padding:"60px 20px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16}}><div style={{fontSize:48,marginBottom:16,opacity:.4}}>📭</div><div style={{fontSize:15,fontWeight:700,color:"#666",marginBottom:6}}>Belum ada history</div><div style={{fontSize:12,color:"#444"}}>Mulai analisis video di menu Clip Finder</div></div>) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {history.map((item,i) => {
              const cat = CATEGORIES.find(c=>c.id===item.category) || CATEGORIES[0];
              return (
                <div key={item.id} onClick={()=>onSelect(item)} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,151,51,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
                  <div style={{position:"relative",paddingTop:"52%",background:"#111"}}>
                    <img src={`https://img.youtube.com/vi/${item.yt_id}/mqdefault.jpg`} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.7}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.85),transparent 50%)"}}/>
                    <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>{cat.emoji} {cat.label}</div>
                    <div style={{position:"absolute",bottom:8,left:8,fontSize:11,color:"#ddd",fontWeight:700}}>{item.clips.length} klip</div>
                  </div>
                  <div style={{padding:"12px 14px"}}>
                    <div style={{fontSize:13,fontWeight:700,marginBottom:6,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden",color:"#ddd"}}>{item.url.replace(/^https?:\/\/(www\.)?/,"").slice(0,40)}...</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:10,color:"#555"}}>{timeAgo(item.created_at)}</div><button onClick={e=>{e.stopPropagation();if(window.confirm("Hapus history ini?"))onDelete(item.id);}} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:11,padding:4}}>🗑</button></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardView({ history }) {
  const allClips = history.flatMap(h => h.clips.map(c => ({ ...c, yt_id: h.yt_id, category: h.category })));
  const top = allClips.sort((a,b) => (b.viral_score||0) - (a.viral_score||0)).slice(0, 20);
  return (
    <div style={{padding:"32px 40px",flex:1}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{marginBottom:24}}><div style={{fontSize:24,fontWeight:900,marginBottom:6}}>🏆 Leaderboard</div><div style={{fontSize:13,color:"#555"}}>Top 20 klip terbaikmu dengan potensi viral tertinggi</div></div>
        {top.length === 0 ? (<div style={{textAlign:"center",padding:"60px 20px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:16}}><div style={{fontSize:48,marginBottom:16,opacity:.4}}>🏆</div><div style={{fontSize:15,fontWeight:700,color:"#666"}}>Belum ada klip di leaderboard</div><div style={{fontSize:12,color:"#444",marginTop:6}}>Analisis video dulu untuk muncul di sini</div></div>) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {top.map((clip,i) => {
              const sc = clip.viral_score || 75;
              const scCol = sc>=90?"#22c55e":sc>=80?"#84cc16":sc>=70?"#c99733":"#fb923c";
              const medals = ["🥇","🥈","🥉"];
              return (
                <div key={i} style={{background:i<3?"rgba(201,151,51,.08)":"rgba(255,255,255,.025)",border:`1px solid ${i<3?"rgba(201,151,51,.3)":"rgba(255,255,255,.07)"}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:i<3?24:18,fontWeight:900,minWidth:36,textAlign:"center",color:i<3?"#c99733":"#555"}}>{i<3?medals[i]:`#${i+1}`}</div>
                  <img src={`https://img.youtube.com/vi/${clip.yt_id}/default.jpg`} alt="" style={{width:80,height:50,objectFit:"cover",borderRadius:6,opacity:.85}}/>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,marginBottom:3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{clip.title}</div><div style={{fontSize:10,color:"#666",fontFamily:"monospace"}}>{clip.timestamp_start} → {clip.timestamp_end}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:900,color:scCol}}>{sc}%</div><div style={{fontSize:9,color:"#555",fontWeight:700,textTransform:"uppercase"}}>Viral Score</div></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProLockView({ title, icon, description, features, profile, onUpgrade }) {
  const isPro = profile?.plan === "pro";
  if (isPro) return (<div style={{padding:"60px 40px",textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>{icon}</div><div style={{fontSize:22,fontWeight:900,marginBottom:8}}>{title}</div><div style={{fontSize:14,color:"#666",marginBottom:24}}>Fitur ini sedang dalam pengembangan.</div><div style={{maxWidth:400,margin:"0 auto",background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.3)",borderRadius:12,padding:"14px 18px",fontSize:12,color:"#22c55e"}}>✨ Kamu pengguna PRO — fitur ini segera tersedia.</div></div>);
  return (
    <div style={{padding:"32px 40px",flex:1}}>
      <div style={{maxWidth:600,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,rgba(201,151,51,.1),rgba(201,151,51,.02))",border:"1px solid rgba(201,151,51,.3)",borderRadius:20,padding:"40px 32px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#c99733",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:900,marginBottom:14,letterSpacing:.5}}>👑 FITUR PRO</div>
          <div style={{fontSize:24,fontWeight:900,marginBottom:10}}>{title}</div>
          <div style={{fontSize:14,color:"#888",marginBottom:24,lineHeight:1.6}}>{description}</div>
          <div style={{textAlign:"left",background:"rgba(0,0,0,.3)",borderRadius:12,padding:"16px 20px",marginBottom:24}}>
            <div style={{fontSize:11,color:"#c99733",fontWeight:700,textTransform:"uppercase",marginBottom:10,letterSpacing:.5}}>Yang Kamu Dapat:</div>
            {features.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8,fontSize:13,color:"#ccc"}}><span style={{color:"#22c55e",fontWeight:900}}>✓</span> {f}</div>))}
          </div>
          <button onClick={onUpgrade} style={{background:"linear-gradient(135deg,#c99733,#a07828)",color:"#000",border:"none",borderRadius:12,padding:"14px 32px",fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px rgba(201,151,51,.4)",animation:"glow 3s ease-in-out infinite"}}>🚀 Upgrade ke PRO</button>
        </div>
      </div>
    </div>
  );
}

function UpgradeView({ profile }) {
  const [tab, setTab] = useState("monthly");
  const isPro = profile?.plan === "pro";
  const waMsg = encodeURIComponent(`Halo Admin MagerKlip, saya mau upgrade ke PRO.\n\nEmail: ${profile?.email}\nPaket: ${tab === "monthly" ? "Bulanan ("+PRICE_MONTHLY+")" : "Tahunan ("+PRICE_YEARLY+")"}\n\nMohon info pembayaran. Terima kasih!`);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
  if (isPro) return (<div style={{padding:"60px 40px",textAlign:"center"}}><div style={{maxWidth:500,margin:"0 auto",background:"linear-gradient(135deg,rgba(34,197,94,.1),rgba(34,197,94,.02))",border:"1px solid rgba(34,197,94,.3)",borderRadius:20,padding:"40px 32px"}}><div style={{fontSize:48,marginBottom:16}}>👑</div><div style={{fontSize:24,fontWeight:900,marginBottom:10}}>Kamu Sudah PRO!</div><div style={{fontSize:14,color:"#888",lineHeight:1.6,marginBottom:20}}>Terima kasih sudah mendukung MagerKlip.</div>{profile.pro_until && (<div style={{background:"rgba(0,0,0,.3)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#aaa"}}>Aktif sampai: <strong style={{color:"#22c55e"}}>{new Date(profile.pro_until).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</strong></div>)}</div></div>);
  return (
    <div style={{padding:"32px 40px",flex:1}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}><div style={{fontSize:32,fontWeight:900,marginBottom:8}}>Upgrade ke <span style={{color:"#c99733"}}>PRO</span></div><div style={{fontSize:14,color:"#666"}}>Akses unlimited semua fitur premium</div></div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderRadius:10,padding:4}}>
            <button onClick={()=>setTab("monthly")} style={{padding:"8px 20px",borderRadius:8,border:"none",background:tab==="monthly"?"#c99733":"transparent",color:tab==="monthly"?"#000":"#888",fontSize:12,fontWeight:700,cursor:"pointer"}}>Bulanan</button>
            <button onClick={()=>setTab("yearly")} style={{padding:"8px 20px",borderRadius:8,border:"none",background:tab==="yearly"?"#c99733":"transparent",color:tab==="yearly"?"#000":"#888",fontSize:12,fontWeight:700,cursor:"pointer"}}>Tahunan <span style={{fontSize:9,background:"#22c55e",color:"#000",padding:"1px 5px",borderRadius:4,marginLeft:4}}>-32%</span></button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:780,margin:"0 auto"}}>
          <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:16,padding:"24px 28px"}}>
            <div style={{fontSize:11,color:"#666",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Free</div><div style={{fontSize:32,fontWeight:900,marginBottom:4}}>Rp 0</div><div style={{fontSize:11,color:"#555",marginBottom:20}}>Selamanya</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{["5 analisis per hari","Maksimal 5 klip per video","Download langsung dari website","History 7 hari"].map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:"#999"}}><span style={{color:"#666"}}>✓</span> {f}</div>))}</div>
            <button disabled style={{width:"100%",padding:"12px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#555",fontSize:12,fontWeight:700,cursor:"not-allowed"}}>Paket Saat Ini</button>
          </div>
          <div style={{background:"linear-gradient(135deg,rgba(201,151,51,.12),rgba(201,151,51,.03))",border:"2px solid rgba(201,151,51,.5)",borderRadius:16,padding:"24px 28px",position:"relative"}}>
            <div style={{position:"absolute",top:-10,right:20,background:"#c99733",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:900,letterSpacing:.5}}>👑 RECOMMENDED</div>
            <div style={{fontSize:11,color:"#c99733",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Pro</div><div style={{fontSize:32,fontWeight:900,marginBottom:4,color:"#c99733"}}>{tab==="monthly"?PRICE_MONTHLY:PRICE_YEARLY}</div><div style={{fontSize:11,color:"#888",marginBottom:20}}>per {tab==="monthly"?"bulan":"tahun"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>{["Unlimited analisis","Maksimal 10 klip per video","Download HD 1080p","Penjadwalan otomatis","Akun sosmed unlimited","History permanen","Priority support"].map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:"#ddd"}}><span style={{color:"#22c55e",fontWeight:900}}>✓</span> {f}</div>))}</div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c99733,#a07828)",color:"#000",fontSize:13,fontWeight:900,cursor:"pointer",textDecoration:"none",textAlign:"center",boxShadow:"0 4px 20px rgba(201,151,51,.3)"}}>💬 Order via WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, profile, onLogout }) {
  const isPro = profile?.plan === "pro";
  const nav = [
    { id:"finder", icon:"✂️", label:"Clip Finder" },
    { id:"history", icon:"🎬", label:"Clips Saya" },
    { id:"leaderboard", icon:"🏆", label:"Leaderboard" },
    { id:"scheduler", icon:"📅", label:"Penjadwalan", pro:true },
    { id:"social", icon:"📱", label:"Akun Sosmed", pro:true },
  ];
  return (
    <div style={{width:240,background:"#111",borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
      <div style={{padding:"20px 16px 16px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:"linear-gradient(135deg,#c99733,#a07828)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 16px rgba(201,151,51,.4)"}}>✂</div>
          <div><div style={{fontSize:16,fontWeight:900,letterSpacing:-.3}}>Mager<span style={{color:"#c99733"}}>Klip</span></div><div style={{fontSize:9,color:"#444",fontWeight:600,letterSpacing:.5}}>AI VIRAL CLIP FINDER</div></div>
        </div>
      </div>
      <nav style={{padding:"12px 10px",flex:1,display:"flex",flexDirection:"column",gap:2}}>
        {nav.map(item => (
          <div key={item.id} onClick={()=>setView(item.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,cursor:"pointer",background:view===item.id?"rgba(201,151,51,.12)":"transparent",color:view===item.id?"#c99733":"#666",fontSize:13,fontWeight:view===item.id?700:500,transition:"all .15s",borderLeft:view===item.id?"2px solid #c99733":"2px solid transparent"}}
            onMouseEnter={e=>{if(view!==item.id){e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.color="#aaa";}}}
            onMouseLeave={e=>{if(view!==item.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color="#666";}}}>
            <span style={{display:"flex",alignItems:"center",gap:8}}><span>{item.icon}</span>{item.label}</span>
            {item.pro && !isPro && <span style={{fontSize:9,background:"rgba(201,151,51,.2)",color:"#c99733",padding:"1px 6px",borderRadius:4,fontWeight:700}}>PRO</span>}
          </div>
        ))}
      </nav>
      <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
        {!isPro && (<button onClick={()=>setView("upgrade")} style={{width:"100%",background:"linear-gradient(135deg,#c99733,#a07828)",color:"#000",border:"none",borderRadius:10,padding:"10px",fontSize:12,fontWeight:800,cursor:"pointer",marginBottom:10,boxShadow:"0 2px 12px rgba(201,151,51,.3)"}}>👑 Upgrade ke PRO</button>)}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"rgba(255,255,255,.03)",borderRadius:8}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:isPro?"linear-gradient(135deg,#c99733,#a07828)":"#333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:isPro?"#000":"#aaa",flexShrink:0}}>{profile?.email?.[0]?.toUpperCase() || "?"}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#ddd",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.email}</div><div style={{fontSize:9,color:isPro?"#c99733":"#555",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{isPro?"👑 PRO":"Free Plan"}</div></div>
          <button onClick={onLogout} title="Logout" style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:14,padding:4}}>⎋</button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN APP
// =====================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("finder");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoreData, setRestoreData] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => { setSession(sess); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data || { id: session.user.id, email: session.user.email, plan: "free" });
    })();
  }, [session]);

  useEffect(() => { if (!session) { setHistory([]); return; } loadHistory(); }, [session]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const { data } = await supabase.from("clip_history").select("*").order("created_at", { ascending: false }).limit(100);
    setHistory(data || []);
    setHistoryLoading(false);
  };
  const saveAnalysis = async (data) => { if (!session) return; await supabase.from("clip_history").insert({ user_id: session.user.id, ...data }); loadHistory(); };
  const deleteHistory = async (id) => { await supabase.from("clip_history").delete().eq("id", id); loadHistory(); };
  const handleSelectHistory = (item) => { setRestoreData(item); setView("finder"); };
  const handleLogout = async () => { if (window.confirm("Yakin mau logout?")) { await supabase.auth.signOut(); setView("finder"); } };

  if (loading) return (<div style={{minHeight:"100vh",background:"#0a0a0a",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><Spinner size={32}/></div>);
  if (!session) return <AuthScreen />;

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f0f0f0",display:"flex"}}>
      <style>{CSS}</style>
      <Sidebar view={view} setView={(v)=>{setView(v);setRestoreData(null);}} profile={profile} onLogout={handleLogout}/>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {view === "finder" && <ClipFinderView profile={profile} onAnalysisSaved={saveAnalysis} restoreData={restoreData}/>}
        {view === "history" && <ClipsSayaView history={history} loading={historyLoading} onSelect={handleSelectHistory} onDelete={deleteHistory}/>}
        {view === "leaderboard" && <LeaderboardView history={history}/>}
        {view === "scheduler" && <ProLockView title="Penjadwalan Otomatis" icon="📅" description="Jadwalkan posting klip ke TikTok, Instagram Reels, dan YouTube Shorts otomatis." features={["Schedule unlimited posting","Multi-platform","Optimasi jam posting","Analytics","Auto-repost viral"]} profile={profile} onUpgrade={()=>setView("upgrade")}/>}
        {view === "social" && <ProLockView title="Akun Sosial Media" icon="📱" description="Connect dan kelola semua akun sosial media dari satu dashboard." features={["Connect TikTok, IG, YouTube","Multi-akun","Auto-cross-posting","Performance insights","Caption AI per platform"]} profile={profile} onUpgrade={()=>setView("upgrade")}/>}
        {view === "upgrade" && <UpgradeView profile={profile}/>}
      </div>
    </div>
  );
}
