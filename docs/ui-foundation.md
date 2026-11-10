# Direção das páginas de teste

Escopo definido pelo anexo: login, dashboard provisório e 404; sem design final, gráficos ou formulários financeiros.

Referência de implementação: `refero-design/references/craft-details.md`, seções Focus States e Forms, disponível na skill Refero do ambiente. Esta etapa usa as recomendações de formulário e acessibilidade, sem estabelecer identidade visual final.

| Decisão                                           | Fonte                        | Aplicação                                                 |
| ------------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| Formulário simples e conteúdo provisório          | Anexo, seção 8               | Uma coluna, sem componentes avançados                     |
| Labels, email e autocomplete sem bloquear colagem | Refero, Forms                | Campos reconhecidos por leitores e gerenciadores de senha |
| Foco visível por teclado                          | Refero, Focus States         | `focus-visible` em campos, botões e links                 |
| Estados de espera e erro                          | Objetivo funcional do anexo  | Status acessível e botão bloqueado durante envio          |
| Fonte do sistema, fundo claro, bordas discretas   | Restrição de página de teste | Tokens básicos Tailwind, sem identidade visual definitiva |

Validar 375px e desktop, foco, leitura de erros e envio por Enter. O alvo desta etapa é um fluxo legível e funcional; pesquisa visual de estilos e telas fica para a etapa de design final.
