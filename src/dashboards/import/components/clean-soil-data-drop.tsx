import {classNames} from "../../../lib/common";
import {useEffect, useState} from "react";
import {constructMeta} from "../transform";
import {DropFileProps} from "../model";

import {StringSelect} from "../../../components/string-select/view";
import DropFiles, {IFile} from "../../../components/drop-files/view";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../../../core/meta";
import {LoadButton} from "../../../components/loading-button/view";
import {validateMeta} from "../../../network/common";
import {LoadingEvent} from "../../../core/machine";
import {networkSoilSamplesUploadMachine} from "../../../network/soil-samples-upload";

export const CleanSoilDataDrop = (props:DropFileProps) => {

  // const horizonMenu = [
  //   {menuName: '0-10', menuType: 'Hor-0'},
  //   {menuName: 'A', menuType: 'Hor-A'},
  //   {menuName: 'B',menuType: 'Hor-B'}
  // ]

  const horizonMenu = [
    {menuName: 'PCT', menuType: MetaRecordFormat.Pct},
  ]

  const [file, setFile] = useState<IFile[]>([])
  const [horizon, setHorizon] = useState(horizonMenu[0])
  const [loading, setLoading] = useState(false)
//  useResetFileHook(setFile)

  const meta = constructMeta(props, MetaRecordType.SoilSamples, MetaRecordStatus.Clean, horizon.menuType, file)

  useEffect(() => {
    const sub = networkSoilSamplesUploadMachine.observer.subscribe({
      next: (x) => {
        if (x.value === LoadingEvent.Success) {
          setLoading(false)
          setFile([])
        }
        if (x.value === LoadingEvent.Failure) {
          setLoading(false)
        }
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, []);
  // meta = constructMeta(props, MetaRecordType.Em, MetaRecordStatus.Raw, MetaRecordFormat.Em1s, file)

  const hasFile = file?.first() !== undefined

  return (
    <div className="m-4 ml-0 p-2">
      <div className="border-r-2 border-gray-100 pr-8">
        <h2 className="text-center text-lg">Clean Soil Samples</h2>
        <p className="text-xs text-center mb-2">Processed soil data</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-dashed border-gray-300", hasFile ? 'bg-yellow-50 border-yellow-500' : 'bg-gray-100')}
          files={file} setFiles={setFile} singleFile={true}/>


        <div className="control-container-col w-46 mt-1">
          <label htmlFor="record-horizon" className="lbl-xs lbl-badge mb-1">Samples Type</label>
          <StringSelect name={'record-horizon'} className='text-sm string-select'
                        menu={horizonMenu}
                        selected={horizon}
                        setSelected={setHorizon}/>

        </div>
        <div className="control-container-col w-46 mt-1">
          <LoadButton label={"Import"} isLoading={loading} onClick={() => {
            setLoading(true)
            const isValid = validateMeta(meta)
            if (!isValid) {
              setLoading(false)
              return
            }

            networkSoilSamplesUploadMachine.service.send({type: LoadingEvent.Load, payload: {event: file.first(),meta: meta}})

          }} activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900'} inactiveClass={'mt-7 p-2 text-normal'} />

        </div>
      </div>

    </div>
  )
}