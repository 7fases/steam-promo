import { useState } from "react";
import styles from "./App.module.css";

const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

export default function App() {
  const [url, setUrl] = useState("");
  const [game, setGame] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function limparTela() {
    setGame(null);
    setUrl("");
  }

  function mostrarMensagem(texto, tipo, autoClear = false) {
    setMensagem(texto);
    setTipoMsg(tipo);

    if (autoClear) {
      setTimeout(() => {
        setMensagem("");
      }, 2500);
    }
  }

  async function buscar() {
    if (!url.match(steamRegex)) {
      mostrarMensagem("⚠️ URL inválida! Insira uma URL válida da Steam.", "erro");
      return;
    }

    setLoading(true);
    mostrarMensagem("⏳ Buscando dados...", "aviso");

    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          acao: "buscar",
          url
        })
      });

      const data = await res.json();

      if (data.status !== "ok") {
        mostrarMensagem("❌ " + data.mensagem, "erro");
        setLoading(false);
        return;
      }

      setGame(data);
      mostrarMensagem("✅ Game encontrado!", "ok", true);
    } catch (e) {
      mostrarMensagem("Erro ao conectar com servidor.", "erro");
    }

    setLoading(false);
  }

  async function enviar() {
    if (!game) return;

    setLoading(true);
    mostrarMensagem("⏳ Enviando sugestão...", "aviso");

    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          acao: "salvar",
          nome: game.nome,
          url,
          id: game.id,
          tipo: game.tipo
        })
      });

      const data = await res.json();

      if (data.status === "ok") {
        mostrarMensagem(data.mensagem, "ok");
        limparTela();
      } else if (data.status === "existe") {
        mostrarMensagem(data.mensagem, "aviso");
      } else {
        mostrarMensagem(data.mensagem, "erro");
      }
    } catch (e) {
      mostrarMensagem("Erro ao enviar sugestão.", "erro");
    }

    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1>⚔️ STEAM PROMO ⚔️</h1>
        <p className={styles.subtitle}>Rastreador de Preços</p>

        <label className={styles.label}>🎮 URL DA STEAM:</label>

        <input
          type="text"
          placeholder="Cole a URL da Steam aqui..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={buscar} disabled={loading}>
          {loading ? "Processando..." : "Buscar Game"}
        </button>

        {game && (
          <>
            {game.imagem && (
              <div className={styles.imgFrame}>
                <img src={game.imagem} alt="Capa do Game" />
              </div>
            )}

            <div className={styles.nomeGame}>🏰 {game.nome}</div>

            <button
              className={styles.btnEnviar}
              onClick={enviar}
              disabled={loading}
            >
              Enviar Sugestão
            </button>
          </>
        )}

        {mensagem && (
          <div className={`${styles.msg} ${styles[tipoMsg]}`}>
            {mensagem}
          </div>
        )}

        <div className={styles.footer}>
          🎮 STEAM PROMO v3.5 🛡️
        </div>
      </div>
    </div>
  );
}