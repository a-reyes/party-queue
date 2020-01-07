import React from "react";

import "./track-list-button.css";

const TrackListButton = ({ text, handleClick }) => (
    <button 
        className="track-list-button"
        onClick={handleClick}
    >
        {text}
    </button>
);

export default TrackListButton;