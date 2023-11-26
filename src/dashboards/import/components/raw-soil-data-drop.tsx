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
import {networkSoilRawUploadMachine} from "../../../network/soil-raw-upload";

export const RawSoilDataDrop = (props:DropFileProps) => {
  const formatMenu = [{
    menuName: 'CSBP', menuType: MetaRecordFormat.Csbp},
    {menuName: 'APAL', menuType: MetaRecordFormat.Apal},
    // {menuName: 'PCTV', menuType: MetaRecordFormat.Pctv}
  ]

  const [file, setFile] = useState<IFile[]>([])
  const [format, setFormat] = useState(formatMenu[0])
  const [loading, setLoading] = useState(false)
//  useResetFileHook(setFile)

  const meta = constructMeta(props, MetaRecordType.SoilSamples, MetaRecordStatus.Raw, format.menuType, file)

  useEffect(() => {
    const sub = networkSoilRawUploadMachine.observer.subscribe({
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
      <div className="border-r-2 border-gray-100 pr-8 border-">
        <h2 className="text-center text-lg">Raw Soil Data</h2>
        <p className="text-xs text-center mb-2">Raw CSBP, APAL or PCTV</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-dashed border-gray-300", hasFile ? 'bg-cyan-50 border-cyan-500' : 'bg-gray-100')}
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

            networkSoilRawUploadMachine.service.send({type: LoadingEvent.Load, payload: {event: file.first(),meta: meta}})

          }} activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900'} inactiveClass={'mt-7 p-2 text-normal'} />

        </div>
      </div>

    </div>
  )
}