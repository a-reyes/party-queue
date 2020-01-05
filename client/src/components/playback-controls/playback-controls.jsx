import React, { useState, useEffect } from "react";

const PlaybackControls = ({ socket, currentTrack, basePlaylist,
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