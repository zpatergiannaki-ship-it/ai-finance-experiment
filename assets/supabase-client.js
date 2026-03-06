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
  return _post('/db/participants', {
    participant_id: participantId,
    condition,
    scenario_order: Array.isArray(scenarioOrder) ? JSON.stringify(scenarioOrder) : scenarioOrder,
  });
}

async function insertConsent(participantId, consented) {
  return _post('/db/consent', { participant_id: participantId, consented });
}

async function insertPresurvey(participantId, responses) {
  return _post('/db/presurvey', { participant_id: participantId, responses });
}

async function insertScenario1Decision(participantId, scenario1Decision) {
  return _post('/db/scenario1-decision', {
    participant_id:        participantId,
    scenario_id:           'scenario1',
    choice:                scenario1Decision.choice,
    influence:             scenario1Decision.influence,
    trust:                 scenario1Decision.trust,
    manipulation_check:    scenario1Decision.manipulation_check,
    chat_query_count:      scenario1Decision.chat_query_count      ?? 0,
    chat_message_count:    scenario1Decision.chat_message_count    ?? 0,
    time_spent_in_chat_ms: scenario1Decision.time_spent_in_chat_ms ?? 0,
  });
}

async function insertScenario2Round(
  participantId, roundNumber, allocation,
  confidence, trustRating, control, compliance, disposition,
  aiRecommendation, chatQueryCount, chatMessageCount, timeSpentInChatMs
) {
  return _post('/db/scenario2-round', {
    participant_id:        participantId,
    scenario_id:           'scenario2',
    round_number:          roundNumber,
    allocation_cash:       allocation.cash,
    allocation_bonds:      allocation.bonds,
    allocation_balanced:   allocation.balancedFund,
    allocation_stocks:     allocation.stocks,
    confidence,
    trust_rating:          trustRating,
    control,
    compliance,
    disposition,
    ai_recommendation:     aiRecommendation ?? null,
    chat_query_count:      chatQueryCount      ?? 0,
    chat_message_count:    chatMessageCount    ?? 0,
    time_spent_in_chat_ms: timeSpentInChatMs   ?? 0,
  });
}

async function insertScenario2PostMeasures(participantId, measures) {
  return _post('/db/scenario2-post-measures', {
    participant_id:     participantId,
    scenario_id:        'scenario2',
    influence:          measures.influence,
    trust_scenario2:    measures.trust_scenario2,
    manipulation_check: measures.manipulation_check,
  });
}

async function insertChatLog(participantId, scenarioId, roundNumber, role, message) {
  return _post('/db/chat-log', {
    participant_id: participantId,
    scenario_id:    scenarioId,
    round_number:   roundNumber,
    role,
    message,
  });
}

async function insertPreferenceLog(participantId, scenarioId, preferenceValue) {
  return _post('/db/preference-log', {
    participant_id:   participantId,
    scenario_id:      scenarioId,
    preference_value: preferenceValue,
  });
}

async function insertPostsurvey(participantId, responses) {
  return _post('/db/postsurvey', { participant_id: participantId, responses });
}

async function insertDecisionEvent(payload) {
  return _post('/db/decision-event', payload);
}

// eventType: 'scenario_enter' | 'stimulus_rendered' | 'round_started' |
//            'round_completed' | 'scenario_completed' | 'study_completed' | 'abandonment'
async function insertStudyEvent(participantId, scenarioId, eventType, condition, roundNumber) {
  return _post('/db/study-event', {
    participant_id: participantId,
    scenario_id:    scenarioId    ?? null,
    event_type:     eventType,
    condition:      condition     ?? null,
    round_number:   roundNumber   ?? null,
  });
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
  insertStudyEvent,
};
