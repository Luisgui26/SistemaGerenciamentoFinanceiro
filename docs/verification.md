# Verificação do setup — 29/10/2026

Ambiente: Windows, Node.js 22.21.0, TypeScript 5.9.3. Dependências instaladas com npm; versões exatas no lockfile.

A instalação limpa com `npm ci` e a verificação Prettier também passaram. A auditoria completa `npm audit` informou **zero vulnerabilidades conhecidas** após corrigir o esbuild transitivo do Drizzle Kit por um override limitado a `@esbuild-kit/core-utils` e repetir build, geração e testes com o novo lockfile.

Banco: `neondb`, PostgreSQL 18, projeto `SistemaGerenciamentoFinanceiro`, branch isolada `dev-setup-financas`. A migração inicial foi gerada pelo Drizzle Kit e aplicada pelo migrator Drizzle usando conexão direta. As sete tabelas foram confirmadas pelo MCP Neon, além do registro de migrações. `production` não recebeu migrações nem dados.

| Verificação                                                  | Resultado                                                  |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| Instalação das dependências                                  | Passou                                                     |
| Conexão PostgreSQL com TLS e verificação de certificado      | Passou                                                     |
| Geração e aplicação da migração                              | Passou                                                     |
| Nova geração sem mudanças no schema                          | Passou                                                     |
| Typecheck dos dois workspaces                                | Passou                                                     |
| ESLint                                                       | Passou                                                     |
| Build do frontend e backend                                  | Passou                                                     |
| Testes automatizados da API                                  | 6 testes passaram                                          |
| Health HTTP                                                  | 200, somente `status: ok`                                  |
| Better Auth `/ok` e sessão anônima                           | 200; sessão nula                                           |
| CORS de origem desconhecida                                  | 403                                                        |
| Rotas privadas sem sessão e tentativa de injetar `family_id` | 401                                                        |
| Cadastro HTTP público                                        | Bloqueado                                                  |
| Inicialização conjunta com `npm run dev`                     | Passou                                                     |
| HTML, módulo Vite e proxy `/api` via porta 5173              | Passou                                                     |
| Inspeção visual em navegador desktop/celular                 | Não executada: serviço de acesso ao navegador indisponível |

Foi executado um smoke test adicional, limitado por hostname à branch de desenvolvimento e exigindo banco sem família real. Ele cadastrou primeiro administrador e segundo familiar, testou senha incorreta, login, cookie HttpOnly, leitura de sessão, associação familiar derivada do servidor, resposta 501 das rotas futuras, perda de acesso após revogar associação, logout e invalidação da sessão. Todos passaram.

A integridade monetária também foi exercitada: `0.10` retornou como string exata e a transação foi revertida; valores zero, negativos e `NaN` foram rejeitados. Ao terminar, usuários, sessões, contas e família temporários foram removidos. Foi confirmado que `user`, `transactions` e `families` ficaram vazias. Nenhuma credencial padrão ou conta fictícia permanece no banco.

O smoke test local fica em `.local/auth-smoke.ts`, ignorado pelo Git e limitado à branch criada neste setup. Não deve ser apontado para um banco com dados reais. `npm test` cobre verificações sem criar usuários.

O build apresentou um aviso de tamanho do bundle JavaScript (aproximadamente 512 kB antes de gzip); isso não impede a execução. Divisão de carregamento pode ser avaliada na etapa de frontend, conforme as telas crescerem.

Pendência operacional: cadastrar o administrador real com `npm run user:add`. O setup não solicita nem inventa sua senha pessoal. Deploy, CRUD financeiro e recuperação de acesso não fazem parte desta etapa.
