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

// ✅ SKELETON LOADER PARA IMAGEM
function SkeletonGameCard() {
  return (
    <div className={styles['sp-game-card']}>
      <div className={styles['sp-img-frame']}>
        <div className={styles['sp-skeleton-img']} />
        <div className={styles['sp-img-overlay']} />
        <div className={styles['sp-skeleton-text']} />
      </div>
    </div>
  );
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
  const [imageLoading, setImageLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [enviarBloqueado, setEnviarBloqueado] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [hasLoadedGames, setHasLoadedGames] = useState(false);
  const modalRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null); // ✅ NOVO: Ref para o canvas da pixel reveal

  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

  const mostrarMensagem = (texto, tipo = 'info', playSound = false) => {
    setMensagem({ texto, tipo });
    if (tipo === 'erro') new Audio(errorMp3).play();
    else if (playSound && tipo === 'sucesso') new Audio(entrouMp3).play();
  };

  const buscar = async () => {
    // ✅ Valida URL IMEDIATAMENTE
    if (!url.match(steamRegex)) {
      mostrarMensagem('⚠️ URL inválida! Insira uma URL da Steam.', 'erro');
      return;
    }
    
    // ✅ Mostra skeleton IMEDIATAMENTE ao clicar em buscar
    setGameAtual({ nome: '', imagem: '', id: '', tipo: '' });
    setImageLoading(true);
    
    mostrarMensagem('⏳ Buscando dados...', 'info');
    setLoading(true);
    setEnviarBloqueado(false);
    
    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'buscar', url }),
      });
      const res = await response.json();
      
      // ✅ Se for gratuito, mostra alerta amarelo e bloqueia
      if (res.status === 'gratuito') {
        setGameAtual(null);
        setImageLoading(false);
        mostrarMensagem(res.mensagem, 'aviso');
        setEnviarBloqueado(true);
        setUrl('');
        setLoading(false);
        return;
      }
      
      // ✅ Se der erro, para o skeleton e limpa tudo
      if (!response.ok || res.status !== 'ok') {
        setGameAtual(null);
        setImageLoading(false);
        throw new Error(res.mensagem || 'Erro ao buscar jogo');
      }
      
      res.url = url;
      setGameAtual(res);
      
      // ✅ Se tem imagem, continua com imageLoading=true para carregar
      // Se não tem imagem, desativa o loading
      if (res.imagem) {
        setImageLoading(true);
      } else {
        setImageLoading(false);
      }
      
      mostrarMensagem('✅ Jogo encontrado!', 'sucesso');
      setUrl('');
    } catch (error) {
      // ✅ Garante que para o skeleton em caso de erro
      setImageLoading(false);
      mostrarMensagem(`❌ ${error.message}`, 'erro');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Quando a imagem REALMENTE carrega - inicia a pixel reveal no canvas
  const handleImageLoad = () => {
    // Aguarda um pouco para transição suave do skeleton
    setTimeout(() => {
      setImageLoading(false);
      
      // ✅ Inicia a animação pixel reveal no canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const img = imgRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false; // ✅ Pixelated durante reveal (8-bit feel)

      const blockSize = 8; // ✅ Tamanho do "pixel block" pra estilo 8-bit
      const cols = Math.ceil(canvas.width / blockSize);
      const rows = Math.ceil(canvas.height / blockSize);

      // Cria array de blocos e shuffle pra reveal random
      const blocks = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          blocks.push({ x, y });
        }
      }
      blocks.sort(() => Math.random() - 0.5); // ✅ Random order pra "forming" orgânico

      let index = 0;
      const drawBlock = () => {
        // Desenha 10 blocos por frame pra performance (leve em mobile)
        for (let i = 0; i < 10; i++) {
          if (index >= blocks.length) {
            // ✅ Final: Desenha imagem full smooth
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return;
          }

          const { x, y } = blocks[index];
          const w = Math.min(blockSize, canvas.width - x * blockSize);
          const h = Math.min(blockSize, canvas.height - y * blockSize);

          ctx.drawImage(
            img,
            x * blockSize, y * blockSize, w, h,
            x * blockSize, y * blockSize, w, h
          );

          index++;
        }

        requestAnimationFrame(drawBlock); // ✅ Leve e smooth
      };

      drawBlock();
    }, 100);
  };

  // ✅ Quando a imagem falha em carregar, para o skeleton
  const handleImageError = () => {
    setImageLoading(false);
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
        setImageLoading(false);
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
        'https://cdn.jsdelivr.net/gh/7fases/steam-promo@main/games.json',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Arquivo não encontrado`);
      }

      const games = await response.json();

      if (!Array.isArray(games)) {
        throw new Error('Formato de dados inválido');
      }

      setGames(games);
      setHasLoadedGames(true);
    } catch (error) {
      console.error('❌ Erro ao carregar games:', error);
      mostrarMensagem(`❌ Erro ao carregar games: ${error.message}`, 'erro');
      setGames([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    setSearchTerm('');
    setModalLoading(true);

    await new Promise(resolve => setTimeout(resolve, 600));

    if (!hasLoadedGames) {
      await fetchGames();
    }

    setModalLoading(false);
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

        {/* ✅ MOSTRA SKELETON ENQUANTO imageLoading FOR TRUE COM TRANSIÇÃO */}
        {imageLoading && gameAtual ? (
          <div className={styles['sp-skeleton-wrapper']}>
            <SkeletonGameCard />
          </div>
        ) : null}

        {/* ✅ MOSTRA CANVAS COM PIXEL REVEAL QUANDO NÃO ESTÁ CARREGANDO */}
        {gameAtual?.imagem && !imageLoading && (
          <div className={styles['sp-game-card-wrapper']}>
            <div className={styles['sp-game-card']}>
              <div className={styles['sp-img-frame']}>
                {/* ✅ MELHORIA: Canvas com pixel reveal em vez de img simples */}
                <canvas
                  ref={canvasRef}
                  className={styles['sp-game-image']}
                />
                <div className={styles['sp-img-overlay']} />
                <p className={styles['sp-game-name']}>🎮 {gameAtual.nome}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ TAG INVISÍVEL PARA PRÉ-CARREGAR A IMAGEM */}
        {gameAtual?.imagem && imageLoading && (
          <img 
            ref={imgRef}
            src={gameAtual.imagem} 
            alt="preload"
            style={{ display: 'none' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
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