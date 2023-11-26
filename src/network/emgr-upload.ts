import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";





export const networkEmGrUploadMachine = new LoadingMachine('Network EmGr Upload Machine');
networkEmGrUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        break;
      case LoadingState.Loading:
        const {event, meta} = state.event.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/emgr`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkEmGrUploadMachine.service.send(LoadingEvent.Success);
                networkEmGrUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch(() => {
                networkEmGrUploadMachine.service.send(LoadingEvent.Failure);
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkEmGrUploadMachine.service.send(LoadingEvent.Failure);
          logWarning("Importing EmGr Failed", e)
        })
        break;
    }
  }
});
