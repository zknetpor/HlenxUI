import { useState, useEffect, useRef } from "react";

const STEPS = [
  { id: 1, icon: "⬇", label: "Ekstraksi Video", desc: "yt-dlp mengunduh & memisahkan audio" },
  { id: 2, icon: "🎙", label: "Transkripsi + Timestamps", desc: "Whisper AI mendeteksi setiap kata & waktunya" },
  { id: 3, icon: "🧠", label: "AI Voice Generation", desc: "ElevenLabs menghasilkan suara natural" },
  { id: 4, icon: "🔀", label: "Sync & Merge", desc: "ffmpeg menyinkronkan audio + video" },
  { id: 5, icon: "✅", label: "Output Siap", desc: "File MP4 dikirim ke browser" },
];

const VOICES = [
  { id: "aria", name: "Aria", tag: "Natural • Hangat", color: "#ec4899" },
  { id: "nova", name: "Nova", tag: "Tegas • Profesional", color: "#a855f7" },
  { id: "echo", name: "Echo", tag: "Lembut • Santai", color: "#06b6d4" },
];

const LANGS = ["Bahasa Indonesia", "English", "日本語", "Español", "Français"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes glitch1 {
    0%,100% { clip-path: inset(0 0 95% 0); transform: translate(-2px,0); }
    20% { clip-path: inset(30% 0 50% 0); transform: translate(2px,0); }
    40% { clip-path: inset(60% 0 20% 0); transform: translate(-1px,0); }
    60% { clip-path: inset(10% 0 80% 0); transform: translate(1px,0); }
    80% { clip-path: inset(80% 0 5% 0); transform: translate(-2px,0); }
  }
  @keyframes glitch2 {
    0%,100% { clip-path: inset(85% 0 0 0); transform: translate(2px,0); }
    25% { clip-path: inset(50% 0 30% 0); transform: translate(-2px,0); }
    50% { clip-path: inset(20% 0 70% 0); transform: translate(1px,0); }
    75% { clip-path: inset(70% 0 10% 0); transform: translate(-1px,0); }
  }
  @keyframes scanline {
    0% { transform: translateY(-100vh); }
    100% { transform: translateY(100vh); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes stepPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(236,72,153,0.4); }
    50%      { box-shadow: 0 0 0 8px rgba(236,72,153,0); }
  }
  @keyframes blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0; }
  }

  .nds-root {
    min-height: 100vh;
    background: #030303;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  .nds-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(236,72,153,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(236,72,153,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .nds-scanline {
    position: fixed; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(236,72,153,0.2), transparent);
    animation: scanline 8s linear infinite;
    z-index: 1; pointer-events: none;
  }
  .nds-content {
    position: relative; z-index: 2;
    padding: 40px 20px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .nds-header {
    text-align: center;
    margin-bottom: 52px;
    animation: fadeSlideUp 0.6s ease;
  }
  .nds-eyebrow {
    font-size: 11px; letter-spacing: 6px; color: #6b7280;
    margin-bottom: 16px; font-weight: 500; text-transform: uppercase;
  }
  .nds-title {
    margin: 0;
    font-size: clamp(30px, 5vw, 56px);
    font-family: 'Orbitron', sans-serif;
    font-weight: 900;
    background: linear-gradient(135deg, #ffffff 0%, #ec4899 50%, #f9a8d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
    line-height: 1.15;
    position: relative;
    display: inline-block;
  }
  .nds-title::before, .nds-title::after {
    content: attr(data-text);
    position: absolute; top: 0; left: 0;
    background: linear-gradient(135deg, #ffffff 0%, #ec4899 50%, #f9a8d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .nds-title::before { animation: glitch1 3.5s infinite steps(1); color: #ff6eb4; }
  .nds-title::after  { animation: glitch2 3.5s infinite steps(1); color: #00d4ff; }
  .nds-subtitle {
    margin-top: 16px; color: #6b7280; font-size: 15px;
    max-width: 440px; margin-inline: auto; line-height: 1.6;
  }
  .nds-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;
  }
  @media (max-width: 768px) {
    .nds-layout { grid-template-columns: 1fr; }
    .nds-sidebar { display: none; }
  }
  .nds-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(236,72,153,0.15);
    border-radius: 16px; padding: 32px;
    box-shadow: 0 0 80px rgba(236,72,153,0.05), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: fadeSlideUp 0.7s ease;
  }
  .nds-label {
    display: block; font-size: 12px; font-weight: 600;
    color: #ec4899; margin-bottom: 10px;
    letter-spacing: 1px; text-transform: uppercase;
  }
  .nds-input-wrap {
    display: flex; gap: 0;
    border-radius: 10px; overflow: hidden;
    border: 1px solid rgba(236,72,153,0.2);
    margin-bottom: 28px;
  }
  .nds-input-icon {
    padding: 0 14px; display: flex; align-items: center;
    background: rgba(236,72,153,0.05);
    border-right: 1px solid rgba(236,72,153,0.15);
    font-size: 16px;
  }
  .nds-input {
    flex: 1; background: #0a0a0a; border: none;
    padding: 14px 16px; color: #fff; font-size: 14px;
    outline: none; font-family: 'Inter', sans-serif;
    transition: box-shadow 0.2s;
  }
  .nds-input:focus {
    box-shadow: inset 0 0 0 1px #ec4899, 0 0 20px rgba(236,72,153,0.1);
  }
  .nds-input::placeholder { color: #3f3f46; }
  .nds-voices {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 10px; margin-bottom: 28px;
  }
  .nds-voice-card {
    padding: 14px 12px; border-radius: 10px; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease; text-align: center;
  }
  .nds-voice-card:hover {
    border-color: rgba(236,72,153,0.4);
    background: rgba(236,72,153,0.05);
  }
  .nds-voice-card.active {
    border-color: #ec4899;
    background: rgba(236,72,153,0.08);
  }
  .nds-voice-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    margin: 0 auto 10px; display: flex;
    align-items: center; justify-content: center; font-size: 18px;
  }
  .nds-voice-name { font-size: 13px; font-weight: 600; }
  .nds-voice-tag  { font-size: 10px; color: #6b7280; margin-top: 3px; }
  .nds-select {
    width: 100%; padding: 13px 16px;
    background: #0a0a0a;
    border: 1px solid rgba(236,72,153,0.2);
    border-radius: 10px; color: #fff; font-size: 14px;
    cursor: pointer; font-family: 'Inter', sans-serif;
    outline: none; margin-bottom: 32px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .nds-select:focus {
    border-color: #ec4899;
    box-shadow: 0 0 0 1px #ec4899, 0 0 20px rgba(236,72,153,0.1);
  }
  .nds-btn-primary {
    width: 100%; padding: 16px 0; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Orbitron', sans-serif; letter-spacing: 2px;
    transition: all 0.3s ease;
  }
  .nds-btn-primary.active {
    background: linear-gradient(135deg, #be185d, #ec4899);
    color: #fff;
    box-shadow: 0 0 20px rgba(236,72,153,0.35);
  }
  .nds-btn-primary.active:hover {
    box-shadow: 0 0 30px rgba(236,72,153,0.6), 0 0 60px rgba(236,72,153,0.2);
  }
  .nds-btn-primary.active:active { transform: scale(0.98); }
  .nds-btn-primary.disabled {
    background: #1a1a1a; color: #4b5563; cursor: not-allowed;
  }
  .nds-progress-bar-wrap {
    margin-bottom: 24px;
  }
  .nds-progress-meta {
    display: flex; justify-content: space-between; margin-bottom: 8px;
  }
  .nds-progress-label {
    font-size: 12px; color: #ec4899; font-weight: 600; letter-spacing: 1px;
  }
  .nds-progress-pct {
    font-size: 12px; color: #ec4899; font-family: 'Orbitron', sans-serif;
  }
  .nds-progress-track {
    height: 4px; background: rgba(255,255,255,0.06);
    border-radius: 4px; overflow: hidden;
  }
  .nds-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #be185d, #ec4899, #f9a8d4);
    border-radius: 4px;
    box-shadow: 0 0 12px rgba(236,72,153,0.6);
    transition: width 0.3s ease;
  }
  .nds-steps { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .nds-step {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
    background: transparent;
    transition: all 0.4s ease;
  }
  .nds-step.active {
    background: rgba(236,72,153,0.1);
    border-color: rgba(236,72,153,0.4);
    animation: stepPulse 1.5s infinite;
  }
  .nds-step.done {
    background: rgba(236,72,153,0.05);
    border-color: rgba(236,72,153,0.15);
  }
  .nds-step-icon {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    transition: all 0.4s ease;
  }
  .nds-step.active .nds-step-icon,
  .nds-step.done  .nds-step-icon {
    background: rgba(236,72,153,0.2);
    border-color: #ec4899;
  }
  .nds-step.done .nds-step-icon { background: #ec4899; }
  .nds-step-title { font-size: 13px; font-weight: 500; color: #6b7280; }
  .nds-step.active .nds-step-title,
  .nds-step.done  .nds-step-title { color: #ec4899; }
  .nds-step-desc  { font-size: 11px; color: #4b5563; margin-top: 2px; }
  .nds-blink { animation: blink 1s infinite; color: #ec4899; }
  .nds-terminal {
    background: #000; border: 1px solid rgba(236,72,153,0.15);
    border-radius: 10px; padding: 12px 16px;
    font-family: monospace; font-size: 11px; color: #6b7280;
    max-height: 140px; overflow-y: auto;
  }
  .nds-terminal::-webkit-scrollbar { width: 4px; }
  .nds-terminal::-webkit-scrollbar-track { background: transparent; }
  .nds-terminal::-webkit-scrollbar-thumb { background: rgba(236,72,153,0.3); border-radius: 2px; }
  .nds-done-icon {
    width: 80px; height: 80px; border-radius: 50%;
    margin: 0 auto 20px; font-size: 36px;
    background: radial-gradient(circle, rgba(236,72,153,0.2), transparent);
    border: 2px solid #ec4899;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 40px rgba(236,72,153,0.3);
  }
  .nds-done-title {
    margin: 0 0 8px; font-size: 22px;
    font-family: 'Orbitron', sans-serif; color: #ec4899; letter-spacing: 2px;
    text-align: center;
  }
  .nds-done-desc { color: #9ca3af; font-size: 14px; margin: 0 0 28px; text-align: center; line-height: 1.6; }
  .nds-btn-ghost {
    width: 100%; padding: 14px 0; border-radius: 12px;
    border: 1px solid rgba(236,72,153,0.25); background: transparent;
    color: #6b7280; font-size: 14px; cursor: pointer;
    transition: all 0.2s ease; font-family: 'Inter', sans-serif;
  }
  .nds-btn-ghost:hover { color: #ec4899; border-color: rgba(236,72,153,0.5); }
  .nds-sidebar { display: flex; flex-direction: column; gap: 16px; animation: fadeSlideUp 0.9s ease; }
  .nds-side-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 20px;
  }
  .nds-side-title {
    font-size: 11px; font-weight: 600; color: #6b7280;
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;
  }
  .nds-how-step { display: flex; gap: 12px; align-items: flex-start; }
  .nds-how-num {
    width: 28px; height: 28px; border-radius: 50%; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.25);
    flex-shrink: 0; color: #ec4899;
  }
  .nds-how-connector { width: 1px; height: 16px; background: rgba(236,72,153,0.1); margin-top: 4px; }
  .nds-how-label { font-size: 12px; font-weight: 500; color: #e5e7eb; line-height: 1.3; }
  .nds-how-desc  { font-size: 11px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
  .nds-stack-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .nds-stack-label { font-size: 12px; color: #6b7280; }
  .nds-stack-badge {
    font-size: 11px; font-weight: 600; padding: 3px 10px;
    border-radius: 20px;
  }
  .nds-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .nds-stat {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px; padding: 12px 14px; text-align: center;
  }
  .nds-stat-val { font-size: 18px; font-weight: 700; color: #ec4899; font-family: 'Orbitron', sans-serif; }
  .nds-stat-key { font-size: 10px; color: #6b7280; margin-top: 4px; }
  .nds-success-badge {
    width: 100%; padding: 14px; background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.2); color: #4ade80;
    border-radius: 10px; text-align: center;
    font-size: 14px; font-weight: 500; margin-bottom: 16px;
  }
`;

function App() {
  const [url, setUrl]             = useState("");
  const [voice, setVoice]         = useState("aria");
  const [lang, setLang]           = useState("Bahasa Indonesia");
  const [phase, setPhase]         = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress]   = useState(0);
  const [logs, setLogs]           = useState([]);
  const logRef = useRef(null);

  const LOG_LINES = [
    "[yt-dlp] Fetching video metadata...",
    "[yt-dlp] Downloading stream (720p)...",
    "[ffmpeg] Extracting audio track → audio.wav",
    "[Whisper] Loading model: medium...",
    "[Whisper] Transcribing segments...",
    "[Whisper] 47 segments detected with timestamps",
    "[ElevenLabs] Sending 47 chunks to TTS API...",
    "[ElevenLabs] Voice synthesis complete (2.1s)",
    "[ffmpeg] Aligning audio segments to timestamps...",
    "[ffmpeg] Merging audio + video → output.mp4",
  ];

  const STEP_DURATIONS = [1500, 2500, 2000, 1800, 800];

  useEffect(() => {
    if (phase !== "processing") return;
    let stepIdx = 0, logIdx = 0, prog = 0;

    const logInterval = setInterval(() => {
      if (logIdx < LOG_LINES.length) {
        setLogs(prev => [...prev, LOG_LINES[logIdx]]);
        logIdx++;
      }
    }, 900);

    const progressInterval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 4, 95);
      setProgress(Math.floor(prog));
    }, 300);

    const advanceStep = () => {
      if (stepIdx < STEPS.length) {
        setCurrentStep(stepIdx);
        stepIdx++;
        if (stepIdx < STEPS.length) {
          setTimeout(advanceStep, STEP_DURATIONS[stepIdx - 1] || 1500);
        } else {
          setTimeout(() => {
            clearInterval(logInterval);
            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => setPhase("done"), 600);
          }, 1200);
        }
      }
    };
    advanceStep();

    return () => { clearInterval(logInterval); clearInterval(progressInterval); };
  }, [phase]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handleStart = () => {
    if (!url.trim()) return;
    setPhase("processing");
    setCurrentStep(0);
    setProgress(0);
    setLogs([`[System] Starting pipeline for: ${url.slice(0, 50)}...`]);
  };

  const handleReset = () => {
    setPhase("idle");
    setUrl("");
    setCurrentStep(0);
    setProgress(0);
    setLogs([]);
  };

  return (
    <>
      <style>{css}</style>
      <div className="nds-root">
        <div className="nds-grid-bg" aria-hidden="true" />
        <div className="nds-scanline"  aria-hidden="true" />

        <div className="nds-content">
          {/* Header */}
          <div className="nds-header">
            <div className="nds-eyebrow">AI · DUBBING · STUDIO</div>
            <h1 className="nds-title" data-text="NEURAL DUBBING">NEURAL DUBBING</h1>
            <p className="nds-subtitle">
              Alih suara video YouTube otomatis dengan AI — sinkron sempurna, terdengar seperti manusia sungguhan.
            </p>
          </div>

          {/* Layout */}
          <div className="nds-layout">
            {/* Main Card */}
            <div className="nds-card">
              {/* ── IDLE ── */}
              {phase === "idle" && (
                <>
                  <label className="nds-label">URL Video YouTube</label>
                  <div className="nds-input-wrap">
                    <div className="nds-input-icon">▶</div>
                    <input
                      className="nds-input"
                      type="text"
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                  </div>

                  <label className="nds-label">Pilih Karakter Suara</label>
                  <div className="nds-voices">
                    {VOICES.map(v => (
                      <div
                        key={v.id}
                        className={`nds-voice-card${voice === v.id ? " active" : ""}`}
                        onClick={() => setVoice(v.id)}
                      >
                        <div
                          className="nds-voice-avatar"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${v.color}33, #0a0a0a)`,
                            border: `1px solid ${v.color}44`,
                          }}
                        >🎙</div>
                        <div className="nds-voice-name" style={{ color: voice === v.id ? "#ec4899" : "#e5e7eb" }}>
                          {v.name}
                        </div>
                        <div className="nds-voice-tag">{v.tag}</div>
                      </div>
                    ))}
                  </div>

                  <label className="nds-label">Bahasa Target Dubbing</label>
                  <select
                    className="nds-select"
                    value={lang}
                    onChange={e => setLang(e.target.value)}
                  >
                    {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>

                  <button
                    className={`nds-btn-primary ${url.trim() ? "active" : "disabled"}`}
                    onClick={handleStart}
                    disabled={!url.trim()}
                  >
                    {url.trim() ? "▶  MULAI DUBBING" : "Masukkan URL terlebih dahulu"}
                  </button>
                </>
              )}

              {/* ── PROCESSING ── */}
              {phase === "processing" && (
                <>
                  <div className="nds-progress-bar-wrap">
                    <div className="nds-progress-meta">
                      <span className="nds-progress-label">PROGRESS</span>
                      <span className="nds-progress-pct">{progress}%</span>
                    </div>
                    <div className="nds-progress-track">
                      <div className="nds-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="nds-steps">
                    {STEPS.map((s, i) => (
                      <div
                        key={s.id}
                        className={`nds-step${i === currentStep ? " active" : i < currentStep ? " done" : ""}`}
                      >
                        <div className="nds-step-icon">
                          {i < currentStep ? "✓" : s.icon}
                        </div>
                        <div>
                          <div className="nds-step-title">{s.label}</div>
                          <div className="nds-step-desc">{s.desc}</div>
                        </div>
                        {i === currentStep && (
                          <div className="nds-blink" style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#ec4899" }} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="nds-terminal" ref={logRef}>
                    {logs.map((l, i) => (
                      <div key={i} style={{ padding: "1px 0", color: l.includes("ElevenLabs") ? "#f9a8d4" : "#6b7280" }}>
                        <span style={{ color: "#374151" }}>$ </span>{l}
                      </div>
                    ))}
                    <span className="nds-blink">█</span>
                  </div>
                </>
              )}

              {/* ── DONE ── */}
              {phase === "done" && (
                <div style={{ textAlign: "center" }}>
                  <div className="nds-done-icon">✓</div>
                  <h2 className="nds-done-title">DUBBING SELESAI</h2>
                  <p className="nds-done-desc">
                    Video telah berhasil dialih suarakan ke{" "}
                    <strong style={{ color: "#f9a8d4" }}>{lang}</strong>{" "}
                    dengan suara{" "}
                    <strong style={{ color: "#f9a8d4" }}>
                      {VOICES.find(v => v.id === voice)?.name}
                    </strong>.
                  </p>
                  <div className="nds-success-badge">✨ File MP4 siap diunduh!</div>
                  <button
                    className="nds-btn-primary active"
                    style={{ marginBottom: 12 }}
                    onClick={() => alert("Hubungkan ke backend untuk download nyata!")}
                  >
                    ⬇  DOWNLOAD MP4
                  </button>
                  <button className="nds-btn-ghost" onClick={handleReset}>
                    Proses Video Baru
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="nds-sidebar">
              {/* How it works */}
              <div className="nds-side-card">
                <div className="nds-side-title">Cara Kerja</div>
                {STEPS.map((s, i) => (
                  <div key={s.id} style={{ marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                    <div className="nds-how-step">
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div className="nds-how-num">{s.id}</div>
                        {i < STEPS.length - 1 && <div className="nds-how-connector" />}
                      </div>
                      <div style={{ paddingBottom: i < STEPS.length - 1 ? 12 : 0 }}>
                        <div className="nds-how-label">{s.label}</div>
                        <div className="nds-how-desc">{s.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="nds-side-card">
                <div className="nds-side-title">Tech Stack</div>
                {[
                  { label: "Frontend",  tech: "Next.js + Vite",    color: "#06b6d4" },
                  { label: "Backend",   tech: "Python + FastAPI",  color: "#a855f7" },
                  { label: "STT",       tech: "OpenAI Whisper",    color: "#f59e0b" },
                  { label: "TTS",       tech: "ElevenLabs API",    color: "#ec4899" },
                  { label: "Video",     tech: "ffmpeg + yt-dlp",   color: "#4ade80" },
                ].map(t => (
                  <div key={t.label} className="nds-stack-row">
                    <span className="nds-stack-label">{t.label}</span>
                    <span
                      className="nds-stack-badge"
                      style={{
                        background: `${t.color}18`,
                        border: `1px solid ${t.color}44`,
                        color: t.color,
                      }}
                    >{t.tech}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="nds-stats">
                {[
                  { label: "Akurasi STT", value: "~95%" },
                  { label: "Avg. Proses",  value: "~40s" },
                  { label: "Format Out",   value: "MP4"  },
                  { label: "Max Durasi",   value: "15 min" },
                ].map(s => (
                  <div key={s.label} className="nds-stat">
                    <div className="nds-stat-val">{s.value}</div>
                    <div className="nds-stat-key">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
