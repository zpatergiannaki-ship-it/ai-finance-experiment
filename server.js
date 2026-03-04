const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/chat', async (req, res) => {
    const { participantId, scenarioId, round, message } = req.body;

    console.log(`Participant ID: ${participantId}, Scenario ID: ${scenarioId}, Round: ${round}`);

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: message }],
            system: 'You are an AI financial assistant used in an academic experiment. Use only the provided scenario information and do not add external financial advice.'
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const assistantResponse = response.data.choices[0].message.content;
        res.json({ response: assistantResponse });

    } catch (error) {
        console.error('Error communicating with OpenAI API:', error);
        res.status(500).json({ error: 'Failed to get response from AI assistant.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});