import { navigate, renderPage } from './router.js';
import { getCurrentUser, onAuthChange, renderAuthStatus } from './auth.js';

// Manejo de clics en enlaces con data-link
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link && link.getAttribute('href')) {
    e.preventDefault();
    navigate(link.getAttribute('href'));
    // Cerrar el menú móvil después de hacer clic en un enlace
    const navbar = document.querySelector('.navbar');
    if (navbar && navbar.classList.contains('menu-open')) {
      navbar.classList.remove('menu-open');
    }
  }
});

// Historial del navegador
window.addEventListener('popstate', () => {
  renderPage(window.location.pathname);
});

// Renderizar página inicial
renderPage(window.location.pathname);

// Actualizar el estado de autenticación en la navbar
const authContainer = document.getElementById('auth-status');
if (authContainer) {
  const updateAuth = () => renderAuthStatus(authContainer);
  updateAuth();
  onAuthChange(updateAuth);
}

// Control del menú hamburguesa
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('menu-open');
  });
}
