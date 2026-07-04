# PRD - FIFA Champs

## 1. Visão Geral

FIFA Champs é uma aplicação web do tipo Single Page Application para gestão de campeonatos de FIFA. O sistema permite que um gestor crie campeonatos, cadastre participantes, execute sorteios automáticos e acompanhe a evolução do torneio em uma visualização de chaves semelhante a um bracket de competição.

## 2. Objetivo do Produto

Permitir a organização e o acompanhamento de campeonatos de FIFA de forma simples, rápida e visual, reduzindo trabalho manual na montagem de confrontos e eliminatórias.

## 3. Problema a Ser Resolvido

Hoje, a gestão de campeonatos informais de FIFA costuma ser feita manualmente, com sorteios, registros de resultados e montagem de chaves em planilhas, mensagens ou papel. Isso gera retrabalho, inconsistência e dificuldade de acompanhamento para participantes e organizadores.

## 4. Público-Alvo

- Gestor do campeonato
- Administrador do evento
- Participantes do campeonato, quando houver acesso de consulta

## 5. Escopo do MVP

### Funcionalidades principais

- Criar novo campeonato
- Editar campeonato existente
- Inserir participantes separando nomes por vírgulas
- Validar quantidade de participantes
- Realizar sorteio automático em chaves de 2 a 6 participantes
- Gerar confrontos da fase inicial automaticamente
- Permitir lançamento de resultados das partidas
- Avançar vencedores para as fases seguintes
- Exibir visualização em formato de chaves
- Exibir jogo de disputa de 3º e 4º lugares
- Exibir jogo final entre 1º e 2º colocados

### Fora de escopo no MVP

- Login com múltiplos perfis e permissões avançadas
- Integração com console ou API do FIFA
- Gestão de múltiplos jogos simultâneos com arbitragem automática
- Estatísticas avançadas de desempenho por jogador
- Histórico de temporadas com ranking acumulado

## 6. Regras de Negócio

### 6.1 Cadastro de participantes

- O gestor deve informar os participantes em um campo único, separando os nomes por vírgulas.
- O sistema deve limpar espaços extras, remover entradas vazias e impedir nomes duplicados dentro do mesmo campeonato.
- O campeonato deve exigir no mínimo 2 participantes.

### 6.2 Formação de chaves

- O sorteio automático deve distribuir os participantes em chaves com capacidade entre 2 e 6 jogadores.
- O sistema deve tentar equilibrar as chaves para que nenhuma fique desproporcionalmente maior que outra.
- A primeira rodada deve garantir que cada jogador enfrente todos os outros jogadores da sua própria chave ao menos uma vez.

### 6.3 Primeira rodada

- Na primeira rodada, 50% dos participantes devem ser eliminados.
- O método de eliminação pode ser por ranking da chave, número de vitórias, saldo de gols ou critério de desempate definido pelo campeonato.
- Cada jogador deve jogar ao menos uma vez contra todos os outros jogadores da mesma chave antes da eliminação.

### 6.4 Etapas eliminatórias

- Após a primeira rodada, o campeonato passa a funcionar em formato eliminatório, similar à Copa do Mundo.
- Em cada jogo, o perdedor é eliminado.
- A estrutura segue até sobrar uma final para 1º e 2º lugar.
- Deve haver uma disputa separada para 3º e 4º lugar.

### 6.5 Critérios de desempate

- Número de vitórias
- Saldo de gols
- Gols marcados
- Confronto direto
- Sorteio manual pelo gestor, quando necessário

## 7. Experiência do Usuário

### Fluxo principal do gestor

1. Criar campeonato
2. Informar nome do campeonato, data e observações opcionais
3. Inserir participantes em uma única área de texto
4. Confirmar lista e validar quantidade mínima
5. Executar sorteio automático
6. Visualizar chaves geradas
7. Registrar resultados das partidas
8. Acompanhar avanços até semifinal, disputa de 3º lugar e final

### Fluxo de visualização do participante

1. Abrir campeonato
2. Visualizar chaves e confrontos
3. Consultar status das partidas e classificação
4. Ver vencedores avançando fase a fase

## 8. Requisitos Funcionais

- RF01: O sistema deve permitir criar um campeonato novo.
- RF02: O sistema deve permitir editar nome e dados básicos do campeonato.
- RF03: O sistema deve permitir cadastrar participantes em massa por texto separado por vírgulas.
- RF04: O sistema deve validar nomes duplicados e entradas inválidas.
- RF05: O sistema deve sortear automaticamente os participantes em chaves.
- RF06: O sistema deve gerar confrontos da fase inicial.
- RF07: O sistema deve registrar resultados das partidas.
- RF08: O sistema deve avançar automaticamente os vencedores para a próxima fase.
- RF09: O sistema deve gerar a disputa de 3º e 4º lugares.
- RF10: O sistema deve gerar a final do campeonato.
- RF11: O sistema deve exibir a árvore do campeonato em formato visual de chaves.
- RF12: O sistema deve permitir reabrir um campeonato para edição antes do início das partidas, se configurado pelo gestor.

## 9. Requisitos Não Funcionais

- RNF01: A aplicação deve funcionar como SPA, com navegação sem recarregamento completo da página.
- RNF02: A interface deve ser responsiva para desktop, tablet e mobile.
- RNF03: O carregamento inicial deve ser rápido e a interação com chaves deve ser fluida.
- RNF04: O sistema deve persistir os dados do campeonato de forma confiável.
- RNF05: A visualização em chaves deve permanecer legível em torneios com muitos jogadores.
- RNF06: A interface deve ser clara o suficiente para uso em eventos ao vivo.

## 10. Estrutura de Dados Sugerida

### Campeonato

- id
- nome
- dataCriacao
- status
- observacoes
- configuracoes

### Participante

- id
- nome
- campeonatoId
- chaveId
- status

### Chave

- id
- campeonatoId
- nome
- participantes
- fase

### Partida

- id
- campeonatoId
- fase
- chaveId
- jogadorCasa
- jogadorFora
- placarCasa
- placarFora
- status
- vencedorId
- perdedorId
- ordemExibicao

## 11. Regras de Sorteio e Progressão

### Sorteio automático

- Ao confirmar a lista de participantes, o sistema deve embaralhar os nomes automaticamente.
- O agrupamento deve respeitar o limite de 2 a 6 jogadores por chave.
- Caso a quantidade total de participantes não feche grupos perfeitos, o sistema deve distribuir os participantes de forma mais uniforme possível.

### Progressão da fase inicial

- Cada chave inicial funciona como uma mini etapa classificatória.
- Cada jogador enfrenta todos os demais da mesma chave ao menos uma vez.
- Ao fim dessa etapa, apenas metade dos participantes segue para a fase eliminatória.

### Progressão eliminatória

- Os classificados são posicionados em um bracket de eliminação simples.
- Cada confronto elimina um jogador.
- O fluxo continua até a semifinal, a disputa de 3º lugar e a final.

## 12. Visualização em Chaves

### Objetivo da tela

Reproduzir uma visualização parecida com brackets esportivos, permitindo entender rapidamente quem jogou, quem avançou e quais partidas ainda faltam.

### Estrutura visual esperada

- Colunas por fase, da esquerda para a direita
- Cartões de partida com nome dos jogadores, placar e status
- Linhas conectando partidas da fase anterior à fase seguinte
- Destaque para partidas concluídas, em andamento e futuras
- Área específica para final e disputa de 3º e 4º lugares

### Comportamentos da interface

- A visualização deve permitir rolagem horizontal quando houver muitas fases.
- A interface deve ser clara mesmo em telas menores.
- O status da partida deve ser visível com cores ou labels, como pendente, ao vivo e finalizado.
- O vencedor de cada partida deve ficar destacado.
- Se houver participantes ainda não definidos em fases futuras, a interface deve exibir um placeholder, como TBD.

### Referência visual

A tela deve seguir o conceito da imagem anexada: fases organizadas em colunas, partidas em cartões arredondados e conectores entre confrontos, com leitura rápida do caminho até a final.

## 13. Casos de Uso

### UC01 - Criar campeonato

O gestor cria um novo campeonato informando nome e, opcionalmente, observações.

### UC02 - Inserir participantes

O gestor cola a lista de nomes separada por vírgulas e o sistema transforma o texto em uma lista validada.

### UC03 - Sorteio automático

O sistema organiza os participantes em chaves e gera os confrontos iniciais.

### UC04 - Registrar resultados

O gestor lança os placares e o sistema define vencedor e perdedor.

### UC05 - Acompanhar bracket

O usuário consulta a árvore do campeonato e acompanha a progressão até a final.

## 14. Critérios de Aceite

- O gestor consegue criar um campeonato em poucos passos.
- É possível inserir participantes apenas com uma lista separada por vírgulas.
- O sistema rejeita participantes duplicados.
- O sorteio distribui os jogadores automaticamente.
- A primeira rodada garante que todos joguem contra os membros da própria chave ao menos uma vez.
- Metade dos participantes é eliminada ao fim da primeira rodada.
- O sistema monta corretamente as fases eliminatórias seguintes.
- Existe partida de 3º e 4º lugar.
- Existe final para 1º e 2º lugar.
- A visualização em chaves é clara e similar a brackets esportivos.

## 15. Métricas de Sucesso

- Tempo médio para criar um campeonato
- Tempo médio para cadastrar participantes
- Tempo médio até concluir o sorteio
- Número de campeonatos criados por período
- Número de campeonatos finalizados com sucesso
- Taxa de uso da visualização em chaves

## 16. Riscos e Considerações

- Quantidade irregular de participantes pode dificultar o balanceamento perfeito das chaves.
- A primeira rodada exige uma lógica bem definida para garantir que todos joguem entre si na chave.
- A interface em formato de bracket pode ficar extensa em campeonatos maiores e precisa de boa navegação horizontal.
- A edição de resultados em fases avançadas deve recalcular automaticamente a progressão sem gerar inconsistências.

## 17. Sugestão de Evolução Futura

- Login e perfis de acesso
- Ranking histórico de jogadores
- Estatísticas por campeonato
- Exportação em PDF ou imagem do bracket
- Compartilhamento de link público do campeonato
- Notificações em tempo real durante partidas ao vivo

## 18. Resumo

FIFA Champs deve ser uma SPA simples, objetiva e visual, capaz de organizar campeonatos de FIFA do cadastro dos jogadores até a definição completa do pódio. O diferencial central é o sorteio automático com chaves de 2 a 6 participantes, a progressão híbrida entre fase inicial classificatória e mata-mata, e a visualização em formato de bracket para acompanhamento rápido do torneio.

## 19. Especificação Técnica

### 19.1 Arquitetura da aplicação

- Aplicação SPA com navegação client-side.
- Estrutura orientada a domínio, separando camada de UI, estado, regras de torneio e persistência.
- O motor de geração de chaves e progressão deve ser isolado em uma camada pura de regras para facilitar testes.

### 19.2 Stack sugerida

- Frontend: React com TypeScript.
- Roteamento: React Router ou equivalente.
- Estado: Zustand, Redux Toolkit ou Context API com reducer, dependendo da complexidade final.
- Estilo: CSS Modules, Tailwind ou design system próprio.
- Persistência local: LocalStorage ou IndexedDB no MVP.

### 19.3 Telas principais

- Dashboard de campeonatos
- Criação e edição de campeonato
- Cadastro em massa de participantes
- Sorteio e geração de chaves
- Visualização do bracket
- Detalhe da partida
- Classificação e andamento do campeonato

### 19.4 Componentes principais

- ChampionshipForm
- ParticipantsBulkInput
- DrawActions
- BracketBoard
- BracketColumn
- MatchCard
- MatchDetailsDrawer
- TournamentStatusBadge
- StandingsPanel

### 19.5 Modelo de estado

O estado do campeonato deve conter, no mínimo:

- dados gerais do campeonato
- lista de participantes
- chaves geradas
- partidas por fase
- resultados das partidas
- status atual do campeonato
- campeão, vice e terceiro colocado, quando definidos

### 19.6 Fluxo de dados

1. O gestor cria o campeonato.
2. O sistema normaliza a lista de participantes inserida por vírgulas.
3. O motor de sorteio agrupa os participantes em chaves.
4. A primeira rodada gera confrontos internos da chave.
5. O sistema calcula a classificação de cada chave.
6. Os classificados avançam para o mata-mata.
7. Cada resultado atualizado recalcula a próxima partida habilitada.
8. Ao fim, o sistema define final, disputa de 3º lugar e pódio.

### 19.7 Regras de algoritmo para bracket

- A função de sorteio deve ser determinística apenas quando houver uma semente explícita para testes.
- A distribuição inicial deve evitar chaves com menos de 2 ou mais de 6 participantes.
- Se houver sobra de participantes, a lógica deve redistribuir para minimizar diferença entre chaves.
- A fase inicial deve ser round-robin dentro de cada chave.
- A fase eliminatória deve sempre produzir uma árvore com encaixe para semifinal, final e disputa de 3º lugar.

### 19.8 Persistência

- No MVP, salvar automaticamente a cada alteração relevante.
- Permitir exportação e importação de campeonato em JSON.
- Estruturar os dados para que a futura migração para backend seja direta.

### 19.9 Validações técnicas

- Normalização de nomes com trim e remoção de duplicados.
- Bloqueio de sorteio com menos de 2 participantes.
- Bloqueio de avanço de fase sem resultado válido.
- Recalculo automático de próximos confrontos após edição de placar.

### 19.10 Critérios técnicos de aceite

- O bracket pode ser regenerado sem corromper o estado do campeonato.
- A interface mantém legibilidade em telas pequenas e grandes.
- A alteração de um placar reflete corretamente no status e na progressão do torneio.
- A lógica de negócio pode ser testada sem dependência da interface.

## 20. Próximos Passos de Implementação

- Definir o framework e a biblioteca de estado.
- Desenhar o schema JSON do campeonato.
- Implementar o motor de sorteio e progressão.
- Construir a tela de cadastro e o bracket visual.
- Criar testes para as regras de negócio principais.
