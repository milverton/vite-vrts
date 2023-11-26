import {logWarning} from "../../lib/stores/logging";
import {post} from "../../core/network";
import {UPLOAD_URL} from "../../lib/stores/soil/model";
import {Meta} from "../../core/meta";
import {updateMetaChannel} from "../../lib/stores/meta/transform";
import {soilPhotosMachine} from "../../lib/stores/soil/store";
import {LoadingEvent} from "../../core/machine";


export const handleSoilPhotoUpload = (e:any, sampleId:string, meta:Meta) => {
  e.preventDefault();
  e.stopPropagation();

  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {

    const file = e.dataTransfer.files[0];
    const fileType = file.type;

    const reader = new FileReader();
    reader.onload = function(event) {
      const buffer = event.target?.result;
      const base64String = Buffer.from(buffer as ArrayBuffer).toString('base64');
      const manifest = {
        variation: sampleId,
        season: meta?.season,
      }
      const owner = {
        dealer: meta?.dealer,
        client: meta?.client,
        block: meta?.block,
        field: meta?.field,
      }
      const payload = {
        overwrite: true,
        mimetype: fileType,
        data: base64String
      }

      post(`${UPLOAD_URL}/soil-photo`, {
        owner,
        manifest,
        payload,
      })
        .then((data) => {
          soilPhotosMachine.reset()
          soilPhotosMachine.service.send(LoadingEvent.Load)
          updateMetaChannel(data)
        })
        // .catch((e) => {
        //   console.error(e)
        //   logServerFailure(e, e.code)
        // });
    };

    reader.onerror = function() {
      logWarning("Importing Soil Photo", "Not implemented")
      console.error("File reading has failed");
    };

    reader.readAsArrayBuffer(file);


  }
}

export const stopPropagation = (e:any) => {
  e.preventDefault()
  e.stopPropagation()
}