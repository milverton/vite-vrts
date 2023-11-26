
import {IFile} from "../components/drop-files/view";
import {getSeasons, isValidNumber, slugify} from "../lib/common";
import {logFailure, logInformation} from "../lib/stores/logging";
import {ImportMetaModel} from "../dashboards/import/model";


export const prepareUpload = (mime: string, data: string, meta?:ImportMetaModel): Promise<{manifest:any, owner: any, payload: any}> => {
  return new Promise((resolve, _) => {
    const manifest = {
      variation: meta?.variation,
      season: meta?.season,
      type: meta?.type,
      status: meta?.status,
      format: meta?.format,
    }
    const owner = {
      dealer: meta?.dealer,
      client: meta?.client,
      block: meta?.block,
      field: meta?.field,
    }
    const payload = {
      overwrite: meta?.overwrite || false,
      mimetype: mime,
      data: data
    }
    resolve({manifest, owner, payload})
  })
}


export const readDroppedFileHandler = (e: any): Promise<{ data: string, mime: string }> => {
  e.preventDefault();
  e.stopPropagation();
  return new Promise((resolve, reject) => {
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {

      const file = e.dataTransfer.files[0];
      const fileType = file.type;

      const reader = new FileReader();
      reader.onload = function (event) {
        const buffer = event.target?.result;
        const base64String = Buffer.from(buffer as ArrayBuffer).toString('base64');

        resolve({data: base64String, mime: fileType})
      }

      reader.onerror = function (event) {
        reject(`File reading has failed: ${event}`);
      }

      reader.readAsArrayBuffer(file);
    }
  });

}


export const readFileHandler = (file: IFile): Promise<{ data: string, mime: string }> => {
  return new Promise((resolve, reject) => {
    if (file === undefined) {
      reject(`File reading has failed: ${file}`);
      return;
    }
      const fileType = file.type;

      const reader = new FileReader();
      reader.onload = function (event) {
        const buffer = event.target?.result;
        const base64String = Buffer.from(buffer as ArrayBuffer).toString('base64');

        resolve({data: base64String, mime: fileType})
      }

      reader.onerror = function (event) {
        reject(`File reading has failed: ${event}`);
      }

      reader.readAsArrayBuffer(file);

  });

}

export const validateMeta = (meta: ImportMetaModel): boolean => {

  // check string matches full year
  const seasons = getSeasons()
  if (!meta.season?.toString().match(/^[0-9]{4}$/)) {
    logFailure("Invalid season", "Season must be a full year")
    return false
  }
  if (!isValidNumber(parseInt(meta.season))) {
    logFailure("Invalid season", "Season must be a number")
    return false
  }
  if (!seasons.includes(parseInt(meta.season))) {
    logInformation("Check season", `Season should be between ${seasons[0]} and ${seasons[seasons.length - 1]}`)
    // return false
  }

  if (slugify(meta.dealer).length === 0) {
    logFailure("Dealer is required", "Dealer is empty, please specify a dealer")
    return false
  }
  if (slugify(meta.client).length === 0) {
    logFailure("Client is required", "Client is empty, please specify a client")
    return false
  }
  if (slugify(meta.block).length === 0) {
    logFailure("Block is required", "Block is empty, please specify a block")
    return false
  }
  // if (!meta.path || meta.path.length === 0) {
  //   logFailure("Path is required", "Please select a file to load")
  //   return false
  // }
  if (slugify(meta.field).length == 0) {
    logFailure("Field is required", "Field is empty, please specify a field")
    return false
  }
  return true
}