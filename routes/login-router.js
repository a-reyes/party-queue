
const express = require("express");
const request = require("request-promise-native");
const querystring = require("querystring");
const config = require("../config");

// Initialize router
const router = express.Router();

// Routes

// Allow the user to authorize their spotify account
router.get("/", (req, res) => {
    // TODO: implement dynamic state
    const STATE = "to-be-implemented";

    // Set user session state parameter
    req.session.state = STATE;

    // Build query string
    const query = querystring.encode({
        client_id: config.CLIENT_ID,
        response_type: "code",
        redirect_uri: config.REDIRECT_URI,
        state: STATE,
        scope: [
            "user-read-private",
            "user-read-email",
            "user-read-playback-state",
            "user-modify-playback-state",
            "playlist-read-private",
            "playlist-read-collaborative"
        ].join(" ") 
    });

    // Redirect to spotify
    res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});

// Redirect route after external spotify login
router.get("/callback", async (req, res) => {
    const { code, state, error } = req.query;
    const userState = req.session.state;

    if (!state || state !== userState) {
        res.send("Error: mismatching states");
    } else if (error) {
        res.send(`Error: ${error}`);
    } else {
        // Remove user state
        delete req.session.state;

        // Encode client ID and secret key to base 64
        const encodedStr = new Buffer(`${config.CLIENT_ID}:${config.CLIENT_SECRET}`).toString("base64");

        // Construct post data
        const authData = {
            uri: "https://accounts.spotify.com/api/token",
            form: {
                grant_type: "authorization_code",
                code: code,
                redirect_uri: config.REDIRECT_URI
            },
            headers: {
                Authorization: `Basic ${encodedStr}`
            },
            json: true,
            resolveWithFullResponse: true
        };

        // Send request
        let authRes;
        try {
            authRes = await request.post(authData);
        } catch (err) {
            // TODO: implement proper error handling
            console.log(err);
            res.send("Error: could not authenticate.");
            return;
        }

        if (authRes.statusCode === 200) {
            const body = authRes.body;
            const accessToken = body.access_token;
            const refreshToken = body.refresh_token;

            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshToken;
            req.session.isLoggedIn = true;

            res.redirect("/")

        } else {
            // TODO: handle alternate status codes
            console.log(authRes);
            res.send("Error: could not authenticate.");
        }
    }
});

// Route to determine if a user is already authenticated
router.get("/status", (req, res) => {
    let isLoggedIn;
    if (req.session.isLoggedIn) {
        isLoggedIn = true;
    } else {
        isLoggedIn = false;
    }

    res.status(200).json({
        isLoggedIn: isLoggedIn,
        isAdmin: req.session.isAdmin === true ? true : false
    });
});

module.exports = router;