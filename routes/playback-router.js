/**
 * Playback router module
 * 
 * Handles requests relating to track playback on the user's device.
 * @module routes/playback-router
 * @author Alex Reyes
 */


const express = require("express");
const request = require("request-promise-native");


const router = express.Router();


/**
 * Route to get information on the currently playing track, from Spotify.
 * 
 * Responses:
 *      200: JSON response as recieved from the Spotify API.
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/player/get-the-users-currently-playing-track/">Spotify Documentation</a>
 */
router.get("/current-track", async (req, res) => {
    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/currently-playing",
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        json: true,
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


/**
 * Route to resume paused playback on a user's device.
 * 
 * Responses:
 *      204: when playback resumes successfully (no body)
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/">Spotify Documentation</a>
 */
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


/**
 * Route to pause playback on a user's device.
 * 
 * Responses:
 *      204: when playback pauses successfully (no body)
 *              - @see <a href="https://developer.spotify.com/documentation/web-api/reference/player/pause-a-users-playback/">Spotify Documentation</a>
 */
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


/**
 * Route to play the next song on the user's device
 * @deprecated
 */
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


/**
 * Route to play the previous song on the user's device
 * @deprecated
 */
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