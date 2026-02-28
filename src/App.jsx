import React, { useState } from 'react';
import styles from './App.module.css';

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
      } else {
        throw new Error(res.mensagem || 'Erro ao enviar');
      }
    } catch (error) {
      mostrarMensagem(`❌ ${error.message}`, 'erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.card}>
        <h1>⚔️ STEAM PROMO ⚔️</h1>
        <p className={styles.subtitle}>Rastreador de Preços</p>
        <div className={styles.divider} />

        <label className={styles.label} htmlFor="url">
          🎮 URL DA STEAM:
        </label>
        <input
          type="text"
          id="url"
          className={styles.input}
          placeholder="Cole a URL da Steam aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={buscar}
          disabled={loading}
          className={styles.button}
          data-icon="🔍"
        >
          {loading ? 'BUSCANDO...' : 'BUSCAR GAME'}
        </button>

        {gameAtual?.imagem && (
          <div className={styles.imgFrame}>
            <img src={gameAtual.imagem} alt={`Capa de ${gameAtual.nome}`} />
          </div>
        )}

        {gameAtual && (
          <>
            <div className={styles.nomeGame}>🏰 {gameAtual.nome}</div>
            <button
              onClick={enviar}
              disabled={loading}
              className={`${styles.button} ${styles.buttonVerde}`}
              data-icon="📨"
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR SUGESTÃO'}
            </button>
          </>
        )}

        {mensagem.texto && (
          <div className={`${styles.msg} ${styles[`msg${mensagem.tipo}`]}`}>
            {mensagem.texto}
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.socialButtons}>
          <a
            href="https://t.me/steampromocao"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnTelegram}`}
            aria-label="Telegram (abre em nova aba)"
          >
            📱 Telegram
            <span className={styles.tooltip}>Entre no grupo do Telegram!</span>
          </a>
          <a
            href="https://discord.gg/GjpMBK3kA6"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnDiscord}`}
            aria-label="Discord (abre em nova aba)"
          >
            💬 Discord
            <span className={styles.tooltip}>Entre no servidor do Discord!</span>
          </a>
        </div>

        <footer className={styles.footer}>🎮 STEAM PROMO v2.0 🛡️</footer>
      </div>
    </div>
  );
}

export default App;