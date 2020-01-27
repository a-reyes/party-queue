/**
 * Server module
 * 
 * Main file of the application's backend.
 * @module server
 * @author Alex Reyes
 */


const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const sharedSession = require("express-socket.io-session");
const MongoDBStore = require("connect-mongodb-session")(expressSession);
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
const ObjectId = mongoose.Types.ObjectId;

// Setup database
mongoose.connect("mongodb://localhost/party-queue", {useNewUrlParser: true});
const db = mongoose.connection;
const sessionStore = new MongoDBStore({
    uri: "mongodb://localhost:27017/party-queue-tokens",
    collection: "sessions"
});

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
    },
    store: sessionStore,
    rolling: true,
});
app.use(session);

// Mount routers
app.use("/login", loginRouter);
app.use("/playback", playbackRouter);


/**
 * Middleware function to validate search queries.
 * 
 * Responses:
 *      400: text response if the search field is empty.
 */
app.get("/search", (req, res, next) => {
    const query = req.query;
    if (!query.search) {
        res.status(400).send("Error 400: No search field specified.");
    } else {
        next();
    }
});


/**
 * Route to get song track results based on a passed query string
 * 
 * Responses:
 *      200: JSON response as recieved from the Spotify API.
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/search/search/">Spotify Documentation</a>
 *      
 *      500: text response if the Spotify request could not be completed
 */
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


/**
 * Route to get a data on a user's personal playlists
 * 
 * Responses:
 *      200: JSON response as recieved from the Spotify API.
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/playlists/get-a-list-of-current-users-playlists/">Spotify Documentation</a>
 *      
 *      500: text response if the Spotify request could not be completed
 */
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


/**
 * Route to get a data on the tracks in a user's playlist
 * 
 * Query parameters:
 *      id: the unique ID of a user's playlist
 * 
 * Responses:
 *      200: JSON response as recieved from the Spotify API.
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/">Spotify Documentation</a>
 * 
 *      400: JSON response if no id is included in the query. Has the attributes:
 *              - msg {string}: an error message
 *      
 *      500: text response if the Spotify request could not be completed
 */
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

/**
 * Catch-all to serve the react application in response to all other routes
 * 
 * Responses:
 *      200: the react application
 */
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
handleEvents(io);

// Connect to database
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    // Start server
    server.listen(config.PORT, () => console.log(`Listening on Port ${config.PORT}...`));
});
