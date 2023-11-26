// import {MapLayerSelection} from "../model";
// import {LoadingEvent, useLoadMachineState} from "../../../core/machine";
// import {useEffect, useState} from "react";
// import {mapStore, mapStoreInputsMachine} from "../store";
// import {Layer} from "./map-layer";
// import {NumberInput} from "../../../components/number-input/view";
// import {metaClientMachine, metaStore} from "../../../lib/stores/meta/store";
// import {createUrlForCsv} from "../../../lib/downloads";
// import {paletteHandler, rgbToHex} from "../../../lib/palette";
// import {XMarkIcon} from "@heroicons/react/24/outline";
// import {slugify} from "../../../lib/common";
//
//
// export const SelectedSitesLayer = ({fn, toggle}: { fn: MapLayerSelection, toggle: (id: string) => void }) => {
//   const mtTime = useLoadMachineState(metaClientMachine)
//
//   const [siteID, setSiteID] = useState('NC')
//   const [filename, setFilename] = useState('soil-points.csv')
//   const [pointSize, setPointSize] = useState(mapStore.mapLayerInputsState.potentialSitesPointSize)
//
//   useEffect(() => {
//     if (metaStore.client.isJust) {
//       const c = metaStore.client.value
//       const n = `${c.block()}`.split(' ').map(s => s.match(/[A-Z]/g)).join('')
//       setSiteID(n)
//
//       setFilename(slugify(`${c.name}-soil-points`) + '.csv')
//     }
//   }, [mtTime])
//
//   useEffect(() => {
//     mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {siteID: siteID}})
//   }, [siteID])
//
//   useEffect(() => {
//     mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {selectedSitesPointSize: pointSize}})
//   }, [pointSize])
//
//
//
//
//
//   const pHandler = paletteHandler(toolStore.paletteState.selectedPalette)
//   return (
//     <Layer fn={fn} toggle={toggle}>
//       {
//         fn.active ?
//           <div className="flex flex-col space-y-3">
//             <div className="lbl-ring-outer">
//               <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Site ID</label>
//               <input className="w-full m-auto rounded border-gray-100" type={"text"} name={"ssid"} value={siteID}
//                      onChange={(e) => setSiteID(e.target.value)}/>
//               <button className={'link text-left text-sm text-blue-500'}
//                       onClick={() => createUrlForCsv(toolStore.siteSelectionState.siteSelectionCsv.csv, filename)}>{filename}</button>
//             </div>
//             <div className="lbl-ring-outer">
//               <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Point Size</label>
//               <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'pointSize'} name={'pointSize'} min={0} max={100} step={0.1} selected={pointSize} setSelected={setPointSize} />
//             </div>
//             <div className="lbl-ring-outer">
//               <label htmlFor="point-size" className="lbl-sm lbl-ring-inner">Selected</label>
//               <div className="flex flex-col space-y-2">
//
//                 {toolStore.siteSelectionState.siteSelectionsSorted.map((s, i) => {
//                   const site = toolStore.siteSelectionState.siteSelectionsSorted[i]
//                   const rgb = pHandler(site.bin)
//                   const hex = rgbToHex(rgb)
//                   const square = <div key={'ha' + i} className="inline-block p-2"
//                                       style={{'backgroundColor': `${hex}`}}/>
//                   return (
//                     <div key={'ssl' + i} className="flex space-x-2">
//                       {square}
//                       <div className="text-xs w-1/4 text-gray-300">Z{site.bin + 1}</div>
//                       <div className="text-xs w-2/4">{site.value}</div>
//                       <div className="text-xs w-1/4 text-red-300 hover:text-red-700"
//                            onClick={() => onRemoveSiteSelection(s)}><XMarkIcon className="h-4 w-4"/></div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           </div>
//           : null
//       }
//
//     </Layer>
//
//   )
//
// }