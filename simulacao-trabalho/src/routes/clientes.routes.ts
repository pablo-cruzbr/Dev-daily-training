// ============================================================
// ROTAS DE CLIENTES
// ============================================================

import express, { Request, Response, Router } from "express";
const router: Router = express.Router();
import { clientes, pedidos } from "../data/db";

// ------------------------------------------------------------
// GET /clientes
// TASK 3: adicionar busca por nome (?busca=metal) — case
// insensitive e parcial. "metal" deve achar "Metalúrgica" e
// "MetalFort".
// ------------------------------------------------------------
router.get("/", (req: Request, res: Response) => {
  res.json({ data: clientes });
});

// ------------------------------------------------------------
// GET /clientes/:id/pedidos
// TASK 7 (integração): listar todos os pedidos de um cliente,
// com o total gasto por ele no final.
// Esta rota está VAZIA — você vai construir do zero.
// ------------------------------------------------------------
router.get("/:id/pedidos", (req: Request, res: Response) => {
  // TODO: implementar
  res.status(501).json({ erro: "Não implementado ainda — TASK 7" });
});

export default router;
