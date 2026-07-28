// ============================================================
// ROTAS DE PEDIDOS
// ⚠️ ATENÇÃO: este arquivo contém BUGS PLANTADOS DE PROPÓSITO
// Eles fazem parte das tasks — veja TASKS.md
// ============================================================

const express = require("express");
const router = express.Router();
const { pedidos, clientes, produtos } = require("../data/db");

// ------------------------------------------------------------
// GET /pedidos
// Lista todos os pedidos
// TASK 1: adicionar paginação aqui (?page=1&limit=10)
// TASK 2: adicionar filtro por status (?status=aprovado)
// ------------------------------------------------------------
router.get("/", (req, res) => {
  res.json({ data: pedidos });
});

// ------------------------------------------------------------
// GET /pedidos/relatorio
// Relatório de total vendido por status
// 🐛 BUG PLANTADO #1: o valor de "cancelado" está entrando na
// soma do faturamento. Pedido cancelado NÃO deveria contar.
// (TASK 4)
// ------------------------------------------------------------
router.get("/relatorio", (req, res) => {
  let faturamentoTotal = 0;
  const porStatus = {};

  for (const pedido of pedidos) {
    faturamentoTotal += pedido.valorTotal;
    porStatus[pedido.status] = (porStatus[pedido.status] || 0) + pedido.valorTotal;
  }

  res.json({
    faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
    porStatus,
  });
});

// ------------------------------------------------------------
// GET /pedidos/:id
// Busca um pedido específico com dados do cliente e produto
// 🐛 BUG PLANTADO #2: se o ID não existir, o servidor QUEBRA
// com erro 500 em vez de retornar 404. Teste: /pedidos/999
// (TASK 5)
// ------------------------------------------------------------
router.get("/:id", (req, res) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));

  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const produto = produtos.find((p) => p.id === pedido.produtoId);

  res.json({
    ...pedido,
    cliente: cliente.nome,
    produto: produto.nome,
  });
});

// ------------------------------------------------------------
// POST /pedidos
// Cria um novo pedido
// 🐛 BUG PLANTADO #3: não valida NADA. Aceita pedido sem
// clienteId, sem produtoId, com quantidade negativa...
// (TASK 6)
// ------------------------------------------------------------
router.post("/", (req, res) => {
  const { clienteId, produtoId, quantidadeKg } = req.body;

  const produto = produtos.find((p) => p.id === produtoId);
  const novoPedido = {
    id: pedidos.length + 1,
    clienteId,
    produtoId,
    quantidadeKg,
    valorTotal: quantidadeKg * (produto ? produto.precoKg : 0),
    status: "pendente",
    criadoEm: new Date().toISOString().split("T")[0],
  };

  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});

module.exports = router;
