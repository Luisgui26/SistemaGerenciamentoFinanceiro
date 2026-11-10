# Finanças da família

Aplicação pessoal para uma única família, com contas individuais e um painel de demonstração interativo. O acesso usa autenticação real; as movimentações, totais e gráficos apresentados no painel são fictícios e ficam somente no navegador. O armazenamento compartilhado de receitas e despesas reais ainda será implementado.

## Modo demonstração

Após entrar com sua conta, o painel inicia com receitas e despesas fictícias de seis meses. Você pode trocar o mês, buscar e filtrar movimentações, adicionar ou excluir exemplos e observar os totais e gráficos mudarem.

O menu separa **Visão geral**, **Análise de gastos**, **Comparar meses** e **Movimentações**. Energia e Condomínio estão disponíveis como categorias de gastos. Exemplos antigos de conta de luz são associados a Energia; para carregar o exemplo de condomínio, use **Restaurar exemplos**, lembrando que isso substitui os exemplos atuais.

Em **Comparar meses**, escolha o primeiro e o segundo mês e selecione **Gastos**, **Receitas** ou **Saldo**. Os dois valores aparecem lado a lado, acompanhados de uma frase explicando o que mudou no segundo mês. Para uma análise específica, abra **Ver quais gastos mudaram** (ou receitas): escolha uma categoria ou busque por um nome, como supermercado ou aluguel. A busca e a escolha da categoria não alteram o resumo dos meses. Meses sem registros são identificados e os percentuais não são calculados quando a base é zero.

Os exemplos e as alterações são guardados no armazenamento local do navegador, separados por usuário e sem envio ao Neon. Eles não são compartilhados entre familiares ou dispositivos. Use somente informações fictícias; esse armazenamento não é destinado a dados financeiros reais. A opção **Apagar exemplos** remove todas as movimentações de demonstração desse navegador, sem afetar usuários ou banco. **Restaurar exemplos** recria os dados iniciais e, quando houver dados no painel, pede confirmação antes de substituí-los.

Limpar dados do navegador também remove a demonstração; no próximo acesso os exemplos iniciais serão carregados novamente. Se o armazenamento estiver indisponível, o painel informa que os exemplos serão temporários. A API financeira continua preparada com respostas 501 até a implementação do CRUD real.

## Stack e estrutura

Node.js 22.12+ (validado com 22.21), npm workspaces, React, Vite, TypeScript, Tailwind CSS 4, React Router, Express 5, Zod 4, Better Auth, Drizzle ORM/Kit e PostgreSQL no Neon. As versões resolvidas estão no `package-lock.json`; use `npm ci` nas próximas instalações.

```text
client/
  src/
    components/       # Proteção de navegação
    pages/            # Login, demonstração do dashboard e 404
    hooks/            # Consulta à API
    services/         # Cliente HTTP centralizado
    lib/              # Cliente Better Auth
    App.tsx
    main.tsx
server/
  src/
    db/               # Conexão e schema Drizzle
    lib/              # Ambiente e provisionamento local
    middleware/       # Sessão, vínculo familiar e erros
    routes/           # Rotas privadas preparadas
    scripts/          # Migração, conexão e cadastro administrativo
    auth.ts
    app.ts
    index.ts
  drizzle/            # SQL e snapshots versionados
.env.example
package.json
```

## Instalação e configuração

```sh
npm install
```

Copie `.env.example` para `.env` na raiz se ele ainda não existir. Neste ambiente, o arquivo local já foi configurado com as credenciais da branch de desenvolvimento. Nunca envie esse arquivo ao Git ou ao frontend.

| Variável                | Uso                                                |
| ----------------------- | -------------------------------------------------- |
| `DATABASE_URL`          | Conexão PostgreSQL com pool para a API             |
| `DATABASE_URL_UNPOOLED` | Conexão direta para migrações                      |
| `BETTER_AUTH_SECRET`    | Segredo aleatório de pelo menos 32 caracteres      |
| `BETTER_AUTH_URL`       | URL pública da API; local: `http://localhost:3001` |
| `CLIENT_ORIGINS`        | Origens exatas permitidas, separadas por vírgula   |
| `PORT`                  | Porta da API, padrão 3001                          |
| `NODE_ENV`              | `development`, `test` ou `production`              |

Gere um segredo próprio ao configurar outro ambiente:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Use `sslmode=verify-full` nas conexões Neon para verificar o certificado TLS. Não use `rejectUnauthorized: false`. O processo da API valida as variáveis antes de iniciar e informa apenas os nomes inválidos.

## Neon e migrações

Projeto autorizado: **SistemaGerenciamentoFinanceiro** (`proud-cloud-62173764`), organização **ProjetosLuis**, plano **free**, região São Paulo (`aws-sa-east-1`), PostgreSQL 18.

Branch deste setup: **dev-setup-financas** (`br-restless-thunder-b6tyq4u0`), filha de `production`. As migrações são aplicadas somente à branch de desenvolvimento. A branch `production` não recebe alterações de schema ou dados neste setup. O compute da nova branch está limitado a 0,25 CU, com política de suspensão padrão da conta.

Banco utilizado: `neondb`. O `package.json` contém um override limitado ao esbuild transitivo de `@esbuild-kit/core-utils`, usado pelo Drizzle Kit, para corrigir o aviso GHSA-67mh-4wv8-2f99 sem rebaixar o Drizzle Kit.

```sh
npm run db:check
npm run db:generate
npm run db:migrate
```

Edite `server/src/db/schema.ts`, gere uma migração, revise o SQL e aplique. SQL e snapshots em `server/drizzle` devem ser versionados juntos. A migração inicial já está preparada. A geração não exige credenciais; a aplicação lê a conexão direta do `.env`. Teste mudanças futuras em uma branch isolada antes de aplicá-las em produção. Não use `drizzle-kit push` ou SQL administrativo avulso para alterar o schema.

Tabelas: `user`, `session`, `account`, `verification` (Better Auth); `families`, `family_members`, `transactions` (aplicação). O Drizzle mantém seu registro de migrações no schema `drizzle`.

IDs de usuário são texto, compatíveis com Better Auth; IDs de família e movimentação são UUID. `amount` é `numeric(12,2)` e chega pelo ORM como string: mantenha valores como strings decimais nas futuras validações e respostas. Nunca converta valores monetários para `Number` para realizar cálculos. O banco exige valor positivo, tipo válido e autoria vinculada à mesma família, com índice por família/data. O setup impõe uma única família e um vínculo familiar por usuário; remova essas restrições por migração se houver expansão futura. `updated_at` é atualizado por escritas feitas pelo Drizzle via `$onUpdate`; futuras escritas SQL diretas deverão atualizá-lo explicitamente.

## Primeiro administrador e familiares

Após aplicar as migrações, execute em um terminal interativo confiável:

```sh
npm run user:add
```

Informe nome, email, senha pessoal (12 a 128 caracteres), confirmação, nome da família e papel. A senha é digitada com máscara, nunca em argumentos de shell, e é processada por `hashPassword` do Better Auth. O comando cria usuário, conta e associação em uma transação com trava para evitar corridas entre cadastros. O primeiro usuário cria a família e sempre é administrador. Nas execuções seguintes, o nome da família existente é preservado e o familiar recebe o papel selecionado. Não há usuário nem senha padrão.

O cadastro HTTP está desativado por `disableSignUp`. Apenas quem tem acesso operacional ao servidor e ao banco pode executar o comando. Ter papel `admin` na aplicação não concede acesso ao terminal. Esta fase não inclui convites, troca/recuperação de senha, verificação de email ou remoção de familiares. Cadastre somente emails cuja titularidade você confirmou e entregue a senha por um canal privado; não registre senhas em documentação. Para recuperar acesso nesta fase, o operador deve preparar um procedimento controlado usando as APIs oficiais do Better Auth.

Para alinhar a senha de uma conta já existente somente no banco local de desenvolvimento, execute `npm run user:password`. O comando pede confirmação do banco e senha mascarada, e bloqueia ambientes diferentes de `development`.

## Desenvolvimento

```sh
npm run dev
```

Abra **http://localhost:5173** ou **http://127.0.0.1:5173**. A API fica em `http://127.0.0.1:3001`. O Vite encaminha `/api` à API, incluindo cookies; segredos não são expostos como variáveis `VITE_`.

O servidor Vite escuta somente em loopback. Para testar em um celular pela rede local, configure explicitamente o host do Vite e use uma origem correspondente em `CLIENT_ORIGINS` e `BETTER_AUTH_URL`; prefira HTTPS. Não exponha o servidor de desenvolvimento publicamente.

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run format:check
```

Para iniciar a API compilada: `npm run start -w server`. O frontend compilado fica em `client/dist`. Em um deploy futuro, hospede o frontend e encaminhe `/api` ao Express no mesmo domínio, com HTTPS, `NODE_ENV=production`, segredo próprio e origens exatas. Configure fallback de navegação da SPA para `index.html`. `vite preview` serve apenas para pré-visualização local; ele não substitui esse proxy de produção.

## API e segurança

| Rota                                 | Comportamento atual                                             |
| ------------------------------------ | --------------------------------------------------------------- |
| `GET /api/health`                    | `{ "status": "ok" }`, sem informações internas                  |
| `/api/auth/*`                        | Better Auth: login, sessão e logout; cadastro público bloqueado |
| `GET /api/me`                        | Nome, papel e vínculo familiar da sessão autenticada            |
| `GET/POST /api/transactions`         | Protegida; 501 nesta etapa                                      |
| `PATCH/DELETE /api/transactions/:id` | Protegida; 501 nesta etapa                                      |
| `GET /api/dashboard`                 | Protegida; 501 nesta etapa                                      |

Todas as futuras rotas financeiras devem permanecer após `requireFamily` e usar `res.locals.identity.familyId` e `userId`, derivados da sessão e da associação no banco. Um `family_id` enviado pelo navegador nunca comprova autorização. A proteção React melhora a navegação; a autorização efetiva é feita no servidor.

As sessões usam cookies gerenciados pelo Better Auth (HttpOnly, Secure em produção), sem tokens no localStorage. A autenticação tem rate limit em memória, adequado a uma única instância inicial; reiniciar a API reinicia os contadores. Escalar para múltiplas instâncias exigirá rever esse armazenamento. O health verifica o processo HTTP; `db:check` verifica o banco separadamente. Respostas de erro não incluem detalhes do banco nem credenciais. CORS aceita somente as origens configuradas.

## Próximos passos

1. Cadastrar o administrador real e os familiares.
2. Implementar o CRUD com Zod, valores decimais em string, filtros e autorização por família em cada consulta.
3. Implementar os totais e o dashboard sem cálculos financeiros em ponto flutuante.
4. Definir hospedagem, recuperação de acesso e rotina de backup/restauração antes de colocar dados reais em produção.

Referências consultadas: [Express com Better Auth](https://better-auth.com/docs/integrations/express), [adaptador Drizzle](https://better-auth.com/docs/adapters/drizzle), [schema de autenticação](https://better-auth.com/docs/concepts/database) e [migrações Drizzle](https://orm.drizzle.team/docs/migrations).
