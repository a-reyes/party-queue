import React, { Fragment, useState } from "react";

const App = () => {

    const [searchText, setSearchText] = useState("");
    const updateSearchText = e => setSearchText(e.target.value);
    const sendSearchRequest = () => alert(searchText);

    return (
        <Fragment>
            <h2>Search box</h2>
            <input
                type="text" 
                placeholder="Search..."
                onChange={updateSearchText}
            />
            <button onClick={sendSearchRequest}>Search</button>
            <div className="search-results"></div>
        </Fragment>
    );

};

export default App;