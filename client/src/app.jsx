import React, { Fragment, useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";
import PlaybackControls from "./components/playback-controls/playback-controls";

import "./temp-styles.css";

// Initialize socket
const socket = socketIOClient();
console.log("Socket connected..");

const App = () => {

    // User log-in status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Current track info
    const [currentTrack, setCurrentTrack] = useState(null);

    // Component-mount effects
    useEffect(async () => {
        // Fetch login status
        const data = await (await fetch("/login/status")).json();
        setIsLoggedIn(data.isLoggedIn);

        if (data.isLoggedIn) {
            console.log("Requesting current track...");
            socket.emit("current-track");
            socket.on("current-track", trackInfo => {
                console.log(trackInfo);
                setCurrentTrack(trackInfo);
            });
        }
    }, []);

    // Array of songs
    const [trackQueue, setTrackQueue] = useState([]);

    // Append a new song to the end of the queue
    const addToQueue = track => {
        setTrackQueue(trackQueue.concat(track));
    };

    // Remove an song from the queue by track id
    const removeFromQueue = trackId => {
        setTrackQueue(trackQueue.filter(track => track.id != trackId));
    };

    if (isLoggedIn) {
        // Request information on current song
        /*
        socket.emit("current-track");
        socket.on("current-track", data => {
            console.log(data);
            // Update state
            setCurrentTrack(data);

            // Add slight delay to prevent multiple successive requests
            let songTime = 50 + Math.ceil(data.item.duration_ms - data.progress_ms);
            setTimeout(() => {
                socket.emit("current-track");
            }, songTime);
        });
        */

        return (
            <div className="col-2">
                <TrackSearch 
                    addToQueue={addToQueue}
                />
                <TrackQueue 
                    tracks={trackQueue}
                    removeFromQueue={removeFromQueue}
                >
                    <PlaybackControls currentTrack={currentTrack} />
                </TrackQueue>
            </div>
        );
    } else {
        return (
            <div>
                <a href="/login">Connect Spotify</a>
            </div>
        );
    }

};

export default App;