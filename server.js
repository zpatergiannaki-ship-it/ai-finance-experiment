// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { OpenAIApi, Configuration } = require('openai');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Request validation middleware
function validateRequest(req, res, next) {
  const { scenario, userInput } = req.body;
  if (!scenario || !userInput) {
    return res.status(400).json({ error: 'Scenario and user input are required.' });
  }
  next();
}

// Scenario engine
function getScenarioResponse(scenario) {
  // Define scenarios based on user input
  const scenarios = {
    greeting: 'Hello! How can I assist you today?',
    finance: 'What financial questions do you have?',
    // Add more scenarios as needed
  };
  return scenarios[scenario] || 'I am not sure how to help with that.';
}

// Chatbot logic
app.post('/chat', validateRequest, async (req, res) => {
  const { scenario, userInput } = req.body;
  const scenarioResponse = getScenarioResponse(scenario);
  let chatbotResponse;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${scenarioResponse} ${userInput}`,
      max_tokens: 150,
    });
    chatbotResponse = response.data.choices[0].text.trim();
  } catch (error) {
    // Fallback mode if OpenAI API fails
    chatbotResponse = 'I am currently having trouble connecting to our service. Can you please rephrase your question?';
  }

  res.json({ response: chatbotResponse });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});