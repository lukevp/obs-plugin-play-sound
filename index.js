import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';
const obs = new OBSWebSocket();
import { exec } from 'child_process';

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

obs.once('ExitStarted', () => {
  console.log('OBS started shutdown');

  // Just for example, not necessary should you want to reuse this instance by re-connect()
  obs.off('RecordStateChanged', onRecordStateChanged);
});


// connect to obs-websocket running on localhost with same port
await obs.connect("ws://127.0.0.1:4455", process.argv[2]);