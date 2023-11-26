import {classNames} from "../../lib/common";
import React, {useState} from "react";
import {logFailure} from "../../lib/stores/logging";

export interface IFile extends File {
  path: string
}

const handleDropSingleFile = (event: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: string | any[]; }; }, setFile: (file: IFile[]) => void) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer.files.length > 1) {
    logFailure("Too many files", "Please select only one file")
    return false
  }
  const file = event.dataTransfer.files[0]
  setFile([file])
}

const handleDropMultipleFiles = (event: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: any; }; }, setFile: (file: IFile[]) => void) => {
  event.preventDefault()
  event.stopPropagation()

  const file = event.dataTransfer.files
  const files = []
  for (let f of file) {
    files.push(f)
  }
  setFile(files)
}

const trim = (str: string, len: number) => {
  if (str && str.length > len) {
    return str.slice(0, len) + '...'
  }
  return str
}
export const useDropHook = ({setFile, singleFile} : {setFile: (files:IFile[]) => void, singleFile:boolean}) => {
  const handler = singleFile ? handleDropSingleFile : handleDropMultipleFiles
  const [isDropped, setIsDropped] = useState(false)
  const onDragOver = (event: { preventDefault: () => void; stopPropagation: () => void; }) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDropped(true)
  }
  const onDragLeave = (event: { preventDefault: () => void; stopPropagation: () => void; }) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDropped(false)
  }
  const onDrop = (event: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: string | any[]; }; }) => {
    handler(event, setFile)
    setIsDropped(false)
  }
  return {isDragOver: isDropped, onDragOver, onDragLeave, onDrop}
}

const DropFiles = (props: { setFiles: (files: IFile[]) => void, className: string, files: IFile[], singleFile: boolean }) => {
  const {onDragOver, onDragLeave, onDrop} = useDropHook({
    setFile: props.setFiles,
    singleFile: props.singleFile
  })
  const name = props.singleFile ? trim(props.files.first()?.name, 100) : props.files?.length

  return (
    <div
      className={classNames(props.className, !props.files ? 'border-solid' : 'border-dashed')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEndCapture={onDragLeave}
      // @ts-ignore
      onDrop={onDrop}
    >
      {!props.files ?
        <p className="text-center p-2 break-words text-sm">DROP HERE</p>
        :
        <p className="break-words text-center p-2 text-sm text-gray-600">{name}</p>
      }
    </div>
  )

}
export default DropFiles;


export const DropFilesContainer = (props: {children:React.ReactNode, setFiles: (files: IFile[]) => void, className: string, files: IFile[], singleFile: boolean }) => {
  const {onDragOver, onDragLeave, onDrop} = useDropHook({
    setFile: props.setFiles,
    singleFile: props.singleFile
  })

  return (
    <div
      className={classNames(props.className)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragEndCapture={onDragLeave}
      // @ts-ignore
      onDrop={onDrop}
    >{props.children}</div>
  )

}