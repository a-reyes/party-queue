const request = require("request-promise-native");

// Temporary
let connectedUsers = [];
let admin;

/**
 * Requests track information from Spotify, and emits it to the clients.
 * Information is given about the user's currently playing song on their
 * Spotify account. Only a user (socket) with admin priveledges should
 * be passed to this method.
 * @param {SocketIO.Server} io 
 * @param {SocketIO.Socket} socket - An admin user's socket
 */
const updateSong = async (io, socket) => {
    console.log(`${socket.id} is sending out new song info.`);
    const userSession = socket.handshake.session;

    // Check that the request is from an admin
    if (!userSession.isAdmin) {
        socket.emit("server-error", {
            msg: "Error: you don't have permission to do that."
        });
        return;
    }

    // Check if the user is logged in
    if (!userSession.isLoggedIn) {
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
            // TEMP
            userSession.currentTrack = body;

            // Send data to clients
            io.emit("current-track", body);
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

/**
 * Sends a request to Spotify to play a track on the user's behalf.
 * If songURI is specified, this function will attempt to play that song, else
 * Spotify will attempt to resume paused playback on the user's device.
 * Only a user (socket) with admin priveledges should
 * be passed to this method.
 * @param {SocketIO.Server} io 
 * @param {SocketIO.Socket} socket - An admin user's socket
 * @param {string} songUri - The URI of the song on Spotify.
 */
const playTrack = async (io, socket, songUri) => {
    const userSession = socket.handshake.session;

    // Check that the request is from an admin
    if (!userSession.isAdmin) {
        socket.emit("server-error", {
            msg: "Error: you don't have permission to do that."
        });
        return;
    }

    const reqOptions = {
        uri: "https://api.spotify.com/v1/me/player/play",
        headers: {
            Authorization: `Bearer ${userSession.accessToken}`
        },
        json: true,
        resolveWithFullResponse: true
    };

    // If a song URI is specified, include it in the body request
    if (songUri) {
        console.log(`Attempting to play ${songUri}`);
        reqOptions.body = {
            uris: [songUri]
        }
    }

    // Send request
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
            updateSong(io, socket);
            break;
        default:
            // TODO: Implement 404 (no devices) or 403 (not premium)
            console.log(response.statusCode);
            console.log(body);
    }
};

/**
 * Set up emit event handlers for the io server.
 * @param {SocketIO.Server} io 
 */
const handleEvents = io => {

    /**
     * Handle emit events for individual sockets, once connected.
     * @param {SocketIO.Socket} - A newly connected socket.
     */
    io.on("connect", socket => {
        console.log("A user connected");

        // Add to list of connections
        connectedUsers.push(socket);
        console.log(`There are ${connectedUsers.length} users connected.`);
        if (connectedUsers.length === 1) {
            console.log("Congrats ADMIN, you are the first.");
            socket.handshake.session.isAdmin = true;
            admin = socket;
        } else {
            console.log("You are just a spectator...");
            socket.handshake.session.isAdmin = false;
        }

        // Update session with the isAdmin property
        socket.handshake.session.save();

        // Send clients information on the current song
        socket.on("current-track", () => {
            const userSession = socket.handshake.session;
            if (userSession.isAdmin) {
                // Update all users
                updateSong(io, socket);
            } else {
                // Only update the requesting user
                socket.emit("current-track", admin.handshake.session.currentTrack);
            }
        });

        // Pause playback on the user's device
        socket.on("pause-playback", async () => {
            // TODO: Check if song already paused
            console.log("Pausing playback...");

            const userSession = socket.handshake.session;

            // Check that the request is from an admin
            if (!userSession.isAdmin) {
                socket.emit("server-error", {
                    msg: "Error: you don't have permission to do that."
                });
                return;
            }

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
        socket.on("resume-playback", async () => playTrack(io, socket, null));

        // Play a specified song (by URI)
        socket.on("play-track", async songUri => playTrack(io, socket, songUri));

        // Handle a request to add a song to the queue
        socket.on("request-queue-add", track => {
            if (socket !== admin) {
                // TODO: again, id/info on the sender
                console.log(`${socket} is requesting to add a track...`);

                // Send the track to the admin user
                io.to(admin.id).emit("request-queue-add", track);
            }
        });

        // Handle a request from a user to remove a song they added to the queue
        socket.on("request-queue-remove", trackId => {
            if (socket != admin) {
                // TODO: again, id/info on the sender
                console.log(`${socket} is requesting to remove their track...`);

                // Send the track id to the admin user
                io.to(admin.id).emit("request-queue-remove", trackId);
            }
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected.");
            connectedUsers = connectedUsers.filter(s => s.id != socket.id);
        });
    });

};

// Export socket events
module.exports = io => handleEvents(io);