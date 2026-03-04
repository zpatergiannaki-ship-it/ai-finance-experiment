// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// LOW and HIGH anthropomorphism prompts
const lowAnthropomorphismPrompt = 'You are a basic chat interface.';
const highAnthropomorphismPrompt = 'You are a friendly and empathetic chat assistant.';

// Endpoint for chat
app.post('/chat', (req, res) => {
    const { participantId, scenarioId, condition, round, message } = req.body;

    // Validate fields
    if (!participantId || !scenarioId || !condition || !round || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log(`Received message from Participant: ${participantId}, Scenario: ${scenarioId}, Condition: ${condition}, Round: ${round}`);
    console.log(`Message: ${message}`);

    // Process the message based on the condition
    let responseMessage;
    if (condition === 'LOW') {
        responseMessage = lowAnthropomorphismPrompt + ' ' + message;
    } else if (condition === 'HIGH') {
        responseMessage = highAnthropomorphismPrompt + ' ' + message;
    } else {
        return res.status(400).json({ error: 'Invalid condition.' });
    }

    res.json({ response: responseMessage });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Full experiment instructions go here.