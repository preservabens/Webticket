# Documentação da Tela de Processos (`processos.html` e `editor_fluxo.html`)

A tela de processos foi reformulada para funcionar como um **Construtor de Fluxos de Trabalho**. Em vez de apenas listar links estáticos, ela permite configurar a "esteira" de cada processo de negócio (Venda, Locação, etc.).

## 1. Visão Geral (Lista)
A tela inicial (`processos.html`) lista os grupos de processos disponíveis (Colaboradores, Condomínios, Locação, Venda). Ao clicar em um botão (ex: "Nova Venda"), o sistema abre o **Editor de Fluxo**.

## 2. Editor de Fluxo (`editor_fluxo.html`)

Esta tela permite configurar o passo a passo do processo. O fluxo é visualizado como uma lista vertical de **Cards**, onde cada card representa uma etapa ou automação.

### 2.1. Estrutura do Card (Estilo Google Forms)
Cada card possui um **ID Interno** sequencial (exibido apenas como número inteiro, ex: "1") e um **Título** editável. O conteúdo é dividido em duas seções principais:

1.  **Perguntas ao usuário (Opcional):** Define a interação com o usuário para coletar dados ou decidir o fluxo. Ativado via checkbox.
    *   **Texto da Pergunta:** A instrução exibida ao usuário.
    *   **Tipo de Resposta:**
        *   **Texto:** Campo livre.
        *   **Número:** Campo numérico. Se combinado com a ação "Criação de Tarefas", ativa o **Loop de Tarefas** (cria X cópias da tarefa baseadas no número digitado).
        *   **Objetiva:** Múltipla escolha. Permite definir **Navegação** (Ir para o Próximo ou Ir para Card X) baseada na resposta escolhida.
    *   **Obrigatória:** Checkbox que define se o usuário é obrigado a responder para avançar.
    *   **Log Automático:** As perguntas e respostas coletadas durante o fluxo são salvas automaticamente no **Resumo** e no **Log Inicial** da tarefa criada.

2.  **Ação do Card:** Define o que o sistema fará nesta etapa.
    *   **Nenhuma Ação:** O card serve apenas para coletar informações ou guiar o fluxo.
    *   **Criação de Tarefas:** Gera uma tarefa humana. Permite configurar dinamicamente:
        *   **Checklist:** Adição de itens linha a linha.
        *   **Documentos:** Adição de documentos exigidos com definição de validade (dias) e obrigatoriedade.
    *   **Ação / Automação:** Executa uma ação de sistema (E-mail, SMS, API).

### 2.2. Dependências e Navegação

*   **Dependência (Na Ação de Tarefa):** Substitui o antigo "Nível de Tarefa". Você seleciona explicitamente qual card anterior deve ser concluído para liberar a tarefa atual.
*   **Navegação (Na Resposta Objetiva):** Permite pular etapas ou criar ramificações no processo.
*   **Botão Atualizar (🔄):** Usado para recarregar as listas de cards nos comboboxes de seleção quando novos cards são adicionados.

### 2.3. Alinhamento Visual
Para facilitar a leitura do fluxo, os cards possuem alinhamento automático:
*   **Alinhado à Esquerda:** Cards que possuem **Perguntas** ativas (interação com usuário).
*   **Alinhado à Direita:** Cards de **Ação Pura** (sem perguntas), indicando processamento ou tarefas de sistema.