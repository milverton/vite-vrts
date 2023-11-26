import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {logFailure, logServerFailure} from "../lib/stores/logging";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../core/meta";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {prepareUpload, readDroppedFileHandler} from "./common";
import {constructMeta} from "../dashboards/import/transform";
import {ImportMetaModel} from "../dashboards/import/model";


export const networkSoilPhotoUploadMachine = new LoadingMachine('Network Soil Photo Upload Machine');
networkSoilPhotoUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        break;
      case LoadingState.Loading:
        const {event, sampleId, props} = state.event.payload
        let meta:ImportMetaModel;
        readDroppedFileHandler(event).then(({data, mime}) => {
          switch (mime) {
            case "image/jpeg":
              meta = constructMeta(props, MetaRecordType.SoilPhoto, MetaRecordStatus.Clean, MetaRecordFormat.Jpg, null)
              meta.variation = sampleId
              break;
            case "image/png":
              meta = constructMeta(props, MetaRecordType.SoilPhoto, MetaRecordStatus.Clean, MetaRecordFormat.Png, null)
              meta.variation = sampleId
              break;
            default:
              break;
          }
          if (!meta) {
            networkSoilPhotoUploadMachine.service.send(LoadingEvent.Failure);
            return
          }
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-photo`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilPhotoUploadMachine.service.send(LoadingEvent.Success);
                networkSoilPhotoUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkSoilPhotoUploadMachine.service.send(LoadingEvent.Failure);
                logServerFailure(e, "cebfc614")
              });
          })
        }).catch((e) => {
          networkSoilPhotoUploadMachine.service.send(LoadingEvent.Failure);
          logFailure("Importing Soil Photo Failed", e)
        })
        break;
      default:
        break;
    }
  }
});

