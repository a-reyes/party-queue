import React, { Fragment, useState } from "react";

// TEMP
import sampleResponse from "./sampleresponse.json";

const TrackListItem = ({ trackInfo }) => (
    <div className="search-result">
        <img src={trackInfo.album.images[2].url} />
        <a href={trackInfo.external_urls.spotify}>
            {trackInfo.name} - {trackInfo.artists[0].name} {trackInfo.explicit ? "[Explicit]" : ""}
        </a>
    </div>
);

const App = () => {

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
        <Fragment>
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
        </Fragment>
    );

};

export default App;