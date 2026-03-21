import { escapeHtml } from './utils.js';

let currentUser = null;
const listeners = [];

export function getCurrentUser() {
  return currentUser;
}

export function login(username) {
  if (!username || username.trim() === '') return false;
  currentUser = username.trim();
  localStorage.setItem('lens_user', currentUser);
  notifyListeners();
  return true;
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('lens_user');
  notifyListeners();
}

export function onAuthChange(callback) {
  listeners.push(callback);
}

function notifyListeners() {
  listeners.forEach(cb => cb(currentUser));
}

// Cargar usuario guardado
const saved = localStorage.getItem('lens_user');
if (saved) currentUser = saved;

// Función para mostrar el estado en la navbar (se llama desde main)
export function renderAuthStatus(containerElement) {
  const user = getCurrentUser();
  if (user) {
    containerElement.innerHTML = `
      <span>👤 ${escapeHtml(user)}</span>
      <button id="logout-btn">Cerrar sesión</button>
    `;
    const logoutBtn = containerElement.querySelector('#logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logout());
  } else {
    containerElement.innerHTML = `
      <span>No has iniciado sesión</span>
      <button id="login-btn">Iniciar sesión</button>
    `;
    const loginBtn = containerElement.querySelector('#login-btn');
    if (loginBtn) loginBtn.addEventListener('click', () => {
      const name = prompt('Introduce tu nombre de Discord:');
      if (name && name.trim()) login(name.trim());
    });
  }
}
