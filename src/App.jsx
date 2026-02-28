import React, { useState } from 'react';
import styles from './App.module.css';

function App() {
  const [url, setUrl] = useState('');
  const [gameAtual, setGameAtual] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

  const buscar = async () => {
    if (!url.match(steamRegex)) {
      setMensagem('⚠️ URL inválida! Insira uma URL válida da Steam.');
      return;
    }
    setMensagem('⏳ Buscando dados...');
    setLoading(true);

    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'buscar',
          url: url,
        }),
      });

      const res = await response.json();

      if (res.status !== 'ok') {
        setMensagem(`❌ ${res.mensagem}`);
        setLoading(false);
        return;
      }

      setGameAtual(res);
      setMensagem('✅ Game encontrado!');
      setTimeout(() => setMensagem(''), 2000);
      setLoading(false);
    } catch (error) {
      setMensagem('❌ Erro ao buscar dados.');
      setLoading(false);
    }
  };

  const enviar = async () => {
    if (!gameAtual) return;

    setMensagem('⏳ Enviando sugestão...');
    setLoading(true);

    try {
      const response = await fetch('https://steam-promo.vercel.app/api/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acao: 'salvar',
          nome: gameAtual.nome,
          url: url,
          id: gameAtual.id,
          tipo: gameAtual.tipo,
        }),
      });

      const res = await response.json();

      setMensagem(res.mensagem);

      if (res.status === 'ok') {
        setGameAtual(null);
        setUrl('');
      }

      setLoading(false);
    } catch (error) {
      setMensagem('❌ Erro ao enviar sugestão.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.card}>
        <div className={styles.cornerBl}></div>
        <div className={styles.cornerBr}></div>
        <h1>⚔️ STEAM PROMO ⚔️</h1>
        <p className={styles.subtitle}>Rastreador de Preços</p>
        <div className={styles.divider}></div>
        <label className={styles.fieldLabel}>🎮 URL DA STEAM:</label>
        <input
          type="text"
          id="url"
          placeholder="Cole a URL da Steam aqui..."
          title="Digite aqui a URL exata da versão desejada do game na Steam"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={styles.input}
        />
        <button onClick={buscar} disabled={loading} className={styles.button}>
          Buscar Game
        </button>
        {gameAtual && gameAtual.imagem && (
          <div className={styles.imgFrame}>
            <img src={gameAtual.imagem} alt="Capa do Game" />
          </div>
        )}
        {gameAtual && <div className={styles.nomeGame}>🏰 {gameAtual.nome}</div>}
        {gameAtual && (
          <button onClick={enviar} disabled={loading} className={styles.btnEnviar}>
            Enviar Sugestão
          </button>
        )}
        {mensagem && <div className={styles.msg}>{mensagem}</div>}
        <div className={styles.divider}></div>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span>HP</span>
            <div className={styles.bar}>
              <div className={styles.barFillHp}></div>
            </div>
          </div>
          <div className={styles.stat}>
            <span>MP</span>
            <div className={styles.bar}>
              <div className={styles.barFillMp}></div>
            </div>
          </div>
        </div>
        <div className={styles.socialButtons}>
          <a
            href="https://t.me/steampromocao"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnTelegram}`}
          >
            📱 Telegram
            <span className={styles.tooltip}>Entre no grupo do Telegram!</span>
          </a>
          <a
            href="https://discord.gg/GjpMBK3kA6"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.socialBtn} ${styles.socialBtnDiscord}`}
          >
            💬 Discord
            <span className={styles.tooltip}>Entre no grupo do Discord!</span>
          </a>
        </div>
        <div className={styles.footer}>🎮 STEAM PROMO v2.0 🛡️</div>
      </div>
    </div>
  );
}

export default App;