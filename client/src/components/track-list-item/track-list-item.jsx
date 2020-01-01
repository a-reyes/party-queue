import React from "react";

const TrackListItem = ({ trackInfo, children }) => (
    <div className="search-result">
        <img src={trackInfo.album.images[2].url} />
        <a href={trackInfo.external_urls.spotify}>
            {trackInfo.name} - {trackInfo.artists[0].name} {trackInfo.explicit ? "[Explicit]" : ""}
        </a>
        {children}
    </div>
);

export default TrackListItem;