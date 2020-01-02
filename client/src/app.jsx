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

    // Store setTimeout reference
    const [timeoutRef, setTimeoutRef] = useState(null);

    // Function to update the current track state
    const updateTrackInfo = () => {
        console.log("Requesting current track...");
        socket.emit("current-track");
        socket.on("current-track", trackInfo => {
            console.log(trackInfo);

            // Update track info
            setCurrentTrack(trackInfo);

            // BUG: Sometimes multiple successive requests still sent.
            // Add delay to prevent multiple successive emits
            const sleepTime = 25 + trackInfo.item.duration_ms - trackInfo.progress_ms;
            setTimeoutRef(setTimeout(() => {
                socket.emit("current-track");
            }, sleepTime));
        });
    };

    // Component-mount effects
    useEffect(async () => {
        // Fetch login status
        const data = await (await fetch("/login/status")).json();
        setIsLoggedIn(data.isLoggedIn);

        if (data.isLoggedIn) {
            updateTrackInfo();
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
        return (
            <div className="col-2">
                <TrackSearch 
                    addToQueue={addToQueue}
                />
                <TrackQueue 
                    tracks={trackQueue}
                    removeFromQueue={removeFromQueue}
                >
                    <PlaybackControls 
                        socket={socket}
                        currentTrack={currentTrack}
                        timeoutRef={timeoutRef}
                    />
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