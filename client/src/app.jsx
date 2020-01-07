import React, { Fragment, useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

import TrackSearch from "./components/track-search/track-search";
import TrackQueue from "./components/track-queue/track-queue";
import PlaybackDisplay from "./components/playback-display/playback-display";
import PlaybackControls from "./components/playback-controls/playback-controls";

import "./temp-styles.css";

// Initialize socket
const socket = socketIOClient();
console.log("Socket connected..");

const App = () => {

    // User log-in status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // User priveledges
    const [isAdmin, setIsAdmin] = useState(false);
    const isAdminRef = useRef(isAdmin);
    useEffect(() => {
        isAdminRef.current = isAdmin;
    }, [isAdmin]);

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
            // TODO: make only admin have the setTimeout. It will update the song, and the server
            // will emit the current-track event
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
        setIsAdmin(data.isAdmin);

        if (data.isLoggedIn) {

            if (data.isAdmin) {
                // Retrieve the user's playlist data
                const playlistData = await (await fetch("/playlists")).json();
                setUserPlaylists(playlistData.items);

                // Set up queue listening events (admin exclusive)
                socket.on("request-queue-add", track => {
                    console.log("Someone requested to add a song to the queue...");
                    addToQueue(track);
                });

                // TODO: account for multiple instances of the same track in different locations in the queue
                socket.on("request-queue-remove", trackId => {
                    console.log("Someone requested to remove their track from the queue...");
                    removeFromQueue(trackId);
                });
            }

            updateTrackInfo(); // Maybe move to when base playlist is set
        }
    }, []);

    // Array of user-selectedsongs
    const [trackQueue, setTrackQueue] = useState([]);

    // Append a new song to the end of the queue
    const addToQueue = track => {
        if (!isAdminRef.current) {
            // Only execute if the current user is not the admin
            // TODO: Add identifier in case the same track has been added multiple times
            //    -> To ensure the correct queue index is removed
            console.log("Requesting to add track....");
            socket.emit("request-queue-add", track);
        }
        setTrackQueue(prevQueue => [...prevQueue, track]);
    };

    // Remove an song from the queue by track id
    const removeFromQueue = trackId => {
        if (!isAdminRef.current) {
            // Only execute if the user is not the admin
            // TODO: add identifier in case the track appears multiple times in the queue.
            //    -> To ensure the correct one is removed.
            console.log("Requesting to remove track...");
            socket.emit("request-queue-remove", trackId);
        }

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
        if (isAdmin && basePlaylist.length < 1) {
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
                        <PlaybackDisplay 
                            currentTrack={currentTrack}
                        />
                        {(() => {
                            if (isAdmin) {
                                return (
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
                                )
                            }
                        })()}
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