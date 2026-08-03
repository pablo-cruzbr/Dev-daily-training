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
> yarn install
> yarn start
> # Testa: http://localhost:3000/health
> ```

---

## 🟢 SEMANA 1 — Tasks de entrada (o que dão pra junior no 1º mês)

---

### TASK 1 — Paginação na listagem de pedidos
**Prioridade:** Alta | **Estimativa:** 2h | **Arquivo:** `src/routes/pedidos.routes.ts`

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
- [x] Sem parâmetros → usa `page=1` e `limit=10` como padrão
- [x] `/pedidos?page=2&limit=10` retorna os pedidos 11 a 20
- [x] `/pedidos?page=99` retorna `data: []` (não quebra)
- [x] `totalPages` calculado com `Math.ceil(total / limit)`

**Dica:** a fórmula é `skip = (page - 1) * limit`, e em array puro é
`array.slice(skip, skip + limit)`.

**Por que paginação importa (e não é só "frescura de sistema grande"):**
sem ela, cada chamada em `/pedidos` devolve a tabela inteira — hoje são
40 pedidos, mas em produção podem ser 2 milhões. Isso pesa em três
lugares ao mesmo tempo: o **banco de dados** sofre pra buscar tudo de
uma vez, a **rede** trafega um payload gigante desnecessário, e o
**frontend** trava tentando renderizar uma lista enorme na tela (ninguém
rola 2 milhões de linhas mesmo). Paginação é uma das primeiras coisas
que todo backend real precisa ter — é praticamente checklist de
"vaga júnior pronta pra produção".

**Boas práticas que valem a pena guardar:**
- **Sempre ter um limite padrão** (aqui, `limit=10`) — nunca confiar que
  o cliente da API vai mandar o parâmetro certo.
- **Colocar um teto no `limit`** (ex: recusar ou truncar se alguém pedir
  `?limit=999999`) — senão a paginação vira decorativa, porque um cliente
  mal-intencionado ou descuidado pode pedir "tudo de uma vez" mesmo assim.
  Esse projeto não implementa esse teto de propósito — é um bom próximo
  passo pra você pensar depois de terminar as 10 tasks.
- **Devolver metadados** (`total`, `page`, `totalPages`) junto dos dados
  — sem isso o frontend não sabe se existe próxima página, nem consegue
  montar os botões de navegação.
- Esse modelo aqui (`page`/`limit`, chamado de **offset pagination**) é
  o mais simples de implementar, mas em tabelas gigantes e que mudam
  muito (feed de rede social, por exemplo) empresas costumam usar
  **cursor pagination** (baseada num "ponteiro" pro último item visto,
  não em número de página) — mais rápido em escala grande, mas mais
  complexo. Não precisa disso agora; é só pra você já ouvir o termo.

---

### TASK 2 — Filtro por status nos pedidos
**Prioridade:** Alta | **Estimativa:** 1h | **Arquivo:** `src/routes/pedidos.routes.ts`

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

**Por que filtro importa:** sem filtro no backend, o frontend precisaria
baixar TODOS os pedidos e filtrar na mão no navegador — desperdiça banda
e ainda deixa a "regra de negócio" (o que é um status válido, por
exemplo) espalhada em dois lugares em vez de um só. Filtro no backend é
o que permite o frontend pedir exatamente o que precisa.

**Boas práticas que valem a pena guardar:**
- **Combine filtro com paginação sempre na mesma ordem** (filtrar →
  contar → paginar) — é a fonte nº1 de bug de "número errado" em APIs
  com lista.
- Em banco de dados de verdade, colunas usadas em filtro frequente (como
  `status`) costumam ganhar um **índice** — sem índice, filtrar vira
  varrer a tabela inteira toda vez, o que fica lento conforme a tabela
  cresce.
- **Não confie cegamente no valor que vem da query.** Aqui um status
  inválido só devolve lista vazia (ok pra esse caso), mas em sistemas
  mais rígidos você valida contra uma lista fixa de valores permitidos
  antes de usar no filtro.

---

### TASK 3 — Busca de clientes por nome
**Prioridade:** Média | **Estimativa:** 1h | **Arquivo:** `src/routes/clientes.routes.ts`

**Como deve ficar:** `GET /clientes?busca=metal` retorna "Metalúrgica São José"
e "Indústria MetalFort".

**Critérios de aceite:**
- [ ] Busca parcial (pedaço do nome já encontra)
- [ ] Case insensitive ("METAL", "metal", "Metal" — tudo funciona)
- [ ] Sem o parâmetro → lista todos

**Dica:** `nome.toLowerCase().includes(busca.toLowerCase())`

**Por que busca importa:** é a diferença entre um usuário achar o que
precisa em 2 segundos ou desistir do sistema. Ninguém decora o nome
completo e exato de um cliente numa lista com centenas deles — busca
parcial e sem distinguir maiúscula/minúscula é o mínimo esperado hoje
em dia em qualquer sistema com lista de itens.

**Boas práticas que valem a pena guardar:**
- Em banco de dados de verdade, um `LIKE '%termo%'` (equivalente ao
  `includes` daqui) com `%` no início costuma **não usar índice** —
  fica lento em tabelas grandes. É por isso que sistemas de busca sérios
  usam ferramentas dedicadas (Elasticsearch, Postgres full-text search)
  em vez de `LIKE` puro.
- No frontend, busca "ao vivo" (a cada tecla digitada) normalmente usa
  **debounce** — espera a pessoa parar de digitar por ~300ms antes de
  chamar a API, senão cada letra digitada dispara uma requisição.
- Nunca monte a busca concatenando texto direto numa query SQL — isso é
  a porta de entrada clássica pra **SQL injection**. Sempre use
  parâmetros/placeholders da biblioteca do banco.

---

## 🟡 SEMANA 1 — Caça aos bugs (simulação de chamado/bug report)

> No trabalho real, você vai receber bugs reportados por usuários.
> Os 4 bugs abaixo JÁ EXISTEM no código. Sua missão: reproduzir,
> encontrar a causa, corrigir. Igual chamado de suporte.

---

### TASK 4 — 🐛 BUG: Faturamento errado no relatório
**Reportado por:** "Financeiro" | **Arquivo:** `src/routes/pedidos.routes.ts`

**O chamado diz:**
> "O faturamento total do relatório está maior do que deveria.
> Conferimos na planilha e o valor não bate. Podem verificar?"

**Sua missão:**
1. Abre `GET /pedidos/relatorio` e analisa o resultado
2. Descobre POR QUE o valor está inflado
3. Corrige (pedido cancelado não é faturamento!)
4. Commit: `fix: exclude cancelled orders from revenue report`

**Por que esse tipo de bug importa mais que os outros:** é dinheiro.
Bug visual o usuário reclama e você conserta com calma; bug de número
financeiro errado vira reunião com o financeiro, relatório incorreto
pro chefe, decisão de negócio tomada em cima de dado errado. Código que
mexe com dinheiro merece atenção redobrada, sempre.

**Boas práticas que valem a pena guardar:**
- **Todo total "geral" deveria ter um teste automatizado** cobrindo o
  caso de exclusão (aqui: cancelado não conta). Bug financeiro é
  exatamente o tipo de coisa que um teste simples pega antes de ir pro
  ar — e ninguém percebe até o financeiro reclamar, como no chamado.
  Ver [`CONCEITOS.md`](CONCEITOS.md) pra entender a lógica; testes
  automatizados ainda não fazem parte deste sprint, mas é o próximo
  passo natural.
- Ao mexer em cálculo financeiro, sempre **compare o total com a soma
  das partes** manualmente pelo menos uma vez — foi assim que este bug
  foi descrito no chamado.
- Números financeiros pedem cuidado extra com ponto flutuante (o bônus
  do `GABARITO.md` fala mais sobre isso) — considere centavos como
  inteiro em sistemas reais.

---

### TASK 5 — 🐛 BUG: Servidor quebra ao buscar pedido inexistente
**Reportado por:** "Time do frontend" | **Arquivo:** `src/routes/pedidos.routes.ts`

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

**Por que isso importa tanto:** um erro 500 não avisado é o pior tipo de
falha — ele não diz o que deu errado, assusta o usuário, e em produção
geralmente dispara alerta de monitoramento no meio da madrugada. Um 404
bem tratado, por outro lado, é informação: "não existe", ponto, o
frontend sabe exatamente o que fazer (mostrar "pedido não encontrado").

**Boas práticas que valem a pena guardar:**
- **Guard clause é hábito, não decoração.** Todo `find`/busca que pode
  não achar nada precisa dessa pergunta antes de usar o resultado —
  vira reflexo depois de um tempo.
- Times sérios têm um **formato padrão de erro** pra API inteira (ex:
  sempre `{ "erro": "mensagem" }`), pra o frontend não precisar tratar
  cada rota de um jeito diferente.
- Em produção, erros 500 de verdade (bugs que você não previu) devem
  aparecer em ferramentas de monitoramento (Sentry, Datadog...) — nunca
  devem vazar o stack trace inteiro pro usuário final, por segurança.

---

### TASK 6 — 🐛 BUG: Criação de pedido aceita dados inválidos
**Reportado por:** "Coordenador" | **Arquivo:** `src/routes/pedidos.routes.ts`

**O chamado diz:**
> "Apareceu um pedido com quantidade NEGATIVA e outro sem cliente
> no sistema. Precisamos de validação nesse cadastro urgente."

**Sua missão — validar no `POST /pedidos`:**
- [ ] `clienteId` obrigatório e precisa existir na lista de clientes
- [ ] `produtoId` obrigatório e precisa existir na lista de produtos
- [ ] `quantidadeKg` obrigatório, número, maior que zero
- [ ] Qualquer violação → `400` com mensagem clara de QUAL campo falhou
4. Commit: `fix: add validation to order creation`

**Por que validação importa:** todo dado que entra vindo de fora (POST,
formulário, upload, API de terceiro) é, por padrão, **não confiável** —
o cliente pode ter bug, o usuário pode digitar errado, ou alguém pode
estar tentando quebrar seu sistema de propósito. "Garbage in, garbage
out": se você deixa dado ruim entrar, ele contamina relatórios,
quebra outras rotas que assumem que o dado é válido, e vira dívida
técnica difícil de limpar depois.

**Boas práticas que valem a pena guardar:**
- **Valide na fronteira do sistema** (assim que o dado chega), não
  espalhado em vários lugares depois.
- **Nunca confie só na validação do frontend.** Frontend valida pra dar
  boa experiência (feedback rápido); backend valida pra proteger o
  sistema — são objetivos diferentes, e qualquer um pode chamar sua API
  direto, pulando o frontend.
- Em projetos reais, é comum usar bibliotecas de **schema validation**
  (Zod, Joi, Yup) em vez de escrever cada `if` na mão — elas centralizam
  a regra num único lugar declarativo e já geram mensagens de erro
  consistentes.
- Mensagem de erro específica por campo não é luxo — é o que permite o
  frontend (ou você, testando no Yaak) saber exatamente o que corrigir
  sem adivinhar.

---

### TASK 8 — 🐛 BUG: Filtro de categoria não retorna nada
**Reportado por:** "Vendas" | **Arquivo:** `src/routes/produtos.routes.ts`

**O chamado diz:**
> "O filtro de categoria parou de funcionar. /produtos?categoria=vigas
> deveria mostrar 2 produtos e mostra 0."

**Sua missão:** o bug é UMA palavra errada na linha do filter.
Acha, corrige, commita: `fix: category filter case comparison`

**Lição real:** bugs de produção raramente são complexos. São detalhes.

**Por que esse tipo de bug importa:** é o exemplo perfeito de que
"funciona no meu teste" não significa "está correto" — o código rodava
sem erro nenhum, só devolvia resultado errado silenciosamente. Bug
silencioso é mais perigoso que bug que quebra na hora, porque pode ficar
em produção por semanas sem ninguém perceber, até alguém (como o time
de Vendas aqui) notar que os números não fazem sentido.

**Boas práticas que valem a pena guardar:**
- Comparações de texto vindas de input externo quase sempre merecem
  **normalização** (mesma caixa, sem espaço nas pontas) dos dois lados,
  não só de um.
- Decida uma convenção pro seu banco de dados (ex: "categorias sempre em
  minúsculo") e documente isso — muita confusão desse tipo vem de não
  ter uma convenção clara desde o início.
- Um teste automatizado simples (`categoria=vigas` deveria devolver 2
  itens) teria pego esse bug antes de qualquer usuário perceber — é
  o tipo de caso que vale a pena cobrir com teste, exatamente por ser
  fácil de errar de novo no futuro.

---

## 🔵 SEMANA 2 — Tasks de construção (features do zero)

---

### TASK 7 — Pedidos por cliente (integração entre tabelas)
**Prioridade:** Alta | **Estimativa:** 2h | **Arquivo:** `src/routes/clientes.routes.ts`

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

**Por que isso importa:** quase todo dado interessante pra usuário final
vem de **combinar** informação de mais de um lugar — aqui é pedido +
cliente + produto; em qualquer sistema real é a mesma ideia (pedido +
usuário + endereço + pagamento...). Fazer essa combinação corretamente,
sem duplicar dado nem perder registro, é uma das habilidades mais usadas
no dia a dia de backend.

**Boas práticas que valem a pena guardar:**
- Faça essa agregação **no backend, não no frontend.** O frontend não
  deveria precisar buscar pedidos, depois buscar cada produto um por um,
  e juntar tudo na tela — é mais lento, mais requisições, e espalha
  lógica de negócio pro lado errado.
- Em bancos de dados de verdade (SQL), isso é literalmente um `JOIN` —
  o que você fez aqui com `filter` + `map` é a versão "na mão" da mesma
  ideia, usando arrays em memória em vez de tabelas.
- Cuidado com o problema clássico de performance chamado **N+1
  queries**: se cada pedido disparasse uma query separada pro banco pra
  buscar o produto (em vez de já ter os dados carregados, como aqui),
  100 pedidos virariam 101 queries. Ferramentas de ORM (Prisma,
  TypeORM) têm formas de evitar isso (`include`, `join`, `eager
  loading`) — vale pesquisar quando for trabalhar com banco real.

---

### TASK 9 — Alerta de estoque baixo
**Prioridade:** Média | **Estimativa:** 1h30 | **Arquivo:** `src/routes/produtos.routes.ts`

**Criar rota nova:** `GET /produtos/estoque-baixo?limiteKg=5000`

**Critérios de aceite:**
- [ ] Retorna produtos com `estoqueKg` abaixo do limite
- [ ] Sem parâmetro → usa 5000 como padrão
- [ ] Ordenado do MENOR estoque pro maior (mais crítico primeiro)
- [ ] Cada item mostra também quantos kg faltam pro limite

**⚠️ Pegadinha de rota:** essa rota precisa ser declarada ANTES de
qualquer rota `/:id` no arquivo — senão o Express acha que
"estoque-baixo" é um id! (Esse erro acontece MUITO em time real.)

**Por que essa task importa:** é um alerta operacional — o time de
compras/estoque precisa saber ANTES do produto acabar, não depois. Uma
rota assim, bem simples, evita prejuízo real (venda perdida por falta de
material, cliente insatisfeito). É um bom exemplo de como uma feature
pequena de backend pode ter impacto direto no negócio.

**Boas práticas que valem a pena guardar:**
- **Ordem de rotas em Express (e frameworks parecidos) importa.** É uma
  fonte de bug tão comum que vale revisar toda vez que você adiciona uma
  rota nova num arquivo que já tem `/:algumParametro`.
- Alertas baseados em "limite configurável" (aqui, `limiteKg`) são mais
  flexíveis que valor fixo no código — o time de negócio muda de ideia
  sobre o que é "estoque baixo" com frequência, e não deveria precisar
  de um deploy pra isso.
- Em sistemas reais, esse tipo de alerta às vezes vira uma
  **notificação automática** (email, Slack) rodando em um job agendado,
  em vez de esperar alguém abrir a tela pra descobrir.

---

### TASK 10 — Dashboard resumo (a task "integradora")
**Prioridade:** Alta | **Estimativa:** 3h | **Arquivo:** criar `src/routes/dashboard.routes.ts`

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
- [ ] Registrar a rota nova no `server.ts` (você nunca fez isso aqui — descubra como)
- [ ] Faturamento exclui cancelados (de novo ela!)
- [ ] `produtoMaisVendido` calculado pela SOMA de kg em todos os pedidos
- [ ] `top3Clientes` ordenado do maior gasto pro menor

**Essa task junta TUDO: filter, reduce, sort, integração de dados.
Se você fizer essa sozinho, está pronto pro trabalho. Sério.**

**Por que essa task importa:** um endpoint único de "resumo" é o padrão
chamado **BFF** (*Backend For Frontend*) — em vez do frontend fazer 5
chamadas separadas (pedidos, clientes, produtos...) e juntar tudo na
tela, o backend já entrega pronto o formato exato que a tela precisa.
Menos requisições, menos lógica duplicada no frontend, resposta mais
rápida pro usuário.

**Boas práticas que valem a pena guardar:**
- Endpoints de "resumo"/dashboard tendem a ficar **caros de calcular**
  conforme os dados crescem (aqui é só um loop em 40 pedidos; imagine
  isso rodando a cada request com 2 milhões de linhas). Em sistemas
  reais, esse tipo de agregação costuma ser **pré-calculada** (job
  agendado, tabela de cache, "materialized view" no banco) em vez de
  recalculada do zero a cada chamada.
- Manter o **formato de resposta estável** importa mais aqui do que em
  qualquer outra rota — várias partes da tela do frontend dependem
  exatamente dessa estrutura; mudar um nome de campo sem avisar quebra
  a tela de quem consome.
- Registrar a rota nova no `server.ts` é um passo fácil de esquecer — e
  é exatamente o tipo de erro bobo que checklist de PR/code review
  existe pra pegar antes de ir pra produção.

---

## 🟣 SEMANA 3-4 — Rumo a Pleno (menos passo a passo, mais decisão sua)

> As 10 primeiras tasks tinham critério de aceite bem fechado — quase
> sempre existia UMA resposta certa. A partir daqui isso muda de
> propósito: as tasks pedem menos "implemente X exatamente assim" e mais
> "o sistema precisa disso, decida como". É exatamente essa mudança —
> de "executar bem uma instrução clara" pra "tomar decisão técnica com
> ambiguidade" — que separa júnior de pleno (ver
> [`SALARIO.md`](SALARIO.md#níveis-de-senioridade-júnior--pleno--sênior)).
>
> **Por isso, de propósito, não existe gabarito completo pra essas 10.**
> Tem dica de bibliotecas e de conceito, mas a decisão de como estruturar
> é sua. Errar aqui, sozinho, e depois pesquisar o "jeito certo" é
> literalmente o exercício.

---

### TASK 11 — Middleware de erro centralizado
**Prioridade:** Alta | **Estimativa:** 1h30 | **Arquivo:** `src/server.ts`, novo `src/middleware/errorHandler.ts`

**O problema:** hoje, se uma rota lançar um erro que ninguém previu, o
Express devolve aquela página HTML feia de stack trace (você viu isso
testando a Task 5 antes de corrigir). Isso nunca deveria chegar assim
num cliente de API.

**O que fazer:** criar um middleware de erro (Express reconhece pela
assinatura `(err, req, res, next)` — 4 parâmetros) que captura qualquer
erro não tratado e devolve sempre `{ "erro": "mensagem" }` com status
500, registrado por último no `server.ts`.

**Critérios de aceite:**
- [ ] Erro não tratado em qualquer rota cai no middleware, não na tela padrão do Express
- [ ] Resposta sempre no formato `{ "erro": "..." }`, nunca HTML
- [ ] Middleware registrado DEPOIS de todas as rotas (ordem importa, de novo)

**Dica:** pesquise "Express error handling middleware" — a assinatura de
4 parâmetros é o que faz o Express tratar como error handler.

**Por que importa:** um erro tratado de forma consistente em toda a API
é a diferença entre um cliente da API conseguir reagir a falhas de
verdade (ex: mostrar "algo deu errado, tenta de novo") ou travar
mostrando lixo pro usuário.

---

### TASK 12 — Camada de serviço (separar regra de negócio da rota)
**Prioridade:** Média | **Estimativa:** 2h | **Arquivo:** novo `src/services/pedidos.service.ts`

**O problema:** hoje toda a lógica (validar, calcular, filtrar) vive
dentro da função da rota, misturada com `req`/`res`. Isso funciona com
10 rotas; fica insustentável com 100.

**O que fazer:** extrair a lógica de `pedidos.routes.ts` pra funções
puras em `pedidos.service.ts` (ex: `listarPaginado(page, limit)`,
`buscarPorId(id)`, `criar(dados)`) que não sabem nada de Express — só
recebem dados e devolvem dados. A rota vira só "traduzir HTTP pra
chamada de função e devolver resultado".

**Critérios de aceite:**
- [ ] Nenhuma função em `pedidos.service.ts` recebe `req` ou `res`
- [ ] As rotas em `pedidos.routes.ts` ficam com poucas linhas cada, só orquestrando
- [ ] Todos os testes manuais no Yaak continuam passando depois do refactor

**Por que importa:** essa separação (rota fina, service com a regra) é
o que permite testar a lógica de negócio SEM precisar simular uma
requisição HTTP inteira, e é o que permite reusar a mesma lógica em
outro contexto (ex: um job agendado que roda sem passar por rota
nenhuma). É um dos refactors mais comuns que pleno propõe em PR de
júnior.

---

### TASK 13 — Configuração via variável de ambiente
**Prioridade:** Média | **Estimativa:** 45min | **Arquivo:** `src/server.ts`, novo `.env`

**O problema:** a porta `3000` está hardcoded no `server.ts`. Em
produção, geralmente quem decide a porta é o ambiente (Docker, servidor
de deploy), não o código.

**O que fazer:** instalar `dotenv`, criar um `.env` (com `PORT=3000`) e
um `.env.example` (commitado, sem valor sensível — só documenta quais
variáveis existem), e ler a porta de `process.env.PORT` com fallback.

**Critérios de aceite:**
- [ ] `.env` está no `.gitignore` (nunca commita segredo)
- [ ] `.env.example` está commitado, documentando as variáveis esperadas
- [ ] Servidor lê `PORT` do ambiente, com `3000` como padrão se não vier

**Por que importa:** toda configuração que muda entre ambientes
(dev/staging/produção) — porta, URL de banco, chave de API — deveria
vir de variável de ambiente, nunca hardcoded. É assim que o MESMO
código roda em ambientes diferentes sem precisar mudar uma linha.

---

### TASK 14 — Logging estruturado
**Prioridade:** Média | **Estimativa:** 1h | **Arquivo:** `src/server.ts` e rotas

**O problema:** hoje o único log é o `console.log` de startup. Em
produção, `console.log` sozinho não escala — não tem nível (info vs
erro), não tem timestamp estruturado, não é fácil de filtrar.

**O que fazer:** instalar um logger simples (`pino` é leve e rápido) e
substituir os `console.log`/`console.error` por chamadas ao logger, com
pelo menos um log de nível `info` por requisição (método + rota) e
`error` quando o error handler da Task 11 for acionado.

**Critérios de aceite:**
- [ ] Logger configurado e usado no lugar de `console.log`
- [ ] Toda requisição gera pelo menos um log de nível `info`
- [ ] Todo erro capturado pelo error handler gera log de nível `error`

**Por que importa:** quando algo dá errado em produção às 3h da manhã,
log estruturado (com nível, timestamp, contexto) é o que permite
investigar sem precisar reproduzir o bug ao vivo. `console.log` espalhado
não segura um sistema em produção por muito tempo.

---

### TASK 15 — Segurança básica de API
**Prioridade:** Alta | **Estimativa:** 1h | **Arquivo:** `src/server.ts`

**O problema:** a API não tem nenhuma proteção básica hoje — sem
headers de segurança, sem CORS configurado (qualquer site poderia
chamar sua API do navegador de um usuário), sem limite de requisições.

**O que fazer:** instalar e configurar `helmet` (headers de segurança
padrão) e `cors` (definir quem pode chamar a API). Bônus: um rate
limiter simples (`express-rate-limit`) pra evitar abuso.

**Critérios de aceite:**
- [ ] `helmet` aplicado globalmente
- [ ] `cors` configurado (decida: liberar geral pra este projeto de treino, ou restringir — documente sua escolha)
- [ ] Pesquisou o que `express-rate-limit` faz, mesmo que não implemente

**Por que importa:** essas três coisas (headers seguros, CORS, rate
limit) são praticamente checklist mínimo de qualquer API exposta na
internet — não são "extra", são o básico esperado antes de qualquer
sistema ir pro ar.

---

### TASK 16 — Testes automatizados
**Prioridade:** Alta | **Estimativa:** 2h30 | **Arquivo:** novo `src/routes/pedidos.routes.test.ts`

**O problema:** até agora, "testar" significou abrir o Yaak e clicar.
Isso não escala — ninguém revalida as 10 tasks anteriores na mão toda
vez que muda uma linha de código.

**O que fazer:** instalar `jest`, `ts-jest`/`@types/jest` e `supertest`,
e escrever testes automatizados cobrindo pelo menos: paginação (Task
1), o bug do 404 (Task 5, pra ele nunca voltar) e o bug do faturamento
(Task 4, pelo mesmo motivo).

**Critérios de aceite:**
- [ ] `yarn test` roda os testes de verdade (troca o script placeholder do `package.json`)
- [ ] Pelo menos 3 testes cobrindo os 3 cenários acima
- [ ] Um teste falha de propósito (comente a correção da Task 5) pra você confirmar que o teste realmente pegaria a regressão

**Por que importa:** teste automatizado é o que permite mexer no código
com confiança meses depois, sem lembrar de todos os detalhes manuais.
Bug que já foi corrigido uma vez e "voltou" (regressão) é uma das coisas
mais frustrantes de debugar — teste automatizado existe pra isso nunca
acontecer.

---

### TASK 17 — Persistência real (sair do array em memória)
**Prioridade:** Alta | **Estimativa:** 3h | **Arquivo:** novo `src/data/`, todo o projeto

**O problema:** todo dado hoje vive em array na memória — reinicia o
servidor, perde tudo. Nenhum sistema real funciona assim.

**O que fazer:** migrar pelo menos a tabela de `pedidos` pra um banco
de verdade. `SQLite` (via `better-sqlite3` ou `Prisma`) é a opção mais
simples pra treinar sem precisar instalar um banco separado na máquina.
Decida você: ORM (Prisma, mais guiado) ou driver direto (mais manual,
mais entendimento do SQL por baixo).

**Critérios de aceite:**
- [ ] Pedidos sobrevivem a um restart do servidor
- [ ] `GET /pedidos` com paginação continua funcionando (agora com `LIMIT`/`OFFSET` de SQL de verdade, se for esse o caminho)
- [ ] Decisão de ORM vs driver direto documentada em 2-3 frases no PR

**Por que importa:** é o salto mais "real" de todo esse sprint extra —
todo o resto até aqui foi lógica em memória; a partir daqui você lida
com os problemas de verdade de banco de dados (schema, migração,
queries, índices) que vão aparecer todo santo dia no trabalho.

---

### TASK 18 — Autenticação simples em rotas de escrita
**Prioridade:** Alta | **Estimativa:** 2h | **Arquivo:** novo `src/middleware/auth.ts`

**O problema:** hoje qualquer pessoa pode chamar `POST /pedidos` sem se
identificar. Nenhum ERP de verdade permite isso.

**O que fazer:** criar uma rota `POST /login` (bem simples — pode ser
usuário/senha fixos por enquanto) que devolve um JWT (`jsonwebtoken`),
e um middleware que exige esse token (`Authorization: Bearer ...`) nas
rotas de escrita (`POST /pedidos`), devolvendo `401` sem token válido.

**Critérios de aceite:**
- [ ] `POST /login` devolve um token válido para credenciais corretas
- [ ] `POST /pedidos` sem token → `401`
- [ ] `POST /pedidos` com token válido → funciona normalmente
- [ ] Segredo do JWT vem de variável de ambiente (lição da Task 13!)

**Por que importa:** autenticação é o que separa "qualquer um pode
alterar dados" de "só quem deveria pode alterar dados". Entender o fluxo
básico de token (login → recebe token → manda token em cada chamada
seguinte) é pré-requisito pra praticamente qualquer sistema com usuário.

---

### TASK 19 — Documentação da API (OpenAPI/Swagger)
**Prioridade:** Média | **Estimativa:** 2h | **Arquivo:** novo `src/docs/`, `server.ts`

**O problema:** hoje a única documentação da API é o `API.md` escrito
à mão — funciona pra você, mas não é um formato que ferramentas (Yaak,
Postman, frontend gerando client automático) conseguem ler.

**O que fazer:** instalar `swagger-jsdoc` + `swagger-ui-express`,
documentar pelo menos as rotas de `pedidos` com anotações OpenAPI, e
servir a documentação interativa em `/docs`.

**Critérios de aceite:**
- [ ] `/docs` abre uma interface Swagger navegável no navegador
- [ ] Pelo menos as rotas de `pedidos` documentadas (parâmetros, respostas, status possíveis)
- [ ] Alguém que nunca viu o projeto consegue entender o que a API faz só olhando `/docs`

**Por que importa:** documentação que fica desatualizada rápido (como
texto solto) é pior que não ter nenhuma. Documentação gerada a partir de
anotações no próprio código tende a ficar mais perto da realidade, e
ferramentas conseguem importar isso automaticamente pra testar.

---

### TASK 20 — A task ambígua (o teste de pleno de verdade)
**Prioridade:** Alta | **Estimativa:** aberta | **Arquivo:** sua decisão

**O pedido do "coordenador", literalmente como chegaria numa reunião:**
> "Precisamos conseguir tirar um relatório dos pedidos pra mandar pro
> financeiro. Dá pra fazer isso?"

Só isso. De propósito, não tem formato de resposta, nem critério de
aceite pronto, nem arquivo indicado.

**O que fazer:**
1. Antes de codar, escreva (não precisa mandar pra ninguém, é treino)
   as perguntas que você faria de verdade nessa reunião: formato do
   relatório (CSV? PDF? JSON pra outro sistema ler?), período (todo
   histórico? por mês?), quem vai consumir isso (humano abrindo Excel?
   outro sistema automatizado?), com que frequência.
2. Baseado nas respostas que você mesmo imaginaria (seja realista, pense
   como o "Financeiro" dos chamados anteriores pensaria), decida um
   escopo razoável — não precisa resolver todos os casos possíveis, só
   o caso mais provável.
3. Implemente, documente sua decisão (por que esse formato, o que ficou
   de fora de propósito) em um arquivo curto (`docs/decisao-task-20.md`
   ou similar — isso é o começo de um **ADR**, *Architecture Decision
   Record*, prática comum em times de verdade).
4. Escreva os critérios de aceite QUE VOCÊ MESMO definiu, e valide seu
   próprio código contra eles.

**Por que essa task é a mais importante do sprint inteiro:** tudo até
aqui teve resposta certa esperando por você. No trabalho real, boa parte
dos pedidos chega exatamente assim — vago, incompleto, dito de passagem
numa reunião. Pleno não é "sabe mais sintaxe" — é **saber transformar um
pedido vago em escopo concreto sozinho**, e comunicar a decisão de um
jeito que outra pessoa entenda o porquê. Se você conseguir fazer essa
task fazendo boas perguntas (mesmo que só pra você mesmo) antes de
codar, você já está operando como pleno nesse aspecto específico —
mesmo que ainda esteja aprendendo sintaxe nas outras tasks.

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
