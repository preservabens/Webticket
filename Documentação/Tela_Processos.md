# Tela de Processos (`processos.html`)

Este documento detalha o funcionamento e o propósito da tela de Processos.

## 1. Propósito

A tela de "Processos" funciona como um **hub de navegação centralizado** para iniciar os diversos fluxos de trabalho e processos de negócio da empresa. Em vez de ter dezenas de itens de menu, esta tela agrupa as ações por categoria, facilitando a localização.

**Analogia Desktop:** Pense nesta tela como um "menu principal" de um sistema ERP, onde as opções são agrupadas por módulos (Cadastros, Financeiro, RH, etc.).

## 2. Estrutura

A tela é organizada utilizando o componente **Accordion**. Cada título de accordion representa uma grande área da empresa (ex: Cadastros, Colaboradores, Condomínios, Locação, Venda).

Dentro de cada grupo, os botões (`.page-header-btn`) representam os processos específicos que o usuário pode iniciar.

## 3. Regras de Negócio

*   **Navegação:** Cada botão possui um atributo `data-page` que indica o arquivo HTML da subpágina a ser carregada. A lógica em `main.js` cuida de carregar o conteúdo correspondente na área principal.
*   **Ordenação:** Para garantir consistência e facilidade de localização, os botões dentro de cada grupo de accordion devem ser mantidos em **ordem alfabética**.
*   **Estilo:** A função `equalizeButtonWidths()` em `main.js` é chamada após o carregamento desta página para garantir que todos os botões dentro de um mesmo grupo tenham a mesma largura, criando um alinhamento visual agradável.