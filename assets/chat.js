'use strict';

let _chatContainerId = null;
let _scenarioId = null;
let _roundNumber = null;
let _messageCount = 0;
let _chatQueryCount = 0;
let _chatStartTime = null;
let _preference = null;
let _preferenceCompleted = false;
let _preferenceTimestamp = null;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectPredefinedQuestions(messagesEl, questions, containerId) {
  if (!Array.isArray(questions) || questions.length === 0) return;

  // Find the last assistant message row to attach buttons beneath it
  const rows = messagesEl.querySelectorAll('.chat-message-row.assistant');
  const targetRow = rows.length > 0 ? rows[rows.length - 1] : messagesEl;

  const div = document.createElement('div');
  div.className = 'chat-quick-replies';
  div.id = 'chat-predefined-' + containerId;
  questions.forEach(function (q) {
    const btn = document.createElement('button');
    btn.className = 'chat-predefined-btn';
    btn.setAttribute('data-question', q);
    btn.textContent = q;
    div.appendChild(btn);
  });
  targetRow.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function initChat(containerId, scenarioId, roundNumber, predefinedQuestions) {
  _chatContainerId = containerId;
  _scenarioId = scenarioId;
  _roundNumber = roundNumber || null;
  _messageCount = 0;
  _chatQueryCount = 0;
  _chatStartTime = null;
  _preference = null;
  _preferenceCompleted = false;
  _preferenceTimestamp = null;

  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML =
    '<div class="chat-messages" id="chat-messages-' + containerId + '"></div>' +
    '<div class="chat-input-row">' +
      '<input type="text" id="chat-input-' + containerId + '" class="chat-input" placeholder="Κάντε μια ερώτηση στον βοηθό…" maxlength="500" />' +
      '<button id="chat-send-' + containerId + '" class="btn btn-primary chat-send-btn">Αποστολή</button>' +
    '</div>' +
    '<div id="chat-error-' + containerId + '" class="chat-error" style="display:none;"></div>';

  const sendBtn = document.getElementById('chat-send-' + containerId);
  const inputEl = document.getElementById('chat-input-' + containerId);
  const messagesEl = document.getElementById('chat-messages-' + containerId);

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

  if (messagesEl) {
    messagesEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.chat-predefined-btn');
      if (!btn || btn.disabled) return;
      const question = btn.getAttribute('data-question');
      if (inputEl) inputEl.value = '';
      sendMessage(question);
    });
  }

  // Preference step configuration
  let prefConfig = null;
  if (scenarioId === 'scenario1') {
    prefConfig = {
      question: 'Πριν συνεχίσουμε, θα ήθελα μια σύντομη πληροφορία για να προσαρμόσω τον τρόπο που θα σας εξηγήσω τη σύσταση.\nΤι είναι πιο σημαντικό για εσάς σε αυτή την απόφαση;',
      options: [
        'Να γνωρίζω ακριβώς τη μηνιαία δόση',
        'Να έχω ευελιξία στην αποπληρωμή',
        'Να ελαχιστοποιήσω το συνολικό κόστος',
        'Να έχω άμεση πρόσβαση στα χρήματα',
      ],
      followUp: 'Ευχαριστώ. Θα το λάβω υπόψη μόνο για να προσαρμόσω τον τρόπο που θα σας παρουσιάσω τη σύσταση.',
    };
  } else if (scenarioId === 'scenario2') {
    prefConfig = {
      question: 'Πριν προχωρήσουμε, θα ήθελα να μου πείτε ποια επενδυτική προσέγγιση σας εκφράζει περισσότερο, ώστε να προσαρμόσω τον τρόπο εξήγησης της πρότασης.',
      options: [
        'Προτιμώ σταθερότητα και χαμηλό κίνδυνο',
        'Προτιμώ ισορροπία μεταξύ κινδύνου και απόδοσης',
        'Προτιμώ υψηλότερη απόδοση ακόμη και με μεγαλύτερο κίνδυνο',
      ],
      followUp: 'Ευχαριστώ. Θα χρησιμοποιήσω αυτή την πληροφορία μόνο για να προσαρμόσω τον τρόπο εξήγησης της επενδυτικής πρότασης.',
    };
  }

  // For scenario2 rounds 2–4, check if preference was already captured
  if (scenarioId === 'scenario2' && roundNumber && roundNumber > 1) {
    const stored = sessionStorage.getItem('scenario2_preference');
    if (stored) {
      _preference = stored;
      _preferenceCompleted = true;
      // Input stays unlocked (already enabled from HTML render)
      if (messagesEl) {
        injectPredefinedQuestions(messagesEl, predefinedQuestions, containerId);
      }
      return;
    }
  }

  // Show preference question if applicable
  if (prefConfig) {
    // Lock input until preference is completed
    if (sendBtn) {
      sendBtn.disabled = true;
    }
    if (inputEl) {
      inputEl.disabled = true;
      inputEl.placeholder = 'Απαντήστε πρώτα στην παραπάνω ερώτηση…';
    }

    if (messagesEl) {
      // Show preference question as assistant bubble
      appendBubble(messagesEl, 'assistant', prefConfig.question);

      // Show quick-reply buttons beneath the assistant bubble
      const prefBtnsDiv = document.createElement('div');
      prefBtnsDiv.className = 'chat-preference-btns';
      prefBtnsDiv.id = 'chat-pref-btns-' + containerId;
      prefConfig.options.forEach(function (option) {
        const btn = document.createElement('button');
        btn.className = 'chat-pref-btn';
        btn.setAttribute('data-value', option);
        btn.textContent = option;
        btn.addEventListener('click', function () {
          _preference = option;
          _preferenceTimestamp = new Date().toISOString();
          _preferenceCompleted = true;

          if (scenarioId === 'scenario2') {
            sessionStorage.setItem('scenario2_preference', option);
          }

          // Disable all preference buttons
          const allPrefBtns = prefBtnsDiv.querySelectorAll('.chat-pref-btn');
          allPrefBtns.forEach(function (b) { b.disabled = true; });

          // Render selected option as user bubble
          appendBubble(messagesEl, 'user', option);

          // Remove preference buttons div
          if (prefBtnsDiv.parentNode) {
            prefBtnsDiv.parentNode.removeChild(prefBtnsDiv);
          }

          // Show follow-up assistant message
          appendBubble(messagesEl, 'assistant', prefConfig.followUp);

          // Inject predefined questions now that preference step is complete
          injectPredefinedQuestions(messagesEl, predefinedQuestions, containerId);

          // Log to Supabase
          const participantId = window.AppUtils.getParticipantId();
          if (window.SupabaseUtils && window.SupabaseUtils.insertPreferenceLog) {
            window.SupabaseUtils.insertPreferenceLog(participantId, scenarioId, option);
          }

          // Unlock input
          if (sendBtn) sendBtn.disabled = false;
          if (inputEl) {
            inputEl.disabled = false;
            inputEl.placeholder = 'Κάντε μια ερώτηση στον βοηθό…';
            inputEl.focus();
          }
        });
        prefBtnsDiv.appendChild(btn);
      });
      // Attach preference buttons beneath the last assistant bubble
      const assistantRows = messagesEl.querySelectorAll('.chat-message-row.assistant');
      const prefTarget = assistantRows.length > 0 ? assistantRows[assistantRows.length - 1] : messagesEl;
      prefTarget.appendChild(prefBtnsDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  } else {
    // No preference step – inject predefined questions immediately
    if (messagesEl) {
      injectPredefinedQuestions(messagesEl, predefinedQuestions, containerId);
    }
  }
}

function showTypingIndicator(messagesEl) {
  const row = document.createElement('div');
  row.className = 'chat-message-row assistant';
  row.id = 'chat-typing-row';
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  row.appendChild(typing);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return row;
}

async function sendMessage(message) {
  const messagesEl = document.getElementById('chat-messages-' + _chatContainerId);
  const errorEl   = document.getElementById('chat-error-' + _chatContainerId);
  const sendBtn   = document.getElementById('chat-send-' + _chatContainerId);
  const inputEl   = document.getElementById('chat-input-' + _chatContainerId);

  if (!messagesEl) return;

  const participantId = window.AppUtils.getParticipantId();
  const condition = window.AppUtils.getCondition();

  // Disable input while waiting
  if (sendBtn) sendBtn.disabled = true;
  if (inputEl) inputEl.disabled = true;
  if (errorEl) errorEl.style.display = 'none';

  // Remove predefined-question quick-reply buttons on first real send
  const predefinedDiv = document.getElementById('chat-predefined-' + _chatContainerId);
  if (predefinedDiv) predefinedDiv.remove();

  // Append user bubble
  appendBubble(messagesEl, 'user', message);

  // Track user query count and chat start time
  if (_chatStartTime === null) {
    _chatStartTime = Date.now();
  }
  _chatQueryCount++;

  // Show typing indicator
  const typingRow = showTypingIndicator(messagesEl);

  // Save user message to Supabase
  if (window.SupabaseUtils) {
    await window.SupabaseUtils.insertChatLog(participantId, _scenarioId, _roundNumber, 'user', message);
  }

  let responseText = null;
  try {
    const body = {
      participantId,
      scenarioId: _scenarioId,
      condition,
      message,
      preference: _preference || null,
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

    if (!response.ok || data.error) {
      const errMsg = (data && data.error) ? data.error : 'Αποτυχία λήψης απάντησης από τον βοηθό. Δοκιμάστε ξανά.';
      if (errorEl) {
        errorEl.textContent = errMsg;
        errorEl.style.display = 'block';
      }
    } else {
      responseText = data.reply || '';
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = 'Δεν ήταν δυνατή η επικοινωνία με τον βοηθό. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.';
      errorEl.style.display = 'block';
    }
  }

  // Remove typing indicator
  if (typingRow && typingRow.parentNode) typingRow.remove();

  if (responseText !== null) {
    appendBubble(messagesEl, 'assistant', responseText);
    _messageCount++;

    // Save assistant message to Supabase
    if (window.SupabaseUtils) {
      await window.SupabaseUtils.insertChatLog(participantId, _scenarioId, _roundNumber, 'assistant', responseText);
    }

    // Notify the page that a message has been sent (fire custom event)
    document.dispatchEvent(new CustomEvent('chatMessageSent', { detail: { count: _messageCount } }));
  }

  // Re-enable input
  if (sendBtn) sendBtn.disabled = false;
  if (inputEl) {
    inputEl.disabled = false;
    inputEl.focus();
  }
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
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

function appendBubble(messagesEl, role, text) {
  const row = document.createElement('div');
  row.className = 'chat-message-row ' + role;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  if (role === 'assistant') {
    bubble.innerHTML = markdownToHtml(text);
  } else {
    bubble.textContent = text;
  }
  row.appendChild(bubble);

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return row;
}

function getMessageCount() {
  return _messageCount;
}

function getChatQueryCount() {
  return _chatQueryCount;
}

function getTimeSpentInChatMs() {
  return _chatStartTime !== null ? Date.now() - _chatStartTime : 0;
}

function getPreference() {
  return _preference;
}

window.ChatUtils = {
  initChat,
  sendMessage,
  getMessageCount,
  getChatQueryCount,
  getTimeSpentInChatMs,
  getPreference,
};
