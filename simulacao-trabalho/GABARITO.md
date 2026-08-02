# 🔑 GABARITO — Soluções das 10 Tasks
## ⚠️ REGRA DE OURO: só abre este arquivo DEPOIS de tentar por pelo menos 1 hora

> No trabalho real não existe gabarito. Existe tentar, pesquisar, e aí sim
> perguntar. Usa este arquivo como o "colega sênior" que você consulta
> depois de tentar — não como atalho.
>
> **Como usar:** cada solução tem o código + a explicação do PORQUÊ.
> Depois de ler, apaga sua versão e refaz sem olhar. Se sair, você aprendeu.

---

## TASK 1 — Paginação

```typescript
router.get("/", (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const data = pedidos.slice(skip, skip + limit);

  res.json({
    data,
    total: pedidos.length,
    page,
    totalPages: Math.ceil(pedidos.length / limit),
  });
});
```

**Por que funciona:**
- `Number(...) || 1` converte o texto da query pra número E define padrão se vier vazio ou inválido (NaN é falsy)
- `skip = (page - 1) * limit`: página 1 pula 0, página 2 pula 10, página 3 pula 20
- `slice(skip, skip + limit)` corta o pedaço certo do array — e se passar do fim, retorna `[]` sozinho, sem quebrar (por isso `page=99` já funciona de graça)
- `Math.ceil` arredonda pra cima: 40 pedidos ÷ 10 = 4 páginas; 41 ÷ 10 = 4.1 → 5 páginas

---

## TASK 2 — Filtro por status (combinado com paginação)

```typescript
router.get("/", (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { status } = req.query;

  // 1º FILTRA
  let resultado = pedidos;
  if (status) {
    resultado = pedidos.filter((p) => p.status === status);
  }

  // 2º PAGINA (sobre o resultado filtrado!)
  const skip = (page - 1) * limit;
  const data = resultado.slice(skip, skip + limit);

  res.json({
    data,
    total: resultado.length,          // total do FILTRADO
    page,
    totalPages: Math.ceil(resultado.length / limit),
  });
});
```

**A pegadinha explicada:** se você paginar primeiro e filtrar depois,
a página 1 pode vir com 3 itens em vez de 10 (você filtrou só o pedaço
que tinha cortado). A ordem certa é sempre: **filtrar → contar → paginar**.
Repare também que `total` usa `resultado.length`, não `pedidos.length` —
o frontend precisa saber quantas páginas o resultado FILTRADO tem.

---

## TASK 3 — Busca de clientes por nome

```typescript
router.get("/", (req: Request, res: Response) => {
  const { busca } = req.query;

  let resultado = clientes;
  if (busca) {
    resultado = clientes.filter((c) =>
      c.nome.toLowerCase().includes(String(busca).toLowerCase())
    );
  }

  res.json({ data: resultado });
});
```

**Por que funciona:** jogando os DOIS lados pra minúsculo, "METAL",
"metal" e "Metal" viram a mesma coisa. `includes` acha o pedaço em
qualquer posição do nome — busca parcial de graça.

---

## TASK 4 — 🐛 Bug do faturamento (cancelados somando)

**A causa:** o loop soma TODOS os pedidos, sem verificar status.

```typescript
router.get("/relatorio", (req: Request, res: Response) => {
  let faturamentoTotal = 0;
  const porStatus: Record<string, number> = {};

  for (const pedido of pedidos) {
    // continua registrando todos por status (isso está certo — 
    // o gestor QUER ver quanto foi cancelado)
    porStatus[pedido.status] = (porStatus[pedido.status] || 0) + pedido.valorTotal;

    // mas o faturamento só soma o que NÃO é cancelado
    if (pedido.status !== "cancelado") {
      faturamentoTotal += pedido.valorTotal;
    }
  }

  res.json({
    faturamentoTotal: Number(faturamentoTotal.toFixed(2)),
    porStatus,
  });
});
```

**Como você deveria ter achado:** o `porStatus` da resposta original JÁ
entregava o jogo — mostrava `cancelado: 101423.79` e o total batia com a
soma de TUDO. Comparar o total com a soma das partes é o jeito clássico
de achar esse tipo de bug.

**Bônus (o 79145.40000000001):** viu números quebrados no JSON? É o
problema de ponto flutuante do JavaScript. Em sistema financeiro real
se resolve trabalhando em CENTAVOS (inteiros) ou com libs tipo
`decimal.js`. Guarda essa — impressiona em entrevista.

---

## TASK 5 — 🐛 Bug do 404 (servidor quebra com id inexistente)

**A causa:** `find` retorna `undefined` quando não acha. A linha seguinte
tenta ler `pedido.clienteId` de `undefined` → TypeError → erro 500.

```typescript
router.get("/:id", (req: Request, res: Response) => {
  const pedido = pedidos.find((p) => p.id === Number(req.params.id));

  // A GUARDA — sempre pergunte "e se não encontrar?"
  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const produto = produtos.find((p) => p.id === pedido.produtoId);

  res.json({
    ...pedido,
    cliente: cliente ? cliente.nome : "Cliente não encontrado",
    produto: produto ? produto.nome : "Produto não encontrado",
  });
});
```

**A lição que vale carreira:** todo `find`, toda busca no banco, toda
chamada externa pode voltar vazia. O `return` no `if` é essencial —
sem ele, o código continua executando e quebra do mesmo jeito.
Esse padrão (`early return` / guard clause) é o que separa código de
junior descuidado de código de junior confiável.

---

## TASK 6 — 🐛 Validação na criação de pedido

```typescript
router.post("/", (req: Request, res: Response) => {
  const { clienteId, produtoId, quantidadeKg } = req.body;

  // Validação campo a campo, com mensagem específica
  if (!clienteId) {
    return res.status(400).json({ erro: "clienteId é obrigatório" });
  }
  const cliente = clientes.find((c) => c.id === clienteId);
  if (!cliente) {
    return res.status(400).json({ erro: `Cliente ${clienteId} não existe` });
  }

  if (!produtoId) {
    return res.status(400).json({ erro: "produtoId é obrigatório" });
  }
  const produto = produtos.find((p) => p.id === produtoId);
  if (!produto) {
    return res.status(400).json({ erro: `Produto ${produtoId} não existe` });
  }

  if (quantidadeKg === undefined || quantidadeKg === null) {
    return res.status(400).json({ erro: "quantidadeKg é obrigatória" });
  }
  if (typeof quantidadeKg !== "number" || quantidadeKg <= 0) {
    return res.status(400).json({ erro: "quantidadeKg deve ser um número maior que zero" });
  }

  const novoPedido = {
    id: pedidos.length + 1,
    clienteId,
    produtoId,
    quantidadeKg,
    valorTotal: Number((quantidadeKg * produto.precoKg).toFixed(2)),
    status: "pendente",
    criadoEm: new Date().toISOString().split("T")[0],
  };

  pedidos.push(novoPedido);
  res.status(201).json(novoPedido);
});
```

**Detalhes que fazem diferença:**
- Mensagem diz QUAL campo falhou — frontend e usuário agradecem
- `!quantidadeKg` sozinho seria bug: rejeitaria `0` mas também travaria
  em edge cases; por isso a checagem explícita de `undefined/null` e
  depois de tipo/valor
- Validar que o cliente/produto EXISTEM evita pedido órfão (o famoso
  problema de integridade que em banco real seria foreign key)
- No trabalho real, times usam libs como **Zod** pra isso — mas entender
  a validação na mão vem primeiro

---

## TASK 7 — Pedidos por cliente (o "JOIN")

```typescript
router.get("/:id/pedidos", (req: Request, res: Response) => {
  const cliente = clientes.find((c) => c.id === Number(req.params.id));

  if (!cliente) {
    return res.status(404).json({ erro: "Cliente não encontrado" });
  }

  const pedidosDoCliente = pedidos
    .filter((p) => p.clienteId === cliente.id)
    .map((p) => {
      const produto = produtos.find((prod) => prod.id === p.produtoId);
      return { ...p, produto: produto ? produto.nome : "—" };
    });

  const totalGasto = pedidosDoCliente
    .filter((p) => p.status !== "cancelado")
    .reduce((soma, p) => soma + p.valorTotal, 0);

  res.json({
    cliente: cliente.nome,
    pedidos: pedidosDoCliente,
    totalGasto: Number(totalGasto.toFixed(2)),
    quantidadePedidos: pedidosDoCliente.length,
  });
});
```

**O padrão que você vai usar mil vezes:** `filter` (pega os do cliente)
→ `map` (enriquece com o nome do produto — isso É um join manual) →
`reduce` (agrega o total). Essa tríade filter/map/reduce é 80% do
trabalho com dados em dashboard.

Repare: as lições das tasks anteriores voltaram — o 404 da Task 5 e o
"cancelado não conta" da Task 4. No trabalho é assim: os padrões se repetem.

---

## TASK 8 — 🐛 Bug do filtro de categoria

**A causa (uma palavra!):** `.toUpperCase()` — as categorias no banco
estão em minúsculo (`"vigas"`), mas o filtro compara com `"VIGAS"`.
Nunca vai bater.

```typescript
router.get("/", (req: Request, res: Response) => {
  const { categoria } = req.query;

  let resultado = produtos;
  if (categoria) {
    resultado = produtos.filter(
      (p) => p.categoria === String(categoria).trim().toLowerCase()
    );
  }

  res.json({ data: resultado });
});
```

**Como achar bug assim em 2 minutos:** joga um `console.log` dentro do
filter mostrando os dois lados da comparação:
```typescript
console.log(`banco: "${p.categoria}" vs query: "${categoria.trim().toUpperCase()}"`);
// banco: "vigas" vs query: "VIGAS"  ← achou!
```
Bug de comparação quase sempre é case, espaço ou tipo (string "1" vs número 1).

---

## TASK 9 — Alerta de estoque baixo

```typescript
// ⚠️ DECLARAR ANTES de qualquer rota /:id neste arquivo!
router.get("/estoque-baixo", (req: Request, res: Response) => {
  const limiteKg = Number(req.query.limiteKg) || 5000;

  const emAlerta = produtos
    .filter((p) => p.estoqueKg < limiteKg)
    .sort((a, b) => a.estoqueKg - b.estoqueKg)
    .map((p) => ({
      ...p,
      faltamKg: limiteKg - p.estoqueKg,
    }));

  res.json({ limiteKg, total: emAlerta.length, data: emAlerta });
});
```

**A pegadinha da ordem de rotas:** o Express lê as rotas de cima pra
baixo. Se existisse um `router.get("/:id")` declarado ANTES, a chamada
`/produtos/estoque-baixo` cairia nele com `id = "estoque-baixo"`.
Regra prática: **rotas específicas (texto fixo) sempre antes das
dinâmicas (`/:param`)**. Esse erro derruba gente experiente.

**O sort explicado:** `(a, b) => a.estoqueKg - b.estoqueKg` — resultado
negativo põe `a` antes. Menor estoque primeiro = mais crítico no topo.

---

## TASK 10 — Dashboard resumo (a integradora)

**1º passo — criar `src/routes/dashboard.routes.ts`:**

```typescript
import express, { Request, Response, Router } from "express";
const router: Router = express.Router();
import { pedidos, clientes, produtos } from "../data/db";

router.get("/resumo", (req: Request, res: Response) => {
  // --- Faturamento (sem cancelados — sempre ela!)
  const pedidosValidos = pedidos.filter((p) => p.status !== "cancelado");
  const faturamentoMes = pedidosValidos.reduce((s, p) => s + p.valorTotal, 0);

  // --- Contagens por status
  const pedidosPendentes = pedidos.filter((p) => p.status === "pendente").length;
  const pedidosEmProducao = pedidos.filter((p) => p.status === "em_producao").length;

  // --- Clientes ativos
  const clientesAtivos = clientes.filter((c) => c.ativo).length;

  // --- Produto mais vendido (soma de kg por produto)
  const kgPorProduto: Record<number, number> = {};
  for (const p of pedidosValidos) {
    kgPorProduto[p.produtoId] = (kgPorProduto[p.produtoId] || 0) + p.quantidadeKg;
  }
  let maisVendidoId: number | null = null;
  let maisVendidoKg = 0;
  for (const [id, kg] of Object.entries(kgPorProduto)) {
    if (kg > maisVendidoKg) {
      maisVendidoKg = kg;
      maisVendidoId = Number(id);
    }
  }
  const prodMaisVendido = produtos.find((p) => p.id === maisVendidoId);

  // --- Top 3 clientes por gasto
  const gastoPorCliente: Record<number, number> = {};
  for (const p of pedidosValidos) {
    gastoPorCliente[p.clienteId] = (gastoPorCliente[p.clienteId] || 0) + p.valorTotal;
  }
  const top3Clientes = Object.entries(gastoPorCliente)
    .map(([id, total]) => {
      const c = clientes.find((cli) => cli.id === Number(id));
      return { nome: c ? c.nome : "—", totalGasto: Number(total.toFixed(2)) };
    })
    .sort((a, b) => b.totalGasto - a.totalGasto)
    .slice(0, 3);

  res.json({
    faturamentoMes: Number(faturamentoMes.toFixed(2)),
    pedidosPendentes,
    pedidosEmProducao,
    clientesAtivos,
    produtoMaisVendido: {
      nome: prodMaisVendido ? prodMaisVendido.nome : "—",
      totalKg: maisVendidoKg,
    },
    top3Clientes,
  });
});

export default router;
```

**2º passo — registrar no `server.ts`:**

```typescript
import dashboardRoutes from "./routes/dashboard.routes";
// ... junto com os outros app.use:
app.use("/dashboard", dashboardRoutes);
```

**O que essa task ensina:**
- O padrão "objeto acumulador" (`kgPorProduto`, `gastoPorCliente`) —
  é o GROUP BY do SQL feito em JavaScript. Compare mentalmente:
  ```sql
  SELECT cliente_id, SUM(valor_total) FROM pedidos
  WHERE status != 'cancelado' GROUP BY cliente_id
  ORDER BY 2 DESC LIMIT 3;
  ```
  É a MESMA lógica. Quem entende um, entende o outro.
- `Object.entries` transforma objeto em array pra poder ordenar
- `sort` decrescente: `(a, b) => b.total - a.total` (b primeiro = maior primeiro)
- Registrar rota nova no server é o que você fará na primeira semana real

---

## 🎓 AS 6 LIÇÕES QUE ESTE SPRINT DEIXOU (leva pro trabalho)

1. **Filtrar antes de paginar.** Ordem das operações muda o resultado.
2. **Todo `find` pode voltar vazio.** Guard clause + 404 sempre.
3. **Validação com mensagem específica.** "Campo X inválido" > "Erro".
4. **Bug de comparação = case, espaço ou tipo.** `console.log` dos dois lados resolve em minutos.
5. **Rota fixa antes de rota dinâmica.** Express lê de cima pra baixo.
6. **filter → map → reduce é o GROUP BY do JavaScript.** Domina isso e dashboards viram rotina.

Se você fez as 10 tasks (mesmo consultando o gabarito depois de tentar),
você já praticou o dia a dia real de um dev junior em time. 

**Agora refaz a Task 10 sem olhar. É o teste final.**
