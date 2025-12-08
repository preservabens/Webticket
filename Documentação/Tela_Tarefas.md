# Documentação da Tela de Tarefas (`tarefas.html`)

Esta é a tela principal do sistema WebTicket e concentra a maior parte das regras de negócio.

## 1. Estrutura Geral

A tela é dividida em três seções principais, organizadas em um componente **Accordion**:

1.  **Busca:** Permite encontrar processos e tarefas específicas.
2.  **Lista de Tarefas:** Exibe a lista de todas as tarefas pendentes do usuário, ordenadas por prioridade.
3.  **Tarefa Selecionada:** A área de trabalho principal, onde os detalhes de uma única tarefa são exibidos e manipulados.

Por padrão, ao carregar a tela, o sistema executa a lógica da "Próxima Tarefa", abre o accordion "Tarefa Selecionada" e fecha os demais.

---

## 2. Accordion "Busca"

Esta seção implementa uma busca em múltiplas etapas para guiar o usuário.

*   **Etapa 1: Busca Inicial**
    *   O usuário digita um termo no campo de busca e clica em "Buscar".
    *   O sistema exibe duas tabelas: "Processos" (clientes, imóveis, etc.) e "Tarefas" (chamados).

*   **Etapa 2: Seleção de Processo (Opcional)**
    *   O usuário pode clicar em uma linha na tabela de **Processos**.
    *   **Regra:** Ao fazer isso, a tabela de **Tarefas** é filtrada para mostrar **todos** os chamados daquele processo, ordenados com os ativos mais recentes primeiro, seguidos pelos finalizados mais recentes. A seleção na tabela de tarefas é limpa.

*   **Etapa 3: Seleção de Tarefa**
    *   O usuário clica em uma linha na tabela de **Tarefas**.
    *   **Regra:** O sistema exibe uma terceira área (`#search-final-details`) com um resumo dos detalhes da tarefa selecionada e habilita o botão "Trabalhar com esse chamado".

*   **Etapa 4: Carregar Tarefa**
    *   Ao clicar em "Trabalhar com esse chamado", o sistema fecha o accordion de "Busca", abre o de "Tarefa Selecionada" e carrega todos os detalhes da tarefa escolhida na área de trabalho.

---

## 3. Accordion "Lista de Tarefas"

*   **Propósito:** Fornece uma visão geral de todas as tarefas pendentes do usuário.
*   **Ordenação:** A lista é ordenada pela **Data Fictícia** (ver `Regras_de_Negocio_Chave.md`).
*   **Regra Visual:** Datas de conclusão que já passaram (tarefas atrasadas) são exibidas na cor vermelha.
*   **Interação:** Clicar em qualquer tarefa da lista irá carregá-la diretamente na seção "Tarefa Selecionada".

---

## 4. Accordion "Tarefa Selecionada"

Esta é a área de trabalho principal. Ela é composta por vários "quadros".

### 4.1. Cabeçalho da Tarefa
*   **Título:** Exibe o tipo e o título da tarefa. Um ícone de edição (✏️) permite alterar essas informações.
*   **Controles:** Campos para definir a **Data de Conclusão**, **Hora** e **Prioridade**, que são a base para o cálculo de urgência da tarefa.

### 4.2. Quadro "Resumo da Tarefa"
*   Um campo de texto (`<textarea>`) para a descrição geral da tarefa.
*   É somente leitura por padrão. Clicar no ícone de edição (✏️) habilita a edição e troca o ícone para salvar (💾).

### 4.3. Quadro "Subtarefas"
*   Lista os passos necessários para completar a tarefa principal.
*   **Contador e Cor:** O título do quadro mostra um contador `(concluídas/total)` e fica **verde** se todas as subtarefas estiverem concluídas, ou **vermelho** caso contrário.
*   **Ordenação:** As subtarefas são ordenadas da seguinte forma:
    1.  Parcialmente concluídas.
    2.  Não iniciadas.
    3.  Concluídas.
*   **Interação:** Clicar em uma subtarefa a seleciona e exibe a área de "Detalhes da Subtarefa" abaixo.

### 4.4. Área de Detalhes da Subtarefa (Dinâmica)

Esta área aparece quando uma subtarefa é selecionada e contém dois quadros lado a lado:

*   **Quadro "Checklist da Subtarefa":**
    *   Exibe os itens específicos a serem verificados para aquela subtarefa.
    *   Cada item pode ter um botão de instruções (🔎) que abre um modal com mais detalhes.

*   **Quadro "Documentos":**
    *   Lista os documentos relacionados à subtarefa.
    *   **Contador e Cor do Título:** O título mostra um contador `(obrigatórios em dia / total de obrigatórios)` e fica **verde** se todos os documentos obrigatórios estiverem válidos, ou **vermelho** caso contrário.
    *   **Cor do Nome do Documento:**
        *   **Verde:** Documento obrigatório e em dia.
        *   **Laranja:** Documento obrigatório, mas pendente ou vencido.
        *   **Branco (padrão):** Documento não obrigatório.
    *   **Ordenação:** Os documentos são ordenados por:
        1.  Obrigatórios pendentes.
        2.  Anexados (vencidos ou próximos do vencimento primeiro).
        3.  Opcionais.
    *   **Interação:** Clicar em um documento exibe o quadro de "Detalhes do Documento".

### 4.5. Quadro "Detalhes do Documento" (Dinâmico)

Aparece ao selecionar um documento.

*   Se o documento já foi anexado, exibe seus detalhes (data de emissão, validade) e a lista de arquivos.
*   Se o documento está pendente, exibe um formulário para adicioná-lo.

### 4.6. Quadros Finais

*   **Adicionar Movimentação:** Área para registrar novas informações e andamentos na tarefa.
*   **Histórico de Movimentações:** Exibe o histórico de comentários e atualizações manuais.
*   **Log do Sistema:** Exibe um log automático de todas as ações realizadas na tarefa (criação, alteração, etc.).