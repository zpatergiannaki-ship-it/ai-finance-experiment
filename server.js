const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: 'YOUR_API_KEY' });

app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
    const { message, anthropomorphism } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Invalid message' });
    }

    // Select system prompt based on anthropomorphism
    const systemPrompt = anthropomorphism === 'high' 
        ? 'You are a friendly and relatable assistant.' 
        : 'You are a precise and professional assistant.';

    // Log required fields
    console.log('Message:', message);
    console.log('Anthropomorphism Level:', anthropomorphism);

    // Call OpenAI gpt-4o-mini
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: message }],
            system: systemPrompt
        });

        const assistantReply = response.choices[0].message.content;
        return res.json({ reply: assistantReply });
    } catch (error) {
        console.error('OpenAI Error:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
