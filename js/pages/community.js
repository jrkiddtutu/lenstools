import { escapeHtml } from '../utils.js';
import { getCurrentUser, onAuthChange } from '../auth.js';

let posts = [];

function loadCommunityData() {
  const stored = localStorage.getItem('lenstools_community');
  if (stored) {
    posts = JSON.parse(stored);
  } else {
    posts = [
      { id: Date.now()+1, title: '¿Cómo manejar eventos de Discord en Python?', content: 'Estoy usando discord.py, necesito ejemplos de on_ready y on_message.', author: 'CoderGirl', upvotes: 12, comments: [{ author: 'devHelper', text: 'Mira la documentación oficial, también puedes usar comandos de bot.', timestamp: Date.now() }], timestamp: Date.now() - 86400000, tags: 'python,discord' },
      { id: Date.now()+2, title: 'Mi bot no responde a slash commands (discord.js v14)', content: 'Ya registré los comandos globalmente pero no aparecen', author: 'jsMaster', upvotes: 5, comments: [], timestamp: Date.now() - 172800000, tags: 'javascript,discord.js' }
    ];
    saveCommunity();
  }
}

function saveCommunity() {
  localStorage.setItem('lenstools_community', JSON.stringify(posts));
}

function renderFeed(container) {
  container.innerHTML = `
    <div class="glass-panel">
      <div style="display:flex; justify-content: space-between; align-items:center; flex-wrap:wrap;">
        <h1>📬 Dev Community · Discord & Programación</h1>
        <button id="newPostBtn" class="primary">+ Nuevo post</button>
      </div>
      <div id="newPostForm" class="new-post-form" style="display: none;">
        <h3>Crear nuevo post</h3>
        <input type="text" id="postTitle" placeholder="Título">
        <textarea id="postContent" placeholder="Contenido" rows="3"></textarea>
        <input type="text" id="postTags" placeholder="Tags (separados por coma)">
        <button id="submitPostBtn" class="primary">Publicar</button>
        <button id="cancelPostBtn">Cancelar</button>
      </div>
      <div id="postsFeed" style="margin-top:2rem;"></div>
    </div>
  `;

  const postsFeed = container.querySelector('#postsFeed');
  const newPostBtn = container.querySelector('#newPostBtn');
  const formDiv = container.querySelector('#newPostForm');

  newPostBtn.addEventListener('click', () => {
    formDiv.style.display = 'block';
  });

  container.querySelector('#cancelPostBtn')?.addEventListener('click', () => {
    formDiv.style.display = 'none';
  });

  container.querySelector('#submitPostBtn')?.addEventListener('click', () => {
    const title = container.querySelector('#postTitle').value.trim();
    const content = container.querySelector('#postContent').value.trim();
    const tags = container.querySelector('#postTags').value.trim();
    const author = getCurrentUser();
    if (!author) {
      alert('Debes iniciar sesión para publicar');
      return;
    }
    if (!title) {
      alert('El título es obligatorio');
      return;
    }
    const newPost = {
      id: Date.now(),
      title: title.slice(0, 80),
      content: content || '',
      author: author,
      upvotes: 0,
      comments: [],
      timestamp: Date.now(),
      tags: tags || 'discord,coding'
    };
    posts.unshift(newPost);
    saveCommunity();
    formDiv.style.display = 'none';
    container.querySelector('#postTitle').value = '';
    container.querySelector('#postContent').value = '';
    container.querySelector('#postTags').value = '';
    renderFeed(container);
  });

  function displayPosts() {
    posts.sort((a,b) => b.upvotes - a.upvotes);
    postsFeed.innerHTML = '';
    posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.className = 'community-post';
      postEl.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <h3>${escapeHtml(post.title)}</h3>
          <div class="vote-area">
            <button data-id="${post.id}" data-delta="1" class="vote-up">▲ ${post.upvotes}</button>
            <button data-id="${post.id}" data-delta="-1" class="vote-down">▼</button>
          </div>
        </div>
        <p>${escapeHtml(post.content)}</p>
        <small>👤 ${escapeHtml(post.author)} · 🏷️ ${escapeHtml(post.tags)} · ${new Date(post.timestamp).toLocaleString()}</small>
        <div style="margin-top:12px;">
          <button class="toggle-comments" data-id="${post.id}">💬 Comentarios (${post.comments?.length || 0})</button>
          <div id="comments-${post.id}" style="display:none; margin-top:12px;"></div>
          <div><textarea id="newComment-${post.id}" placeholder="Escribe un comentario..." rows="2" style="width:100%;"></textarea>
          <button class="add-comment" data-id="${post.id}">Responder</button></div>
        </div>
      `;
      postsFeed.appendChild(postEl);
    });

    // Votación
    document.querySelectorAll('.vote-up, .vote-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        const delta = parseInt(btn.getAttribute('data-delta'));
        const post = posts.find(p => p.id === id);
        if (post) {
          post.upvotes += delta;
          saveCommunity();
          renderFeed(container);
        }
      });
    });

    // Comentarios
    document.querySelectorAll('.toggle-comments').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const commentDiv = document.getElementById(`comments-${id}`);
        if (commentDiv.style.display === 'none') {
          const post = posts.find(p => p.id == id);
          commentDiv.innerHTML = (post.comments || []).map(c => `<div style="border-left:2px solid #5f7ef2; margin:6px 0; padding-left:10px;"><strong>${escapeHtml(c.author)}</strong>: ${escapeHtml(c.text)}</div>`).join('');
          commentDiv.style.display = 'block';
        } else {
          commentDiv.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.add-comment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        const textarea = document.getElementById(`newComment-${id}`);
        const text = textarea.value.trim();
        const author = getCurrentUser();
        if (!author) {
          alert('Debes iniciar sesión para comentar');
          return;
        }
        if (text) {
          const post = posts.find(p => p.id === id);
          post.comments = post.comments || [];
          post.comments.push({ author: author, text: text, timestamp: Date.now() });
          saveCommunity();
          renderFeed(container);
        } else alert('Escribe un comentario');
      });
    });
  }

  displayPosts();
}

export default function communityPage(container) {
  loadCommunityData();
  renderFeed(container);
  // Refrescar la vista cuando cambie el usuario (para que se vea el autor correcto en el formulario)
  onAuthChange(() => {
    renderFeed(container);
  });
}