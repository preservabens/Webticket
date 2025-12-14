document.addEventListener('DOMContentLoaded', () => { // Início do DOMContentLoaded
  const body = document.body;
  const contentTarget = document.getElementById('content-target');
  const navButtons = document.querySelectorAll('.nav-btn');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

  // Variável para controlar o mês/ano do espelho de ponto
  let pointSheetDate = new Date();

  // Mantém o controle do estado atual da visualização para detectar mudanças
  let isMobileView = window.innerWidth <= 768;

  // Variável global para passar dados da tarefa selecionada entre páginas (Busca -> Tarefas)
  window.selectedTaskData = null;

  // Variável global para passar o ID do processo selecionado para o editor
  window.currentProcessId = null;
  window.currentProcessName = null;

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

  // --- CRIAÇÃO DO BOTÃO DE AJUDA GLOBAL ---
  const globalHelpBtn = document.createElement('div');
  globalHelpBtn.className = 'global-help-btn';
  globalHelpBtn.innerHTML = '?';
  globalHelpBtn.title = 'Manual do Sistema';
  globalHelpBtn.addEventListener('click', () => {
      alert('Abrir Manual do Sistema (Simulação).');
  });
  body.appendChild(globalHelpBtn);


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

    // Verifica se o clique foi no botão de editar o título da tarefa
    if (event.target.id === 'edit-task-title-btn') {
      // REGRAS DE NEGÓCIO: No futuro, este botão abrirá um modal para alterar o tipo e o título da tarefa.
      // Por enquanto, exibe um alerta informativo.
      alert('Este botão irá abrir uma janela para selecionar o tipo do chamado e alterar o nome.');
    } // fim do if (edit-task-title-btn)

    // Verifica se o clique foi no botão de Configurações do Documento (Engrenagem)
    const docSettingsBtn = event.target.closest('#doc-settings-btn');
    if (docSettingsBtn) {
      const docId = docSettingsBtn.dataset.docId;
      renderDocumentSettings(docId);
    }

    // Verifica se o clique foi no botão de Adicionar Documento (+)
    const addDocBtn = event.target.closest('#add-document-btn');
    if (addDocBtn) {
      renderDocumentSettings(null); // null indica modo de adição
    }

    // Verifica se o clique foi no botão de Excluir Documento (Lixeira)
    const deleteDocBtn = event.target.closest('#delete-document-btn');
    if (deleteDocBtn) {
      if (confirm('Tem certeza que deseja excluir este documento da tarefa?')) {
        alert('Simulação: Documento excluído com sucesso.');
        // Aqui fecharia o quadro ou recarregaria a lista
        document.getElementById('dynamic-details-quadro').style.display = 'none';
      }
    }

    // Verifica se o clique foi no botão de fechar o quadro dinâmico
    const closeDynamicQuadroBtn = event.target.closest('.close-dynamic-quadro-btn');
    if (closeDynamicQuadroBtn) {
      // Verifica se deve voltar para a visualização anterior (ex: Configurações -> Detalhes)
      if (closeDynamicQuadroBtn.dataset.backTo) {
        atualizarQuadroDocumento(closeDynamicQuadroBtn.dataset.backTo);
        return;
      }

      const dynamicQuadro = document.getElementById('dynamic-details-quadro');
      if (dynamicQuadro) {
        // Oculta o quadro
        dynamicQuadro.style.display = 'none';
        // Limpa o conteúdo
        dynamicQuadro.innerHTML = '<p class="placeholder-text">Selecione uma subtarefa para ver seu checklist e documentos.</p>';
      } // fim do if (dynamicQuadro)

      // Remove a classe 'selected' de qualquer item de subtarefa ou documento
      document.querySelectorAll('.subtask-item.selected, .document-item.selected').forEach(item => {
        item.classList.remove('selected');
      });
    } // fim do if (closeDynamicQuadroBtn)

    // Verifica se o clique foi em um cabeçalho de quadro colapsável (Subtarefas/Documentos)
    const collapsibleHeader = event.target.closest('.task-quadro .quadro-header');
    if (collapsibleHeader) {
        // Impede que o clique nos botões dentro do header (ex: '+') dispare o colapso.
        if (event.target.closest('.icon-btn')) {
            return;
        }
        const quadro = collapsibleHeader.closest('.task-quadro');
        if (quadro && (quadro.querySelector('#subtask-list') || quadro.querySelector('#document-list'))) {
            quadro.classList.toggle('is-collapsed');
        }
    }

    // Verifica se o clique foi em uma subtarefa
    const subtaskItem = event.target.closest('.subtask-item');
    if (subtaskItem) {
      // Se estiver bloqueada, não faz nada
      if (subtaskItem.classList.contains('blocked')) {
        return;
      }

      // Remove a seleção de outros itens
      document.querySelectorAll('.subtask-item.selected').forEach(item => item.classList.remove('selected'));
      // Adiciona a classe de seleção ao item clicado
      subtaskItem.classList.add('selected');
      // Exibe os detalhes da subtarefa (checklist e documentos)
      exibirDetalhesSubtarefa(subtaskItem.dataset.subtaskId);
    } // fim do if (subtaskItem)

    // Verifica se o clique foi em um item de documento
    const documentItem = event.target.closest('.document-item');
    if (documentItem) {
      // Remove a seleção de outros itens
      document.querySelectorAll('.subtask-item.selected, .document-item.selected').forEach(item => item.classList.remove('selected'));
      // Adiciona a classe de seleção ao item clicado (dentro do seu próprio quadro)
      documentItem.classList.add('selected');
      atualizarQuadroDocumento(documentItem.dataset.documentId);
    } // fim do if (documentItem)

    // Verifica se o clique foi no botão de instruções do checklist
    const instructionBtn = event.target.closest('.checklist-instruction-btn');
    if (instructionBtn) {
      const listItem = instructionBtn.closest('li');
      const label = listItem.querySelector('label');
      const currentTitle = label ? label.textContent : 'Item do Checklist';
      
      // Simulação de instruções (Memo)
      const currentMemo = `Para realizar esta tarefa, consulte o manual em:\nhttps://www.preservabens.com.br\n\nCertifique-se de validar os dados antes de concluir.`;

      const modalTitle = document.getElementById('modal-title');
      if (modalTitle) modalTitle.textContent = 'Detalhes do Item';

      const modalContent = document.getElementById('modal-content');
      
      // Lógica de permissão baseada no Ticket (Interno/Externo)
      const ticketTypeSelect = document.getElementById('task-ticket-type');
      const isTicketInterno = ticketTypeSelect ? ticketTypeSelect.value === 'interno' : true;
      const checkboxDisabled = isTicketInterno ? 'disabled' : '';

      modalContent.innerHTML = `
        <div class="document-form">
          <div class="form-field">
            <label for="checklist-item-title">Título:</label>
            <input type="text" id="checklist-item-title" class="form-input" value="${currentTitle}">
          </div>
          <div class="form-field">
            <label for="checklist-item-memo">Instruções (Memo):</label>
            <textarea id="checklist-item-memo" class="form-input memo-area" rows="6">${currentMemo}</textarea>
            <small class="text-muted">Links inseridos serão suportados na visualização.</small>
          </div>
          <div class="checkbox-container" style="margin-top: 10px; display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" id="checklist-client-view" ${checkboxDisabled}>
            <label for="checklist-client-view">Cliente pode ver a conclusão do checklist</label>
          </div>
          <div class="document-actions">
            <button id="save-checklist-btn" class="page-header-btn">Salvar</button>
          </div>
        </div>
      `;

      // Exibe o modal.
      modalOverlay.style.display = 'flex';

      // Lógica de Cores do Modal (Interno/Externo)
      const clientViewCheck = document.getElementById('checklist-client-view');
      const modalInputs = modalContent.querySelectorAll('.form-input');
      
      const updateModalColors = () => {
          const isPublic = clientViewCheck.checked;
          const color = isPublic ? '#F1F2F3' : '#FCF8EC';
          modalInputs.forEach(input => input.style.backgroundColor = color);
      };

      if (clientViewCheck) {
          clientViewCheck.addEventListener('change', updateModalColors);
          updateModalColors(); // Inicializa com a cor correta
      }

      // Adiciona evento ao botão de salvar (dentro do modal)
      const saveBtn = document.getElementById('save-checklist-btn');
      if (saveBtn) {
        saveBtn.onclick = () => {
           const newTitle = document.getElementById('checklist-item-title').value;
           if (label) label.textContent = newTitle;
           // Aqui salvaria o memo também via API
           alert('Item do checklist atualizado com sucesso (Simulação).');
           modalOverlay.style.display = 'none';
        };
      }
    } // fim do if (instructionBtn)

    // Verifica se o clique foi no botão "Buscar" (na página busca.html)
    if (event.target.id === 'btn-buscar') {
      const results = document.getElementById('search-results-processos');
      if (results) {
        const listContainer = results.querySelector('.custom-list-container');
        const allTasks = getMockTasks();
        
        // Distribuição das tarefas conforme solicitado:
        // 1. Fulano: 1 tarefa
        // 2. Ciclano: 0 tarefas
        // 3. Beltrano: Todas as outras
        const clients = [
          { name: 'Fulano de Tal', info: 'Rua Xxxxx - Imóvel - Locatário', tasks: [allTasks[0]] },
          { name: 'Ciclano de Tal', info: 'Rua yyyyy - Pessoa Física - Lead', tasks: [] },
          { name: 'Beltrano de Tal', info: 'Rua zzzzzz - Pessoa Jurídica - Fornecedor', tasks: allTasks.slice(1) }
        ];

        // Gera o HTML dos resultados
        listContainer.innerHTML = clients.map(client => {
          const tasksHtml = client.tasks.length > 0 
            ? client.tasks.map(t => {
                const [day, month, year] = t.dataConclusao.split('/');
                const dataTarefa = new Date(year, month - 1, day);
                const hoje = new Date();
                hoje.setHours(0,0,0,0);
                const isAtrasada = dataTarefa < hoje;
                const dataClass = isAtrasada ? 'text-danger' : 'text-muted';

                return `
                  <div class="task-card" data-task-id="${t.id}">
                    <div class="card-header">
                      <span>#${t.id} <span title="Prioridade">🚨 ${t.prioridade}</span></span>
                      <span class="${dataClass}">${t.dataConclusao}</span>
                    </div>
                    <h4 class="card-title">${t.titulo}</h4>
                    <div class="card-meta">
                      <span>${t.tipo}</span>
                      <span>${t.relacao}</span>
                    </div>
                  </div>`;
              }).join('')
            : '<p class="text-muted">Nenhuma tarefa encontrada.</p>';

          return `
            <details class="custom-list-item">
              <summary class="custom-list-summary">
                <div class="summary-info">
                  <strong>${client.name}</strong>
                  <small>${client.info}</small>
                </div>
                <span class="arrow-icon">▼</span>
              </summary>
              <div class="custom-list-content">
                <h6>Tarefas deste cliente:</h6>
                ${tasksHtml}
              </div>
            </details>
          `;
        }).join('');

        results.style.display = 'block';
      }
    }

    // --- REGRAS DE NEGÓCIO: LÓGICA DA BUSCA EM ETAPAS ---
    // O fluxo de busca é dividido em etapas para guiar o usuário.
    // 1. O usuário digita um termo e clica em "Buscar".
    // 2. A primeira tabela (Processos) exibe pessoas/imóveis relacionados ao termo.
    // 3. A segunda tabela (Tarefas) exibe chamados relacionados ao termo.
    // 4. Se o usuário clica em um item da primeira tabela, a segunda é filtrada para mostrar apenas chamados daquele item.
    // 5. Se o usuário clica em um item da segunda tabela, um resumo é exibido na terceira etapa.
    // 6. O botão "Trabalhar com esse chamado" carrega a tarefa na área de trabalho principal.

    // 3. Clique em um card de tarefa (Tarefas na Busca ou Lista)
    const tarefaCardBusca = event.target.closest('#search-results-processos .task-card');
    if (tarefaCardBusca) {
      const taskId = tarefaCardBusca.dataset.taskId;
      // Simula objeto da tarefa
      const tarefaEncontrada = {
        id: taskId,
        titulo: 'Chamado Carregado da Busca',
        dataConclusao: '2025-12-25',
        prioridade: 5,
        tipo: 'sistema'
      };
      
      // Define a tarefa selecionada globalmente e navega para a página de tarefas
      window.selectedTaskData = tarefaEncontrada;
      // Atualiza o menu ativo visualmente
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.nav-btn[data-page="tarefas.html"]').classList.add('active');
      loadPage('tarefas.html');
    }
    // --- FIM DA LÓGICA DA BUSCA ---


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

    // Verifica se o clique foi no botão "Próxima Tarefa" dentro do accordion
    if (event.target.id === 'btn-proxima-tarefa-accordion') {
      selecionarProximaTarefa();
      return;
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
            // Captura o ID do processo se existir
            if (targetButton.dataset.processId) {
                window.currentProcessId = targetButton.dataset.processId;
                window.currentProcessName = targetButton.textContent;
            }
            loadPage(page);
        }
    }

  });

  /**
   * Controla a abertura e fechamento dos accordions de tarefas.
   * @param {string} fromSelector - Seletor do data-section do accordion a ser fechado.
   * @param {string} toSelector - Seletor do data-section do accordion a ser aberto.
   */
  const switchAccordionView = (fromSelector, toSelector) => {
    const allAccordions = document.querySelectorAll('.accordion-container .accordion-group');
    allAccordions.forEach(group => {
      const section = group.querySelector('.accordion-title')?.dataset.section;
      if (section === fromSelector) {
        group.removeAttribute('open');
      } else if (section === toSelector) {
        group.setAttribute('open', '');
      }
    });
  };
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
      if (page === 'busca.html') {
        initializeBuscaPage();
      }
      if (page === 'cadastros.html') {
        initializeCadastrosPage();
      }
      if (page === 'processos.html') {
        // Botões de processos agora são flexíveis e controlados via CSS (.process-btn)
      }
      if (page === 'processos/editor_fluxo.html') {
        initializeProcessEditor();
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

  // Função auxiliar para obter dados simulados de tarefas
  const getMockTasks = () => {
    return [
      { id: 1245, dataConclusao: '10/12/2025', prioridade: 1, tipo: 'Sistema', titulo: 'Vazamento de Gás', relacao: 'Inquilino - Apto 101' },
      { id: 1472, dataConclusao: '15/12/2025', prioridade: 5, tipo: 'Nova', titulo: 'Taxa Maior Lançada', relacao: 'Cliente - Empresa X' },
      { id: 1466, dataConclusao: '20/12/2025', prioridade: 3, tipo: 'Sistema', titulo: 'Nova Locação Rio das Pedras 301', relacao: 'Proprietário - Sr. José' },
      { id: 1890, dataConclusao: '10/12/2025', prioridade: 8, tipo: 'Sistema', titulo: 'Verificar documentação', relacao: 'Inquilino - Apto 302' },
      { id: 1950, dataConclusao: '09/12/2025', prioridade: 2, tipo: 'Nova', titulo: 'Email: Dúvida sobre reajuste', relacao: 'Cliente - Empresa Y' },
      { id: 2001, dataConclusao: '06/12/2025', prioridade: 0, tipo: 'Sistema', titulo: 'Reparo Urgente Calha', relacao: 'Condomínio Z' }, // Atrasada
      { id: 2002, dataConclusao: '05/12/2025', prioridade: 6, tipo: 'Nova', titulo: 'Cliente sem acesso ao sistema', relacao: 'Cliente - Empresa W' }, // Atrasada
    ];
  };

  // Função para inicializar a página de Busca e Listas
  const initializeBuscaPage = () => {

    // Encontra o accordion da Lista de Tarefas
    const allAccordions = document.querySelectorAll('.accordion-container .accordion-group');
    let listaTarefasAccordion = null;
    allAccordions.forEach(group => {
      const title = group.querySelector('.accordion-title').textContent;
      if (title.includes('Lista de Tarefas')) {
        listaTarefasAccordion = group;
      }
    });

    if (listaTarefasAccordion) {
      const content = listaTarefasAccordion.querySelector('.accordion-content');
      
      // Reconstrói o HTML do accordion para incluir os novos controles (Abas e Filtros)
      content.innerHTML = `
        <div class="task-list-controls" style="margin-bottom: 15px;">
            <div class="tabs-nav" style="margin-bottom: 10px;">
                <button class="tab-btn active" data-scope="user">Suas Tarefas</button>
                <button class="tab-btn" data-scope="sector">Setor</button>
                <button class="tab-btn" data-scope="all">Todas</button>
            </div>
            <div class="search-controls" style="background: #f9f9f9; padding: 10px; border-radius: 4px; border: 1px solid #eee;">
                <div class="form-field" style="flex: 1;">
                    <label style="font-size: 12px; font-weight: bold;">Status:</label>
                    <select id="task-filter-status" class="form-input">
                        <option value="active" selected>Ativas</option>
                        <option value="completed">Concluídas</option>
                        <option value="all">Todas</option>
                    </select>
                </div>
                <div class="form-field" style="flex: 2;">
                    <label style="font-size: 12px; font-weight: bold;">Ordenar por:</label>
                    <select id="task-filter-order" class="form-input">
                        <option value="due_priority_asc" selected>Data do Término + Prioridade: Menores primeiro</option>
                        <option value="due_priority_desc">Data do término + Prioridade: Maiores primeiro</option>
                        <option value="due_asc">Data do Término - Menores primeiro</option>
                        <option value="due_desc">Data do Término - Maiores primeiro</option>
                        <option value="created_asc">Data da criação - Antigas Primeiro</option>
                        <option value="created_desc">Data da criação - Recentes primeiro</option>
                        <option value="priority_asc">Prioridade - Menores primeiro</option>
                        <option value="priority_desc">Prioridade - Maiores primeiro</option>
                        <option value="recent">Mais Recente Primeiro</option>
                    </select>
                </div>
            </div>
        </div>
        <div id="main-task-list"></div>
      `;

      const taskListContainer = content.querySelector('#main-task-list');

      // --- REGRAS DE NEGÓCIO: Ordenação da Lista de Tarefas (Prioridade + Data) ---
      // 1. Simulação de dados da lista de tarefas, incluindo prioridade e tarefas atrasadas.
      let tarefas = getMockTasks();

      // Função de renderização filtrada e ordenada
      const renderFilteredList = () => {
        const activeTab = content.querySelector('.tab-btn.active').dataset.scope;
        const statusFilter = document.getElementById('task-filter-status').value;
        const orderFilter = document.getElementById('task-filter-order').value;

        // 1. Filtragem (Simulada)
        let filtered = tarefas.filter(t => {
            // Filtro de Status (Simulado, pois o mock não tem status explícito, assumimos todas ativas exceto se lógica disser o contrário)
            // Para simulação: IDs pares são "Concluídas" se o filtro for esse.
            const isCompleted = t.id % 2 === 0 && t.id > 2000; // Regra arbitrária para teste
            if (statusFilter === 'active' && isCompleted) return false;
            if (statusFilter === 'completed' && !isCompleted) return false;
            
            // Filtro de Escopo (Simulado)
            // Suas Tarefas: Padrão. Setor: IDs > 1500. Todas: Tudo.
            if (activeTab === 'user' && t.id > 1800) return false; 
            if (activeTab === 'sector' && t.id < 1500) return false;

            return true;
        });

        // 2. Ordenação
        filtered.sort((a, b) => {
            const getDataObj = (dateStr) => {
                const [day, month, year] = dateStr.split('/');
                return new Date(`${year}-${month}-${day}`);
            };
            
            const dateA = getDataObj(a.dataConclusao);
            const dateB = getDataObj(b.dataConclusao);
            
            // Cálculo Data Fictícia (Data + Prioridade)
            const getFictitiousDate = (t) => {
                const d = getDataObj(t.dataConclusao);
                d.setDate(d.getDate() + t.prioridade);
                return d;
            };

            switch (orderFilter) {
                case 'due_priority_asc': // Padrão
                    return getFictitiousDate(a) - getFictitiousDate(b);
                case 'due_priority_desc':
                    return getFictitiousDate(b) - getFictitiousDate(a);
                case 'due_asc':
                    return dateA - dateB;
                case 'due_desc':
                    return dateB - dateA;
                case 'created_asc': // Usando ID como proxy de criação
                    return a.id - b.id;
                case 'created_desc':
                case 'recent':
                    return b.id - a.id;
                case 'priority_asc': // Menor valor = Mais urgente (0)
                    return a.prioridade - b.prioridade;
                case 'priority_desc':
                    return b.prioridade - a.prioridade;
                default:
                    return a.id - b.id;
            }
        });

        // 3. Renderização
        if (taskListContainer) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            if (filtered.length === 0) {
                taskListContainer.innerHTML = '<p class="text-muted" style="padding: 10px;">Nenhuma tarefa encontrada com os filtros atuais.</p>';
                return;
            }

            taskListContainer.innerHTML = filtered.map(t => {
            const [day, month, year] = t.dataConclusao.split('/');
            const dataTarefa = new Date(year, month - 1, day);
            const isAtrasada = dataTarefa < hoje;
            const dataClass = isAtrasada ? 'text-danger' : 'text-muted';

            return `
                <div class="task-card" data-task-id="${t.id}">
                <div class="card-header">
                    <span>#${t.id} <span title="Prioridade">🚨 ${t.prioridade}</span></span>
                    <span class="${dataClass}">${t.dataConclusao}</span>
                </div>
                <h4 class="card-title">${t.titulo}</h4>
                <div class="card-meta">
                    <span>${t.tipo}</span>
                    <span>${t.relacao}</span>
                </div>
                </div>
            `;
            }).join('');
        }
      };

      // Event Listeners para os controles
      content.querySelectorAll('.tab-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              content.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
              e.target.classList.add('active');
              renderFilteredList();
          });
      });

      document.getElementById('task-filter-status').addEventListener('change', renderFilteredList);
      document.getElementById('task-filter-order').addEventListener('change', renderFilteredList);

      // Renderização Inicial
      renderFilteredList();
      
      const proximaTarefaBtn = document.getElementById('btn-proxima-tarefa-accordion');
      if (proximaTarefaBtn) {
        proximaTarefaBtn.title = "Ordena as tarefas por urgência (data + prioridade), intercalando tarefas novas e do sistema, e seleciona a mais importante.";
      }

      // Adiciona um listener para os cliques nos itens da lista de tarefas
      // Usando delegação de eventos para capturar cliques nos links
      if (taskListContainer) {
        taskListContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.task-card');
        if (card) {
          const taskId = card.dataset.taskId;
          // Simula a busca da tarefa pelo ID para abrir nos detalhes
          const tarefaSelecionada = tarefas.find(t => t.id.toString() === taskId) || { id: taskId, titulo: `Tarefa #${taskId}`, tipo: 'sistema', dataConclusao: '10/12/2025', prioridade: 5 };
          
          // Define a tarefa global e navega
          window.selectedTaskData = tarefaSelecionada;
          document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('.nav-btn[data-page="tarefas.html"]').classList.add('active');
          loadPage('tarefas.html');
        }
      });
    }
  }
  };

  // Função para inicializar a página de Cadastros
  const initializeCadastrosPage = () => {
    const container = document.getElementById('cadastros-view-container');
    if (!container) return;

    // Estado local da página
    let currentTab = 'imoveis';
    let isSearchVisible = false;
    let currentLimit = 50; // Limite inicial de itens exibidos (Padrão Load More)

    // Dados Mockados (Gerador simples)
    const generateMockData = (type, count) => {
      return Array.from({ length: count }, (_, i) => {
        const id = i + 1;
        if (type === 'imoveis') return { id, title: `Imóvel ${id} - Rua das Flores, ${100 + id}`, subtitle: `Bairro Centro - Matrícula ${5000 + id}` };
        if (type === 'condominios') return { id, title: `Condomínio Edifício Solar ${id}`, subtitle: `CNPJ: 00.000.000/000${id}-00` };
        if (type === 'pessoas') return { id, title: `Pessoa ${id} (PF/PJ)`, subtitle: `CPF/CNPJ: 000.000.000-${id < 10 ? '0' + id : id}` };
        if (type === 'locacao') return { id, title: `Contrato de Locação #${1000 + id}`, subtitle: `Imóvel: Rua X, Inquilino: Fulano ${id}` };
        if (type === 'venda') return { id, title: `Contrato de Venda #${2000 + id}`, subtitle: `Imóvel: Rua Y, Comprador: Ciclano ${id}` };
        return {};
      });
    };

    // Cache dos dados para não regerar sempre
    const dataCache = {
      imoveis: generateMockData('imoveis', 60), // 60 para testar paginação
      condominios: generateMockData('condominios', 15),
      pessoas: generateMockData('pessoas', 55),
      locacao: generateMockData('locacao', 20),
      venda: generateMockData('venda', 10)
    };

    // Função de Renderização Principal
    const render = () => {
      // Filtra os dados se houver busca
      const searchTerm = document.getElementById('cadastro-search-input')?.value.toLowerCase() || '';
      const allItems = dataCache[currentTab];
      const filteredItems = allItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.subtitle.toLowerCase().includes(searchTerm)
      );

      // Aplica o limite atual (Padrão Load More em vez de paginação)
      const displayItems = filteredItems.slice(0, currentLimit);
      const hasMore = filteredItems.length > currentLimit;

      container.innerHTML = `
        <div class="tabs-nav">
          <button class="tab-btn ${currentTab === 'imoveis' ? 'active' : ''}" data-tab="imoveis">Imóveis</button>
          <button class="tab-btn ${currentTab === 'condominios' ? 'active' : ''}" data-tab="condominios">Condomínios</button>
          <button class="tab-btn ${currentTab === 'pessoas' ? 'active' : ''}" data-tab="pessoas">Pessoas</button>
          <button class="tab-btn ${currentTab === 'locacao' ? 'active' : ''}" data-tab="locacao">Locação</button>
          <button class="tab-btn ${currentTab === 'venda' ? 'active' : ''}" data-tab="venda">Venda</button>
        </div>

        <div class="tab-controls">
          <button id="btn-toggle-search" class="icon-btn" title="Buscar">🔍</button>
          <button id="btn-new-cadastro" class="icon-btn" title="Novo Cadastro">➕</button>
          <div class="search-bar-container" style="display: ${isSearchVisible ? 'block' : 'none'}">
            <input type="text" id="cadastro-search-input" class="form-input" placeholder="Filtrar ${currentTab}..." value="${searchTerm}">
          </div>
        </div>

        <div class="cadastro-list">
          ${displayItems.length > 0 ? displayItems.map(item => `
            <div class="cadastro-item" data-id="${item.id}">
              <strong>${item.title}</strong><br>
              <small class="text-muted">${item.subtitle}</small>
            </div>
          `).join('') : '<p class="text-muted">Nenhum registro encontrado.</p>'}
        </div>
        
        <div class="pagination-info">
          Exibindo ${displayItems.length} de ${filteredItems.length} resultados
        </div>

        ${hasMore ? `
          <div class="load-more-controls" style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
            <button id="btn-load-more-50" class="page-header-btn">Carregar mais 50</button>
            <button id="btn-load-all" class="page-header-btn">Carregar Tudo</button>
          </div>
        ` : ''}
      `;

      attachEvents();
    };

    // Função para renderizar o formulário de cadastro (Novo/Editar)
    const renderForm = (itemId = null) => {
      const item = itemId ? dataCache[currentTab].find(i => i.id == itemId) : null;
      const title = item ? `Editar: ${item.title}` : `Novo Cadastro em ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}`;

      container.innerHTML = `
        <div class="page-header" style="margin-top: 0;">
          <h3>${title}</h3>
          <button id="btn-back-list" class="page-header-btn">Voltar para Lista</button>
        </div>
        <div class="document-form">
          <div class="form-field">
            <label>Nome / Título:</label>
            <input type="text" class="form-input" value="${item ? item.title : ''}">
          </div>
          <div class="form-field">
            <label>Descrição / Documento:</label>
            <input type="text" class="form-input" value="${item ? item.subtitle : ''}">
          </div>
          <div class="document-actions">
            <button class="page-header-btn" onclick="alert('Salvo com sucesso (Simulação)');">Salvar</button>
          </div>
        </div>
      `;
      
      document.getElementById('btn-back-list').addEventListener('click', render);
    };

    // Anexa os eventos aos elementos renderizados
    const attachEvents = () => {
      // Troca de abas
      container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentTab = e.target.dataset.tab;
          isSearchVisible = false; // Reseta busca ao trocar aba
          currentLimit = 50; // Reseta o limite ao trocar de aba para evitar listas gigantes desnecessárias
          render();
        });
      });

      // Toggle Busca
      document.getElementById('btn-toggle-search').addEventListener('click', () => {
        isSearchVisible = !isSearchVisible;
        render();
        if (isSearchVisible) {
          setTimeout(() => document.getElementById('cadastro-search-input').focus(), 50);
        }
      });

      // Input de Busca
      const searchInput = document.getElementById('cadastro-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
           const term = searchInput.value.toLowerCase();
           const items = container.querySelectorAll('.cadastro-item');
           let count = 0;
           items.forEach(item => {
             const text = item.innerText.toLowerCase();
             if (text.includes(term) && count < 50) {
               item.style.display = 'block';
               count++;
             } else {
               item.style.display = 'none';
             }
           });
           container.querySelector('.pagination-info').innerText = `Exibindo ${count} resultados (Filtrado)`;
        });
      }

      // Botões de Carregar Mais (Load More)
      const btnLoadMore50 = document.getElementById('btn-load-more-50');
      if (btnLoadMore50) {
        btnLoadMore50.addEventListener('click', () => {
          currentLimit += 50;
          render();
        });
      }

      const btnLoadAll = document.getElementById('btn-load-all');
      if (btnLoadAll) {
        btnLoadAll.addEventListener('click', () => {
          currentLimit = dataCache[currentTab].length; // Define o limite como o total de itens
          render();
        });
      }

      // Botão Novo
      document.getElementById('btn-new-cadastro').addEventListener('click', () => {
        renderForm();
      });

      // Clique no Item (Editar)
      container.querySelectorAll('.cadastro-item').forEach(item => {
        item.addEventListener('click', () => {
          renderForm(item.dataset.id);
        });
      });
    };

    // Renderização inicial
    render();
  };

  // Função para inicializar a página de tarefas (Visualização Única)
  const initializeTarefasPage = () => {
    // Se houver uma tarefa selecionada vinda da busca, carrega ela.
    // Caso contrário, tenta carregar a próxima tarefa automaticamente.
    if (window.selectedTaskData) {
      abrirDetalheTarefa(window.selectedTaskData);
      window.selectedTaskData = null; // Limpa após usar
    } else {
      // Por fim, chama a função para selecionar a próxima tarefa
      // Usamos um setTimeout para garantir que a interface tenha tempo de renderizar
      setTimeout(selecionarProximaTarefa, 100);
    }
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
      // switchAccordionView('lista-tarefas', 'tarefa-selecionada'); // Não é mais necessário pois não há accordions em tarefas.html
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
    // Verifica se estamos na página correta. Se não, redireciona.
    const taskViewContainer = document.getElementById('task-view-container');
    if (!taskViewContainer) {
      window.selectedTaskData = tarefa;
      loadPage('tarefas.html');
      return;
    }

    // 2. Atualiza o título da página (opcional, mas bom para contexto)
    const tipoTarefaCapitalized = tarefa.tipo.charAt(0).toUpperCase() + tarefa.tipo.slice(1);
    // taskAccordionTitle.innerHTML = `${tipoTarefaCapitalized} - ${tarefa.titulo} <button id="edit-task-title-btn" class="table-action-btn" title="Alterar tipo/nome da tarefa">✏️</button>`;
    
    // Atualiza o header da página se existir
    const pageTitle = document.querySelector('.page-title-group h2');
    if (pageTitle) pageTitle.textContent = `Tarefa: ${tarefa.titulo}`;

    // Monta o HTML com os detalhes da tarefa.
    // Esta é uma estrutura básica que pode ser expandida no futuro.

    // --- Lógica de Ordenação ---
    // Ordena subtarefas: 1. Parciais, 2. Não iniciadas, 3. Concluídas
    const subtasks = [
      { id: 1, text: 'Verificar documentação do inquilino', status: 'Pendente 1/3', completed: 1, total: 3, blocked: false },
      { id: 2, text: 'Agendar vistoria do imóvel', status: 'Concluída 3/3', completed: 3, total: 3, blocked: false },
      // Tarefa bloqueada simulando dependência
      { id: 3, text: 'Emitir contrato de locação', status: 'Aguardando', completed: 0, total: 2, blocked: true, dependency: 'Agendar vistoria do imóvel' },
    ];
    // Removida a ordenação automática para respeitar a ordem visual solicitada (Agendar -> Emitir)

    // Verifica se todos os checklists estão concluídos para habilitar o botão de conclusão
    const allChecklistsCompleted = subtasks.every(t => t.completed === t.total);
    const completeBtnDisabled = allChecklistsCompleted ? '' : 'disabled';
    const completeBtnTitle = allChecklistsCompleted ? 'Concluir esta tarefa' : 'Conclua todos os itens dos checklists para habilitar.';
    
    // Lógica Visual: Verde se completo, Vermelho Claro (igual Repetir: Não) se incompleto
    const completeBtnClass = allChecklistsCompleted ? 'page-header-btn btn-important' : 'page-header-btn';
    // rgb(255, 205, 210) é a cor do repeatSelect 'none'
    const completeBtnStyle = allChecklistsCompleted ? '' : 'background-color: rgb(255, 205, 210); border-color: #ccc; color: #555;';

    // --- Lógica de Contadores e Cores para os Cabeçalhos ---
    // Contador de Subtarefas: (concluídas / total)
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(task => task.completed === task.total).length;
    const subtaskCounter = `(${completedSubtasks}/${totalSubtasks})`;
    // Define a cor do título: verde se tudo estiver concluído, vermelho caso contrário.
    const subtaskHeaderClass = totalSubtasks > 0 && completedSubtasks === totalSubtasks ? 'status-completed-header' : 'text-danger';

    taskViewContainer.innerHTML = `
      <div class="task-details-container">
        <!-- Controles de Data e Prioridade -->
        <div class="task-header-controls">
          <!-- 1. Prioridade (Movido para o início) -->
          <div class="form-field" style="width: 119px;">
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

          <!-- 2. Data de Conclusão -->
          <div class="form-field" style="width: 153px;">
            <label for="task-due-date">Data de Conclusão:</label>
            <input type="date" id="task-due-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
          </div>

          <!-- 3. Hora -->
          <div class="form-field" style="width: 85px;">
            <label for="task-due-time">Hora:</label>
            <input type="time" id="task-due-time" class="form-input">
          </div>

          <!-- 4. Repetir (Novo) -->
          <div class="form-field" style="width: 145px;">
            <label for="task-repeat">Repetir:</label>
            <select id="task-repeat" class="form-input">
              <option value="none">Não</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
              <option value="yearly">Anualmente</option>
              <option value="periodic">Periodicamente</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <!-- Novo Campo Ticket -->
          <div class="form-field" style="width: 120px;">
            <label for="task-ticket-type">Ticket:</label>
            <select id="task-ticket-type" class="form-input">
                <option value="interno">Interno</option>
                <option value="externo">Externo</option>
            </select>
          </div>

          <!-- 6. Botão Concluir (Novo) -->
          <div class="form-field" style="justify-content: flex-end;">
            <label>&nbsp;</label> <!-- Espaçador -->
            <button class="${completeBtnClass}" style="${completeBtnStyle}" ${completeBtnDisabled} title="${completeBtnTitle}" onclick="alert('Tarefa Concluída com Sucesso!')">Concluir Tarefa</button>
          </div>

          <!-- 5. Configurações Dinâmicas de Repetição -->
          <div id="repeat-settings-wrapper" class="repeat-settings-wrapper" style="display: none;">
             <!-- Conteúdo injetado via JS -->
          </div>
        </div>

        <!-- Quadro Relacionados (Novo) -->
        <div class="task-quadro">
            <div class="quadro-header">
                <h4>Relacionados</h4>
            </div>
            <div class="form-container">
                <div class="form-field">
                    <label>Tipo:</label>
                    <select class="form-input">
                        <option value="pessoa">Pessoa</option>
                        <option value="imovel">Imóvel</option>
                        <option value="tarefa">Tarefa</option>
                        <option value="ticket">Ticket (API)</option>
                    </select>
                </div>
                <div class="form-field" style="flex: 1;">
                    <label>Buscar/Selecionar:</label>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" class="form-input" placeholder="Digite para buscar (ex: Nome, Endereço)...">
                        <button class="icon-btn" title="Adicionar Relacionamento">+</button>
                    </div>
                </div>
            </div>
            
            <!-- 
              REGRAS DE NEGÓCIO - RELACIONADOS:
              1. Pessoa: Busca no sistema. Link abre cadastro da pessoa em nova janela.
              2. Imóvel: Busca no sistema. Link abre cadastro do imóvel em nova janela.
              3. Tarefa: Referência a outra tarefa (ex: fusão). Mostra ID, Título e Status. Link abre a tarefa.
              4. Ticket (API): Referência a um ticket do sistema externo (Superlógica). Link externo direto.
            -->
            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px;">
                <!-- 1. Pessoa -->
                <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 15px; font-size: 13px; border: 1px solid #90caf9; display: inline-flex; align-items: center; gap: 5px;">
                    <a href="cadastros.html?tipo=pessoa&id=1" target="_blank" style="text-decoration: none; color: #333; display: flex; align-items: center; gap: 5px;">👤 Fulano de Tal</a>
                    <button class="icon-btn btn-danger-icon" style="width: 18px; height: 18px; font-size: 10px; line-height: 1; border: none; background: none;">✕</button>
                </span>
                <!-- 2. Imóvel -->
                <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 15px; font-size: 13px; border: 1px solid #90caf9; display: inline-flex; align-items: center; gap: 5px;">
                    <a href="cadastros.html?tipo=imovel&id=2" target="_blank" style="text-decoration: none; color: #333; display: flex; align-items: center; gap: 5px;">🏠 Sala 03 mormar</a>
                    <button class="icon-btn btn-danger-icon" style="width: 18px; height: 18px; font-size: 10px; line-height: 1; border: none; background: none;">✕</button>
                </span>
                <!-- 3. Tarefa (Relacionada/Mesclada) -->
                <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 15px; font-size: 13px; border: 1px solid #90caf9; display: inline-flex; align-items: center; gap: 5px;">
                    <a href="tarefas.html?id=1245" target="_blank" style="text-decoration: none; color: #333; display: flex; align-items: center; gap: 5px;">📋 Tarefa 1245 - Vazamento de Gás (Aberta)</a>
                    <button class="icon-btn btn-danger-icon" style="width: 18px; height: 18px; font-size: 10px; line-height: 1; border: none; background: none;">✕</button>
                </span>
                <!-- 4. Ticket API (Externo) -->
                <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 15px; font-size: 13px; border: 1px solid #90caf9; display: inline-flex; align-items: center; gap: 5px;">
                    <a href="https://preservaadm.superlogica.net/clients/financeiro/tickets/id/89" target="_blank" style="text-decoration: none; color: #333; display: flex; align-items: center; gap: 5px;">🎫 Ticket: 80</a>
                    <button class="icon-btn btn-danger-icon" style="width: 18px; height: 18px; font-size: 10px; line-height: 1; border: none; background: none;">✕</button>
                </span>
            </div>
        </div>

        <!-- Quadro Responsável (Novo) -->
        <div class="task-quadro">
            <div class="quadro-header">
                <h4>Responsável</h4>
            </div>
            <div class="form-container">
                <div class="form-field">
                    <label>Setor:</label>
                    <select class="form-input">
                        <option value="adm">Administrativo</option>
                        <option value="com">Comercial</option>
                        <option value="fin">Financeiro</option>
                        <option value="jur">Jurídico</option>
                    </select>
                </div>
                <div class="form-field" style="flex: 1;">
                    <label>Usuário:</label>
                    <select class="form-input">
                        <option value="curr">Usuário Atual (Você)</option>
                        <option value="u1">Fulano de Tal</option>
                        <option value="u2">Ciclano da Silva</option>
                    </select>
                </div>
                <div class="form-field">
                    <label>&nbsp;</label>
                    <button class="page-header-btn" title="Transferir responsabilidade">Transferir</button>
                </div>
            </div>
        </div>

        <!-- Quadro de Resumo (Memo) -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Resumo da Tarefa #${tarefa.id} - ${tarefa.titulo}</h4>
            <button id="memo-edit-btn" class="icon-btn" title="Editar Resumo" data-mode="edit">✏️</button>
          </div>
          <textarea id="memo-textarea" class="form-input memo-area" rows="10" readonly>Esta é a área principal de trabalho da tarefa.

Controles Principais (Topo):
Aqui você define a data de conclusão, a hora (opcional) e a prioridade da tarefa (0 a 10). Esses valores são usados para calcular a urgência da tarefa no sistema.

Resumo da Tarefa (este quadro):
Este campo serve para descrever o objetivo geral e os detalhes importantes da tarefa. Por padrão, ele é somente leitura. Clique no ícone de lápis (✏️) para editar o texto. Ao clicar, o ícone mudará para um disquete (💾). Clique no disquete para salvar suas alterações.

Ordenação da Lista de Tarefas:
A lista de tarefas principal é ordenada por uma "data fictícia", calculada somando os dias da prioridade à data de conclusão. Tarefas sem hora definida são consideradas para as 17:59. O desempate é feito pelo código da tarefa.

Subtarefas:
Liste aqui os passos ou ações necessárias para concluir a tarefa principal.
- Cor, Contagem e Ordenação: O título do quadro fica verde quando todas as subtarefas estão concluídas, e vermelho se houver pendências. Ele também mostra o total de tarefas concluídas (ex: 3/5).
- Seleção: Clique em uma subtarefa para exibir, logo abaixo, seu checklist detalhado e a lista de documentos associados a ela.

Quadros de Detalhes (Checklist e Documentos):
Ao selecionar uma subtarefa, dois novos quadros aparecerão: o de Checklist e o de Documentos.
- Cores e Contadores de Documentos: O título do quadro de documentos fica verde se todos os obrigatórios estiverem em dia, e vermelho caso contrário. O contador mostra (Obrigatórios em Dia / Total de Obrigatórios). O nome de um documento obrigatório fica verde se estiver em dia, e laranja se estiver pendente ou vencido.

Movimentações e Logs (final da página):
Use os quadros abaixo para adicionar novas informações ao histórico da tarefa e para consultar o log de todas as ações realizadas no sistema.</textarea>
        </div>
        
        <!-- Wrapper para Colunas (Subtarefas | Checklist | Documentos) -->
        <div class="task-columns-wrapper">
          <!-- Quadro de Subtarefas -->
          <div class="task-quadro task-col-item">
              <div class="quadro-header">
                <h4 class="${subtaskHeaderClass}">Subtarefas ${subtaskCounter}</h4>
                <button id="add-subtask-btn" class="icon-btn" title="Adicionar Subtarefa">+</button>
              </div>
              <ul id="subtask-list" class="item-list-container">${subtasks.map(task => {
                const blockedClass = task.blocked ? 'blocked' : '';
                const titleAttr = task.blocked ? `title="Aguardando conclusão de '${task.dependency}'"` : '';
                const statusClass = task.blocked ? 'status-pending' : (task.completed === task.total ? 'status-completed' : 'status-pending');
                const lockIcon = task.blocked ? '🔒 ' : '';
                
                return `
                <li class="subtask-item ${blockedClass}" data-subtask-id="${task.id}" ${titleAttr}>
                  <span>${lockIcon}${task.text}</span>
                  <span class="item-status ${statusClass}">${task.status}</span>
                </li>`;
              }).join('')}</ul>
            </div>
        
          <!-- Área Dinâmica para Detalhes da Subtarefa (Checklist e Documentos) -->
          <!-- Usamos display: contents quando ativo para que os filhos sejam irmãos flex do quadro de subtarefas -->
          <div id="dynamic-content-area" style="display: none;">
            <p class="placeholder-text" style="width: 100%;">Selecione uma subtarefa para ver seu checklist e documentos.</p>
          </div>
        </div>

        <!-- Quadro para Adicionar Movimentação -->
        <div class="task-quadro">
          <div class="quadro-header">
            <h4>Adicionar Movimentação</h4>
          </div>
          <textarea id="movement-memo-input" class="form-input memo-area" rows="10" placeholder="Digite aqui uma nova informação, comentário ou atualização sobre a tarefa..."></textarea>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; align-items: center;">
            <select id="movement-visibility" class="form-input" style="width: auto;">
                <option value="internal">Interno</option>
                <option value="public">Visível para o Cliente</option>
            </select>
            <button class="page-header-btn">Salvar Movimentação</button>
          </div>
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
            <!-- Azul significa movimentações visíveis para o cliente -->
            <p class="log-item" style="color: #0d47a1;">02/12/2025 - 11:25 - Usuário 03: Concluiu  Subtarefa: Item 1 do checklist (ex: copia do RG) da subtarefa Agendar vistoria do imóvel</p>
            <p class="log-item" style="color: #0d47a1;">02/12/2025 - 11:25 - Usuario 02: Adicionou Documento: CNH</p>
            <p class="log-item" style="color: #0d47a1;">02/12/2025 - 11:30 - Usuario 03: Adicionou Documento: Residencia</p>
            <p class="log-item"><strong>03/12/2025 - 16:30 - Usuario 04:</strong> Alterou o Resumo da Tarefa, texto anterior: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim.</p>
          </div>
        </div>
      </div>
    `;

    // --- Lógica de Repetição (Dinâmica) ---
    const repeatSelect = document.getElementById('task-repeat');
    const repeatWrapper = document.getElementById('repeat-settings-wrapper');

    if (repeatSelect && repeatWrapper) {
      // Função para atualizar a cor do select de repetição conforme o estado
      const updateRepeatColor = () => {
        if (repeatSelect.value === 'none') {
          repeatSelect.style.backgroundColor = 'rgb(255, 205, 210)'; // Vermelho Claro (Padrão)
        } else {
          repeatSelect.style.backgroundColor = 'rgb(220, 237, 200)'; // Verde Claro (Ativo)
        }
      };
      updateRepeatColor(); // Aplica a cor na inicialização

      repeatSelect.addEventListener('change', () => {
        updateRepeatColor(); // Atualiza a cor ao mudar a opção
        const val = repeatSelect.value;
        repeatWrapper.innerHTML = '';
        
        if (val === 'none' || val === 'daily' || val === 'yearly') {
          repeatWrapper.style.display = 'none';
          return;
        }

        repeatWrapper.style.display = 'flex';

        // Gera os dias da semana (D S T Q Q S S)
        const generateWeekDays = () => {
          const days = ['D', '2ª', '3ª', '4ª', '5ª', '6ª', 'S'];
          return days.map((d, i) => `
            <label class="week-day-opt"><input type="checkbox" value="${i}"> ${d}</label>
          `).join('');
        };

        if (val === 'weekly') {
          repeatWrapper.innerHTML = `
            <label style="font-size: 12px; font-weight: bold; margin-bottom: 5px;">Repetir nos dias:</label>
            <div class="week-selector">${generateWeekDays()}</div>
          `;
        } else if (val === 'monthly') {
           const daysOptions = Array.from({length: 31}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('');
           repeatWrapper.innerHTML = `
             <div class="monthly-selector">
               <div class="monthly-row">
                 <input type="radio" name="monthly-type" value="day" checked id="m-type-day">
                 <label for="m-type-day">No dia</label>
                 <select class="form-input" style="width: 60px;">${daysOptions}</select>
               </div>
               <div class="monthly-row">
                 <input type="radio" name="monthly-type" value="pos" id="m-type-pos">
                 <label for="m-type-pos">Na</label>
                 <select class="form-input" style="width: 96px;">
                   <option value="1">1ª</option><option value="2">2ª</option><option value="3">3ª</option><option value="4">4ª</option><option value="last">Última</option>
                 </select>
                 <select class="form-input" style="width: 120px;">
                   <option value="seg">Segunda</option><option value="ter">Terça</option><option value="qua">Quarta</option><option value="qui">Quinta</option><option value="sex">Sexta</option><option value="sab">Sábado</option><option value="dom">Domingo</option>
                 </select>
               </div>
             </div>
           `;
        } else if (val === 'periodic') {
          repeatWrapper.innerHTML = `
            <div class="periodic-selector">
              <label>Dias após a conclusão:</label>
              <input type="number" class="form-input" style="width: 70px;" value="1" min="1">
            </div>
          `;
        } else if (val === 'custom') {
           const daysOptions = Array.from({length: 31}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('');
           repeatWrapper.innerHTML = `
             <div class="custom-selector">
               <div class="custom-row">
                 <span>A cada</span>
                 <input type="number" class="form-input" style="width: 60px;" value="1" min="1">
                 <select id="custom-period-type" class="form-input" style="width: 120px;">
                   <option value="week">Semanas</option>
                   <option value="month">Meses</option>
                 </select>
               </div>
               <div id="custom-sub-options">
                 <div class="week-selector">${generateWeekDays()}</div>
               </div>
             </div>
           `;
           // Listener para alternar entre dias da semana e dia do mês no modo personalizado
           const customTypeSelect = document.getElementById('custom-period-type');
           const customSubOptions = document.getElementById('custom-sub-options');
           if(customTypeSelect && customSubOptions) {
             customTypeSelect.addEventListener('change', () => {
               if(customTypeSelect.value === 'week') {
                 customSubOptions.innerHTML = `<div class="week-selector">${generateWeekDays()}</div>`;
               } else {
                 customSubOptions.innerHTML = `
                   <div class="monthly-row">
                     <span>No dia</span>
                     <select class="form-input" style="width: 60px;">${daysOptions}</select>
                   </div>
                 `;
               }
             });
           }
        }
      });
    }

    // --- Lógica de Validação Visual de Data/Hora (Tarefa) ---
    const dateInput = document.getElementById('task-due-date');
    const timeInput = document.getElementById('task-due-time');
    const prioritySelect = document.getElementById('task-priority');

    const validateDateTime = () => {
      if (!dateInput) return;
      
      const dateVal = dateInput.value;
      const timeVal = timeInput ? timeInput.value : '';
      
      // Remove classes anteriores
      dateInput.classList.remove('input-error', 'input-warning');
      if (timeInput) timeInput.classList.remove('input-error', 'input-warning');

      if (!dateVal) return;

      const now = new Date();
      // Zera o horário da data atual para comparação apenas de data
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Cria a data do input (tratando fuso horário ou usando string split para evitar problemas)
      const [y, m, d] = dateVal.split('-').map(Number);
      const inputDate = new Date(y, m - 1, d);

      if (inputDate < today) {
        // Data anterior a hoje: Vermelho
        dateInput.classList.add('input-error');
        if (timeInput) timeInput.classList.add('input-error');
      } else if (inputDate.getTime() === today.getTime()) {
        // Data é hoje
        if (timeVal) {
          const [h, min] = timeVal.split(':').map(Number);
          const inputTimeMinutes = h * 60 + min;
          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

          if (inputTimeMinutes < currentTimeMinutes) {
            // Hora anterior a agora: Vermelho
            dateInput.classList.add('input-error');
            if (timeInput) timeInput.classList.add('input-error');
          } else {
            // Hora futura ou igual: Amarelo
            dateInput.classList.add('input-warning');
            if (timeInput) timeInput.classList.add('input-warning');
          }
        } else {
          // Sem hora definida hoje: Amarelo
          dateInput.classList.add('input-warning');
          if (timeInput) timeInput.classList.add('input-warning');
        }
      }
    };

    // --- Lógica de Gradiente de Prioridade ---
    const updatePriorityColor = () => {
      if (!prioritySelect) return;
      const val = parseInt(prioritySelect.value, 10);
      let r, g, b;
      
      // Definição das cores base (RGB)
      const red = [255, 205, 210];   // 0: Vermelho Claro (#ffcdd2)
      const blue = [227, 242, 253];  // 5: Azul Claro (#e3f2fd)
      const green = [220, 237, 200]; // 10: Verde Claro (#dcedc8)

      if (val <= 5) {
        // Interpolação entre Vermelho (0) e Azul (5)
        const ratio = val / 5;
        r = Math.round(red[0] + (blue[0] - red[0]) * ratio);
        g = Math.round(red[1] + (blue[1] - red[1]) * ratio);
        b = Math.round(red[2] + (blue[2] - red[2]) * ratio);
      } else {
        // Interpolação entre Azul (5) e Verde (10)
        const ratio = (val - 5) / 5;
        r = Math.round(blue[0] + (green[0] - blue[0]) * ratio);
        g = Math.round(blue[1] + (green[1] - blue[1]) * ratio);
        b = Math.round(blue[2] + (green[2] - blue[2]) * ratio);
      }
      
      prioritySelect.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    };

    // --- Lógica de Cores por Tipo de Ticket ---
    const ticketTypeSelect = document.getElementById('task-ticket-type');
    const taskDetailsContainer = taskViewContainer.querySelector('.task-details-container');
    
    // Elementos de Movimentação
    const movementVisibilitySelect = document.getElementById('movement-visibility');
    const movementMemoInput = document.getElementById('movement-memo-input');

    if (ticketTypeSelect && taskDetailsContainer) {
        const updateTicketTheme = () => {
            const isInterno = ticketTypeSelect.value === 'interno';

            // Remove classes anteriores e adiciona a nova baseada na seleção (interno/externo)
            taskDetailsContainer.classList.remove('ticket-interno', 'ticket-externo');
            taskDetailsContainer.classList.add(`ticket-${ticketTypeSelect.value}`);
            
            // Atualiza estado do combobox de movimentação
            if (movementVisibilitySelect) {
                if (isInterno) {
                    movementVisibilitySelect.value = 'internal';
                    movementVisibilitySelect.disabled = true;
                } else {
                    movementVisibilitySelect.disabled = false;
                }
                // Força atualização da cor do memo via evento change
                movementVisibilitySelect.dispatchEvent(new Event('change'));
            }
        };

        ticketTypeSelect.addEventListener('change', updateTicketTheme);
        
        // Listener para mudar a cor do memo de movimentação
        if (movementVisibilitySelect && movementMemoInput) {
            movementVisibilitySelect.addEventListener('change', () => {
                const isPublic = movementVisibilitySelect.value === 'public';
                movementMemoInput.style.backgroundColor = isPublic ? '#F1F2F3' : '#FCF8EC';
            });
        }

        updateTicketTheme(); // Aplica na inicialização
    }

    if (dateInput) {
      dateInput.addEventListener('change', validateDateTime);
      if (timeInput) timeInput.addEventListener('change', validateDateTime);
      // Executa a validação inicial
      validateDateTime();
    }

    if (prioritySelect) {
      prioritySelect.addEventListener('change', updatePriorityColor);
      updatePriorityColor(); // Executa na inicialização
    }
  }; // fim da função abrirDetalheTarefa

  // Função auxiliar para obter dados simulados de documentos
  const getMockDocuments = () => {
    return [
      { id: 104, name: 'Renda 02', status: 'Vencido 35 dias', days: -35, type: 'attached', isMandatory: false, instructions: 'Anexar comprovante de renda secundário (ex: Aluguel, Dividendos).', validityDays: 90 },
      { id: 103, name: 'Renda 01', status: 'Vencido 05 dias', days: -5, type: 'attached', isMandatory: false, instructions: 'Anexar holerite mais recente.', validityDays: 30 },
      { id: 102, name: 'Residência', status: 'Validade: 10 Dias', days: 10, type: 'attached', isMandatory: true, instructions: 'Comprovante de residência (Água, Luz, Gás) com no máximo 3 meses.', validityDays: 90 },
      { id: 101, name: 'CNH', status: 'Validade: 1290 dias', days: 1290, type: 'attached', isMandatory: true, instructions: 'Carteira Nacional de Habilitação válida.', validityDays: 1825 },
      { id: 201, name: 'Certidão de estado civil', status: 'Opcional', type: 'optional', isMandatory: false, instructions: 'Necessário apenas para dependentes.', validityDays: 0 },
      { id: 202, name: 'Termo Cartório Email', status: 'Obrigatório', type: 'required', isMandatory: true, instructions: 'Termo assinado e reconhecido em cartório.', validityDays: 0 },
    ];
  };

  // Função auxiliar que retorna o catálogo completo de documentos e suas validades padrão
  const getDocumentCatalog = () => {
    return {
      "Imóveis - Registral": [
        { label: "Matrícula do imóvel", validity: 30 },
        { label: "Certidão de ônus reais", validity: 30 },
        { label: "Certidão de inteiro teor", validity: 30 },
        { label: "Escritura pública", validity: 0 }, // Indeterminada
        { label: "Formal de partilha", validity: 0 },
        { label: "Carta de adjudicação", validity: 0 },
        { label: "Contrato particular", validity: 0 },
        { label: "Registro de incorporação", validity: 0 }
      ],
      "Imóveis - Municipal/Construtivo": [
        { label: "IPTU", validity: 365 },
        { label: "CND IPTU", validity: 30 },
        { label: "Cadastro imobiliário municipal", validity: 0 },
        { label: "Planta cadastral", validity: 0 },
        { label: "Alvará de construção", validity: 0 },
        { label: "Habite-se", validity: 0 },
        { label: "Certidão de numeração predial", validity: 0 },
        { label: "Certidão de valor venal", validity: 365 }
      ],
      "Imóveis - Rural": [
        { label: "Rural - CCIR", validity: 365 },
        { label: "Rural - ITR", validity: 365 },
        { label: "Rural - CND ITR", validity: 365 },
        { label: "Rural - NIRF", validity: 0 },
        { label: "Rural - Cadastro no INCRA", validity: 0 },
        { label: "Rural - Certidão cadastral rural", validity: 365 },
        { label: "Rural - CAR", validity: 0 },
        { label: "Rural - Reserva legal", validity: 0 },
        { label: "Rural - APP", validity: 0 },
        { label: "Rural - Licença ambiental rural", validity: 1825 }, // Até 5 anos
        { label: "Rural - Outorga de uso da água", validity: 3650 }, // Até 10 anos
        { label: "Rural - Georreferenciamento", validity: 0 },
        { label: "Rural - Certificação INCRA (SIGEF)", validity: 0 }
      ],
      "Imóveis - Condominial/Loteamento": [
        { label: "Convenção de condomínio", validity: 0 },
        { label: "Regimento interno", validity: 0 },
        { label: "Ata de assembleia", validity: 0 },
        { label: "Certidão do síndico", validity: 90 },
        { label: "Declaração de inexistência de débitos", validity: 30 },
        { label: "Registro do loteamento", validity: 0 },
        { label: "Planta aprovada", validity: 0 },
        { label: "Memorial descritivo", validity: 0 }
      ],
      "Imóveis - Posse/Uso": [
        { label: "Contrato de locação", validity: 0 }, // Prazo contratual
        { label: "Contrato de comodato", validity: 0 },
        { label: "Termo de cessão", validity: 0 },
        { label: "Declaração de posse", validity: 0 },
        { label: "Usucapião (processo/sentença)", validity: 0 },
        { label: "Certidão REURB", validity: 0 }
      ],
      "Imóveis - Projetos/Laudos": [
        { label: "Planta baixa", validity: 0 },
        { label: "Projeto arquitetônico", validity: 0 },
        { label: "ART / RRT", validity: 0 },
        { label: "Laudo estrutural", validity: 730 }, // 24 meses
        { label: "Laudo elétrico", validity: 365 },
        { label: "Laudo de vistoria", validity: 90 },
        { label: "Laudo de avaliação", validity: 180 }
      ],
      "Pessoa Física": [
        { label: "RG", validity: 3650 }, // 10 anos
        { label: "CNH", validity: 0 }, // Conforme vencimento
        { label: "CPF", validity: 0 },
        { label: "Certidão de Estado Civil", validity: 90 },
        { label: "Certidão de óbito", validity: 0 },
        { label: "Comprovante de residência", validity: 90 },
        { label: "Comprovante de Renda", validity: 90 },
        { label: "Declaração/Recibo IRPF", validity: 365 },
        { label: "Certidão negativa (Estadual/Federal)", validity: 30 },
        { label: "Certidão negativa trabalhista (CNDT)", validity: 180 },
        { label: "Certidão de protestos", validity: 30 },
        { label: "Certidão criminal", validity: 90 },
        { label: "Procuração", validity: 0 }
      ],
      "Pessoa Jurídica": [
        { label: "Contrato social", validity: 90 },
        { label: "Certidão Simplificada", validity: 90 },
        { label: "Ata do administrador", validity: 0 },
        { label: "Comprovante de CNPJ", validity: 30 },
        { label: "Inscrição estadual/municipal", validity: 0 },
        { label: "Alvará de funcionamento", validity: 365 },
        { label: "Licença sanitária", validity: 365 },
        { label: "Balanço patrimonial/DRE", validity: 365 },
        { label: "Balancete", validity: 90 },
        { label: "Extrato bancário", validity: 30 },
        { label: "Faturamento declarado", validity: 90 },
        { label: "CND Federal (Receita/PGFN)", validity: 180 },
        { label: "FGTS (CRF)", validity: 30 },
        { label: "Falência e recuperação judicial", validity: 30 }
      ]
    };
  };

  const exibirDetalhesSubtarefa = (subtaskId) => {
    const dynamicArea = document.getElementById('dynamic-content-area');
    if (!dynamicArea) return;

    // Altera para 'contents' para que os filhos (Checklist e Docs) participem do flex container pai
    dynamicArea.style.display = 'contents';

    // --- Simulação de dados para a subtarefa ---
    const documents = getMockDocuments().sort((a, b) => {
      const typeOrder = { required: 1, attached: 2, optional: 3 };
      const aSort = typeOrder[a.type] || 99;
      const bSort = typeOrder[b.type] || 99;

      if (aSort !== bSort) return aSort - bSort;
      if (a.type === 'attached') return a.days - b.days;
      return a.id - b.id;
    });

    // --- REGRAS DE NEGÓCIO: Contadores e Cores para os Documentos ---
    // 1. Filtra todos os documentos marcados como 'isMandatory: true'.
    const mandatoryDocuments = documents.filter(doc => doc.isMandatory);
    const totalMandatoryCount = mandatoryDocuments.length;

    // 2. Conta, dentre os obrigatórios, quantos já foram anexados ('attached') e estão com a validade em dia (days >= 0).
    const attachedAndValidMandatoryCount = mandatoryDocuments.filter(doc => doc.type === 'attached' && doc.days >= 0).length;

    const documentCounter = `(${attachedAndValidMandatoryCount}/${totalMandatoryCount})`;

    // 3. Define a cor do título do quadro de Documentos:
    //    - 'status-completed-header' (Verde): Se o total de obrigatórios for maior que zero e todos estiverem em dia.
    //    - 'text-danger' (Vermelho): Caso contrário.
    const documentHeaderClass = totalMandatoryCount > 0 && attachedAndValidMandatoryCount === totalMandatoryCount ? 'status-completed-header' : 'text-danger';
    // --- Fim das Regras de Negócio ---


    dynamicArea.innerHTML = `
        <!-- Quadro de Checklist -->
        <div class="task-quadro task-col-item">
          <div class="quadro-header">
            <h4>Checklist da Subtarefa #${subtaskId}</h4>
          </div>
          <ul class="checklist-container">
            <li><input type="checkbox" id="chk1" checked> <label for="chk1">Item 1 do checklist (ex: Cópia do RG)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
            <li><input type="checkbox" id="chk2"> <label for="chk2">Item 2 do checklist (ex: Comprovante de Renda)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
            <li><input type="checkbox" id="chk3"> <label for="chk3">Item 3 do checklist (ex: Análise de Crédito)</label><button class="table-action-btn checklist-instruction-btn" title="Ver Instruções">🔎</button></li>
          </ul>
        </div>

        <!-- Quadro de Documentos da Subtarefa -->
        <div class="task-quadro task-col-item">
          <div class="quadro-header">
            <h4 class="${documentHeaderClass}">Documentos ${documentCounter}</h4>
            <button id="add-document-btn" class="icon-btn" title="Adicionar Novo Documento">+</button>
          </div>
          <ul class="item-list-container">${documents.map(doc => { // Início do map de documentos
            // --- REGRAS DE NEGÓCIO: Cor do texto do nome do documento ---
            // Define a classe de cor para o texto com base na obrigatoriedade e status.
            let nameClass = '';
            if (doc.isMandatory) {
              // Se for obrigatório, verifica se está em dia ou se está pendente/vencido.
              if (doc.type === 'attached' && doc.days >= 0) {
                nameClass = 'text-success'; // Verde Escuro: Documento obrigatório em dia.
              } else {
                nameClass = 'text-orange'; // Laranja: Documento obrigatório não anexado ou em atraso.
              }
            } // Se não for obrigatório (isMandatory: false), a classe permanece vazia (cor padrão preta).
            // --- Fim da Regra de Negócio ---

            return `<li class="document-item" data-document-id="${doc.id}" data-type="${doc.type}" title="Texto Vermelho ou verde: Documento Obrigatório. Texto preto = Documento não obrigatório.">
              <span class="${nameClass}">${doc.name}</span>
              <span class="item-status ${
                doc.type === 'required' ? 'status-obrigatorio' :
                doc.type === 'optional' ? 'status-opcional' :
                doc.days < 0 ? 'status-expired' :
                doc.days <= 30 ? 'status-warning' : 'status-valid'
              }">${doc.status}</span></li>`; // CORREÇÃO: Adicionado '</li>' aqui.
          }).join('')}
          </ul>
        </div> 

      <!-- Quadro para detalhes do documento selecionado -->
      <div id="dynamic-details-quadro" class="task-quadro task-col-item" style="display: none; flex-direction: column;">
         <p class="placeholder-text">Selecione um documento acima para ver os detalhes.</p>
      </div>
    `;
  }

  /**
   * Atualiza o quadro de detalhes com base no documento selecionado.
   * @param {string} documentId - O ID do documento que foi clicado.
   */
  const atualizarQuadroDocumento = (documentId) => {
    const dynamicQuadro = document.getElementById('dynamic-details-quadro'); // Agora este é o quadro de 3º nível
    
    // Busca os dados do documento no mock
    const doc = getMockDocuments().find(d => d.id.toString() === documentId.toString());

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
            <div class="file-row-layout" style="display: flex; align-items: center; gap: 10px;">
                <button class="table-action-btn" title="Alterar informações do arquivo">✏️</button>
                <a href="${file.url}" target="_blank" class="file-link" style="flex: 1;">${file.name}</a>
                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;" title="Visível para o cliente">
                    <input type="checkbox"> 👁️
                </label>
                <button class="table-action-btn btn-danger-icon" title="Excluir arquivo">🗑️</button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      filesTableHTML = '<tr><td class="text-muted" style="text-align:center; padding: 10px;">Nenhum arquivo anexado.</td></tr>';
    }
    // --- Fim dos Dados de Demonstração ---

    // Se o documento existe (seja anexado ou pendente), mostra os detalhes com a opção de configurar
    if (doc) {
      const btnLabel = files.length > 0 ? 'Adicionar Páginas' : 'Anexar Arquivo';
      // Simula datas preenchidas apenas se já estiver anexado
      const emissionValue = doc.type === 'attached' ? '2022-05-20' : '';
      const expiryValue = doc.type === 'attached' ? '2026-05-19' : '';

      const visibilityText = files.length > 0 
        ? '<p style="font-size: 12px; color: #666; margin-top: 10px; margin-bottom: 5px;">Marque os campos abaixo para que o cliente possa ver o arquivo marcado.</p>'
        : '';

      dynamicQuadro.innerHTML = `
        <div class="quadro-header">
          <h4>Detalhes: ${doc.name}</h4>
          <div class="header-actions">
            <button id="doc-settings-btn" class="icon-btn" title="Configurações" data-doc-id="${documentId}">⚙️</button>
            <button class="icon-btn close-dynamic-quadro-btn" title="Fechar">✖</button>
          </div>
        </div>
          <div class="document-form">
            <!-- Texto do Memo/Instruções -->
            <p class="document-instructions-text" style="margin-bottom: 15px; color: #555;"><strong>Instruções:</strong> ${doc.instructions || 'Sem instruções definidas.'}</p>
            
            <div class="document-form-row">
              <div class="form-field">
                <label for="doc-emission-date">Data de Emissão:</label>
                <input type="date" id="doc-emission-date" class="form-input" value="${emissionValue}">
              </div>
              <div class="form-field">
                <label for="doc-expiry-date">Data de Validade:</label>
                <input type="date" id="doc-expiry-date" class="form-input" value="${expiryValue}">
              </div>
            </div>
            ${visibilityText}
            <!-- Tabela de Arquivos Anexados -->
            <div class="table-container document-files-table">
              <table class="point-table">
                <tbody>${filesTableHTML}</tbody>
              </table>
            </div>
            <div class="document-actions">
              <button class="page-header-btn">${btnLabel}</button>
            </div>
          </div>
      `;
    }
  }; // fim da função atualizarQuadroDocumento

  /**
   * Renderiza o quadro de configurações/adição de documento.
   * @param {string|null} documentId - ID do documento para editar, ou null para adicionar novo.
   */
  const renderDocumentSettings = (documentId) => {
    const dynamicQuadro = document.getElementById('dynamic-details-quadro');
    if (!dynamicQuadro) return;

    // Busca dados se for edição
    const doc = documentId ? getMockDocuments().find(d => d.id.toString() === documentId.toString()) : null;
    const isEdit = !!doc;

    const title = isEdit ? `Configurar Documento #${documentId}` : 'Novo Documento';
    const docName = doc ? doc.name : '';
    const docInstructions = doc ? doc.instructions : '';
    const docValidity = doc ? doc.validityDays : '';
    const isMandatory = doc ? doc.isMandatory : false;

    // Gera as opções do select agrupadas por categoria
    const catalog = getDocumentCatalog();
    let optionsHTML = '<option value="">Selecione um tipo...</option>';
    
    for (const [category, items] of Object.entries(catalog)) {
      optionsHTML += `<optgroup label="${category}">`;
      items.forEach(item => {
        // Verifica se é o item selecionado (comparando por nome simples para este exemplo)
        const isSelected = docName === item.label ? 'selected' : '';
        // Armazena a validade padrão no dataset para uso no JS
        optionsHTML += `<option value="${item.label}" data-default-validity="${item.validity}" ${isSelected}>${item.label}</option>`;
      });
      optionsHTML += `</optgroup>`;
    }
    // Adiciona opção "Outros" caso não esteja na lista
    optionsHTML += `<option value="Outros" ${docName === 'Outros' ? 'selected' : ''}>Outros</option>`;

    dynamicQuadro.style.display = 'flex';
    dynamicQuadro.innerHTML = `
      <div class="quadro-header">
        <h4>${title}</h4>
        <button class="icon-btn close-dynamic-quadro-btn" title="Fechar" ${isEdit ? `data-back-to="${documentId}"` : ''}>✖</button>
      </div>
      <div class="document-form">
        <div class="form-field">
          <label for="setting-doc-name">Título do Documento:</label>
          <input type="text" id="setting-doc-name" class="form-input" value="${docName}">
        </div>
        
        <div class="form-field">
          <label for="setting-doc-type">Tipo do Documento:</label>
          <select id="setting-doc-type" class="form-input">
            ${optionsHTML}
          </select>
        </div>

        <div class="document-form-row">
          <div class="form-field">
            <label for="setting-doc-validity">Validade (dias):</label>
            <input type="number" id="setting-doc-validity" class="form-input" value="${docValidity}" placeholder="Ex: 365">
          </div>
          <div class="checkbox-container" style="margin-top: 30px;">
            <input type="checkbox" id="setting-doc-mandatory" ${isMandatory ? 'checked' : ''}>
            <label for="setting-doc-mandatory">Obrigatório</label>
          </div>
        </div>

        <div class="form-field">
          <label for="setting-doc-instructions">Instruções (Manual):</label>
          <textarea id="setting-doc-instructions" class="form-input memo-area" rows="4" placeholder="Descreva como obter este documento, links úteis, etc...">${docInstructions}</textarea>
        </div>

        <div class="document-actions" style="justify-content: space-between; display: flex;">
          ${isEdit ? '<button id="delete-document-btn" class="icon-btn btn-danger-icon" title="Excluir Documento">🗑️</button>' : '<div></div>'}
          <button class="page-header-btn">Salvar Configurações</button>
        </div>
      </div>
    `;

    // Adiciona listener para atualizar a validade e o nome automaticamente ao mudar o tipo
    const typeSelect = document.getElementById('setting-doc-type');
    const validityInput = document.getElementById('setting-doc-validity');
    const nameInput = document.getElementById('setting-doc-name');

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const defaultValidity = selectedOption.dataset.defaultValidity;
        
        if (defaultValidity !== undefined && validityInput) validityInput.value = defaultValidity;
        if (nameInput && !isEdit) nameInput.value = selectedOption.value; // Preenche nome apenas se for novo
      });
    }
  };

  // --- LÓGICA DO EDITOR DE PROCESSOS (FLUXO) ---
  const initializeProcessEditor = () => {
    const container = document.getElementById('process-stream-container');
    const btnAdd = document.getElementById('btn-add-process-card');
    const nameInput = document.getElementById('process-name-input');
    
    // Simulação: Recupera o ID do processo clicado (armazenado temporariamente ou via URL fictícia)
    if (nameInput) {
        const processName = window.currentProcessName || (window.currentProcessId ? window.currentProcessId.replace(/_/g, ' ').toUpperCase() : 'Novo Processo');
        nameInput.value = processName;
    }

    let cardCounter = 0;

    // Função para atualizar os comboboxes de seleção de cards (Dependências e Navegação)
    const updateCardSelects = () => {
      const cards = document.querySelectorAll('.process-card');
      const cardOptions = Array.from(cards).map(c => {
        const id = c.id;
        const titleInput = c.querySelector('.card-title-input');
        const title = titleInput && titleInput.value ? titleInput.value : c.querySelector('strong').textContent;
        return { id, title };
      });

      // Atualiza selects de dependência
      document.querySelectorAll('.card-dependency-select').forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '<option value="">Imediata (Ao chegar neste passo)</option>';
        cardOptions.forEach(opt => {
            // Evita auto-dependência (tarefa depender dela mesma)
            if (!select.closest(`#${opt.id}`)) {
                select.innerHTML += `<option value="${opt.id}">Após: ${opt.title}</option>`;
            }
        });
        select.value = currentVal;
      });

      // Atualiza selects de navegação (Objetiva)
      document.querySelectorAll('.card-nav-select').forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '<option value="next">Ir para o Próximo</option>';
        cardOptions.forEach(opt => {
             if (!select.closest(`#${opt.id}`)) {
                select.innerHTML += `<option value="${opt.id}">Ir para: ${opt.title}</option>`;
             }
        });
        select.value = currentVal;
      });
    };

    // HTML da Configuração da AÇÃO
    const getActionConfigHTML = (actionType) => {
      if (actionType === 'task') {
        return `
          <div class="task-config-group">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Itens do Checklist:</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
              <input type="text" class="form-input new-checklist-input" placeholder="Novo item..." style="flex: 1;">
              <button class="icon-btn add-checklist-btn" title="Adicionar Item">+</button>
            </div>
            <ul class="config-list checklist-list-container" style="list-style: none; padding: 0; margin-bottom: 15px;">
              <!-- Itens adicionados via JS -->
            </ul>
          </div>

          <div class="task-config-group">
            <label style="font-weight: bold; display: block; margin-bottom: 5px;">Documentos Exigidos:</label>
            <div style="display: flex; gap: 5px; margin-bottom: 5px; align-items: center;">
              <input type="text" class="form-input new-doc-name-input" placeholder="Nome do Documento" style="flex: 2;">
              <input type="number" class="form-input new-doc-validity-input" placeholder="Dias Val." style="width: 70px;" title="Validade em dias">
              <label style="font-size: 12px;"><input type="checkbox" class="new-doc-mandatory-check"> Obrig.</label>
              <button class="icon-btn add-doc-btn" title="Adicionar Documento">+</button>
            </div>
            <ul class="config-list doc-list-container" style="list-style: none; padding: 0;">
              <!-- Itens adicionados via JS -->
            </ul>
          </div>
        `;
      }
      if (actionType === 'automation') {
        return `
          <div class="form-field">
            <label>Tipo de Automação:</label>
            <select class="form-input">
                <option value="email">Enviar E-mail</option>
                <option value="sms">Enviar SMS</option>
                <option value="whatsapp">Enviar WhatsApp</option>
                <option value="api">API Superlógica</option>
            </select>
          </div>
          <div class="form-field">
            <label>Parâmetros da Ação:</label>
            <textarea class="form-input" rows="2" placeholder="Ex: Template ID, Endpoint API..."></textarea>
          </div>
        `;
      }
      return '';
    };

    // HTML da Configuração da RESPOSTA
    const getResponseConfigHTML = (responseType, cardId) => {
        if (responseType === 'objective') {
            return `
                <div class="form-field">
                    <label>Opções de Resposta (Navegação):</label>
                    <div class="objective-options-list" id="options-list-${cardId}">
                        <!-- Opções adicionadas dinamicamente -->
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <button class="page-header-btn add-option-btn" style="font-size: 12px;">+ Adicionar Opção</button>
                        <button class="icon-btn refresh-cards-btn" title="Atualizar Destinos">🔄</button>
                    </div>
                </div>
            `;
        }
        return ''; // Numérico e Texto exibem apenas o campo de pergunta padrão
    };

    const addCard = () => {
      cardCounter++;
      const cardId = `process-card-${cardCounter}`;
      
      const cardHTML = document.createElement('div');
      cardHTML.className = 'process-card card-align-left';
      cardHTML.id = cardId;
      cardHTML.innerHTML = `
        <div class="process-card-header">
          <strong>Etapa #${cardCounter}</strong>
          <button class="icon-btn btn-danger-icon remove-card-btn" title="Remover Etapa">🗑️</button>
        </div>
        <div class="process-card-body">
          <!-- Cabeçalho do Card -->
          <div class="form-container">
            <div class="form-field" style="flex: 0 0 180px;">
              <label>ID Interno:</label>
              <input type="text" class="form-input" value="${cardCounter}" disabled style="background-color: #eee; color: #777;">
            </div>
            <div class="form-field" style="flex: 1;">
              <label>Título do Card:</label>
              <input type="text" class="form-input card-title-input" value="Etapa #${cardCounter}">
            </div>
          </div>
          
          <!-- Pergunta e Resposta (Opcional) -->
          <div class="checkbox-container" style="margin-top: 15px; margin-bottom: 5px;">
            <input type="checkbox" class="enable-question-checkbox">
            <label style="font-weight: bold;">Perguntas ao usuário (Coleta de Dados)</label>
          </div>

          <div class="question-section-wrapper" style="display: none; padding-left: 10px; border-left: 3px solid #eee;">
              <div class="form-field">
                <label>Texto da Pergunta:</label>
                <input type="text" class="form-input question-text-input" placeholder="Ex: Quantos imóveis? Qual o tipo?">
              </div>

              <div class="form-field">
                <label>Tipo de Resposta:</label>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <select class="form-input response-type-select" style="flex: 1;">
                        <option value="text">Texto (Livre)</option>
                        <option value="numeric">Número (Digitar)</option>
                        <option value="objective">Objetiva (Seleção Múltipla)</option>
                    </select>
                    <div class="checkbox-container" style="margin: 0;">
                        <input type="checkbox" class="response-required-checkbox" checked>
                        <label>Obrigatória</label>
                    </div>
                </div>
              </div>
              <div class="card-response-config card-type-config" style="display: none;">
                <!-- Conteúdo dinâmico aqui -->
              </div>
          </div>

          <!-- Ação do Card -->
          <div class="form-field" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
            <label style="font-weight: bold;">Ação do Card (Execução):</label>
            <select class="form-input card-action-select">
              <option value="none">Nenhuma Ação (Apenas Passagem)</option>
              <option value="task">Criação de Tarefas</option>
              <option value="automation">Ação / Automação</option>
            </select>
          </div>
          <div class="card-action-config card-type-config" style="display: none;"></div>
        

        </div>
      `;

      container.appendChild(cardHTML);

      // Event Listeners do Card
      const headerTitle = cardHTML.querySelector('.process-card-header strong');
      const titleInput = cardHTML.querySelector('.card-title-input');
      
      const actionSelect = cardHTML.querySelector('.card-action-select');
      const actionConfig = cardHTML.querySelector('.card-action-config');
      
      const questionCheckbox = cardHTML.querySelector('.enable-question-checkbox');
      const questionWrapper = cardHTML.querySelector('.question-section-wrapper');
      const responseSelect = cardHTML.querySelector('.response-type-select');
      const responseConfig = cardHTML.querySelector('.card-response-config');
      
      const removeBtn = cardHTML.querySelector('.remove-card-btn');

      // Sincronização de Título -> Header
      titleInput.addEventListener('input', () => {
        headerTitle.textContent = titleInput.value || `Etapa #${cardCounter}`;
      });

      // Mudança de Ação
      actionSelect.addEventListener('change', () => {
        const type = actionSelect.value;
        if (type && type !== 'none') {
            actionConfig.innerHTML = getActionConfigHTML(type);
            actionConfig.style.display = 'block';
            updateCardSelects(); // Atualiza selects recém criados
        } else {
            actionConfig.style.display = 'none';
            actionConfig.innerHTML = '';
        }

        // Verifica se deve exibir o aviso de Loop (Numérico + Tarefa)
        if (responseSelect.value === 'numeric') {
            if (type === 'task') {
                responseConfig.innerHTML = `<div style="padding: 8px; background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; color: #0d47a1; margin-top: 10px; font-size: 13px;">
                    <strong>ℹ️ Loop de Tarefas:</strong> O número digitado neste campo definirá quantas cópias da subtarefa serão criadas.
                </div>`;
                responseConfig.style.display = 'block';
            } else {
                responseConfig.style.display = 'none';
                responseConfig.innerHTML = '';
            }
        }

      });

      // Toggle Pergunta
      questionCheckbox.addEventListener('change', () => {
        questionWrapper.style.display = questionCheckbox.checked ? 'block' : 'none';
      });

      // Função de Alinhamento
      const updateAlignment = () => {
        if (questionCheckbox.checked) {
            cardHTML.classList.remove('card-align-right');
            cardHTML.classList.add('card-align-left');
        } else {
            cardHTML.classList.remove('card-align-left');
            cardHTML.classList.add('card-align-right');
        }
      };
      
      // Atualiza alinhamento apenas ao sair do card (perda de foco)
      cardHTML.addEventListener('focusout', (e) => {
        if (!cardHTML.contains(e.relatedTarget)) {
            updateAlignment();
        }
      });

      // Mudança de Tipo de Resposta
      responseSelect.addEventListener('change', () => {
        const type = responseSelect.value;
        if (type === 'objective') {
            responseConfig.innerHTML = getResponseConfigHTML(type, cardId);
            responseConfig.style.display = 'block';
            updateCardSelects(); // Atualiza selects
            } else if (type === 'numeric' && actionSelect.value === 'task') {
            responseConfig.innerHTML = `<div style="padding: 8px; background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; color: #0d47a1; margin-top: 10px; font-size: 13px;">
                <strong>ℹ️ Loop de Tarefas:</strong> O número digitado neste campo definirá quantas cópias da subtarefa serão criadas.
            </div>`;
            responseConfig.style.display = 'block';
        } else {
            responseConfig.style.display = 'none';
            responseConfig.innerHTML = '';
        }
      });

      // Delegação de eventos para botões dinâmicos dentro do card
      cardHTML.addEventListener('click', (e) => {
        // Botão Atualizar (Refresh)
        if (e.target.closest('.refresh-cards-btn')) {
            updateCardSelects();
        }
        
        // Botão Adicionar Opção (Objetiva)
        if (e.target.classList.contains('add-option-btn')) {
            const list = cardHTML.querySelector('.objective-options-list');
            const optionDiv = document.createElement('div');
            optionDiv.className = 'form-container';
            optionDiv.style.marginBottom = '5px';
            optionDiv.innerHTML = `
                <input type="text" class="form-input" placeholder="Opção (ex: Sim)" style="flex: 2;">
                <select class="form-input card-nav-select" style="flex: 1;">
                    <option value="next">Ir para o Próximo</option>
                </select>
                <button class="icon-btn btn-danger-icon remove-opt-btn" style="width: 34px;">🗑️</button>
            `;
            list.appendChild(optionDiv);
            
            // Remove opção
            optionDiv.querySelector('.remove-opt-btn').addEventListener('click', () => optionDiv.remove());
            
            updateCardSelects(); // Popula o select recém criado
        }

        // Botão Adicionar Item Checklist (Config Tarefa)
        if (e.target.classList.contains('add-checklist-btn')) {
            const container = e.target.closest('.task-config-group');
            const input = container.querySelector('.new-checklist-input');
            const list = container.querySelector('.checklist-list-container');
            
            if (input.value.trim()) {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; justify-content: space-between; background: #fff; padding: 5px; margin-bottom: 2px; border: 1px solid #eee;";
                li.innerHTML = `<span>${input.value}</span> <button class="icon-btn btn-danger-icon remove-item-btn" style="width: 24px; height: 24px; font-size: 12px;">🗑️</button>`;
                list.appendChild(li);
                input.value = '';
                
                li.querySelector('.remove-item-btn').addEventListener('click', () => li.remove());
            }
        }

        // Botão Adicionar Documento (Config Tarefa)
        if (e.target.classList.contains('add-doc-btn')) {
            const container = e.target.closest('.task-config-group');
            const nameInput = container.querySelector('.new-doc-name-input');
            const validityInput = container.querySelector('.new-doc-validity-input');
            const mandatoryCheck = container.querySelector('.new-doc-mandatory-check');
            const list = container.querySelector('.doc-list-container');
            
            if (nameInput.value.trim()) {
                const li = document.createElement('li');
                const isMandatory = mandatoryCheck.checked;
                const validity = validityInput.value ? `${validityInput.value} dias` : 'Indet.';
                
                li.style.cssText = "display: flex; justify-content: space-between; background: #fff; padding: 5px; margin-bottom: 2px; border: 1px solid #eee;";
                li.innerHTML = `
                    <span>${nameInput.value} <small class="text-muted">(${validity})</small> ${isMandatory ? '<span style="color:red; font-weight:bold;">*</span>' : ''}</span> 
                    <button class="icon-btn btn-danger-icon remove-item-btn" style="width: 24px; height: 24px; font-size: 12px;">🗑️</button>`;
                list.appendChild(li);
                nameInput.value = '';
                validityInput.value = '';
                mandatoryCheck.checked = false;
                
                li.querySelector('.remove-item-btn').addEventListener('click', () => li.remove());
            }
        }

      });

      // Remover Card
      removeBtn.addEventListener('click', () => {
        if (confirm('Remover esta etapa do fluxo?')) {
            cardHTML.remove();
            updateCardSelects(); // Atualiza referências em outros cards
        }
      });
    };

    if (btnAdd) btnAdd.addEventListener('click', addCard);
  };

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

      // Se for um botão de processo, podemos salvar o ID no window para usar no editor
      if (button.dataset.processId) {
        // window.currentProcessId = button.dataset.processId; // Exemplo de uso futuro
      }
      
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
  // Usamos { passive: true } para indicar ao navegador que esses listeners não vão cancelar
  // a ação padrão (como o scroll), permitindo que o navegador otimize a performance.
  window.addEventListener('resize', handleResize, { passive: true });

  // --- LÓGICA DO BOTÃO "VOLTAR AO TOPO" ---
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn && contentTarget) {
    // O evento de scroll é no contêiner do conteúdo, não na window.
    contentTarget.addEventListener('scroll', () => {
      // Mostra o botão se o usuário rolar mais de 300px para baixo.
      if (contentTarget.scrollTop > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true }); // Otimização de performance

    // Adiciona a ação de clique para rolar suavemente de volta ao topo.
    backToTopBtn.addEventListener('click', () => {
      contentTarget.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  // --- FIM DA LÓGICA DO BOTÃO "VOLTAR AO TOPO" ---

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