document.addEventListener('DOMContentLoaded', () => { // Início do DOMContentLoaded
  const body = document.body;
  const contentTarget = document.getElementById('content-target');
  const navButtons = document.querySelectorAll('.nav-btn');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

  // Variável para controlar o mês/ano do espelho de ponto
  let pointSheetDate = new Date();

  // Mantém o controle do estado atual da visualização para detectar mudanças
  let isMobileView = window.innerWidth <= 768;

  // --- CRIAÇÃO DINÂMICA DO MODAL DE INSTRUÇÕES ---
  // Cria os elementos do modal uma única vez e anexa ao body.
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h4 id="modal-title">Instruções</h4>
        <button id="modal-close-btn" class="icon-btn" title="Fechar">✖</button>
      </div>
      <div id="modal-content" class="modal-content">
        <!-- O conteúdo das instruções será inserido aqui -->
      </div>
    </div>
  `;
  body.appendChild(modalOverlay);

  // --- LÓGICA PARA FECHAR O MODAL ---
  const modalCloseBtn = document.getElementById('modal-close-btn');
  modalCloseBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });
  modalOverlay.addEventListener('click', (event) => {
    // Fecha o modal apenas se o clique for no fundo (overlay) e não no conteúdo.
    if (event.target === modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  });

  // Função para alternar o menu no desktop (Expandido <-> Recolhido)
  const toggleDesktopSidebar = () => {
    body.classList.toggle('sidebar-collapsed');
  };

  // Função para alternar o menu no mobile (Oculto/Aberto)
  const toggleMobileSidebar = () => {
    body.classList.toggle('sidebar-open');
  };

  // Função unificada para os botões de menu
  const handleMenuToggle = () => {
    if (isMobileView) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  // Adiciona o evento de clique para o botão principal de toggle da sidebar
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', handleMenuToggle);
  }

  // --- DELEGAÇÃO DE EVENTOS PARA CONTEÚDO DINÂMICO ---
  contentTarget.addEventListener('click', (event) => {
    // Verifica se o clique foi no botão de menu da página
    const pageMenuBtn = event.target.closest('.page-menu-toggle-btn');
    if (pageMenuBtn) {
      handleMenuToggle();
      return; // Encerra para não processar outros cliques
    }

    // Verifica se o clique foi em um título de accordion
    if (event.target.classList.contains('accordion-title')) {
      event.preventDefault();
      const currentGroup = event.target.parentElement;

      // Encontra todos os grupos no container
      const allGroups = currentGroup.closest('.accordion-container').querySelectorAll('.accordion-group');

      // Fecha todos os outros grupos que não sejam o atual
      allGroups.forEach(group => {
        if (group !== currentGroup) {
          group.removeAttribute('open');
        }
      });

      // Alterna (abre/fecha) o grupo clicado
      currentGroup.toggleAttribute('open');
    }

    // Verifica se o clique foi no botão de editar/salvar o memo da tarefa
    if (event.target.id === 'memo-edit-btn') {
      const memoBtn = event.target;
      const memoTextarea = document.getElementById('memo-textarea');
      const currentMode = memoBtn.dataset.mode;

      if (currentMode === 'edit') {
        // Habilita a edição
        memoTextarea.readOnly = false;
        memoTextarea.focus();
        // Troca o ícone para "salvar" (diskette)
        memoBtn.innerHTML = '💾';
        memoBtn.title = 'Salvar Alterações';
        memoBtn.dataset.mode = 'save';
      } else {
        // Desabilita a edição (simulando o salvamento)
        memoTextarea.readOnly = true;
        // Troca o ícone de volta para "editar" (lápis)
        memoBtn.innerHTML = '✏️';
        memoBtn.title = 'Editar Resumo';
        memoBtn.dataset.mode = 'edit';
        // Aqui, no futuro, ocorreria a chamada para a API para salvar o texto.
        alert('Resumo da tarefa salvo (simulação).');
      } // fim do if (currentMode)
    } // fim do if (memo-edit-btn)

    // Verifica se o clique foi em uma subtarefa
    const subtaskItem = event.target.closest('.subtask-item');
    if (subtaskItem) {
      // Remove a seleção de outros itens
      document.querySelectorAll('.subtask-item.selected, .document-item.selected').forEach(item => item.classList.remove('selected'));
      // Adiciona a classe de seleção ao item clicado
      subtaskItem.classList.add('selected');
      // Atualiza o quadro de checklist
      atualizarQuadroChecklist(subtaskItem.dataset.subtaskId);
    } // fim do if (subtaskItem)

    // Verifica se o clique foi em um item de documento
    const documentItem = event.target.closest('.document-item');
    if (documentItem) {
      // Remove a seleção de outros itens
      document.querySelectorAll('.subtask-item.selected, .document-item.selected').forEach(item => item.classList.remove('selected'));
      // Adiciona a classe de seleção ao item clicado
      documentItem.classList.add('selected');
      atualizarQuadroDocumento(documentItem.dataset.documentId);
    } // fim do if (documentItem)

    // Verifica se o clique foi no botão de fechar o quadro dinâmico
    const closeDynamicQuadroBtn = event.target.closest('.close-dynamic-quadro-btn');
    if (closeDynamicQuadroBtn) {
      const dynamicQuadro = document.getElementById('dynamic-details-quadro');
      if (dynamicQuadro) {
        // Oculta o quadro
        dynamicQuadro.style.display = 'none';
        // Limpa o conteúdo e restaura o texto padrão
        dynamicQuadro.innerHTML = '<p class="placeholder-text">Selecione uma subtarefa ou documento para ver os detalhes.</p>';
      } // fim do if (dynamicQuadro)

      // Remove a classe 'selected' de qualquer item de subtarefa ou documento
      document.querySelectorAll('.subtask-item.selected, .document-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    } // fim do if (closeDynamicQuadroBtn)

    // Verifica se o clique foi no botão de instruções do checklist
    const instructionBtn = event.target.closest('.checklist-instruction-btn');
    if (instructionBtn) {
      // Prepara o conteúdo para o modal.
      // Usamos innerHTML para que a tag <a> seja renderizada corretamente.
      const instructionHTML = `
        <p>Para fazer essa tarefa faça xxxxxx e vá em link: <a href="https://www.preservabens.com.br" target="_blank">https://www.preservabens.com.br</a> e depois clique em xxxxx.</p>
        <p>Você precisa fazer isso para garantir que yyyyyyy.</p>
      `;

      // Encontra o container de conteúdo do modal e insere o texto.
      const modalContent = document.getElementById('modal-content');
      modalContent.innerHTML = instructionHTML;

      // Exibe o modal.
      modalOverlay.style.display = 'flex';
    } // fim do if (instructionBtn)

    // Verifica se o clique foi no botão "Trabalhar com esse chamado"
    if (event.target.id === 'btn-trabalhar-chamado') {
      const taskId = event.target.dataset.taskId;
      if (!taskId) return;

      // Simula a busca da tarefa pelo ID. No futuro, isso virá de uma API.
      const tarefaParaCarregar = {
        id: taskId,
        titulo: 'Chamado Carregado da Busca',
        dataConclusao: '2025-12-25',
        prioridade: 5,
        tipo: 'sistema'
      };

      // Encontra e fecha o accordion de Busca e abre o de Tarefa Selecionada
      const accordionContainer = event.target.closest('.accordion-container');
      const allGroups = accordionContainer.querySelectorAll('.accordion-group');
      allGroups.forEach(group => {
        const title = group.querySelector('.accordion-title').textContent;
        if (title.includes('Busca')) group.removeAttribute('open');
        if (title.includes('Tarefa Selecionada')) group.setAttribute('open', '');
      });

      // Carrega os detalhes da tarefa no accordion correspondente
      abrirDetalheTarefa(tarefaParaCarregar);
    } // fim do if (btn-trabalhar-chamado)

    // Verifica se o clique foi no botão da sidebar de tarefas
    if (event.target.id === 'task-sidebar-toggle') {
      contentTarget.classList.toggle('task-sidebar-open');
    }

    // Verifica se o clique foi nos botões de navegação de mês
    if (event.target.id === 'prev-month-btn') {
      pointSheetDate.setMonth(pointSheetDate.getMonth() - 1);
      updateMonthDisplay();
    }
    if (event.target.id === 'next-month-btn') {
      pointSheetDate.setMonth(pointSheetDate.getMonth() + 1);
      updateMonthDisplay();
    }

    // Verifica se o clique foi em um botão de ajuste de tempo
    if (event.target.classList.contains('time-adjust-btn')) {
      const timeInput = document.getElementById('ponto-time');
      const dateInput = document.getElementById('ponto-date');
      if (!timeInput || !dateInput) return;

      const adjustment = parseInt(event.target.dataset.adjust, 10);
      const currentTime = timeInput.value;
      const currentDate = dateInput.value;

      if (currentTime && currentDate) {
        // Cria um objeto Date a partir dos valores dos campos de data e hora
        const dateTime = new Date(`${currentDate}T${currentTime}`);

        // Aplica o ajuste de minutos
        dateTime.setMinutes(dateTime.getMinutes() + adjustment);

        // Atualiza o campo de hora com o novo valor
        timeInput.value = dateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Atualiza o campo de data com o novo valor (que pode ter mudado)
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
      }
    }

    // Verifica se o clique foi no botão "Próxima Tarefa"
    if (event.target.id === 'btn-proxima-tarefa') {
      selecionarProximaTarefa();
      return; // Encerra para não processar outros cliques
    }

    // Verifica se o clique foi em um botão que carrega uma página (ex: Voltar, ou um tile de processo)
    const targetButton = event.target.closest('[data-page]');
    if (targetButton && !targetButton.classList.contains('nav-btn')) {
        const page = targetButton.dataset.page;
        if (page) {
            loadPage(page);
        }
    }
  });

  // --- LÓGICA DE CARREGAMENTO DE PÁGINA ---

  const loadPage = async (page) => {
    // Mostra um feedback de carregamento (opcional, mas bom para UX)
    contentTarget.innerHTML = '<p>Carregando...</p>';
    try {
      const response = await fetch(page);
      if (!response.ok) {
        throw new Error(`Erro ao carregar a página: ${response.statusText}`);
      }
      const html = await response.text();
      contentTarget.innerHTML = html;

      // Executa scripts específicos da página após o carregamento
      if (page === 'ponto.html') {
        initializePontoPage();
      }
      if (page === 'tarefas.html') {
        initializeTarefasPage();
      }
      if (page === 'processos.html') {
        // Após carregar a página de processos, iguala a largura dos botões.
        equalizeButtonWidths('.search-controls');
      }
    } catch (error) {
      console.error('Falha no fetch:', error);
      contentTarget.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente.</p>';
    }
  };

  // Função para inicializar a página de ponto
  const initializePontoPage = () => {
    const dateInput = document.getElementById('ponto-date');
    const timeInput = document.getElementById('ponto-time');

    if (dateInput && timeInput) {
      const now = new Date();

      // Formata a data para YYYY-MM-DD e a hora para HH:MM
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}`;
      timeInput.value = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    // Atualiza o display do mês no espelho de ponto
    updateMonthDisplay();
  };

  // Função para atualizar o display de mês/ano
  const updateMonthDisplay = () => {
    const display = document.getElementById('current-month-display');
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');

    if (display && prevBtn && nextBtn) {
      // Atualiza o display central
      const month = pointSheetDate.toLocaleString('pt-BR', { month: 'long' });
      const year = pointSheetDate.getFullYear();
      // Capitaliza o mês
      display.textContent = `${month.charAt(0).toUpperCase() + month.slice(1)} / ${year}`;

      // Calcula e atualiza o botão do mês anterior
      const prevMonthDate = new Date(pointSheetDate);
      prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
      const prevMonthName = prevMonthDate.toLocaleString('pt-BR', { month: 'long' });
      prevBtn.innerHTML = `&lt; ${prevMonthName.charAt(0).toUpperCase() + prevMonthName.slice(1)}`;

      // Calcula e atualiza o botão do próximo mês
      const nextMonthDate = new Date(pointSheetDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthName = nextMonthDate.toLocaleString('pt-BR', { month: 'long' });
      nextBtn.innerHTML = `${nextMonthName.charAt(0).toUpperCase() + nextMonthName.slice(1)} &gt;`;
    }
  };

  // Função para inicializar a página de tarefas
  const initializeTarefasPage = () => {
    // Encontra o botão "Próxima tarefa"
    const btnProxima = document.getElementById('btn-proxima-tarefa');
    if (btnProxima) {
      // Simula o clique no botão para carregar a tarefa mais importante
      // assim que a página de tarefas é aberta.
      btnProxima.click();
    } // fim do if (btnProxima)
  }; // fim da função initializeTarefasPage

  /**
   * Encontra e seleciona a próxima tarefa mais prioritária.
   * A lógica de priorização segue duas regras principais:
   * 1. **Intercalação por Tipo:** As tarefas são separadas em "novas" (vindas de clientes) e "sistema" (internas).
   *    A lista final é montada intercalando uma tarefa de cada tipo (nova, sistema, nova, sistema...).
   * 2. **Prioridade por Score:** Dentro de cada tipo, a tarefa escolhida é sempre a mais urgente, calculada
   *    pelo score (data de conclusão + prioridade de 0 a 10).
   * 3. **Seleção:** O sistema sempre aponta para a primeira tarefa da lista final intercalada. Se ela já
   *    estiver selecionada, aponta para a segunda, forçando o andamento.
   */
  const selecionarProximaTarefa = () => {
    // Esta função buscaria as tarefas da API. Por enquanto, usamos dados de exemplo.
    // A data de conclusão está no formato 'YYYY-MM-DD'.
    // Adicionamos o campo 'tipo' para diferenciar as tarefas.
    const listaDeTarefas = [
      { id: 1245, titulo: 'Vazamento de Gás', dataConclusao: '2025-12-10', prioridade: 1, tipo: 'sistema' },
      { id: 1472, titulo: 'Taxa Maior Lançada', dataConclusao: '2025-12-15', prioridade: 5, tipo: 'nova' },
      { id: 1466, titulo: 'Nova Locação Rio das Pedras 301', dataConclusao: '2025-12-20', prioridade: 3, tipo: 'sistema' },
      { id: 1890, titulo: 'Verificar documentação', dataConclusao: '2025-12-10', prioridade: 8, tipo: 'sistema' },
      { id: 1950, titulo: 'Email: Dúvida sobre reajuste', dataConclusao: '2025-12-09', prioridade: 2, tipo: 'nova' }, // A "nova" mais urgente
    ];

    // Simula a obtenção do ID da tarefa que está atualmente selecionada na tela.
    // No futuro, isso virá do estado da aplicação ou de um elemento do DOM.
    // Para testar, você pode trocar este valor para 1245.
    const idTarefaSelecionadaAtualmente = null; // Ex: 1245;

    // 1. Calcula o score de prioridade para cada tarefa e já separa por tipo.
    const tarefasComScore = listaDeTarefas.map(tarefa => {
      // Converte a data de conclusão para um número (timestamp em milissegundos) para poder somar.
      const valorData = new Date(tarefa.dataConclusao).getTime();
      
      // A prioridade da tarefa (0-10) é somada.
      // NOTA: O timestamp é um número muito grande. Para que a prioridade (0-10) tenha um impacto real,
      // ela pode precisar ser multiplicada por um fator grande. Por exemplo, `tarefa.prioridade * 86400000`
      // faria com que cada ponto de prioridade equivalesse a um dia.
      // Por enquanto, somamos diretamente para manter a simplicidade da lógica inicial.
      const score = valorData + tarefa.prioridade;

      return {
        ...tarefa, // Mantém os dados originais da tarefa
        score: score // Adiciona o score calculado
      };
    }); // fim do .map()

    // 2. Separa as tarefas em duas listas e ordena cada uma pelo score.
    const tarefasNovas = tarefasComScore
      .filter(t => t.tipo === 'nova')
      .sort((a, b) => a.score - b.score);

    const tarefasSistema = tarefasComScore
      .filter(t => t.tipo === 'sistema')
      .sort((a, b) => a.score - b.score);

    // 3. Monta a lista final intercalando as tarefas.
    const listaFinalOrdenada = [];
    const tamanhoMaximo = Math.max(tarefasNovas.length, tarefasSistema.length);

    for (let i = 0; i < tamanhoMaximo; i++) {
      // Adiciona uma tarefa "nova", se houver.
      if (tarefasNovas[i]) {
        listaFinalOrdenada.push(tarefasNovas[i]);
      } // fim do if
      // Adiciona uma tarefa do "sistema", se houver.
      if (tarefasSistema[i]) {
        listaFinalOrdenada.push(tarefasSistema[i]);
      } // fim do if
    } // fim do for

    // 4. Encontra a próxima tarefa a ser selecionada a partir da lista final.
    let proximaTarefa = listaFinalOrdenada[0]; // Por padrão, é a primeira da lista.

    // 5. Verifica se a tarefa mais urgente já é a que está selecionada.
    if (proximaTarefa && proximaTarefa.id === idTarefaSelecionadaAtualmente) {
      // Se a tarefa mais urgente já estiver selecionada e houver uma segunda tarefa na lista...
      if (listaFinalOrdenada.length > 1) {
        // ...pula para a segunda tarefa mais urgente.
        proximaTarefa = listaFinalOrdenada[1];
      } // fim do if (listaFinalOrdenada.length > 1)
    } // fim do if (proximaTarefa.id === idTarefaSelecionadaAtualmente)

    // 6. Executa a ação de "abrir" ou "destacar" a próxima tarefa.
    if (proximaTarefa) {
      // alert(`A próxima tarefa é: #${proximaTarefa.id} - ${proximaTarefa.titulo}`);
      // Em vez de um alerta, agora vamos preencher o accordion "Tarefa Selecionada".
      abrirDetalheTarefa(proximaTarefa);
    } else {
      alert("Parabéns, você não tem tarefas pendentes!");
    } // fim do if (proximaTarefa)
  }; // fim da função selecionarProximaTarefa

  /**
   * Preenche o accordion "Tarefa Selecionada" com os detalhes da tarefa.
   * @param {object} tarefa - O objeto da tarefa a ser exibida.
   */
  const abrirDetalheTarefa = (tarefa) => {
    // Encontra o accordion da tarefa selecionada e seu conteúdo.
    const accordionGroup = document.querySelector('details.accordion-group[open]');
    if (!accordionGroup || !accordionGroup.querySelector('summary').textContent.includes('Tarefa Selecionada')) {
      console.error('Accordion "Tarefa Selecionada" não encontrado ou não está aberto.');
      return;
    } // fim do if

    const accordionContent = accordionGroup.querySelector('.accordion-content');
    
    // Monta o HTML com os detalhes da tarefa.
    // Esta é uma estrutura básica que pode ser expandida no futuro.

    // --- Lógica de Ordenação ---
    // Ordena subtarefas: 1. Parciais, 2. Não iniciadas, 3. Concluídas
    const subtasks = [
      { id: 1, text: 'Verificar documentação do inquilino', status: 'Pendente 1/3', completed: 1, total: 3 },
      { id: 2, text: 'Agendar vistoria do imóvel', status: 'Concluída 3/3', completed: 3, total: 3 },
      { id: 3, text: 'Emitir contrato de locação', status: 'Pendente 0/2', completed: 0, total: 2 },
    ].sort((a, b) => {
      const aIsCompleted = a.completed === a.total;
      const bIsCompleted = b.completed === b.total;
      if (aIsCompleted !== bIsCompleted) return aIsCompleted ? 1 : -1;
      if (a.completed > 0 !== b.completed > 0) return a.completed > 0 ? -1 : 1;
      return a.id - b.id; // Mantém ordem de criação como desempate
    });

    // Ordena documentos: Vencidos/próximos de vencer primeiro.
    const documents = [
      { id: 104, name: 'Renda 02', status: 'Vencido 35 dias', days: -35, type: 'attached' },
      { id: 103, name: 'Renda 01', status: 'Vencido 05 dias', days: -5, type: 'attached' },
      { id: 102, name: 'Residência', status: 'Validade: 10 Dias', days: 10, type: 'attached' },
      { id: 101, name: 'CNH', status: 'Validade: 1290 dias', days: 1290, type: 'attached' },
      { id: 201, name: 'Certidão de nascimento', status: 'Opcional', type: 'optional' },
      { id: 202, name: 'Termo Cartório Email', status: 'Obrigatório', type: 'required' },
    ].sort((a, b) => {
      const typeOrder = { required: 1, attached: 2, optional: 3 };
      const aSort = typeOrder[a.type] || 99;
      const bSort = typeOrder[b.type] || 99;

      if (aSort !== bSort) return aSort - bSort;
      if (a.type === 'attached') return a.days - b.days;
      return a.id - b.id;
    });
    // --- Fim da Lógica de Ordenação ---

    accordionContent.innerHTML = `
      <div class="task-details-container">
        <!-- Controles de Data e Prioridade -->
        <div class="task-header-controls">
          <div class="form-field">
            <label for="task-due-date">Data de Conclusão:</label>
            <input type="date" id="task-due-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-field">
            <label for="task-due-time">Hora (opcional):</label>
            <input type="time" id="task-due-time" class="form-input">
          </div>
          <div class="form-field">
            <label for="task-priority">Prioridade:</label>
            <select id="task-priority" class="form-input">
              <option value="0">0 (Urgente)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5" selected>5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10 (Baixa)</option>
            </select>
          </div>
        </div>

        <!-- Quadro de Resumo (Memo) -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Resumo da Tarefa #${tarefa.id} - ${tarefa.titulo}</h4>
            <button id="memo-edit-btn" class="icon-btn" title="Editar Resumo" data-mode="edit">✏️</button>
          </div>
          <textarea id="memo-textarea" class="form-input memo-area" readonly>Esta é a área principal de trabalho da tarefa.

Controles Principais (Topo):
Aqui você define a data de conclusão, a hora (opcional) e a prioridade da tarefa (0 a 10). Esses valores são usados para calcular a urgência da tarefa no sistema.

Resumo da Tarefa (este quadro):
Este campo serve para descrever o objetivo geral e os detalhes importantes da tarefa. Por padrão, ele é somente leitura. Clique no ícone de lápis (✏️) para editar o texto. Ao clicar, o ícone mudará para um disquete (💾). Clique no disquete para salvar suas alterações.

Subtarefas:
Liste aqui os passos ou ações necessárias para concluir a tarefa principal.
- Ordenação: A lista é organizada para focar no que é mais importante: primeiro as tarefas parcialmente concluídas, depois as não iniciadas e, por último, as já concluídas.
- Seleção: Clique em uma subtarefa para ver seu checklist detalhado no quadro abaixo.

Documentos:
Anexe e gerencie os documentos relacionados a esta tarefa.
- Ordenação: A lista é ordenada por criticidade: primeiro os documentos "Obrigatórios" pendentes, depois os anexados (ordenados por vencimento), e por último os "Opcionais" pendentes.
- Seleção: Clique em um documento para ver seus detalhes e os arquivos anexados no quadro abaixo.

Quadro de Detalhes (abaixo):
Este quadro é dinâmico. Ele exibirá o checklist da subtarefa selecionada ou os detalhes e arquivos do documento selecionado.

Movimentações e Logs (final da página):
Use os quadros abaixo para adicionar novas informações ao histórico da tarefa e para consultar o log de todas as ações realizadas no sistema.</textarea>
        </div>

        <!-- Container para os quadros de Subtarefas e Documentos -->
        <div class="quadro-col-container">

          <!-- Quadro de Subtarefas -->
          <div class="task-quadro">
            <div class="quadro-header">
              <h4>Subtarefas</h4>
              <button id="add-subtask-btn" class="icon-btn" title="Adicionar Subtarefa">+</button>
            </div>
            <ul id="subtask-list" class="item-list-container">${subtasks.map(task => `
              <li class="subtask-item" data-subtask-id="${task.id}">
                <span>${task.text}</span>
                <span class="item-status ${task.completed === task.total ? 'status-completed' : 'status-pending'}">${task.status}</span>
              </li>`).join('')}</ul>
          </div>

          <!-- Quadro de Documentos -->
          <div class="task-quadro">
            <div class="quadro-header">
              <h4>Documentos</h4>
              <button id="add-document-btn" class="icon-btn" title="Adicionar Documento">+</button>
            </div>
            <ul id="document-list" class="item-list-container">${documents.map(doc => `
              <li class="document-item" data-document-id="${doc.id}" data-type="${doc.type}">
                <span>${doc.name}</span>
                <span class="item-status ${
                  doc.type === 'required' ? 'status-obrigatorio' :
                  doc.type === 'optional' ? 'status-opcional' :
                  doc.days < 0 ? 'status-expired' : 
                  doc.days <= 30 ? 'status-warning' : 'status-valid'
                }">${doc.status}</span>
              </li>`).join('')}</ul>
          </div>
        </div>

        <!-- Quadro Dinâmico (Checklist ou Detalhes do Documento) -->
        <div id="dynamic-details-quadro" class="task-quadro">
          <!-- O conteúdo aqui será preenchido dinamicamente -->
          <div class="quadro-header">
            <h4>Checklist</h4>
          </div>
          <p class="placeholder-text">Selecione uma subtarefa acima para ver seu checklist.</p>
        </div>

        <!-- Quadro para Adicionar Movimentação -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Adicionar Movimentação</h4>
          </div>
          <textarea class="form-input" rows="4" placeholder="Digite aqui uma nova informação, comentário ou atualização sobre a tarefa..."></textarea>
          <button class="page-header-btn" style="align-self: flex-end;">Salvar Movimentação</button>
        </div>

        <!-- Quadro de Histórico de Movimentações -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Histórico de Movimentações</h4>
          </div>
          <div class="log-list-container">
            <p class="log-item"><strong>02/12/2025 - 11:40 - Usuário 03:</strong> Cliente ligou informando que o vazamento parece ter piorado durante a noite.</p>
            <p class="log-item"><strong>01/12/2025 - 15:25 - Usuário 01:</strong> Contato inicial realizado com o cliente. Agendada visita técnica para amanhã.</p>
          </div>
        </div>

        <!-- Quadro de Log do Sistema -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Log do Sistema</h4>
          </div>
          <div class="log-list-container">
            <p class="log-item">01/12/2025 - 15:20 - Usuario 01: Criou este chamado com data de conclusão para xx/xx/xxxx</p>
            <p class="log-item">02/12/2025 - 09:41 - Usuário 02: Adicionou Subtarefa: Agendar Vistoria do Imóvel</p>
            <p class="log-item">02/12/2025 - 09:41 - Usuário 02: Adicionou Subtarefa: Emitir contrato de Locação</p>
            <p class="log-item">02/12/2025 - 11:25 - Usuário 03: Concluiu  Subtarefa: Item 1 do checklist (ex: copia do RG) da subtarefa Agendar vistoria do imóvel</p>
            <p class="log-item">02/12/2025 - 11:25 - Usuario 02: Adicionou Documento: CNH</p>
            <p class="log-item">02/12/2025 - 11:30 - Usuario 03: Adicionou Documento: Residencia</p>
            <p class="log-item"><strong>03/12/2025 - 16:30 - Usuario 04:</strong> Alterou o Resumo da Tarefa, texto anterior: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim.</p>
          </div>
        </div>
      </div>
    `;
  }; // fim da função abrirDetalheTarefa

  /**
   * Atualiza o quadro de checklist com base na subtarefa selecionada.
   * @param {string} subtaskId - O ID da subtarefa que foi clicada.
   */
  const atualizarQuadroChecklist = (subtaskId) => {
    const dynamicQuadro = document.getElementById('dynamic-details-quadro');
    if (!dynamicQuadro) return;

    // Garante que o quadro de detalhes do documento seja limpo/ocultado
    dynamicQuadro.style.display = 'flex';

    // Simulação: Monta um checklist de exemplo. No futuro, isso virá da API.
    dynamicQuadro.innerHTML = `
      <div class="quadro-header">
        <h4>Checklist da Subtarefa #${subtaskId}</h4>
        <button class="icon-btn close-dynamic-quadro-btn" title="Fechar">✖</button>
      </div>
      <ul class="checklist-container">
        <li><input type="checkbox" id="chk1" checked> <label for="chk1">Item 1 do checklist (ex: Cópia do RG)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
        <li><input type="checkbox" id="chk2"> <label for="chk2">Item 2 do checklist (ex: Comprovante de Renda)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
        <li><input type="checkbox" id="chk3"> <label for="chk3">Item 3 do checklist (ex: Análise de Crédito)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
      </ul>
    `;
  }; // fim da função atualizarQuadroChecklist

  /**
   * Atualiza o quadro de detalhes com base no documento selecionado.
   * @param {string} documentId - O ID do documento que foi clicado.
   */
  const atualizarQuadroDocumento = (documentId) => {
    const dynamicQuadro = document.getElementById('dynamic-details-quadro');
    const clickedItem = document.querySelector(`.document-item[data-document-id="${documentId}"]`);
    const docType = clickedItem ? clickedItem.dataset.type : null;

    if (!dynamicQuadro) return;

    // Garante que o quadro seja exibido
    dynamicQuadro.style.display = 'flex';

    // --- Dados de Demonstração dos Arquivos ---
    const links = [
      'https://cdn.jotfor.ms/templates/screenshot/pdf-templates/carta-de-verificacao-de-emprego.png?v=2243724803',
      'https://img.freepik.com/psd-gratuitas/modelo-de-papel-de-carta-para-empresas-e-empresas-modernas_120329-3768.jpg?semt=ais_hybrid&w=740&q=80',
      'https://pt.smartsheet.com/sites/default/files/2024-03/ic-library-management-system-project-documentation-10683-word_pt.png'
    ];

    const documentFilesMap = {
      '101': Array(2).fill(0).map((_, i) => ({ name: `cnh_arquivo_${i + 1}.png`, url: links[i % links.length] })), // CNH: 2 arquivos
      '102': Array(1).fill(0).map((_, i) => ({ name: `residencia_comp_${i + 1}.pdf`, url: links[i % links.length] })), // Residencia: 1 arquivo
      '103': Array(5).fill(0).map((_, i) => ({ name: `renda01_holerite_${i + 1}.jpg`, url: links[i % links.length] })), // Renda 01: 5 arquivos
      '104': Array(7).fill(0).map((_, i) => ({ name: `renda02_irpf_${i + 1}.pdf`, url: links[i % links.length] })), // Renda 02: 7 arquivos
    };

    const files = documentFilesMap[documentId] || [];
    let filesTableHTML = '';
    if (files.length > 0) {
      filesTableHTML = files.map(file => `
        <tr>
          <td>
            <div class="file-row-layout"><button class="table-action-btn" title="Alterar informações do arquivo">✏️</button><a href="${file.url}" target="_blank" class="file-link">${file.name}</a><button class="table-action-btn btn-danger-icon" title="Excluir arquivo">🗑️</button></div>
          </td>
        </tr>`).join('');
    }
    // --- Fim dos Dados de Demonstração ---

    // Simulação: Monta os detalhes do documento. No futuro, isso virá da API.
    // Se o documento for do tipo 'attached' (já existe), mostra os detalhes e a lista de arquivos.
    if (docType === 'attached') {
      dynamicQuadro.innerHTML = `
        <div class="quadro-header">
          <h4>Detalhes do Documento #${documentId}</h4>
          <button class="icon-btn close-dynamic-quadro-btn" title="Fechar">✖</button>
        </div>
        <div class="document-details-content">
          <div class="document-form">
            <div class="form-field">
              <label for="doc-emission-date">Data de Emissão:</label>
              <input type="date" id="doc-emission-date" class="form-input" value="2022-05-20">
            </div>
            <div class="form-field">
              <label for="doc-expiry-date">Data de Validade:</label>
              <input type="date" id="doc-expiry-date" class="form-input" value="2026-05-19">
            </div>
            <div class="form-field">
              <label for="doc-type">Tipo do Documento:</label>
              <input type="text" id="doc-type" class="form-input" value="CNH" placeholder="Digite para buscar...">
            </div>
            <!-- Tabela de Arquivos Anexados -->
            <div class="table-container document-files-table">
              <table class="point-table">
                <tbody>${filesTableHTML}</tbody>
              </table>
            </div>
            <div class="document-actions">
              <button class="page-header-btn">Adicionar Páginas</button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Se for 'required' ou 'optional', mostra um formulário para adicionar o documento.
      const docName = clickedItem ? clickedItem.querySelector('span').textContent : '';
      dynamicQuadro.innerHTML = `
        <div class="quadro-header">
          <h4>Adicionar Documento: ${docName}</h4>
          <button class="icon-btn close-dynamic-quadro-btn" title="Fechar">✖</button>
        </div>
        <div class="document-details-content">
          <div class="document-form">
            <div class="form-field">
              <label for="doc-emission-date">Data de Emissão:</label>
              <input type="date" id="doc-emission-date" class="form-input">
            </div>
            <div class="form-field">
              <label for="doc-expiry-date">Data de Validade:</label>
              <input type="date" id="doc-expiry-date" class="form-input">
            </div>
            <div class="form-field">
              <label for="doc-type">Tipo do Documento:</label>
              <input type="text" id="doc-type" class="form-input" value="${docName}" readonly>
            </div>
            <div class="document-actions">
              <button class="page-header-btn">Adicionar Documento</button>
            </div>
          </div>
        </div>
      `;
    } // fim do if (docType)
  }; // fim da função atualizarQuadroDocumento

  /**
   * Encontra grupos de botões e iguala a largura de todos eles com base no mais largo do grupo.
   * @param {string} containerSelector - O seletor para os contêineres que agrupam os botões (ex: '.search-controls').
   */
  const equalizeButtonWidths = (containerSelector) => {
    // Encontra todos os contêineres de botões na página.
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach(container => {
      const buttons = container.querySelectorAll('.page-header-btn');
      if (buttons.length === 0) return; // Pula se não houver botões no grupo.

      let maxWidth = 0;

      // 1. Reseta a largura e encontra a largura máxima.
      buttons.forEach(button => {
        button.style.width = 'auto'; // Reseta para medir a largura natural.
        const buttonWidth = button.offsetWidth;
        if (buttonWidth > maxWidth) {
          maxWidth = buttonWidth;
        }
      }); // fim do forEach para medir

      // 2. Aplica a largura máxima a todos os botões do grupo.
      // Usamos Math.ceil para arredondar para cima e evitar quebras por subpixels.
      const finalWidth = Math.ceil(maxWidth);
      buttons.forEach(button => {
        button.style.width = `${finalWidth}px`;
      }); // fim do forEach para aplicar

    }); // fim do forEach containers

  }; // fim da função equalizeButtonWidths

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (!page) return; // Ignora botões sem data-page
      
      // Atualiza o estado ativo e carrega a página
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      loadPage(page);

      // --- LÓGICA PARA RECOLHER/OCULTAR O MENU APÓS O CLIQUE ---
      if (isMobileView) {
        // Em mobile, sempre fecha o menu (remove a classe 'sidebar-open')
        body.classList.remove('sidebar-open');
      } else {
        // Em desktop, apenas recolhe o menu se ele estiver expandido
        body.classList.add('sidebar-collapsed');
      }
    });
  });

  // Função para lidar com o redimensionamento da janela
  const handleResize = () => {
    const wasMobile = isMobileView;
    isMobileView = window.innerWidth <= 768;

    // Se o estado mudou (cruzou o breakpoint de 768px)
    if (wasMobile !== isMobileView) {
      // Limpa as classes de estado para evitar conflitos
      body.classList.remove('sidebar-open', 'sidebar-collapsed');

      // Se a tela se tornou desktop, aplica o estado padrão de desktop
      if (!isMobileView) {
        body.classList.add('sidebar-collapsed');
      }
    }
  };

  // Adiciona o listener para o evento de redimensionamento
  window.addEventListener('resize', handleResize);

  // Executa a função uma vez no carregamento para definir o estado inicial correto
  handleResize();

  // Carrega a página inicial por padrão, clicando no primeiro botão que tem um 'data-page'
  const initialPageButton = document.querySelector('.nav-btn[data-page]');
  if (initialPageButton) {
    initialPageButton.click();
  }

  // Lógica do botão de Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'Index.html';
    });
  }
}); // Fim do DOMContentLoaded