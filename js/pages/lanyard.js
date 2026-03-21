import { escapeHtml } from '../utils.js';

// Constantes para decodificar flags de Discord (public_flags)
const DISCORD_FLAGS = {
  1: 'Discord Employee',
  2: 'Discord Partner',
  4: 'HypeSquad Events',
  8: 'Bug Hunter Level 1',
  16: 'House Bravery',
  32: 'House Brilliance',
  64: 'House Balance',
  128: 'Early Supporter',
  256: 'Team User',
  512: 'Bug Hunter Level 2',
  1024: 'Verified Bot Developer',
  4096: 'Discord Certified Moderator',
  131072: 'Discord Developer'
};

export default function lanyardPage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <h1>🟢 Perfil Lanyard</h1>
      <p>Introduce un ID de usuario de Discord para ver su presencia en tiempo real (vía api.lanyard.rest).</p>
      <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
        <input type="text" id="userId" placeholder="ID de usuario" style="flex: 1;">
        <button id="loadProfile" class="primary">Buscar</button>
        <button id="refreshProfile" style="display: none;">⟳ Refrescar</button>
      </div>
      <div id="profile" class="glass-panel" style="min-height: 200px;">
        <div class="loading-spinner" style="text-align: center; padding: 2rem;">🔍 Esperando ID...</div>
      </div>
    </div>
  `;

  const loadBtn = container.querySelector('#loadProfile');
  const refreshBtn = container.querySelector('#refreshProfile');
  const userIdInput = container.querySelector('#userId');
  const profileDiv = container.querySelector('#profile');

  let lastUserId = null;

  async function fetchLanyard(userId) {
    if (!userId) return;
    lastUserId = userId;
    profileDiv.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div class="loading-spinner">🔄 Cargando perfil de ${escapeHtml(userId)}...</div>
      </div>
    `;
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Usuario no encontrado');
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) throw new Error('Error en la respuesta de Lanyard');
      renderProfile(data.data);
      refreshBtn.style.display = 'inline-block';
    } catch (error) {
      profileDiv.innerHTML = `
        <div style="color: #ff8888; text-align: center; padding: 1rem;">
          ❌ Error: ${error.message}<br>
          <small>Verifica que el ID sea correcto y que el usuario tenga actividad pública.</small>
        </div>
      `;
      refreshBtn.style.display = 'none';
    }
  }

  function renderProfile(data) {
    const user = data.discord_user;
    const status = data.discord_status;
    const spotify = data.spotify;
    const activities = data.activities || [];
    const customStatus = activities.find(a => a.type === 4);
    const game = activities.find(a => a.type === 0 && a.name !== 'Custom Status');
    const streaming = activities.find(a => a.type === 1);
    const listening = activities.find(a => a.type === 2 && !a.name.includes('Spotify')); // otros listening
    const competing = activities.find(a => a.type === 5);
    const devices = [];
    if (data.active_on_discord_mobile) devices.push('📱 Móvil');
    if (data.active_on_discord_desktop) devices.push('💻 Escritorio');
    if (data.active_on_discord_web) devices.push('🌐 Web');

    // Badges
    const flags = user.public_flags || 0;
    const badges = [];
    for (const [bit, name] of Object.entries(DISCORD_FLAGS)) {
      if (flags & bit) badges.push(name);
    }

    // Status icon and color
    let statusIcon = '🟢', statusColor = '#43b581';
    if (status === 'idle') { statusIcon = '🌙'; statusColor = '#faa61a'; }
    else if (status === 'dnd') { statusIcon = '🔴'; statusColor = '#f04747'; }
    else if (status === 'offline') { statusIcon = '⚫'; statusColor = '#747f8d'; }

    // Avatar URL (mejor calidad)
    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

    // Banner URL (si existe)
    const bannerUrl = user.banner
      ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png?size=512`
      : null;

    profileDiv.innerHTML = `
      <div style="position: relative;">
        ${bannerUrl ? `<img src="${bannerUrl}" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 1rem; margin-bottom: 1rem;">` : ''}
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            <img src="${avatarUrl}" style="border-radius: 50%; width: 96px; height: 96px; border: 4px solid ${statusColor};">
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h2 style="margin: 0;">${escapeHtml(user.username)}#${user.discriminator}</h2>
              <span style="font-size: 1.2rem;" title="${status}">${statusIcon}</span>
            </div>
            <p><span style="font-family: monospace;">🆔 ${escapeHtml(user.id)}</span> 
              <button class="copy-id" data-id="${user.id}" style="background: none; border: none; cursor: pointer; font-size: 0.8rem;">📋 Copiar</button>
            </p>
            ${badges.length ? `<div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.5rem 0;">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        ${customStatus ? `
          <div style="margin-top: 1rem; background: #1e2a44; border-radius: 1rem; padding: 0.5rem 1rem;">
            <span>💬 Estado personalizado:</span> <strong>${escapeHtml(customStatus.state || '')}</strong>
            ${customStatus.emoji ? `<span style="font-size: 1.2rem;">${customStatus.emoji.name} ${customStatus.emoji.id ? `:${customStatus.emoji.name}:` : ''}</span>` : ''}
          </div>
        ` : ''}
        <div style="margin-top: 1rem;">
          ${game ? `
            <div style="background: #0f1422; border-radius: 1rem; padding: 0.5rem 1rem; margin-bottom: 0.5rem;">
              🎮 <strong>${escapeHtml(game.name)}</strong>
              ${game.details ? `<br>📝 ${escapeHtml(game.details)}` : ''}
              ${game.state ? `<br>📍 ${escapeHtml(game.state)}` : ''}
              ${game.assets?.large_text ? `<br>🖼️ ${escapeHtml(game.assets.large_text)}` : ''}
            </div>
          ` : ''}
          ${streaming ? `
            <div style="background: #0f1422; border-radius: 1rem; padding: 0.5rem 1rem; margin-bottom: 0.5rem;">
              📺 <strong>${escapeHtml(streaming.name)}</strong>
              ${streaming.url ? `<br><a href="${streaming.url}" target="_blank" style="color: #a777ff;">Ver stream →</a>` : ''}
              ${streaming.details ? `<br>${escapeHtml(streaming.details)}` : ''}
            </div>
          ` : ''}
          ${listening ? `
            <div style="background: #0f1422; border-radius: 1rem; padding: 0.5rem 1rem; margin-bottom: 0.5rem;">
              🎧 <strong>${escapeHtml(listening.name)}</strong>
              ${listening.details ? `<br>${escapeHtml(listening.details)}` : ''}
            </div>
          ` : ''}
          ${competing ? `
            <div style="background: #0f1422; border-radius: 1rem; padding: 0.5rem 1rem; margin-bottom: 0.5rem;">
              🏆 <strong>${escapeHtml(competing.name)}</strong>
              ${competing.details ? `<br>${escapeHtml(competing.details)}` : ''}
            </div>
          ` : ''}
        </div>
        ${spotify ? `
          <div style="margin-top: 1rem; background: #1db95420; border-radius: 1rem; padding: 0.8rem;">
            <div style="display: flex; gap: 1rem; align-items: center;">
              ${spotify.album_art_url ? `<img src="${spotify.album_art_url}" style="width: 64px; height: 64px; border-radius: 0.5rem;">` : ''}
              <div style="flex: 1;">
                <p><strong>🎵 Escuchando en Spotify</strong></p>
                <p><strong>${escapeHtml(spotify.song)}</strong><br>${escapeHtml(spotify.artist)}</p>
                ${spotify.album ? `<small>📀 ${escapeHtml(spotify.album)}</small>` : ''}
                ${spotify.timestamps?.start ? `
                  <div style="margin-top: 0.5rem;">
                    <progress value="${Date.now() - spotify.timestamps.start}" max="${spotify.timestamps.end - spotify.timestamps.start}" style="width: 100%; height: 4px; border-radius: 2px;"></progress>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        ` : ''}
        ${devices.length ? `
          <div style="margin-top: 1rem; font-size: 0.8rem; color: #aaa;">
            📡 Conectado desde: ${devices.join(', ')}
          </div>
        ` : ''}
        <div style="margin-top: 1rem; font-size: 0.7rem; text-align: right; opacity: 0.7;">
          Última actualización: ${new Date(data.listening_to_spotify ? data.spotify?.timestamps?.start : data.discord_status === 'online' ? Date.now() : data.last_updated).toLocaleString()}
        </div>
      </div>
    `;

    // Evento para copiar ID
    const copyBtn = profileDiv.querySelector('.copy-id');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const id = copyBtn.getAttribute('data-id');
        navigator.clipboard.writeText(id).then(() => {
          copyBtn.textContent = '✅ Copiado';
          setTimeout(() => copyBtn.textContent = '📋 Copiar', 2000);
        });
      });
    }
  }

  loadBtn.addEventListener('click', () => {
    const userId = userIdInput.value.trim();
    if (!userId) {
      alert('Introduce un ID de usuario de Discord');
      return;
    }
    fetchLanyard(userId);
  });

  refreshBtn.addEventListener('click', () => {
    if (lastUserId) fetchLanyard(lastUserId);
  });
}
