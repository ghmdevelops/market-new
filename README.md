# Lista de Mercado

PWA de lista de compras: adicione produtos por categoria, registre o preço no mercado, acompanhe o total em tempo real (com orçamento), e compare gastos entre compras e meses. React + Vite + Tailwind CSS v4 + Firebase Realtime Database.

## Rodando localmente

```bash
cp .env.example .env   # preencha com as chaves do seu projeto Firebase
npm install
npm run dev
```

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento (sem service worker) |
| `npm run build` | build de produção em `dist/` com PWA (manifest + `sw.js`) |
| `npm run preview` | serve o `dist/` para testar o PWA |
| `npm run icons` | regenera ícones e a imagem de compartilhamento (`public/*.png`) — só Windows |

## Firebase

1. Crie um Realtime Database no console e copie a URL exata para `VITE_FIREBASE_DATABASE_URL`.
2. Regras para uso pessoal/estudo (sem autenticação):

```json
{ "rules": { ".read": true, ".write": true } }
```

> Isso deixa o banco aberto a quem tiver a URL. Para uso real, adicione Firebase Auth e restrinja por `auth.uid`.

### Estrutura dos dados

```
users/{apelido}/products/{id}    { name, category, createdAt }
users/{apelido}/purchases/{id}   { startedAt, finishedAt|null, market|null, budget|null,
                                   items: { [productId]: { name, category, price, qty, checked, checkedAt } } }
```

### Apelido (identificação sem cadastro)

Ao abrir o app pela primeira vez a pessoa escolhe um **apelido** (3–20 caracteres: letras minúsculas, números, `_`, `-`). Ele fica salvo no aparelho (`localStorage`) e define a pasta `users/<apelido>/` onde todos os dados dela ficam. Não existe senha, e-mail ou recuperação.

> **Adendo — leia antes de usar**
>
> - O apelido é a **única chave** dos dados. Quem esquecer ou digitar diferente (ex.: `casa-da-ana` vs `casa-ana`) entra em uma lista vazia e **não há como recuperar** a anterior.
> - Qualquer pessoa que souber o apelido consegue **ver e editar** a lista. Não use nomes óbvios; não é um mecanismo de segurança.
> - Para usar o mesmo apelido em outro aparelho, basta digitá-lo lá — os dados são os mesmos (é também o jeito de compartilhar a lista com alguém da casa).
> - Dados criados antes desse recurso (na raiz `/products` e `/purchases`) são detectados na tela de entrada e podem ser movidos para o apelido escolhido com um clique. Isso acontece uma vez só.
>
> Se um dia precisar de algo mais robusto, o caminho é Firebase Auth (login Google) com regras `users/$uid` restritas a `auth.uid`.

## Deploy no Netlify

O `netlify.toml` já define build (`npm run build`), pasta `dist`, redirect de SPA, cache dos assets e headers de segurança.

1. Suba o repositório no GitHub/GitLab e em **Netlify → Add new site → Import an existing project** escolha o repo.
2. Em **Site configuration → Environment variables** adicione as variáveis do `.env.example` **exceto** `VITE_SITE_URL` (o Netlify já expõe `URL` no build e as meta tags de SEO usam ela).
3. Deploy. Cada push na branch principal gera um novo deploy; PRs geram deploy previews.

Depois do primeiro deploy, valide:

- **PWA**: DevTools → Application → Manifest / Service Workers, ou Lighthouse.
- **Compartilhamento**: cole a URL em [opengraph.xyz](https://www.opengraph.xyz) ou no WhatsApp — deve aparecer a imagem `og-image.png` com título e descrição.

## Estrutura do projeto

```
public/            ícones PWA, og-image.png, favicon.svg, robots.txt
scripts/           make-icons.ps1 (gera os PNGs com .NET, sem dependências)
src/
  App.jsx          abas Lista / Histórico / Dashboard, botão Instalar, tema
  ui.js            classes Tailwind compartilhadas (claro/escuro)
  categories.js    categorias na ordem do mercado
  hooks/           useProducts, usePurchases, useTheme, usePWA
  components/      ProductForm, ShoppingList, PriceModal, FinishModal, History, Dashboard, PWAStatus
netlify.toml       build, redirects e headers
vite.config.js     React + Tailwind + VitePWA + injeção de %SITE_URL% no index.html
```
