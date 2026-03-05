'use strict';

const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const scenarios = require('./scenarios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ai-finance-experiment' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const VALID_SCENARIOS = ['scenario1', 'scenario2'];
const VALID_CONDITIONS = ['lowAnthropomorphism', 'highAnthropomorphism'];
const VALID_ROUNDS = [1, 2, 3, 4];

app.post('/chat', async (req, res) => {
  const { participantId, scenarioId, condition, message, roundNumber } = req.body;

  // Validation
  if (!participantId) {
    return res.status(400).json({ error: 'Missing required field.', details: 'participantId is required.' });
  }
  if (!scenarioId || !VALID_SCENARIOS.includes(scenarioId)) {
    return res.status(400).json({ error: 'Invalid or missing field.', details: 'scenarioId must be "scenario1" or "scenario2".' });
  }
  if (!condition || !VALID_CONDITIONS.includes(condition)) {
    return res.status(400).json({ error: 'Invalid or missing field.', details: 'condition must be "lowAnthropomorphism" or "highAnthropomorphism".' });
  }
  if (!message || message === '') {
    return res.status(400).json({ error: 'Missing required field.', details: 'message is required and must not be empty.' });
  }
  if (scenarioId === 'scenario2') {
    if (roundNumber === undefined || roundNumber === null || typeof roundNumber !== 'number' || !VALID_ROUNDS.includes(roundNumber)) {
      return res.status(400).json({ error: 'Invalid or missing field.', details: 'roundNumber must be a number in [1, 2, 3, 4] when scenarioId is "scenario2".' });
    }
  }

  // Logging
  const roundLog = scenarioId === 'scenario2' ? roundNumber : 'N/A';
  console.log(`[CHAT] participantId=${participantId} scenarioId=${scenarioId} condition=${condition} roundNumber=${roundLog}`);

  // System prompt construction
  let systemPrompt = '';

  if (scenarioId === 'scenario1') {
    const { options } = scenarios.scenario1;
    const cc = options.creditCard;
    const pl = options.personalLoan;
    systemPrompt =
      'You are a financial assistant helping a participant choose between two financing options for a €3,000 home repair.\n\n' +
      'Option 1 — Credit Card:\n' +
      `  - Credit limit: €${cc.limit}\n` +
      `  - APR: ${cc.apr}%\n` +
      `  - Repayment: ${cc.repayment}\n` +
      `  - Minimum monthly payment: ${cc.minimumMonthlyPayment}\n` +
      `  - Fixed schedule: ${cc.fixedSchedule}\n\n` +
      'Option 2 — Personal Loan:\n' +
      `  - Amount: €${pl.amount}\n` +
      `  - APR: ${pl.apr}%\n` +
      `  - Term: ${pl.termMonths} months\n` +
      `  - Monthly installment: €${pl.monthlyInstallment}\n` +
      `  - Fixed schedule: ${pl.fixedSchedule}\n\n` +
      'Recommendation: Personal Loan.\n\n' +
      'Do not invent fees, extra products, eligibility rules, or anything not provided in these facts. Base every answer strictly on the provided details only.';
  } else {
    const round = scenarios.scenario2.rounds[roundNumber - 1];
    const mp = round.marketPerformance;
    const ra = round.recommendedAllocation;
    systemPrompt =
      `You are a financial assistant supporting a participant in an investment simulation. This is round ${round.roundNumber}.\n\n` +
      'Market performance this round (% return):\n' +
      `  - Cash: ${mp.cash}%\n` +
      `  - Bonds: ${mp.bonds}%\n` +
      `  - Balanced Fund: ${mp.balancedFund}%\n` +
      `  - Stocks: ${mp.stocks}%\n\n` +
      'Recommended allocation for this round (% of portfolio):\n' +
      `  - Cash: ${ra.cash}%\n` +
      `  - Bonds: ${ra.bonds}%\n` +
      `  - Balanced Fund: ${ra.balancedFund}%\n` +
      `  - Stocks: ${ra.stocks}%\n\n` +
      'Your role is to help the participant understand this round\'s market performance and the recommended allocation. Do not reveal whether the AI recommendation is correct or incorrect. Do not invent any data.\n\n' +
      'Do not invent fees, extra products, eligibility rules, or anything not provided in these facts. Base every answer strictly on the provided details only.';
  }

  // Tone instruction
  if (condition === 'lowAnthropomorphism') {
    systemPrompt += '\n\nYou are a data retrieval tool. Output factual information only. Do not use first-person pronouns. Do not express empathy, personality, or opinion. Do not use conversational language. Avoid filler words. Structure responses as direct, concise statements. Do not greet the user. Do not use encouraging language.';
  } else {
    systemPrompt += '\n\nRespond like a warm, caring, and empathetic financial friend. Use first-person pronouns (e.g. "I think", "I\'d suggest"). Show genuine interest in helping the participant. Acknowledge their situation with empathy. Use friendly, conversational language — avoid sounding clinical or robotic. You may express mild enthusiasm or reassurance where appropriate.';
  }

  // Formatting instruction (applied identically across all conditions)
  systemPrompt += '\n\nResponse format instructions (apply regardless of tone):\n' +
    'Structure every response as follows:\n' +
    '1. Begin with one short introductory sentence.\n' +
    '2. Present key points, reasons, or comparisons as a numbered list (e.g. 1. ... 2. ... 3. ...).\n' +
    '   Use bullet points (- ...) for sub-details where appropriate.\n' +
    '3. End with one optional short concluding sentence if relevant.\n\n' +
    'Keep the total response under 200 words.\n' +
    'Do not use emojis, graphs, images, or any visual elements.\n' +
    'Do not introduce any information not present in the facts provided above.';

  // OpenAI call
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 250,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('[CHAT ERROR]', error.message);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
