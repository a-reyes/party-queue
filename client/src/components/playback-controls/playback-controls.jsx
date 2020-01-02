import React, { useState, useEffect } from "react";

const PlaybackControls = ({ socket, currentTrack, timeoutRef }) => {
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
        socket.emit("previous-track");
    };

    // Play the next song
    const playNext = () => {
        console.log("Trying to get next track...");

        // Clear old timeout
        clearTimeout(timeoutRef);
        socket.emit("next-track");
    }

    // Display song info
    let albumImg;
    let songTitle;
    if (currentTrack) {
        albumImg = <img src={currentTrack.item.album.images[1].url} />;
        songTitle = <div>{currentTrack.item.name} - {currentTrack.item.artists[0].name} {currentTrack.item.explicit ? "[Explicit]" : ""}</div>;
    }

    return (
        <div>
            {albumImg}
            {songTitle}
            <button onClick={playPrevious}>Previous</button>
            <button onClick={playPause}>
                {isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={playNext}>Next</button>
        </div>
    );
};

export default PlaybackControls;