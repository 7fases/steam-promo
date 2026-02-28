export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxeeW7TlGvCrAsrGMVp7vnE8WQQMIPb8PjVuUjTjP3nyzud7Xco43kabu-1IuZu_Zr-uQ/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    return res.status(200).send(text);

  } catch (error) {
    return res.status(500).json({
      status: "erro",
      mensagem: "Erro proxy",
      detalhe: error.message
    });
  }
}