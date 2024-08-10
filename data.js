const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Enable All CORS Requests
app.use(cors());

// Serve the JSON file
app.get('/data.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.json'));
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
