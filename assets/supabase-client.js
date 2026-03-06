'use strict';

// CONFIGURE THESE TWO VALUES:
const SUPABASE_URL = 'https://yhtyrfpfkdspjrvxkxoo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ddeu9lf70BCXCp79_6y-cA_is98z9F1';

// Initialize Supabase client (loaded via CDN)
let _supabase = null;
function getClient() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ── participants ─────────────────────────────────────────────
async function insertParticipant(participantId, condition, scenarioOrder) {
  try {
    const { data, error } = await getClient()
      .from('participants')
      .insert([{
        participant_id: participantId,
        condition,
        scenario_order: Array.isArray(scenarioOrder)
          ? JSON.stringify(scenarioOrder)
          : scenarioOrder,
      }]);
    if (error) console.error('insertParticipant error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertParticipant exception:', err.message);
    return { error: err };
  }
}

// ── consent ──────────────────────────────────────────────────
async function insertConsent(participantId, consented) {
  try {
    const { data, error } = await getClient()
      .from('consent')
      .insert([{ participant_id: participantId, consented }]);
    if (error) console.error('insertConsent error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertConsent exception:', err.message);
    return { error: err };
  }
}

// ── presurvey_responses ──────────────────────────────────────
async function insertPresurvey(participantId, responses) {
  try {
    const { data, error } = await getClient()
      .from('presurvey_responses')
      .insert([{ participant_id: participantId, responses }]);
    if (error) console.error('insertPresurvey error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertPresurvey exception:', err.message);
    return { error: err };
  }
}

// ── scenario1_decision ───────────────────────────────────────
// scenario1Decision: {
//   choice, influence, trust, manipulation_check,
//   chat_query_count, chat_message_count, time_spent_in_chat_ms
// }
async function insertScenario1Decision(participantId, scenario1Decision) {
  try {
    const { data, error } = await getClient()
      .from('scenario1_decision')
      .insert([{
        participant_id:        participantId,
        scenario_id:           'scenario1',
        choice:                scenario1Decision.choice,
        influence:             scenario1Decision.influence,
        trust:                 scenario1Decision.trust,
        manipulation_check:    scenario1Decision.manipulation_check,
        chat_query_count:      scenario1Decision.chat_query_count      ?? 0,
        chat_message_count:    scenario1Decision.chat_message_count    ?? 0,
        time_spent_in_chat_ms: scenario1Decision.time_spent_in_chat_ms ?? 0,
      }]);
    if (error) console.error('insertScenario1Decision error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario1Decision exception:', err.message);
    return { error: err };
  }
}

// ── scenario2_rounds ─────────────────────────────────────────
// allocation: { cash, bonds, balancedFund, stocks }
async function insertScenario2Round(
  participantId, roundNumber, allocation,
  confidence, trustRating, control, compliance, disposition,
  aiRecommendation, chatQueryCount, chatMessageCount, timeSpentInChatMs
) {
  try {
    const { data, error } = await getClient()
      .from('scenario2_rounds')
      .insert([{
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
      }]);
    if (error) console.error('insertScenario2Round error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario2Round exception:', err.message);
    return { error: err };
  }
}

// ── scenario2_post_measures ──────────────────────────────────
async function insertScenario2PostMeasures(participantId, measures) {
  try {
    const { data, error } = await getClient()
      .from('scenario2_post_measures')
      .insert([{
        participant_id:     participantId,
        scenario_id:        'scenario2',
        influence:          measures.influence,
        trust_scenario2:    measures.trust_scenario2,
        manipulation_check: measures.manipulation_check,
      }]);
    if (error) console.error('insertScenario2PostMeasures error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario2PostMeasures exception:', err.message);
    return { error: err };
  }
}

// ── chat_logs ────────────────────────────────────────────────
async function insertChatLog(participantId, scenarioId, roundNumber, role, message) {
  try {
    const { data, error } = await getClient()
      .from('chat_logs')
      .insert([{
        participant_id: participantId,
        scenario_id:    scenarioId,
        round_number:   roundNumber,
        role,
        message,
      }]);
    if (error) console.error('insertChatLog error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertChatLog exception:', err.message);
    return { error: err };
  }
}

// ── preference_logs ──────────────────────────────────────────
// Preference selections go here — NOT in chat_logs
async function insertPreferenceLog(participantId, scenarioId, preferenceValue) {
  try {
    const { data, error } = await getClient()
      .from('preference_logs')
      .insert([{
        participant_id:   participantId,
        scenario_id:      scenarioId,
        preference_value: preferenceValue,
      }]);
    if (error) console.error('insertPreferenceLog error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertPreferenceLog exception:', err.message);
    return { error: err };
  }
}

// ── postsurvey_responses ─────────────────────────────────────
async function insertPostsurvey(participantId, responses) {
  try {
    const { data, error } = await getClient()
      .from('postsurvey_responses')
      .insert([{ participant_id: participantId, responses }]);
    if (error) console.error('insertPostsurvey error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertPostsurvey exception:', err.message);
    return { error: err };
  }
}

// ── decision_events ──────────────────────────────────────────
async function insertDecisionEvent(payload) {
  try {
    const { data, error } = await getClient()
      .from('decision_events')
      .insert([payload]);
    if (error) console.error('insertDecisionEvent error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertDecisionEvent exception:', err.message);
    return { error: err };
  }
}

// ── study_events ─────────────────────────────────────────────
// eventType: 'scenario_enter' | 'stimulus_rendered' | 'round_started' |
//            'round_completed' | 'scenario_completed' | 'study_completed' | 'abandonment'
async function insertStudyEvent(participantId, scenarioId, eventType, condition, roundNumber) {
  try {
    const { data, error } = await getClient()
      .from('study_events')
      .insert([{
        participant_id: participantId,
        scenario_id:    scenarioId    ?? null,
        event_type:     eventType,
        condition:      condition     ?? null,
        round_number:   roundNumber   ?? null,
      }]);
    if (error) console.error('insertStudyEvent error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertStudyEvent exception:', err.message);
    return { error: err };
  }
}

// ── Public API ───────────────────────────────────────────────
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
