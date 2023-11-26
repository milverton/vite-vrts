import {classNames} from "../../../lib/common";
import {useEffect, useState} from "react";
import {constructMeta} from "../transform";

import {StringSelect} from "../../../components/string-select/view";
import DropFiles, {IFile} from "../../../components/drop-files/view";
import {DropFileProps} from "../model";
import {LoadingEvent} from "../../../core/machine";
import {networkBoundaryUploadMachine} from "../../../network/boundary-upload";
import {LoadButton} from "../../../components/loading-button/view";
import {validateMeta} from "../../../network/common";
import {MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../../../core/meta";

export const BoundaryDrop = (props: DropFileProps) => {
  // const stateMenu = enumToMenu(DBRecordState)
  // {menuName: 'VRT', menuType: 'vrt'}
  const boundaryMenu = [{menuName: '[SHP] All', menuType:  MetaRecordFormat.AllFieldsShp}, {menuName: '[SHP] Individual', menuType: MetaRecordFormat.IndividualFieldsShp}]
  const [file, setFile] = useState<IFile[]>([])
  const [boundary, setBoundary] = useState(boundaryMenu[0])
  const [loading, setLoading] = useState(false)

//  useResetFileHook(setFile)

  const meta = constructMeta(props, MetaRecordType.Boundary, MetaRecordStatus.Raw, boundary.menuType, file)

  const hasFile = file?.first() !== undefined
  useEffect(() => {
    const sub = networkBoundaryUploadMachine.observer.subscribe({
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
  return (
    <div className="m-4 ml-0  p-2">
      <div className="border-r-2 border-gray-100 pr-8">
        <h2 className="text-center text-lg">Boundary</h2>
        <p className="text-xs text-center mb-2">Boundary file as SHP or KML</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-dashed border-gray-300", hasFile ? 'bg-blue-50 border-blue-500' : 'bg-gray-100')}
          files={file} setFiles={setFile} singleFile={true}/>
        <div className="control-container-col w-46 mt-1">
          <label htmlFor="boundary" className="lbl-xs lbl-badge mb-1">Boundary Type</label>
          <StringSelect name={'boundary'} className='text-sm string-select'
                        menu={boundaryMenu}
                        selected={boundary}
                        setSelected={setBoundary}/>
        </div>
        <div className="control-container-col w-46 mt-1">
          <LoadButton label={"Import"} isLoading={loading} onClick={() => {
            setLoading(true)
            const isValid = validateMeta(meta)
            if (!isValid) {
              setLoading(false)
              return
            }
            networkBoundaryUploadMachine.service.send({type: LoadingEvent.Load, payload: {event: file.first(),meta: meta}})
          }} activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900'} inactiveClass={'mt-7 p-2 text-normal'} />

        </div>
      </div>
    </div>

  )
}