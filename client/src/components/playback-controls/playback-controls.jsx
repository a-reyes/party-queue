import React, { useState, useEffect } from "react";

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