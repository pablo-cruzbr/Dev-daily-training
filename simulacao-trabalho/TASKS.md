# 📋 SPRINT DE SIMULAÇÃO — Suas primeiras 2 semanas de trabalho
## Backend ERP-Simulação — Pablo Cruz

> **Como usar:** este projeto simula o que você vai encontrar na Aços Vital.
> Cada task abaixo está escrita como um card real de Scrum — igual às folhas
> coladas na parede que você viu na entrevista.
>
> **Regras do jogo (siga como se fosse trabalho de verdade):**
> 1. Cada task = uma branch nova (`git checkout -b feature/task-1-paginacao`)
> 2. Terminou = commit com mensagem padrão (`feat:`, `fix:`) + PR no GitHub
> 3. Travou por mais de 1h = anota a dúvida (simula "pedir ajuda na daily")
> 4. Antes de codar, lê a task inteira e os "critérios de aceite"
> 5. Depois de cada task, fala em voz alta o que fez (treino de daily!)
>
> **Setup inicial:**
> ```bash
> cd simulacao-trabalho
> npm install express
> node src/server.js
> # Testa: http://localhost:3000/health
> ```

---

## 🟢 SEMANA 1 — Tasks de entrada (o que dão pra junior no 1º mês)

---

### TASK 1 — Paginação na listagem de pedidos
**Prioridade:** Alta | **Estimativa:** 2h | **Arquivo:** `src/routes/pedidos.routes.js`

**Como está:** `GET /pedidos` retorna os 40 pedidos de uma vez.

**Como deve ficar:** aceitar `?page=1&limit=10` e retornar:
```json
{
  "data": [...só os 10 da página...],
  "total": 40,
  "page": 1,
  "totalPages": 4
}
```

**Critérios de aceite:**
- [ ] Sem parâmetros → usa `page=1` e `limit=10` como padrão
- [ ] `/pedidos?page=2&limit=10` retorna os pedidos 11 a 20
- [ ] `/pedidos?page=99` retorna `data: []` (não quebra)
- [ ] `totalPages` calculado com `Math.ceil(total / limit)`

**Dica:** a fórmula é `skip = (page - 1) * limit`, e em array puro é
`array.slice(skip, skip + limit)`.

---

### TASK 2 — Filtro por status nos pedidos
**Prioridade:** Alta | **Estimativa:** 1h | **Arquivo:** `src/routes/pedidos.routes.js`

**Como deve ficar:** `GET /pedidos?status=aprovado` retorna só os aprovados.
**E atenção:** o filtro precisa funcionar JUNTO com a paginação da Task 1.
`/pedidos?status=aprovado&page=1&limit=5` → primeiros 5 aprovados.

**Critérios de aceite:**
- [ ] Filtra por qualquer status válido
- [ ] Status inexistente (`?status=xyz`) retorna `data: []`
- [ ] `total` e `totalPages` refletem o resultado FILTRADO, não o geral
- [ ] Sem o parâmetro → lista tudo normalmente

**⚠️ Pegadinha real de trabalho:** a ordem importa — primeiro filtra,
DEPOIS pagina. Se paginar antes de filtrar, os números saem errados.

---

### TASK 3 — Busca de clientes por nome
**Prioridade:** Média | **Estimativa:** 1h | **Arquivo:** `src/routes/clientes.routes.js`

**Como deve ficar:** `GET /clientes?busca=metal` retorna "Metalúrgica São José"
e "Indústria MetalFort".

**Critérios de aceite:**
- [ ] Busca parcial (pedaço do nome já encontra)
- [ ] Case insensitive ("METAL", "metal", "Metal" — tudo funciona)
- [ ] Sem o parâmetro → lista todos

**Dica:** `nome.toLowerCase().includes(busca.toLowerCase())`

---

## 🟡 SEMANA 1 — Caça aos bugs (simulação de chamado/bug report)

> No trabalho real, você vai receber bugs reportados por usuários.
> Os 4 bugs abaixo JÁ EXISTEM no código. Sua missão: reproduzir,
> encontrar a causa, corrigir. Igual chamado de suporte.

---

### TASK 4 — 🐛 BUG: Faturamento errado no relatório
**Reportado por:** "Financeiro" | **Arquivo:** `src/routes/pedidos.routes.js`

**O chamado diz:**
> "O faturamento total do relatório está maior do que deveria.
> Conferimos na planilha e o valor não bate. Podem verificar?"

**Sua missão:**
1. Abre `GET /pedidos/relatorio` e analisa o resultado
2. Descobre POR QUE o valor está inflado
3. Corrige (pedido cancelado não é faturamento!)
4. Commit: `fix: exclude cancelled orders from revenue report`

---

### TASK 5 — 🐛 BUG: Servidor quebra ao buscar pedido inexistente
**Reportado por:** "Time do frontend" | **Arquivo:** `src/routes/pedidos.routes.js`

**O chamado diz:**
> "Quando o dashboard tenta abrir um pedido que foi deletado,
> a tela trava com erro 500. Teste aí: GET /pedidos/999"

**Sua missão:**
1. Reproduz o erro (chama `/pedidos/999` e vê o servidor explodir)
2. Entende a causa (o que acontece quando `find` não acha nada?)
3. Corrige: retornar `404` com `{ "erro": "Pedido não encontrado" }`
4. Commit: `fix: return 404 when order does not exist`

**Esse é O bug mais clássico de junior deixar passar. Grava a lição:
sempre pergunte "e se não encontrar?"**

---

### TASK 6 — 🐛 BUG: Criação de pedido aceita dados inválidos
**Reportado por:** "Coordenador" | **Arquivo:** `src/routes/pedidos.routes.js`

**O chamado diz:**
> "Apareceu um pedido com quantidade NEGATIVA e outro sem cliente
> no sistema. Precisamos de validação nesse cadastro urgente."

**Sua missão — validar no `POST /pedidos`:**
- [ ] `clienteId` obrigatório e precisa existir na lista de clientes
- [ ] `produtoId` obrigatório e precisa existir na lista de produtos
- [ ] `quantidadeKg` obrigatório, número, maior que zero
- [ ] Qualquer violação → `400` com mensagem clara de QUAL campo falhou
4. Commit: `fix: add validation to order creation`

---

### TASK 8 — 🐛 BUG: Filtro de categoria não retorna nada
**Reportado por:** "Vendas" | **Arquivo:** `src/routes/produtos.routes.js`

**O chamado diz:**
> "O filtro de categoria parou de funcionar. /produtos?categoria=vigas
> deveria mostrar 2 produtos e mostra 0."

**Sua missão:** o bug é UMA palavra errada na linha do filter.
Acha, corrige, commita: `fix: category filter case comparison`

**Lição real:** bugs de produção raramente são complexos. São detalhes.

---

## 🔵 SEMANA 2 — Tasks de construção (features do zero)

---

### TASK 7 — Pedidos por cliente (integração entre tabelas)
**Prioridade:** Alta | **Estimativa:** 2h | **Arquivo:** `src/routes/clientes.routes.js`

**A rota `GET /clientes/:id/pedidos` está vazia. Construir:**
```json
{
  "cliente": "Metalúrgica São José",
  "pedidos": [ ...pedidos desse cliente com nome do produto... ],
  "totalGasto": 45820.50,
  "quantidadePedidos": 5
}
```

**Critérios de aceite:**
- [ ] Cliente inexistente → 404 (você já aprendeu na Task 5!)
- [ ] Cada pedido traz o NOME do produto, não só o produtoId
- [ ] `totalGasto` NÃO soma pedidos cancelados (lição da Task 4!)
- [ ] Cliente sem pedidos → lista vazia e total 0, sem quebrar

**Isso simula JOIN entre tabelas — o dia a dia de dashboard com ERP.**

---

### TASK 9 — Alerta de estoque baixo
**Prioridade:** Média | **Estimativa:** 1h30 | **Arquivo:** `src/routes/produtos.routes.js`

**Criar rota nova:** `GET /produtos/estoque-baixo?limiteKg=5000`

**Critérios de aceite:**
- [ ] Retorna produtos com `estoqueKg` abaixo do limite
- [ ] Sem parâmetro → usa 5000 como padrão
- [ ] Ordenado do MENOR estoque pro maior (mais crítico primeiro)
- [ ] Cada item mostra também quantos kg faltam pro limite

**⚠️ Pegadinha de rota:** essa rota precisa ser declarada ANTES de
qualquer rota `/:id` no arquivo — senão o Express acha que
"estoque-baixo" é um id! (Esse erro acontece MUITO em time real.)

---

### TASK 10 — Dashboard resumo (a task "integradora")
**Prioridade:** Alta | **Estimativa:** 3h | **Arquivo:** criar `src/routes/dashboard.routes.js`

**O coordenador pede:** "Preciso de um endpoint único que alimente os
cards do topo do dashboard."

**Criar `GET /dashboard/resumo` retornando:**
```json
{
  "faturamentoMes": 0,
  "pedidosPendentes": 0,
  "pedidosEmProducao": 0,
  "clientesAtivos": 0,
  "produtoMaisVendido": { "nome": "...", "totalKg": 0 },
  "top3Clientes": [ { "nome": "...", "totalGasto": 0 } ]
}
```

**Critérios de aceite:**
- [ ] Registrar a rota nova no `server.js` (você nunca fez isso aqui — descubra como)
- [ ] Faturamento exclui cancelados (de novo ela!)
- [ ] `produtoMaisVendido` calculado pela SOMA de kg em todos os pedidos
- [ ] `top3Clientes` ordenado do maior gasto pro menor

**Essa task junta TUDO: filter, reduce, sort, integração de dados.
Se você fizer essa sozinho, está pronto pro trabalho. Sério.**

---

## 🎤 RITUAL PÓS-TASK (não pula!)

Depois de cada task, fala em voz alta (português ou inglês — inglês vale
dobro pro seu plano de 12 meses):

```
"Hoje eu trabalhei na task de [X].
O problema era [Y].
Eu resolvi fazendo [Z].
Aprendi que [W]."
```

Isso é literalmente o que você vai falar nas dailies a partir de 01/08.

---

## 📊 TRACKING DO SPRINT

| Task | Tipo | Status | Branch criada? | PR aberto? |
|---|---|---|---|---|
| 1 - Paginação | Feature | ⬜ | ⬜ | ⬜ |
| 2 - Filtro status | Feature | ⬜ | ⬜ | ⬜ |
| 3 - Busca clientes | Feature | ⬜ | ⬜ | ⬜ |
| 4 - Bug faturamento | Bug | ⬜ | ⬜ | ⬜ |
| 5 - Bug 404 | Bug | ⬜ | ⬜ | ⬜ |
| 6 - Bug validação | Bug | ⬜ | ⬜ | ⬜ |
| 7 - Pedidos/cliente | Feature | ⬜ | ⬜ | ⬜ |
| 8 - Bug categoria | Bug | ⬜ | ⬜ | ⬜ |
| 9 - Estoque baixo | Feature | ⬜ | ⬜ | ⬜ |
| 10 - Dashboard | Feature | ⬜ | ⬜ | ⬜ |

**Meta:** Tasks 1-6 na semana de 22/07. Tasks 7-10 na semana seguinte.
Sobrou tempo? Refaz a Task 10 narrando em inglês (Think Out Loud).
