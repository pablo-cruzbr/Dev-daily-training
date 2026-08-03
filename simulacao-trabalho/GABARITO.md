# 🔑 GABARITO — Soluções das 10 Tasks (versão explicada)

## ⚠️ REGRA DE OURO: só abre este arquivo DEPOIS de tentar por pelo menos 1 hora

> No trabalho real não existe gabarito. Existe tentar, pesquisar, e aí sim
> perguntar. Usa este arquivo como o "colega sênior" que você consulta
> depois de tentar — não como atalho.
>
> **Como usar:** cada solução tem o código + um **passo a passo** linha
> por linha + as perguntas "e se eu não tivesse feito isso?". Se algum
> termo não fizer sentido (`query`, `find`, `reduce`...), para e vai no
> [`CONCEITOS.md`](CONCEITOS.md) primeiro — ele é o dicionário, este
> arquivo é o exemplo aplicado.
>
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

### Passo a passo

1. **`Number(req.query.page) || 1`** — `req.query.page` chega como texto
   (ex: `"2"`), então converto pra número. Se não veio nada, `Number(undefined)`
   dá `NaN`, que é "falsy", e o `||` cai pro valor padrão `1`. (Ver
   [CONCEITOS.md §1 e §2](CONCEITOS.md#1-onde-cada-dado-chega-numa-requisição).)
2. **`skip = (page - 1) * limit`** — a fórmula que traduz "página" em
   "posição no array". Testa na mão: página 1 → `(1-1)*10 = 0` (não pula
   nada); página 3 → `(3-1)*10 = 20` (pula os 20 primeiros).
3. **`pedidos.slice(skip, skip + limit)`** — corta o array de `skip` até
   `skip + limit`. `slice` nunca quebra: se você pedir um pedaço que não
   existe (ex: `skip = 990` num array de 40 itens), ele só devolve `[]`.
   Isso já resolve sozinho o critério "página 99 não quebra".
4. **`Math.ceil(pedidos.length / limit)`** — arredonda pra cima. 40 ÷ 10 =
   4.0 → 4 páginas certinho. 41 ÷ 10 = 4.1 → `Math.ceil` dá 5, porque o
   pedido 41 sozinho já ocupa uma página inteira.

### E se eu não tivesse feito isso?

- Sem o `|| 1` / `|| 10`: chamar `/pedidos` sem parâmetros geraria
  `skip = NaN`, e `slice(NaN, NaN)` devolve um array vazio — pareceria bug
  de "não retorna nada" sem mensagem de erro nenhuma.
- Sem `Math.ceil` (usando divisão direta): 41 pedidos com limit 10 diria
  "4.1 páginas", o que não significa nada pro frontend montar botões de
  paginação.

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

### Passo a passo

1. Começo com `resultado = pedidos` (todos). Se `status` veio na query,
   troco `resultado` pelo array já filtrado com
   [`filter`](CONCEITOS.md#3-os-métodos-de-array-que-resolvem-quase-tudo).
2. **Só depois** de filtrar eu calculo `skip` e corto com `slice`. A
   paginação roda em cima do `resultado` (filtrado), nunca do `pedidos`
   original.
3. `total` e `totalPages` também usam `resultado.length`, não
   `pedidos.length` — porque o frontend precisa saber quantas páginas
   existem **dentro do filtro aplicado**, não do total geral do sistema.

### A pegadinha, explicada devagar

Se você inverter a ordem — paginar primeiro, filtrar depois — acontece
isto: pega os 10 primeiros pedidos (sem olhar status), e SÓ DEPOIS filtra
por `status=aprovado` dentro desses 10. Se só 3 deles forem aprovados, a
resposta vem com 3 itens em vez de 10, mesmo que existam mais aprovados
nas páginas seguintes. A regra fica gravada assim:

**filtrar → contar → paginar** (sempre nessa ordem).

### E se eu não tivesse feito isso?

- Sem o `if (status)`: toda chamada, mesmo sem `?status=`, tentaria
  filtrar por `undefined`, e nenhum pedido teria `status === undefined`
  → a lista sempre viria vazia.

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

### Passo a passo

1. Pego `busca` da query string (texto que o usuário digitou).
2. `c.nome.toLowerCase()` — transformo o nome do cliente pra minúsculo.
3. `String(busca).toLowerCase()` — transformo o texto buscado pra
   minúsculo também. **Os dois lados** precisam estar no mesmo formato,
   senão `"Metal" === "metal"` seria `false`.
4. `.includes(...)` — verifica se o texto buscado aparece em QUALQUER
   posição do nome (não precisa ser no início). É isso que faz "metal"
   achar "Metalúrgica São José" (começa com) e "Indústria MetalFort"
   (está no meio).

### E se eu não tivesse feito isso?

- Sem os dois `.toLowerCase()`: buscar "metal" minúsculo não acharia
  "Metalúrgica" (que começa com M maiúsculo) — o usuário digitando
  errado de caixa não acharia nada, experiência ruim.
- Usando `===` no lugar de `.includes()`: só acharia nome EXATO, não
  busca parcial — "metal" nunca acharia "Metalúrgica São José".

---

## TASK 4 — 🐛 Bug do faturamento (cancelados somando)

**A causa:** o loop original somava `pedido.valorTotal` de TODOS os
pedidos no `faturamentoTotal`, sem checar o `status`. Um pedido cancelado
não devia contar como faturamento — é dinheiro que não entrou.

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

### Passo a passo

1. `porStatus` é um objeto acumulador — pra cada `status` diferente,
   guarda a soma de `valorTotal` daquele grupo. Esse objeto continua
   somando TUDO, inclusive cancelado, porque o gestor quer ver esse
   número separado (é útil saber quanto foi cancelado).
2. O `if (pedido.status !== "cancelado")` é a correção: só soma no
   `faturamentoTotal` (o número principal) quando o pedido NÃO é
   cancelado.
3. `faturamentoTotal.toFixed(2)` arredonda pra 2 casas decimais (evita
   número tipo `79145.40000000001` — ver bônus abaixo) e `Number(...)`
   transforma o texto resultante de volta em número, porque
   `toFixed` devolve string.

### Como você teria achado esse bug sozinho

A resposta original já "denunciava" o problema: o campo `porStatus`
mostrava `cancelado: 101423.79`, e o `faturamentoTotal` batia exatamente
com a SOMA de todos os status, incluindo o cancelado. Sempre que um total
"geral" bate 100% com a soma das partes sem exceção nenhuma, desconfie —
normalmente alguma parte não deveria estar entrando na conta.

### Bônus — o número quebrado (`79145.40000000001`)

Isso é o clássico problema de ponto flutuante do JavaScript (e da maioria
das linguagens): computadores guardam decimais em binário, e alguns
números decimais simplesmente não têm representação binária exata — sobra
um resto quase invisível. Em sistema financeiro de verdade isso se resolve
trabalhando em **centavos como inteiros** (nunca decimal) ou com uma
biblioteca como `decimal.js`. Guarda essa explicação — é pergunta clássica
de entrevista.

---

## TASK 5 — 🐛 Bug do 404 (servidor quebra com id inexistente)

**A causa:** `pedidos.find(...)` devolve `undefined` quando nenhum pedido
bate com o `id`. A linha seguinte, no código original, tentava ler
`pedido.clienteId` direto — e ler uma propriedade de `undefined` é
exatamente o que gera `TypeError` (e o Express transforma isso em erro
500).

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

### Passo a passo

1. `req.params.id` vem da URL (`/pedidos/999` → `id = "999"`, texto).
   `Number(...)` converte pra comparar com o `id` numérico dos pedidos.
2. **A guarda:** `if (!pedido) { return res.status(404)...}`. Isso é uma
   *guard clause* — "se a condição ruim acontecer, resolve e sai
   imediatamente". Sem o `return`, o código continuaria rodando as linhas
   de baixo mesmo depois de já ter mandado uma resposta 404, e quebraria
   do mesmo jeito tentando ler `pedido.clienteId` de `undefined`.
3. Depois da guarda, o TypeScript (e você) já sabe que `pedido` não é
   `undefined` — o código abaixo pode usar `pedido.clienteId` sem medo.
4. Repare que `cliente` e `produto` também podem não existir (dados
   inconsistentes) — por isso o `cliente ? cliente.nome : "..."` também
   tem sua própria guarda, só que resolvida com um "ou" ao invés de
   interromper a resposta toda.

### A lição que vale carreira

Todo `find` (e toda busca em banco de dados de verdade, toda chamada pra
API externa) pode voltar vazio. Perguntar "e se não encontrar?" antes de
usar o resultado é o hábito que mais separa código confiável de código
que quebra em produção às 2h da manhã.

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

### Passo a passo

1. Cada validação é sua própria guard clause: checa uma coisa, e se
   falhar, retorna `400` com uma mensagem dizendo EXATAMENTE qual campo
   deu problema, e sai (`return`) antes de continuar.
2. Repare a ordem: primeiro confere se `clienteId` veio, DEPOIS confere
   se aquele cliente existe de verdade na lista. É inútil buscar um
   cliente com id `undefined`.
3. `quantidadeKg === undefined || quantidadeKg === null` — por que não
   simplesmente `if (!quantidadeKg)`? Porque `!quantidadeKg` também seria
   `true` quando `quantidadeKg` é `0` — e `0` é um valor que "existe",
   só é inválido por outro motivo (não é maior que zero). Separar as
   checagens evita misturar "campo não veio" com "campo veio errado".
4. `typeof quantidadeKg !== "number" || quantidadeKg <= 0` — essa linha
   cobre dois problemas de uma vez: tipo errado (ex: mandaram a string
   `"100"`) e valor inválido (negativo ou zero).
5. Só depois de passar por TODAS as guardas o código chega no `novoPedido`
   — nesse ponto, você tem certeza que `cliente`, `produto` e
   `quantidadeKg` são válidos.

### E se eu não tivesse feito isso?

- Sem validar que cliente/produto EXISTEM (só que vieram preenchidos):
  criaria um pedido "órfão", apontando pra um cliente que não existe —
  em banco de dados de verdade, isso é o problema que uma foreign key
  resolveria; aqui, sem validação manual, ninguém impede.
- Sem mensagem específica por campo: o frontend (e você, debugando)
  só saberia "deu erro", sem saber qual campo corrigir.

No trabalho real, times costumam usar bibliotecas como **Zod** ou
**Joi** pra não escrever tanta validação na mão — mas entender a lógica
manual primeiro é o que te ajuda a configurar essas libs direito depois.

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

### Passo a passo (o trio filter → map → reduce)

1. **Guarda de sempre** (lição da Task 5): se o cliente não existe, 404
   e sai — sem isso o resto do código nem faz sentido de rodar.
2. **`filter`**: de todos os `pedidos`, pega só os que pertencem a ESTE
   cliente (`p.clienteId === cliente.id`).
3. **`map`**: para cada pedido filtrado, busca o nome do produto
   correspondente e devolve um objeto novo com `...p` (todos os campos
   originais do pedido) mais o campo `produto` adicionado. Isso É um
   "join" feito na mão — em SQL seria um `JOIN pedidos ON produtos`.
4. **`filter` + `reduce`** de novo: dos pedidos do cliente, tira os
   cancelados (lição da Task 4) e soma (`reduce`) o `valorTotal` de todos
   que sobraram, começando de `0`.
5. A resposta final devolve o nome do cliente, a lista enriquecida, o
   total gasto e a contagem — tudo pronto pro frontend não precisar fazer
   nenhuma conta.

### Por que isso importa tanto

Esse padrão `filter → map → reduce` é literalmente 80% do trabalho de
montar dados pra dashboard: filtrar o que interessa, enriquecer/formatar,
agregar num total. Ver as lições das Tasks 4 e 5 reaparecendo aqui não é
coincidência — no trabalho real os mesmos padrões voltam task após task.

---

## TASK 8 — 🐛 Bug do filtro de categoria

**A causa (uma palavra!):** o código original comparava
`p.categoria === categoria.trim().toUpperCase()`. Só que as categorias
no banco estão salvas em **minúsculo** (`"vigas"`, `"chapas"`...), e o
filtro convertia a busca pra **maiúsculo** (`"VIGAS"`). `"vigas" ===
"VIGAS"` é sempre `false` em JavaScript — nunca ia bater.

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

### Passo a passo

1. Troquei `.toUpperCase()` por `.toLowerCase()` — agora os dois lados da
   comparação ficam em minúsculo, batendo com o formato salvo no banco.
2. `.trim()` continua ali por outro motivo: remove espaços em branco no
   início/fim (ex: se alguém mandar `?categoria= vigas`, o espaço não
   atrapalha a comparação).

### Como achar esse tipo de bug em 2 minutos

Quando uma comparação (`===`) que "deveria" bater simplesmente não bate,
joga um `console.log` mostrando os DOIS lados, um do lado do outro:

```typescript
console.log(`banco: "${p.categoria}" vs query: "${categoria.trim().toUpperCase()}"`);
// banco: "vigas" vs query: "VIGAS"  ← achou! diferença de maiúscula/minúscula
```

Bug de comparação quase sempre cai em uma dessas três categorias: **case**
(maiúsculo/minúsculo), **espaço** (`"vigas "` com espaço sobrando) ou
**tipo** (string `"1"` comparada com número `1`).

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

### Passo a passo

1. `limiteKg` vem da query, com padrão `5000` (mesmo padrão `Number(...) || valor`
   que já apareceu na Task 1).
2. **`filter`**: mantém só os produtos com `estoqueKg` abaixo do limite.
3. **`sort((a, b) => a.estoqueKg - b.estoqueKg)`**: ordena o array. A
   regra do `sort` em JS é: se a função devolve um número **negativo**,
   `a` vem antes de `b`; se devolve **positivo**, `b` vem antes. Como
   `a.estoqueKg - b.estoqueKg` é negativo quando `a` tem MENOS estoque
   que `b`, o resultado fica do menor estoque pro maior — o mais crítico
   aparece primeiro.
4. **`map`**: adiciona o campo `faltamKg` (quanto falta pra sair do
   alerta) em cada item, sem alterar os campos originais (`...p`).

### A pegadinha da ordem das rotas (a mais importante da task)

O Express lê as rotas **de cima pra baixo**, na ordem em que foram
declaradas no arquivo. Se existisse `router.get("/:id", ...)` declarado
ANTES desta rota, uma chamada em `/produtos/estoque-baixo` cairia
naquela rota dinâmica, com `req.params.id = "estoque-baixo"` (porque pro
Express, `estoque-baixo` parece só mais um valor de `:id`). Por isso a
regra prática: **rotas de texto fixo sempre antes de rotas com `:parametro`.**
Esse é um erro que derruba até gente com anos de experiência.

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

### Passo a passo

1. `pedidosValidos` filtra os cancelados logo no início — todas as outras
   contas desta rota partem dele, evitando repetir a mesma checagem várias
   vezes (lição da Task 4, aplicada uma vez só, no topo).
2. **Padrão "objeto acumulador"** (`kgPorProduto`, `gastoPorCliente`): um
   `for` que, a cada pedido, soma num objeto indexado pelo id. É
   literalmente o `GROUP BY` do SQL, escrito à mão:
   ```sql
   SELECT cliente_id, SUM(valor_total) FROM pedidos
   WHERE status != 'cancelado' GROUP BY cliente_id
   ORDER BY 2 DESC LIMIT 3;
   ```
   O `for` com objeto acumulador faz o `GROUP BY`; o `Object.entries` +
   `sort` + `slice(0, 3)` faz o `ORDER BY ... LIMIT 3`.
3. `Object.entries(objeto)` transforma `{ "1": 500, "2": 300 }` num array
   `[["1", 500], ["2", 300]]` — só arrays têm `.sort()`, por isso essa
   conversão é necessária antes de ordenar.
4. `sort((a, b) => b.totalGasto - a.totalGasto)` — igual à Task 9, mas
   invertido (`b - a` em vez de `a - b`): agora quem tem MAIS gasto vem
   primeiro (ordem decrescente).
5. Registrar a rota no `server.ts` com `app.use("/dashboard", dashboardRoutes)`
   é o passo que ninguém lembra de fazer na primeira vez — a rota existir
   no arquivo não é suficiente, o Express precisa ser avisado que ela existe.

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
