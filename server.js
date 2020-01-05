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

// Socket events
const handleEvents = require("./socket/socket-events");

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
        res.status(200).json(body);
    } else {
        // TODO: implement this
        console.log(response);
        res.send("An error occurred");
    }

});

// Return the user's playlists
app.get("/playlists", async (req, res) => {
    console.log("Finding user playlists");

    // Request a list of user playlists from Spotify
    const accessToken = req.session.accessToken;
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/playlists?limit=50",
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        json: true,
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.get(reqOptions);
    } catch (err) {
        // TODO: implement
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 200:
            // Send data to client
            res.status(200).json(body);
            break;
        default:
            // TODO: Implement
            console.log(response.statusCode);
            console.log(body);
            res.status(response.statusCode).json(body);
    }
});

// Return the tracklist of a specified playlist
app.get("/playlist-tracks", async (req, res) => {
    if (!req.query.id) {
        res.status(400).json({
            msg: "Missing query parameter 'id'"
        });
        return;
    }

    console.log("Retrieving playlist track list");
    const accessToken = req.session.accessToken;
    const reqOptions = {
        uri: `https://api.spotify.com/v1/playlists/${req.query.id}/tracks`,
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        json: true,
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.get(reqOptions);
    } catch (err) {
        // TODO: implement
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 200:
            // Send data to client
            res.status(200).json(body);
            break;
        default:
            // 403 - Forbidden (not authorized)
            // TODO: Implement
            console.log(response.statusCode);
            console.log(body);
            res.status(response.statusCode).json(body);
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

// Setup socket events
io.on("connect", socket => handleEvents(socket));

// Start server
server.listen(config.PORT, () => console.log(`Listening on Port ${config.PORT}...`));