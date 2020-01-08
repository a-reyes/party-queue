import React, { useState, useEffect } from "react";
import TrackListButton from "../track-list-button/track-list-button";

import "./playback-controls.css";

const PlaybackControls = ({ socket, basePlaylist,
                            timeoutRef, playNext, setBasePlaylist }) => {
    // TODO: Use server requests to verify
    const [isPlaying, setIsPlaying] = useState(true);
    const playPause = () => {
        if (isPlaying) {
            socket.emit("pause-playback");
            clearTimeout(timeoutRef);
            setIsPlaying(false);
        } else {
            socket.emit("resume-playback");
            setIsPlaying(true);
        }
    }

    // Play the previous song
    const playPrevious = () => {
        console.log("Trying to get previous track...");

        // Clear old timeout
        clearTimeout(timeoutRef);

        // Move the last element to the front of the list
        const newPlaylist = basePlaylist.slice();
        newPlaylist.unshift(newPlaylist.pop());

        // Get the last element
        const nextSong = newPlaylist[newPlaylist.length - 1];

        // Send song to server
        socket.emit("play-track", nextSong.uri);

        // Update the playlist
        setBasePlaylist(newPlaylist);

    };

    return (
        <div className="playback-controls">
            <TrackListButton 
                text="Previous"
                handleClick={playPrevious}
            />
            <TrackListButton 
                text={isPlaying ? "Pause" : "Play"}
                handleClick={playPause}
            />
            <TrackListButton 
                text="Next"
                handleClick={playNext}
            />
        </div>
    );
};

export default PlaybackControls;