# Diários FF

Chat estilo WhatsApp focado em grupos e comunidades de Free Fire.

## Como rodar o projeto (passo a passo)

### 1. Clone o repositório
```bash
git clone https://github.com/kauan315/diarios-ff.git
cd diarios-ff
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Rode o projeto
```bash
npm run dev
```

### 4. Abra no navegador
Acesse: [http://localhost:3000](http://localhost:3000)

---

## O que tem no app

- Tela de entrada com nickname
- **Conversas** → chat estilo WhatsApp
- **Comunidades FF** → tela separada para descobrir e cadastrar diários
- Criar grupos / diários
- Entrar e sair de grupos
- Controle "somente admins podem enviar mensagens"
- Funciona no celular e no computador

## Deploy no Render (Web Service)

1. Crie um **Web Service** (não Static Site)
2. Conecte o repositório `kauan315/diarios-ff`
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Clique em Deploy

---

Feito com Next.js + Tailwind CSS
