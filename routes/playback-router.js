const express = require("express");
const request = require("request-promise-native");

// Initialize router
const router = express.Router();

// Routes
router.get("/resume", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/play",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.put(reqOptions);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 204:
            console.log("Playback resumed successfully...");
            res.sendStatus(204);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
            res.sendStatus(response.statusCode);
    }
});

router.get("/pause", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/pause",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.put(reqOptions);
    } catch (err) {
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 204:
            console.log("Song paused successfully...");
            res.sendStatus(204);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
            res.sendStatus(response.statusCode);
    }
});

router.get("/next", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/next",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.post(reqOptions);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 204:
            console.log("Song skipped successfully...");
            res.sendStatus(204);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
            res.sendStatus(response.statusCode);
    }
});

router.get("/previous", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/previous",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.post(reqOptions);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 204:
            console.log("Previous song played successfully...");
            res.sendStatus(204);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
            res.sendStatus(response.statusCode);
    }
});

module.exports = router;