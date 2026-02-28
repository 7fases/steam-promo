import React, { useState, useEffect, useRef } from 'react';

// Inline styles to avoid CSS module path issues
const css = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

:root {
  --sp-bg: #04060f;
  --sp-card: #080c18;
  --sp-primary: #ffcd4d;
  --sp-primary-dark: #9a7220;
  --sp-primary-glow: rgba(255,205,77,0.35);
  --sp-secondary: #4d7eff;
  --sp-secondary-dark: #1a3a8f;
  --sp-secondary-glow: rgba(77,126,255,0.3);
  --sp-success: #3ddc5a;
  --sp-error: #ff4d5e;
  --sp-warning: #ffaa33;
  --sp-tg: #29b5e8;
  --sp-dc: #5865f2;
  --sp-text: #e8dfc8;
  --sp-dim: #7a8faa;
  --sp-shadow: 4px 4px 0 #00000099;
  --sp-font-title: 'Press Start 2P', monospace;
  --sp-font-body: 'VT323', 'Courier New', monospace;
}

.sp-wrap {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(77,126,255,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 70%, rgba(255,77,141,0.06) 0%, transparent 60%),
    #04060f;
  font-family: var(--sp-font-body);
  color: var(--sp-text);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 72px 12px 48px;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

.sp-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.sp-scanlines {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
}

/* Avatar - fixed top right on ALL screen sizes */
.sp-avatar {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid var(--sp-primary);
  box-shadow: 0 0 0 3px var(--sp-primary-dark), 0 0 18px var(--sp-primary-glow);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}
.sp-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.sp-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 3px var(--sp-primary-dark), 0 0 32px var(--sp-primary-glow);
}

/* Card */
.sp-card {
  position: relative;
  z-index: 2;
  background: var(--sp-card);
  width: 100%;
  max-width: 600px;
  padding: 28px 20px 24px;
  border: 2px solid var(--sp-secondary);
  outline: 2px solid var(--sp-secondary-dark);
  box-shadow: var(--sp-shadow), 0 0 30px var(--sp-secondary-glow), inset 0 0 40px rgba(0,0,0,0.5);
  margin-top: 0;
  border-radius: 14px;
  animation: sp-appear 0.6s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes sp-appear {
  from { opacity:0; transform: translateY(24px) scale(0.97); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}

/* Corners */
.sp-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid var(--sp-primary);
  z-index: 3;
  animation: sp-corner-pulse 2s infinite alternate;
}
@keyframes sp-corner-pulse {
  from { box-shadow: none; }
  to   { box-shadow: 0 0 8px var(--sp-primary-glow); }
}
.sp-tl { top:8px; left:8px; border-right:none; border-bottom:none; }
.sp-tr { top:8px; right:8px; border-left:none; border-bottom:none; animation-direction: alternate-reverse; }
.sp-bl { bottom:8px; left:8px; border-right:none; border-top:none; animation-direction: alternate-reverse; }
.sp-br { bottom:8px; right:8px; border-left:none; border-top:none; }

/* Header */
.sp-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 6px;
  text-align: center;
}
.sp-hicon {
  font-size: 1.8rem;
  animation: sp-float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 6px var(--sp-primary-glow));
}
.sp-hicon:last-child { animation-delay: 1.5s; }
@keyframes sp-float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-7px); }
}
.sp-title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.sp-title {
  font-family: var(--sp-font-title);
  font-size: clamp(0.85rem, 4.5vw, 1.5rem);
  color: var(--sp-primary);
  text-shadow: 3px 3px 0 var(--sp-primary-dark), 0 0 14px var(--sp-primary);
  margin: 0;
  letter-spacing: 2px;
  animation: sp-glow 3s ease-in-out infinite alternate;
}
@keyframes sp-glow {
  from { text-shadow: 3px 3px 0 var(--sp-primary-dark), 0 0 10px var(--sp-primary); }
  to   { text-shadow: 3px 3px 0 var(--sp-primary-dark), 0 0 22px var(--sp-primary), 0 0 44px var(--sp-primary-glow); }
}
.sp-subtitle {
  font-family: var(--sp-font-body);
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  color: var(--sp-secondary);
  letter-spacing: 3px;
  margin: 0;
  text-shadow: 0 0 10px var(--sp-secondary-glow);
  text-transform: uppercase;
  animation: sp-flicker 6s infinite;
}
@keyframes sp-flicker {
  0%,94%,100% { opacity:1; }
  95% { opacity:0.3; }
  97% { opacity:0.8; }
}

/* Divider */
.sp-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}
.sp-dot {
  width: 8px; height: 8px;
  background: var(--sp-primary);
  flex-shrink: 0;
  animation: sp-dot-pulse 1.5s ease-in-out infinite alternate;
}
.sp-dot:last-child { animation-delay: 0.75s; }
@keyframes sp-dot-pulse {
  from { opacity:0.5; box-shadow: none; }
  to   { opacity:1;   box-shadow: 0 0 8px var(--sp-primary); }
}
.sp-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--sp-primary-dark), var(--sp-secondary), var(--sp-primary-dark));
  background-size: 200% 100%;
  animation: sp-line-move 3s linear infinite;
}
@keyframes sp-line-move {
  from { background-position: 0% 0%; }
  to   { background-position: 200% 0%; }
}

/* Social */
.sp-social-section { text-align: center; margin-bottom: 4px; }
.sp-social-label {
  font-family: var(--sp-font-body);
  font-size: clamp(0.9rem, 3.5vw, 1.1rem);
  color: var(--sp-dim);
  margin: 0 0 14px;
  letter-spacing: 1px;
}
.sp-social-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.sp-sbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  font-family: var(--sp-font-title);
  font-size: 0.6rem;
  text-decoration: none;
  text-transform: uppercase;
  border: 2px solid;
  background: rgba(10,14,28,0.8);
  min-width: 130px;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s, color 0.2s;
  box-shadow: var(--sp-shadow);
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.sp-sbtn::after {
  content: '';
  position: absolute;
  top:-50%; left:-60%;
  width:40%; height:200%;
  background: linear-gradient(105deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: skewX(-20deg);
  transition: left 0.4s;
}
.sp-sbtn:hover::after { left: 120%; }

.sp-tg { border-color: var(--sp-tg); color: var(--sp-tg); }
.sp-tg:hover {
  background: var(--sp-tg); color: #fff;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 0 20px rgba(41,181,232,0.6), var(--sp-shadow);
}
.sp-dc { border-color: var(--sp-dc); color: var(--sp-dc); }
.sp-dc:hover {
  background: var(--sp-dc); color: #fff;
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 0 20px rgba(88,101,242,0.6), var(--sp-shadow);
}

/* Form */
.sp-form { display: flex; flex-direction: column; }
.sp-label {
  font-family: var(--sp-font-title);
  font-size: 0.55rem;
  color: var(--sp-dim);
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.sp-input {
  width: 100%;
  padding: 14px;
  font-family: var(--sp-font-body);
  font-size: 1.05rem;
  background: #04080f;
  border: 2px solid #1e2d45;
  color: var(--sp-text);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  caret-color: var(--sp-primary);
  border-radius: 8px;
}
.sp-input:focus {
  border-color: var(--sp-secondary);
  box-shadow: 0 0 0 3px var(--sp-secondary-glow), inset 0 0 12px rgba(0,0,0,0.5);
}
.sp-input::placeholder { color: #2e4060; }
.sp-input:disabled { opacity:0.5; cursor:not-allowed; }

/* Buttons */
.sp-btn {
  width: 100%;
  margin-top: 14px;
  padding: 16px 12px;
  font-family: var(--sp-font-title);
  font-size: 0.7rem;
  border: 2px solid;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  box-shadow: var(--sp-shadow);
  transition: transform 0.1s, box-shadow 0.2s, filter 0.2s;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}
.sp-btn:active:not(:disabled) {
  transform: scale(0.97) translateY(2px);
  box-shadow: 2px 2px 0 #00000099;
}
.sp-btn:disabled { opacity:0.45; cursor:not-allowed; filter:grayscale(0.4); }

.sp-btn-yellow {
  background: linear-gradient(180deg, var(--sp-primary), var(--sp-primary-dark));
  border-color: var(--sp-primary-dark);
  color: #0a060f;
}
.sp-btn-yellow:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 22px var(--sp-primary-glow), var(--sp-shadow);
  filter: brightness(1.1);
}
.sp-btn-green {
  background: linear-gradient(180deg, var(--sp-success), #1a5c2a);
  border-color: #1a5c2a;
  color: #fff;
  animation: sp-green-pulse 2s infinite alternate;
}
@keyframes sp-green-pulse {
  from { box-shadow: var(--sp-shadow); }
  to   { box-shadow: 0 0 18px rgba(61,220,90,0.45), var(--sp-shadow); }
}
.sp-btn-green:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.15);
  box-shadow: 0 0 24px rgba(61,220,90,0.5), var(--sp-shadow);
}

/* Loading dots */
.sp-dots span {
  animation: sp-blink 1.2s infinite;
  opacity: 0;
}
.sp-dots span:nth-child(1) { animation-delay: 0s; }
.sp-dots span:nth-child(2) { animation-delay: 0.3s; }
.sp-dots span:nth-child(3) { animation-delay: 0.6s; }
@keyframes sp-blink {
  0%,80%,100% { opacity:0; }
  40% { opacity:1; }
}

/* Game card */
.sp-game-card {
  margin-top: 20px;
  animation: sp-slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
@keyframes sp-slide-up {
  from { opacity:0; transform: translateY(16px); }
  to   { opacity:1; transform: translateY(0); }
}
.sp-img-frame {
  position: relative;
  padding: 5px;
  background: #04060a;
  border: 2px solid var(--sp-secondary);
  outline: 2px solid var(--sp-secondary-dark);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8), var(--sp-shadow), 0 0 16px var(--sp-secondary-glow);
  overflow: hidden;
  border-radius: 10px;
}
.sp-img-frame img {
  width: 100%;
  display: block;
  max-height: 240px;
  object-fit: cover;
}
.sp-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(8,12,24,0.7) 100%);
  pointer-events: none;
}
.sp-game-name {
  margin: 14px 0 0;
  font-family: var(--sp-font-body);
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  color: var(--sp-primary);
  text-shadow: 2px 2px 0 var(--sp-primary-dark), 0 0 12px var(--sp-primary-glow);
  word-break: break-word;
  line-height: 1.4;
}

/* Messages */
.sp-msg {
  margin-top: 18px;
  padding: 12px 16px;
  font-family: var(--sp-font-body);
  font-size: 1rem;
  border: 2px solid;
  background: rgba(4,6,15,0.9);
  text-align: center;
  box-shadow: inset 0 0 16px rgba(0,0,0,0.5), var(--sp-shadow);
  animation: sp-msg-in 0.3s ease both;
  letter-spacing: 1px;
  border-radius: 8px;
}
@keyframes sp-msg-in {
  from { opacity:0; transform: translateY(-8px); }
  to   { opacity:1; transform: translateY(0); }
}
.sp-info    { border-color: var(--sp-secondary); color: var(--sp-secondary); }
.sp-sucesso { border-color: var(--sp-success);   color: var(--sp-success); }
.sp-erro    { border-color: var(--sp-error);     color: var(--sp-error); animation: sp-msg-in 0.3s ease both, sp-shake 0.4s ease both; }
.sp-aviso   { border-color: var(--sp-warning);   color: var(--sp-warning); }
@keyframes sp-shake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}

/* Footer */
.sp-footer {
  margin-top: 28px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #1a2340;
}
.sp-pixels {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
}
.sp-px {
  width: 6px; height: 6px;
  display: inline-block;
  animation: sp-pixel-dance 1.5s ease-in-out infinite;
}
.sp-px:nth-child(1) { background: var(--sp-primary);   animation-delay:0s; }
.sp-px:nth-child(2) { background: var(--sp-secondary);  animation-delay:0.15s; }
.sp-px:nth-child(3) { background: #ff4d8d;               animation-delay:0.3s; }
.sp-px:nth-child(4) { background: var(--sp-success);    animation-delay:0.45s; }
.sp-px:nth-child(5) { background: var(--sp-primary);   animation-delay:0.6s; }
.sp-px:nth-child(6) { background: var(--sp-secondary);  animation-delay:0.75s; }
.sp-px:nth-child(7) { background: #ff4d8d;               animation-delay:0.9s; }
.sp-px:nth-child(8) { background: var(--sp-success);    animation-delay:1.05s; }
@keyframes sp-pixel-dance {
  0%,100% { transform: translateY(0); opacity:0.6; }
  50%      { transform: translateY(-8px); opacity:1; }
}
.sp-footer-text {
  font-family: var(--sp-font-title);
  font-size: 0.48rem;
  color: var(--sp-dim);
  margin: 0;
  letter-spacing: 2px;
  animation: sp-footer-glow 3s ease-in-out infinite alternate;
}
@keyframes sp-footer-glow {
  from { color: var(--sp-dim); }
  to   { color: var(--sp-secondary); text-shadow: 0 0 12px var(--sp-secondary-glow); }
}

/* Responsive */
@media (min-width: 480px) {
  .sp-wrap { padding: 72px 16px 56px; }
  .sp-card { padding: 36px 32px 28px; }
  .sp-avatar { width: 62px; height: 62px; top: 16px; right: 16px; }
}
@media (min-width: 768px) {
  .sp-wrap { padding: 80px 24px 60px; }
  .sp-card { max-width: 680px; padding: 44px 40px 36px; }
  .sp-img-frame img { max-height: 300px; }
  .sp-avatar { width: 68px; height: 68px; top: 20px; right: 24px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// Particles canvas
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const SYMBOLS = ['◆', '▲', '●', '★', '♦', '⚔', '⚡', '✦', '◈', '▶'];
    const COLORS = ['#ffcd4d', '#4d7eff', '#ff4d8d', '#4dffb0', '#ff8c4d', '#b04dff'];

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      size: Math.floor(Math.random() * 3 + 1) * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      alpha: Math.random() * 0.45 + 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.018,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.x < -60) p.x = canvas.width + 60;
        if (p.x > canvas.width + 60) p.x = -60;
        if (p.y < -60) p.y = canvas.height + 60;
        if (p.y > canvas.height + 60) p.y = -60;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px monospace`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="sp-canvas" />;
}

function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  // UX: hide enviar button when game already exists or on error until new search
  const [enviarBloqueado, setEnviarBloqueado] = useState(false);

  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

  const mostrarMensagem = (texto, tipo = 'info') => {
    setMensagem({ texto, tipo });
    if (tipo !== 'erro') {
      setTimeout(() => setMensagem({ texto: '', tipo: '' }), 4000);
    }
  };

  const buscar = async () => {
    if (!url.match(steamRegex)) {
      mostrarMensagem('⚠️ URL inválida! Insira uma URL da Steam.', 'erro');
      return;
    }
    mostrarMensagem('⏳ Buscando dados...', 'info');
    setLoading(true);
    setEnviarBloqueado(false);
    setGameAtual(null);
    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'buscar', url }),
      });
      const res = await response.json();
      if (!response.ok || res.status !== 'ok') throw new Error(res.mensagem || 'Erro ao buscar jogo');
      setGameAtual(res);
      mostrarMensagem('✅ Jogo encontrado!', 'sucesso');
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const enviar = async () => {
    if (!gameAtual) return;
    mostrarMensagem('⏳ Enviando sugestão...', 'info');
    setLoading(true);
    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'salvar',
          nome: gameAtual.nome,
          url,
          id: gameAtual.id,
          tipo: gameAtual.tipo,
        }),
      });
      const res = await response.json();
      if (res.status === 'ok') {
        mostrarMensagem(res.mensagem, 'sucesso');
        setGameAtual(null);
        setUrl('');
        setEnviarBloqueado(false);
      } else if (res.status === 'existe') {
        mostrarMensagem(res.mensagem, 'aviso');
        setEnviarBloqueado(true); // hide enviar button: game already tracked
      } else {
        throw new Error(res.mensagem || 'Erro ao enviar');
      }
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
      setEnviarBloqueado(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="sp-wrap">
        <Particles />
        <div className="sp-scanlines" />

        {/* Profile avatar */}
        <a
          href="https://github.com/7fases"
          target="_blank"
          rel="noopener noreferrer"
          className="sp-avatar"
          title="Criado por 7Fases"
        >
          <img
            src="https://7fases.github.io/youtube/imagens/Logo%20versao%202.0.webp"
            alt="7Fases"
          />
        </a>

        <div className="sp-card">
          <span className="sp-corner sp-tl" />
          <span className="sp-corner sp-tr" />
          <span className="sp-corner sp-bl" />
          <span className="sp-corner sp-br" />

          {/* Header */}
          <header className="sp-header">
            <span className="sp-hicon">🎮</span>
            <div className="sp-title-block">
              <h1 className="sp-title">STEAM PROMO</h1>
              <p className="sp-subtitle">⚔ Rastreador de Preços ⚔</p>
            </div>
            <span className="sp-hicon">🛡</span>
          </header>

          {/* Divider */}
          <div className="sp-divider">
            <span className="sp-dot" />
            <span className="sp-line" />
            <span className="sp-dot" />
          </div>

          {/* Social */}
          <div className="sp-social-section">
            <p className="sp-social-label">📡 Acompanhe as promos pelo Discord e Telegram</p>
            <div className="sp-social-btns">
              <a href="https://t.me/steampromocao" target="_blank" rel="noopener noreferrer" className="sp-sbtn sp-tg">
                <span>✈</span><span>Telegram</span>
              </a>
              <a href="https://discord.com/invite/GjpMBK3kA6" target="_blank" rel="noopener noreferrer" className="sp-sbtn sp-dc">
                <span>💬</span><span>Discord</span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="sp-divider">
            <span className="sp-dot" />
            <span className="sp-line" />
            <span className="sp-dot" />
          </div>

          {/* Form */}
          <div className="sp-form">
            <label className="sp-label" htmlFor="steamUrl">🎮 URL DA STEAM:</label>
            <input
              id="steamUrl"
              className="sp-input"
              type="url"
              placeholder="https://store.steampowered.com/app/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && buscar()}
              disabled={loading}
            />
            <button className="sp-btn sp-btn-yellow" onClick={buscar} disabled={loading}>
              {loading ? (
                <span className="sp-dots">BUSCANDO<span>.</span><span>.</span><span>.</span></span>
              ) : '🔍 BUSCAR GAME'}
            </button>
          </div>

          {/* Game result */}
          {gameAtual?.imagem && (
            <div className="sp-game-card">
              <div className="sp-img-frame">
                <img src={gameAtual.imagem} alt={gameAtual.nome} />
                <div className="sp-img-overlay" />
              </div>
              <p className="sp-game-name">🏰 {gameAtual.nome}</p>
            </div>
          )}

          {gameAtual && !enviarBloqueado && (
            <button className="sp-btn sp-btn-green" onClick={enviar} disabled={loading}>
              {loading ? (
                <span className="sp-dots">ENVIANDO<span>.</span><span>.</span><span>.</span></span>
              ) : '⭐ ENVIAR SUGESTÃO'}
            </button>
          )}

          {/* Message */}
          {mensagem.texto && (
            <div className={`sp-msg sp-${mensagem.tipo}`}>
              {mensagem.texto}
            </div>
          )}

          {/* Footer */}
          <footer className="sp-footer">
            <div className="sp-pixels">
              {[...Array(8)].map((_, i) => <span key={i} className="sp-px" />)}
            </div>
            <p className="sp-footer-text">🎮 STEAM PROMO 2.0 🛡</p>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;