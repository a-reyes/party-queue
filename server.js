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

// TODO: Alter this once testing multiple connections
const updateSong = async socket => {
    console.log(`${socket.id} is sending out new song info.`);
    const userSession = socket.handshake.session;
    if (!userSession.isLoggedIn) {
        // User isn't logged in
        socket.emit("not-authorized", {
            msg: "Please connect your Spotify acount first."
        });
        return;
    }

    // Request track info from Spotify
    const accessToken = userSession.accessToken;
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/currently-playing",
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
        console.log(err);
        socket.emit("server-error", {
            msg: err.toString() // TODO: Remove
        });
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 200:
            // Send data to client
            socket.emit("current-track", body);
            break;
        case 204:
            // No track is currently playing
            // TODO: Implement
            console.log(body);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
    }

};

// Setup socket events
io.on("connect", socket => {
    console.log("A user connected");

    socket.on("current-track", () => updateSong(socket));

    socket.on("previous-track", async () => {
        console.log("Getting previous track...");

        const userSession = socket.handshake.session;
        const reqOptions = {
            uri: "https://api.spotify.com/v1/me/player/previous",
            headers: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            resolveWithFullResponse: true
        };

        try {
            response = await request.post(reqOptions);
        } catch (err) {
            console.log(err);
            socket.emit("server-error", {
                msg: err.toString() // TODO: Remove
            });
            return;
        }

        const body = response.body;
        switch (response.statusCode) {
            case 204:
                console.log("Previous song played successfully...");
                // Update clients with new track info
                updateSong(socket);
                break;
            default:
                // TODO: Implement 404 (no devices) or 403 (not premium)
                console.log(response.statusCode);
                console.log(body);
        }
    });

    socket.on("next-track", async () => {
        console.log("Getting next track...");

        const userSession = socket.handshake.session;
        const reqOptions = {
            uri: "https://api.spotify.com/v1/me/player/next",
            headers: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            resolveWithFullResponse: true
        };

        try {
            response = await request.post(reqOptions);
        } catch (err) {
            console.log(err);
            socket.emit("server-error", {
                msg: err.toString() // TODO: Remove
            });
            return;
        }

        const body = response.body;
        switch (response.statusCode) {
            case 204:
                console.log("Next song played successfully...");
                // Update clients with new track info
                updateSong(socket);
                break;
            default:
                // TODO: Implement 404 (no devices) or 403 (not premium)
                console.log(response.statusCode);
                console.log(body);
        }
    });

    socket.on("pause-playback", async () => {
        // TODO: Check if song already paused
        console.log("Pausing playback...");

        const userSession = socket.handshake.session;
        const reqOptions = {
            uri: "https://api.spotify.com/v1/me/player/pause",
            headers: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            resolveWithFullResponse: true
        };

        try {
            response = await request.put(reqOptions);
        } catch (err) {
            console.log(err);
            socket.emit("server-error", {
                msg: err.toString() // TODO: Remove
            });
            return;
        }

        const body = response.body;
        switch (response.statusCode) {
            case 204:
                console.log("Song paused successfully...");
                // Send a success message to client?
                break;
            default:
                // TODO: Implement 404 (no devices) or 403 (not premium)
                console.log(response.statusCode);
                console.log(body);
        }
    });

    socket.on("resume-playback", async () => {
        // TODO: Check if song already playing
        console.log("Resuming playback...");

        const userSession = socket.handshake.session;
        const reqOptions = {
            uri: "https://api.spotify.com/v1/me/player/play",
            headers: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            resolveWithFullResponse: true
        };

        try {
            response = await request.put(reqOptions);
        } catch (err) {
            console.log(err);
            socket.emit("server-error", {
                msg: err.toString() // TODO: Remove
            });
            return;
        }

        const body = response.body;
        switch (response.statusCode) {
            case 204:
                console.log("Song resumed successfully...");
                updateSong(socket);
                break;
            default:
                // TODO: Implement 404 (no devices) or 403 (not premium)
                console.log(response.statusCode);
                console.log(body);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected.");
    });

});

// Start server
server.listen(config.PORT, () => console.log(`Listening on Port ${config.PORT}...`));