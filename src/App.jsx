import React, { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';

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
  return <canvas ref={canvasRef} className={styles['sp-canvas']} />;
}

function cleanGameName(name) {
  // Remove padrões como "Save X% on "
  name = name.replace(/^Save \d+% on /i, '');
  // Remover emojis ou símbolos indesejados (ex: se começar com emoji, remover)
  name = name.replace(/^[^a-zA-Z0-9]+/, '');
  // Remover "Base " se seguido de "Game", mas manter versão/DLC
  name = name.replace(/Base Game/g, 'Game');
  return name.trim();
}

function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  // UX: hide enviar button when game already exists or on error until new search
  const [enviarBloqueado, setEnviarBloqueado] = useState(false);
  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;
  const mostrarMensagem = (texto, tipo = 'info', playSound = false) => {
    setMensagem({ texto, tipo });
    // Play sound based on type
    if (tipo === 'erro') {
      new Audio('/public/error.mp3').play();
    } else if (playSound && tipo === 'sucesso') {
      new Audio('/public/entrou.mp3').play();
    }
    setTimeout(() => setMensagem({ texto: '', tipo: '' }), (tipo === 'erro' || tipo === 'aviso') ? 8000 : 4000);
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
      res.nome = cleanGameName(res.nome);
      setGameAtual(res);
      mostrarMensagem('✅ Jogo encontrado!', 'sucesso');
      setUrl('');
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
        mostrarMensagem(res.mensagem, 'sucesso', true);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
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
  const handleVibrateClick = (action) => {
    if (navigator.vibrate) navigator.vibrate(50);
    action();
  };
  return (
    <div className={styles['sp-wrap']}>
      <Particles />
      <div className={styles['sp-scanlines']} />
      <div className={styles['sp-card']}>
        {/* Profile avatar - agora dentro do card */}
        <div className={styles['sp-avatar']}>
          <img
            src="https://7fases.github.io/youtube/imagens/Logo%20versao%202.0.webp"
            alt="7Fases"
          />
        </div>
        <span className={`${styles['sp-corner']} ${styles['sp-tl']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-tr']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-bl']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-br']}`} />
        {/* Header */}
        <header className={styles['sp-header']}>
          <span className={styles['sp-hicon']}>🎮</span>
          <div className={styles['sp-title-block']}>
            <h1 className={styles['sp-title']}>STEAM PROMO</h1>
            <p className={styles['sp-subtitle']}>⚔ Rastreador de Preços ⚔</p>
          </div>
          <span className={styles['sp-hicon']}>🛡</span>
        </header>
        {/* Divider */}
        <div className={styles['sp-divider']}>
          <span className={styles['sp-dot']} />
          <span className={styles['sp-line']} />
          <span className={styles['sp-dot']} />
        </div>
        {/* Social */}
        <div className={styles['sp-social-section']}>
          <p className={styles['sp-social-label']}>Acompanhe as promos pelo Discord e Telegram</p>
          <div className={styles['sp-social-btns']}>
            <a href="https://t.me/steampromocao" target="_blank" rel="noopener noreferrer" className={`${styles['sp-sbtn']} ${styles['sp-tg']}`}>
              <img src="/public/telegram.svg" alt="Telegram" width="20" height="20" />
              <span>Telegram</span>
            </a>
            <a href="https://discord.com/invite/GjpMBK3kA6" target="_blank" rel="noopener noreferrer" className={`${styles['sp-sbtn']} ${styles['sp-dc']}`}>
              <img src="/public/discord.svg" alt="Discord" width="20" height="20" />
              <span>Discord</span>
            </a>
          </div>
        </div>
        {/* Divider */}
        <div className={styles['sp-divider']}>
          <span className={styles['sp-dot']} />
          <span className={styles['sp-line']} />
          <span className={styles['sp-dot']} />
        </div>
        {/* Form */}
        <div className={styles['sp-form']}>
          <label className={styles['sp-label']} htmlFor="steamUrl">🎮 URL DA STEAM:</label>
          <div className={styles['sp-input-group']}>
            <input
              id="steamUrl"
              className={styles['sp-input']}
              type="url"
              placeholder="https://store.steampowered.com/app/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleVibrateClick(buscar)}
              disabled={loading}
            />
            <button 
              className={`${styles['sp-btn']} ${styles['sp-btn-yellow']} ${styles['sp-btn-square']}`} 
              onClick={() => handleVibrateClick(buscar)} 
              disabled={loading}
            >
              {loading ? (
                <span className={styles['sp-dots']}><span>.</span><span>.</span><span>.</span></span>
              ) : '🔍'}
            </button>
          </div>
        </div>
        {/* Game result */}
        {gameAtual?.imagem && (
          <div className={styles['sp-game-card']}>
            <div className={styles['sp-img-frame']}>
              <img src={gameAtual.imagem} alt={gameAtual.nome} />
              <div className={styles['sp-img-overlay']} />
              <p className={styles['sp-game-name']}>🎮 {gameAtual.nome}</p>
            </div>
          </div>
        )}
        {gameAtual && !enviarBloqueado && (
          <button 
            className={`${styles['sp-btn']} ${styles['sp-btn-green']}`} 
            onClick={() => handleVibrateClick(enviar)} 
            disabled={loading}
          >
            {loading ? (
              <span className={styles['sp-dots']}>ENVIANDO<span>.</span><span>.</span><span>.</span></span>
            ) : '⭐ ENVIAR SUGESTÃO'}
          </button>
        )}
        {/* Message */}
        {mensagem.texto && (
          <div className={`${styles['sp-msg']} ${styles[`sp-${mensagem.tipo}`]}`}>
            {mensagem.texto}
          </div>
        )}
        {/* Footer */}
        <footer className={styles['sp-footer']}>
          <div className={styles['sp-pixels']}>
            {[...Array(8)].map((_, i) => <span key={i} className={styles['sp-px']} />)}
          </div>
          <p className={styles['sp-footer-text']}>🎮 STEAM PROMO 2.0 🛡</p>
        </footer>
      </div>
    </div>
  );
}
export default App;