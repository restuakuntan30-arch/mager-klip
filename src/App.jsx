import { useState, useEffect, useRef } from "react";

const STYLES = ["Cinematic", "Vlog", "Short Form", "Documentary", "TikTok", "Reels", "YouTube"];

const INITIAL_PROJECTS = [
  { id: 1, title: "Product Launch Reel", duration: "0:32", size: "124MB", status: "selesai", progress: 100, icon: "🎬", created: "2 jam lalu" },
  { id: 2, title: "Behind The Scenes", duration: "1:14", size: "340MB", status: "memproses", progress: 67, icon: "🎥", created: "6 jam lalu" },
  { id: 3, title: "Tutorial AI Workflow", duration: "2:05", size: "512MB", status: "selesai", progress: 100, icon: "🤖", created: "1 hari lalu" },
  { id: 4, title: "Highlight Reel Q2", duration: "—", size: "—", status: "antrian", progress: 0, icon: "✨", created: "Baru saja" },
  { id: 5, title: "Short Form Instagram", duration: "0:15", size: "46MB", status: "selesai", progress: 100, icon: "📱", created: "3 jam lalu" },
  { id: 6, title: "Cinematic Brand Story", duration: "—", size: "—", status: "gagal", progress: 34, icon: "🎞", created: "4 hari lalu" },
];

const STATUS_CONFIG = {
  selesai: { label: "SELESAI", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  memproses: { label: "MEMPROSES", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  antrian: { label: "ANTRIAN", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  gagal: { label: "GAGAL", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const LEADERBOARD_DATA = [
  { rank: 1, name: "Alex Creator", clips: 48, points: 2840, badge: "🥇" },
  { rank: 2, name: "Studio Vibe", clips: 35, points: 2210, badge: "🥈" },
  { rank: 3, name: "NightOwl Films", clips: 29, points: 1950, badge: "🥉" },
  { rank: 4, name: "You", clips: 6, points: 580, badge: "⭐", isMe: true },
  { rank: 5, name: "Clip Master", clips: 22, points: 1440, badge: "" },
  { rank: 6, name: "PixelPro", clips: 18, points: 1120, badge: "" },
];

function ProgressBar({ progress, status }) {
  const color = STATUS_CONFIG[status]?.color || "#22c55e";
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 4, overflow: "hidden", marginTop: 8 }}>
      <div style={{
        width: `${progress}%`, height: "100%", borderRadius: 4,
        background: status === "gagal" ? "#ef4444" : status === "memproses" ? "linear-gradient(90deg,#3b82f6,#60a5fa)" : color,
        transition: "width 0.5s ease",
        boxShadow: status === "memproses" ? "0 0 8px rgba(59,130,246,0.6)" : "none"
      }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40`
    }}>{cfg.label}</span>
  );
}

function ProjectCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12, padding: 16, cursor: "pointer",
        transition: "all 0.2s ease", transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, background: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
        }}>{project.icon}</div>
        <StatusBadge status={project.status} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", marginBottom: 4, lineHeight: 1.3 }}>{project.title}</div>
      <div style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {project.duration !== "—" && <span>{project.duration}</span>}
        {project.size !== "—" && <span>· {project.size}</span>}
        <span>· {project.created}</span>
      </div>
      <ProgressBar progress={project.progress} status={project.status} />
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, textAlign: "right" }}>
        {project.status === "selesai" ? "Selesai" :
          project.status === "memproses" ? `Memproses ${project.progress}%` :
          project.status === "antrian" ? "Antrian" : `Gagal ${project.progress}%`}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 100
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || "#e2e8f0", fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Modal({ project, onClose, onRetry, onDelete }) {
  if (!project) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }} onClick={onClose}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16,
        padding: 28, maxWidth: 400, width: "90%", color: "#e2e8f0"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 28 }}>{project.icon}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{project.title}</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <StatusBadge status={project.status} />
          {project.duration !== "—" && <span style={{ fontSize: 11, color: "#64748b", padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>⏱ {project.duration}</span>}
          {project.size !== "—" && <span style={{ fontSize: 11, color: "#64748b", padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>💾 {project.size}</span>}
        </div>
        <ProgressBar progress={project.progress} status={project.status} />
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, marginBottom: 20 }}>Progress: {project.progress}% · {project.created}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {project.status === "selesai" && (
            <button style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: "#22c55e", color: "#000", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>⬇ Download</button>
          )}
          {project.status === "gagal" && (
            <button onClick={() => { onRetry(project.id); onClose(); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: "#f59e0b", color: "#000", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🔄 Retry</button>
          )}
          <button onClick={() => { onDelete(project.id); onClose(); }} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🗑 Hapus</button>
        </div>
      </div>
    </div>
  );
}

function HomeView({ setActiveNav, stats, projects }) {
  const recent = projects.slice(0, 3);
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>Selamat datang di <span style={{ color: "#f59e0b" }}>MagerKlip</span> ✂</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>Platform AI untuk membuat klip video profesional secara otomatis.</p>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon="🎬" value={stats.total} label="Total Project" />
        <StatCard icon="✅" value={stats.selesai} label="Selesai" color="#22c55e" />
        <StatCard icon="⚙️" value={stats.proses} label="Sedang Proses" color="#3b82f6" />
        <StatCard icon="💾" value={stats.storage} label="Storage" color="#f59e0b" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "✨", title: "AI Generate", desc: "Buat klip dari deskripsi teks", nav: "ai", color: "#f59e0b" },
          { icon: "🎬", title: "Clip Projects", desc: "Kelola semua video kamu", nav: "projects", color: "#3b82f6" },
          { icon: "🏆", title: "Leaderboard", desc: "Lihat ranking kreator", nav: "leaderboard", color: "#22c55e" },
          { icon: "⚡", title: "Upgrade Plan", desc: "Akses fitur premium", nav: "upgrade", color: "#a855f7" },
        ].map(item => (
          <div key={item.nav} onClick={() => setActiveNav(item.nav)} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12, padding: 16, cursor: "pointer", transition: "all 0.2s"
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: item.color, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{item.desc}</div>
          </div>
        ))}
      </div>
      {recent.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>Project Terbaru</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{p.created}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIView({ promptText, setPromptText, selectedStyle, setSelectedStyle, generating, generateProgress, handleGenerate }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
        <span style={{ color: "#f59e0b" }}>✨</span> AI Generate Klip
      </h2>
      <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 13 }}>Deskripsikan video yang kamu inginkan, AI akan membuatnya otomatis.</p>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Deskripsi Klip</div>
        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder="Contoh: Buat highlight reel produk baru dengan musik energetik, durasi 30 detik, gaya cinematic..."
          rows={4}
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 13, outline: "none",
            resize: "none", boxSizing: "border-box", fontFamily: "inherit"
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Style Output</div>
            <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} style={{
              width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, cursor: "pointer"
            }}>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: "10px 24px", borderRadius: 8, background: generating ? "#78350f" : "#f59e0b",
            border: "none", color: generating ? "#fbbf24" : "#000", cursor: generating ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: 13, marginTop: 20, whiteSpace: "nowrap"
          }}>
            {generating ? `Generating ${Math.round(generateProgress)}%` : "✨ Generate Klip"}
          </button>
        </div>
        {generating && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
              <span>Memproses dengan AI...</span><span>{Math.round(generateProgress)}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${generateProgress}%`, height: "100%", background: "linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
        {["Produk baru dengan musik energetik", "Tutorial step-by-step 60 detik", "Highlight event kantor", "Behind the scenes studio", "Short form TikTok viral", "Cinematic travel vlog"].map(s => (
          <div key={s} onClick={() => setPromptText(s)} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: "10px 12px", cursor: "pointer", fontSize: 12, color: "#94a3b8", transition: "all 0.2s"
          }}>💡 {s}</div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardView() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
        <span style={{ color: "#f59e0b" }}>🏆</span> Leaderboard Kreator
      </h2>
      <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 13 }}>Ranking kreator terbaik bulan ini berdasarkan jumlah klip & poin.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LEADERBOARD_DATA.map(user => (
          <div key={user.rank} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: user.isMe ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${user.isMe ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 12, padding: "14px 16px"
          }}>
            <div style={{ fontSize: 22, width: 32, textAlign: "center" }}>{user.badge || `#${user.rank}`}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: user.isMe ? "#f59e0b" : "#e2e8f0" }}>
                {user.name} {user.isMe && <span style={{ fontSize: 10, background: "rgba(245,158,11,0.2)", color: "#f59e0b", padding: "1px 6px", borderRadius: 4, marginLeft: 4 }}>KAMU</span>}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{user.clips} klip · {user.points} poin</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: user.rank <= 3 ? "#f59e0b" : "#475569" }}>
              {user.points.toLocaleString()} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpgradeView() {
  const plans = [
    { name: "Free", price: "Gratis", color: "#64748b", features: ["3 klip/bulan", "1GB storage", "720p output", "Watermark"] },
    { name: "Pro", price: "Rp 99.000/bln", color: "#f59e0b", features: ["50 klip/bulan", "50GB storage", "4K output", "Tanpa watermark", "Priority queue"], popular: true },
    { name: "Studio", price: "Rp 299.000/bln", color: "#a855f7", features: ["Unlimited klip", "500GB storage", "8K output", "Custom branding", "API access", "Dedicated support"] },
  ];
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
        <span style={{ color: "#f59e0b" }}>⚡</span> Upgrade Paket
      </h2>
      <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 13 }}>Pilih paket yang sesuai kebutuhan kreator kamu.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {plans.map(plan => (
          <div key={plan.name} style={{
            background: plan.popular ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${plan.popular ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 14, padding: 20, position: "relative"
          }}>
            {plan.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#f59e0b", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>POPULER</div>}
            <div style={{ fontSize: 16, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 16 }}>{plan.price}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {plan.features.map(f => (
                <div key={f} style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: plan.color }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button style={{
              width: "100%", padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
              background: plan.popular ? "#f59e0b" : "rgba(255,255,255,0.08)",
              color: plan.popular ? "#000" : "#94a3b8", fontWeight: 600, fontSize: 13
            }}>
              {plan.price === "Gratis" ? "Plan Aktif" : "Pilih Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MagerKlip() {
  const [activeNav, setActiveNav] = useState("projects");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [promptText, setPromptText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [generating, setGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notification, setNotification] = useState(null);
  const nextId = useRef(7);
  const fileRef = useRef(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.status === "memproses" && p.progress < 100) {
          const newP = Math.min(100, p.progress + Math.random() * 3);
          if (newP >= 100) {
            notify(`✅ "${p.title}" selesai diproses!`);
            return { ...p, progress: 100, status: "selesai" };
          }
          return { ...p, progress: Math.round(newP) };
        }
        return p;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!promptText.trim()) { notify("Masukkan deskripsi klip terlebih dahulu!", "error"); return; }
    setGenerating(true);
    setGenerateProgress(0);
    const newProject = {
      id: nextId.current++,
      title: promptText.slice(0, 30) + (promptText.length > 30 ? "..." : ""),
      duration: "—", size: "—", status: "antrian", progress: 0,
      icon: ["🎬", "🎥", "✨", "🎞", "📹"][Math.floor(Math.random() * 5)],
      created: "Baru saja"
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveNav("projects");
    setTimeout(() => {
      setProjects(prev => prev.map(p => p.id === newProject.id ? { ...p, status: "memproses", progress: 5 } : p));
    }, 1500);
    let prog = 0;
    const gen = setInterval(() => {
      prog += Math.random() * 15;
      setGenerateProgress(Math.min(98, prog));
      if (prog >= 98) {
        clearInterval(gen);
        setGenerating(false);
        setGenerateProgress(0);
        setPromptText("");
        notify(`🎬 Klip "${newProject.title}" sedang diproses!`);
      }
    }, 300);
  };

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    Array.from(files).forEach(file => {
      const newProject = {
        id: nextId.current++,
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: "—",
        size: (file.size / (1024 * 1024)).toFixed(1) + "MB",
        status: "memproses", progress: 10,
        icon: "📤", created: "Baru saja"
      };
      setProjects(prev => [newProject, ...prev]);
    });
    notify(`📤 ${files.length} file berhasil diupload!`);
    e.target.value = "";
  };

  const handleDelete = (id) => { setProjects(prev => prev.filter(p => p.id !== id)); notify("🗑 Proyek dihapus"); };
  const handleRetry = (id) => { setProjects(prev => prev.map(p => p.id === id ? { ...p, status: "memproses", progress: 5 } : p)); notify("🔄 Memproses ulang..."); };

  const filtered = projects.filter(p => {
    const matchFilter = filter === "semua" || p.status === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: projects.length,
    selesai: projects.filter(p => p.status === "selesai").length,
    proses: projects.filter(p => p.status === "memproses").length,
    storage: (projects.reduce((acc, p) => { const mb = parseFloat(p.size); return acc + (isNaN(mb) ? 0 : mb); }, 0) / 1024).toFixed(2) + " GB"
  };

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "projects", icon: "🎬", label: "Clip Projects" },
    { id: "ai", icon: "✨", label: "AI Generate" },
    { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
    { id: "upgrade", icon: "⚡", label: "Upgrade" },
  ];

  const renderContent = () => {
    if (activeNav === "home") return <HomeView setActiveNav={setActiveNav} stats={stats} projects={projects} />;
    if (activeNav === "ai") return <AIView promptText={promptText} setPromptText={setPromptText} selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle} generating={generating} generateProgress={generateProgress} handleGenerate={handleGenerate} />;
    if (activeNav === "leaderboard") return <LeaderboardView />;
    if (activeNav === "upgrade") return <UpgradeView />;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            <span style={{ color: "#f59e0b" }}>Clip</span> Projects
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari project..." style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", width: 160
            }} />
            <button onClick={() => fileRef.current?.click()} style={{
              padding: "8px 16px", borderRadius: 8, background: "#f59e0b", border: "none",
              color: "#000", cursor: "pointer", fontWeight: 700, fontSize: 12
            }}>+ Upload Clip</button>
            <input ref={fileRef} type="file" multiple accept="video/*" style={{ display: "none" }} onChange={handleUpload} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard icon="🎬" value={stats.total} label="Total Project" />
          <StatCard icon="✅" value={stats.selesai} label="Selesai" color="#22c55e" />
          <StatCard icon="⚙️" value={stats.proses} label="Sedang Proses" color="#3b82f6" />
          <StatCard icon="💾" value={stats.storage} label="Storage Terpakai" color="#f59e0b" />
        </div>

        <div style={{
          background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12, padding: "14px 16px", marginBottom: 20,
          display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>✨ AI Generate Instan</span>
          <input value={promptText} onChange={e => setPromptText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleGenerate()} placeholder="Deskripsikan klip yang kamu inginkan..." style={{
            flex: 1, minWidth: 180, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12, outline: "none"
          }} />
          <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 12, cursor: "pointer"
          }}>
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: "8px 18px", borderRadius: 8, background: generating ? "#78350f" : "#f59e0b",
            border: "none", color: generating ? "#fbbf24" : "#000", cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap"
          }}>
            {generating ? `${Math.round(generateProgress)}%` : "✨ Generate"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginRight: 4 }}>Semua Project ({projects.length})</span>
          {["semua", "selesai", "memproses", "antrian", "gagal"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
              background: filter === f ? "#f59e0b" : "rgba(255,255,255,0.06)",
              color: filter === f ? "#000" : "#94a3b8", textTransform: "capitalize"
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
            <div>Tidak ada project ditemukan</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={setSelectedProject} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080d14", color: "#e2e8f0", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        select option { background: #1e293b; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes notif { from { opacity:0; transform:translateX(100px); } to { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: 200, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
        position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ padding: "8px 10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#f59e0b", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 12px rgba(245,158,11,0.4)" }}>✂</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.3 }}>Mager<span style={{ color: "#f59e0b" }}>Klip</span></div>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 0.5 }}>AI VIDEO PLATFORM</div>
          </div>
        </div>

        {navItems.map(item => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer",
            background: activeNav === item.id ? "rgba(245,158,11,0.12)" : "transparent",
            color: activeNav === item.id ? "#f59e0b" : "#64748b",
            fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400,
            transition: "all 0.15s", borderLeft: activeNav === item.id ? "2px solid #f59e0b" : "2px solid transparent"
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "12px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>Storage</span>
            <span style={{ fontSize: 9, background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>FREE</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: "22%", height: "100%", background: "linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 10, color: "#475569" }}>1.02 GB / 5 GB</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
          {renderContent()}
        </div>
      </div>

      <Modal project={selectedProject} onClose={() => setSelectedProject(null)} onRetry={handleRetry} onDelete={handleDelete} />

      {notification && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          background: "#0f172a", border: `1px solid ${notification.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          borderRadius: 12, padding: "12px 18px", fontSize: 13,
          color: notification.type === "error" ? "#ef4444" : "#e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "notif 0.3s ease",
          display: "flex", alignItems: "center", gap: 8, maxWidth: 300
        }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
