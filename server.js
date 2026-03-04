const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const { participantId, scenarioId, condition, round, message } = req.body;

  // Validate required field
  if (!message) {
    return res.status(400).json({ error: 'Missing required field: message' });
  }

  console.log(`Participant ID: ${participantId}, Scenario ID: ${scenarioId}, Condition: ${condition}, Round: ${round}`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a financial assistant used in an academic experiment. Your role is to provide helpful financial information and analysis based on the scenarios presented. Maintain professional and objective responses.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error('Full error details from OpenAI API:');
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error type:', error.type);
    console.error('Full error object:', error);
    
    res.status(500).json({ error: 'Failed to get response from AI assistant.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});