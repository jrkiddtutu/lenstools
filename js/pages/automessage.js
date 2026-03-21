import { escapeHtml } from '../utils.js';

let tasks = [];
let activeIntervals = {};

function addLog(panel, text) {
  if (!panel) return;
  const p = document.createElement('div');
  p.innerHTML = `[${new Date().toLocaleTimeString()}] ${text}`;
  panel.prepend(p);
  if (panel.children.length > 30) panel.removeChild(panel.lastChild);
}

async function sendDiscordMessage(token, channelId, message) {
  const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: message })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function startTaskInterval(task, logPanel) {
  if (activeIntervals[task.id]) clearInterval(activeIntervals[task.id]);
  const intervalMs = task.intervalMinutes * 60 * 1000;

  const executeSend = async () => {
    if (task.mode === 'real' && task.token && task.channelId) {
      const result = await sendDiscordMessage(task.token, task.channelId, task.message);
      if (result.success) {
        addLog(logPanel, `✅ [${task.botName}] envió mensaje real a <#${task.channelId}>: "${task.message}"`);
      } else {
        addLog(logPanel, `❌ [${task.botName}] falló al enviar: ${result.error}`);
      }
    } else {
      // Modo simulación
      addLog(logPanel, `🤖 [${task.botName}] (simulación) envió: "${task.message}" a canales: ${task.channels.join(', ')}`);
    }
  };

  // Enviar inmediatamente al iniciar
  executeSend();
  const intervalId = setInterval(executeSend, intervalMs);
  activeIntervals[task.id] = intervalId;
}

function renderTasks(container, logPanel) {
  const tasksDiv = container.querySelector('#tasksList');
  if (!tasksDiv) return;
  tasksDiv.innerHTML = '';
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <div><strong>🤖 Bot: ${escapeHtml(task.botName)}</strong> | ⏱️ Cada ${task.intervalMinutes} min</div>
      <div>💬 Mensaje: "${escapeHtml(task.message)}"</div>
      <div>📡 Modo: ${task.mode === 'real' ? 'Real (Discord API)' : 'Simulación'}</div>
      ${task.mode === 'real' ? `<div>🔑 Token: ${escapeHtml(task.token?.substring(0, 10))}... | 📢 Canal ID: ${escapeHtml(task.channelId)}</div>` : `<div>📢 Canales simulados: ${task.channels.join(', ')}</div>`}
      <div>Estado: ${task.active ? '✅ Activo' : '⏸️ Detenido'}</div>
      <div style="margin-top:8px;">
        <button data-id="${task.id}" class="toggleTaskBtn">${task.active ? '⏹️ Detener' : '▶️ Iniciar'}</button>
        <button data-id="${task.id}" class="deleteTaskBtn">🗑️ Eliminar</button>
      </div>
    `;
    tasksDiv.appendChild(card);
  });

  document.querySelectorAll('.toggleTaskBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const task = tasks.find(t => t.id === id);
      if (task) {
        if (task.active) {
          if (activeIntervals[task.id]) clearInterval(activeIntervals[task.id]);
          delete activeIntervals[task.id];
          task.active = false;
        } else {
          startTaskInterval(task, logPanel);
          task.active = true;
        }
        renderTasks(container, logPanel);
      }
    });
  });

  document.querySelectorAll('.deleteTaskBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        if (activeIntervals[tasks[idx].id]) clearInterval(activeIntervals[tasks[idx].id]);
        delete activeIntervals[tasks[idx].id];
        tasks.splice(idx, 1);
        renderTasks(container, logPanel);
      }
    });
  });
}

export default function autoMessagePage(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <h1>🤖 AutoMessage · Mensajes Automatizados</h1>
      <p>Configura un bot para enviar mensajes cada cierto tiempo. Puedes usar modo <strong>simulación</strong> (solo registros locales) o modo <strong>real</strong> (con token de bot y canal ID).</p>
      <div style="background:#0c0f1a; border-radius:1.5rem; padding:1.2rem; margin:1rem 0;">
        <div class="grid-2">
          <div><label>Nombre del Bot:</label><input type="text" id="botName" placeholder="Ej: HelperBot"></div>
          <div><label>Mensaje:</label><input type="text" id="messageText" placeholder="Hola, recordatorio..."></div>
          <div><label>Intervalo (minutos):</label><input type="number" id="intervalMin" value="1" step="0.5"></div>
          <div><label>Modo:</label>
            <select id="modeSelect">
              <option value="sim">Simulación</option>
              <option value="real">Real (Discord API)</option>
            </select>
          </div>
        </div>
        <div id="simFields" style="margin-top: 1rem;">
          <label>Canales simulados (separados por coma):</label>
          <input type="text" id="channelsInput" placeholder="general,anuncios,bot-commands">
        </div>
        <div id="realFields" style="display: none; margin-top: 1rem;">
          <div class="grid-2">
            <div><label>Token del Bot:</label><input type="text" id="botToken" placeholder="MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.XYZ..."></div>
            <div><label>ID del Canal:</label><input type="text" id="channelId" placeholder="123456789012345678"></div>
          </div>
        </div>
        <button id="addTaskBtn" class="primary" style="margin-top:1rem;">➕ Agendar mensaje automático</button>
      </div>
      <div><h3>📋 Tareas activas</h3><div id="tasksList"></div></div>
      <div><h3>📡 Log de envíos</h3><div id="autoLogPanel" class="glass-panel" style="height:200px; overflow-y:auto; font-family: monospace; font-size:0.8rem;"></div></div>
    </div>
  `;

  const logPanel = container.querySelector('#autoLogPanel');
  logPanel.innerHTML = '<i>Los mensajes simulados/Reales aparecerán aquí...</i>';

  const modeSelect = container.querySelector('#modeSelect');
  const simFields = container.querySelector('#simFields');
  const realFields = container.querySelector('#realFields');

  modeSelect.addEventListener('change', () => {
    if (modeSelect.value === 'real') {
      simFields.style.display = 'none';
      realFields.style.display = 'block';
    } else {
      simFields.style.display = 'block';
      realFields.style.display = 'none';
    }
  });

  function addTask() {
    const botName = container.querySelector('#botName').value.trim();
    const message = container.querySelector('#messageText').value.trim();
    let intervalMinutes = parseFloat(container.querySelector('#intervalMin').value);
    const mode = modeSelect.value;

    if (!botName || !message || isNaN(intervalMinutes) || intervalMinutes <= 0) {
      alert('Completa todos los campos correctamente');
      return;
    }

    if (mode === 'sim') {
      const channelsRaw = container.querySelector('#channelsInput').value.trim();
      if (!channelsRaw) {
        alert('Introduce al menos un canal simulado');
        return;
      }
      const channels = channelsRaw.split(',').map(s => s.trim()).filter(c => c);
      if (channels.length === 0) return;
      const newTask = {
        id: Date.now(),
        botName,
        message,
        intervalMinutes,
        mode: 'sim',
        channels,
        active: true
      };
      tasks.push(newTask);
      startTaskInterval(newTask, logPanel);
    } else {
      const token = container.querySelector('#botToken').value.trim();
      const channelId = container.querySelector('#channelId').value.trim();
      if (!token || !channelId) {
        alert('Introduce token y canal ID para modo real');
        return;
      }
      const newTask = {
        id: Date.now(),
        botName,
        message,
        intervalMinutes,
        mode: 'real',
        token,
        channelId,
        active: true
      };
      tasks.push(newTask);
      startTaskInterval(newTask, logPanel);
    }

    renderTasks(container, logPanel);
    // Limpiar campos
    container.querySelector('#botName').value = '';
    container.querySelector('#messageText').value = '';
    container.querySelector('#intervalMin').value = '1';
    container.querySelector('#channelsInput').value = '';
    container.querySelector('#botToken').value = '';
    container.querySelector('#channelId').value = '';
  }

  container.querySelector('#addTaskBtn').addEventListener('click', addTask);
  renderTasks(container, logPanel);
}