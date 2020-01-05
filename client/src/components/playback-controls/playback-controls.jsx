import React, { useState, useEffect } from "react";

const PlaybackControls = ({ socket, currentTrack, basePlaylist,
                            trackQueue, timeoutRef, removeFromQueue,
                            setBasePlaylist }) => {
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

        // Request previous track
        socket.emit("previous-track");
    };

    // Play the next song
    const playNext = () => {
        console.log("Trying to get next track...");

        // Clear old timeout
        clearTimeout(timeoutRef);

        // Request next track
        // Determine which track to play next
        // TODO/BUG: Track objects may differ depending on what Spotify route they come from
        let nextSong;
        if (trackQueue.length > 0) {
            nextSong = trackQueue[0];
            removeFromQueue(nextSong.id);

            // Add the song to the back of the base playlist
            setBasePlaylist(basePlaylist.concat(nextSong));
        } else {
            nextSong = basePlaylist[0];

            // Move track to back
            const newPlaylist = basePlaylist.slice();
            newPlaylist.push(newPlaylist.shift());
            setBasePlaylist(newPlaylist);
        }

        socket.emit("play-track", nextSong.uri);
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