import {LoadingEvent, LoadingMachine} from "../core/machine";
import {logFailure, logServerFailure} from "../lib/stores/logging";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../core/meta";
import {post} from "../core/network";
import {UPLOAD_URL} from "../lib/stores/soil/model";
import {updateMetaChannel} from "../lib/stores/meta/transform";
import {prepareUpload, readDroppedFileHandler} from "./common";
import {constructMeta} from "../dashboards/import/transform";
import {ImportMetaModel} from "../dashboards/import/model";
import {networkSoilPointsUploadMachine} from "./soil-points-upload.ts";


export const networkSoilPhotoUploadMachine = new LoadingMachine('Network Soil Photo Upload Machine');
networkSoilPhotoUploadMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        break;
      case LoadingEvent.Load:
        const {event, sampleId, props} = state.payload
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
            networkSoilPhotoUploadMachine.fail(`Unsupported file type ${mime}`);
            return
          }
          prepareUpload(mime, data, meta).then(({manifest, owner, payload}) => {
            post(`${UPLOAD_URL}/soil-photo`, {
              owner,
              manifest,
              payload,
            })
              .then((data) => {
                networkSoilPhotoUploadMachine.success();
                networkSoilPhotoUploadMachine.reset()
                updateMetaChannel(data)
              })
              .catch((e) => {
                networkSoilPhotoUploadMachine.fail(e.toString());
                logServerFailure(e, "cebfc614")
              });
          })
        }).catch((e) => {
          networkSoilPhotoUploadMachine.fail(e.toString());
          logFailure("Importing Soil Photo Failed", e)
        })
        break;
      default:
        networkSoilPointsUploadMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});

