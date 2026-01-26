# Padrões de Interface (UI) e Experiência do Usuário (UX)

Este documento define os padrões visuais e de comportamento para garantir consistência em todo o sistema WebTicket.

## 1. Menu de Navegação Lateral (`#sidebar`)

O menu lateral possui três estados, controlados por classes no `<body>`:

*   **Desktop - Expandido:** Estado padrão em telas grandes. Largura de `250px`.
*   **Desktop - Recolhido (`.sidebar-collapsed`):** Mostra apenas ícones, com largura de `80px`. É ativado ao clicar em um item do menu ou no botão de recolher.
*   **Mobile - Oculto/Aberto (`.sidebar-open`):** Em telas pequenas (`<= 768px`), o menu fica fora da tela e desliza para dentro quando ativado.

### Botão de Toggle do Menu (☰)

*   **Classe:** `.page-menu-toggle-btn`
*   **Localização:** Deve estar presente no cabeçalho de **toda** página carregada, à esquerda do título `<h2>`.
*   **Visibilidade:**
    *   **Desktop:** Só aparece quando o menu está recolhido (`.sidebar-collapsed`).
    *   **Mobile:** Aparece o tempo todo.
*   **Ação:** Aciona a função `handleMenuToggle()` em `main.js` para alternar os estados do menu.

## 2. Componente Accordion (`<details>`)

Usado para agrupar e ocultar seções de conteúdo, como na tela de Tarefas.

*   **Contêiner:** Os grupos devem estar dentro de um `div` com a classe `.accordion-container`.
*   **Comportamento:** A lógica em `main.js` garante que **apenas um grupo de accordion possa ficar aberto por vez** dentro do mesmo contêiner. Ao abrir um, os outros se fecham automaticamente.

## 3. Padrão de Botões

*   **Principal (`.page-header-btn`):** Estilo padrão para a maioria das ações (Buscar, Salvar, Voltar, etc.). Fundo sólido e cor de destaque.
*   **Ícone (`.icon-btn`):** Botão quadrado, geralmente usado para ações secundárias como "Editar", "Excluir", "Adicionar" em cabeçalhos de quadros.
*   **Navegação (`.nav-btn`):** Exclusivo para os itens do menu lateral.
*   **Tile (`.tile`):** Usado com moderação para ações de grande destaque visual, como "Registrar Ponto".

**Consistência:** Todos os agrupamentos de botões (exceto no menu lateral) devem ser mantidos em **ordem alfabética** para facilitar a localização.

## 4. Tabelas Responsivas

Para evitar que tabelas largas quebrem o layout em telas pequenas, elas devem **sempre** ser envolvidas por um `div` com a classe `.table-container`.

```html
<div class="table-container">
  <table class="point-table">
    <!-- ... conteúdo da tabela ... -->
  </table>
</div>
```

*   **Comportamento:** Esta classe adiciona uma barra de rolagem horizontal à tabela quando sua largura excede a da tela.

## 5. Modal de Instruções

Um modal genérico é criado dinamicamente pelo `main.js` e pode ser chamado de qualquer parte do sistema para exibir informações detalhadas.

*   **Ativação:** Um botão com a classe `.checklist-instruction-btn` (ou outra classe específica) aciona o evento.
*   **Lógica:** O JavaScript captura o clique, insere o conteúdo HTML desejado no corpo do modal (`#modal-content`) e o exibe.
*   **Fechamento:** O modal pode ser fechado clicando no botão "✖" ou na área escura do overlay.

## 7. Listas Expansíveis e Cards (Mobile-First)

Para exibir listas de dados hierárquicos (ex: Cliente -> Tarefas) de forma performática em dispositivos móveis, deve-se evitar o uso de tabelas complexas ou aninhadas.

*   **Estrutura:** Utilize o elemento `<details>` para o item pai (Resumo do Processo/Cliente).
*   **Conteúdo:** Utilize **Cards** (`div.task-card`) dentro do item expandido para mostrar os itens filhos (Tarefas).
*   **Estilo:** Os cards devem ter área de clique clara e feedback visual (`box-shadow` ou mudança de cor) ao passar o mouse ou selecionar.
*   **Performance:** Este padrão evita o recálculo custoso de layout de tabelas grandes, prevenindo travamentos em dispositivos Android.

## 8. Padrão de Listagem e Carregamento (Load More)

Para otimizar a performance e a experiência do usuário em listas longas, o sistema adota o padrão de "Carregar Mais" em detrimento da paginação tradicional (Página 1, 2, 3...).

*   **Limite Inicial:** As listas devem carregar inicialmente um número limitado de itens (ex: 50) para garantir renderização rápida.
*   **Controles de Expansão:** Ao final da lista, se houver mais itens, devem ser exibidos botões para expandir a visualização:
    *   **"Carregar mais 50":** Adiciona o próximo lote de itens à lista atual.
    *   **"Carregar Tudo":** Carrega todos os itens restantes de uma vez.
*   **Justificativa:** Este padrão mantém o contexto do usuário (os itens anteriores continuam visíveis) e é mais amigável para interfaces de toque/rolagem.

## 6. Cabeçalhos e Controles Responsivos

Grupos de controles, como a barra de busca ou o navegador de meses, devem usar `display: flex` e `flex-wrap: wrap`. Em telas pequenas (`<= 768px`), uma `media query` altera o `flex-direction` para `column`, empilhando os controles verticalmente para melhor usabilidade.

## 9. Botão de Ajuda Global

Um botão flutuante (?) está disponível em todas as telas para acesso rápido ao manual ou suporte.

*   **Localização:** Canto superior direito da tela (`fixed`).
*   **Comportamento:** Permanece visível sobrepondo o conteúdo (`z-index` alto). Ao passar o mouse, sofre uma leve expansão (`scale`) para indicar interatividade.

## 10. Temas de Contexto (Ticket Interno vs Externo)

Para evitar erros operacionais, a interface muda sutilmente de cor dependendo do contexto da tarefa:
*   **Ticket Interno:** Campos de formulário possuem fundo **Beige (#FCF8EC)**.
*   **Ticket Externo:** Campos de formulário possuem fundo **Cinza Claro (#F1F2F3)**.

## 11. Indicadores de Visibilidade

Elementos que são visíveis para o cliente final (em portais ou e-mails) devem ser destacados:
*   **Logs e Histórico:** Texto na cor **Azul Escuro**.
*   **Arquivos e Checklists:** Ícone de olho (👁️) ou checkbox explícito "Visível para o Cliente".