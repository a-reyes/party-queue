import React from "react";
import TrackListItem from "../track-list-item/track-list-item";
import TrackListButton from "../track-list-button/track-list-button";

const TrackQueue = ({ tracks }) => {
    return (
        <div>
            <h1>Queue</h1>
            <div class="track-list">
                {tracks.map(trackInfo => (
                    <TrackListItem key={trackInfo.id} trackInfo={trackInfo}>
                        <TrackListButton
                            text="Remove"
                            handleClick={() => alert("To be implemented...")}
                        />
                    </TrackListItem>
                ))}
            </div>
        </div>
    );
};

export default TrackQueue;