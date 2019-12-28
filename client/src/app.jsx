import React, { Fragment, useState } from "react";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";

import "./temp-styles.css";

const App = () => {

    return (
        <div className="col-2">
            <TrackSearch />
            <TrackQueue />
        </div>
    );

};

export default App;