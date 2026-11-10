# Refinamento visual — outubro de 2026

Alvo: evoluir o painel existente aprovado pelo usuário, preservando fundo claro e tons de verde. Prioridade: entender valores, período e próxima ação sem esforço. Refero continua como método de pesquisa; a conta não possui acesso ao catálogo online, portanto são utilizadas as referências locais de cor, tipografia e formulários já consultadas. A skill ui-ux-pro-max foi explicitamente solicitada como apoio de implementação.

Pesquisa local verificada: `Friendly SaaS` recomenda Plus Jakarta Sans para dashboards legíveis e acolhedores; `Financial Dashboard` recomenda valores monetários consistentes e legendas; Navigation/Breadcrumbs desaconselha breadcrumbs em interfaces com um nível. O resultado inicial de design-system trouxe padrão de marketing corporativo inadequado; foi descartado e refinado com consultas explícitas de produto e estilo. Sugestões de modo escuro, azul corporativo e glassmorphism foram rejeitadas por conflitarem com o pedido.

Referência fixada: painel atual, com hierarquia mais clara e tipografia Plus Jakarta Sans auto-hospedada. Preservar superfícies brancas, verde como ação principal/saldo, acentos suaves exclusivos dos gráficos e tabela sem ornamentação. Elevar texto secundário para contraste adequado, reduzir metadados repetidos e manter controles identificados no celular. Ícones SVG consistentes substituem símbolos decorativos tipográficos.

| Decisão                             | Fonte                                                 | Aplicação                                              |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Fonte única Plus Jakarta Sans       | ui-ux-pro-max: Friendly SaaS                          | Pesos 400–700, números tabulares nos valores           |
| Verde e fundo claro                 | Pedido explícito e painel aprovado                    | Verde em ações/receitas; neutrales no restante         |
| Texto maior e contraste             | Refero Color/Typography e ui-ux-pro-max Accessibility | Corpo 14–16px, labels legíveis                         |
| Um nível de navegação               | ui-ux-pro-max: Navigation/Breadcrumbs                 | Nome da família sem breadcrumb artificial              |
| Labels visíveis e controles de 44px | Refero Forms e ui-ux-pro-max Touch/Forms              | Filtros, formulário e exclusão identificáveis          |
| Mobile sem tabela larga             | ui-ux-pro-max: Responsive                             | Movimentações em blocos legíveis e navegação com texto |

Sem imagens ou animações decorativas; transições curtas para feedback e respeito a reduced-motion. Os dados fictícios e sua remoção continuam funcionando de forma isolada no navegador.

## Simplificação da comparação mensal

Após feedback do usuário, a comparação passou a mostrar uma única métrica por vez (Gastos, Receitas ou Saldo), dois valores lado a lado e uma frase explicando o aumento ou redução. Removidos da apresentação inicial: três cartões simultâneos, inversão de meses, agrupamento manual, filtro de categoria e tabela com percentuais repetidos. A capacidade de investigar categorias e nomes permanece em uma seção expansível com busca e acesso direto aos gastos de cada categoria. A distinção entre resumo do mês e detalhes continua explícita. A escolha segue o painel aprovado e o feedback direto do usuário; a pesquisa local complementar reforçou labels visíveis, sem fornecer uma recomendação específica verificada de divulgação progressiva.

## Seções e categorias

As áreas do menu passaram a apresentar uma seção por vez, mantendo controles de mês quando necessários. Na comparação, o primeiro mês usa azul suave e o segundo verde suave, acompanhados de rótulos escritos e barras de proporção; diferenças continuam expressas por texto, sem depender apenas de cores. A área de comparação por categoria foi destacada e o botão informa sua ação. Energia e Condomínio têm cores próprias no gráfico. O exemplo antigo de conta de luz é reclassificado para Energia sem recriar itens excluídos nem alterar os valores; os novos exemplos de condomínio são carregados ao restaurar o conjunto demonstrativo.
