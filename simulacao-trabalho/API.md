# Como rodar e testar a API

## Rodar o servidor

```
yarn start
```

(ou `node src/server.js` diretamente). Sobe em `http://localhost:3000`.

## Testar no Yaak

1. Abra o Yaak e crie um Workspace (ou use um existente).
2. Crie uma Request para cada rota abaixo, usando `http://localhost:3000` como base.
3. Dica: crie uma variável de ambiente `base_url = http://localhost:3000` no Yaak e use `{{ base_url }}/pedidos` nas requests, assim fica fácil trocar de ambiente depois.

## Rotas disponíveis

| Método | Rota | Observação |
|---|---|---|
| GET | `/health` | healthcheck |
| GET | `/pedidos` | lista pedidos |
| GET | `/pedidos/relatorio` | tem o bug do faturamento (TASK 4) |
| GET | `/pedidos/:id` | ex: `/pedidos/999` quebra com 500 (TASK 5, bug proposital) |
| POST | `/pedidos` | sem validação (TASK 6, bug proposital) |
| GET | `/clientes` | lista clientes |
| GET | `/clientes/:id/pedidos` | ainda não implementada (501 — TASK 7) |
| GET | `/produtos` | filtro `?categoria=vigas` com bug (TASK 8) |
| GET | `/produtos/estoque-baixo` | não existe ainda (TASK 9) |

### Exemplo de body para POST /pedidos

Na aba **Body** do Yaak, selecione `JSON`:

```json
{
  "clienteId": 1,
  "produtoId": 2,
  "quantidadeKg": 100
}
```
