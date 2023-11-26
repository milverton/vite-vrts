import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";


export const networkSoilRawUploadMachine = new LoadingMachine('Network Soil Raw Upload Machine');
networkSoilRawUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        break;
      case LoadingState.Loading:
        const {event, meta} = state.event.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-raw`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilRawUploadMachine.service.send(LoadingEvent.Success);
                networkSoilRawUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((_) => {
                networkSoilRawUploadMachine.service.send(LoadingEvent.Failure);
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkSoilRawUploadMachine.service.send(LoadingEvent.Failure);
          logWarning("Importing Soil Raw Failed", e)
        })
        break;
    }
  }
});