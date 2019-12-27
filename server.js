// Modules
const express = require("express");
const session = require("express-session");
const path = require("path");
const config = require("./config");

// Constants
const BUILD_PATH = "client/build";
const SESSION_LENGTH = 3600 * 1000 * 1;  // 1 hour

// Initialize express app
const app = express();
app.use(express.static(path.join(__dirname, BUILD_PATH)));  // Set static folder
app.use(session({  // Setup session data
    secret: "some-secret",
    cookie: {
        maxAge: SESSION_LENGTH
    }
}));

// Serve react app on al other non-specified routes
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, BUILD_PATH, "index.html"));
});

// Start server
app.listen(config.PORT);
console.log(`Listening on Port ${config.PORT}...`);