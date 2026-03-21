import { escapeHtml } from '../utils.js';

export default function insightsPage(container) {
  // Cargar Chart.js dinámicamente si no está presente
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => initPage();
    document.head.appendChild(script);
  } else {
    initPage();
  }

  function initPage() {
    container.innerHTML = `
      <div class="glass-panel">
        <h1>📈 Server Insights</h1>
        <p>Introduce el ID del servidor para ver información detallada y gráficos de crecimiento (simulados).</p>
        <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
          <input type="text" id="guildId" placeholder="ID del servidor" style="flex: 1;">
          <button id="loadInsights" class="primary">Cargar</button>
        </div>
        <div id="insightsContent" style="display: none;">
          <div class="grid-2">
            <div class="glass-panel">
              <h3>📊 Resumen</h3>
              <div id="summary"></div>
            </div>
            <div class="glass-panel">
              <h3>📈 Crecimiento de miembros (últimos 30 días)</h3>
              <canvas id="growthChart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="glass-panel" style="margin-top: 1rem;">
            <h3>🔍 Detalles adicionales</h3>
            <div id="details"></div>
          </div>
        </div>
        <div id="placeholder" class="glass-panel">
          <p>Esperando ID para mostrar análisis...</p>
        </div>
      </div>
    `;

    const loadBtn = container.querySelector('#loadInsights');
    const guildInput = container.querySelector('#guildId');
    const insightsDiv = container.querySelector('#insightsContent');
    const placeholderDiv = container.querySelector('#placeholder');

    function generateMockData(guildId) {
      const hash = Math.abs(parseInt(guildId) || 0);
      const members = 100 + (hash % 900);
      const channels = 5 + (hash % 20);
      const roles = 3 + (hash % 15);
      const boosts = hash % 10;
      const boostsLevel = boosts >= 5 ? 2 : (boosts >= 2 ? 1 : 0);

      // Simular crecimiento en 30 días
      const growth = [];
      const startMembers = members - 30 + (hash % 20);
      for (let i = 0; i < 30; i++) {
        growth.push(startMembers + Math.floor(Math.random() * 15) + i * 0.5);
      }

      return {
        members,
        channels,
        roles,
        boosts,
        boostsLevel,
        growth,
        guildId
      };
    }

    function renderInsights(data) {
      // Resumen
      const summaryDiv = container.querySelector('#summary');
      summaryDiv.innerHTML = `
        <p><strong>🆔 Servidor:</strong> ${escapeHtml(data.guildId)}</p>
        <p><strong>👥 Miembros totales:</strong> ${data.members}</p>
        <p><strong>💬 Canales:</strong> ${data.channels}</p>
        <p><strong>🎭 Roles:</strong> ${data.roles}</p>
        <p><strong>🚀 Nivel de boost:</strong> ${data.boostsLevel} (${data.boosts} boosts)</p>
      `;

      // Detalles adicionales
      const detailsDiv = container.querySelector('#details');
      detailsDiv.innerHTML = `
        <p>📅 Fecha estimada de creación: ${new Date(Date.now() - (Math.random() * 3 * 365 * 86400000)).toLocaleDateString()}</p>
        <p>👑 Proporción admin/miembros: ~1:${Math.floor(data.members / (2 + data.boosts))}</p>
        <p>📊 Actividad estimada (mensajes/día): ${Math.floor(Math.random() * 500 + 100)}</p>
        <p><em>⚠️ Datos simulados. Conecta con tu API real para información precisa.</em></p>
      `;

      // Gráfico
      const ctx = document.getElementById('growthChart').getContext('2d');
      if (window.growthChartInstance) window.growthChartInstance.destroy();
      window.growthChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `Día ${i+1}`),
          datasets: [{
            label: 'Miembros',
            data: data.growth,
            borderColor: '#6e8efb',
            backgroundColor: 'rgba(110, 142, 251, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: { enabled: true },
            legend: { labels: { color: '#eef2ff' } }
          },
          scales: {
            x: { ticks: { color: '#cdd9ff' }, grid: { color: '#2c3b5c' } },
            y: { ticks: { color: '#cdd9ff' }, grid: { color: '#2c3b5c' } }
          }
        }
      });
    }

    loadBtn.addEventListener('click', () => {
      const guildId = guildInput.value.trim();
      if (!guildId) {
        alert('Introduce un ID de servidor');
        return;
      }
      const data = generateMockData(guildId);
      insightsDiv.style.display = 'block';
      placeholderDiv.style.display = 'none';
      renderInsights(data);
    });
  }
}