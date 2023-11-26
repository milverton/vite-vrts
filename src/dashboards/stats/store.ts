import {csvExclude, csvHasData, csvInclude, emptyCsv} from "../../lib/csv"
import {
  ReportItem,
  resetStats,
  resetStatsOutliers,
  resetStatsRegressionData,
  resetStatsReport,
  resetStatsUIForRegression,
  resetStatsUIForXY,
  resetStatsXYData,
  SlideRelationShip,
  SlideReportItems,
  StatsRegressionTypesMenu,
  StatsReportState,
  StatsState,
  statsXHeaders,
  StatsXYDataState,
  statsYExcludedHeaders,
  statsYShortHeaders
} from "./model"

import {soilMachine, soilStore} from "../../lib/stores/soil/store";
import {
  createStatsOutlierKey,
  getRegressionResultRanking,
  getSampleIds,
  statsBuildRegression,
  statsBuildXY,
  statsCreatePrimaryKey,
  statsPruneCsv,
  statsSortRegressionResults,
  unifySampleIds
} from "./transform";


import {LoadingEvent, LoadingMachine, LoadingState} from "../../core/machine";
import {merge} from "rxjs";
import {SelectedPoint, SoilHorizonsMenu} from "../soil/model";
import {fusionMachine, fusionStore} from "../../lib/stores/fusion/store";
import {logFailure, logWarning} from "../../lib/stores/logging";

import {slugify} from "../../lib/common";
// @ts-ignore
import {Maybe, nothing} from "true-myth/maybe";




export let statsStore: StatsState = resetStats()


/**

 Checks if a specified property has changed between two objects.
 @param {string} prop - The name of the property to compare.
 @param {any} old - The old object to compare the property against.
 @param {any} current - The current object to compare the property against.
 @returns {boolean} - True if the property is different, false otherwise.
 */
const isDifferent = (prop: string, old: any, current: any) => {
  const oldProp = old[prop]
  const currentProp = current[prop]
  if (oldProp === undefined || currentProp === undefined) {
    return false
  }
  if (oldProp === currentProp) {
    return false
  }
  return true
}

/**
 * Stats UI Regressions Machine
 * This machine is responsible for updating the statsStore.uiRegressionState store.
 */
export const statsUIForRegressionsMachine = new LoadingMachine('Stats UI Regressions Machine')
statsUIForRegressionsMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, uiRegressionState: resetStatsUIForRegression()}
        break
      case LoadingState.Updating:
        // payload should contain one or more properties from uiRegressionState
        const payload = state.event.payload
        // if we have the index for the selected regression, then we need to update the name
        if (payload.selectedRegression !== undefined) {
          payload.selectedRegressionName = StatsRegressionTypesMenu[payload.selectedRegression].menuName
        } else {
          payload.selectedRegressionName = 'NA'
        }
        statsStore = {...statsStore, uiRegressionState: {...statsStore.uiRegressionState, ...payload}}
        statsUIForRegressionsMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})

/**
 * Stats XY Data Machine
 *
 * This machine is responsible for updating statsStore.uiXYState store.
 */
export const statsUIForXYDataMachine = new LoadingMachine('Stats UI XY Data Machine')
statsUIForXYDataMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, uiXYState: resetStatsUIForXY()}
        break
      case LoadingState.Updating:
        // payload should contain one or more properties from uiXYState
        const payload = state.event.payload

        if (payload.selectedHorizon !== undefined && soilStore.data.soilHorizonData[payload.selectedHorizon] === undefined) {
          logWarning('Missing horizon data', `No data for horizon ${SoilHorizonsMenu[payload.selectedHorizon].menuName}`)
          statsUIForXYDataMachine.service.send(LoadingEvent.Failure)
          return
        }

        // if user has set long list, then we need to reset the selected x and y vars
        if (isDifferent('longList', statsStore.uiXYState, payload)) {
          payload.selectedYVar = 0
          payload.selectedXVar = 0
        }

        // if user sets horizon to NA, reset
        if (payload.selectedHorizon === 0) {
          statsDataMachine.reset()
          statsRegressionMachine.reset()
        }



        // if we have the index for the selected horizon, then we need to update the name
        if (payload.selectedHorizon !== undefined) {
          payload.selectedHorizonName = SoilHorizonsMenu[payload.selectedHorizon].menuName
        }
        statsStore = {...statsStore, uiXYState: {...statsStore.uiXYState, ...payload}}
        statsUIForXYDataMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})

/**
 * updateSelectedXYMenus
 * @param xName
 * @param yName
 *
 * This function is used to update the selected x and y variables in the statsStore.uiXYState store.
 * It can be used to update the UI when the X or Y variables are changed elsewhere.
 */
export const updateSelectedXYMenus = (xName: string, yName: string) => {
  const xIdx = statsStore.xyState.xData.head.findIndex((h) => h === xName)
  const yIdx = statsStore.xyState.yData.head.findIndex((h) => h === yName)
  statsUIForXYDataMachine.service.send({type: LoadingEvent.Update, payload: {selectedXVar: xIdx, selectedYVar: yIdx}})
}


/**
 * Stats Data Machine
 *
 * This machine is responsible for updating statsStore.xyState store.
 */
export const statsDataMachine = new LoadingMachine('Stats Data Machine')
statsDataMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, xyState: resetStatsXYData()}
        break
      case LoadingState.Updating:
        // payload should contain one or more properties from xyState
        const payload = state.event.payload
        statsStore = {...statsStore, xyState: {...statsStore.xyState, ...payload}}
        statsDataMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})

/**
 * Builds the statsStore.xyState store which maps each x column to the y column.
 * Listen for soilMachine, fusionMachine and statsUIForXYDataMachine updates and rebuild
 * statsStore.xyState (statsDataMachine).
 */
// listen for soil, fusion and stats ui updates
merge(soilMachine.observer, fusionMachine.observer, statsUIForXYDataMachine.observer).subscribe({
  next: (state) => {
    if (state.event.type === LoadingEvent.Success) {
      // xData (fusion data) combines both EM and GR sensor data that is closest to where the soil sample was taken
      const xData = fusionStore.fusionData.csv

      // yData (soil data) is the soil horizon data
      const yData = soilStore.data.soilHorizonData[statsStore.uiXYState.selectedHorizon] || emptyCsv()
      const ySampleIds = getSampleIds(yData)
      // sampleIds are the sampleIds that are in both xData and yData (sorted)
      const sampleIds = unifySampleIds(fusionStore.fusionSampleIds, ySampleIds)
      // store sampleIds in payload
      let payload = {sampleIds: sampleIds} as StatsXYDataState

      if (csvHasData(xData) && sampleIds.length) {
        // prune xData to only include sampleIds that are in both xData and yData
        const newX = statsPruneCsv({sampleIds, csv: xData})
        // include the default X Headers
        const newXData = csvInclude(newX, statsXHeaders)
        // store excluded X Headers
        const newXDataExtra = csvExclude(newX, statsXHeaders)
        // get the name of the selected X variable
        const xName = newXData.head[statsStore.uiXYState.selectedXVar]
        // update the payload
        payload = {...payload, xData: newXData, xDataExtra: newXDataExtra, xName}

      }
      if (csvHasData(yData) && sampleIds.length) {
        // prune yData to only include sampleIds that are in both xData and yData

        const newY = statsPruneCsv({sampleIds, csv: yData})

        // if long list is selected, then include all Y Headers else only include the short list
        if (statsStore.uiXYState.longList) {
          // The default Y Headers
          let _yData = csvExclude(newY, statsYExcludedHeaders)
          const yName = _yData.head[statsStore.uiXYState.selectedYVar]
          payload = {...payload, yData: _yData, yName}
        } else {
          const _yData = csvInclude(newY, statsYShortHeaders)
          const yName = _yData.head[statsStore.uiXYState.selectedYVar]
          // The short list of Y Headers
          payload = {...payload, yData: _yData, yName}
        }
        payload = {...payload, yDataExtra: csvInclude(newY, statsYExcludedHeaders)}

      }

      // build the XY data
      const xyResults = statsBuildXY(
        payload.sampleIds,
        SoilHorizonsMenu[statsStore.uiXYState.selectedHorizon].menuName,
        payload.xData,
        payload.yData
      )
      // if the XY data was built successfully, then update the statsStore.xyState store
      if (xyResults.isOk) {
        payload = {...payload, xyResults: xyResults.value}
        statsDataMachine.service.send({type: LoadingEvent.Update, payload})
        return
      }
      statsDataMachine.service.send(LoadingEvent.Failure)

    }
  }
})

/**
 * Stats Regression Outlier Machine
 * This machine is responsible for updating the statsStore.outliersState store.
 */
export const statsRegressionOutliersMachine = new LoadingMachine('Stats Regression Outliers Machine')
statsRegressionOutliersMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, outliersState: resetStatsOutliers()}
        break

      case LoadingState.Updating:
        // payload contains the index of the outlier, the context is derived from the current state
        const value = state.event.payload

        const regressionName = StatsRegressionTypesMenu[statsStore.uiRegressionState.selectedRegression].menuName.toLowerCase()
        const key = createStatsOutlierKey(statsStore.uiXYState.selectedHorizonName,regressionName, statsStore.xyState.xName, statsStore.xyState.yName)

        // update the set of outliers or create a new set if it doesn't exist
        const rSet = statsStore.outliersState.outliers[key] || new Set<number>()
        if (rSet.has(value)) {
          rSet.delete(value)
        } else {
          rSet.add(value)
        }

        const payload = {...statsStore.outliersState.outliers, [key]: rSet}
        // console.log("OUTLIERS PAYLOAD", payload)
        statsStore = {...statsStore, outliersState: {...statsStore.outliersState, outliers: payload}}
        statsRegressionOutliersMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})

/**
 * Stats Regression Machine
 * This machine is responsible for updating the statsStore.regressionState store.
 */
export const statsRegressionMachine = new LoadingMachine('Stats Regression Machine')
statsRegressionMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, regressionState: resetStatsRegressionData(), outliersState: resetStatsOutliers()}
        break

      case LoadingState.Updating:
        const payload = state.event.payload
        statsStore = {...statsStore, regressionState: {...statsStore.regressionState, ...payload}}
        statsRegressionMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})


/**
 * Builds the regression data.
 * List for changes to the statsUIForRegressionsMachine, statsDataMachine and statsRegressionOutliersMachine.
 */
merge(statsUIForRegressionsMachine.observer, statsDataMachine.observer, statsRegressionOutliersMachine.observer).subscribe({
  next: (state) => {
    if (state.event.type === LoadingEvent.Success) {
      // get the regression name
      const selectedRegressionName = StatsRegressionTypesMenu[statsStore.uiRegressionState.selectedRegression].menuName.toLowerCase()

      // get the outliers
      const outliers = statsStore.outliersState.outliers

      const results = statsBuildRegression(statsStore.xyState.xyResults, statsStore.uiRegressionState.degree, statsStore.uiRegressionState.outlierThreshold, selectedRegressionName,  outliers)
      let payload = {}
      if (results.isErr) {
        statsRegressionMachine.service.send(LoadingEvent.Failure)
        // FIXME: alert user?
        console.warn(results.error)
        return
      }

      if (results.isOk) {
        const key = statsCreatePrimaryKey(statsStore.xyState.xName, statsStore.xyState.yName)
        // get the selected result for the current xy pair
        const selectedResult = results.value[key]

        // get the predictions for each sample id for the selected regression
        // @ts-ignore
        const entries = selectedResult?.results[selectedRegressionName].predictions
        // "ZN01": {
        //     "id": "ZN01",
        //     "uid": "0-10-linear-em-50-soil-k-colwell-ppm",
        //     "x": 1.4,
        //     "y": 206,
        //     "prediction": 261.06867619301636,
        //     "residual": -55.06867619301636,
        //     "zScore": 0.408,
        //     "outlier": false,
        //     "horizon": "0-10"
        // }

        // convert the entries object to an array (contains the same data)
        const predictions = []
        if (entries) {
          const keys = Object.keys(entries).sort()

          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            const value = entries[key]
            predictions.push(value)
          }
        }

        payload = {results: results.value, selectedResult, predictions}
        const ranking = statsSortRegressionResults(results.value)
        if (ranking.isErr) {
          statsRegressionMachine.service.send(LoadingEvent.Failure)
          console.warn(ranking.error)
          return
        }
        if (ranking.isOk) {
          payload = {...payload, ranking: ranking.value}


          statsRegressionMachine.service.send({type: LoadingEvent.Update, payload})
          return
        }

      }
      statsRegressionMachine.service.send(LoadingEvent.Failure)
    }
  }
})


// ------------------ User Interaction Section ----------------
// connects chart and regression entries together

export interface UISharedState {
  statsUISelectedRowAtom: number
  soilUISelectedPointAtom: Maybe<SelectedPoint>
}
export const resetSharedState = (): UISharedState => {
  return {
    statsUISelectedRowAtom: -1,
    soilUISelectedPointAtom: nothing<SelectedPoint>()
  }
}



export let uiSharedState = resetSharedState()
export const statsUISharedStateMachine = new LoadingMachine('Stats UI Shared State Machine')
statsUISharedStateMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        uiSharedState = resetSharedState()
        break
      case LoadingState.Updating:
        const payload = state.event.payload
        statsStore = {...uiSharedState, ...payload}
    }
    statsUISharedStateMachine.service.send({type: LoadingEvent.Success})
  }
});


export const statsReportLoadingMachine = new LoadingMachine('Stats Report Loading Machine')
statsReportLoadingMachine.observer.subscribe({
  next: (state) => {

    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, reportState: resetStatsReport()}
        break
      case LoadingState.Loading:
        const data = state.event.payload as StatsReportState
        // reportItems is keyed by horizon, 1, 2 and 3 with an array of report items
        const horizons = Object.keys(data.reportItems)
        // hasData is keyed by horizon, 1, 2 and 3 with a boolean value

        // outliers are keyed by a slug of the horizon, regression and x/y values
        const outliers = {...statsStore.outliersState.outliers} as {[key: string]: Set<number>}
        for (let i = 0; i < horizons.length; i++) {
          const key = horizons[i]
          // @ts-ignore
          const items = data.reportItems[key]
          // reconstitute the outliers set
          for (let j = 0; j < items.length; j++) {
            const item = items[j] as ReportItem
            const outlierKey = createStatsOutlierKey(SoilHorizonsMenu[item.horizonIndex].menuName, item.regression, item.x, item.y)

            if (!item.regressionResult) {
              continue
            }

            const itemOutliers = Object.values(item.regressionResult.predictions).map((p,i) => p.outlier? i: -1).filter(i => i !== -1)
            if (itemOutliers.length) {
              const previousOutliers = outliers[outlierKey] || new Set()
              itemOutliers.forEach((i) => previousOutliers.add(i))
              outliers[outlierKey] = previousOutliers
            }

          }
          // reconstitute the reportItemsWithData object
          // const hd = items.some((item) => item.regression !== null)
          // hasData[key] = hd
        }
        // console.log("DATA.REPORT ITEMS", data, outliers)
        const slideReportItems = buildReportItemsForSlides(data.reportItems)
        statsStore = {...statsStore, reportState: {...data, slideReportItems}, outliersState: {outliers}}
        statsStore = {...statsStore, reportState: {...data, slideReportItems}}
        if (statsStore.uiXYState.longList !== data.isLongList) {
          statsUIForXYDataMachine.service.send({type: LoadingEvent.Update, payload: {longList: data.isLongList}})
        }

        // statsRegressionOutliersMachine.service.send({type: LoadingEvent.Success})
        statsReportLoadingMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})


/**
 * Stats Report Machine
 * This machine is responsible for updating the statsStore.reportState store.
 */
export const statsReportUpdatingMachine = new LoadingMachine('Stats Report Updating Machine')
statsReportUpdatingMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        statsStore = {...statsStore, reportState: resetStatsReport()}
        break

      case LoadingState.Updating:
        // payload contains the index of the reportItem (i.e. slide), the key and value to update
        // {action: 'update|delete', key: string, value: any, idx: number}
        const payload = state.event.payload

        // get the items for the currently selected horizon and update the values
        // @ts-ignore
        let items = [...statsStore.reportState.reportItems[statsStore.uiXYState.selectedHorizon]]
        for (let i = 0; i < payload.length; i++) {
          const {action,idx, key, value} = payload[i]

          if (action === 'delete') {
            delete items[idx]
            continue
          }
          if (action === 'add') {
            items.splice(idx, 0, value)
            continue
          }
          if (action === 'shift-up') {
            const item = items[idx]
            items.splice(idx, 1)
            items.splice(idx - 1, 0, item)
          }
          if (action === 'shift-down') {
            const item = items[idx]
            items.splice(idx, 1)
            items.splice(idx + 1, 0, item)
          }
          items[idx] = {...items[idx], [key]: value}
        }

        // remove any undefined items that delete may have left
        items = items.filter((item) => item !== undefined)
        // Update the sortKey for each item
        for (let i = 0; i < items.length; i++) {
          items[i].sortKey = `C-${i}`
        }

        // check if any of the items have data (used for the UI to inform the user if they have set slide/data for each horizon)
        const hasData = items.some((item) => item.regression !== null)
        const reportItems = {...statsStore.reportState.reportItems, [statsStore.uiXYState.selectedHorizon]: items}
        const reportItemsWithData = {...statsStore.reportState.reportItemsWithData, [statsStore.uiXYState.selectedHorizon]: hasData}
        statsStore = {...statsStore, reportState: {...statsStore.reportState, reportItems: reportItems, reportItemsWithData: reportItemsWithData, isLongList: statsStore.uiXYState.longList}}
        // statsStore = {...statsStore, reportState: {...statsStore.reportState, reportItems: items}}
        statsReportUpdatingMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})



statsReportUpdatingMachine.observer.subscribe({
  next: (state) => {
    if (state.event.type === LoadingEvent.Success) {
      const reportState = statsStore.reportState
      console.log("RESETTING STATS MACHINE A")
      statsReportLoadingMachine.reset()
      statsReportLoadingMachine.service.send({type: LoadingEvent.Load, payload: reportState})
    }
  }
})

// export const loadStatsReportFromDisk = () => {
//   if (!metaStore.client.isJust) {
//     console.warn('metaStore.client is not just')
//     return
//   }
//
//   // load the raw stats report meta
//   const client = metaStore.client.value
//   const flt = (e: DBMeta) => e.season.toString() === metaStore.seasonSelected
//   const rawStatsReportMeta = client.getRawStatsReport(flt)
//   if (rawStatsReportMeta === undefined) {
//     console.log("RESETTING STATS MACHINE B")
//     statsReportLoadingMachine.reset()
//     console.warn('client updated but cannot get rawStatsReportMeta as it is undefined')
//     logDebug('No Stats Report Available', 'Could not load from file.')
//     return
//   }
//   // fetch the raw json data
//   loadJSON(rawStatsReportMeta)
//     .then((data:StatsReportState) => {
//       // console.log('STATS REMOTE DATA', data)
//       console.log("RESETTING STATS MACHINE C")
//       statsReportLoadingMachine.reset()
//       statsReportLoadingMachine.service.send({type: LoadingEvent.Load, payload: data})
//     })
//     .catch((err) => {
//       logFailure('rawStatsReportMeta',err)
//       statsReportLoadingMachine.service.send(LoadingEvent.Failure)
//     })
// }

/**
 * Listen for changes to the metaClientMachine and update reportItems, reportItemsWithData and outliers.
 */
// merge(metaClientMachine.observer).subscribe({
//
//   next: (state) => {
//
//     if (state.event.type === LoadingEvent.Success) {
//       loadStatsReportFromDisk()
//     }
//   }
// })

const buildReportItemsForSlides = (reportItems: {[k:string]: ReportItem[]}):SlideReportItems[] => {
  const relationships:any = {}
  Object.keys(reportItems).forEach((horizonMenuIndex) => {
    // items for each horizon
    const items = reportItems[horizonMenuIndex] as ReportItem[]
    items.filter(x => x.regression !== null).forEach((item) => {
      const key = slugify(`${item.sortKey}-${item.title}`)
      // console.log("KEY", key)
      const r = {x: item.x, y: item.y, title: item.title, sortKey: item.sortKey} as SlideRelationShip
      if (!relationships[key]) {
        relationships[key] = {relationship: r, reports: [item]}
      } else {
        relationships[key].reports.push(item)
      }
    })
  })
  return Object.keys(relationships).sort().map((key) => relationships[key])
}
/**
 * Listen for user outlier updates and update the reportItems to reflect the changes.
 */
// merge(statsRegressionOutliersMachine.observer).subscribe({
//   next: (state) => {
//     if (state.event.type === LoadingEvent.Success) {
//       const items = statsStore.reportState.reportItems[statsStore.uiXYState.selectedHorizon] as ReportItem[]
//       const newItems = [] as ReportItem[]
//       for (let i = 0; i < items.length; i++) {
//         const item = items[i] as ReportItem
//         // item.regressionResult = statsStore.regressionState.results[item.]
//         const outlierKey = createStatsOutlierKey(SoilHorizonsMenu[item.horizonIndex].menuName, item.regression, item.x, item.y)
//         const outliers = statsStore.outliersState.outliers[outlierKey]
//         // if (outliers !== undefined) {
//         //   item.outliers = Array.from(outliers)
//         // }
//         newItems.push(item)
//       }
//       const reportItems = {...statsStore.reportState.reportItems, [statsStore.uiXYState.selectedHorizon]: newItems}
//       const slideReportItems = buildReportItemsForSlides(reportItems)
//       statsStore = {...statsStore, reportState: {...statsStore.reportState, reportItems: reportItems, slideReportItems}}
//       statsReportUpdatingMachine.service.send({type: LoadingEvent.Success})
//     }
//
//   }
// })

/**
 * Listen for user regression updates and update the reportItems to reflect the changes.
 */
merge(statsRegressionMachine.observer).subscribe({
  next: (state) => {

    if (state.event.type === LoadingEvent.Success) {

      const changeList = []
      // get report items which will be in their default state initially
      // @ts-ignore
      const items = statsStore.reportState.reportItems[statsStore.uiXYState.selectedHorizon] as ReportItem[]
      // console.log("ITEMS", statsStore.reportState.reportItems, statsStore.uiXYState.selectedHorizon, items)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (item.regression !== null) {
          const key = statsCreatePrimaryKey(item.x, item.y)
          // @ts-ignore
          const result = statsStore.regressionState.results[key].results[item.regression]
          changeList.push({idx: i, key: 'regressionResult', value: result})
        }

        // report item is in default state
        if (item.regression === null) {
          const key = statsCreatePrimaryKey(item.x, item.y)
          const result = statsStore.regressionState.results[key]

          const top = getRegressionResultRanking(result, key)
          if (top.isErr) {
            logFailure('getRegressionResultRanking', top.error)
            return
          }
          const [r2, cov, rtype] = top.value


          const changes = [{idx: i, key: 'regression', value: rtype}, {idx: i, key: 'r2', value: r2}, {
            idx: i,
            key: 'cov',
            value: cov
          }, {
            idx: i,
            key: 'regressionResult',
            // @ts-ignore
            value: result.results[rtype]}]
          changeList.push(...changes)
        }
      }
      statsReportUpdatingMachine.service.send({type: LoadingEvent.Update, payload: changeList})
    }
  }
})

// TODO: Comment all this stats code
// DONE: ReportItem has regression as the name AND regressionName
// FIXME: Add sortKey to UI
// TODO: Remove threshold for now
// FIXME: Flicking between clients does not reset outliers
