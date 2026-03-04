
# POP doces - Delivery de docerias

Projeto FullStack em Mobile e Desktop sobre um app de delivery de docerias.

## 👩‍💻 Desenvolvedoras
[Geovanna Toso](https://github.com/geovannatoso)

[Joicy Santos](https://github.com/Joicy-SantosP)

[Laura Dias](https://github.com/L-diaaas)

[Victoria Rubio](https://github.com/vicrubiovic)

## 🗃️ Backend

Está é uma API RESTfull para gerenciamento do app, implementada em Python com framework Flask, utilizando o SQLAlchemy para persistência de dados.

### 🛠️ Funcionalidades

- ✅ CRUD completo (criação, listagem, atualização e remoção) de usuários
- ✅ Padrão MVC (Model-View-Controller) com rotas separadas por entidade
- ✅ Banco de dados SQLite para persistência local

### Passos para rodar localmente

- Clone o repositório


        git clone https://github.com/Joicy-SantosP/Pop---App-de-comida.git

        cd Pop---App-de-comida

        cd backend

- Crie o ambiente virtual

        python -m venv venv

        source venv/bin/activate    #Linux/Mac

        venv\Scripts\activate       #Windows

- Instale as dependências

       pip install -r requirements.txt

- Execute a aplicação

        python app.py

### Endpoints principais

- A aplicação estará disponível em:

        http://localhost:5000

- ####  Usuários: 
  Se refere aos usuários do aplicativo.

                http://localhost:5000/usuarios


    - `GET /usuarios` – Listar todos
    - `POST /usuarios` – Criar novo
    - `GET /usuarios/<id>` – Buscar por ID
    - `PUT /usuarios/<id>` – Atualizar
    - `DELETE /usuarios/<id>` – Remover

- ####  Login: 
    - `POST /usuarios/login/request` – Enviar email para recebimento do token
    - `POST /usuarios/login/verify` – Verificação de token

## ⌨️ Frontend

Aplicação Front-End em React integrada a uma API para gerenciamento e usuabilidade do app de delivery.

### Como Rodar o Projeto Localmente

- Acesse a pasta do projeto

```bash
cd frontend
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

### 5. Acesse no navegador

```
http://localhost:5173
```

## 🔧 Próximas implementações:
    - CRUD completo (criação, listagem, atualização e remoção) de produtos, lojas
    - Documentação interativa via Swagger UI
    - Validação de Email e Telefone
    - Formas de Pagamento online
