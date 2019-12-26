// Modules
const express = require("express");
const path = require("path");
const config = require("./config");

// Constants
const BUILD_PATH = "client/build";

// Initialize express app
const app = express();
app.use(express.static(path.join(__dirname, BUILD_PATH)));

// Serve react app
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, BUILD_PATH,"index.html"));
});

// Start server
app.listen(PORT);
console.log(`Listening on Port ${config.PORT}...`);