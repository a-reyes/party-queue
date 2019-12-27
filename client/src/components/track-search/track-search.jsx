import React, { useState } from "react";

import TrackListItem from "../track-list-item/track-list-item";

// TEMP
import sampleResponse from "../../sampleresponse.json";

const TrackSearch = () => {

    // Search text entered into the text input
    const [searchText, setSearchText] = useState("");
    const updateSearchText = e => setSearchText(e.target.value);

    // Array of results recieved from the server
    const [searchResults, setSearchResults] = useState([]);
    const sendSearchRequest = () => {
        const trackInfo = sampleResponse.tracks.items[0];
        setSearchResults(searchResults.concat(sampleResponse.tracks.items));
    };

    return (
        <div className="track-search">
            <h2>Search box</h2>
            <input
                type="text" 
                placeholder="Search..."
                onChange={updateSearchText}
            />
            <button onClick={sendSearchRequest}>Search</button>
            <div className="search-results">{
                searchResults.map(trackInfo => (
                    <TrackListItem key={trackInfo.id} trackInfo={trackInfo} />
                ))
            }</div>
        </div>
    );

};

export default TrackSearch;