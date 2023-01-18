import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';
const obs = new OBSWebSocket();
import { exec } from 'child_process';

var isConnected = false;

var setConnected = () => {
    if (!isConnected) {
        console.log("Connected to OBS!");
    }
    isConnected = true;
}
var setNotConnected = () => {
    if (isConnected) {
        console.log("Disconnected from OBS!");
    }
    isConnected = false;
}

function onRecordStateChanged(event) {
    console.log('Recording State Event Received: ', event.outputState);
    if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STARTING" || event.outputState === "OBS_WEBSOCKET_OUTPUT_RESUMED") {
        exec('afplay start.aif')
    }
    else if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STOPPING" || event.outputState === "OBS_WEBSOCKET_OUTPUT_PAUSED") {
        exec('afplay stop.aif')
    }
}

obs.on('RecordStateChanged', onRecordStateChanged);

obs.on("ConnectionOpened", setConnected);
obs.on("ConnectionClosed", setNotConnected);
obs.on("ConnectionError", setNotConnected);
obs.on('ExitStarted', setNotConnected);

const sleep = ms => new Promise(res => setTimeout(res, ms))

// connect to obs-websocket running on localhost with same port
while (true)
{
    if (!isConnected) {  
        try {
            await obs.connect("ws://127.0.0.1:4455", process.argv[2]);
            setConnected();
        }
        catch (e) {
            // console.log(e);
            setNotConnected();
        }
    }
    await sleep(1000);
}