import {LoadingEvent, LoadingMachine} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";





export const networkEmGrUploadMachine = new LoadingMachine('Network EmGr Upload Machine');
networkEmGrUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        break;
      case LoadingEvent.Load:
        const {event, meta} = state.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/emgr`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkEmGrUploadMachine.success();
                networkEmGrUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkEmGrUploadMachine.fail(`Error uploading emgr: ${e.toString()}`);
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkEmGrUploadMachine.fail(`Error uploading emgr: ${e.toString()}`);
          logWarning("Importing EmGr Failed", e)
        })
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        networkEmGrUploadMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});
