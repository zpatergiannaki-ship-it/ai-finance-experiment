// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAIApi, Configuration } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Initialize OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'OK' });
});

// Chat route
app.post('/chat', async (req, res) => {
    const { prompt, scenarioType } = req.body;

    // Validate request body
    if (!prompt || !scenarioType) {
        return res.status(400).send({ error: 'Prompt and scenarioType are required.' });
    }

    const systemPrompt = generateSystemPrompt(scenarioType);
    
    try {
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
        });

        res.status(200).send({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error from OpenAI API:', error);
        res.status(500).send({ error: 'Error communicating with OpenAI API' });
    }
});

// Function to generate dynamic system prompts based on scenario type
function generateSystemPrompt(scenarioType) {
    switch(scenarioType) {
        case 'scenario1':
            return 'You are a financial advisor. Please assist with money management advice.';
        case 'scenario2':
            return 'You are an investment analyst. Provide insights into stock market trends.';
        default:
            return 'You are a helpful assistant.';
    }
}

// Main route
app.get('/', (req, res) => {
    res.send('Welcome to the AI Finance Experiment API!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
