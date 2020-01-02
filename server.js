// Modules
const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const expressSession = require("express-session");
const sharedSession = require("express-socket.io-session");
const request = require("request-promise-native");
const path = require("path");

// Routers
const loginRouter = require("./routes/login-router");
const playbackRouter = require("./routes/playback-router");

// Other
const config = require("./config");

// Constants
const BUILD_PATH = "client/build";
const SESSION_LENGTH = 3600 * 1000 * 1;  // 1 hour

// Initialize express app and server
const app = express();
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, BUILD_PATH)));  // Set static folder

// Set up session
const session = expressSession({
    secret: "some-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: SESSION_LENGTH
    }
});
app.use(session);

// Mount routers
app.use("/login", loginRouter);
app.use("/playback", playbackRouter);

app.get("/search", (req, res, next) => {
    const query = req.query;
    if (!query.search) {
        res.status(400).send("Error 400: No search field specified.");
    } else {
        next();
    }
});

app.get("/search", async (req, res) => {
    // TODO: verify that user is logged in
    const search = req.query.search;

    const reqOptions = {
        uri: "https://api.spotify.com/v1/search",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        qs: {
            q: search,
            type: "track,artist"
        },
        json: true,
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.get(reqOptions);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error 500: an error occurred");
        return;
    }

    if (response.statusCode === 200) {
        const body = response.body;
        res.json(body);
    } else {
        // TODO: implement this
        console.log(response);
        res.send("An error occurred");
    }

});

// Serve react app on all other non-specified routes
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, BUILD_PATH, "index.html"));
});

// Setup socket.io
const io = socketIo(server);

// Share session data with sockets
io.use(sharedSession(session, {
    autoSave: true
}));

// Start server
server.listen(config.PORT, () => console.log(`Listening on Port ${config.PORT}...`));