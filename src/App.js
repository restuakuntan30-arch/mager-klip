import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  {
    id: 1,
    title: "Product Launch Reel",
    status: "done",
    duration: "0:32",
    size: "124MB",
    thumb: "🎬",
    createdAt: "2 jam lalu",
    tags: ["marketing", "product"],
    progress: 100,
  },
  {
    id: 2,
    title: "Behind The Scenes - Studio",
    status: "processing",
    duration: "1:14",
    size: "340MB",
    thumb: "🎥",
    createdAt: "5 jam lalu",
    tags: ["bts", "studio"],
    progress: 67,
  },
  {
    id: 3,
    title: "Tutorial AI Workflow",
    status: "done",
    duration: "2:05",
    size: "512MB",
    thumb: "🤖",
    createdAt: "1 hari lalu",
    tags: ["tutorial", "ai"],
    progress: 100,
  },
  {
    id: 4,
    title: "Highlight Reel Q2",
    status: "queued",
    duration: "--:--",
    size: "--",
    thumb: "✨",
    createdAt: "Baru saja",
    tags: ["highlight"],
    progress: 0,
  },
  {
    id: 5,
    title: "Short Form — Instagram",
    status: "done",
    duration: "0:15",
    size: "48MB",
    thumb: "📱",
    createdAt: "3 hari lalu",
    tags: ["social", "ig"],
    progress: 100,
  },
  {
    id: 6,
    title: "Cinematic Brand Story",
    status: "failed",
    duration: "--:--",
    size: "--",
    thumb: "🎞",
    createdAt: "4 hari lalu",
    tags: ["brand"],
    progress: 34,
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080a0f;
    --bg2: #0d1017;
    --bg3: #131720;
    --surface: rgba(255,255,255,0.04);
    --surface2: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.14);
    --gold: #f5a623;
    --gold2: #ffc85a;
    --gold-dim: rgba(245,166,35,0.15);
    --gold-glow: rgba(245,166,35,0.35);
    --red: #ff4d6d;
    --green: #39d98a;
    --blue: #4d9fff;
    --text: #e8eaf0;
    --text2: #8a8fa8;
    --text3: #50556a;
    --radius: 14px;
    --radius-sm: 8px;
    --sidebar: 240px;
  }

  html, body, #root { height: 100%; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: var(--sidebar);
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }

  .sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: -1px;
    width: 1px; height: 100%;
    background: linear-gradient(180deg, transparent, var(--gold-dim), transparent);
  }

  .logo-area {
    padding: 22px 20px 18px;
    border-bottom: 1px solid var(--border);
  }

  .logo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--gold), #e8820f);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    box-shadow: 0 0 16px var(--gold-glow);
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: -0.3px;
    color: var(--text);
  }

  .logo-text span {
    color: var(--gold);
  }

  .logo-ver {
    font-size: 10px;
    color: var(--text3);
    margin-top: 2px;
    font-weight: 300;
    letter-spacing: 0.5px;
  }

  .nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text3);
    padding: 10px 8px 6px;
    font-weight: 500;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.18s ease;
    color: var(--text2);
    font-size: 13.5px;
    font-weight: 400;
    user-select: none;
    position: relative;
  }

  .nav-item:hover {
    background: var(--surface);
    color: var(--text);
  }

  .nav-item.active {
    background: var(--gold-dim);
    color: var(--gold2);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    background: var(--gold);
    border-radius: 0 3px 3px 0;
  }

  .nav-icon { font-size: 15px; width: 18px; text-align: center; }

  .nav-badge {
    margin-left: auto;
    background: var(--gold);
    color: #000;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 20px;
  }

  .nav-badge.new {
    background: var(--red);
    color: #fff;
  }

  .sidebar-footer {
    padding: 14px 12px;
    border-top: 1px solid var(--border);
  }

  .storage-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
  }

  .storage-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .storage-label {
    font-size: 11px;
    color: var(--text2);
    font-weight: 500;
  }

  .storage-plan {
    font-size: 10px;
    background: var(--gold-dim);
    color: var(--gold);
    padding: 2px 7px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .storage-bar {
    height: 4px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .storage-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--gold2));
    border-radius: 4px;
    transition: width 1s ease;
    box-shadow: 0 0 8px var(--gold-glow);
  }

  .storage-nums {
    font-size: 11px;
    color: var(--text3);
  }

  /* MAIN */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg);
  }

  /* TOPBAR */
  .topbar {
    display: flex;
    align-items: center;
    padding: 14px 28px;
    border-bottom: 1px solid var(--border);
    gap: 16px;
    background: var(--bg2);
  }

  .topbar-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
    flex: 1;
  }

  .topbar-title span {
    color: var(--gold);
  }

  .search-wrap {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 7px 12px;
    gap: 8px;
    transition: border-color 0.2s;
  }

  .search-wrap:focus-within {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
  }

  .search-icon { color: var(--text3); font-size: 14px; }

  .search-input {
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    width: 180px;
  }

  .search-input::placeholder { color: var(--text3); }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    border: none;
    outline: none;
    white-space: nowrap;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--gold), #e8820f);
    color: #000;
    font-weight: 700;
    box-shadow: 0 4px 16px var(--gold-glow);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px var(--gold-glow);
  }

  .btn-ghost {
    background: var(--surface);
    color: var(--text2);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover {
    background: var(--surface2);
    color: var(--text);
    border-color: var(--border2);
  }

  /* CONTENT */
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .content::-webkit-scrollbar { width: 5px; }
  .content::-webkit-scrollbar-track { background: transparent; }
  .content::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* STATS */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .stat-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }

  .stat-card:hover {
    border-color: var(--border2);
    transform: translateY(-2px);
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-dim), transparent);
  }

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .stat-icon.gold { background: var(--gold-dim); }
  .stat-icon.green { background: rgba(57,217,138,0.12); }
  .stat-icon.blue { background: rgba(77,159,255,0.12); }
  .stat-icon.red { background: rgba(255,77,109,0.12); }

  .stat-trend {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 20px;
  }

  .stat-trend.up { background: rgba(57,217,138,0.15); color: var(--green); }
  .stat-trend.down { background: rgba(255,77,109,0.12); color: var(--red); }

  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text3);
    font-weight: 400;
  }

  /* SECTION HEADER */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-count {
    background: var(--surface2);
    color: var(--text3);
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
  }

  .filter-tabs {
    display: flex;
    gap: 6px;
  }

  .filter-tab {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s;
    border: 1px solid transparent;
    color: var(--text3);
    background: none;
    font-family: 'DM Sans', sans-serif;
  }

  .filter-tab:hover { color: var(--text2); }

  .filter-tab.active {
    background: var(--gold-dim);
    color: var(--gold);
    border-color: rgba(245,166,35,0.25);
  }

  /* PROJECT GRID */
  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .project-card {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: all 0.22s ease;
    cursor: pointer;
    position: relative;
  }

  .project-card:hover {
    border-color: var(--border2);
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.4);
  }

  .project-card.selected {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px var(--gold-dim), 0 8px 24px rgba(0,0,0,0.3);
  }

  .project-thumb {
    height: 120px;
    background: linear-gradient(135deg, #0e1320, #161d2e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38px;
    position: relative;
    overflow: hidden;
  }

  .project-thumb::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, var(--bg3));
  }

  .thumb-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.5);
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 2;
    gap: 10px;
  }

  .project-card:hover .thumb-overlay { opacity: 1; }

  .thumb-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.18s;
    color: white;
  }

  .thumb-btn:hover {
    background: var(--gold);
    color: #000;
    border-color: var(--gold);
  }

  .status-badge {
    position: absolute;
    top: 10px; right: 10px;
    z-index: 3;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }

  .status-badge.done { background: rgba(57,217,138,0.2); color: var(--green); border: 1px solid rgba(57,217,138,0.3); }
  .status-badge.processing { background: rgba(77,159,255,0.2); color: var(--blue); border: 1px solid rgba(77,159,255,0.3); }
  .status-badge.queued { background: rgba(245,166,35,0.15); color: var(--gold); border: 1px solid rgba(245,166,35,0.25); }
  .status-badge.failed { background: rgba(255,77,109,0.15); color: var(--red); border: 1px solid rgba(255,77,109,0.25); }

  .project-body {
    padding: 14px;
  }

  .project-name {
    font-family: 'Syne', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11.5px;
    color: var(--text3);
    margin-bottom: 10px;
  }

  .meta-dot {
    width: 3px; height: 3px;
    background: var(--border2);
    border-radius: 50%;
  }

  .project-tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .tag {
    font-size: 10px;
    background: var(--surface);
    color: var(--text3);
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid var(--border);
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .progress-wrap {
    margin-top: 4px;
  }

  .progress-top {
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    color: var(--text3);
    margin-bottom: 5px;
  }

  .progress-bar {
    height: 3px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
  }

  .progress-fill.done { background: linear-gradient(90deg, var(--green), #6bfbb8); }
  .progress-fill.processing {
    background: linear-gradient(90deg, var(--blue), #a0d4ff);
    animation: pulse-bar 1.5s ease-in-out infinite;
  }
  .progress-fill.queued { background: var(--border2); }
  .progress-fill.failed { background: linear-gradient(90deg, var(--red), #ff8fa3); }

  @keyframes pulse-bar {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  /* GENERATE PANEL */
  .generate-panel {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    position: relative;
    overflow: hidden;
  }

  .generate-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 10%, var(--gold), transparent 90%);
  }

  .gp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .gp-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .gp-pulse {
    width: 8px; height: 8px;
    background: var(--gold);
    border-radius: 50%;
    animation: gp-blink 1.8s ease-in-out infinite;
    box-shadow: 0 0 8px var(--gold);
  }

  @keyframes gp-blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  .gp-body {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    align-items: end;
  }

  .gp-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--text3);
    font-weight: 500;
  }

  .field-input, .field-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 9px 13px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    transition: all 0.18s;
    width: 100%;
  }

  .field-input:focus, .field-select:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
  }

  .field-input::placeholder { color: var(--text3); }

  .field-select option { background: var(--bg3); }

  /* MODAL */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade-in 0.2s ease;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: 18px;
    padding: 28px;
    width: 460px;
    max-width: 90vw;
    position: relative;
    animation: slide-up 0.25s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }

  .modal-close {
    position: absolute;
    top: 16px; right: 16px;
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text3);
    font-size: 14px;
    transition: all 0.18s;
  }

  .modal-close:hover { background: var(--red); color: white; border-color: var(--red); }

  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .modal-sub {
    font-size: 12.5px;
    color: var(--text3);
    margin-bottom: 22px;
    line-height: 1.5;
  }

  .upload-zone {
    border: 2px dashed var(--border2);
    border-radius: var(--radius);
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 18px;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--gold);
    background: var(--gold-dim);
  }

  .upload-icon { font-size: 32px; margin-bottom: 10px; }

  .upload-text {
    font-size: 13px;
    color: var(--text2);
    margin-bottom: 4px;
  }

  .upload-hint { font-size: 11px; color: var(--text3); }

  .modal-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .modal-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--bg2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 13px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    z-index: 200;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: toast-in 0.3s cubic-bezier(0.4,0,0.2,1);
    max-width: 280px;
  }

  @keyframes toast-i
