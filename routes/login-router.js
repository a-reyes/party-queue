/**
 * Login router module
 * 
 * Handles routes related to user authentication with the app itself, as well as the 
 * Spotify API.
 * @module routes/login-router
 * @author Alex Reyes
 */


const express = require("express");
const request = require("request-promise-native");
const querystring = require("querystring");
const config = require("../config");


const router = express.Router();


/**
 * Route set up to initiate Spotify authentication.
 * 
 * Requests to this route will redirect the user out of the application, for third-party
 * authentication on the Spotify website.
 */
router.get("/", (req, res) => {
    // TODO: implement dynamic state
    const STATE = "to-be-implemented";

    // Set user session state parameter
    req.session.state = STATE;

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

    res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});


/**
 * Route to handle redirection after Spotify login
 * 
 * Spotify will redirect users to this route after authentication. This route then
 * requests the user's authentication keys to give them access to the app's features.
 */
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


/**
 * Route to determine if a user has been authenticated.
 * 
 * Responses:
 *      200: JSON response with attributes:
 *              - isLoggedIn {boolean}:  true if the user has been authenticated with Spotify
 *              - isAdmin {boolean}:    true if the user is the admin of their playlist room
 */
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