import { useState } from "react";
import styles from "./App.module.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [game, setGame] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [statusMsg, setStatusMsg] = useState("neutro");
  const [loading, setLoading] = useState(false);

  const steamRegex = /store\.steampowered\.com\/(app|sub|bundle|package)\/(\d+)/i;

  async function buscar() {
    if (!url.match(steamRegex)) {
      setMensagem("⚠️ URL inválida! Insira uma URL válida da Steam.");
      setStatusMsg("erro");
      return;
    }

    setLoading(true);
    setMensagem("⏳ Buscando dados...");
    setStatusMsg("aviso");

    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          acao: "buscar",
          url: url
        })
      });

      const data = await res.json();

      if (data.status !== "ok") {
        setMensagem("❌ " + data.mensagem);
        setStatusMsg("erro");
        setLoading(false);
        return;
      }

      setGame(data);
      setMensagem("✅ Game encontrado!");
      setStatusMsg("ok");
    } catch (err) {
      setMensagem("Erro ao conectar com servidor.");
      setStatusMsg("erro");
    }

    setLoading(false);
  }

  async function enviar() {
    if (!game) return;

    setMensagem("⏳ Enviando sugestão...");
    setStatusMsg("aviso");

    try {
      const res = await fetch("/api/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          acao: "salvar",
          nome: game.nome,
          url: url,
          id: game.id,
          tipo: game.tipo
        })
      });

      const data = await res.json();

      setMensagem(data.mensagem);

      if (data.status === "ok") {
        setStatusMsg("ok");
        setGame(null);
        setUrl("");
      } else {
        setStatusMsg("aviso");
      }
    } catch (err) {
      setMensagem("Erro ao enviar sugestão.");
      setStatusMsg("erro");
    }
  }

  return (
    <div className={styles.body}>
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

        <button onClick={buscar}>
          {loading ? "Buscando..." : "Buscar Game"}
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
            >
              Enviar Sugestão
            </button>
          </>
        )}

        {mensagem && (
          <div className={`${styles.msg} ${styles[statusMsg]}`}>
            {mensagem}
          </div>
        )}

        <div className={styles.footer}>
          🎮 STEAM PROMO v3.0 🚀
        </div>
      </div>
    </div>
  );
}