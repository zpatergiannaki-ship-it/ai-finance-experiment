'use strict';

async function _post(path, body) {
  const BACKEND_URL = window.AppUtils.BACKEND_URL;
  try {
    const res = await fetch(BACKEND_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(path + ' error:', text);
      return { error: text };
    }
    return { data: await res.json(), error: null };
  } catch (err) {
    console.error(path + ' exception:', err.message);
    return { error: err };
  }
}

async function insertParticipant(participantId, condition, scenarioOrder) {
  return _post('/db/participants', { participant_id: participantId, condition, scenario_order: scenarioOrder });
}

async function insertConsent(participantId, consented) {
  return _post('/db/consent', { participant_id: participantId, consented });
}

async function insertPresurvey(participantId, responses) {
  return _post('/db/presurvey', { participant_id: participantId, responses });
}

// scenario1Decision: { choice, influence, trust, manipulation_check }
async function insertScenario1Decision(participantId, scenario1Decision) {
  return _post('/db/scenario1-decision', {
    participant_id: participantId,
    choice: scenario1Decision.choice,
    influence: scenario1Decision.influence,
    trust: scenario1Decision.trust,
    manipulation_check: scenario1Decision.manipulation_check,
  });
}

async function insertScenario2Round(participantId, roundNumber, allocation, confidence, trustRating, control, compliance, disposition) {
  return _post('/db/scenario2-round', {
    participant_id: participantId,
    round_number: roundNumber,
    allocation_cash: allocation.cash,
    allocation_bonds: allocation.bonds,
    allocation_balanced: allocation.balancedFund,
    allocation_stocks: allocation.stocks,
    confidence,
    trust_rating: trustRating,
    control,
    compliance,
    disposition,
  });
}

async function insertScenario2PostMeasures(participantId, measures) {
  return _post('/db/scenario2-post-measures', {
    participant_id: participantId,
    influence: measures.influence,
    trust_scenario2: measures.trust_scenario2,
    manipulation_check: measures.manipulation_check,
  });
}

async function insertChatLog(participantId, scenarioId, roundNumber, role, message) {
  return _post('/db/chat-log', {
    participant_id: participantId,
    scenario_id: scenarioId,
    round_number: roundNumber,
    role,
    message,
  });
}

async function insertPreferenceLog(participantId, scenarioId, preference, timestamp) {
  return _post('/db/chat-log', {
    participant_id: participantId,
    scenario_id: scenarioId,
    round_number: null,
    role: 'preference',
    message: preference,
    created_at: timestamp,
  });
}

async function insertPostsurvey(participantId, responses) {
  return _post('/db/postsurvey', { participant_id: participantId, responses });
}

async function insertDecisionEvent(payload) {
  return _post('/db/decision-event', payload);
}

window.SupabaseUtils = {
  insertParticipant,
  insertConsent,
  insertPresurvey,
  insertScenario1Decision,
  insertScenario2Round,
  insertScenario2PostMeasures,
  insertChatLog,
  insertPreferenceLog,
  insertPostsurvey,
  insertDecisionEvent,
};
