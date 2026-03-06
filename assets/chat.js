'use strict';

let _chatContainerId = null;
let _scenarioId = null;
let _roundNumber = null;
let _messageCount = 0;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initChat(containerId, scenarioId, roundNumber, predefinedQuestions) {
  _chatContainerId = containerId;
  _scenarioId = scenarioId;
  _roundNumber = roundNumber || null;
  _messageCount = 0;

  const container = document.getElementById(containerId);
  if (!container) return;

  const predefinedHtml = (Array.isArray(predefinedQuestions) && predefinedQuestions.length > 0)
    ? '<div class="chat-predefined-questions" id="chat-predefined-' + containerId + '">' +
        predefinedQuestions.map(function (q) {
          return '<button class="chat-predefined-btn" data-question="' + escapeHtml(q) + '">' + escapeHtml(q) + '</button>';
        }).join('') +
      '</div>'
    : '';

  container.innerHTML =
    '<div class="chat-messages" id="chat-messages-' + containerId + '"></div>' +
    predefinedHtml +
    '<div class="chat-input-row">' +
      '<input type="text" id="chat-input-' + containerId + '" class="chat-input" placeholder="Κάντε μια ερώτηση στον βοηθό…" maxlength="500" />' +
      '<button id="chat-send-' + containerId + '" class="btn btn-primary chat-send-btn">Αποστολή</button>' +
    '</div>' +
    '<div id="chat-error-' + containerId + '" class="chat-error" style="display:none;"></div>';

  const sendBtn = document.getElementById('chat-send-' + containerId);
  const inputEl = document.getElementById('chat-input-' + containerId);

  sendBtn.addEventListener('click', function () {
    const msg = inputEl.value.trim();
    if (!msg) return;
    inputEl.value = '';
    sendMessage(msg);
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const msg = inputEl.value.trim();
      if (!msg) return;
      inputEl.value = '';
      sendMessage(msg);
    }
  });

  const predefinedContainer = document.getElementById('chat-predefined-' + containerId);
  if (predefinedContainer) {
    predefinedContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('.chat-predefined-btn');
      if (!btn || btn.disabled) return;
      const question = btn.getAttribute('data-question');
      const input = document.getElementById('chat-input-' + containerId);
      if (input) input.value = '';
      sendMessage(question);
    });
  }
}

async function sendMessage(message) {
  const messagesEl = document.getElementById('chat-messages-' + _chatContainerId);
  const errorEl = document.getElementById('chat-error-' + _chatContainerId);
  const sendBtn = document.getElementById('chat-send-' + _chatContainerId);
  const inputEl = document.getElementById('chat-input-' + _chatContainerId);

  if (!messagesEl) return;

  const participantId = window.AppUtils.getParticipantId();
  const condition = window.AppUtils.getCondition();

  // Append user bubble
  appendBubble(messagesEl, 'user', message);

  // Disable input while waiting
  if (sendBtn) sendBtn.disabled = true;
  if (inputEl) inputEl.disabled = true;
  const predefinedBtns = document.querySelectorAll('#chat-predefined-' + _chatContainerId + ' .chat-predefined-btn');
  predefinedBtns.forEach(function (btn) { btn.disabled = true; });

  // Show loading indicator
  const loadingId = 'loading-' + Date.now();
  const loadingEl = document.createElement('div');
  loadingEl.id = loadingId;
  loadingEl.className = 'chat-bubble assistant loading';
  loadingEl.innerHTML = '<span class="dots"><span>.</span><span>.</span><span>.</span></span>';
  messagesEl.appendChild(loadingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Save user message to Supabase
  if (window.SupabaseUtils) {
    await window.SupabaseUtils.insertChatLog(participantId, _scenarioId, _roundNumber, 'user', message);
  }

  // Hide previous error
  if (errorEl) errorEl.style.display = 'none';

  try {
    const body = {
      participantId,
      scenarioId: _scenarioId,
      condition,
      message,
    };
    if (_roundNumber !== null && _roundNumber !== undefined) {
      body.roundNumber = _roundNumber;
    }

    const response = await fetch(window.AppUtils.BACKEND_URL + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Remove loading indicator
    const loadingNode = document.getElementById(loadingId);
    if (loadingNode) loadingNode.remove();

    if (!response.ok || data.error) {
      const errMsg = (data && data.error) ? data.error : 'Αποτυχία λήψης απάντησης από τον βοηθό. Δοκιμάστε ξανά.';
      if (errorEl) {
        errorEl.textContent = errMsg;
        errorEl.style.display = 'block';
      }
    } else {
      const reply = data.reply || '';
      appendBubble(messagesEl, 'assistant', reply);
      _messageCount++;

      // Save assistant message to Supabase
      if (window.SupabaseUtils) {
        await window.SupabaseUtils.insertChatLog(participantId, _scenarioId, _roundNumber, 'assistant', reply);
      }

      // Notify the page that a message has been sent (fire custom event)
      document.dispatchEvent(new CustomEvent('chatMessageSent', { detail: { count: _messageCount } }));
    }
  } catch (err) {
    const loadingNode = document.getElementById(loadingId);
    if (loadingNode) loadingNode.remove();
    if (errorEl) {
      errorEl.textContent = 'Δεν ήταν δυνατή η επικοινωνία με τον βοηθό. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
      errorEl.style.display = 'block';
    }
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.disabled = false;
    if (inputEl) inputEl.focus();
    const predefinedBtns = document.querySelectorAll('#chat-predefined-' + _chatContainerId + ' .chat-predefined-btn');
    predefinedBtns.forEach(function (btn) { btn.disabled = false; });
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function markdownToHtml(text) {
  function applyBold(str) {
    return escapeHtml(str).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  const lines = text.split('\n');
  const parts = [];
  let currentType = null; // 'ol', 'ul', or 'p'
  let currentItems = [];

  function flush() {
    if (currentItems.length === 0) return;
    if (currentType === 'ol') {
      parts.push('<ol>' + currentItems.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>');
    } else if (currentType === 'ul') {
      parts.push('<ul>' + currentItems.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>');
    } else if (currentType === 'p') {
      parts.push('<p>' + currentItems.join('<br>') + '</p>');
    }
    currentItems = [];
    currentType = null;
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line === '') {
      flush();
    } else if (/^\d+\.\s/.test(line)) {
      if (currentType !== 'ol') { flush(); currentType = 'ol'; }
      currentItems.push(applyBold(line.replace(/^\d+\.\s+/, '')));
    } else if (/^-\s/.test(line)) {
      if (currentType !== 'ul') { flush(); currentType = 'ul'; }
      currentItems.push(applyBold(line.replace(/^-\s+/, '')));
    } else {
      if (currentType !== 'p') { flush(); currentType = 'p'; }
      currentItems.push(applyBold(line));
    }
  }
  flush();
  return parts.join('');
}

function appendBubble(container, role, text) {
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + role;
  if (role === 'assistant') {
    div.innerHTML = markdownToHtml(text);
  } else {
    div.textContent = text;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function getMessageCount() {
  return _messageCount;
}

window.ChatUtils = {
  initChat,
  sendMessage,
  getMessageCount,
};
