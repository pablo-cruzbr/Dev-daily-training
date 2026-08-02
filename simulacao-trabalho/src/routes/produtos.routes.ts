// ============================================================
// ROTAS DE PRODUTOS
// ============================================================

import express, { Request, Response, Router } from "express";
const router: Router = express.Router();
import { produtos } from "../data/db";

// ------------------------------------------------------------
// GET /produtos
// Lista produtos — pode filtrar por categoria (?categoria=vigas)
// 🐛 BUG PLANTADO #4: o filtro de categoria está com um erro
// sutil de comparação. Teste: /produtos?categoria=vigas
// deveria retornar 2 produtos, mas retorna 0. (TASK 8)
// ------------------------------------------------------------
router.get("/", (req: Request, res: Response) => {
  const { categoria } = req.query;

  let resultado = produtos;
  if (categoria) {
    resultado = produtos.filter((p) => p.categoria === String(categoria).trim().toUpperCase());
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

export default router;
