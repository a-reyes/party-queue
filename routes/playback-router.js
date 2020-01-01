const express = require("express");
const request = require("request-promise-native");

// Initialize router
const router = express.Router();

// Routes

// Get information on the user's currently playing track
router.get("/current-track", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/currently-playing",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        resolveWithFullResponse: true
    };

    let response;
    try {
        response = await request.get(reqOptions);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return;
    }

    const body = response.body;
    switch (response.statusCode) {
        case 200:
            console.log(body);
            res.status(200).json(body);
            break;
        case 204:
            // No track is currently playing
            // TODO: Implement
            res.sendStatus(204);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
            res.sendStatus(response.statusCode);
    }
});

// Resume playback on the active device
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

// Pause playback on the active device
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

// Play the next track on the active device
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

// Play the previous track on the active device
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