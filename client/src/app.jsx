import React, { Fragment, useState } from "react";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";

import "./temp-styles.css";

const App = () => {

    const [trackQueue, setTrackQueue] = useState([]);
    const addToQueue = (track) => {
        setTrackQueue(trackQueue.concat(track));
    };

    return (
        <div className="col-2">
            <TrackSearch addToQueue={addToQueue} />
            <TrackQueue tracks={trackQueue} />
        </div>
    );

};

export default App;