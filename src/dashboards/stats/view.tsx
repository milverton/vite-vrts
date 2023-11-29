import {useEffect, useState} from "react"
import {
  statsDataMachine,
  statsRegressionMachine,
  statsRegressionOutliersMachine,
  statsStore,
  statsUISharedStateMachine
} from "./store";
import {fusionMachine, fusionStore} from "../../lib/stores/fusion/store";

import StatsToolbar from "./components/toolbar";
import {GoogleChart} from "./components/chart";
import RegressionTable from "./components/regression-table";
import RankingTable from "./components/ranking-table";
import {RegressionResult, RegressionResultEntry, StatsRegressionTypesMenu} from "./model";
import {mean, round} from "../../lib/stats";

import {SoilHorizonsMenu} from "../soil/model";
import {useLoadMachinesState, useLoadMachineStateWithUpdate} from "../../core/machine";
import {slugify} from "../../lib/common";
import {regressionResultEntryToReportItem} from "./transform";
import {logFailure} from "../../lib/stores/logging";

// @ts-ignore
import {Err, err, Ok, ok, Result} from "true-myth/result";
import {drawBoundaries, drawFixedSizeCoordinates, drawSoilPoints} from "../map/transform";
import {boundaryStore} from "../../lib/stores/boundary/store";
import MapView from "../map/view";
import CheapRuler, {Point} from "cheap-ruler";
import {csvHasData, ICsv} from "../../lib/csv";

import {CsvType} from "../../core/model";

// const updateRegressionForReportItem = (item:ReportItem) => {
//   const xIdx = statsStore.xyState.xData.head.indexOf(item.x)
//   const yIdx = statsStore.xyState.yData.head.indexOf(item.y)
//   const regressionIdx = StatsRegressionTypesMenu.findIndex((r) => r.menuName.toLowerCase() === item.regression)
//   statsUIForXYDataMachine.service.send({type: LoadingEvent.Update, payload:{selectedXVar: xIdx, selectedYVar: yIdx}})
//   statsUIForRegressionsMachine.service.send({type: LoadingEvent.Update, payload:{selectedRegression: regressionIdx}})
// }

// const toNumber = (x:number) => isNaN(x)? 0: x
const RegressionSummary = ({regression, title}: { regression: RegressionResult, title: string }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl text-center">{title} R<sup>2</sup></h2>
      <h3 className="text-base">{round(regression.r2, 2)}</h3>
    </div>
  )
}

const RegressionSummaries = ({result}: { result: RegressionResultEntry | null }) => {

  if (!result?.results) {
    return <></>
  }
  const regressions = result.results
  return (
    <div className="flex flex-row items-center justify-evenly p-4 border-b-2 border-gray-100 mt-16">
      <RegressionSummary regression={regressions.linear} title="Linear"/>
      <RegressionSummary regression={regressions.polynomial} title="Polynomial"/>
      <RegressionSummary regression={regressions.exponential} title="Exponential"/>
    </div>
  )
}
// const createHeaders = (headers: string[]) => {
//   return headers.map((h, i) => {
//     return (
//       <th
//         key={slugify(h) + i.toString()}
//         scope="col"
//         className={classNames("whitespace-nowrap text-left text-gray-700 font-bold py-2")}
//       >
//         {h}
//       </th>
//     )
//   })
// }

// const Title = ({idx,title, className}: {idx:number, title: string, className?: string }) => {
//   const titles = ['Potash', 'Lime', 'Gypsum', 'Phosphorus']
//   const [t, setT] = useState(title)
//   const [ts, setTs] = useState(0)
//   const [saved, setSaved] = useState(true)
//   const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout | null>()
//   // const t = statsStore.reportState.reportItems[idx].title
//
//   const handleKeyDown = (event: { key: string; }) => {
//     if (event.key === 'Enter') {
//       // 👇 Get input value
//       statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'title',value:t,idx }]})
//       setSaved(true)
//       setTs(0)
//       if (currentTimeout) {
//         clearTimeout(currentTimeout)
//       }
//       setCurrentTimeout(null)
//     }
//   }
//
//   const update = (t:string) => {
//     setT(t)
//     setTs(Date.now())
//     setSaved(false)
//   }
//
//   useEffect(() => {
//     if (ts > 0 && !saved) {
//       if (currentTimeout) {
//         clearTimeout(currentTimeout)
//       }
//       const timeout = setTimeout(() => {
//         statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'title',value:t,idx}]})
//         setSaved(true)
//         setTs(0)
//         setCurrentTimeout(null)
//       }, 5000)
//       setCurrentTimeout(timeout)
//     }
//   }, [ts])
//
//   return (
//     <div className="control-container-col">
//       <input name="season" className={classNames(className, !saved? 'text-red-500': 'text-black')} type="text" list="titles"
//              value={t} onKeyDown={handleKeyDown} onChange={(e) => update(e.target.value)}/>
//       <datalist id="titles">
//         {titles.map((title, idx) => {
//           return (
//             <option className="bg-white text-gray-700" key={idx}>{title}</option>
//           )
//         })}
//       </datalist>
//     </div>
//   )
// }

// const X = ({idx,item,x, className}: {idx:number, item:ReportItem, x: string, className?: string }) => {
//   const menu = statsStore.xyState.xData.head.map((h, i) => ({menuName: h, menuType: i}))
//   const update = (x:string) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'x',value:x,idx }]})
//     const _item = {...item, x: x}
//     updateRegressionForReportItem(_item)
//   }
//   const selected = menu.find((m) => m.menuName === x)
//   if (!selected) {
//     return <></>
//   }
//   return <StringSelect name={'x'} className={className} menu={menu} selected={selected} setSelected={(e) => update(e.menuName)}/>
//
// }

// const Y = ({idx,item,y, className}: {idx:number, item:ReportItem,y: string, className?: string }) => {
//   const menu = statsStore.xyState.yData.head.map((h, i) => ({menuName: h, menuType: i}))
//   const update = (y:string) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'y',value:y,idx }]})
//     const _item = {...item, y: y}
//     updateRegressionForReportItem(_item)
//   }
//   const selected = menu.find((m) => m.menuName === y)
//   if (!selected) {
//     return <></>
//   }
//   return <StringSelect name={'y'} className={className} menu={menu} selected={selected} setSelected={(e) => update(e.menuName)}/>
// }
//
// const Regression = ({idx,item,regression, className}: {idx:number, item:ReportItem,regression: string, className?: string }) => {
//   const menu = StatsRegressionTypesMenu.map(x => ({menuName: x.menuName.toLowerCase(), menuType: x.menuType}))
//   const update = (regression:string) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'regression',value:regression,idx }]})
//     const _item = {...item, regression: regression}
//     updateRegressionForReportItem(_item)
//   }
//   const selected = menu.find((m) => m.menuName === regression) || menu[0]
//   return <StringSelect name={'regression'} className={className} menu={menu} selected={selected} setSelected={(e) => update(e.menuName)}/>
//
// }
//
// const View = ({item}: {idx:number, item: ReportItem, className?: string }) => {
//   const xIdx = statsStore.xyState.xData.head.indexOf(item.x)
//   const yIdx = statsStore.xyState.yData.head.indexOf(item.y)
//
//   const regressionIdx = StatsRegressionTypesMenu.findIndex((r) => r.menuName.toLowerCase() === item.regression)
//   const isActive =
//     statsStore.uiXYState.selectedXVar === xIdx &&
//     statsStore.uiXYState.selectedYVar === yIdx &&
//     // statsStore.uiXYState.selectedHorizon === item.horizonIndex
//   statsStore.uiRegressionState.selectedRegression === regressionIdx
//
//
//
//   return <button className={'btn'} onClick={() => updateRegressionForReportItem(item)}><EyeIcon className={classNames('h-4 w-4', isActive? 'text-green-600': '')}/></button>
// }

// interface CheckboxProps {
//   fn: {id: string, name:string, active:boolean}
//   toggle: (status:boolean) => void
// }
// const Checkbox = ({fn,toggle}: CheckboxProps) => {
//
//   return (
//     <>
//       <div className="relative flex items-start">
//         <div className="min-w-0 flex-1 text-xs mr-1">
//           <label htmlFor={`layer-${fn.id}`} className="select-none font-medium text-gray-700">
//             {fn.name}
//           </label>
//         </div>
//         <div className="flex items-center">
//           <input
//             id={`layer-${fn.id}`}
//             name={`layer-${fn.id}`}
//             type="checkbox"
//             className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//             checked={fn.active}
//             onChange={(_) => toggle(!fn.active)}
//           />
//         </div>
//       </div>
//     </>
//   )
// }

// const BeforeSlides = ({idx, pagesBefore}: {idx:number, item: ReportItem, pagesBefore:string[], className?: string }) => {
//   const pages = ['esp']
//
//   const update = (i:number) => {
//     const before = pages.filter((b, idx) => pagesBefore[idx] === undefined)
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'pagesBefore',value:before,idx }]})
//   }
//
//   return (
//     <div className="flex">
//       {pages.map((b, i) => {
//         return <Checkbox key={'bfs'+i} fn={{id: pages[i], name: pages[i], active: pagesBefore[i] === pages[i]}} toggle={() => update(i) } />
//       })}
//     </div>
//   )
// }
//
// const Active = ({idx,item}: {idx:number, item: ReportItem, className?: string }) => {
//   const update = (idx:number) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'active',value:!item.active,idx}]})
//   }
//   const name = SoilHorizonsMenu[item.horizonIndex].menuName
//   return (
//     <div className="flex">
//       <Checkbox fn={{id: name, name: name, active: item.active}} toggle={() => update(idx)} />
//     </div>
//   )
// }
//
// const ShowOutliers = ({idx,item}: {idx:number, item: ReportItem, className?: string }) => {
//   const update = (idx:number) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'update',key:'showOutliers',value:!item.showOutliers,idx}]})
//   }
//   const name = item.showOutliers? 'Yes': 'No'
//
//   return (
//     <div className="flex">
//       <Checkbox fn={{id: name, name: name, active: item.showOutliers}} toggle={() => update(idx)} />
//     </div>
//   )
// }



// export const ReportSelectionTable = ({title, className}) => {
//   const tm = useLoadMachinesState([statsReportUpdatingMachine, statsReportLoadingMachine])
//   console.log("STATS REPORT LOADING", tm, statsStore)
//   // Potash, Lime, Gypsum, Phosphorus
//   const hasData = Object.values(statsStore.reportState.reportItemsWithData).reduce((a,b) => a && b, true)
//
//   const layersWithData = Object.keys(statsStore.reportState.reportItemsWithData).sort().map(k => {
//     console.log("K", k)
//     const name = SoilHorizonsMenu[parseInt(k)].menuName
//     const horizonSelected = statsStore.uiXYState.selectedHorizonName === name
//     const hasData = statsStore.reportState.reportItemsWithData[k]
//     return <button
//       onClick={() => {statsUIForXYDataMachine.service.send({type: LoadingEvent.Update, payload: {'selectedHorizon': k}})}}
//       key={'lwd' + k}
//       className={classNames('btn text-xs w-16 hover:text-white',hasData? 'btn-green': 'btn-red', horizonSelected? 'border-gray-600': '')}>{name}</button>
//   })
//
//   const deleteItem = (r:ReportItem, idx:number) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload:[{action: 'delete',key:'',value:'',idx}]})
//   }
//   const addItem = (r:ReportItem, idx:number) => {
//     const item = createReportItem(r.horizonIndex)
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload: [{action: 'add', key: 'item', value:item, idx}]})
//     item.regression = 'linear'
//     updateRegressionForReportItem(item)
//   }
//
//   const shiftUp = (r:ReportItem, idx:number) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload: [{action: 'shift-up', key: 'item', value:r, idx}]})
//   }
//   const shiftDown = (r:ReportItem, idx:number) => {
//     statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload: [{action: 'shift-down', key: 'item', value:r, idx}]})
//   }
//
//   const createRows = (tm:number) => {
//     const horizonName = SoilHorizonsMenu[statsStore.uiXYState.selectedHorizon].menuName
//     const items = statsStore.reportState.reportItems[statsStore.uiXYState.selectedHorizon]
//
//     const rows = items.map((r,i) => {
//
//       const key = statsCreatePrimaryKey(r.x, r.y)
//       const result = statsStore.regressionState?.results[key]
//       // const selectedRegression = result?.results[r.regression]
//       if (!result) {
//         return <tr key={key + i.toString()} className=""></tr>
//       }
//
//       // get top ranking
//       return (
//         <React.Fragment key={key + "rf" + i}>
//           <tr key={key + i.toString()} className="">
//             <td className={classNames("py-2")}><Title className={'number-input-xs'} key={'t'+tm} idx={i} title={r.title}/></td>
//             <td className={classNames("py-2")}><X key={'x'+tm} item={r} idx={i} x={r.x} className={'text-xs string-select w-full'} /> </td>
//             <td className={classNames("py-2")}><Y key={'y'+tm} item={r} idx={i} y={r.y} className={'text-xs string-select w-full'} /> </td>
//             <td className={classNames("py-2")}><Regression key={'r'+tm} item={r} idx={i} regression={r.regression} className={'text-xs string-select w-full'}/></td>
//             <td className={classNames("py-2")}><View idx={i} item={r} /></td>
//             <td className={classNames("py-2")}>{round(r.regressionResult?.r2 || 0,1).toString()}</td>
//             <td className={classNames("py-2")}>{round(r.regressionResult?.cov || 0,0).toString()}%</td>
//             <td className={classNames("py-2")}><Active idx={i} item={r} /></td>
//             <td className={classNames("py-2")}><ShowOutliers idx={i} item={r} /></td>
//             <td className={classNames("py-2")}><BeforeSlides key={'bs'+tm} idx={i} item={r} pagesBefore={r.pagesBefore} /></td>
//             <td className={classNames("py-2")}><button className={''} onClick={() => shiftUp(r,i)}><BarsArrowUpIcon className={'h-4 w-4'}/></button></td>
//             <td className={classNames("py-2")}><button className={''} onClick={() => shiftDown(r,i)}><BarsArrowDownIcon className={'h-4 w-4'}/></button></td>
//             <td className={classNames("py-2")}><button className={'text-green-600'} onClick={() => addItem(r,i)}>Add</button></td>
//             <td className={classNames("py-2")}><button className={'text-red-600'} onClick={() => deleteItem(r,i)}>Remove</button></td>
//           </tr>
//           {/*<tr className={"hover:bg-gray-100"}>*/}
//           {/*  <td colSpan={9} key={'note' +tm} className={""}><Note idx={i} item={r} className={'w-5/6 text-xs'} /></td>*/}
//           {/*</tr>*/}
//         </React.Fragment>
//
//
//
//       )
//     })
//     return rows
//   }
//   const save = () => {
//     if (!hasData) {
//       logWarning('Incomplete Data', 'No data or missing data for regression reports.')
//     }
//     const clientMeta = metaStore.client
//     const season = metaStore.seasonSelected
//     if (!clientMeta.isJust) {
//       logFailure('No Client', 'No client selected')
//       return
//     }
//     const dbmg = clientMeta.value
//     const meta = {
//       dealer: dbmg.dealer(),
//       client: dbmg.client(),
//       block: dbmg.block(),
//       season: season,
//       status: 'raw',
//       type: 'stats-report',
//       format: 'vrt',
//       flagged: false,
//       archived: false,
//     }
//
//     logWarning("Stats Report", "Not Implemented")
//     // post('/api/v1/save-stats-report', {meta, data: statsStore.reportState})
//     //   .then((res) => {
//     //     const result = updateMetaChannel(res)
//     //       if (result.isOk) {
//     //         logSuccess('Report Saved', `Saved raw stats report data for ${meta.client} ${meta.block}`)
//     //       }
//     //   })
//       // .catch((err) => {
//       //   logFailure('Error', `Error saving stats report data for ${meta.client} ${meta.block}`)
//       // })
//   }
//   return (
//     <div className={className}>
//       <div className="flex flex-col text-xs">
//         <div className="">
//           <div className="inline-block min-w-full align-middle">
//             <div className="">
//               <h2 className="text-xl text-center p-2">{title}</h2>
//               <h3 className={"text-center space-x-4 py-2 font-bold"}>{layersWithData}<button onClick={() => save()} className={classNames('btn hover:text-white w-16', hasData? 'btn-blue': 'btn-gray')} >Save</button></h3>
//               <table className="min-w-full divide-y divide-gray-300">
//                 <thead className="bg-gray-50">
//                 <tr className="sticky">
//                   {createHeaders(['Title', 'X', 'Y', "Regression","View", "R2", "COV", "Active", "Show Outliers", "Before Slides", "Up", "Down", "Add", "Remove"])}
//                 </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 bg-white">
//                   {createRows(tm)}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

export const findLonLatIndices = (csv: ICsv, latStartsWith: string = 'lat', lonStartsWith: string = 'lon'): Result<[number, number], string> => {
  const slugged = csv.head.map(x => slugify(x))
  const lat = slugged.map(x => x.startsWith(latStartsWith)).indexOf(true)
  const lng = slugged.map(x => x.startsWith(lonStartsWith)).indexOf(true)
  if (lat === -1 || lng === -1) {
    return err("Could not find lat/lon columns")
  }
  return ok([lng, lat])
}

const getPoints = (csv: ICsv, lngIdx: number, latIdx: number): number[][] => {
  const points = []
  for (let i = 0; i < csv.body.length; i++) {
    const row = csv.body[i]
    const lng = parseFloat(row[lngIdx])
    const lat = parseFloat(row[latIdx])
    if (lng && lat) {
      points.push([lng, lat])
    }
  }
  return points
}

export const getPointsForLonLat = (csv: ICsv, lon: string, lat: string): Result<number[][], string> => {
  const result = findLonLatIndices(csv, lon, lat)
  if (result.isErr) {
    return err(result.error)
  }
  const indices = result.unwrapOr([0,0])
  return ok(getPoints(csv, indices[0], indices[1]))
}
const autoGetPoints = (csv: ICsv) => {
  const lonLat = findLonLatIndices(csv)
  if (lonLat.isErr) {
    logFailure('No Lon/Lat columns found', `Could not find lon/lat columns in csv, trying to use first two columns`)
  }
  // @ts-ignore
  return ok(getPoints(csv, lonLat.unwrapOr(0)[0], lonLat.unwrapOr(1)[1]))
}
export const extractCoordinatesForCsvType = (csv: ICsv, csvType: CsvType): Ok<number[][], unknown> | Err<number[][], unknown> => {
  if (!csvHasData(csv)) {
    return err('No data in csv')
  }
  switch (csvType) {
    case CsvType.Empty:
      return ok([])
    case CsvType.EmClean:
      return autoGetPoints(csv)
    case CsvType.EmRaw:
      return autoGetPoints(csv)
    case CsvType.GrClean:
      return autoGetPoints(csv)
    case CsvType.GrRaw:
      return autoGetPoints(csv)
    case CsvType.DLog:
      return autoGetPoints(csv)
    case CsvType.PctAgEM:
      return autoGetPoints(csv)
    case CsvType.PctAgGR:
      return autoGetPoints(csv)
    case CsvType.DEX:
      return autoGetPoints(csv)
    case CsvType.TerraLogga:
      return autoGetPoints(csv)
    case CsvType.Generic:
      return autoGetPoints(csv)
    case CsvType.SoilPoints:
      return autoGetPoints(csv)
    case CsvType.SoilFusion:
      return autoGetPoints(csv)
    default:
      return err(`Unhandled csv type: ${csvType} (86cc4462)`)
  }
}

// @ts-ignore
const FusionMap = () => {
  useLoadMachinesState([fusionMachine])
  const coordinates = extractCoordinatesForCsvType(fusionStore.fusionData.csv, fusionStore.fusionData.type).unwrapOr([])
  const bbox = boundaryStore.bbox

  const emCoordinates = getPointsForLonLat(fusionStore.fusionData.csv, 'em-lat', 'em-lon').unwrapOr([])
  const grCoordinates = getPointsForLonLat(fusionStore.fusionData.csv, 'gr-lat', 'gr-lon').unwrapOr([])

  const [labels, setLabels] = useState<string[]>([])

  useEffect(() => {

    if (coordinates.length === 0) {
      return
    }

    if (emCoordinates.length === 0) {
      return
    }

    if (grCoordinates.length === 0) {
      return
    }

    const cheapRuler = new CheapRuler(mean(coordinates.map(c => c[1])), 'meters')
    const emDistances = coordinates.map((c,i) => {
      const d = cheapRuler.distance(c as Point, emCoordinates[i] as Point)
      return d
    })
    const grDistances = coordinates.map((c,i) => {
      const d = cheapRuler.distance(c as Point, grCoordinates[i] as Point)
      return d
    })
    let _lbls = [...fusionStore.fusionSampleIds]
    _lbls = _lbls.map((s, i) => `${s}  EM ${round(emDistances[i], 0)}m  GR ${round(grDistances[i], 0)}m`)
    setLabels(_lbls)
  }, [coordinates, emCoordinates, grCoordinates]);


  // console.log('FUSION', fusionStore.fusionData.csv.head)
  // console.log("EM", emCoordinates, coordinates)

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="">
        <MapView
          id={'fusion-sensor'}
          bbox={bbox}
          className={"z-10 mx-2 m-auto rounded min-w-[500px]"}
          targetCanvasWidth={900}
          targetCanvasLineWidth={1.15}
          targetCanvasPointSize={2}
          canvasBuffer={0.1}
          zoom={1}
          drawFunctions={
            [
              drawBoundaries(bbox, boundaryStore.boundary, 'gray', 'gray', 'transparent'),
              drawFixedSizeCoordinates(bbox, grCoordinates, 5, 'blue', ),
              drawFixedSizeCoordinates(bbox, emCoordinates, 4, 'red', ),
              drawSoilPoints(bbox, coordinates, labels, 7),

              // drawPoints(bbox, xy,'red', 5)
            ]}
          pngCallback={undefined}
        />
      </div>
    </div>
  )
}
//
// const load = (client: Maybe<DBMetaGroup>, csvType:CsvType, season: string, isLoading: boolean, setLoading: (b: boolean) => void):Promise<CsvContainer> => {
//   const c = client.value
//   setLoading(true)
//   return new Promise((resolve, reject) => {
//     loadEmGr(c, season, csvType)
//       .then((csv) => {
//         setLoading(false)
//         resolve(csv)
//       })
//       .catch((err) => {
//         logFailure('Error loading document', err)
//         setLoading(false)
//         reject(err)
//       })
//   })
//
// }
//
// const FusionGenerator = () => {
//   const tm = useLoadMachinesState([metaClientMachine])
//   const [isLoading, setLoading] = useState(false)
//   const [cleanEm, setCleanEm] = useState<CsvContainer | null>(null)
//   const [cleanGr, setCleanGr] = useState<CsvContainer | null>(null)
//   const [fusionCsv, setFusionCsv] = useState<ICsv | null>(null)
//
//   const reset = () => {
//     setFusionCsv(null)
//     setCleanEm(null)
//     setCleanGr(null)
//   }
//
//   const _load = (csvType: CsvType, setContainer: (c: CsvContainer | null) => void, fn: (boolean) => void) => {
//     load(metaStore.client, csvType, metaStore.seasonSelected, false, fn)
//       .then((csv) => {
//         setContainer(csv)
//       })
//       .catch((err) => {
//         setContainer(null)
//       })
//   }
//
//   const loadAll = () => {
//     reset()
//     _load(CsvType.EmClean, setCleanEm, setLoading)
//     _load(CsvType.GrClean, setCleanGr, setLoading)
//   }
//
//   const updateFusionMachine = (csv: ICsv) => {
//     fusionMachine.reset()
//     fusionStore.fusionSampleIds = csv.body.map(l => l[2])
//     fusionStore.fusionData.csv = csv
//     fusionStore.fusionData.type = CsvType.SoilFusion
//     fusionMachine.service.send({type: LoadingEvent.Update, payload: null})
//     fusionMachine.resolve(LoadingEvent.Success)
//   }
//
//   useEffect(() => {
//     if (!cleanEm || !cleanGr) {
//       return
//     }
//
//     const emHeaderFormat = ['longitude', 'latitude', "elevation", "dual-em-150", "dual-em-50", "season"]
//     const grHeaderFormat = ['longitude', 'latitude', "tot-count", "potassium", "uranium", "thorium", "season"]
//     const emHeaderSlugs = cleanEm.csv.head.map(h => slugify(h))
//     const grHeaderSlugs = cleanGr.csv.head.map(h => slugify(h))
//     const emHeaderOk = emHeaderFormat.map((h, i) => emHeaderSlugs[i].startsWith(h)? '': `${emHeaderSlugs[i]} should start with ${h}`).filter(s => s !== '').join(', ')
//     const grHeaderOk = grHeaderFormat.map((h, i) => grHeaderSlugs[i].startsWith(h)? '': `${grHeaderSlugs[i]} should start with ${h}`).filter(s => s !== '').join(', ')
//
//     if (emHeaderFormat.length !== emHeaderSlugs.length) {
//       logFailure('EM header length is incorrect', cleanEm.csv.head.join(', '))
//       return
//     }
//
//     if (grHeaderFormat.length !== grHeaderSlugs.length) {
//       logFailure('GR header length is incorrect', cleanGr.csv.head.join(', '))
//       return
//     }
//
//     if (emHeaderOk.length > 0) {
//       logFailure('EM header format is incorrect', emHeaderOk)
//       return
//     }
//     if (grHeaderOk.length > 0) {
//       logFailure('GR header format is incorrect', grHeaderOk)
//       return
//     }
//
//     const cleanEmCoordinates = extractCoordinatesForCsvType(cleanEm.csv, CsvType.EmClean).unwrapOr([])
//     const cleanGrCoordinates = extractCoordinatesForCsvType(cleanGr.csv, CsvType.GrClean).unwrapOr([])
//     const soilCoordinates = extractCoordinatesForCsvType(soilStore.data.soilPoints.csv, CsvType.SoilPoints).unwrapOr([])
//
//     const cheapRuler = new CheapRuler(mean(cleanEmCoordinates.map(c => c[1])), 'meters')
//
//     const reverse = (c: number[]) => [c[1], c[0]]
//     const emPoints = points(cleanEmCoordinates.map(c => reverse(c)))
//     const grPoints = points(cleanGrCoordinates.map(c => reverse(c)))
//     const issues = []
//     const header = ['Longitude', 'Latitude', 'Sample ID', 'Em Index', 'Gr Index', 'Em Distance', 'Gr Distance', 'EM Longitude', 'EM Latitude', 'EM Elevation', 'EM 150', 'EM 50', 'EM Season', 'GR Longitude', 'GR Latitude', 'GR Total Count', 'GR Potassium', 'GR Uranium', 'GR Thorium', 'GR Season']
//     const lines = []
//     for (let i = 0; i < soilCoordinates.length; i++) {
//       const soilPoint = soilCoordinates[i]
//       const soilPointTurf = point(reverse(soilPoint))
//       const closestEmPoint = reverse(nearestPoint(soilPointTurf, emPoints).geometry.coordinates)
//       const closestGrPoint = reverse(nearestPoint(soilPointTurf, grPoints).geometry.coordinates)
//
//       const distEm = cheapRuler.distance(closestEmPoint as Point, soilPoint as Point)
//       const distGr = cheapRuler.distance(closestGrPoint as Point, soilPoint as Point)
//       const emRecordIndex = cleanEmCoordinates.findIndex(c => c[0] === closestEmPoint[0] && c[1] === closestEmPoint[1])
//       const grRecordIndex = cleanGrCoordinates.findIndex(c => c[0] === closestGrPoint[0] && c[1] === closestGrPoint[1])
//
//       const sampleId = soilStore.data.soilPoints.csv.body[i][0]
//
//       if (emRecordIndex === -1) {
//         issues.push(`no em record found for point ${soilStore.data.soilPoints.csv.body[i][0]} (skipping)`)
//         continue
//       }
//       if (grRecordIndex === -1) {
//         issues.push(`no gr record found for point ${soilStore.data.soilPoints.csv.body[i][0]} (skipping)`)
//         continue
//       }
//       if (distEm > 3) {
//         issues.push(`em point (${round(distEm, 2)}m) is > 3m from sample ${sampleId}`)
//       }
//       if (distGr > 5.5) {
//         issues.push(`gr point (${round(distGr,2)}m) is > 5.5m from sample ${sampleId}`)
//       }
//
//       const emRecord = cleanEm.csv.body[emRecordIndex]
//       const grRecord = cleanGr.csv.body[grRecordIndex]
//       const soilPointsRecord = soilStore.data.soilPoints.csv.body[i]
//       // const soilZData = soilStore.data.soilHorizonData[1].body[i]
//       // Longitude, Latitude, Sample ID, EmIndex, GrIndex, EmDistance, GrDistance, EM Longitude, EM Latitude, EM 150, EM 50, GR Longitude, GR Latitude, GR Total Count, GR Potassium, GR Uranium, GR Thorium
//       const longitude = soilPointsRecord[1]
//       const latitude = soilPointsRecord[2]
//       const line = [longitude, latitude, sampleId, emRecordIndex, grRecordIndex, distEm, distGr, ...emRecord, ...grRecord]
//
//       if (header.length !== line.length) {
//         logFailure('line length is incorrect', line.join(', '))
//         return
//       }
//       lines.push(line)
//     }
//
//
//     if (issues.length > 0) {
//       logWarning('Processing Issues Encountered', issues.join('\n'))
//     }
//
//     const csv = {head: header, body: lines}
//     setFusionCsv(csv)
//
//
//
//   }, [cleanEm, cleanGr])
//
//
//   useEffect(() => {
//     if (!fusionCsv) {
//       return
//     }
//     updateFusionMachine(fusionCsv)
//   }, [fusionCsv])
//
//
//
//   useEffect(() => {
//     reset()
//   }, [tm])
//
//   const save = () => {
//     if (!fusionCsv) {
//       return
//     }
//     const clientMeta = metaStore.client
//     const season = metaStore.seasonSelected
//     if (!clientMeta.isJust) {
//       logFailure('No Client', 'No client selected')
//       return
//     }
//     const clientMetaValue = clientMeta.value
//     const flt = (e: DBMeta) => e.season.toString() === metaStore.seasonSelected
//     const fusionMeta = clientMetaValue.getSoilFusionData(flt)
//
//     const meta = {
//       uid: fusionMeta?.uid? fusionMeta.uid: nanoid(),
//       dealer: clientMetaValue.dealer(),
//       client: clientMetaValue.client(),
//       block: clientMetaValue.block(),
//       season: season,
//       status: 'clean',
//       type: 'soil-fusion',
//       format: 'vrt',
//       flagged: false,
//       archived: false,
//     }
//
//     post('/api/v1/save-soil-fusion', {meta, data: csvToText(fusionCsv)})
//       .then((res) => {
//         const result = updateMetaChannel(res)
//         if (result.isOk) {
//           logSuccess('Fusion Data Saved', `Saved soil fusion data for ${meta.client} ${meta.block}`)
//           reset()
//         }
//       })
//   }
//
//   return (
//     <div className="flex justify-center space-x-2 w-1/4 m-auto my-4">
//       <LoadButton label={"Create Clean Sensor Fusion Data"}
//                   onClick={() => loadAll()}
//                   isLoading={isLoading} activeClass={"btn btn-blue hover:text-white text-xs h-10 grow"}
//                   inactiveClass={"bg-opacity-50 text-xs btn btn-blue hover:text-white h-10 grow"}/>
//       <button disabled={fusionCsv === null} className={classNames("btn grow text-xs h-10",fusionCsv? "btn-green hover:text-white": "hover:text-gray-800")} onClick={save}>Save</button>
//     </div>
//   )
// }

const StatsView = () => {
  useLoadMachinesState([statsRegressionMachine, fusionMachine, statsDataMachine])

  console.log("STATS VIEW", statsStore)

  const [_,setSelectedRow] = useLoadMachineStateWithUpdate(statsUISharedStateMachine)
  const statsResult = statsStore.regressionState.selectedResult
  const statsPredictions = statsStore.regressionState.predictions

  // const [statsSelectedRow, statsSetSelectedRow] = useAtom(statsUISelectedRowAtom)

  const statsRegressionType = StatsRegressionTypesMenu[statsStore.uiRegressionState.selectedRegression].menuName
  const selectedHorizon = SoilHorizonsMenu[statsStore.uiXYState.selectedHorizon].menuName
  const degree = statsStore.uiRegressionState.degree
  const showLabels = statsStore.uiRegressionState.showLabels
  const showOutliers = statsStore.uiRegressionState.showOutliers
  const showThresholds = statsStore.uiRegressionState.showThresholds
  // const [selectedRow, setSelectedRow] = useAtom(statsUISelectedRowAtom)

  const [__, update] = useLoadMachineStateWithUpdate(statsRegressionOutliersMachine)

  const reportItem = regressionResultEntryToReportItem(statsResult, statsStore.uiXYState.selectedHorizon, statsRegressionType)

  return (
    <div>
      <StatsToolbar/>
      <RegressionSummaries result={statsResult}/>
      <div className="flex flex-row w-full">

        <div className="flex flex-col">
          <RankingTable
            title={'Ranked Results'}
            className={'min-h-[20em] max-h-[300px] mx-2 min-w-3/12 text-xs overflow-y-auto'}
          />
          <RegressionTable
            title={statsRegressionType}
            predictions={statsPredictions}
            xName={statsResult?.xName}
            yName={statsResult?.yName}
            selected={statsStore.uiSharedState.statsUISelectedRowAtom}
            className={'min-h-[20em] max-h-[500px] mt-8 mx-2 min-w-3/12 text-xs overflow-y-auto'}
            onClick={(row) => setSelectedRow(row)}
            onOutlierClicked={(c) => update(c)}
          />
        </div>
        <GoogleChart
          id={'stats-chart'}
          className='w-9/12'
          xName={reportItem.x}
          yName={reportItem.y}
          reportItem={reportItem}
          horizon={selectedHorizon}
          regressionType={statsRegressionType}
          degree={degree}
          showLabels={showLabels}
          showOutliers={showOutliers}
          showThresholds={showThresholds}
          selectedRow={statsStore.uiSharedState.statsUISelectedRowAtom}
          setSelectedRow={setSelectedRow}
          height={800}
          onMount={(_) => {}}
        />
      </div>
      {/*<ReportSelectionTable className={'mx-2 mt-8 p-4 border-t-solid border-t-2 border-gray-200'} title={'Regression Report Setup'}/>*/}
      {/*<FusionMap/>*/}
      {/*<FusionGenerator />*/}
    </div>
  )
}
export default StatsView

