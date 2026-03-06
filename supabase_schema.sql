-- ============================================================
-- AI Finance Experiment — Supabase Schema
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- participants
CREATE TABLE participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  TEXT NOT NULL UNIQUE,
  condition       TEXT NOT NULL CHECK (condition IN ('lowAnthropomorphism', 'highAnthropomorphism')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- consent
CREATE TABLE consent (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  consented      BOOLEAN NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- presurvey_responses
CREATE TABLE presurvey_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  responses      JSONB NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- scenario1_decision
CREATE TABLE scenario1_decision (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  choice         TEXT NOT NULL CHECK (choice IN ('credit_card', 'personal_loan', 'let_ai_decide')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- scenario2_rounds
CREATE TABLE scenario2_rounds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  round_number   INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  allocation     JSONB NOT NULL,
  confidence     INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 7),
  trust_rating   INTEGER NOT NULL CHECK (trust_rating BETWEEN 1 AND 7),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- chat_logs
CREATE TABLE chat_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  scenario_id    TEXT NOT NULL CHECK (scenario_id IN ('scenario1', 'scenario2')),
  round_number   INTEGER,
  role           TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message        TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- postsurvey_responses
CREATE TABLE postsurvey_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id TEXT NOT NULL,
  responses      JSONB NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE participants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent              ENABLE ROW LEVEL SECURITY;
ALTER TABLE presurvey_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario1_decision   ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario2_rounds     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE postsurvey_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: allow INSERT from anon, deny all other ops
-- ============================================================
CREATE POLICY "allow_anon_insert" ON participants
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON consent
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON presurvey_responses
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON scenario1_decision
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON scenario2_rounds
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON chat_logs
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_insert" ON postsurvey_responses
  FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- Helper view for analysis (service role / authenticated only)
-- ============================================================
CREATE VIEW experiment_summary AS
SELECT
  p.participant_id,
  p.condition,
  p.created_at                                                AS registered_at,
  c.consented,
  (pre.responses->>'age')::INTEGER                           AS age,
  pre.responses->>'gender'                                   AS gender,
  pre.responses->>'education'                                AS education,
  pre.responses->>'employment'                               AS employment,
  (pre.responses->>'fin_literacy')::INTEGER                  AS fin_literacy,
  (pre.responses->>'ai_experience')::INTEGER                 AS ai_experience,
  (pre.responses->>'tech_trust')::INTEGER                    AS tech_trust,
  s1.choice                                                  AS scenario1_choice,
  (post.responses->>'trust_ai_1')::INTEGER                   AS trust_ai_1,
  (post.responses->>'trust_ai_2')::INTEGER                   AS trust_ai_2,
  (post.responses->>'trust_ai_3')::INTEGER                   AS trust_ai_3,
  (post.responses->>'anthro_1')::INTEGER                     AS anthro_1,
  (post.responses->>'anthro_2')::INTEGER                     AS anthro_2,
  (post.responses->>'anthro_3')::INTEGER                     AS anthro_3,
  (post.responses->>'deleg_1')::INTEGER                      AS deleg_1,
  (post.responses->>'deleg_2')::INTEGER                      AS deleg_2,
  (post.responses->>'selfreg_1')::INTEGER                    AS selfreg_1,
  (post.responses->>'selfreg_2')::INTEGER                    AS selfreg_2,
  (post.responses->>'overall_1')::INTEGER                    AS overall_1,
  (post.responses->>'overall_2')::INTEGER                    AS overall_2
FROM participants p
LEFT JOIN consent              c    ON c.participant_id    = p.participant_id
LEFT JOIN presurvey_responses  pre  ON pre.participant_id  = p.participant_id
LEFT JOIN scenario1_decision   s1   ON s1.participant_id   = p.participant_id
LEFT JOIN postsurvey_responses post ON post.participant_id = p.participant_id;

-- ============================================================
-- Scenario 2 extensions: new columns on scenario2_rounds
-- ============================================================
ALTER TABLE scenario2_rounds
  ADD COLUMN control      INTEGER CHECK (control BETWEEN 1 AND 7),
  ADD COLUMN compliance   INTEGER CHECK (compliance BETWEEN 1 AND 7),
  ADD COLUMN disposition  TEXT CHECK (disposition IN ('sell', 'hold'));

-- ============================================================
-- Decision events: silent behavioral log (one row per decision)
-- ============================================================
CREATE TABLE IF NOT EXISTS decision_events (
  id              BIGSERIAL PRIMARY KEY,
  participant_id  TEXT        NOT NULL,
  scenario_id     TEXT        NOT NULL,  -- 'scenario1' | 'scenario2'
  round_number    INT,                   -- NULL for scenario1
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- AI recommendation
  ai_recommendation         JSONB,  -- e.g. { cash:10, bonds:20, balancedFund:40, stocks:30 } or 'personal_loan'

  -- User decision
  user_decision             JSONB,  -- same shape as ai_recommendation

  -- Scenario 1 acceptance (boolean)
  recommendation_accepted   BOOLEAN,

  -- Scenario 2 allocation fields (flat columns for easy SQL analysis)
  allocation_cash           INT,
  allocation_bonds          INT,
  allocation_balanced       INT,
  allocation_stocks         INT,
  total_allocation_check    INT,   -- must equal 100

  -- Deviation / override
  allocation_deviation      INT,   -- sum of |user - rec| per asset (scenario2 only)
  recommendation_override_level TEXT, -- 'none' | 'minor' | 'moderate' | 'major'

  -- Follow score (scenario2 only)
  recommendation_follow_score NUMERIC(5,2),  -- 0–100

  -- Chat / information seeking
  chat_query_count          INT,
  total_messages            INT,
  time_spent_in_chat_ms     INT,
  information_seeking       BOOLEAN,

  -- Timing
  decision_time_ms          INT    -- ms from scenario/round render to submit
);

ALTER TABLE decision_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_decision_events" ON decision_events
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Scenario 2 post-scenario measures table
-- ============================================================
CREATE TABLE scenario2_post_measures (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id     TEXT NOT NULL,
  influence          INTEGER NOT NULL CHECK (influence BETWEEN 1 AND 7),
  trust_scenario2    INTEGER NOT NULL CHECK (trust_scenario2 BETWEEN 1 AND 7),
  manipulation_check INTEGER NOT NULL CHECK (manipulation_check BETWEEN 1 AND 7),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE scenario2_post_measures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert" ON scenario2_post_measures
  FOR INSERT TO anon WITH CHECK (true);
