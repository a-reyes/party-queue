import React, { Fragment, useState, useEffect } from "react";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";
import PlaybackControls from "./components/playback-controls/playback-controls";

import "./temp-styles.css";

const App = () => {

    // User log-in status
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        fetch("/login/status")
        .then(res => res.json())
        .then(data => setIsLoggedIn(data.isLoggedIn));
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
                    <PlaybackControls/>
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