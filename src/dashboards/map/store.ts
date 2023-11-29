import {LoadingEvent, LoadingMachine} from "../../core/machine";
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
    switch (state.type) {
      case LoadingEvent.Reset:
        mapStore = {...mapStore, mapLayersState:resetMapLayers()}
        break
      case LoadingEvent.Load:
        const layers = state.payload as MapLayerSelection[]
        if (layers.length === 0) {
          logFailure("Error creating map state", "No active layers")
          mapStoreLayersMachine.fail("No active layers")
          return
        }
        mapStore = {...mapStore, mapLayersState: {layers}}
        mapStoreLayersMachine.success()
        break
      default:
        mapStoreLayersMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

export const mapStoreDrawState2DMachine = new LoadingMachine('Map Store Draw State 2D Machine')

mapStoreDrawState2DMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        mapStore = {...mapStore,
          mapDrawFunctions2DState: resetMapDrawFunctions2D(),
          mapDrawFunctions3DState: resetMapDrawFunctions3D(),
        }
        break
      case LoadingEvent.Load:
        const {args} = state.payload
        const functions = mapLayersTo2DDrawFunctions(args)
        if (functions.isErr) {
          logFailure("Error creating map draw functions", functions.error)
          mapStoreDrawState2DMachine.fail(functions.error)
          return
        }
        mapStore = {
          ...mapStore,
          mapDrawFunctions2DState: {
            drawFunctions2D: functions.unwrapOr({...resetMapDrawFunctions2D().drawFunctions2D}),
            drawFunctions2DArgs: args,
          }
        }

        mapStoreDrawState2DMachine.success()
        break
      default:
        mapStoreDrawState2DMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

export const mapStoreInputsMachine = new LoadingMachine('Map Store Inputs Machine')

mapStoreInputsMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        mapStore = {...mapStore, mapLayerInputsState: resetMapLayerInputs()}
        break
      case LoadingEvent.Update:
        const validProperties = Object.keys(resetMapLayerInputs())
        const properties = state.payload as {[key: string]: any}
        const validPropertiesInPayload = Object.keys(properties).filter((key) => validProperties.includes(key))
        if (validPropertiesInPayload.length === 0) {
          logFailure("Error creating map inputs", "No valid properties in payload")
          mapStoreInputsMachine.fail("No valid properties in payload")
          return
        }
        const newInputs = validPropertiesInPayload.reduce((acc, key) => {
          return {...acc, [key]: properties[key]}
        }, {})
        mapStore = {...mapStore, mapLayerInputsState: {...mapStore.mapLayerInputsState, ...newInputs}}
        mapStoreInputsMachine.success()
        break
      default:
        mapStoreInputsMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})




