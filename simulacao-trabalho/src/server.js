// ============================================================
// SIMULAÇÃO DE TRABALHO — Backend estilo ERP (Aços Vital)
// Pablo Cruz — Treino pré-01/08
// ============================================================
// Para rodar:  node src/server.js
// Testa em:    http://localhost:3000
// ============================================================

const express = require("express");
const pedidosRoutes = require("./routes/pedidos.routes");
const clientesRoutes = require("./routes/clientes.routes");
const produtosRoutes = require("./routes/produtos.routes");

const app = express();
app.use(express.json());

// Rota de saúde — sempre bom ter num sistema real
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/pedidos", pedidosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/produtos", produtosRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ERP-Simulação rodando em http://localhost:${PORT}`);
  console.log(`📋 Veja o arquivo TASKS.md para começar as tarefas!`);
});
