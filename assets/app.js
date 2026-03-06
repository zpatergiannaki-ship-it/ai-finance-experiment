'use strict';

// CONFIGURE THIS VALUE:
const BACKEND_URL = 'https://ai-finance-experiment.onrender.com';

// ---------------------------------------------------------------------------
// STEP 1 — Randomly assign AI Anthropomorphism condition (50 / 50)
// Stored in sessionStorage under "experimentCondition".
// ---------------------------------------------------------------------------
function getCondition() {
  let cond = sessionStorage.getItem('experimentCondition');
  if (!cond) {
    cond = Math.random() < 0.5 ? 'lowAnthropomorphism' : 'highAnthropomorphism';
    sessionStorage.setItem('experimentCondition', cond);
  }
  return cond;
}

// ---------------------------------------------------------------------------
// STEP 2 — Randomly assign scenario order (50 / 50)
// Two possible orders:
//   Order A: ["scenario1", "scenario2"]
//   Order B: ["scenario2", "scenario1"]
// Stored in sessionStorage under "scenarioOrder" as a JSON array.
// ---------------------------------------------------------------------------
function getScenarioOrder() {
  let order = sessionStorage.getItem('scenarioOrder');
  if (!order) {
    const scenarioOrder = Math.random() < 0.5
      ? ['scenario1', 'scenario2']
      : ['scenario2', 'scenario1'];
    sessionStorage.setItem('scenarioOrder', JSON.stringify(scenarioOrder));
    return scenarioOrder;
  }
  return JSON.parse(order);
}

// ---------------------------------------------------------------------------
// STEP 3 — Generate / retrieve participant ID and persist all assignments
// Participant ID is generated once and stored in sessionStorage.
// All three values (participantId, experimentCondition, scenarioOrder) are
// stored together in sessionStorage.
// ---------------------------------------------------------------------------
function getParticipantId() {
  let pid = sessionStorage.getItem('participantId');
  if (!pid) {
    pid = 'P' + Date.now();
    sessionStorage.setItem('participantId', pid);
  }
  return pid;
}

/**
 * Orchestrates all three randomisation steps and guarantees that every
 * assignment is written to sessionStorage before any page uses it.
 *
 * Returns: { participantId, experimentCondition, scenarioOrder }
 */
function initExperiment() {
  // Step 1 — condition
  const experimentCondition = getCondition();

  // Step 2 — scenario order
  const scenarioOrder = getScenarioOrder();

  // Step 3 — participant ID (and persist all three together)
  const participantId = getParticipantId();

  // Ensure all three values are synchronised in sessionStorage
  sessionStorage.setItem('participantId', participantId);
  sessionStorage.setItem('experimentCondition', experimentCondition);
  sessionStorage.setItem('scenarioOrder', JSON.stringify(scenarioOrder));

  return { participantId, experimentCondition, scenarioOrder };
}

// ---------------------------------------------------------------------------
// STEP 4 — Scenario sequencing helpers
// These helpers ensure consistent scenario ordering throughout the session.
// ---------------------------------------------------------------------------

/**
 * Returns the ID of the scenario that should follow `currentScenario`,
 * based on the participant's assigned scenarioOrder.
 *
 * @param {string} currentScenario - e.g. 'scenario1' or 'scenario2'
 * @returns {string|null} - the next scenario ID, or null if there is none
 *                          (i.e. currentScenario is the last in the order)
 */
function getNextScenario(currentScenario) {
  const order = getScenarioOrder();
  // order is ['scenario1','scenario2'] or ['scenario2','scenario1']
  const idx = order.indexOf(currentScenario);
  if (idx === -1 || idx === order.length - 1) {
    // Not found, or already last scenario
    return null;
  }
  return order[idx + 1];
}

/**
 * Returns the ID of the first scenario in the participant's assigned order.
 * Use this to navigate to the correct starting scenario after the pre-survey.
 *
 * @returns {string} - e.g. 'scenario1' or 'scenario2'
 */
function getCurrentScenario() {
  const order = getScenarioOrder();
  return order[0];
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
window.AppUtils = {
  BACKEND_URL,
  initExperiment,
  getParticipantId,
  getCondition,
  getScenarioOrder,
  getNextScenario,
  getCurrentScenario,
  goTo,
  saveToLocal,
  getFromLocal,
  showError,
  showSuccess,
};
