import React, { Fragment, useState } from "react";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";

import "./temp-styles.css";

const App = () => {

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

    return (
        <div className="col-2">
            <TrackSearch 
                addToQueue={addToQueue}
            />
            <TrackQueue 
                tracks={trackQueue}
                removeFromQueue={removeFromQueue}
            />
        </div>
    );

};

export default App;