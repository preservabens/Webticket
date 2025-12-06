document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const headerToggleBtn = document.getElementById('header-toggle-btn');
  const body = document.body;
  const contentTarget = document.getElementById('content-target');
  const navButtons = document.querySelectorAll('.nav-btn');

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

  sidebarToggleBtn.addEventListener('click', handleMenuToggle);
  headerToggleBtn.addEventListener('click', handleMenuToggle);

  // --- DELEGAÇÃO DE EVENTOS PARA CONTEÚDO DINÂMICO ---
  contentTarget.addEventListener('click', (event) => {
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

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (!page) return; // Ignora botões sem data-page

      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      loadPage(page);
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

  // Carrega a página inicial por padrão
  if (navButtons.length > 0) {
    navButtons[0].click();
  }
});