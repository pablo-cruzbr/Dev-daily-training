export interface Cliente {
  id: number;
  nome: string;
  cidade: string;
  uf: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  precoKg: number;
  estoqueKg: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  produtoId: number;
  quantidadeKg: number;
  valorTotal: number;
  status: string;
  criadoEm: string;
}
