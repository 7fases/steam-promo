import React, { useState } from 'react';
import styles from './App.module.css';

const PARTICLES = ['⚔️', '🛡️', '💎', '⭐', '🗡️', '✨', '🔮', '🏰', '👾', '🎮', '💫', '🌟'];

function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [envioFalhou, setEnvioFalhou] = useState(false);

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
    setEnvioFalhou(false);

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
        setEnvioFalhou(true);
        setGameAtual(null);
      } else {
        throw new Error(res.mensagem || 'Erro ao enviar');
      }
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
      setEnvioFalhou(true);
      setGameAtual(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.stars} />
      <div className={styles.scanlines} />
      {PARTICLES.map((p, i) => (
        <span key={i} className={styles.particle}>{p}</span>
      ))}

      <div className={styles.card}>
        <span className={styles.cornerBl} />
        <span className={styles.cornerBr} />

        <div className={styles.header}>
          <h1 className={styles.title}>⚔️ STEAM PROMO ⚔️</h1>
          <p className={styles.subtitle}>Rastreador de Preços</p>
          <img
            className={styles.avatar}
            src="https://7fases.github.io/youtube/imagens/Logo%20versao%202.0.webp"
            alt="Perfil Steam Promo"
            loading="lazy"
          />
        </div>

        <hr className={styles.divider} />

        <label className={styles.label}>🎮 URL DA STEAM:</label>
        <input
          className={styles.input}
          type="url"
          placeholder="https://store.steampowered.com/app/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        <button
          className={styles.button}
          onClick={buscar}
          disabled={loading}
        >
          {loading ? '⏳ BUSCANDO...' : '🔍 BUSCAR GAME'}
        </button>

        {gameAtual?.imagem && (
          <div className={styles.imgFrame}>
            <img src={gameAtual.imagem} alt={gameAtual.nome} />
          </div>
        )}

        {gameAtual && !envioFalhou && (
          <>
            <p className={styles.nomeGame}>🏰 {gameAtual.nome}</p>
            <button
              className={`${styles.button} ${styles.buttonVerde}`}
              onClick={enviar}
              disabled={loading}
            >
              {loading ? '⏳ ENVIANDO...' : '📩 ENVIAR SUGESTÃO'}
            </button>
          </>
        )}

        {mensagem.texto && (
          <div className={`${styles.msg} ${styles['msg' + mensagem.tipo]}`}>
            {mensagem.texto}
          </div>
        )}

        <hr className={styles.divider} />

        <p className={styles.socialHeading}>
          📢 Acompanhe as promos pelo Discord e Telegram
        </p>

        <div className={styles.socialButtons}>
          <a
            href="https://t.me/steampromo"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnTelegram}`}
          >
            <span className={styles.tooltip}>Entre no grupo do Telegram!</span>
            <span className={styles.socialBtnIcon}>📱</span>
            Telegram
            <span className={styles.socialBtnLabel}>Grupo de ofertas</span>
          </a>
          <a
            href="https://discord.gg/steampromo"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnDiscord}`}
          >
            <span className={styles.tooltip}>Entre no servidor do Discord!</span>
            <span className={styles.socialBtnIcon}>💬</span>
            Discord
            <span className={styles.socialBtnLabel}>Servidor da comunidade</span>
          </a>
        </div>

        <p className={styles.footer}>🎮 STEAM PROMO v2.0 🛡️</p>
      </div>
    </div>
  );
}

export default App;
