import {Fragment, useEffect, useRef, useState} from "react";
import {CircleMarker, Popup, Tooltip} from "react-leaflet";
import {classNames} from "../../../lib/common";
import {getColorForSoilSample, latLngToPoint} from "../transform";
import {soilUIStore} from "../store";
// @ts-ignore
import {just} from "true-myth/maybe";
import {PointColorMenu, SelectedPoint} from "../model";
import {soilStore} from "../../../lib/stores/soil/store";
import PhotoModal from "./photo";
import {statsUISharedStateMachine, uiSharedState} from "../../stats/store";
import {useLoadMachinesState, useLoadMachineStateWithUpdate} from "../../../core/machine";
import {PhotoReference} from "../../../lib/stores/soil/model.ts";

const DataRow = ({header, row}: {header: any, row: any}) => {

  return (
    row.map((value: any, i: number) => {
      return (
        <div key={'ssd' + i} className="hover:bg-blue-200 rounded px-2 text-black flex flex-row justify-between w-48">
          <div className="text-gray-700 mr-4">{header[i]}:</div><div>{value}</div>
        </div>
      )
    })
  )
}

const PopupContent = ({sampleId, header, row, photoUrl}: {sampleId: string, header: any, row: any, photoUrl:string}) => {
  const [open, setOpen] = useState(false)
  return (
    <Popup key={sampleId + 'p'} >
      <div className="flex flex-col text-xs">
        <h2 className={classNames("text-center p-2 text-base text-gray-800")}>{sampleId}</h2>
        <DataRow header={header} row={row}/>
        <PhotoModal photoUrl={photoUrl} open={open} setOpen={setOpen} />
        <button className={classNames("btn mt-2", photoUrl? 'pastel-blue-button': 'btn-disabled')} onClick={() => photoUrl ? setOpen(!open) : ""}>{photoUrl ? "Show Photo" : "No Photo"}</button>
      </div>
    </Popup>
  )
}

const useTooltipHandler = (sampleId: string, onClick: (arg0: any) => any) => {
  const ref = useRef<any>(null)
  const [sub,setSub] = useState(0)
  const handleTooltipClick = () => onClick(sampleId)
  useEffect(() => {
    // console.log('tooltip without data', sampleId, ref?.current)

    if (ref.current) {
      const el = ref.current.getElement()
      if (!el) return
      el.style.pointerEvents = 'auto';
      el.addEventListener('click', handleTooltipClick)
      // console.log('adding event listener', sampleId)
      return () => {
        // console.log('removing event listener', sampleId)
        el.removeEventListener('click', handleTooltipClick);
      }
    }
    return () => {

    }
  }, [ref?.current, sampleId, sub])

  // On initial render, tooltip will not mount. Terrible hack, but it is the only solution I could find.
  useEffect( () => {

    const i = setInterval(() => {
      if (ref.current) {
        setSub(sub + 1)
        clearInterval(i)
      }
    }, 100)
    return () => {
      clearInterval(i)
    }
  }, [])
  return ref
}

const TooltipWithData = ({active,onClick,sampleId, hasPhoto, columnData, header}: {active: boolean, onClick: any, sampleId: string, hasPhoto: PhotoReference, columnData: any, header: any}) => {
  // const selectedPointColor = PointColorMenu[soilUIStore.toolbarState.selectedPointColor].menuName.toLowerCase()
  const ref = useTooltipHandler(sampleId, onClick)

  return (
    <Tooltip ref={ref} key={sampleId + 'td' + active} direction="right" opacity={1} permanent className={classNames('bg-gray-700', active? 'border-solid border-4': '')}>
        <span  className={classNames('text-xs', active? '': '')} onClick={() => onClick(sampleId)}>
          <div className={classNames("font-bold", hasPhoto? 'text-blue-400': 'text-gray-100')}>{sampleId}</div>
          {columnData.map((v:any,i:number) => <div key={'cdm' + i} style={{color: getColorForSoilSample(header,v, '#f3f4f6')}}>{v}</div>)}
        </span>

    </Tooltip>
  )
}
const TooltipWithoutData = ({active,onClick,sampleId, hasPhoto}: {active: boolean, onClick: any, sampleId: string, hasPhoto: PhotoReference}) => {
  const ref = useTooltipHandler(sampleId, onClick)

  return (
    <Tooltip
      ref={ref}
      pane="tooltipPane"
      interactive={true}
      key={sampleId + 't' + active}
      className={
      classNames("text-xs bg-gray-700", hasPhoto? 'text-blue-400': 'text-gray-100', active? 'border-solid border-4': '')}
      direction="right"
      opacity={1}
      permanent>
      <span>{sampleId}</span>
    </Tooltip>
  )
}
const TooltipContent = ({active,onClick,sampleId, hasPhoto, columnData, header}: {active: boolean, onClick: any, sampleId: string, hasPhoto: PhotoReference, columnData: any, header: any}) => {

  return (
    columnData.length > 0 ?
      <TooltipWithData active={active} onClick={onClick} sampleId={sampleId} hasPhoto={hasPhoto} columnData={columnData} header={header} /> :
      <TooltipWithoutData active={active} onClick={onClick} sampleId={sampleId} hasPhoto={hasPhoto} />
  )
}
const _onPointSelected = (sid: any, idx: number, point: any, onPointSelected: any) => {

  return (_sampleId: any) => {
    let e = {latlng: point, target: {options: {sampleId: sid, rowIndex: idx}}}
    onPointSelected(e)
  }
}
const PointsOverlay = ({show}: {show: boolean}) => {
  // const [_,update] = useLoadMachineStateWithUpdate(statsUISharedStateMachine)
  useLoadMachinesState([statsUISharedStateMachine])
  const latlng = soilUIStore.soilDataState.selectedHorizonDataPoints
  const sampleIds = soilStore.data.soilSampleIds
  const soilData = soilUIStore.soilDataState.selectedHorizonData
  const soilPhotoUrls = soilStore.photos.soilPhotoUrls
  const selectedPointColor = PointColorMenu[soilUIStore.toolbarState.selectedPointColor].menuName.toLowerCase()
  const selectedDataColumn = soilUIStore.soilDataState.selectedColumnData
  const pointColor = PointColorMenu[soilUIStore.toolbarState.pointColor].menuName.toLowerCase()
  const header = soilUIStore.toolbarState.selectedSoilHeaderName
  // const [selectedPoint, setSelectedPoint] = [uiSharedState.soilUISelectedPointAtom, update]

  if (!show) return null
  // console.log("SELECTED COLUMN DATA", selectedDataColumn)
  // const onPointSelected = (e:any) => setSelectedPoint(just({point: latLngToPoint(e.latlng), latlng: e.latlng, sampleId: e.target.options.sampleId, rowIndex: e.target.options.rowIndex} as SelectedPoint))

  // these are not in sync when atoms are reset so rendering fails
  if (!latlng.length || !sampleIds.length) {
    return null
  }


  return (<div></div>)


  // return (
  //   <Fragment>
  //     {latlng.map((point, i) => {
  //       const sampleId = sampleIds[i]
  //       const hasPhoto = soilPhotoUrls[sampleId]
  //       const pointsIndex = i
  //
  //
  //       // TODO: add point selection function
  //
  //       // these options server two purposes: 1, to set values for leaflet and 2, to pass values to callback when clicked
  //       let opts = {color: pointColor, fillColor: pointColor, fillOpacity: 1, radius: 8, sampleId: sampleId, rowIndex: pointsIndex, active:false}
  //
  //       if (selectedPoint.isJust) {
  //         // change color if point is selected
  //         if (selectedPoint.value.sampleId === sampleId) {
  //           opts = {
  //             color: selectedPointColor,
  //             fillColor: selectedPointColor,
  //             fillOpacity: 1,
  //             radius: 12,
  //             sampleId: sampleId,
  //             rowIndex: pointsIndex,
  //             active: true
  //           }
  //         }
  //       }
  //
  //       return <CircleMarker
  //         interactive={true}
  //         // eventHandlers={{click: onPointSelected}}
  //         pathOptions={opts}
  //         // zIndex={10}
  //         pane={'markerPane'}
  //         key={'cm' + i} center={point}>
  //         <TooltipContent active={opts.active} onClick={_onPointSelected(sampleId, pointsIndex, point, onPointSelected)} sampleId={sampleId} hasPhoto={hasPhoto} columnData={selectedDataColumn.columnData[pointsIndex] || []} header={header} />
  //         <PopupContent sampleId={sampleId} header={soilData.head} row={soilData.body[pointsIndex] || []} photoUrl={soilPhotoUrls[sampleId]?.url}/>
  //       </CircleMarker>
  //     })}
  //   </Fragment>
  // )
}

export default PointsOverlay