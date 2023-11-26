import {classNames} from "../../../lib/common";
import {useEffect, useState} from "react";
import {constructMeta} from "../transform";
import {DropFileProps, ImportMetaModel} from "../model";

import {StringSelect} from "../../../components/string-select/view";
import DropFiles, {IFile} from "../../../components/drop-files/view";
import {LoadingEvent, useLoadMachineState} from "../../../core/machine";
import {boundaryMachine} from "../../../lib/stores/boundary/machines";
import {LoadButton} from "../../../components/loading-button/view";
import {networkEmGrUploadMachine} from "../../../network/emgr-upload";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../../../core/meta";
import {validateMeta} from "../../../network/common";

export const EMGRDrop = (props:DropFileProps) => {
  useLoadMachineState(boundaryMachine)


  const emgrMenu = [
    {menuName: 'Em1S Raw', menuType: 'em1s-raw'},
    {menuName: 'Em1S Clean', menuType: 'em1s-clean'},
    {menuName: 'Em21S Raw', menuType: 'em21s-raw'},
    {menuName: 'Em21S Clean', menuType: 'em21s-clean'},
    {menuName: 'Gr Raw', menuType: 'gr-raw'},
    {menuName: 'Gr Clean', menuType: 'gr-clean'}
  ]

  const [file, setFile] = useState<IFile[]>([])
  const [emgr, setEmgr] = useState(emgrMenu[0])
  const [loading, setLoading] = useState(false)
//  useResetFileHook(setFile)

  let meta:ImportMetaModel;
  switch (emgr.menuType) {
    case 'em1s-raw':
      meta = constructMeta(props, MetaRecordType.Em, MetaRecordStatus.Raw, MetaRecordFormat.Em1s, file)
      break;
    case 'em1s-clean':
      meta = constructMeta(props, MetaRecordType.Em, MetaRecordStatus.Clean, MetaRecordFormat.Em1s, file)
      break;
    case 'em21s-raw':
      meta = constructMeta(props, MetaRecordType.Em, MetaRecordStatus.Raw, MetaRecordFormat.Em21s, file)
      break;
    case 'em21s-clean':
      meta = constructMeta(props, MetaRecordType.Em, MetaRecordStatus.Clean, MetaRecordFormat.Em21s, file)
      break;
    case 'gr-raw':
      meta = constructMeta(props, MetaRecordType.Gr, MetaRecordStatus.Raw, MetaRecordFormat.GrTerrestrial, file)
      break;
    case 'gr-clean':
      meta = constructMeta(props, MetaRecordType.Gr, MetaRecordStatus.Clean, MetaRecordFormat.GrTerrestrial, file)
      break;

  }

  // meta.boundaryId = boundaryStore?.meta?.uid
  // meta.field = 'All'

  const hasFile = file?.first() !== undefined

  useEffect(() => {
    const sub = networkEmGrUploadMachine.observer.subscribe({
      next: (x) => {
        if (x.event.type === LoadingEvent.Success) {
          setLoading(false)
          setFile([])
        }
        if (x.event.type === LoadingEvent.Failure) {
          setLoading(false)
        }
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, []);

  return (
    <div className="m-4 ml-0 p-2">
      <div className="border-r-2 border-gray-100 pr-8">
        <h2 className="text-center text-lg">EM/GR</h2>
        <p className="text-xs text-center mb-2">Processed EM or GR data</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-dashed border-gray-300", hasFile ? 'bg-green-100 border-green-500' : 'bg-gray-100')}
          files={file} setFiles={setFile} singleFile={true}/>

        <div className="control-container-col w-46 mt-1">
          <label htmlFor="boundary" className="lbl-xs lbl-badge mb-1">Type</label>
          <StringSelect name={'boundary'} className='text-sm string-select'
                        menu={emgrMenu}
                        selected={emgr}
                        setSelected={setEmgr}/>
        </div>
        <div className="control-container-col w-46 mt-1">
          <LoadButton label={"Import"} isLoading={loading} onClick={() => {
            setLoading(true)
            const isValid = validateMeta(meta)
            if (!isValid) {
              setLoading(false)
              return
            }

            networkEmGrUploadMachine.service.send({type: LoadingEvent.Load, payload: {event: file.first(),meta: meta}})

          }} activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900'} inactiveClass={'mt-7 p-2 text-normal'} />

        </div>
      </div>
    </div>

  )
}