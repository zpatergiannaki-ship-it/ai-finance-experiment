// Import necessary packages
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware for logging method and path
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Verbose logging middleware after app creation
app.use((req, res, next) => {
    console.log('Received request:', { method: req.method, path: req.path, headers: req.headers });
    next();
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Your existing routes and middleware here...

// Detailed logging in the POST /chat endpoint
app.post('/chat', (req, res) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Request Body:', req.body);
    // Existing /chat functionality
    res.send('Chat response');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
