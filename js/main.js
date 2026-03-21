import { navigate, renderPage } from './router.js';
import { getCurrentUser, onAuthChange, renderAuthStatus } from './auth.js';

// Manejo de clics en enlaces con data-link
document.body.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-link]');
  if (link && link.getAttribute('href')) {
    e.preventDefault();
    navigate(link.getAttribute('href'));
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