
import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {prepareUpload, readFileHandler} from "./common";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {logWarning} from "../lib/stores/logging";


export const networkSoilSamplesUploadMachine = new LoadingMachine('Network Soil Samples Upload Machine');
networkSoilSamplesUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        break;
      case LoadingState.Loading:
        const {event, meta} = state.event.payload
        readFileHandler(event).then(({data, mime}) => {
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-samples`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilSamplesUploadMachine.service.send(LoadingEvent.Success);
                networkSoilSamplesUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((_) => {
                networkSoilSamplesUploadMachine.service.send(LoadingEvent.Failure);
                // logServerFailure(e, "f4dfa636")
              });
          })
        }).catch((e) => {
          networkSoilSamplesUploadMachine.service.send(LoadingEvent.Failure);
          logWarning("Importing Soil Samples Failed", e)
        })
        break;
    }
  }
});