import { useState } from "react";

const DATA = [
  { id: 1, title: "Product Launch Reel", status: "done", dur: "0:32", size: "124MB", icon: "🎬", time: "2 jam lalu", progress: 100 },
  { id: 2, title: "Behind The Scenes", status: "processing", dur: "1:14", size: "340MB", icon: "🎥", time: "5 jam lalu", progress: 67 },
  { id: 3, title: "Tutorial AI Workflow", status: "done", dur: "2:05", size: "512MB", icon: "🤖", time: "1 hari lalu", progress: 100 },
  { id: 4, title: "Highlight Reel Q2", status: "queued", dur: "--:--", size: "--", icon: "✨", time: "Baru saja", progress: 0 },
  { id: 5, title: "Short Form Instagram", status: "done", dur: "0:15", size: "48MB", icon: "📱", time: "3 hari lalu", progress: 100 },
  { id: 6, title: "Cinematic Brand Story", status: "failed", dur: "--:--", size: "--", icon: "🎞", time: "4 hari lalu", progress: 34 },
];

const STATUS_COLOR = {
  done: "#39d98a",
  processing: "#4d9fff",
  queued: "#f5a623",
  failed: "#ff4d6d",
};

const STATUS_LABEL = {
  done: "Selesai",
  processing: "Memproses",
  queued: "Antrian",
  failed: "Gagal",
};

const S = {
  app: { display: "flex", height: "100vh", fontFamily: "sans-serif", background: "#080a0f", color: "#e8eaf0", overflow: "hidden" },
  sidebar: { width: 220, background: "#0d1017", borderRight: "1px solid #ffffff14", display: "flex", flexDirection: "column", padding: 16, gap: 8, flexShrink: 0 },
  logo: { fontSize: 18, fontWeight: 800, color: "#f5a623", marginBottom: 16, padding: "8px 0" },
  navItem: (active) => ({ padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: active ? "#f5a623" : "#8a8fa8", background: active ? "rgba(245,166,35,0.12)" : "none", display: "flex", alignItems: "center", gap: 8 }),
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { padding: "14px 24px", borderBottom: "1px solid #ffffff14", display: "flex", alignItems: "center", gap: 12, background: "#0d1017" },
  topTitle: { flex: 1, fontSize: 16, fontWeight: 700 },
  searchBox: { background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "7px 12px", color: "#e8eaf0", fontSize: 13, outline: "none", width: 180 },
  btn: (primary) => ({ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: primary ? 700 : 400, background: primary ? "linear-gradient(135deg,#f5a623,#e8820f)" : "#ffffff08", color: primary ? "#000" : "#8a8fa8", whiteSpace: "nowrap" }),
  content: { flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
  statCard: { background: "#131720", border: "1px solid #ffffff14", borderRadius: 12, padding: 16 },
  statVal: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  statSub: { fontSize: 11, color: "#50556a" },
  genPanel: { background: "#131720", border: "1px solid #ffffff14", borderRadius: 12, padding: 20 },
  genTitle: { fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  genRow: { display: "flex", gap: 10 },
  input: { flex: 1, background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none" },
  select: { background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: 700 },
  filters: { display: "flex", gap: 6 },
  filterBtn: (active) => ({ padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: active ? "1px solid rgba(245,166,35,0.3)" : "1px solid transparent", background: active ? "rgba(245,166,35,0.12)" : "none", color: active ? "#f5a623" : "#50556a" }),
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 },
  card: (sel) => ({ background: "#131720", border: sel ? "1px solid #f5a623" : "1px solid #ffffff14", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }),
  thumb: { height: 110, background: "#0e1320", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, position: "relative" },
  badge: (status) => ({ position: "absolute", top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: STATUS_COLOR[status] + "33", color: STATUS_COLOR[status], border: "1px solid " + STATUS_COLOR[status] + "55", textTransform: "uppercase" }),
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardMeta: { fontSize: 11, color: "#50556a", marginBottom: 8 },
  progressWrap: {},
  progressTop: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#50556a", marginBottom: 4 },
  progressBar: { height: 3, background: "#ffffff14", borderRadius: 3, overflow: "hidden" },
  progressFill: (status, pct) => ({ height: "100%", width: pct + "%", background: STATUS_COLOR[status], borderRadius: 3, transition: "width 1s" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalBox: { background: "#0d1017", border: "1px solid #ffffff20", borderRadius: 16, padding: 28, width: 420, maxWidth: "90vw" },
  modalTitle: { fontSize: 17, fontWeight: 800, marginBottom: 6 },
  modalSub: { fontSize: 12, color: "#50556a", marginBottom: 20 },
  fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#50556a", marginBottom: 6, display: "block" },
  fieldInput: { width: "100%", background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none", marginBottom: 12, boxSizing: "border-box" },
  fieldSelect: { width: "100%", background: "#ffffff08", border: "1px solid #ffffff14", borderRadius: 8, padding: "9px 13px", color: "#e8eaf0", fontSize: 13, outline: "none", marginBottom: 20, boxSizing: "border-box" },
  modalFooter: { display: "flex", gap: 10, justifyContent: "flex-end" },
  toast: { position: "fixed", bottom: 24, right: 24, background: "#0d1017", border: "1px solid #ffffff20", borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#8a8fa8", zIndex: 200, display: "flex", gap: 8, alignItems: "center" },
  storagePlan: { fontSize: 10, background: "rgba(245,166,35,0.15)", color: "#f5a623", padding: "2px 7px", borderRadius: 20, fontWeight: 700 },
  storageBar: { height: 4, background: "#ffffff14", borderRadius: 4, overflow: "hidden", margin: "8px 0 4px" },
  storageFill: { height: "100%", width: "20%", background: "linear-gradient(90deg,#f5a623,#ffc85a)", borderRadius: 4 },
};

export default function App() {
  const [projects, setProjects] = useState(DATA);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [toast, setToast] = useState(null);
  const [nav, setNav] = useState("projects");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = projects.filter(p => {
    const mf = filter === "all" || p.status === filter;
    const ms = p.title.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setProjects(prev => [{ id: Date.now(), title: prompt, status: "processing", dur: "--:--", size: "--", icon: "🤖", time: "Baru saja", progress: 8 }, ...prev]);
    setPrompt("");
    showToast("🚀 AI mulai memproses klip kamu!");
  };

  const handleUpload = () => {
    if (!title.trim()) return;
    setProjects(prev => [{ id: Date.now(), title, status: "queued", dur: "--:--", size: "--", icon: "🎞", time: "Baru saja", progress: 0 }, ...prev]);
    setTitle("");
    setModal(false);
    showToast("✅ Project berhasil ditambahkan!");
  };

  return (
    <div style={S.app}>
      <aside style={S.sidebar}>
        <div style={S.logo}>✂ MagerKlip</div>
        {[["🏠","home","Home"],["🎬","projects","Clip Projects"],["✨","generate","AI Generate"],["🏆","leaderboard","Leaderboard"],["⚡","upgrade","Upgrade"]].map(([icon, id, label]) => (
          <div key={id} style={S.navItem(nav === id)} onClick={() => setNav(id)}>{icon} {label}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ background: "#ffffff08", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#8a8fa8" }}>Penyimpanan</span>
            <span style={S.storagePlan}>FREE</span>
          </div>
          <div style={S.storageBar}><div style={S.storageFill} /></div>
          <div style={{ fontSize: 11, color: "#50556a" }}>1.02 GB dari 5 GB</div>
        </div>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <div style={S.topTitle}>Clip <span style={{ color: "#f5a623" }}>Projects</span></div>
          <input style={S.searchBox} placeholder="Cari project..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.btn(false)}>⬇ Export</button>
          <button style={S.btn(true)} onClick={() => setModal(true)}>+ Upload Clip</button>
        </div>

        <div style={S.content}>
          <div style={S.statsRow}>
            {[
              ["🎬", projects.length, "Total Project"],
              ["✅", projects.filter(p => p.status === "done").length, "Selesai"],
              ["⚙️", projects.filter(p => p.status === "processing").length, "Sedang Proses"],
              ["💾", "1.02 GB", "Storage Terpakai"],
            ].map(([icon, val, sub], i) => (
              <div key={i} style={S.statCard}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                <div style={S.statVal}>{val}</div>
                <div style={S.statSub}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={S.genPanel}>
            <div style={S.genTitle}><span style={{ color: "#f5a623" }}>●</span> AI Generate Klip Instan</div>
            <div style={S.genRow}>
              <input style={S.input} placeholder="Deskripsikan klip yang kamu inginkan..." value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGenerate()} />
              <select style={S.select}>
                <option>🎬 Cinematic</option>
                <option>📱 Short Form</option>
                <option>📺 Widescreen</option>
              </select>
              <button style={S.btn(true)} onClick={handleGenerate}>✨ Generate</button>
            </div>
          </div>

          <div>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>Semua Project <span style={{ fontSize: 11, color: "#50556a", fontWeight: 400 }}>({filtered.length})</span></div>
              <div style={S.filters}>
                {["all","done","processing","queued","failed"].map(f => (
                  <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
                    {f === "all" ? "Semua" : STATUS_LABEL[f]}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.grid}>
              {filtered.map(p => (
                <div key={p.id} style={S.card(selected === p.id)} onClick={() => setSelected(selected === p.id ? null : p.id)}>
                  <div style={S.thumb}>
                    {p.icon}
                    <span style={S.badge(p.status)}>{STATUS_LABEL[p.status]}</span>
                  </div>
                  <div style={S.cardBody}>
                    <div style={S.cardTitle}>{p.title}</div>
                    <div style={S.cardMeta}>{p.dur} · {p.size} · {p.time}</div>
                    <div style={S.progressWrap}>
                      <div style={S.progressTop}><span>{STATUS_LABEL[p.status]}</span><span>{p.progress}%</span></div>
                      <div style={S.progressBar}><div style={S.progressFill(p.status, p.progress)} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {modal && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={S.modalBox}>
            <div style={S.modalTitle}>Upload Clip Baru</div>
            <div style={S.modalSub}>Upload video dan mulai proses AI untuk membuat klip otomatis.</div>
            <label style={S.fieldLabel}>Nama Project</label>
            <input style={S.fieldInput} placeholder="Misal: Product Launch 2026" value={title} onChange={e => setTitle(e.target.value)} />
            <label style={S.fieldLabel}>Mode AI</label>
            <select style={S.fieldSelect}>
              <option>Auto Klip — Otomatis potong highlight</option>
              <option>Short Form — Reels & TikTok</option>
              <option>Cinematic — Color grade + musik</option>
            </select>
            <div style={S.modalFooter}>
              <button style={S.btn(false)} onClick={() => setModal(false)}>Batal</button>
              <button style={S.btn(true)} onClick={handleUpload}>🚀 Mulai Generate</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
  }
      
