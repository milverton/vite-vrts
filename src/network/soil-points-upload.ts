
import {LoadingEvent, LoadingMachine} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";


export const networkSoilPointsUploadMachine = new LoadingMachine('Network Soil Points Upload Machine');
networkSoilPointsUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        break;
      case LoadingEvent.Load:
        const {event, meta} = state.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-points`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilPointsUploadMachine.success();
                networkSoilPointsUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkSoilPointsUploadMachine.fail(e.toString());
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkSoilPointsUploadMachine.fail(e.toString());
          logWarning("Importing Soil Points Failed", e)
        })
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        networkSoilPointsUploadMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});