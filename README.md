Sistema de Gestão de Exames Microbiológicos - TCC

Este projeto é um sistema completo para gerenciamento de pacientes e realização de exames microbiológicos (Urina e Escarro), desenvolvido como Trabalho de Conclusão de Curso.

O sistema permite o cadastro de pacientes, realização de exames com fluxos específicos (wizard), cálculo automático de risco e histórico detalhado.

🚀 Tecnologias Utilizadas

Frontend: React Native (Expo)

Backend: Node.js (Express)

Banco de Dados: PostgreSQL

Autenticação: JWT (JSON Web Token)

🛠️ Pré-requisitos

Certifique-se de ter instalado em sua máquina:

Node.js (LTS): https://nodejs.org/

PostgreSQL: https://www.postgresql.org/download/

Expo Go (Opcional): App para testar no celular.

📦 Instalação e Configuração

1. Banco de Dados (PostgreSQL)

Crie um banco de dados chamado tcc_analise_sistemas.

Configure o arquivo .env na pasta do backend com suas credenciais.

2. Backend (API)

Navegue até a pasta do backend:

cd tcc-backend-api


Instale as dependências:

npm install


Crie o arquivo .env na raiz do backend com o seguinte conteúdo:

DB_USER="postgres"
DB_DATABASE="tcc_analise_sistemas"
DB_PASSWORD="SUA_SENHA_AQUI"
DB_PORT=5432
DB_HOST="localhost"
API_PORT=3001
JWT_SECRET="projeto_desenvolvimento_web"


Inicialize o Banco de Dados:
Execute os scripts na ordem para criar as tabelas e ajustar as colunas:

node setupDb.js
node setupExames.js
node createUser.js  # Cria o usuário teste@tcc.com / 123456


Inicie o Servidor:

npm start


O servidor rodará em http://localhost:3001.

3. Frontend (App Mobile)

Abra um novo terminal e navegue até a pasta do frontend:

cd projetoDesenvolvimentoWebFRONT


Instale as dependências:

npm install


Configure o IP da API:

Se for rodar no Navegador (PC): Mantenha http://localhost:3001/api nos arquivos.

Se for rodar no Emulador Android: Altere para http://10.0.2.2:3001/api.

Se for rodar no Celular Físico: Altere para o IPv4 da sua máquina (ex: http://192.168.1.5:3001/api).

Arquivos para ajustar: src/pages/login.js, src/pages/Pacientes.js, src/pages/RealizarExame.js, src/pages/HistoricoAvaliacoes.js, src/pages/Home.js.

Inicie o App:

npx expo start --clear


Pressione w para abrir no navegador ou leia o QR Code com o celular.

📱 Funcionalidades Principais

1. Autenticação

Login seguro com JWT.

Logout funcional.

2. Gestão de Pacientes

Listagem: Visualização rápida com resumo.

Cadastro: Formulário completo com cálculo automático da idade.

Edição: Atualização de dados cadastrais.

Exclusão: Remoção de paciente e todo seu histórico.

3. Realização de Exames (Microbiologia)

Fluxo Guiado (Wizard):

Seleção de Material (Urina ou Escarro).

Preenchimento de dados da Amostra.

Campos específicos (CLED para Urina, Ziehl-Neelsen para Escarro).

Gram e Bioquímica (Campos dinâmicos baseados no resultado do Gram).

Laudo Final: Campo de texto para conclusão.

Status: Salva como "Pendente" se incompleto ou "Concluído" se finalizado.

4. Histórico e Estatísticas

Histórico Geral: Visão de todos os exames realizados.

Histórico por Paciente: Filtro específico na ficha do paciente.

Edição de Exame: Permite continuar um exame pendente ou corrigir um laudo.

Dashboard: Contadores de pacientes e exames na Home.

🧪 Usuário de Teste

Email: teste@tcc.com

Senha: 123456

📝 Notas Adicionais

A lógica de Data Science (Regressão Logística e Estatísticas) foi desenvolvida externamente em Python/Colab e os resultados constam na documentação oficial do projeto.

O sistema foi projetado para ser responsivo e funcionar tanto em dispositivos móveis quanto na web.
