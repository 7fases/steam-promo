export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbxeeW7TlGvCrAsrGMVp7vnE8WQQMIPb8PjVuUjTjP3nyzud7Xco43kabu-1IuZu_Zr-uQ/exec",
      {
        method: "POST",
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ status: "erro", mensagem: "Erro proxy" });
  }
}