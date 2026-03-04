'use strict';

const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const scenarios = require('./scenarios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Routes
app.get('/', (req, res) => {
  res.send('AI Finance Experiment Backend');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Here, you can include dynamic system prompts logic
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });
    res.json(completion.data.choices[0].message);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
