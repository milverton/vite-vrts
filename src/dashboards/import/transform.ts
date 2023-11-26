import {logWarning} from "../../lib/stores/logging";
import {ImportMetaModel, DropFileProps} from "./model";
// @ts-ignore
import {just} from "true-myth/maybe";
import {IFile} from "../../components/drop-files/view";
import {validateMeta} from "../../network/common";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType, toSnakeCase} from "../../core/meta";

export const doUpload = (meta:ImportMetaModel): Promise<boolean> => {
  const isValid = validateMeta(meta)

  return new Promise<boolean>((_, reject) => {
    if (!isValid) {
      reject('Invalid meta')
      return
    }
    logWarning("Upload", "Not implemented")
    // post(`http://localhost:3000/api/v1/import`, {
    //   ...meta,
    //   uid: uidGenerator(),
    // })
    //   .then((data) => {
    //     const result = updateMetaChannel(data)
    //     if (result.isOk) {
    //       logSuccess("Import Succeeded", `Imported ${meta.path} into ${meta.client} ${meta.block}`)
    //       // FIXME: createGroupBy
    //       const nextClient = createGroupByWithSeason(meta.dealer, meta.client, meta.block, meta.season)
    //
    //       metaNextClientMachine.service.send({type: LoadingEvent.Update, payload: nextClient})
    //       resolve(data)
    //     }
    //     if (result.isErr) {
    //       logServerFailure(result.error, '54610ee9')
    //       reject(result.error)
    //     }
    //   })
    //   .catch((error) => {
    //     reject(error)
    //   })

  })
}

export const constructMeta = (props: DropFileProps, type: MetaRecordType, status: MetaRecordStatus, format: MetaRecordFormat, file: IFile[] | null, variation: string = "na"): ImportMetaModel => {
  return <ImportMetaModel><unknown>{
    season: props.season,
    dealer: props.dealer,
    client: props.client,
    block: props.block,
    field: props.field,
    format: toSnakeCase(MetaRecordFormat[format]),
    type: toSnakeCase(MetaRecordType[type]),
    status: toSnakeCase(MetaRecordStatus[status]),
    variation: variation,
    path: file?.first()?.path,
    overwrite: props.overwrite,
    remote: false,
    flagged: false,
    archived: false,
    modified: new Date().toISOString(),
    created: new Date().toISOString(),
    modifiedBy: "System",
    createdBy: "System",
  }
}
// const meta = {
//   // ...constructMeta(props),
//   season: props.season,
//   dealer: props.dealer,
//   client: props.client,
//   block: props.block,
//   format: format.menuType.toLowerCase(),
//   type: 'soil-points',
//   status: 'raw',
//   path: file?.first()?.path,
//   overwrite: props.overwrite,
//   remote: false,
//   flagged: false,
//   archived: false,
//   modified: new Date().toISOString(),
//   created: new Date().toISOString(),
//   modifiedBy: "System",
//   createdBy: "System",
// }