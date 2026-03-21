import { navigate } from '../router.js';

export default function homePage(container) {
  container.innerHTML = `
    <div class="glass-panel" style="text-align:center;">
      <h1>🔧 LENSTOOLS · Dev Toolbox</h1>
      <p style="margin-bottom:2rem;">Herramientas inteligentes para desarrolladores de Discord y código.</p>
      <div class="grid-2">
        <div class="glass-panel"><h3>🎧 Discord Events</h3><p>Lista de eventos de Discord con ejemplos en JS, TS, Python.</p><button class="primary" id="goEvents">Explorar eventos →</button></div>
        <div class="glass-panel"><h3>📜 Server Logs</h3><p>Consulta los audit logs de un servidor usando su ID.</p><button id="goLogs">Ver registros →</button></div>
        <div class="glass-panel"><h3>📬 Dev Community</h3><p>Foro estilo Reddit: programación, Discord, código.</p><button id="goCommunity">Visitar comunidad →</button></div>
        <div class="glass-panel"><h3>🤖 AutoMessage</h3><p>Programa mensajes automáticos con bots (simulación o real).</p><button id="goAuto">Configurar mensajes →</button></div>
      </div>
    </div>
  `;
  document.getElementById('goEvents')?.addEventListener('click', () => navigate('/discord/events'));
  document.getElementById('goLogs')?.addEventListener('click', () => navigate('/discord/logs'));
  document.getElementById('goCommunity')?.addEventListener('click', () => navigate('/discord/community'));
  document.getElementById('goAuto')?.addEventListener('click', () => navigate('/tools/automessage'));
}