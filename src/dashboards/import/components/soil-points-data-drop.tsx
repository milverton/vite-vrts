import {useEffect, useState} from "react";
import {classNames} from "../../../lib/common";
import {constructMeta} from "../transform";
import {DropFileProps} from "../model";

import {StringSelect} from "../../../components/string-select/view";
import DropFiles, {IFile} from "../../../components/drop-files/view";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../../../core/meta";
import {LoadButton} from "../../../components/loading-button/view";
import {validateMeta} from "../../../network/common";
import {LoadingEvent} from "../../../core/machine";
import {networkSoilPointsUploadMachine} from "../../../network/soil-points-upload";

export const SoilPointsDataDrop = (props:DropFileProps) => {
  const formatMenu = [{menuName: 'VRTS', menuType: MetaRecordFormat.Vrts}]

  const [file, setFile] = useState<IFile[]>([])
  const [format, setFormat] = useState(formatMenu[0])
  const [loading, setLoading] = useState(false)
  const meta = constructMeta(props, MetaRecordType.SoilPoints, MetaRecordStatus.Raw, format.menuType, file)
//  useResetFileHook(setFile)

  useEffect(() => {
    const sub = networkSoilPointsUploadMachine.observer.subscribe({
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

  const hasFile = file?.first() !== undefined

  return (
    <div className="m-4 ml-0 p-2">
      <div className="border-r-2 border-gray-100 pr-8">
        <h2 className="text-center text-lg">Soil Points</h2>
        <p className="text-xs text-center mb-2">Import id, lon, lat</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-dashed border-gray-300", hasFile ? 'bg-fuchsia-50 border-fuchsia-500' : 'bg-gray-100')}
          files={file} setFiles={setFile} singleFile={true}/>

        <div className="control-container-col w-46 mt-1">
          <label htmlFor="record-format" className="lbl-xs lbl-badge mb-1">Format</label>
          <StringSelect name={'record-format'} className='text-sm string-select'
                        menu={formatMenu}
                        selected={format}
                        setSelected={setFormat}/>
        </div>
        {/*<div className="control-container-empty"></div>*/}
        <div className="control-container-col w-46 mt-1">
          <LoadButton label={"Import"} isLoading={loading} onClick={() => {
            setLoading(true)
            const isValid = validateMeta(meta)
            if (!isValid) {
              setLoading(false)
              return
            }

            networkSoilPointsUploadMachine.service.send({type: LoadingEvent.Load, payload: {event: file.first(),meta: meta}})

          }} activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900'} inactiveClass={'mt-7 p-2 text-normal'} />

        </div>
      </div>
    </div>
  )
}