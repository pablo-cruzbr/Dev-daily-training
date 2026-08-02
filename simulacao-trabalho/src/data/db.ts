// ============================================================
// "Banco de dados" em memória — simula as tabelas do ERP
// Em produção seria PostgreSQL; aqui é array pra focar na lógica
// ============================================================

import { Cliente, Produto, Pedido } from "../types";

const clientes: Cliente[] = [
  { id: 1, nome: "Metalúrgica São José", cidade: "Mogi das Cruzes", uf: "SP", ativo: true, criadoEm: "2024-03-10" },
  { id: 2, nome: "Construtora Horizonte", cidade: "Suzano", uf: "SP", ativo: true, criadoEm: "2024-05-22" },
  { id: 3, nome: "Serralheria Irmãos Lima", cidade: "Mogi das Cruzes", uf: "SP", ativo: false, criadoEm: "2023-11-01" },
  { id: 4, nome: "Indústria MetalFort", cidade: "Guarulhos", uf: "SP", ativo: true, criadoEm: "2024-08-15" },
  { id: 5, nome: "Aço & Arte Estruturas", cidade: "São Paulo", uf: "SP", ativo: true, criadoEm: "2025-01-07" },
  { id: 6, nome: "Galpões Brasil Ltda", cidade: "Itaquaquecetuba", uf: "SP", ativo: true, criadoEm: "2025-02-19" },
  { id: 7, nome: "Estruturas Pesadas MG", cidade: "Belo Horizonte", uf: "MG", ativo: true, criadoEm: "2024-09-30" },
  { id: 8, nome: "Telhados Premium", cidade: "Mogi das Cruzes", uf: "SP", ativo: false, criadoEm: "2023-06-12" },
];

const produtos: Produto[] = [
  { id: 1, nome: "Viga U 150x60", categoria: "vigas", precoKg: 8.5, estoqueKg: 12000 },
  { id: 2, nome: "Viga I 200x100", categoria: "vigas", precoKg: 9.2, estoqueKg: 8500 },
  { id: 3, nome: "Chapa Galvanizada 2mm", categoria: "chapas", precoKg: 11.0, estoqueKg: 5300 },
  { id: 4, nome: "Chapa Xadrez 3mm", categoria: "chapas", precoKg: 12.4, estoqueKg: 2100 },
  { id: 5, nome: "Tubo Quadrado 40x40", categoria: "tubos", precoKg: 10.1, estoqueKg: 7800 },
  { id: 6, nome: "Tubo Redondo 2\"", categoria: "tubos", precoKg: 9.8, estoqueKg: 4400 },
  { id: 7, nome: "Cantoneira 1.1/2", categoria: "perfis", precoKg: 8.9, estoqueKg: 6700 },
  { id: 8, nome: "Barra Chata 1/4", categoria: "perfis", precoKg: 8.2, estoqueKg: 9100 },
];

// 40 pedidos gerados — quantidade suficiente pra paginação fazer sentido
const pedidos: Pedido[] = [];
const statusList = ["pendente", "aprovado", "em_producao", "entregue", "cancelado"];
let pid = 1;
for (let mes = 1; mes <= 5; mes++) {
  for (let i = 0; i < 8; i++) {
    const clienteId = (pid % 8) + 1;
    const produtoId = ((pid * 3) % 8) + 1;
    const quantidadeKg = 100 + ((pid * 137) % 2000);
    const produto = produtos.find((p) => p.id === produtoId)!;
    pedidos.push({
      id: pid,
      clienteId,
      produtoId,
      quantidadeKg,
      valorTotal: Number((quantidadeKg * produto.precoKg).toFixed(2)),
      status: statusList[pid % 5],
      criadoEm: `2025-0${mes}-${String((pid % 27) + 1).padStart(2, "0")}`,
    });
    pid++;
  }
}

export { clientes, produtos, pedidos };
