'use strict';

// CONFIGURE THESE TWO VALUES:
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// Initialize Supabase client (loaded via CDN)
let _supabase = null;
function getClient() {
  if (!_supabase) {
    // supabase global is injected by the CDN script
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

async function insertParticipant(participantId, condition) {
  try {
    const { data, error } = await getClient()
      .from('participants')
      .insert([{ participant_id: participantId, condition }]);
    if (error) console.error('insertParticipant error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertParticipant exception:', err.message);
    return { error: err };
  }
}

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

// scenario1Decision: { choice, influence, trust, manipulation_check }
async function insertScenario1Decision(participantId, scenario1Decision) {
  try {
    const { data, error } = await getClient()
      .from('scenario1_decision')
      .insert([{
        participant_id: participantId,
        choice: scenario1Decision.choice,
        influence: scenario1Decision.influence,
        trust: scenario1Decision.trust,
        manipulation_check: scenario1Decision.manipulation_check,
      }]);
    if (error) console.error('insertScenario1Decision error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario1Decision exception:', err.message);
    return { error: err };
  }
}

async function insertScenario2Round(participantId, roundNumber, allocation, confidence, trustRating, control, compliance, disposition) {
  try {
    const { data, error } = await getClient()
      .from('scenario2_rounds')
      .insert([{
        participant_id: participantId,
        round_number: roundNumber,
        allocation,
        confidence,
        trust_rating: trustRating,
        control,
        compliance,
        disposition,
      }]);
    if (error) console.error('insertScenario2Round error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario2Round exception:', err.message);
    return { error: err };
  }
}

async function insertScenario2PostMeasures(participantId, measures) {
  try {
    const { data, error } = await getClient()
      .from('scenario2_post_measures')
      .insert([{
        participant_id: participantId,
        influence: measures.influence,
        trust_scenario2: measures.trust_scenario2,
        manipulation_check: measures.manipulation_check,
      }]);
    if (error) console.error('insertScenario2PostMeasures error:', error.message);
    return { data, error };
  } catch (err) {
    console.error('insertScenario2PostMeasures exception:', err.message);
    return { error: err };
  }
}

async function insertChatLog(participantId, scenarioId, roundNumber, role, message) {
  try {
    const { data, error } = await getClient()
      .from('chat_logs')
      .insert([{
        participant_id: participantId,
        scenario_id: scenarioId,
        round_number: roundNumber,
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

window.SupabaseUtils = {
  insertParticipant,
  insertConsent,
  insertPresurvey,
  insertScenario1Decision,
  insertScenario2Round,
  insertScenario2PostMeasures,
  insertChatLog,
  insertPostsurvey,
};
