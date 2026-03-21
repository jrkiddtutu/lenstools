import homePage from './pages/home.js';
import eventsPage from './pages/events.js';
import communityPage from './pages/community.js';
import autoMessagePage from './pages/automessage.js';
import insightsPage from './pages/insights.js';
import membersPage from './pages/members.js';
import lanyardPage from './pages/lanyard.js';

const routes = {
  '/': homePage,
  '/api/events': eventsPage,
  '/discord/community': communityPage,
  '/tools/automessage': autoMessagePage,
  '/discord/insights': insightsPage,
  '/discord/members': membersPage,
  '/api/lanyard': lanyardPage
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
