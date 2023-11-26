import {LoadingEvent, LoadingMachine, LoadingState} from "../../core/machine";
import {
  MapLayerSelection,
  MapStoreState,
  resetMapDrawFunctions2D,
  resetMapDrawFunctions3D,
  resetMapLayerInputs,
  resetMapLayers,
  resetMapStore
} from "./model";
import {logFailure} from "../../lib/stores/logging";
import {mapLayersTo2DDrawFunctions} from "./transform";


export let mapStore: MapStoreState = resetMapStore()


export const mapStoreLayersMachine = new LoadingMachine('Map Store Layers Machine')

mapStoreLayersMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        mapStore = {...mapStore, mapLayersState:resetMapLayers()}
        break
      case LoadingState.Loading:
        const layers = state.event.payload as MapLayerSelection[]
        if (layers.length === 0) {
          logFailure("Error creating map state", "No active layers")
          mapStoreLayersMachine.service.send(LoadingEvent.Failure)
          return
        }
        mapStore = {...mapStore, mapLayersState: {layers}}
        mapStoreLayersMachine.service.send(LoadingEvent.Success)
        break
      default:
        break
    }
  }
})

export const mapStoreDrawState2DMachine = new LoadingMachine('Map Store Draw State 2D Machine')

mapStoreDrawState2DMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        mapStore = {...mapStore,
          mapDrawFunctions2DState: resetMapDrawFunctions2D(),
          mapDrawFunctions3DState: resetMapDrawFunctions3D(),
        }
        break
      case LoadingState.Loading:
        const {args} = state.event.payload
        // if (is3D) {
        //   const functions = mapLayersTo3DDrawFunctions(args)
        //   if (functions.isErr) {
        //     logFailure("Error creating map draw functions", functions.error)
        //     mapStoreDrawState2DMachine.service.send(LoadingEvent.Failure)
        //     return
        //   }
        //   mapStore = {
        //     ...mapStore,
        //     mapDrawFunctions3DState: {
        //       drawFunctions3D: functions.unwrapOr({...resetMapDrawFunctions3D().drawFunctions3D}),
        //       drawFunctions3DArgs: args,
        //     }
        //   }
        //   mapStoreDrawState2DMachine.service.send(LoadingEvent.Success)
        //   return
        // }
        // 2D
        const functions = mapLayersTo2DDrawFunctions(args)
        if (functions.isErr) {
          logFailure("Error creating map draw functions", functions.error)
          mapStoreDrawState2DMachine.service.send(LoadingEvent.Failure)
          return
        }
        mapStore = {
          ...mapStore,
          mapDrawFunctions2DState: {
            drawFunctions2D: functions.unwrapOr({...resetMapDrawFunctions2D().drawFunctions2D}),
            drawFunctions2DArgs: args,
          }
        }

        mapStoreDrawState2DMachine.service.send(LoadingEvent.Success)
        break
    }
  }
})

export const mapStoreInputsMachine = new LoadingMachine('Map Store Inputs Machine')

mapStoreInputsMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        mapStore = {...mapStore, mapLayerInputsState: resetMapLayerInputs()}
        break
      case LoadingState.Updating:
        const validProperties = Object.keys(resetMapLayerInputs())
        const properties = state.event.payload as {[key: string]: any}
        const validPropertiesInPayload = Object.keys(properties).filter((key) => validProperties.includes(key))
        if (validPropertiesInPayload.length === 0) {
          logFailure("Error creating map inputs", "No valid properties in payload")
          mapStoreInputsMachine.service.send(LoadingEvent.Failure)
          return
        }
        const newInputs = validPropertiesInPayload.reduce((acc, key) => {
          return {...acc, [key]: properties[key]}
        }, {})
        mapStore = {...mapStore, mapLayerInputsState: {...mapStore.mapLayerInputsState, ...newInputs}}
        mapStoreInputsMachine.service.send(LoadingEvent.Success)
        break
    }
  }
})




