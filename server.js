const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// System prompt for LOW anthropomorphism condition
const LOW_ANTHROPOMORPHISM_PROMPT = `You are an AI financial assistant participating in an academic research experiment.

Instructions:
- Maintain a neutral, analytical tone
- No emotional language
- No first-person statements
- Focus on financial facts and cost comparisons
- Keep responses concise (maximum ~120 words)
- Use only information provided in the scenario
- Do not invent financial details
- Focus on explaining financial trade-offs clearly
- Participants make decisions based only on the scenario shown to them

Provide clear, factual financial analysis without any warm or conversational language.`;

// System prompt for HIGH anthropomorphism condition
const HIGH_ANTHROPOMORPHISM_PROMPT = `You are an AI financial assistant participating in an academic research experiment.

Instructions:
- Maintain a warm, conversational tone
- You may use first-person language like "I recommend"
- Acknowledge the user's situation
- Provide supportive guidance
- Keep responses concise (maximum ~120 words)
- Use only information provided in the scenario
- Do not invent financial details
- Focus on explaining financial trade-offs clearly
- Participants make decisions based only on the scenario shown to them

Provide thoughtful, personalized guidance while maintaining clarity about financial trade-offs.`;

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'AI finance experiment backend running' });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    const { participantId, scenarioId, condition, round, message } = req.body;

    // Validate that message exists
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    // Log experiment details
    console.log(`Participant ID: ${participantId}`);
    console.log(`Scenario ID: ${scenarioId}`);
    console.log(`Condition: ${condition}`);
    console.log(`Round: ${round}`);

    // Select system prompt based on condition
    const systemPrompt = condition === 'high' 
        ? HIGH_ANTHROPOMORPHISM_PROMPT 
        : LOW_ANTHROPOMORPHISM_PROMPT;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('Error communicating with OpenAI API:', error);
        res.status(500).json({ error: 'Failed to get response from AI assistant.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});