# AI Finance Experiment

Backend for AI Financial Assistant Academic Experiment.

This repository hosts the Express.js backend for an online unmoderated academic experiment involving two financial scenarios and two AI tone conditions (low vs. high anthropomorphism).

## Setup

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