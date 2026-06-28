const messagesList = document.getElementById('messagesList');
const LOCAL_STORAGE_KEY = 'contactMessages';

function getSavedMessages() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored).filter(Boolean);
    let updated = false;

    const normalized = parsed.map((message) => {
      if (!message.id) {
        updated = true;
        return {
          ...message,
          id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        };
      }
      return message;
    });

    if (updated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return [];
  }
}

function removeSavedMessage(messageId) {
  const savedMessages = getSavedMessages();
  const updatedMessages = savedMessages.filter((message) => message.id !== messageId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMessages));
}

function createMessageCard(message, isLocal = false) {
  const timestamp = new Date(message.createdAt || message.sentAt || Date.now()).toLocaleString();
  const localBadge = isLocal ? '<span class="message-local">Saved locally</span>' : '';

  return `
    <article class="message-card" data-id="${message.id || ''}">
      <div class="message-header">
        <div>
          <h3>${message.name}</h3>
          <span>${timestamp}</span>
          ${localBadge}
        </div>
        <button class="btn btn-secondary btn-delete" data-id="${message.id || ''}"><i class="fas fa-trash"></i> Delete</button>
      </div>
      <p><strong>Email:</strong> ${message.email}</p>
      <p>${message.message}</p>
    </article>
  `;
}

async function loadMessages() {
  if (!messagesList) return;

  const localMessages = getSavedMessages();

  try {
    const apiUrl = window.location.protocol === 'file:'
      ? 'http://localhost:8081/api/messages'
      : '/api/messages';

    const response = await fetch(apiUrl);
    const data = await response.json();
    const serverMessages = Array.isArray(data.messages) ? data.messages : [];
    const allMessages = [...serverMessages, ...localMessages];

    if (!allMessages.length) {
      messagesList.innerHTML = '<div class="empty-state">No messages yet.</div>';
      return;
    }

    messagesList.innerHTML = allMessages.map((message) => createMessageCard(message, !message.id || String(message.id).startsWith('local-'))).join('');
  } catch (error) {
    console.warn('Error loading messages from API, showing saved local messages instead.', error);

    if (!localMessages.length) {
      messagesList.innerHTML = '<div class="empty-state">No messages yet.</div>';
      return;
    }

    messagesList.innerHTML = localMessages.map((message) => createMessageCard(message, true)).join('');
  }
}

messagesList?.addEventListener('click', async (event) => {
  const target = event.target.closest('.btn-delete');
  if (!target) return;

  event.preventDefault();
  const messageId = String(target.dataset.id || '').trim();
  if (!messageId) return;

  const confirmed = window.confirm('Delete this message?');
  if (!confirmed) return;

  if (messageId.startsWith('local-')) {
    removeSavedMessage(messageId);
    loadMessages();
    return;
  }

  try {
    const deleteUrl = window.location.protocol === 'file:'
      ? `http://localhost:8081/api/messages/${encodeURIComponent(messageId)}`
      : `/api/messages/${encodeURIComponent(messageId)}`;

    const response = await fetch(deleteUrl, { method: 'DELETE' });
    const contentType = response.headers.get('content-type') || '';
    let data = { success: false, error: 'Unable to delete message.' };

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: response.ok, error: text || data.error };
    }

    if (response.ok && data.success) {
      loadMessages();
    } else {
      throw new Error(data.error || 'Unable to delete message.');
    }
  } catch (deleteError) {
    console.error('Delete error:', deleteError);
    alert(deleteError.message || 'Unable to delete message. Please try again.');
  }
});

loadMessages();
