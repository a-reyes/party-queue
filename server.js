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
app.get("/callback", async (req, res) => {
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

            const reqData = {
                uri: "https://api.spotify.com/v1/me",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                json: true
            };

            let resBody;
            try {
                resBody = await request.get(reqData);
            } catch (err) {
                // TODO: implement proper error handling
                console.log(err);
                res.send("Error: an error occurred.");
                return;
            }

            // TODO: change route
            console.log(resBody);
            res.json(resBody);

        } else {
            // TODO: handle alternate status codes
            console.log(authRes);
            res.send("Error: could not authenticate.");
        }
        
    }

});

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

// Start server
app.listen(config.PORT);
console.log(`Listening on Port ${config.PORT}...`);