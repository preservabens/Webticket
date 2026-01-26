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
    *   *Nota:* Esta regra se aplica tanto à lista principal quanto aos cards de resultado da busca.
*   **Cabeçalhos de Quadros (Subtarefas/Documentos):**
    *   **Verde:** Se todos os itens obrigatórios daquele quadro estiverem concluídos/válidos.
    *   **Vermelho:** Se houver pelo menos um item obrigatório pendente ou inválido.
*   **Nomes de Documentos Obrigatórios:**
    *   **Verde:** Obrigatório e em dia (anexado e dentro da validade).
    *   **Laranja:** Obrigatório, mas pendente (não anexado) ou vencido.

## 4. Filosofia de Direcionamento (Planos de Tarefas)

O sistema foi projetado para ser **diretivo**, guiando o usuário através de processos padronizados em vez de exigir configuração manual constante.

*   **Planos de Tarefas:** Similar a um plano de contas contábil, o sistema utiliza "Planos de Tarefas" pré-configurados (ou pré configurável). Ao criar ou receber uma tarefa de um determinado tipo, o sistema carrega automaticamente:
    *   O checklist específico.
    *   A lista de documentos esperados (obrigatórios e opcionais).
    *   As regras de validade e instruções de obtenção para cada documento.
*   **Automação vs. Flexibilidade:** Embora o sistema entregue o caminho "pronto" (documentos pendentes já configurados esperando anexo), o usuário mantém o poder de reconfigurar itens (via ícone de engrenagem ⚙️) ou adicionar novos documentos manualmente caso a situação exija exceções.

## 5. Catálogo de Documentos e Validades

O sistema possui um catálogo centralizado de tipos de documentos para padronizar a nomenclatura e as regras de validade.

### 4.1. Imóveis

| Documento | Validade Padrão | Categoria |
| :--- | :--- | :--- |
| **Registral** | | |
| Matrícula do imóvel | 30 dias | Registral |
| Certidão de ônus reais | 30 dias | Registral |
| Certidão de inteiro teor | 30 dias | Registral |
| Escritura pública | Indeterminada | Registral |
| Formal de partilha | Indeterminada | Registral |
| Carta de adjudicação | Indeterminada | Registral |
| Contrato particular | Indeterminada | Registral |
| Registro de incorporação | Indeterminada | Registral |
| **Municipal / Construtivo** | | |
| IPTU | Anual (exercício) | Municipal |
| CND IPTU | 30 dias | Municipal |
| Cadastro imobiliário municipal | Indeterminada | Municipal |
| Planta cadastral | Indeterminada | Municipal |
| Alvará de construção | Indeterminada | Municipal |
| Habite-se | Indeterminada | Municipal |
| Certidão de numeração predial | Indeterminada | Municipal |
| Certidão de valor venal | Anual | Municipal |
| **Rural** | | |
| CCIR | Anual | Rural |
| ITR | Anual | Rural |
| CND ITR | Anual | Rural |
| NIRF | Indeterminada | Rural |
| Cadastro no INCRA | Indeterminada | Rural |
| Certidão cadastral rural | 12 meses | Rural |
| CAR | Indeterminada (atualizável) | Rural |
| Reserva legal | Indeterminada | Rural |
| APP | Indeterminada | Rural |
| Licença ambiental rural | 1 a 5 anos | Rural |
| Outorga de uso da água | 5 a 10 anos | Rural |
| Georreferenciamento | Indeterminada | Rural |
| Certificação INCRA (SIGEF) | Indeterminada | Rural |
| **Ambiental** | | |
| Licença ambiental | 1 a 5 anos | Ambiental |
| Alvará ambiental | Conforme alvará | Ambiental |
| Certidão de uso do solo | 6 a 12 meses | Ambiental |
| Declaração ambiental | 12 meses | Ambiental |
| Laudo ambiental | 12 a 24 meses | Ambiental |
| **Condominial / Loteamento** | | |
| Convenção de condomínio | Indeterminada | Condominial |
| Regimento interno | Indeterminada | Condominial |
| Ata de assembleia | Indeterminada | Condominial |
| Certidão do síndico | 30 a 90 dias | Condominial |
| Declaração de inexistência de débitos | 30 dias | Condominial |
| Registro do loteamento | Indeterminada | Loteamento |
| Planta aprovada | Indeterminada | Loteamento |
| Memorial descritivo | Indeterminada | Loteamento |
| **Posse e Uso** | | |
| Contrato de locação | Prazo contratual | Posse |
| Contrato de comodato | Prazo contratual | Posse |
| Contrato de arrendamento rural | Prazo contratual | Posse |
| Termo de cessão | Prazo definido | Posse |
| Declaração de posse | Sem validade formal | Posse |
| Usucapião (processo/sentença) | Variável | Posse |
| Certidão REURB | Indeterminada | Posse |
| **Projetos e Laudos** | | |
| Planta baixa / Projetos | Indeterminada | Técnico |
| ART / RRT | Indeterminada | Técnico |
| Laudos (Estrutural, Elétrico, Hidro) | 12 a 24 meses | Técnico |
| Laudo de vistoria | 30 a 90 dias | Técnico |
| Laudo de avaliação | 6 meses | Técnico |
| As built | Indeterminada | Técnico |
| **Financeiro e Garantias** | | |
| Contrato de financiamento | Prazo contratual | Financeiro |
| Alienação fiduciária / Hipoteca | Até baixa/quitação | Financeiro |
| Cédula de crédito imobiliário | Até quitação | Financeiro |
| Seguro habitacional | Anual | Financeiro |
| Termo de quitação | Indeterminada | Financeiro |
| **Certidões Negativas (Imóvel)** | | |
| CND Municipais / IPTU | 30 dias | Certidões |
| Certidão ambiental negativa | 30 a 90 dias | Certidões |
| Certidão de regularidade fundiária | 30 a 90 dias | Certidões |
| Certidão de zoneamento / Uso do solo | 6 a 12 meses | Certidões |

### 4.2. Pessoa Física

| Documento | Validade Padrão |
| :--- | :--- |
| RG / CPF | 10 anos / Indet. |
| CNH | Conforme vencimento |
| Certidão de Estado Civil | 90 dias |
| Certidão de óbito | Indeterminada |
| Comprovante de residência | 90 dias |
| Comprovante de Renda | 90 dias |
| Declaração/Recibo IRPF | Anual (Até abril) |
| Certidões Negativas (Estadual, Federal, Trabalhista, Eleitoral, Protestos, Criminal) | 30 a 180 dias |
| Procuração | Prazo definido |

### 4.3. Pessoa Jurídica

| Documento | Validade Padrão |
| :--- | :--- |
| Contrato Social / Certidão Simplificada | 90 dias |
| Ata / Procuração | Conforme mandato |
| Comprovante de CNPJ | 30 dias |
| Inscrições (Estadual/Municipal) | Indeterminada |
| Alvará / Licenças (Sanitária/Ambiental) | Anual ou 1-5 anos |
| Contábil (Balanço, DRE, Balancete) | Exercício anterior ou 90 dias |
| Extrato / Faturamento | 30 a 90 dias |
| Certidões Negativas (Federal, Estadual, Municipal, Trabalhista, FGTS, Falência, Protestos) | 30 a 180 dias |