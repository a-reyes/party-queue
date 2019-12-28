import React from "react";
import TrackListItem from "../track-list-item/track-list-item";
import RemoveQueueButton from "../remove-queue-button/remove-queue-button";

const TrackQueue = ({ tracks }) => {
    return (
        <div>
            <h1>Queue</h1>
            <div class="track-list">
                {tracks.map(trackInfo => (
                    <TrackListItem key={trackInfo.id} trackInfo={trackInfo}>
                        <RemoveQueueButton />
                    </TrackListItem>
                ))}
            </div>
        </div>
    );
};

export default TrackQueue;