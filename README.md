## OBS Setup

Enable websocket server in OBS, and copy the password for the server

## Usage

Install nodejs

Run `npm install` to restore packages

Run `node index.js {password} {port} {updateRate} {sourceName}`

Explanation of cli parameters:

- password is the password to your websocket server, configured in OBS
- port is the http port to serve the website on that will give a live preview and recording status (via background color - red = recording)
- updateRate is how many milliseconds to wait between screenshots.  set this to a lower value (such as 10) to get a more "live" feed at the expense of extra compute overhead
- sourceName is the name of the scene in OBS that you want to capture - note you cannot currently send a scene, only a screenshot of the underlying source

