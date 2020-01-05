import React, { Fragment, useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";
import PlaybackControls from "./components/playback-controls/playback-controls";

import "./temp-styles.css";

// Initialize socket
const socket = socketIOClient();
console.log("Socket connected..");

const App = () => {

    // User log-in status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Current track info
    const [currentTrack, setCurrentTrack] = useState(null);

    // Store setTimeout reference
    const [timeoutRef, setTimeoutRef] = useState(null);

    // Function to update the current track state
    const updateTrackInfo = () => {
        console.log("Requesting current track...");
        socket.emit("current-track");
        socket.on("current-track", trackInfo => {
            console.log(trackInfo);

            // Update track info
            setCurrentTrack(trackInfo);

            // Set timeout for remainder of song duration
            const sleepTime = trackInfo.item.duration_ms - trackInfo.progress_ms;
            setTimeoutRef(setTimeout(() => {
                playNext(false);
            }, sleepTime));
        });
    };

    // Component-mount effects
    useEffect(async () => {
        // Fetch login status
        const data = await (await fetch("/login/status")).json();
        setIsLoggedIn(data.isLoggedIn);

        if (data.isLoggedIn) {
            // Retrieve the user's playlist data
            const playlistData = await (await fetch("/playlists")).json();
            setUserPlaylists(playlistData.items);

            updateTrackInfo(); // Maybe move to when base playlist is set
        }
    }, []);

    // Array of user-selectedsongs
    const [trackQueue, setTrackQueue] = useState([]);

    // Append a new song to the end of the queue
    const addToQueue = track => {
        setTrackQueue(prevQueue => [...prevQueue, track]);
    };

    // Remove an song from the queue by track id
    const removeFromQueue = trackId => {
        setTrackQueue(prevQueue => {
            return prevQueue.filter(track => track.id != trackId)
        });
    };

    // Array to hold information on a user's personal playlists
    const [userPlaylists, setUserPlaylists] = useState([]);

    // Array of songs from the selected playlist, and played songs from trackQueue
    const [basePlaylist, setBasePlaylist] = useState([]);

    // Set and update a ref to the track queue
    // Functions like playNext depend on this ref to avoid stale closures (old state)
    const trackQueueRef = useRef(trackQueue);
    useEffect(() => {
        trackQueueRef.current = trackQueue;
    }, [trackQueue]);

    // Set and update a ref to the base playlist
    const playlistRef = useRef(basePlaylist);
    useEffect(() => {
        playlistRef.current = basePlaylist;
    }, [basePlaylist]);

    // Play the next song
    // Param: forceClear - boolean - Whether the timeout function should be force-reset
    // (If the song playback won't be interrupted, pass false.)
    const playNext = (forceClear = true) => {
        
        console.log("Trying to play the next track...");

        // A ref to the queue and playlist must be used to avoid stale closures
        const playlist = playlistRef.current;
        const queue = trackQueueRef.current;

        // Clear old timeout
        if (forceClear) {
            clearTimeout(timeoutRef);
        }

        // Request next track
        // Determine which track to play next
        // TODO/BUG: Track objects may differ depending on what Spotify route they come from
        let nextSong;
        let newPlaylist = playlist.slice();
        if (queue.length > 0) {
            // Get first song in the queue
            nextSong = queue[0];
            removeFromQueue(nextSong.id);

            // Add the song to the back of the base playlist
            newPlaylist.push(nextSong);
        } else {
            // Get the first song in the playlist
            nextSong = newPlaylist[0];

            // Move track to back
            newPlaylist.push(newPlaylist.shift());
        }

        // Emit event to the server
        socket.emit("play-track", nextSong.uri);

        // Update the playlist
        setBasePlaylist(newPlaylist);
    };

    if (isLoggedIn) {
        if (basePlaylist.length < 1) {
            // Base playlist has not been selected
            return (
                <div>
                    <h2>Please select a base playlist:</h2>
                    <ul>
                        {userPlaylists.map(playlist => (
                            <li key={playlist.id}>
                                {playlist.name} - {playlist.owner.display_name}
                                <button 
                                    onClick={async () => {
                                        const data = await (await fetch(`/playlist-tracks?id=${playlist.id}`)).json();
                                        setBasePlaylist(data.items.map(item => item.track));
                                    }}
                                >
                                    Select
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        } else {
            // Set-up complete, render main application
            return (
                <div className="col-2">
                    <TrackSearch 
                        addToQueue={addToQueue}
                    />
                    <TrackQueue 
                        tracks={trackQueue}
                        removeFromQueue={removeFromQueue}
                    >
                        <PlaybackControls 
                            socket={socket}
                            currentTrack={currentTrack}
                            basePlaylist={basePlaylist}
                            trackQueue={trackQueue}
                            timeoutRef={timeoutRef}
                            removeFromQueue={removeFromQueue}
                            playNext={playNext}
                            setBasePlaylist={setBasePlaylist}
                        />
                    </TrackQueue>
                </div>
            );
        }
    } else {
        // User needs to be authenticated
        return (
            <div>
                <a href="/login">Connect Spotify</a>
            </div>
        );
    }

};

export default App;