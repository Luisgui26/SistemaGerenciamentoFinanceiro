# Revisão para GitHub público e Vercel — 10/11/2026

Resultado: não foi encontrada credencial real nos arquivos candidatos a publicação, mas o projeto ainda tem pendências para deploy público na Vercel. Revisão local; nenhum repositório foi criado, nenhum deploy foi feito e o banco não foi alterado.

## Achados prioritários

1. **Build bloqueado sem API local — alto impacto no deploy.** Em `client/vite.config.ts`, `waitForApi` roda também durante `vite build`. `npm run build` falhou após esperar `127.0.0.1:3001` por 15 segundos. Executar essa espera somente no servidor de desenvolvimento; o build deve funcionar sem API e sem credenciais de banco.
2. **Integração de produção incompleta — alto impacto no deploy.** O proxy `/api` existe apenas no Vite de desenvolvimento. Não há configuração de publicação do monorepo que una frontend, backend e fallback da SPA. Definir a entrada Express reconhecida pela Vercel, o encaminhamento de `/api` e o fallback de navegação, preservando URLs e cookies no mesmo domínio. `server/src/app.ts` exporta `app` por nome e `server/src/index.ts` inicia o servidor local. A Vercel admite export default ou listener em entradas reconhecidas; o problema não é a existência de `listen`, mas a integração ainda ausente na raiz deste monorepo. Validar login, logout, sessão e acesso direto a rotas no deploy de teste.
3. **Rate limit em memória — risco de segurança na execução distribuída.** `server/src/auth.ts` habilita a limitação, mas não define armazenamento compartilhado. O padrão instalado do Better Auth é memória. Cada instância e reinício tem contadores próprios. Usar armazenamento compartilhado compatível ou proteção equivalente na plataforma e testar HTTP 429 entre instâncias. Se optar por armazenamento no banco, preparar e revisar a migração correspondente; mudar apenas a opção não cria a tabela.
4. **Dependências de desenvolvimento com alerta moderado.** `npm audit --json` retornou 7 pacotes afetados na cadeia `typescript-eslint` por um aviso de negação de serviço no `minimatch` (GHSA-g3hv-75wg-m249). São pacotes afetados pelo mesmo aviso, não sete falhas independentes. A auditoria de produção retornou zero. Corrigir a cadeia com versões compatíveis e repetir lint/typecheck; não aplicar `npm audit fix --force` automaticamente. A indicação de zero vulnerabilidades em `docs/verification.md` é histórica e não descreve esta auditoria.

## Cuidados antes da primeira publicação

- `.gitignore` já exclui `.env`, `.env.*` (com exceção de `.env.example`), `.local/`, `node_modules/`, `dist/`, logs e cobertura. O exemplo contém placeholders, não credenciais reais.
- Não há `.git` nesta pasta nem repositório pai reconhecido. Não foi possível auditar commits, arquivos já rastreados ou um remoto do GitHub. Depois de inicializar o Git, conferir a lista preparada para o primeiro commit e confirmar que `.env` e `.local` continuam excluídos. Arquivos ignorados não devem ser enviados manualmente nem adicionados com `git add -f`.
- A busca verificou 56 arquivos fora dos diretórios locais/dependências/build, procurando padrões comuns de tokens/chaves e cópias do segredo e das senhas de banco do `.env`. Só houve correspondência genérica nos placeholders de `.env.example`. É uma busca direcionada, não uma garantia de ausência de qualquer segredo possível.
- O README inclui identificadores internos de projeto e branch do banco e o nome da organização. Eles não são senhas nem concedem acesso, mas podem ser removidos da documentação pública por privacidade.
- Incluir `.vercel/` no ignore antes de usar a CLI e evitar publicar dumps, backups, certificados privados ou exportações de dados criados futuramente.

## Ambiente de produção

- Configurar segredos nas variáveis do servidor na Vercel, nunca em variáveis `VITE_`, no código ou no GitHub público. Usar segredo próprio de produção, `NODE_ENV=production`, URL pública HTTPS em `BETTER_AUTH_URL` e origens exatas em `CLIENT_ORIGINS`.
- Separar banco/credenciais de produção e preview. Não usar o banco da família em builds de contribuições externas. Conferir migrações e cadastro do administrador antes de abrir o acesso; a existência do schema de produção não foi consultada nesta revisão.
- As duas conexões locais têm `sslmode=verify-full`, e não foi encontrado código desabilitando a verificação TLS. O validador aceita URLs PostgreSQL sem exigir essa opção: manter TLS com verificação de certificado também na configuração de produção.
- Usar conexão com pool na API e conexão direta somente nas operações administrativas. Atualmente `server/src/lib/env.ts` exige a conexão direta até para iniciar a API; considerar separar a validação dos scripts para reduzir credenciais administrativas no runtime.
- Adaptar a gestão do `pg.Pool` ao ciclo de vida das Functions/Fluid Compute, conforme a orientação da Vercel. O pool atual é global e limitado a cinco conexões por instância, mas ainda não usa `attachDatabasePool`.
- Conferir os cabeçalhos de segurança do frontend no deploy. Os cabeçalhos atuais estão no Express e não se aplicam automaticamente aos arquivos estáticos da Vercel. Avaliar CSP, proteção contra enquadramento, Referrer-Policy e Permissions-Policy com o frontend real.

## Proteções verificadas

- Cadastro HTTP público desativado; não há conta/senha padrão no código.
- API exige sessão e associação familiar consultada no servidor. `family_id` enviado pelo navegador não concede acesso.
- Origens desconhecidas são rejeitadas; configuração de produção exige HTTPS nas URLs de autenticação e origens.
- Cookies seguros em produção configurados no Better Auth; cliente usa sessão por cookie, sem token de autenticação no localStorage.
- Erros HTTP não retornam detalhes do banco; health retorna somente `status: ok`.
- Migração SQL contém schema, sem inserts de dados pessoais.
- Movimentações atuais são demonstração em localStorage. Não usar dados financeiros reais: não há persistência financeira compartilhada, e as rotas financeiras respondem 501.

## Validação executada

| Verificação | Resultado |
| --- | --- |
| Typecheck dos dois workspaces | Passou |
| ESLint | Passou |
| Testes do cliente | 8 passaram |
| Testes da API | 6 passaram, incluindo teste principal e subtestes |
| Build completo | Falhou no frontend pela espera da API local; compilação do servidor passou |
| Auditoria npm completa | 7 pacotes com severidade moderada; zero alta/crítica |
| Auditoria npm sem dependências de desenvolvimento | Zero vulnerabilidades conhecidas |
| Histórico Git / arquivos já publicados | Indisponível: pasta sem repositório Git |
| Deploy e login na Vercel | Não executados |

Os testes HTTP da API precisaram ser repetidos fora do sandbox porque a conexão local foi bloqueada na primeira execução; passaram na repetição. Não foram executados scripts de migração, cadastro ou troca de senha.

## Referências

- [Express na Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Monorepos na Vercel](https://vercel.com/docs/monorepos)
- [Rate limit do Better Auth](https://better-auth.com/docs/concepts/rate-limit)
- [Aviso do minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249)
- [Pools de conexão em Vercel Functions](https://vercel.com/kb/guide/connection-pooling-with-functions)
