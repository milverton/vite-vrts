import {useEffect, useState} from "react";
import {soilStore,} from "../../lib/stores/soil/store";
import {soilUIDataMachine} from "../soil/store";
import {ChevronDoubleLeftIcon, ChevronDoubleRightIcon} from "@heroicons/react/24/solid";
import {classNames} from "../../lib/common";
import {useDelayedIncrement} from "./hook";
import {stopPropagation} from "./transform";
import {LoadingEvent, useLoadMachineState} from "../../core/machine";
import {metaMachine} from "../../lib/stores/meta/store";
import {boundaryMachine} from "../../lib/stores/boundary/machines";
import {networkSoilPhotoUploadMachine} from "../../network/soil-photo-upload";
import {DropFileProps} from "../import/model";
import {Meta} from "../../core/meta.ts";
import {PhotoReference} from "../../lib/stores/soil/model.ts";



const Photos = () => {
  useLoadMachineState(boundaryMachine)
  useLoadMachineState(metaMachine)
  useLoadMachineState(soilUIDataMachine)

  const soilMeta =  soilStore.data.soilPointsMeta.unwrapOr(null) as Meta | null
  const photoUrls = soilStore.photos.soilPhotoUrls//useAtomValue(soilPhotoUrlsAtom)
  const sampleIds = soilStore.data.soilSampleIds//useAtomValue(soilSampleIdsAtom)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoReference | null>(null)
  const [delayedInc, instantInc, setInc, busy, setBusy] = useDelayedIncrement(sampleIds.length)
  const [keyEvent, setKeyEvent] = useState<any>(null)

  // const [file, setFile] = useState<IFile[]>([])

  useEffect(() => {
    const p = photoUrls[sampleIds[Math.abs(instantInc)]] || null
    setSelectedPhoto(p)
    if (!p) {
      // If no photo, setBusy as false so that the delayedInc can increment
      setBusy(false)
    }
  },[instantInc, sampleIds, photoUrls])

  let props:DropFileProps
  if (soilMeta) {
    props = {dealer: soilMeta.dealer, client: soilMeta.client, block: soilMeta.block, season: soilMeta.season.toString(), field: soilMeta.field, overwrite: true} as unknown as DropFileProps
  }

  // console.log("SOIL META", soilMeta)

  useEffect(() => {
    if (keyEvent?.key === 'ArrowLeft') {
      setInc(delayedInc - 1)
      keyEvent?.preventDefault()
      keyEvent?.stopPropagation()
    }
    if (keyEvent?.key === 'ArrowRight') {
      setInc(delayedInc + 1)
      keyEvent?.preventDefault()
      keyEvent?.stopPropagation()
    }
    // consolkeyEvent?.log("KEY", keyEvent?.key)
    if (keyEvent?.key === ' ') {
      setInc(0)
      keyEvent?.preventDefault()
      keyEvent?.stopPropagation()
    }
  }, [keyEvent])


  useEffect(() => {
    window.addEventListener('keydown', setKeyEvent)
    return () => {
      window.removeEventListener('keydown', setKeyEvent)
    }
  }, [])

  const hasData = sampleIds.length > 0

  return (
    <div className="flex flex-col justify-center items-center m-16 relative">
      <div className={classNames("flex flex-col justify-center items-center sticky top-16 h-26 py-2 pb-3 w-screen bg-gray-200 z-10", "")}>
          <h1 className={classNames("text-xl text-center p-2")}>{sampleIds[Math.abs(delayedInc)] || "PHOTOS"}</h1>
          <div className="flex space-x-4">
            <button onClick={() => setInc(delayedInc - 1)}><ChevronDoubleLeftIcon className="h-7 w-7 hover:text-blue-500" /></button>
            <button onClick={() => setInc(delayedInc + 1)}><ChevronDoubleRightIcon className="h-7 w-7 hover:text-blue-500" /></button>
          </div>
      </div>
      <div className="flex flex-wrap mt-16 z-0">
        {sampleIds.map((sampleId, i) => {
          const photoData = photoUrls[sampleId]
          const hasData = photoData?.url.length > 0
          // if (!hasData) {
          //   return null
          // }
          return (
            <div
              key={'v'+i}
              className={classNames("p-2 mt-4 mr-4 cursor-pointer z-0 transition-transform hover:drop-shadow-2xl hover:scale-110", "rounded", delayedInc === i? "border-gray-400": "")}
              onClick={() => setInc(i)}
              onDragOver={(e) => stopPropagation(e)}
              // onDrop={(e) => import.meta.env.VITE_MODE === 'client' ? () => {} : networkSoilPhotoUploadMachine.service.send(LoadingEvent.Load, {event:e,sampleId,props})}
              onDrop={(e) => networkSoilPhotoUploadMachine.service.send(LoadingEvent.Load, {event:e,sampleId,props})}

            >
              <div className="flex items-center justify-center bg-gray-100 rounded-tr-lg rounded-tl-lg py-2">
                <p className="text-xs font-semibold text-gray-700 text-center">{sampleId}</p>
              </div>
              <img
                key={'photo-uid' + photoData?.uid}
                className={classNames("h-[100px] decoration-0", hasData? "": "w-52")}
                src={photoData?.url}
                height={80}></img>
            </div>
          )
        })}
      </div>
      <div className="flex flex-col justify-start items-center mt-4 mb-2 z-0">
        <img onLoad={() => setBusy(false)} className={classNames("p-4", hasData? "": '', busy? "border-green-600": "border-gray-100")} src={selectedPhoto?.url} ></img>
      </div>
    </div>
  )
}
export default Photos