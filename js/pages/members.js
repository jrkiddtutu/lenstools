import { escapeHtml } from '../utils.js';

export default function membersPage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <h1>👥 Visor de miembros</h1>
      <p>Introduce el ID del servidor para ver una lista simulada de miembros.</p>
      <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
        <input type="text" id="guildId" placeholder="ID del servidor" style="flex: 1;">
        <button id="loadMembers" class="primary">Buscar</button>
      </div>
      <div id="membersList" class="glass-panel" style="max-height: 500px; overflow-y: auto;">
        <p>Esperando ID...</p>
      </div>
    </div>
  `;

  const loadBtn = container.querySelector('#loadMembers');
  const guildInput = container.querySelector('#guildId');
  const listDiv = container.querySelector('#membersList');

  function generateMockMembers(guildId) {
    const hash = Math.abs(parseInt(guildId) || 0);
    const count = 5 + (hash % 10);
    const members = [];
    for (let i = 1; i <= count; i++) {
      members.push({
        id: `123456789${i}`,
        username: `Usuario${i}`,
        discriminator: i % 1000,
        joinedAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        roles: i % 2 === 0 ? ['@everyone', 'Admin'] : ['@everyone']
      });
    }
    return members;
  }

  function renderMembers(guildId) {
    const members = generateMockMembers(guildId);
    if (members.length === 0) {
      listDiv.innerHTML = '<p>No se encontraron miembros (simulación).</p>';
      return;
    }
    listDiv.innerHTML = `
      <div style="margin-bottom: 1rem;"><strong>${members.length}</strong> miembros encontrados (simulación)</div>
      ${members.map(m => `
        <div class="log-entry">
          <strong>${escapeHtml(m.username)}#${m.discriminator}</strong><br>
          <span>🆔 ${escapeHtml(m.id)}</span><br>
          <span>📅 Se unió: ${m.joinedAt}</span><br>
          <span>🎭 Roles: ${m.roles.join(', ')}</span>
        </div>
      `).join('')}
      <p style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">⚠️ Datos de ejemplo. Conecta con tu API real para obtener miembros reales.</p>
    `;
  }

  loadBtn.addEventListener('click', () => {
    const id = guildInput.value.trim();
    if (!id) {
      alert('Introduce un ID de servidor');
      return;
    }
    renderMembers(id);
  });
}