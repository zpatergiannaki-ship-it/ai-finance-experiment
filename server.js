const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.use(bodyParser.json());

app.post('/api/message', async (req, res) => {
    const { message, condition, participantDetails } = req.body;

    // Validate message field
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid message field.' });
    }

    // Select system prompt based on condition
    let systemPrompt;
    if (condition === 'LOW') {
        systemPrompt = 'You are a helpful assistant with limited personality.';
    } else if (condition === 'HIGH') {
        systemPrompt = 'You are a friendly and engaging assistant.';
    } else {
        return res.status(400).json({ error: 'Invalid condition. Use LOW or HIGH.' });
    }

    console.log(`Participant Details: ${JSON.stringify(participantDetails)}`);

    // Call OpenAI GPT-4o-Mini model
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }]
        });

        // Log and return the reply
        const reply = response.choices[0].message.content;
        return res.json({ reply });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
