// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';
import telegramIcon from './assets/telegram.svg';
import discordIcon from './assets/discord.svg';
import errorMp3 from './assets/error.mp3';
import entrouMp3 from './assets/entrou.mp3';
import { SkeletonGamesList } from './SkeletonLoader';
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
  name = name.replace(/^Save \d+% on /i, '');
  name = name.replace(/^[^a-zA-Z0-9]+/, '');
  name = name.replace(/[\u2122\u00AE\u00A9\u2120]+/g, '');
  name = name.replace(/Base Game/g, 'Game');
  return name.trim();
}
function MessageBubble({ mensagem, onExiting }) {
  const [isExiting, setIsExiting] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onExiting();
      }, 300);
    }, 14000);
    return () => clearTimeout(timer);
  }, [onExiting]);
  return (
    <div className={`${styles['sp-msg-bubble']} ${styles[`sp-bubble-${mensagem.tipo}`]} ${isExiting ? styles['sp-bubble-exit'] : ''}`}>
      <div className={styles['sp-bubble-inner']}>
        <div className={styles['sp-bubble-corners']}>
          <span className={styles['sp-bc']} />
          <span className={styles['sp-bc']} />
          <span className={styles['sp-bc']} />
          <span className={styles['sp-bc']} />
        </div>
        <p className={styles['sp-bubble-text']}>{mensagem.texto}</p>
      </div>
      <div className={styles['sp-bubble-pointer']} />
    </div>
  );
}
function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [enviarBloqueado, setEnviarBloqueado] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const modalRef = useRef(null);
 
  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;
  const mostrarMensagem = (texto, tipo = 'info', playSound = false) => {
    setMensagem({ texto, tipo });
    if (tipo === 'erro') new Audio(errorMp3).play();
    else if (playSound && tipo === 'sucesso') new Audio(entrouMp3).play();
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
      res.url = url;
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
          url: gameAtual.url,
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
        setEnviarBloqueado(true);
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
 const fetchGames = async () => {
  setModalLoading(true);
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/7fases/steam-promo/main/games.json',
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      }
    );
   
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Arquivo não encontrado`);
    }
   
    const text = await response.text();
    const games = JSON.parse(text);
   
    if (!Array.isArray(games)) {
      throw new Error('Formato de dados inválido');
    }
   
    setGames(games);
  } catch (error) {
    console.error('❌ Erro ao carregar games:', error);
    mostrarMensagem(`Erro ao carregar games: ${error.message}`, 'erro');
    setGames([]);
  } finally {
    setModalLoading(false);
  }
};
  const openModal = async () => {
    if (games.length === 0) {
      await fetchGames();
    }
    setIsModalOpen(true);
    setSearchTerm('');
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  const filteredGames = games.filter(game =>
    game.nome && game.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleVibrateClick = (action) => {
    if (navigator.vibrate) navigator.vibrate(50);
    action();
  };
  return (
    <div className={styles['sp-wrap']}>
      <Particles />
      <div className={styles['sp-scanlines']} />
      <div className={styles['sp-card']}>
        <div className={styles['sp-avatar']}>
          <img
            src="Logo2.1.webp"
            alt="7Fases"
          />
        </div>
        <span className={`${styles['sp-corner']} ${styles['sp-tl']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-tr']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-bl']}`} />
        <span className={`${styles['sp-corner']} ${styles['sp-br']}`} />
        <header className={styles['sp-header']}>
          <span className={styles['sp-hicon']}>🎮</span>
          <div className={styles['sp-title-block']}>
            <h1 className={styles['sp-title']}>STEAM PROMO</h1>
            <p className={styles['sp-subtitle']}>⚔ Rastreador de Preços ⚔</p>
          </div>
          <span className={styles['sp-hicon']}>🛡</span>
        </header>
        <div className={styles['sp-divider']}>
          <span className={styles['sp-dot']} />
          <span className={styles['sp-line']} />
          <span className={styles['sp-dot']} />
        </div>
        <div className={styles['sp-social-section']}>
          <p className={styles['sp-social-label']}>Acompanhe as promos pelo Discord e Telegram</p>
          <div className={styles['sp-social-btns']}>
            <a href="https://t.me/steampromocao" target="_blank" rel="noopener noreferrer" className={`${styles['sp-sbtn']} ${styles['sp-tg']}`}>
              <img src={telegramIcon} alt="Telegram" width="20" height="20" />
              <span>Telegram</span>
            </a>
            <a href="https://discord.com/invite/GjpMBK3kA6" target="_blank" rel="noopener noreferrer" className={`${styles['sp-sbtn']} ${styles['sp-dc']}`}>
              <img src={discordIcon} alt="Discord" width="20" height="20" />
              <span>Discord</span>
            </a>
          </div>
        </div>
        <div className={styles['sp-divider']}>
          <span className={styles['sp-dot']} />
          <span className={styles['sp-line']} />
          <span className={styles['sp-dot']} />
        </div>
        <div className={styles['sp-form-wrapper']}>
          {mensagem.texto && (
            <MessageBubble
              mensagem={mensagem}
              onExiting={() => setMensagem({ texto: '', tipo: '' })}
            />
          )}
          <div className={styles['sp-form']}>
            <label className={`${styles['sp-label']} ${mensagem.texto ? styles['sp-label-hidden'] : ''}`} htmlFor="steamUrl">🎮 ADICIONE UM GAME A LISTA! URL DA STEAM:</label>
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
                {loading ? <span className={styles['sp-dots']}><span>.</span><span>.</span><span>.</span></span> : '🔍'}
              </button>
            </div>
          </div>
        </div>
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
            {loading ? <span className={styles['sp-dots']}>ENVIANDO<span>.</span><span>.</span><span>.</span></span> : '⭐ ENVIAR SUGESTÃO'}
          </button>
        )}
        <footer className={styles['sp-footer']}>
          <div className={styles['sp-pixels']}>
            {[...Array(8)].map((_, i) => <span key={i} className={styles['sp-px']} />)}
          </div>
          <p className={styles['sp-footer-text']}>🎮 STEAM PROMO 2.0 🛡</p>
         
          <button
            className={styles['sp-btn-float-games-mobile']}
            onClick={() => handleVibrateClick(openModal)}
          >
            Games Cadastrados
          </button>
        </footer>
       
        <div className={styles['sp-pixels-desktop']}>
          {[...Array(8)].map((_, i) => <span key={i} className={styles['sp-px']} />)}
        </div>
        <button
          className={styles['sp-btn-float-games-desktop']}
          onClick={() => handleVibrateClick(openModal)}
        >
          Games Cadastrados
        </button>
      </div>
      {isModalOpen && (
        <div className={styles['sp-modal-overlay']} onClick={handleModalOverlayClick}>
          <div className={styles['sp-modal']} ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <span className={`${styles['sp-modal-corner']} ${styles['sp-modal-tl']}`} />
            <span className={`${styles['sp-modal-corner']} ${styles['sp-modal-tr']}`} />
            <span className={`${styles['sp-modal-corner']} ${styles['sp-modal-bl']}`} />
            <span className={`${styles['sp-modal-corner']} ${styles['sp-modal-br']}`} />
           
            <button className={styles['sp-modal-close']} onClick={closeModal}>✕</button>
            <h2 className={styles['sp-modal-title']}>Games Cadastrados</h2>
            <input
              className={styles['sp-modal-search']}
              type="text"
              placeholder="Buscar game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
<div className={styles['sp-modal-content']}>
  {modalLoading ? (
    <SkeletonGamesList />
  ) : (
    <ul className={styles['sp-modal-list']}>
      {filteredGames.length > 0 ? (
        filteredGames.map((game, index) => (
          <li key={index}>
            <a href={game.url} target="_blank" rel="noopener noreferrer">
              <img src={game.imagem} alt={game.nome} className={styles['sp-game-img']} />
              {game.nome}
            </a>
          </li>
        ))
      ) : (
        <li>Nenhum game encontrado.</li>
      )}
    </ul>
  )}
</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;