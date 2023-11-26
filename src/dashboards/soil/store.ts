
import {resetSoilUI, resetSoilUIData, resetSoilUIToolbar, SoilHorizonsMenu,} from "./model";
import {soilMachine, soilMapsMachine, soilStore} from "../../lib/stores/soil/store";
import {csvIndicesOf, csvRemoveColumns, emptyCsv} from "../../lib/csv";
// @ts-ignore
import {Maybe, nothing} from "true-myth/maybe";
import {createCombinedHorizonData, rowToPoint} from "./transform";
import {LoadingEvent, LoadingMachine, LoadingState} from "../../core/machine";
import {merge} from "rxjs";
import {slugify} from "../../lib/common";


export let soilUIStore = resetSoilUI()

/**
 * This machine is responsible for updating the soilStore.toolBarState which contains
 * state for ui toolbar components.
 */
export const soilUIToolbarMachine = new LoadingMachine('Soil UI Machine')

soilUIToolbarMachine.observer.subscribe({
  next: (state) => {

    switch (state.value) {
      case LoadingState.Empty:
        soilUIStore = {...soilUIStore, toolbarState: resetSoilUIToolbar()}
        break
      case LoadingState.Updating:
        if (!state.event) {
          console.warn(state)
          return
        }
        const payload = state.event.payload
        soilUIStore = {...soilUIStore, toolbarState: {...soilUIStore.toolbarState, ...payload}}
        soilUIToolbarMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})


/**
 * This machine is responsible for updating the soilUIDataStore which contains data
 * that is used by the soilUI components. I don't want ui changes pushed down to the
 * soilMachine.
 */
export const soilUIDataMachine = new LoadingMachine('Soil UI Data Machine')

soilUIDataMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        soilUIStore = {...soilUIStore, soilDataState: resetSoilUIData()}
        break
      case LoadingState.Updating:
        const payload = state.event.payload
        soilUIStore = {...soilUIStore, soilDataState: {...soilUIStore.soilDataState, ...payload}}
        soilUIDataMachine.service.send({type: LoadingEvent.Success})
        break
    }
  }
})

/**
 * Listen to soilMachine and soilUIToolbarMachine changes and update soilUIDataMachine with selected
 * horizon data and points
 */
merge(soilMachine.observer, soilUIToolbarMachine.observer).subscribe({
  next: (state) => {

    if (state.value === LoadingEvent.Success) {

      // extract coordinates from the selected horizon and format then into L.LatLngExpression for leaflet
      // const samplesByHorizon = Object.values(soilStore.data.soilHorizonData)
      const selectedHorizonData = soilStore.data.soilHorizonData[soilUIStore.toolbarState.selectedHorizon] || emptyCsv()
      const sluggedHeader = selectedHorizonData.head.map(x => slugify(x))

      // find the index of columns that start with lat or lon
      const latIndex = sluggedHeader.findIndex((h) => h.startsWith('lat'))
      const lonIndex = sluggedHeader.findIndex((h) => h.startsWith('lon'))

      if (latIndex === -1 || lonIndex === -1) {
        return []
      }
      const selectedHorizonDataPoints = selectedHorizonData.body.map((row) => rowToPoint(row, latIndex, lonIndex))

      // combine all horizon data into a single object key by column name and containing an array of values for column
      const combinedHorizonData = createCombinedHorizonData(soilStore.data.soilHorizonData, soilStore.data.soilSampleIds)

      soilUIDataMachine.service.send({
        type: LoadingEvent.Update,
        payload: {selectedHorizonData, selectedHorizonDataPoints, combinedHorizonData}
      })
    }
  }
})


// merge(soilMachine.observer).subscribe({
//   next: (state) => {
//     if (state.value === LoadingEvent.Success) {
//       const setHorizonMenu = soilStore.data.soilDataMetas.length > 0 && soilUIStore.toolbarState.selectedHorizon === 0
//
//       if (setHorizonMenu) {
//         console.log('FOOOBY',setHorizonMenu, soilStore, soilUIStore.toolbarState.selectedHorizon)
//         soilUIToolbarMachine.service.send({type: LoadingEvent.Update, payload: {selectedHorizon: 0}})
//       }
//
//     }
//   }
// })

/**
 * Listen to soilMachine changes and update mapMenu
 */
merge(soilMapsMachine.observer).subscribe({
  next: (state) => {
    if (state.value === LoadingEvent.Success) {
      let menu = Object.keys(soilStore.maps.soilMapUrls).map((h: string, i: number) => ({menuName: h, menuType: i}))
      menu.splice(0, 0, {menuName: 'NA', menuType: -1})
      soilUIToolbarMachine.service.send({type: LoadingEvent.Update, payload: {mapMenu: menu}})
    }
  }
})

const toRemove = ['Longitude', 'Latitude', 'Code', 'Depth Min[cm]', 'Depth Max[cm]', 'Season']
/**
 * Listen to toolbar changes and update selectedColumn data and shrunkHorizonData
 */
merge(soilUIToolbarMachine.observer).subscribe({
  next: (state) => {
    if (state.value === LoadingEvent.Success) {

      const data = soilUIStore.soilDataState.selectedHorizonData
      const header = soilUIStore.toolbarState.selectedSoilHeader
      const combinedHorizonData = soilUIStore.soilDataState.combinedHorizonData
      const combinedHorizonDataHeaders = Object.keys(combinedHorizonData)
      const selectedColumnHeaderName = combinedHorizonDataHeaders[header]

      let payload = {}


      // gets the column data from the selected header
      if (header !== undefined && selectedColumnHeaderName !== undefined) {
        const columnData = combinedHorizonData[selectedColumnHeaderName]
        // console.log("COLUMN DATA", columnData)
        const horizons = SoilHorizonsMenu.filter(h => h.menuName !== 'NA').map((h) => h.menuName)
        // console.log("COL DATA HORIZONS", horizons)

        const column = soilStore.data.soilSampleIds.map((id) => {
          return horizons.reduce((acc:any, h:any) => {
            // Remap because columnData keys are the full horizon i.e. ZN01 - A and not just ZN01
            const remapped: any = {}
            Object.values(columnData[h]).forEach((x:any) => remapped[x.idGroup] = x)
            const data = remapped[id]
            if (data !== undefined) {
              return [...acc, data.value]
            }
            return [...acc, ' - ']
          }, [])
        })

        const selectedColumnData = {columnIndex: header, columnData: column}
        payload = {...payload, selectedColumnData, selectedColumnHeaderName}
      } else {
        payload = {...payload, selectedColumnData: {columnIndex: -1, columnData: []}, selectedColumnHeaderName: ''}
      }

      // shrinks (or restores) the horizon data when the shrinkTable button is clicked
      const shrink = soilUIStore.toolbarState.shrinkTable
      if (shrink) {
        const indices = csvIndicesOf(data, toRemove)
        const shrunk = csvRemoveColumns(data, indices)
        const newHead = shrunk.head.map((h) => {
          return h
        })
        const csv = {...shrunk, head: newHead}
        payload = {...payload, shrunkHorizonData: csv}
      } else {
        payload = {...payload, shrunkHorizonData: data}

      }
      soilUIDataMachine.service.send({type: LoadingEvent.Update, payload})
    }
  }
})


/**
 * This atom is used to store the selected point from the map
 */
// FIXME: Put in soilUIStore so I don't need to import atom
// export const soilUISelectedPointAtom = atomWithReset<Maybe<SelectedPoint>>(nothing<SelectedPoint>())


// metaClientMachine.observer.subscribe({
//   next: (state) => {
//     if (state.value === LoadingEvent.Success) {
//       soilUIToolbarMachine.reset()
//       soilUIDataMachine.reset()
//       soilMapsMachine.reset()
//       soilPhotosMachine.reset()
//     }
//   }
// })