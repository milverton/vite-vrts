import {metaClientMachine, metaMachine, metaStore} from "../../lib/stores/meta/store";
import {useEffect, useState} from "react";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";
import {useLoadMachinesState} from "../../core/machine";
import {slugifySnakeCase} from "../../lib/common";
import {Meta, MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../../core/meta";
import {DBMetaGroup} from "../../lib/db.ts";

const getExtension = (meta:Meta) => {
  // const ext = meta.url.split('.').slice(-1)[0];
  if (meta.type === MetaRecordType.Image || meta.type === MetaRecordType.MapImage || meta.type === MetaRecordType.SoilPhoto) {
    return MetaRecordFormat[meta.format].toLowerCase()
  }
  return 'zip'
}

const getFileName = (meta:Meta) => {
  // if (meta.type === MetaRecordType.BulkData) {
  //   return slugify(`${meta.dealer}-${meta.client}-${meta.block}-${meta.field}`) + `.${getExtension(meta)}`
  // }
  const sn = slugifySnakeCase
  const owner = `${sn(meta.dealer)}-${sn(meta.client)}-${sn(meta.block)}-${sn(meta.field)}`
  const manifest = `${sn(MetaRecordType[meta.type])}-${sn(MetaRecordFormat[meta.format])}-${sn(MetaRecordStatus[meta.status])}-${sn(meta.variation)}-${meta.version}-${meta.set_id}-${meta.season}`;
  return owner + '_' + manifest + `.${getExtension(meta)}`
}

const FileDownload = ({meta, index, name}: {meta:Meta, index:number, name:string}) => {
  return (
    <div>
      <a className="ml-2 flex flex-row items-center hover:text-blue-500 hover:underline pb-2"
         href={`http://localhost:3001/api/v1/download/by-uid/${meta.uid}`} download={name} key={index}>
        <ArrowDownTrayIcon className="h-4 w-4"/>
        <span className="ml-2">{name}</span>
      </a>
      <hr className=""/>
    </div>

  )
}
const Export = () => {
  useLoadMachinesState([metaMachine,metaClientMachine])
  const maybeSelectedClient = metaStore.client
  const [metas, setMetas] = useState<Meta[]>([])
  const [selectedClient, setSelectedClient] = useState<DBMetaGroup>()
  useEffect(() => {
    if (maybeSelectedClient.isJust) {
      setSelectedClient(maybeSelectedClient.value)
    }
  }, [maybeSelectedClient])

  useEffect(() => {
    if (selectedClient) {
      const metas = metaStore.metas.filter(m => m.client === selectedClient.client() && m.block === selectedClient.block())
      setMetas(metas)
    }
  }, [selectedClient]);

  if(metas.length === 0){
    return (
      <div className="flex flex-col w-full h-full justify-start items-center text-base mt-16">
        <div className="flex flex-col justify-start space-y-2 text-base bg-gray-100 p-12 rounded">
          <h1 className="flex text-2xl">No client selected</h1>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col w-full h-full justify-start items-center text-base mt-16">
      <div className="flex flex-col justify-start space-y-2 text-base bg-gray-100 p-12 rounded ">
        <h1 className="text-2xl font-bold pb-1">{selectedClient?.client()} - {selectedClient?.block()}</h1>
        <hr className=""/>
        {
          metas.map((meta: Meta, index) => {
            const name = getFileName(meta)
            return (
              <FileDownload key={index + "fd"} name={name} meta={meta} index={index}/>
            )
          })
        }
      </div>
    </div>
  )
}
export default Export