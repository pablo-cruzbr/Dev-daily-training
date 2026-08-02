# 📚 CONCEITOS — a base pra fazer qualquer task deste projeto

> Leia isto antes de tentar qualquer task. Não é o gabarito (isso é o
> `GABARITO.md`) — é o "dicionário" de peças que você vai combinar pra
> resolver cada uma. Depois de entender isto, volte pro `TASKS.md`.

---

## 1. Onde cada dado chega numa requisição

Toda rota Express recebe `req` (request) e `res` (response). O `req`
tem 3 lugares diferentes onde um dado pode vir — não confunda:

| Vem de... | Exemplo na URL/chamada | Como acessar |
|---|---|---|
| **Query string** | `/pedidos?page=1&status=aprovado` | `req.query.page`, `req.query.status` |
| **Parâmetro de rota** | `/pedidos/:id` → `/pedidos/7` | `req.params.id` |
| **Body (só em POST/PUT)** | JSON mandado no corpo da requisição | `req.body.clienteId` |

**Detalhe que confunde todo mundo no início:** tudo que vem de `query`
e `params` chega como **texto (string)**, mesmo se parecer um número.
`req.query.page` é a string `"1"`, não o número `1`. Por isso você vê
`Number(req.query.page)` em toda parte — é a conversão obrigatória.

---

## 2. Valor padrão com `||`

```typescript
const limit = Number(req.query.limit) || 10;
```

Se `req.query.limit` não veio, `Number(undefined)` dá `NaN`. E tanto
`NaN` quanto `undefined` quanto `0` são "falsy" em JS — ou seja, o `||`
enxerga como "vazio" e usa o valor da direita (`10`) como padrão.
É o jeito curto de escrever:

```typescript
let limit = Number(req.query.limit);
if (!limit) {
  limit = 10;
}
```

---

## 3. Os métodos de array que resolvem quase tudo

Você vai usar estes cinco o tempo todo. Todos criam um **array novo**
(não alteram o original):

- **`find`** → acha UM item que bate com a condição (ou `undefined` se não achar)
  ```typescript
  const cliente = clientes.find((c) => c.id === 5);
  ```
- **`filter`** → devolve TODOS os itens que batem com a condição
  ```typescript
  const aprovados = pedidos.filter((p) => p.status === "aprovado");
  ```
- **`map`** → transforma cada item em outra coisa (mesmo tamanho de array)
  ```typescript
  const nomes = clientes.map((c) => c.nome);
  ```
- **`slice(inicio, fim)`** → corta um pedaço do array por posição (é a base da paginação)
  ```typescript
  const pagina = pedidos.slice(0, 10); // os 10 primeiros
  ```
- **`reduce`** → soma/acumula tudo num único valor
  ```typescript
  const total = pedidos.reduce((soma, p) => soma + p.valorTotal, 0);
  ```
- **`sort((a, b) => ...)`** → ordena. Se o resultado for negativo, `a`
  vem antes; se for positivo, `b` vem antes
  ```typescript
  produtos.sort((a, b) => a.estoqueKg - b.estoqueKg); // menor primeiro
  ```

**O combo mais comum em dashboard:** `filter` (pega só o que interessa)
→ `map` (formata/enriquece) → `reduce` (soma um total). Você vai usar
esse trio em várias tasks (7 e 10, por exemplo).

---

## 4. "E se não encontrar nada?" — a guarda (`guard clause`)

`find` pode devolver `undefined`. Se você usar o resultado sem checar,
o servidor quebra (erro 500) na hora que o dado não existir:

```typescript
const pedido = pedidos.find((p) => p.id === Number(req.params.id));
// pedido pode ser undefined aqui!

if (!pedido) {
  return res.status(404).json({ erro: "Pedido não encontrado" });
}
// a partir daqui, TypeScript e você sabem que pedido existe
```

O `return` é essencial — sem ele, o código continua executando as
linhas de baixo mesmo depois de mandar a resposta 404.

---

## 5. Códigos de status HTTP que você vai usar

| Código | Quando usar |
|---|---|
| `200` (padrão do `res.json()`) | Deu certo, aqui está o resultado |
| `201` | Criou algo novo (POST que teve sucesso) |
| `400` | O cliente mandou dado inválido (faltou campo, tipo errado) |
| `404` | Buscou algo por id e não achou |
| `501` | Rota existe mas ainda não foi implementada |

---

## 6. Como ler a assinatura das rotas em TypeScript

```typescript
router.get("/", (req: Request, res: Response) => {
```

- `req: Request` e `res: Response` são só os **tipos** — dizem ao
  TypeScript "esse objeto tem `.query`, `.params`, `.body`, etc." Não
  muda o comportamento em nada, só te dá autocomplete e checagem de erro.
- `router.get`, `router.post` — o verbo HTTP decide o método.
- A rota `"/"` combinada com `app.use("/pedidos", pedidosRoutes)` no
  `server.ts` forma o caminho final: `/pedidos`.

---

## 7. Exemplo completo comentado (o que a TASK 1 já resolveu)

```typescript
router.get("/", (req: Request, res: Response) => {
  // 1. Lê os parâmetros da URL, converte pra número, com padrão
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  // 2. Calcula quantos itens "pular" antes de começar a página
  const skip = (page - 1) * limit;

  // 3. Corta o pedaço certo do array
  const data = pedidos.slice(skip, skip + limit);

  // 4. Devolve o pedaço + metadados que o frontend precisa pra
  //    montar os botões de "página anterior/próxima"
  res.json({
    data,
    total: pedidos.length,
    page,
    totalPages: Math.ceil(pedidos.length / limit),
  });
});
```

Use este como referência de "formato de resposta" e "como ler query
params" pras próximas tasks — a lógica interna muda, a estrutura se repete.

---

## Como estudar cada task a partir daqui

1. Lê a task no `TASKS.md` inteira, incluindo os critérios de aceite.
2. Volta aqui e identifica quais peças (seção 1 a 6) você vai precisar.
3. Tenta escrever sozinho — pode ficar feio, pode não compilar de primeira.
4. Roda (`yarn start`) e testa no Yaak. Erro de verdade ensina mais que acertar de primeira.
5. Só depois de tentar, compara com o `GABARITO.md`.
