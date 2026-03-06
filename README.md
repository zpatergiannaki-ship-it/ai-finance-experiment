# AI Finance Experiment

Full-stack research experiment: an Express.js backend deployed on Render and a plain HTML/CSS/JS frontend hosted on GitHub Pages.

This repository hosts both the **Express.js backend** and the **static frontend** for an online unmoderated academic experiment involving two financial scenarios and two AI tone conditions (low vs. high anthropomorphism).

---

## Frontend Setup (GitHub Pages)

### 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier is sufficient).
2. Click **New project**, fill in a name and database password, then click **Create new project**.

### 2. Run the database schema

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**, paste the contents of [`supabase_schema.sql`](./supabase_schema.sql), and click **Run**.
3. All tables, RLS policies, and the helper view will be created automatically.

### 3. Get your Supabase credentials

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** (e.g. `https://abcdefgh.supabase.co`).
3. Copy the **anon / public** key (starts with `eyJ…`). **Never use the service_role key in frontend code.**

### 4. Configure the frontend

The Supabase credentials are no longer needed in the frontend. All database writes are proxied through the Render backend.

Add the following environment variables to your Render service (Dashboard → Environment):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase Project URL (e.g. `https://abcdefgh.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Your **service role** key (from Supabase → Project Settings → API → service_role). **Never expose this in frontend code.** |

The backend URL in `assets/app.js` is already configured:
```js
const BACKEND_URL = 'https://ai-finance-experiment.onrender.com';
```

### 5. Enable GitHub Pages

1. In your GitHub repository, go to **Settings → Pages**.
2. Under **Source**, select **Deploy from a branch**.
3. Choose branch: `main`, folder: `/ (root)`, then click **Save**.
4. After a minute your site will be live at `https://YOUR_USERNAME.github.io/REPO_NAME/`.

### 6. Test locally

```bash
# Option 1 — VS Code Live Server extension (recommended)
# Right-click index.html → Open with Live Server

# Option 2 — Python
python -m http.server 8080
# Then open http://localhost:8080
```

### 7. Deploy

Push to `main` — GitHub Pages will automatically redeploy within ~1 minute.

---

## Exporting Data from Supabase

### Option A — Table Editor (GUI)

1. Open **Table Editor** in the Supabase dashboard.
2. Select a table (e.g. `participants`).
3. Click **Export → CSV**.

### Option B — SQL Editor (recommended for analysis)

Use the pre-built view for a single joined export:

```sql
SELECT * FROM experiment_summary;
```

Or export individual tables with a custom join:

```sql
SELECT
  p.participant_id,
  p.condition,
  p.created_at,
  s1.choice          AS scenario1_choice,
  s2.round_number,
  s2.allocation,
  s2.confidence,
  s2.trust_rating,
  post.responses
FROM participants p
LEFT JOIN scenario1_decision   s1   ON s1.participant_id = p.participant_id
LEFT JOIN scenario2_rounds     s2   ON s2.participant_id = p.participant_id
LEFT JOIN postsurvey_responses post ON post.participant_id = p.participant_id
ORDER BY p.created_at, s2.round_number;
```

---

## Repo Structure

```
index.html                   ← Entry point / router
pages/
  intro.html                 ← Step 1/6: Introduction + Consent
  presurvey.html             ← Step 2/6: Pre-Survey
  scenario1.html             ← Step 3/6: Financing Choice
  scenario2.html             ← Step 4/6: Investment Simulation (4 rounds)
  postsurvey.html            ← Step 5/6: Post-Survey
  complete.html              ← Step 6/6: Completion + debriefing
assets/
  style.css                  ← Responsive styles
  app.js                     ← Shared utilities (participantId, condition, navigation)
  supabase-client.js         ← Fetch-based insert helpers (proxies to backend)
  chat.js                    ← Chat widget logic
supabase_schema.sql          ← Database schema + RLS policies
server.js                    ← Express backend (deployed on Render)
scenarios.js                 ← Scenario data for the backend
```

---

## Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variable**:
   ```bash
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

The server will be available at `http://localhost:3000`.

## API Documentation

### GET /

Returns service status.

**Response:**
```json
{ "status": "ok", "service": "ai-finance-experiment" }
```

---

### GET /health

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

---

### POST /chat

Send a participant message to the AI assistant for a given scenario and condition.

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| `participantId` | string | Yes | Unique participant identifier |
| `scenarioId` | string | Yes | `"scenario1"` or `"scenario2"` |
| `condition` | string | Yes | `"lowAnthropomorphism"` or `"highAnthropomorphism"` |
| `message` | string | Yes | The participant's message/question |
| `roundNumber` | number | Required for scenario2 | Round number: `1`, `2`, `3`, or `4` |

**Success response (HTTP 200):**
```json
{ "reply": "<AI assistant message>" }
```

**Validation error response (HTTP 400):**
```json
{ "error": "...", "details": "..." }
```

Validation errors are returned for:
- Missing `participantId`
- Missing or invalid `scenarioId` (must be `"scenario1"` or `"scenario2"`)
- Missing or invalid `condition` (must be `"lowAnthropomorphism"` or `"highAnthropomorphism"`)
- Missing or empty `message`
- Missing or invalid `roundNumber` when `scenarioId` is `"scenario2"` (must be a number in `[1, 2, 3, 4]`)

**Server error response (HTTP 500):**
```json
{ "error": "Failed to get AI response." }
```

---

## Test Curl Commands

**Test GET /health:**
```bash
curl https://your-render-url.onrender.com/health
```

**Test scenario1 (lowAnthropomorphism):**
```bash
curl -X POST https://your-render-url.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test-001",
    "scenarioId": "scenario1",
    "condition": "lowAnthropomorphism",
    "message": "Which option has the lower interest rate?"
  }'
```

**Test scenario1 (highAnthropomorphism):**
```bash
curl -X POST https://your-render-url.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test-002",
    "scenarioId": "scenario1",
    "condition": "highAnthropomorphism",
    "message": "Which option has the lower interest rate?"
  }'
```

**Test scenario2 round 1:**
```bash
curl -X POST https://your-render-url.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test-003",
    "scenarioId": "scenario2",
    "condition": "lowAnthropomorphism",
    "roundNumber": 1,
    "message": "Why did you recommend 30% in stocks?"
  }'
```

**Test scenario2 round 3:**
```bash
curl -X POST https://your-render-url.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test-004",
    "scenarioId": "scenario2",
    "condition": "highAnthropomorphism",
    "roundNumber": 3,
    "message": "Do you think this allocation is optimal?"
  }'
```

**Test validation (missing condition — should return 400):**
```bash
curl -X POST https://your-render-url.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "test-005",
    "scenarioId": "scenario1",
    "message": "Hello"
  }'
```