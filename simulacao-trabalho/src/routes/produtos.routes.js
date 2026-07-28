// ============================================================
// ROTAS DE PRODUTOS
// ============================================================

const express = require("express");
const router = express.Router();
const { produtos } = require("../data/db");

// ------------------------------------------------------------
// GET /produtos
// Lista produtos — pode filtrar por categoria (?categoria=vigas)
// 🐛 BUG PLANTADO #4: o filtro de categoria está com um erro
// sutil de comparação. Teste: /produtos?categoria=vigas
// deveria retornar 2 produtos, mas retorna 0. (TASK 8)
// ------------------------------------------------------------
router.get("/", (req, res) => {
  const { categoria } = req.query;

  let resultado = produtos;
  if (categoria) {
    resultado = produtos.filter((p) => p.categoria === categoria.trim().toUpperCase());
  }

  res.json({ data: resultado });
});

// ------------------------------------------------------------
// GET /produtos/estoque-baixo
// TASK 9: criar rota que lista produtos com estoque abaixo de
// um limite (?limiteKg=5000). Se não passar limite, usa 5000
// como padrão. Ordenar do menor estoque pro maior.
// ------------------------------------------------------------
// (rota ainda não existe — você vai criar)

module.exports = router;
