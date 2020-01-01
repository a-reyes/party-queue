import React from "react";
import TrackListItem from "../track-list-item/track-list-item";
import TrackListButton from "../track-list-button/track-list-button";

const TrackQueue = ({ tracks, removeFromQueue }) => {
    return (
        <div>
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