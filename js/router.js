import homePage from './pages/home.js';
import eventsPage from './pages/events.js';
import logsPage from './pages/logs.js';
import communityPage from './pages/community.js';
import autoMessagePage from './pages/automessage.js';

const routes = {
  '/': homePage,
  '/api/events': eventsPage,
  '/server/logs': logsPage,
  '/discord/community': communityPage,
  '/tools/automessage': autoMessagePage
};

export function navigate(path, pushState = true) {
  if (pushState) {
    window.history.pushState({}, '', path);
  }
  renderPage(path);
}

export function renderPage(path) {
  const app = document.getElementById('app');
  const routeFunc = routes[path];
  if (routeFunc) {
    app.innerHTML = '';
    routeFunc(app);
  } else {
    app.innerHTML = `<div class="glass-panel"><h2>404 - Herramienta no encontrada</h2><p>Revisa la URL: ${path}</p></div>`;
  }
}