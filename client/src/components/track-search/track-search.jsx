import React, { useState, useEffect } from "react";
import TrackListItem from "../track-list-item/track-list-item";

const TrackSearch = () => {

    // Search text entered into the text input
    const [searchText, setSearchText] = useState("");
    const updateSearchText = e => setSearchText(e.target.value);

    // Array of results recieved from the server
    const [searchResults, setSearchResults] = useState([]);
    const sendSearchRequest = () => {
        fetch(`/search?search=${searchText}*`)
        // TODO: This will fail (and not return JSON) if user is not logged in
        .then(res => res.json())
        .then(data => {
            setSearchResults(data.tracks.items)
        });
    };

    // Send search request to server
    useEffect(() => {
        if (searchText !== "") {
            sendSearchRequest();
        }
    }, [searchText]);

    return (
        <div className="track-search">
            <h2>Search box</h2>
            <input
                type="text" 
                placeholder="Search..."
                onChange={updateSearchText}
            />
            <button onClick={() => console.log("CLICK!")}>Search</button>
            <div className="search-results">{
                searchResults.map(trackInfo => (
                    <TrackListItem key={trackInfo.id} trackInfo={trackInfo} />
                ))
            }</div>
        </div>
    );

};

export default TrackSearch;