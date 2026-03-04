'use strict';

// CONFIGURE THIS VALUE:
const BACKEND_URL = 'https://ai-finance-experiment.onrender.com';

function getParticipantId() {
  let pid = localStorage.getItem('exp_pid');
  if (!pid) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      pid = crypto.randomUUID();
    } else {
      // UUID v4 fallback
      pid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem('exp_pid', pid);
  }
  return pid;
}

function getCondition() {
  let cond = localStorage.getItem('exp_condition');
  if (!cond) {
    cond = Math.random() < 0.5 ? 'lowAnthropomorphism' : 'highAnthropomorphism';
    localStorage.setItem('exp_condition', cond);
  }
  return cond;
}

function goTo(page) {
  // Determine if we are currently in /pages/ subdirectory
  const inPages = window.location.pathname.includes('/pages/');
  if (inPages) {
    window.location.href = page + '.html';
  } else {
    window.location.href = 'pages/' + page + '.html';
  }
}

function saveToLocal(key, value) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

function getFromLocal(key) {
  const val = localStorage.getItem(key);
  if (val === null) return null;
  try {
    return JSON.parse(val);
  } catch (_) {
    return val;
  }
}

function showError(msg) {
  let banner = document.getElementById('app-error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'app-error-banner';
    banner.className = 'banner banner-error';
    document.body.insertBefore(banner, document.body.firstChild);
  }
  banner.textContent = msg;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 6000);
}

function showSuccess(msg) {
  let banner = document.getElementById('app-success-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'app-success-banner';
    banner.className = 'banner banner-success';
    document.body.insertBefore(banner, document.body.firstChild);
  }
  banner.textContent = msg;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 4000);
}

window.AppUtils = {
  BACKEND_URL,
  getParticipantId,
  getCondition,
  goTo,
  saveToLocal,
  getFromLocal,
  showError,
  showSuccess,
};
