# 🍩 Pop! — Marketplace de Doces e Delivery

Projeto acadêmico full-stack que simula um marketplace de delivery focado em confeitarias e doces (referenciado internamente no código como **Pop Doces**). A plataforma conecta clientes a múltiplas lojas, permitindo navegar pelo catálogo, montar um carrinho, pagar via Pix/Mercado Pago, acompanhar o pedido em tempo real (preparo → pronto → em trânsito → entregue) e retirar no balcão com senha, além de oferecer um painel de relatórios para análise de vendas.

> Repositório: [Joicy-SantosP/Pop---App-de-comida](https://github.com/Joicy-SantosP/Pop---App-de-comida)

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Como executar o projeto](#como-executar-o-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Principais endpoints da API](#principais-endpoints-da-api)
- [Modelo de dados](#modelo-de-dados-resumo)
- [Pontos de atenção](#pontos-de-atenção-para-evolução)
- [Autoria](#autoria)

## Sobre o projeto

O Pop! foi desenvolvido como trabalho acadêmico para colocar em prática conceitos de desenvolvimento full-stack: modelagem de banco de dados relacional, autenticação, integração com APIs externas (geolocalização, CEP e pagamentos), consumo de webhooks e construção de uma interface React reativa. O fluxo simula, de ponta a ponta, a experiência de um app de delivery: cadastro/login, escolha da loja e dos produtos, cálculo de frete por distância real, pagamento e acompanhamento da entrega ou retirada.

## Funcionalidades

**Usuários**
- Cadastro com verificação em duas etapas (código de 6 dígitos por e-mail e por telefone, com expiração)
- Login *passwordless*: o usuário recebe um código por e-mail e troca por um token JWT
- Login social com Google e Facebook (OAuth2), com cadastro complementar para quem ainda não tem conta
- Edição e exclusão de perfil

**Restaurantes (lojas)**
- Cadastro com geocodificação automática do endereço (latitude/longitude via Nominatim/OpenStreetMap)
- Verificação de e-mail por código
- Listagem, busca por ID e perfil completo (loja + produtos)

**Produtos**
- CRUD completo, com categorias (`preparado`, `industrializado`, `combo`)
- Ativação/inativação de itens e busca por nome

**Carrinho e pedidos**
- Carrinho vinculado a usuário + restaurante (não permite misturar produtos de lojas diferentes)
- Adição, atualização e remoção de itens com recálculo automático do total
- Expiração de carrinhos abandonados
- Finalização com validação de estoque e de preço atualizado
- Simulação do ciclo de vida do pedido (em preparação, pronto, em trânsito/próximo, entregue), com geração de senha de retirada ou código de confirmação de entrega

**Endereços**
- Busca de CEP via ViaCEP
- Geocodificação e geocodificação reversa (coordenadas ↔ endereço)
- Múltiplos endereços por usuário, com endereço principal e exclusão lógica

**Pagamentos**
- Integração com Mercado Pago: Checkout Pro (cartão) e Pix via API de Orders, com QR Code
- Cálculo de taxa de entrega proporcional à distância real (fórmula de Haversine)
- Webhook para confirmação automática de pagamento
- Geração de nota fiscal em PDF, enviada por e-mail ao cliente
- Rota de simulação de aprovação de pagamento para testes em ambiente acadêmico

**Entrega e entregadores**
- Cadastro e login de entregadores com verificação por e-mail e JWT
- Despacho de pedidos para um entregador disponível
- Confirmação de entrega por código de verificação
- Painel de senhas para retirada no balcão, com atualização em tempo real

**Relatórios (dashboard administrativo)**
- Faturamento mensal por restaurante
- Produtos mais vendidos por loja
- Distribuição de pedidos/entregas por cidade e bairro
- Indicadores gerais: total de pedidos, ticket médio, total de entregas, restaurantes ativos

## Tecnologias utilizadas

**Backend**

| Tecnologia | Uso |
|---|---|
| Python + Flask | API REST |
| Flask-SQLAlchemy | ORM / modelagem do banco |
| Flask-JWT-Extended | Autenticação via token JWT |
| Flask-Mail / smtplib | Envio de e-mails (códigos e notas fiscais) |
| Flask-CORS | Liberação de CORS para o frontend |
| SQLite (padrão local) / MySQL (via Docker) | Banco de dados |
| geopy (Nominatim) | Geocodificação de endereços |
| ViaCEP (requests) | Consulta de CEP |
| mercadopago (SDK) | Checkout e Pix |
| fpdf | Geração de nota fiscal em PDF |
| google-auth | Validação de login com Google |
| python-dotenv | Variáveis de ambiente |

**Frontend**

| Tecnologia | Uso |
|---|---|
| React 19 | Interface |
| Vite 7 | Build e dev server |
| react-leaflet + Leaflet | Mapas (rastreamento/endereço) |
| react-toastify | Notificações |
| qrcode.react | QR Code do Pix |
| ESLint | Padronização de código |

## Estrutura de pastas

```
Pop---App-de-comida/
├── backend/
│   ├── app.py                  # ponto de entrada da API Flask
│   ├── config.py               # configuração do Flask, banco e e-mail
│   ├── requirements.txt
│   ├── dockerfile / docker-compose.yml
│   ├── usuarios/                # cadastro, login, autenticação social
│   ├── restaurantes/            # lojas e geolocalização
│   ├── produtos/                # catálogo
│   ├── pedidos/                 # carrinho e ciclo de vida do pedido
│   ├── endereco/                # CEP e geocodificação
│   ├── pagamento/                # Mercado Pago, Pix, nota fiscal
│   ├── entrega/                  # despacho e confirmação de entrega
│   ├── entregadores/             # cadastro e login de entregadores
│   └── relatorio/                # dashboard e indicadores
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── App.jsx              # tela principal (home, catálogo, checkout)
        ├── main.jsx
        ├── assets/              # imagens e ilustrações
        └── pages/
            ├── AreaLogada.jsx
            ├── ModalAcompanharEntrega.jsx
            ├── ModalAjuda.jsx
            ├── ModalConfirmacaoRetirada.jsx
            ├── ModalEnderecos.jsx
            ├── ModalPainelSenhas.jsx
            ├── ModalPix.jsx
            ├── PerfilUsuario.jsx
            └── Relatorio.jsx
```

## Pré-requisitos

- Python 3.9 ou superior
- Node.js 18 ou superior e npm
- Conta de e-mail com acesso SMTP (para envio dos códigos de verificação e notas fiscais)
- Conta no Mercado Pago com Access Token de teste (para checkout/Pix) — opcional para apenas explorar a interface
- Credenciais OAuth do Google e/ou Facebook — opcional, somente necessário para testar o login social

## Como executar o projeto

### 1. Backend (Flask)

```bash
cd backend

# crie e ative um ambiente virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/macOS

# instale as dependências
pip install -r requirements.txt
```

Crie um arquivo `.env` dentro de `backend/` com as variáveis descritas em [Variáveis de ambiente](#variáveis-de-ambiente).

```bash
python app.py
```

A API sobe em `http://localhost:5000` (porta definida em `config.py`) e cria automaticamente as tabelas no banco SQLite (`app.db`) na primeira execução.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:5173` e já está configurada para consumir a API em `http://localhost:5000`.

### 3. Alternativa via Docker (apenas backend)

O projeto inclui um `docker-compose.yml` que sobe a API junto com um banco MySQL:

```bash
cd backend
docker-compose up --build
```

> ⚠️ **Atenção:** atualmente `config.py` aponta fixamente para `sqlite:///app.db`, então o container da API não usa o MySQL do `docker-compose.yml` por padrão. Para que a stack Docker funcione com MySQL, é necessário ajustar `SQLALCHEMY_DATABASE_URI` para ler a variável de ambiente `DATABASE_URL` definida no `docker-compose.yml`.

## Variáveis de ambiente

Arquivo `backend/.env`:

```env
# E-mail (envio de códigos de verificação e notas fiscais)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_de_app

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_de_teste

# Login social com Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Login social com Facebook
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

## Principais endpoints da API

| Recurso | Rota base | Exemplos |
|---|---|---|
| Usuários | `/usuarios` | `POST /usuarios` (cadastro), `POST /usuarios/login/request`, `POST /usuarios/login/verify` |
| Login social | `/auth` | `GET /auth/google`, `GET /auth/facebook`, `POST /auth/cadastro-complementar` |
| Restaurantes | `/restaurantes` | `POST /restaurantes`, `GET /restaurantes`, `GET /restaurantes/<id>/perfil` |
| Produtos | `/produtos` | `POST /produtos/`, `GET /produtos/buscar?nome=` |
| Endereços | `/enderecos` | `GET /enderecos/cep/<cep>`, `POST /enderecos/`, `GET /enderecos/buscar-sugestoes` |
| Pedidos | `/pedidos` | `POST /pedidos`, `POST /pedidos/<id>/itens`, `GET /pedidos/<id>/status` |
| Pagamentos | `/pagamentos` | `POST /pagamentos/checkout`, `POST /pagamentos/pix`, `POST /webhooks/mercadopago` |
| Entrega | `/pedido`, `/entregador` | `POST /pedido/<id>/despachar`, `PATCH /pedido/<id>/confirmar-entrega` |
| Entregadores | `/entregadores` | `POST /entregadores/`, `POST /entregadores/login/request` |
| Relatórios | `/api/relatorio` | `GET /api/relatorio/dashboard`, `GET /api/relatorio/dashboard/resumo` |

> A lista completa de rotas está nos arquivos `*_route.py` de cada módulo dentro de `backend/`.

## Modelo de dados (resumo)

- **Usuario**: dados pessoais, tokens de verificação (e-mail/telefone/login) e vínculo opcional com login social.
- **Restaurantes**: dados da loja, coordenadas geográficas e relação 1:N com **Produto**.
- **Produto**: pertence a um restaurante; tem categoria, preço e status (ativo/inativo).
- **Pedido** e **ItemPedido**: representam o carrinho/pedido de um usuário em um restaurante; controlam status, tipo de retirada (entrega/balcão) e total.
- **Pagamento**: vinculado 1:1 a um pedido; guarda subtotal, taxa de entrega, total final e status da transação no Mercado Pago.
- **Endereco**: endereços do usuário, com coordenadas e flag de endereço principal.
- **Entregador** e **Entrega**: cadastro do entregador e registro de cada entrega despachada (origem, destino, status, conclusão).
- **SocialAuth**: vincula um `Usuario` a um provedor externo (Google/Facebook).

## Autoria

Desenvolvido por [Geovanna Toso](https://github.com/geovannatoso), [Joicy Santos](https://github.com/Joicy-SantosP), [Laura Dias](https://github.com/L-diaaas) e [Victoria Alejandra](https://github.com/vicrubiovic) como projeto acadêmico.
