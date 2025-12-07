document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const contentTarget = document.getElementById('content-target');
  const navButtons = document.querySelectorAll('.nav-btn');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

  // Variável para controlar o mês/ano do espelho de ponto
  let pointSheetDate = new Date();

  // Mantém o controle do estado atual da visualização para detectar mudanças
  let isMobileView = window.innerWidth <= 768;

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
    accordionContent.innerHTML = `
      <h3>#${tarefa.id} - ${tarefa.titulo}</h3>
      <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
      <p><strong>Data de Conclusão:</strong> ${new Date(tarefa.dataConclusao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
      <p><em>(Aqui entrarão mais detalhes, histórico e ações da tarefa...)</em></p>
    `;
  }; // fim da função abrirDetalheTarefa

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
});