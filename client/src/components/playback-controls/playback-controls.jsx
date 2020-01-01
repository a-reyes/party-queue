import React, { useState } from "react";

// TODO: Change all routes to return JSON objects.

const playPrevious = () => {
    fetch("/playback/previous")
    .then(res => console.log(res));
};

const playNext = () => {
    fetch("/playback/next")
    .then(res => console.log(res));
}

const PlaybackControls = props => {
    // TODO: Use server requests to verify
    const [isPlaying, setIsPlaying] = useState(true);
    const playPause = () => {
        let reqRoute;
        if (isPlaying) {
            reqRoute = "/playback/pause";
        } else {
            reqRoute = "/playback/resume";
        }

        fetch(reqRoute)
        .then(res => {
            if (res.status === 200) {
                setIsPlaying(!isPlaying);
            } else {
                alert("An error occurred.");
                console.log(res);
            }
        });
    }

    return (
        <div>
            <button onClick={playPrevious}>Previous</button>
            <button onClick={playPause}>
                {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={playNext}>Next</button>
        </div>
    );
};

export default PlaybackControls;