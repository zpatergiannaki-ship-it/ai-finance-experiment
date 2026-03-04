'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`INCOMING: ${req.method} ${req.path}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.send('OK');
});

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the AI Finance Experiment!');
});

// Chat endpoint
app.post('/chat', (req, res) => {
    console.log(`Content-Type: ${req.headers['content-type']}`);
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
    // Handle chat logic here
    res.send({ reply: 'Your message has been received!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
