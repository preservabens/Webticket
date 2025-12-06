document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const headerToggleBtn = document.getElementById('header-toggle-btn');
  const body = document.body;

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
});