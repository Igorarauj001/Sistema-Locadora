#  Backend Locadora – Sistema de Gestão de Locações

Este projeto implementa o backend de uma locadora utilizando Node.js, Express e PostgreSQL.  
O sistema foi desenvolvido com foco em operações de CRUD, utilização de procedures e funções no banco de dados e ativação automática de triggers.

---

##  Tecnologias Utilizadas

| Tecnologia | Finalidade |
|------------|------------|
| **Node.js** | Ambiente de execução |
| **Express.js** | Criação da API REST |
| **PostgreSQL** | Banco de dados relacional |
| **pg** | Driver para conexão com o PostgreSQL |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **nodemon** | Atualização automática durante o desenvolvimento |

---

##  Arquitetura do Projeto

backend-locadora/
├─ src/
│ ├─ app.js # inicializa o servidor
│ ├─ db.js # conexão com o banco
│ ├─ routes/ # definição das rotas
│ ├─ controllers/ # lógica das requisições
│ ├─ services/ # consultas SQL
├─ .env # credenciais do banco
├─ package.json
└─ README.md

Configuração do Banco de Dados

O arquivo .env contém os dados de acesso:

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=*****
DB_NAME=locadora_db


O banco utilizado contém triggers, procedures e funções que são acionados automaticamente quando o backend executa operações SQL.

Como Executar o Projeto
1) Instalar dependências:
npm install

2) Executar servidor:
npm run dev

3) Testar a API no navegador 

Servidor padrão:

http://localhost:3001

Endpoints Disponíveis

A API implementa CRUD completo para Clientes e Locações, além de dois endpoints especiais que fazem uso da função e da procedure do banco.

CLIENTES
Método	Rota	Descrição
GET	/clientes	Lista todos os clientes
GET	/clientes/:id	Retorna cliente pelo ID
POST	/clientes	Cadastra novo cliente
PUT	/clientes/:id	Atualiza cliente existente
DELETE	/clientes/:id	Remove cliente

Exemplo JSON (POST)
{
  "nome": "João Silva",
  "cpf": "11122233344",
  "telefone": "83988889999",
  "email": "joao@email.com",
  "endereco": "Rua Central, 100"
}

LOCAÇÕES
Método	Rota	Descrição
GET	/locacoes	Lista todas as locações
GET	/locacoes/:id	Retorna locação pelo ID
POST	/locacoes	Cria uma nova locação
PUT	/locacoes/:id	Atualiza uma locação
DELETE	/locacoes/:id	Remove uma locação

Exemplo JSON (POST)
{
  "id_cliente": 1,
  "data_locacao": "2025-01-01",
  "data_prevista": "2025-01-10"
}

ENDPOINT ESPECIAL — CHAMA FUNÇÃO SQL
Método	Rota
GET	/locacoes/:id/total

Objetivo: invoca a função fn_calcular_total(id_locacao) no PostgreSQL.

Retorno:

{
  "total": 250.00
}

ENDPOINT ESPECIAL — CHAMA PROCEDURE SQL
Método	Rota
POST	/locacoes/:id/parcelas

Body esperado:

{
  "parcelas": 3
}

A procedure prc_gerar_parcelas irá:

✔ dividir o valor da locação
✔ criar as parcelas
✔ inserir os registros automaticamente

Retorno:

{
  "msg": "Parcelas geradas"
}

Integração com Triggers

As operações do backend não calculam multa, nem alteram status manualmente.

Essas regras são executadas no banco através de triggers já existentes.

Exemplos:

✔ Ao devolver equipamento → trigger calcula multa
✔ Ao remover locação → trigger impede se houver parcelas pendentes

Nada precisa ser programado no backend — ele apenas executa SQL e o banco aplica as regras.

Conclusão

O backend atende a todos os requisitos da fase proposta:

✔ CRUD de duas entidades (Cliente e Locação)
✔ Integração real com banco PostgreSQL
✔ Chamada a função e procedure criadas pelo grupo
✔ Triggers ativados automaticamente
✔ Separação de responsabilidades (arquitetura limpa)
✔ Variáveis de ambiente corretamente configuradas