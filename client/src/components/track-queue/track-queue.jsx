import React from "react";
import TrackListItem from "../track-list-item/track-list-item";
import TrackListButton from "../track-list-button/track-list-button";

import "./track-queue.css";

const TrackQueue = ({ tracks, removeFromQueue, children }) => {
    return (
        <div className="track-queue">
            <div className="playback-display">{children}</div>
            <h1>Queue</h1>
            <div class="track-list">
                {tracks.map(trackInfo => (
                    <TrackListItem key={trackInfo.id} trackInfo={trackInfo}>
                        <TrackListButton
                            text="Remove"
                            handleClick={() => removeFromQueue(trackInfo.id)}
                        />
                    </TrackListItem>
                ))}
            </div>
        </div>
    );
};

export default TrackQueue;