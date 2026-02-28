import React, { useState, useEffect } from 'react';
import styles from './App.module.css';

// Componente para gerar os fragmentos voando no fundo
const BackgroundParticles = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    const p = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));
    setParticles(p);
  }, []);

  return (
    <div className={styles.particleContainer}>
      {particles.map(p => (
        <div 
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' }); // tipo: 'info', 'sucesso', 'erro', 'aviso'
  const [loading, setLoading] = useState(false);

  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

  const mostrarMensagem = (texto, tipo = 'info') => {
    setMensagem({ texto, tipo });
    // Remove a mensagem após 4 segundos, exceto erros que ficam até nova ação
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

    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'buscar', url }),
      });

      const res = await response.json();

      if (!response.ok || res.status !== 'ok') {
        throw new Error(res.mensagem || 'Erro ao buscar jogo');
      }

      setGameAtual(res);
      mostrarMensagem('✅ Jogo encontrado!', 'sucesso');
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
      setGameAtual(null); // UX: Hide button on search error
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
      } else if (res.status === 'existe') {
        mostrarMensagem(res.mensagem, 'aviso');
        setGameAtual(null); // UX: Hide send button if it already exists
      } else {
        throw new Error(res.mensagem || 'Erro ao enviar');
      }
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
      setGameAtual(null); // UX: Hide send button on send error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.appWrapper}>
      <BackgroundParticles />
      <div className={styles.scanlines} />
      
      <main className={styles.mainContainer}>
        {/* Imagem de Perfil (Centralizada agora) */}
        <div className={styles.profileBadge}>
          <img 
            src="https://7fases.github.io/youtube/imagens/Logo%20versao%202.0.webp" 
            alt="Profile" 
            className={styles.profileImg}
          />
        </div>

        <header className={styles.header}>
          <h1 className={styles.mainTitle}>⚔️ STEAM PROMO ⚔️</h1>
          <h2 className={styles.subTitle}>Rastreador de Preços</h2>
        </header>

        <section className={styles.gameCard}>
          <div className={styles.cardInner}>
            <div className={styles.cornerTl} />
            <div className={styles.cornerTr} />
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>🎮 URL DA STEAM:</label>
              <input
                className={styles.pixelInput}
                type="text"
                placeholder="Cole o link do jogo aqui..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <button 
                className={`${styles.pixelButton} ${styles.primaryBtn}`}
                onClick={buscar}
                disabled={loading}
              >
                {loading ? 'BUSCANDO...' : 'BUSCAR GAME'}
              </button>
            </div>

            {gameAtual && (
              <div className={styles.resultArea}>
                <div className={styles.imageFrame}>
                  <img src={gameAtual.imagem} alt={gameAtual.nome} className={styles.gameThumb} />
                </div>
                <h3 className={styles.gameTitle}>🏰 {gameAtual.nome}</h3>
                <button 
                  className={`${styles.pixelButton} ${styles.successBtn}`}
                  onClick={enviar}
                  disabled={loading}
                >
                  {loading ? 'ENVIANDO...' : 'ENVIAR SUGESTÃO'}
                </button>
              </div>
            )}

            {mensagem.texto && (
              <div className={`${styles.statusMsg} ${styles[`msg${mensagem.tipo}`]}`}>
                {mensagem.texto}
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.socialSection}>
              <p className={styles.socialText}>Acompanhe as promos pelo Discord e Telegram</p>
              <div className={styles.socialGrid}>
                <a href="https://t.me/seulink" target="_blank" rel="noreferrer" className={styles.socialItem}>
                  <div className={`${styles.socialIcon}`}>📱</div>
                  <span>Telegram</span>
                </a>
                <a href="https://discord.gg/seulink" target="_blank" rel="noreferrer" className={styles.socialItem}>
                  <div className={`${styles.socialIcon}`}>💬</div>
                  <span>Discord</span>
                </a>
              </div>
            </div>

            <div className={styles.cornerBl} />
            <div className={styles.cornerBr} />
          </div>
        </section>

        <footer className={styles.footer}>
          <p>🎮 STEAM PROMO v2.0 🛡️</p>
        </footer>
      </main>
    </div>
  );
}

export default App;