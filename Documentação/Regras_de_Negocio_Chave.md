# Regras de Negócio Chave do Sistema

Este documento centraliza as regras de negócio mais importantes e complexas que governam o comportamento do sistema WebTicket.

## 1. Lógica da "Próxima Tarefa"

O botão "Próxima Tarefa" é o coração do fluxo de trabalho do colaborador. Seu objetivo é apresentar a tarefa mais importante a ser feita, balanceando demandas externas e internas.

### 1.1. Tipos de Tarefa

As tarefas são divididas em duas categorias principais:

*   **Nova:** Tarefas originadas de fontes externas (e-mails, WhatsApp, ligações de clientes). Requerem atenção rápida.
*   **Sistema:** Tarefas internas, geradas manualmente por colaboradores ou por outros processos do sistema.

### 1.2. Regra de Ordenação (Intercalação)

Para garantir que as novas demandas de clientes sejam atendidas rapidamente sem abandonar as tarefas internas, a lista de trabalho é organizada de forma **intercalada**.

1.  O sistema primeiro separa todas as tarefas pendentes em duas listas: "Novas" e "Sistema".
2.  Cada uma dessas listas é ordenada internamente pela "Data Fictícia" (ver abaixo).
3.  A lista final é montada pegando a tarefa mais urgente da lista "Nova", depois a mais urgente da lista "Sistema", depois a segunda mais urgente da "Nova", a segunda do "Sistema", e assim por diante.

**Exemplo de lista final:** `[Nova 1, Sistema 1, Nova 2, Sistema 2, Nova 3, Sistema 3, ...]`

### 1.3. Regra de Prioridade (Data Fictícia)

Dentro de cada tipo (Nova ou Sistema), a urgência de uma tarefa é definida por sua **Data Fictícia**.

*   **Cálculo:**
    ```
    Data Fictícia = Data de Conclusão + X dias
    ```
    Onde `X` é o número da **Prioridade** da tarefa (um valor de 0 a 10).

*   **Exemplo:**
    *   Tarefa A: Conclusão em 10/12, Prioridade 2. Data Fictícia = 12/12.
    *   Tarefa B: Conclusão em 11/12, Prioridade 0. Data Fictícia = 11/12.
    *   Neste caso, a **Tarefa B é mais urgente**, mesmo tendo uma data de conclusão posterior.

*   **Regras Adicionais:**
    *   **Horário Padrão:** Tarefas sem hora de conclusão definida são consideradas como vencendo às **17:59** para fins de ordenação.
    *   **Desempate:** Se duas tarefas tiverem a mesma Data e Hora Fictícia, o desempate é feito pelo **código da tarefa** (o menor vem primeiro).

### 1.4. Comportamento da Seleção

*   Ao clicar em "Próxima Tarefa", o sistema sempre seleciona a **primeira tarefa** da lista final intercalada.
*   **Exceção:** Se a primeira tarefa da lista já for a que está atualmente selecionada na tela, o sistema automaticamente seleciona a **segunda tarefa** da lista. Isso força o colaborador a avançar no trabalho, evitando que ele fique "preso" na mesma tarefa.

## 2. Regras de Cores e Status

O sistema usa cores para fornecer feedback visual rápido sobre o estado dos itens.

*   **Datas Atrasadas:** Qualquer data de conclusão no passado é exibida em **vermelho**.
*   **Cabeçalhos de Quadros (Subtarefas/Documentos):**
    *   **Verde:** Se todos os itens obrigatórios daquele quadro estiverem concluídos/válidos.
    *   **Vermelho:** Se houver pelo menos um item obrigatório pendente ou inválido.
*   **Nomes de Documentos Obrigatórios:**
    *   **Verde:** Obrigatório e em dia (anexado e dentro da validade).
    *   **Laranja:** Obrigatório, mas pendente (não anexado) ou vencido.