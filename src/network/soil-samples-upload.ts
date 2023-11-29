
import {LoadingEvent, LoadingMachine} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";


export const networkSoilSamplesUploadMachine = new LoadingMachine('Network Soil Samples Upload Machine');
networkSoilSamplesUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        break;
      case LoadingEvent.Load:
        const {event, meta} = state.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-samples`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilSamplesUploadMachine.success();
                networkSoilSamplesUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkSoilSamplesUploadMachine.fail(e.toString());
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkSoilSamplesUploadMachine.fail(e.toString());
          logWarning("Importing Soil Samples Failed", e)
        })
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        networkSoilSamplesUploadMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});