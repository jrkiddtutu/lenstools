import { escapeHtml } from '../utils.js';

export default function lanyardPage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <h1>🟢 Perfil Lanyard</h1>
      <p>Introduce un <strong>ID</strong> de usuario de Discord para ver su presencia en tiempo real <a href="https://discord.gg/lanyard" target="_blank" style="color:#6e8efb;">Unirse a Discord</a>.</p>
      <div class="info-note" style="background:#1e2a44; border-radius:1rem; padding:0.8rem; margin:1rem 0; font-size:0.85rem;">
        ℹ️ <strong>Nota:</strong> Lanyard muestra solo a los usuarios que se encuentran en su servidor de discord, si no lo estan no estan siendo monitoreados. Si quieres ver informacion de un usuario comprueba que este en el servidor
      </div>
      <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
        <input type="text" id="userId" placeholder="ID de usuario (ej: 123456789012345678)" style="flex: 1;">
        <button id="loadProfile" class="primary">Buscar</button>
      </div>
      <div id="profile" class="glass-panel">
        <p>Esperando ID...</p>
      </div>
    </div>
  `;

  const loadBtn = container.querySelector('#loadProfile');
  const userIdInput = container.querySelector('#userId');
  const profileDiv = container.querySelector('#profile');

  async function fetchLanyard(userId) {
    profileDiv.innerHTML = '<p>🔍 Cargando información de Lanyard...</p>';
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado en Lanyard. Asegúrate de que el usuario este en el Discord Oficial de Lanyard.');
        }
        throw new Error(`Error HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) throw new Error('La API respondió con error.');
      renderProfile(data.data);
    } catch (error) {
      profileDiv.innerHTML = `
        <p style="color: #ff8888;">❌ ${escapeHtml(error.message)}</p>
      `;
    }
  }

  function renderProfile(data) {
    const spotify = data.spotify;
    const activities = data.activities || [];
    const customStatus = activities.find(a => a.type === 4);
    const game = activities.find(a => a.type === 0 && a.name !== 'Custom Status');

    profileDiv.innerHTML = `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        ${data.discord_user.avatar ? `<img src="https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=64" style="border-radius: 50%; width: 64px;">` : ''}
        <div>
          <h3>${escapeHtml(data.discord_user.username)}#${data.discord_user.discriminator}</h3>
          <p>🟢 Estado: <strong>${data.discord_status}</strong></p>
          ${customStatus ? `<p>💬 Estado personalizado: ${escapeHtml(customStatus.state || '')}</p>` : ''}
          ${game ? `<p>🎮 Jugando: ${escapeHtml(game.name)}</p>` : ''}
        </div>
      </div>
      ${spotify ? `
        <div style="margin-top: 1rem; background: #1db95420; border-radius: 1rem; padding: 0.8rem;">
          <p>🎵 Escuchando en Spotify:</p>
          <p><strong>${escapeHtml(spotify.song)}</strong> – ${escapeHtml(spotify.artist)}</p>
          ${spotify.album ? `<p>📀 Álbum: ${escapeHtml(spotify.album)}</p>` : ''}
        </div>
      ` : ''}
      ${data.active_on_discord_mobile ? '<p>📱 Activo en móvil</p>' : ''}
      ${data.active_on_discord_desktop ? '<p>💻 Activo en escritorio</p>' : ''}
      <p style="margin-top: 1rem; font-size: 0.7rem;">Última actualización: ${new Date(data.listening_to_spotify ? data.spotify?.timestamps?.start : data.discord_status === 'online' ? Date.now() : data.last_updated).toLocaleString()}</p>
    `;
  }

  loadBtn.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      alert('Introduce un ID de usuario de Discord (solo números).');
      return;
    }
    if (!/^\d+$/.test(userId)) {
      alert('El ID debe ser numérico. Activa el modo desarrollador en Discord, haz clic derecho sobre un usuario y selecciona "Copiar ID".');
      return;
    }
    fetchLanyard(userId);
  });
}
