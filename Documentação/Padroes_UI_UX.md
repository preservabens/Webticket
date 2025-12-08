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

## 6. Cabeçalhos e Controles Responsivos

Grupos de controles, como a barra de busca ou o navegador de meses, devem usar `display: flex` e `flex-wrap: wrap`. Em telas pequenas (`<= 768px`), uma `media query` altera o `flex-direction` para `column`, empilhando os controles verticalmente para melhor usabilidade.