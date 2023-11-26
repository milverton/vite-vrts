import {useState} from "react";
import {classNames} from "../../../lib/common";
import {DropFileProps} from "../model";
import {StringSelect} from "../../../components/string-select/view";
import DropFiles, {IFile} from "../../../components/drop-files/view";
import {MetaRecordFormat} from "../../../core/meta";


export const ArchiveDrop = (_:DropFileProps) => {
  const formatMenu = [{menuName: 'Raw EM/GR', menuType: MetaRecordFormat.Emgr}]

  const [file, setFile] = useState<IFile[]>([])
  const [format, setFormat] = useState(formatMenu[0])
//  useResetFileHook(setFile)

  // const meta = constructMeta(props, MetaRecordType.BulkData, MetaRecordStatus.Raw, format.menuType, file)

  const hasFile = file?.first()?.path.length > 0
  return (
    <div className="m-4 ml-0 p-2">
      <div className="border-r-2 border-gray-100 pr-8">
        <h2 className="text-center text-lg">Bulk Data</h2>
        <p className="text-xs text-center mb-2 text-gray-500">Unprocessed bulk data</p>
        <DropFiles
          className={classNames("flex min-h-[10em] items-center justify-center rounded-md w-44 border-2 border-gray-300", hasFile ? 'bg-red-100 border-red-500' : 'bg-gray-100')}
          files={file} setFiles={setFile} singleFile={true}/>

        <div className="control-container-col w-46 mt-1">
          <label htmlFor="record-format" className="lbl-xs lbl-badge mb-1">Format</label>
          <StringSelect name={'record-format'} className='text-sm string-select'
                        menu={formatMenu}
                        selected={format}
                        setSelected={setFormat}/>
        </div>
        {/*<div className="control-container-empty"></div>*/}
        {/*<div className="control-container-col w-46 mt-1">*/}
        {/*  <button className={classNames("mt-7 text-normal p-2 bg-white border-gray-300 border-1 rounded hover:bg-gray-50", hasFile ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white text-gray-500')}*/}
        {/*          onClick={() => doUpload(meta).then(() => setFile([]))}>Import*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}