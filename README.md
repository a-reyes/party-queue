# PartyQueue
PartyQueue is a full stack web application built using JavaScript, with the purpose of allowing multiple people to add songs to the same queue on [Spotify](https://www.spotify.com/). The idea for the project came from the inconvenience of everyone needing to ask one person for song requests in a group setting.

## Demo
A video demo of the latest version is available [here](https://www.youtube.com/watch?v=vViiRHVo4p4).

## Installation
If you wish to install the project on your own computer, it does require a bit of set up at this stage.

First, clone the repository to an empty directory. Next, in the root folder, install the node dependencies.

```bash
npm install
```

Now, go into the "client" directory, and install the front-end dependencies.

```bash
cd client/
npm install
```

Next, go to the [Spotify Developers Dashboard](https://developer.spotify.com/dashboard/), and create a new app to recieve a unique "Client ID" and "Client Secret". Note that you may require a premium Spotify account for this to work. When registering with Spotify, make sure that you set the "redirect uri" to exactly "http://localhost:3000/login/callback". It must be exactly that, even a simple trailing "/" will cause the Spotify authentication to fail.

Once you have the keys, create a "config.js" file in the root directory of the project, and add the following.

```JavaScript
module.exports = {
    PORT: 3000,
    CLIENT_ID: YOUR_CLIENT_ID,
    CLIENT_SECRET: YOUR_CLIENT_SECRET,
    REDIRECT_URI: `http://localhost:${PORT}/login/callback`
};
```

Of course, replace "YOUR_CLIENT_ID" and "YOUR_CLIENT_SECRET" with the keys you recieved from Spotify.

Finally, go into the "client" directory once again, and build the react application.

```bash
cd client/
npm run build
```

## Usage
Now that the setup is done, simply return to the root directory and run the server.

```
node server.js
```

Now you may visit "localhost:3000" in your browser, and the application should be functional.

Please note that this application does not play Spotify songs itself, rather it alters the playback of Spotify on another device. For example, if you are playing Spotify from your phone, this app can be used to alter the playback on your phone, and provide the "group queue" functionality.

## License
[MIT](https://choosealicense.com/licenses/mit/)
