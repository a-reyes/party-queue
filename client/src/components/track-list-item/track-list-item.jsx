import React from "react";

import "./track-list-item.css";

const TrackListItem = ({ trackInfo, children }) => (
    <div className="track-list-item">
        <img src={trackInfo.album.images[2].url} />
        <a href={trackInfo.external_urls.spotify}>
            {trackInfo.name} - {trackInfo.artists[0].name} {trackInfo.explicit ? "[Explicit]" : ""}
        </a>
        {children}
    </div>
);

export default TrackListItem;