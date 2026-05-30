import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPA_URL = "https://fxxclrcwpiyxrdjhjxdf.supabase.co";
const SUPA_KEY = "sb_publishable_ADFV2C040yqhUYR6huJZdQ_aW2DNDDR";
const supabase = createClient(SUPA_URL, SUPA_KEY);

const STATUS_COLOR = { done: "#39d98a", processing: "#4d9fff", queued: "#f5a623", failed: "#ff4d6d" };
const STATUS_LABEL = { done: "Selesai", processing: "Memproses", queued: "Antrian", failed: "Gagal" };

const S = {
  app: { display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#080a0f", color: "#e8eaf0", overflow: "hidden" },
  sidebar: { width: 220, background: "#0d1017", borderRight: "1px solid #ffffff14", display: "flex", flexDirection: "column", padding: 16, gap: 6, flexShrink: 0 },
  logo: { fontSize: 18, fontWeight: 800, color: "#f5a623", marginBottom: 16, padding: "8px 0" },
  navItem: (a) => ({ padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: a ? "#f5a623" : "#8a8fa8", background: a ? "rgba(245,166,35,0.12)" : "none", display: "flex", alignItems: "center", gap: 8 }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { padding: "14px 24px", borderBottom: "1px solid #ffffff14", display: "flex", alignItems: "center", gap: 12, background: "#0d1017" },
  topTitle: { flex: 1, fontSize: 16, fontWeight: 700 },
  searchBox: { background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "7px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", width: 180 },
  btn: (p) => ({ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: p ? 700 : 400, background: p ? "linear-gradient(135deg,#f5a623,#e8820f)" : "#ffffff08", color: p ? "#000" : "#8a8fa8", whiteSpace: "nowrap" }),
  content: { flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
  statCard: { background: "#131720", border: "1px solid #ffffff14", borderRadius: 12, padding: 16 },
  statVal: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  statSub: { fontSize: 11, color: "#50556a" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  card: (s) => ({ background: "#131720", border: s ? "1px solid #f5a623" : "1px solid #ffffff14", borderRadius: 12, overflow: "hidden", cursor: "pointer" }),
  thumb: { height: 110, background: "#0e1320", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, position: "relative" },
  badge: (st) => ({ position: "absolute", top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: STATUS_COLOR[st] + "33", color: STATUS_COLOR[st], border: "1px solid " + STATUS_COLOR[st] + "55", textTransform: "uppercase" }),
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardMeta: { fontSize: 11, color: "#50556a", marginBottom: 8 },
  progressBar: { height: 3, background: "#ffffff14", borderRadius: 3, overflow: "hidden" },
  progressFill: (st, pct) => ({ height: "100%", width: pct + "%", background: STATUS_COLOR[st], borderRadius: 3, transition: "width 1s" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalBox: { background: "#0d1017", border: "1px solid #ffffff20", borderRadius: 16, padding: 28, width: 440, maxWidth: "92vw" },
  modalTitle: { fontSize: 17, fontWeight: 800, marginBottom: 6 },
  modalSub: { fontSize: 12, color: "#50556a", marginBottom: 20 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#50556a", marginBottom: 6, display: "block" },
  fieldInput: { width: "100%", background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none", marginBottom: 12, boxSizing: "border-box" },
  fieldSelect: { width: "100%", background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box" },
  uploadZone: (drag) => ({ border: drag ? "2px dashed #f5a623" : "2px dashed #ffffff20", borderRadius: 12, padding: 28, textAlign: "center", cursor: "pointer", marginBottom: 16, background: drag ? "rgba(245,166,35,0.05)" : "none", transition: "all 0.2s" }),
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end" },
  toast: { position: "fixed", bottom: 24, right: 24, background: "#0d1017", border: "1px solid #ffffff20", borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#8a8fa8", zIndex: 200, display: "flex", gap: 8, alignItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  genPanel: { background: "#131720", border: "1px solid #ffffff14", borderRadius: 12, padding: 20 },
  genRow: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  filters: { display: "flex", gap: 6 },
  filterBtn: (a) => ({ padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: a ? "1px solid rgba(245,166,35,0.3)" : "1px solid transparent", background: a ? "rgba(245,166,35,0.12)" : "none", color: a ? "#f5a623" : "#50556a" }),
  storagePlan: { fontSize: 10, background: "rgba(245,166,35,0.15)", color: "#f5a623", padding: "2px 7px", borderRadius: 20, fontWeight: 700 },
  storageBar: { height: 4, background: "#ffffff14", borderRadius: 4, overflow: "hidden", margin: "8px 0 4px" },
  storageFill: { height: "100%", width: "20%", background: "linear-gradient(90deg,#f5a623,#ffc85a)", borderRadius: 4 },
  progressTop: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#50556a", marginBottom: 4 },
  emptyState: { gridColumn: "1/-1", padding: 48, textAlign: "center", color: "#50556a" },
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return m + " menit lalu";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " jam lalu";
  return Math.floor(h / 24) + " hari lalu";
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [nav, setNav] = useState("projects");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleUpload = async () => {
    if (!title.trim()) { showToast("⚠️ Nama project wajib diisi!"); return; }
    setUploading(true);
    try {
      let videoUrl = null;
      let fileSize = "--";

      if (file) {
        fileSize = (file.size / 1048576).toFixed(1) + " MB";
        const fileName = Date.now() + "_" + file.name.replace(/\s/g, "_");
        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
        videoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("projects").insert({
        title,
        status: "queued",
        size: fileSize,
        icon: "video",
        progress: 0,
        video_url: videoUrl,
      });

      if (error) throw error;
      showToast("✅ Project berhasil diupload!");
      setTitle(""); setFile(null); setModal(false);
      fetchProjects();
    } catch (e) {
      showToast("❌ Gagal upload: " + e.message);
    }
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const { error } = await supabase.from("projects").insert({
      title: prompt, status: "processing", icon: "video", progress: 10,
    });
    if (!error) { fetchProjects(); showToast("🚀 AI mulai memproses klip!"); }
    setPrompt("");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) { fetchProjects(); showToast("🗑️ Project dihapus"); }
  };

  const filtered = projects.filter(p => {
    const mf = filter === "all" || p.status === filter;
    const ms = p.title.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  return (
    <div style={S.app}>
      <aside style={S.sidebar}>
        <div style={S.logo}>✂ MagerKlip</div>
        {[["🏠","home","Home"],["🎬","projects","Clip Projects"],["✨","generate","AI Generate"],["🏆","leaderboard","Leaderboard"],["⚡","upgrade","Upgrade"]].map(([icon,id,label]) => (
          <div key={id} style={S.navItem(nav===id)} onClick={() => setNav(id)}>{icon} {label}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ background: "#ffffff08", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#8a8fa8" }}>Storage</span>
            <span style={S.storagePlan}>FREE</span>
          </div>
          <div style={S.storageBar}><div style={S.storageFill} /></div>
          <div style={{ fontSize: 11, color: "#50556a" }}>Supabase 1GB gratis</div>
        </div>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <div style={S.topTitle}>Clip <span style={{ color: "#f5a623" }}>Projects</span></div>
          <input style={S.searchBox} placeholder="Cari project..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.btn(true)} onClick={() => setModal(true)}>+ Upload Clip</button>
        </div>

        <div style={S.content}>
          <div style={S.statsRow}>
            {[
              ["🎬", projects.length, "Total Project"],
              ["✅", projects.filter(p => p.status==="done").length, "Selesai"],
              ["⚙️", projects.filter(p => p.status==="processing").length, "Memproses"],
              ["📥", projects.filter(p => p.status==="queued").length, "Antrian"],
            ].map(([icon,val,sub],i) => (
              <div key={i} style={S.statCard}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                <div style={S.statVal}>{val}</div>
                <div style={S.statSub}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={S.genPanel}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#f5a623" }}>✨ AI Generate Klip Instan</div>
            <div style={S.genRow}>
              <input style={S.input} placeholder="Deskripsikan klip yang kamu inginkan..." value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key==="Enter" && handleGenerate()} />
              <button style={S.btn(true)} onClick={handleGenerate}>Generate</button>
            </div>
          </div>

          <div>
            <div style={S.sectionHead}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Semua Project <span style={{ fontSize: 11, color: "#50556a", fontWeight: 400 }}>({filtered.length})</span>
              </div>
              <div style={S.filters}>
                {["all","done","processing","queued","failed"].map(f => (
                  <button key={f} style={S.filterBtn(filter===f)} onClick={() => setFilter(f)}>
                    {f==="all" ? "Semua" : STATUS_LABEL[f]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ color: "#50556a", textAlign: "center", padding: 40 }}>Memuat data...</div>
            ) : (
              <div style={S.grid}>
                {filtered.length === 0 ? (
                  <div style={S.emptyState}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🎬</div>
                    <div style={{ color: "#8a8fa8", marginBottom: 4 }}>Belum ada project</div>
                    <div style={{ fontSize: 12 }}>Klik "+ Upload Clip" untuk mulai</div>
                  </div>
                ) : filtered.map(p => (
                  <div key={p.id} style={S.card(selected===p.id)} onClick={() => setSelected(selected===p.id ? null : p.id)}>
                    <div style={S.thumb}>
                      🎬
                      <span style={S.badge(p.status)}>{STATUS_LABEL[p.status]}</span>
                    </div>
                    <div style={S.cardBody}>
                      <div style={S.cardTitle}>{p.title}</div>
                      <div style={S.cardMeta}>{p.size || "--"} · {timeAgo(p.created_at)}</div>
                      <div style={S.progressTop}>
                        <span>{STATUS_LABEL[p.status]}</span>
                        <span>{p.progress || 0}%</span>
                      </div>
                      <div style={S.progressBar}>
                        <div style={S.progressFill(p.status, p.progress || 0)} />
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                        {p.video_url && (
                          <a href={p.video_url} target="_blank" rel="noreferrer" style={{ ...S.btn(false), fontSize: 11, padding: "5px 10px", textDecoration: "none" }}>▶ Play</a>
                        )}
                        <button onClick={(e) => handleDelete(p.id, e)} style={{ ...S.btn(false), fontSize: 11, padding: "5px 10px", color: "#ff4d6d" }}>🗑 Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {modal && (
        <div style={S.modal} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>Upload Clip Baru</div>
            <div style={S.modalSub}>Upload video ke Supabase Storage dan simpan ke database.</div>
            <div
              style={S.uploadZone(drag)}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("vid-input").click()}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? "✅" : "☁️"}</div>
              <div style={{ fontSize: 13, color: "#8a8fa8" }}>{file ? file.name : "Drag & drop video atau tap untuk pilih"}</div>
              <div style={{ fontSize: 11, color: "#50556a", marginTop: 4 }}>{file ? (file.size/1048576).toFixed(1)+" MB" : "MP4, MOV, AVI"}</div>
              <input id="vid-input" type="file" accept="video/*" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            </div>
            <label style={S.fieldLabel}>Nama Project</label>
            <input style={S.fieldInput} placeholder="Nama klip video kamu..." value={title} onChange={e => setTitle(e.target.value)} />
            <label style={S.fieldLabel}>Mode Proses</label>
            <select style={S.fieldSelect}>
              <option>Auto Klip</option>
              <option>Short Form - Reels & TikTok</option>
              <option>Cinematic</option>
            </select>
            <div style={S.modalFooter}>
              <button style={S.btn(false)} onClick={() => setModal(false)}>Batal</button>
              <button style={S.btn(true)} onClick={handleUpload} disabled={uploading}>
                {uploading ? "Mengupload..." : "🚀 Upload & Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
  }
    
