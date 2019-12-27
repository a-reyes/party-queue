// Modules
const express = require("express");
const session = require("express-session");
const request = require("request-promise-native");
const path = require("path");
const querystring = require("querystring");
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

// Allow the user to authorize their spotify account
app.get("/login", (req, res) => {
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
        scope: "user-read-private user-read-email"
    });

    // Redirect to spotify
    res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});

// Redirect route after external spotify login
app.get("/callback", (req, res) => {
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
        request.post(authData).then(response => {
            if (response.statusCode === 200) {
                const body = response.body;
                const accessToken = body.access_token;
                const refreshToken = body.refresh_token;

                const reqData = {
                    uri: "https://api.spotify.com/v1/me",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        json: true
                    }
                };

                request.get(reqData).then(body => {
                    // TODO: change route
                    console.log(body);
                    res.json(body);
                });

            } else {
                // TODO: handle alternate status codes
                console.log(response);
                res.send("Error: could not authenticate.");
            }
        }).catch(err => {
            // TODO: implement proper error handling
            console.log(err);
            res.send("Error: could not authenticate.");
        });
        
    }

});

// Serve react app on all other non-specified routes
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, BUILD_PATH, "index.html"));
});

// Start server
app.listen(config.PORT);
console.log(`Listening on Port ${config.PORT}...`);