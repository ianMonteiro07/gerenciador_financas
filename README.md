# Gerenciador de Finanças Pessoais

Este é um protótipo funcional de um sistema gerenciador de finanças focado em controle de gastos e orçamentos, desenvolvido em Vanilla Stack (HTML5, CSS3, JavaScript), sem uso de frameworks externos.

## Como Executar

O sistema não necessita de um servidor (Node.js/Apache) para testes básicos. A persistência é feita via `localStorage` diretamente no navegador.

1. Extraia/Baixe os arquivos.
2. Certifique-se de que `index.html`, `style.css` e `script.js` estão na mesma pasta.
3. Dê um duplo clique no arquivo `index.html` ou arraste-o para o seu navegador web moderno (Chrome, Firefox, Edge, Safari).

## Credenciais de Teste (Usuários em Memória)

Para validar a regra de **Role-Based Access Control (RBAC)**, faça login com uma das credenciais abaixo:

### 1. Administrador
Possui controle total. Pode criar categorias, alterar limites e excluir/editar qualquer transação.
* **Login:** `admin`
* **Senha:** `123`

### 2. Usuário Comum
Acesso restrito. Pode visualizar o dashboard com os limites, além de adicionar e editar as *suas próprias* transações. O botão de deletar gastos e as opções de gerenciar/criar limites de categoria ficam invisíveis.
* **Login:** `user`
* **Senha:** `123`

## Funcionalidades e Requisitos Atendidos

* **Persistência de Dados**: Feita localmente (LocalStorage) garantindo que atualizar a aba (F5) ou reabrir o site preserve os dados criados.
* **Controle de Acesso Hierárquico**: Regras e UI adaptáveis baseadas no cargo de quem faz o login.
* **Interface Moderna**: Layout flexível baseado em CSS Grid e Flexbox, design baseado em *cards*, bordas com `border-radius` e tipografia limpa.
* **Dashboard Visual**: Barra de progresso interativa e lógica nos cards de Categoria (Verde, Amarelo e Vermelho se estourar o limite).
* **CRUD Completo**: Create, Read, Update, Delete aplicados em Transações e Categorias (para admins). Feedback de ações realizado via `alert()`.