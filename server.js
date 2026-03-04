const express = require('express');  // Assuming express is already installed
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // Middleware to parse JSON request bodies

// Middleware for logging method and path of each request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// POST /chat endpoint with logging
app.post('/chat', (req, res) => {
    console.log('Content-Type:', req.headers['content-type']); // Log Content-Type header
    console.log('Request Body:', req.body); // Log full request body

    // ... existing functionality for handling chat ...
    const response = { message: 'Chat response' }; // Example response
    res.json(response);
});

// ... any other existing routes and functionalities ...

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});