import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
const obs = new OBSWebSocket();
import { exec } from "child_process";

var isConnected = false;

var setConnected = () => {
  if (!isConnected) {
    console.log("Connected to OBS!");
  }
  isConnected = true;
};

var setNotConnected = () => {
  if (isConnected) {
    console.log("Disconnected from OBS!");
  }
  isConnected = false;
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "live-recording-status-updater.html"));
});

io.on("connection", async (socket) => {
  socket.on("recording_state_change", async (msg, clientOffset, callback) => {
    io.emit("recording_state_change", msg);
    callback();
  });
});

const port = process.env.PORT || process.argv[3] || 3000;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

function onRecordStateChanged(event) {
  console.log("Recording State Event Received: ", event.outputState);
  if (
    event.outputState === "OBS_WEBSOCKET_OUTPUT_STARTING" ||
    event.outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED"
  ) {
    io.emit("recording_state_change", "STARTED");
    exec("afplay start.aif");
  } else if (
    event.outputState === "OBS_WEBSOCKET_OUTPUT_STOPPING" ||
    event.outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED"
  ) {
    io.emit("recording_state_change", "STOPPED");
    exec("afplay stop.aif");
  }
}

obs.on("RecordStateChanged", onRecordStateChanged);

obs.on("ConnectionOpened", setConnected);
obs.on("ConnectionClosed", setNotConnected);
obs.on("ConnectionError", setNotConnected);
obs.on("ExitStarted", setNotConnected);

///// Begin OBS Code

if (process.argv[2] === undefined) {
  console.log("Please provide a password for OBS connection");
  process.exit(1);
}

function sendScreenshots() {
  if (!isConnected) {
    return;
  }
  obs
    .call("GetSourceScreenshot", {
      sourceName: process.argv[5] || "Display Capture",
      imageFormat: "jpg",
      imageWidth: 640,
      imageCompressionQuality: 80,
    })
    .then((data) => {
      io.emit("screenshot", data.imageData);
      // Take a screenshot every interval and send it down to all clients in case they want to render the screenshot.
      var screenshotDelay = process.argv[4] || 100;
      setTimeout(sendScreenshots, screenshotDelay);
    })
    .catch((err) => {
      if (err.message.startsWith("No source was found by the name of")) {
        console.log(
          "Source " + process.argv[5] + " not found, check configuration."
        );
      } else {
        console.log(
          "OBS not quite ready to send screenshots, trying again in 1 second."
        );
        // wait for 1 second before trying again since we don't want to spam OBS with requests
        setTimeout(sendScreenshots, 1000);
      }
    });
}

// connect to obs-websocket running on localhost with same port
while (true) {
  if (!isConnected) {
    try {
      await obs.connect("ws://127.0.0.1:4455", process.argv[2]);
      setConnected();
      sendScreenshots();
    } catch (e) {
      setNotConnected();
      io.emit("no_feed");
    }
  }
  await sleep(1000);
}
