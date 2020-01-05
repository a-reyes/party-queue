const request = require("request-promise-native");

// Temporary
let connectedUsers = [];

// Send clients info on currently playing tracks
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

// Set up socket events on connection
const handleEvents = socket => {
    console.log("A user connected");

    connectedUsers.push(socket);
    console.log(`There are ${connectedUsers.length} users connected.`);
    if (connectedUsers.length === 1) {
        console.log("Congrats ADMIN, you are the first.");
        socket.handshake.session.isAdmin = true;
    } else {
        console.log("You are just a spectator...");
        socket.handshake.session.isAdmin = false;
    }

    // Update session with the isAdmin property
    socket.handshake.session.save();

    // Send clients information on the current song
    socket.on("current-track", () => updateSong(socket));

    // Play the previous track on a user's device
    // DEPRECATED: using "play-track" instead
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

    // Play the next track on a user's device
    // DEPRECATED: using "play-track" instead
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

    // Pause playback on the user's device
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

    // Resume playback on the user's device
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

    // Play a specified song (by URI)
    // TODO: Merge with resume-playback (identical other than request body)
    socket.on("play-track", async songUri => {
        console.log(`Attempting to play ${songUri}`);

        const userSession = socket.handshake.session;
        const reqOptions = {
            uri: "https://api.spotify.com/v1/me/player/play",
            headers: {
                Authorization: `Bearer ${userSession.accessToken}`
            },
            body: {
                uris: [songUri]
            },
            json: true,
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
                console.log("Song played successfully...");
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
        connectedUsers = connectedUsers.filter(s => s.id != socket.id);
    });

};

// Export socket events
module.exports = handleEvents;