import {LoadingEvent, LoadingMachine} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";

export const networkBoundaryUploadMachine = new LoadingMachine('Network Boundary Upload Machine');
networkBoundaryUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        break;
      case LoadingEvent.Load:
        const {event, meta} = state.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/boundary`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkBoundaryUploadMachine.success();
                networkBoundaryUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkBoundaryUploadMachine.fail(`Error uploading boundary: ${e.toString()}`);
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkBoundaryUploadMachine.fail(`Error uploading boundary: ${e.toString()}`);
          logWarning("Importing Boundary Failed", e)
        })
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        networkBoundaryUploadMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});