// Lista completa de eventos (basada en discord.js v14 y discord.py)
const eventsCatalog = [
  { name: 'ready', desc: 'El bot se conecta y está listo.' },
  { name: 'messageCreate', desc: 'Se envía un mensaje en un canal.' },
  { name: 'messageUpdate', desc: 'Se edita un mensaje.' },
  { name: 'messageDelete', desc: 'Se elimina un mensaje.' },
  { name: 'messageReactionAdd', desc: 'Se añade una reacción a un mensaje.' },
  { name: 'messageReactionRemove', desc: 'Se elimina una reacción.' },
  { name: 'guildCreate', desc: 'El bot se une a un servidor.' },
  { name: 'guildDelete', desc: 'El bot es expulsado de un servidor.' },
  { name: 'guildMemberAdd', desc: 'Un miembro se une al servidor.' },
  { name: 'guildMemberRemove', desc: 'Un miembro abandona el servidor.' },
  { name: 'guildMemberUpdate', desc: 'Se actualiza un miembro (rol, apodo).' },
  { name: 'guildBanAdd', desc: 'Un usuario es baneado.' },
  { name: 'guildBanRemove', desc: 'Se levanta un baneo.' },
  { name: 'voiceStateUpdate', desc: 'Cambia el estado de voz de un miembro.' },
  { name: 'interactionCreate', desc: 'Se ejecuta una interacción (comando, botón, etc.).' },
  { name: 'channelCreate', desc: 'Se crea un canal.' },
  { name: 'channelDelete', desc: 'Se elimina un canal.' },
  { name: 'channelUpdate', desc: 'Se actualiza un canal.' },
  { name: 'roleCreate', desc: 'Se crea un rol.' },
  { name: 'roleDelete', desc: 'Se elimina un rol.' },
  { name: 'roleUpdate', desc: 'Se actualiza un rol.' },
  { name: 'presenceUpdate', desc: 'Cambia la presencia de un usuario.' },
  { name: 'typingStart', desc: 'Un usuario comienza a escribir.' },
  { name: 'webhookUpdate', desc: 'Se actualiza un webhook.' },
  { name: 'inviteCreate', desc: 'Se crea una invitación.' },
  { name: 'inviteDelete', desc: 'Se elimina una invitación.' },
  { name: 'stageInstanceCreate', desc: 'Se crea una instancia de Stage.' },
  { name: 'stageInstanceDelete', desc: 'Se elimina una instancia de Stage.' },
  { name: 'threadCreate', desc: 'Se crea un hilo.' },
  { name: 'threadDelete', desc: 'Se elimina un hilo.' },
  { name: 'threadUpdate', desc: 'Se actualiza un hilo.' },
  { name: 'threadMemberUpdate', desc: 'Un miembro se une o sale de un hilo.' }
];

function getCodeExample(event, lang) {
  if (lang === 'js') {
    return `client.on('${event}', async (${event === 'messageCreate' ? 'message' : event === 'guildMemberAdd' ? 'member' : '...args'}) => {\n  console.log('Evento ${event} disparado');\n  // tu lógica aquí\n});`;
  } else if (lang === 'ts') {
    return `client.on('${event}', (${event === 'messageCreate' ? 'message: Message' : event === 'guildMemberAdd' ? 'member: GuildMember' : 'payload: any'}) => {\n  console.log(\`${event} triggered\`);\n});`;
  } else if (lang === 'python') {
    return `@client.event\nasync def on_${event}(${event === 'messageCreate' ? 'message' : event === 'guildMemberAdd' ? 'member' : 'arg'}):\n    print(f'Evento: ${event}')\n    # tu código aquí`;
  }
  return '// ejemplo no disponible';
}

let currentLang = 'js';
let activeEvent = eventsCatalog[0].name;

export default function eventsPage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <div class="tool-header">
        <h1>🎧 Discord Gateway Events</h1>
        <p>Lista de eventos de Discord para bots — ejemplos en distintos lenguajes</p>
        <div style="display: flex; gap: 1rem; margin: 1rem 0;">
          <button class="${currentLang === 'js' ? 'primary' : ''}" data-lang="js">JavaScript (discord.js)</button>
          <button class="${currentLang === 'ts' ? 'primary' : ''}" data-lang="ts">TypeScript (discord.js)</button>
          <button class="${currentLang === 'python' ? 'primary' : ''}" data-lang="python">Python (discord.py)</button>
        </div>
      </div>
      <div class="grid-2">
        <div class="glass-panel">
          <h3>📋 Eventos disponibles</h3>
          <div class="event-list" id="eventsList"></div>
        </div>
        <div class="glass-panel">
          <h3>📝 Ejemplo de código · <span id="langLabel">${currentLang.toUpperCase()}</span></h3>
          <div id="eventTitle" style="font-weight:bold; margin-top:8px;">Evento: ${activeEvent}</div>
          <pre class="code-block" id="codePreview"></pre>
        </div>
      </div>
    </div>
  `;

  const langBtns = container.querySelectorAll('[data-lang]');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.getAttribute('data-lang');
      updateEventsUI(container);
    });
  });

  function updateEventsUI(ctx) {
    const listDiv = ctx.querySelector('#eventsList');
    listDiv.innerHTML = '';
    eventsCatalog.forEach(ev => {
      const el = document.createElement('div');
      el.className = `event-item ${activeEvent === ev.name ? 'active' : ''}`;
      el.innerHTML = `<strong>${ev.name}</strong><br><small>${ev.desc}</small>`;
      el.addEventListener('click', () => {
        activeEvent = ev.name;
        updateEventsUI(ctx);
      });
      listDiv.appendChild(el);
    });
    const langSpan = ctx.querySelector('#langLabel');
    if (langSpan) langSpan.innerText = currentLang.toUpperCase();
    const titleSpan = ctx.querySelector('#eventTitle');
    if (titleSpan) titleSpan.innerText = `Evento: ${activeEvent}`;
    const codeBlock = ctx.querySelector('#codePreview');
    if (codeBlock) codeBlock.innerText = getCodeExample(activeEvent, currentLang);
  }

  updateEventsUI(container);
}