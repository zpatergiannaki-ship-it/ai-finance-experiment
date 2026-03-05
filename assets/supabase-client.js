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
asyn...