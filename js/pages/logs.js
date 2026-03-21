import { escapeHtml } from '../utils.js';

export default function logsPage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <h1>📜 Registros del servidor (Audit Logs)</h1>
      <p>Introduce el ID del servidor y haz clic en "Cargar logs". Se llamará al endpoint: <code>/guilds/{guild.id}/audit-logs</code></p>
      <div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0;">
        <input type="text" id="guildId" placeholder="ID del servidor" style="flex: 1;">
        <button id="fetchLogsBtn" class="primary">Cargar logs</button>
      </div>
      <div id="logsContainer" class="glass-panel" style="max-height: 500px; overflow-y: auto;">
        <p>Esperando acción...</p>
      </div>
    </div>
  `;

  const fetchBtn = container.querySelector('#fetchLogsBtn');
  const guildInput = container.querySelector('#guildId');
  const logsDiv = container.querySelector('#logsContainer');

  async function loadLogs(guildId) {
    logsDiv.innerHTML = '<p>Cargando logs...</p>';
    try {
      // Endpoint real (ajusta la URL base según tu backend)
      const response = await fetch(`/guilds/${guildId}/audit-logs`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // Asumimos que data es un array de logs
      renderLogs(data);
    } catch (error) {
      console.error('Error al cargar logs:', error);
      // Simular logs de ejemplo para demostración (en producción se conectaría a un backend real)
      logsDiv.innerHTML = `
        <p style="color: #ffaa66;">⚠️ No se pudo conectar al endpoint real. Mostrando datos de ejemplo para el servidor ${escapeHtml(guildId)}.</p>
        ${generateMockLogs(guildId).map(log => `
          <div class="log-entry">
            <span style="color:#a5b4fc;">[${log.timestamp}]</span> 
            <strong style="color:#ffb86b;">${log.action}</strong> · 
            <span>👤 ${log.user || '—'}</span> · 
            <span>${log.details}</span>
            ${log.moderator ? `<span class="badge">mod: ${log.moderator}</span>` : ''}
          </div>
        `).join('')}
      `;
    }
  }

  function renderLogs(logs) {
    if (!logs || logs.length === 0) {
      logsDiv.innerHTML = '<p>No se encontraron logs para este servidor.</p>';
      return;
    }
    logsDiv.innerHTML = logs.map(log => `
      <div class="log-entry">
        <span style="color:#a5b4fc;">[${escapeHtml(log.timestamp)}]</span> 
        <strong style="color:#ffb86b;">${escapeHtml(log.action)}</strong> · 
        <span>👤 ${escapeHtml(log.user || '—')}</span> · 
        <span>${escapeHtml(log.details)}</span>
        ${log.moderator ? `<span class="badge">mod: ${escapeHtml(log.moderator)}</span>` : ''}
      </div>
    `).join('');
  }

  function generateMockLogs(guildId) {
    // Datos mock basados en el ID para variedad
    return [
      { timestamp: new Date().toLocaleString(), action: 'AUDIT_LOG', user: 'Sistema', details: `Consulta manual para servidor ${guildId}`, moderator: 'LENSTOOLS' },
      { timestamp: '2025-04-01 14:23:11', action: 'BAN', user: 'DevRage', details: 'Usuario baneado por spam', moderator: 'AdminKael' },
      { timestamp: '2025-04-01 12:07:42', action: 'MESSAGE_DELETE', user: 'LunaCoder', details: 'Mensaje eliminado: "link sospechoso"', channel: '#general' },
      { timestamp: '2025-03-31 22:15:03', action: 'MEMBER_JOIN', user: 'newbie_dev', details: 'Bienvenido automático' },
      { timestamp: '2025-03-31 18:44:29', action: 'ROLE_UPDATE', user: 'Carlos', details: 'Rol "Colaborador" añadido', moderator: 'BotMod' }
    ];
  }

  fetchBtn.addEventListener('click', () => {
    const guildId = guildInput.value.trim();
    if (!guildId) {
      alert('Introduce un ID de servidor');
      return;
    }
    loadLogs(guildId);
  });
}
