function App() {
  return (
    <div style={{ 
      backgroundColor: "#0f1923",
      color: "white",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1>🔥 Steam Promo</h1>
      <p>As melhores promoções da Steam em um só lugar.</p>
      <button style={{
        padding: "10px 20px",
        backgroundColor: "#66c0f4",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}>
        Ver Promoções
      </button>
    </div>
  )
}

export default App