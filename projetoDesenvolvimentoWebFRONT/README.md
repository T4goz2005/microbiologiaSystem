 # 📋 Projeto Integrador - Desenvolvimento De aplicativos

Este projeto foi desenvolvido em **React Native** utilizando **React Navigation** para gerenciamento de rotas.  
O objetivo é criar uma aplicação para gestão de **modelos de avaliação de pacientes**, permitindo cadastrar, editar e excluir avaliações de diferentes especialidades médicas.

---

## 🚀 Tecnologias Utilizadas (Ate o momento)

- [React Native](https://reactnative.dev/)  
- [React Navigation](https://reactnavigation.org/)  
- [Expo](https://expo.dev/)  
- [Axios](https://axios-http.com/) (para integração futura com backend)  
- [Vector Icons (Expo)](https://icons.expo.fyi/)  

---

## 📱 Funcionalidades

- Listagem de **modelos pré-prontos de avaliações** (Cardiovascular, Neurológica e Respiratória).  
- Exibição de **informações detalhadas** de cada modelo (nome, descrição, quantidade de questões, última modificação, status).  
- Ações disponíveis em cada modelo:
  - ⚙️ **Configurar**
  - ✏️ **Editar**
  - 🗑️ **Excluir**
- Tela de cadastro de novos pacientes.  
- Modal de edição (para atualizar nome e data do paciente).  

---

## 📂 Estrutura de Pastas

```bash
.
├── src
│   ├── components       # Componentes reutilizáveis
│   ├── screens          # Telas principais do app
│   ├── routes           # Configuração das rotas (React Navigation)
│   ├── services         # Integração futura com backend (API)
│   └── assets           # Ícones e imagens
├── App.js               # Arquivo principal
└── README.md            # Documentação do projeto
