// Modules
const express = require("express");

// Constants
const PORT = 3000;

// Initialize express app
const app = express();

app.get("/", (req, res) => {
    res.send("<h1>Foo world</h1>");
});

// Start server
app.listen(PORT);
console.log(`Listening on Port ${PORT}...`);