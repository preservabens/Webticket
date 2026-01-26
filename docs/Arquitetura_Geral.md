# Arquitetura Geral do Frontend

Este documento descreve a arquitetura fundamental da interface do usuário (frontend) do sistema WebTicket.

## 1. Aplicação de Página Única (SPA - Single Page Application)

O sistema foi construído seguindo o modelo de **SPA (Single Page Application)**.

*   **Analogia Desktop:** Pense no sistema como um programa principal (um `.exe`) que, uma vez aberto, nunca fecha. As diferentes "telas" ou "formulários" do programa são carregadas dentro da janela principal, sem a necessidade de fechar e abrir o programa novamente.

*   **Funcionamento Web:**
    *   O arquivo `dashboard.html` atua como o contêiner principal e permanente da aplicação. Ele carrega os elementos que são comuns a todas as telas, como o menu de navegação lateral (`#sidebar`).
    *   O arquivo `main.js` é o cérebro da aplicação. Ele controla toda a lógica de navegação, manipulação de eventos globais (cliques em menus, botões de busca, etc.) e o estado geral da interface.
    *   O conteúdo das páginas específicas (como `tarefas.html`, `processos.html`, `ponto.html`, etc.) é carregado dinamicamente dentro do elemento `<main id="content-target">` no `dashboard.html`.

### Vantagens desta Abordagem

*   **Performance:** A navegação entre as telas é muito mais rápida, pois apenas o conteúdo principal é recarregado, não a página inteira. Isso evita que o navegador tenha que recarregar e reprocessar arquivos CSS e JavaScript a cada clique no menu.
*   **Experiência do Usuário (UX):** A transição entre as telas é fluida e instantânea, similar à de um aplicativo desktop nativo.
*   **Centralização da Lógica:** Manter toda a lógica de navegação e eventos em `main.js` facilita a manutenção e o debug, pois o comportamento global do sistema está concentrado em um único lugar.

## 2. Estrutura de Diretórios

Para manter a organização, a estrutura de arquivos do frontend segue uma regra clara:

*   **Páginas Principais:** Arquivos HTML que correspondem a um item do menu de navegação principal ficam na raiz do diretório `Frontend/`.
    *   *Exemplo:* `tarefas.html`, `processos.html`.

*   **Subpáginas:** Telas secundárias, acessadas a partir de uma página principal, devem ser colocadas em uma subpasta com o nome da seção correspondente.
    *   *Exemplo:* `processos/cadastros_condominio.html`.