# 💼 Dev Daily Training — Simulação do Dia a Dia em Time

> Backend Node.js/Express com **10 tasks em formato Scrum** — features pra construir e bugs plantados pra caçar — simulando a rotina real de um desenvolvedor em time: branch, PR, validação, debugging e boas práticas.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tasks-10-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Bugs_Plantados-4-red?style=for-the-badge" />
</p>

---

## 🎯 Por que este projeto existe

Antes de começar meu primeiro trabalho em um **time de desenvolvimento**, criei este ambiente de treino pra praticar o que nenhum tutorial ensina: **o fluxo real de trabalho**.

Não é sobre aprender sintaxe — é sobre simular a rotina:

- Receber uma task com critérios de aceite e estimativa
- Criar branch, commitar com mensagem padrão, abrir PR
- Receber um **bug report escrito como chamado de usuário** ("Financeiro: o faturamento não bate") e ter que reproduzir, diagnosticar e corrigir
- Encontrar as pegadinhas que só aparecem em código de verdade

## 🗂️ Estrutura

```
├── src/
│   ├── server.js              # Servidor Express
│   ├── data/db.js             # "Banco" em memória (clientes, produtos, pedidos)
│   └── routes/
│       ├── pedidos.routes.js  # ⚠️ contém bugs plantados de propósito
│       ├── clientes.routes.js
│       └── produtos.routes.js
├── TASKS.md                   # 📋 As 10 tasks em formato de card Scrum
└── GABARITO.md                # 🔑 Soluções explicadas (só abrir depois de tentar!)
```

## 📋 As 10 Tasks

| # | Task | Tipo | O que treina |
|---|------|------|--------------|
| 1 | Paginação na listagem | Feature | `slice`, cálculo de skip, valores padrão |
| 2 | Filtro por status + paginação | Feature | Ordem das operações (filtrar → paginar) |
| 3 | Busca por nome | Feature | Case insensitive, busca parcial |
| 4 | 🐛 Faturamento errado | Bug | Análise de dados, comparar total × partes |
| 5 | 🐛 Servidor quebra com id inexistente | Bug | Guard clause, early return, 404 |
| 6 | 🐛 Cadastro sem validação | Bug | Validação campo a campo com mensagens claras |
| 7 | Pedidos por cliente | Feature | filter → map → reduce (o "JOIN" manual) |
| 8 | 🐛 Filtro de categoria vazio | Bug | Debug de comparação (case/espaço/tipo) |
| 9 | Alerta de estoque baixo | Feature | Ordem de rotas no Express, sort |
| 10 | Dashboard resumo | Feature | Agregações, objeto acumulador (GROUP BY em JS) |

## 🚀 Como rodar

```bash
# Instalar dependências
npm install express

# Subir o servidor
node src/server.js

# Testar
curl http://localhost:3000/health
```
Depois é abrir o **[TASKS.md](./TASKS.md)** e seguir as regras do jogo:

1. Cada task = uma branch nova (`git checkout -b feature/task-1-paginacao`)
2. Terminou = commit com mensagem padrão (`feat:` / `fix:`) + Pull Request
3. Travou por mais de 1h = consulta o **[GABARITO.md](./GABARITO.md)** (que explica o *porquê* de cada solução, não só o código)

## 🎓 As 6 lições que este sprint ensina

1. **Filtrar antes de paginar** — ordem das operações muda o resultado
2. **Todo `find` pode voltar vazio** — guard clause + 404 sempre
3. **Validação com mensagem específica** — "campo X inválido" > "erro"
4. **Bug de comparação = case, espaço ou tipo** — `console.log` dos dois lados resolve
5. **Rota fixa antes de rota dinâmica** — Express lê de cima pra baixo
6. **filter → map → reduce é o GROUP BY do JavaScript** — domina isso e dashboards viram rotina

## 🛠️ Stack

Node.js · Express · JavaScript

*Sem banco de dados de propósito — os dados vivem em memória pra manter o foco 100% na lógica e no fluxo de trabalho.*

---

<p align="center">
  <strong>Feito por <a href="https://github.com/pablo-cruzbr">Pablo Cruz</a> — treinando hoje o que vou entregar amanhã.</strong>
</p>
