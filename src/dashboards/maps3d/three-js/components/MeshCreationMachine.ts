import {LoadingEvent, LoadingMachine} from "../../../../core/machine";
import {boundaryStore} from "../../../../lib/stores/boundary/store";
import {getStaticImage4X, getStaticImageFromBbox,} from "../../transform";
import * as THREE from "three";
import {logFailure} from "../../../../lib/stores/logging";
import {BoundaryElevationData, convertBoundariesToLines} from "../transform";



interface ThreeJsStoreState {
  Block: string,
  XColumn: number,
  YColumn: number,
  Bbox: any,
  InterpolatedData: Array<number>,
  BaseHeight: number,
  BoundaryElevationData: BoundaryElevationData | null,
}

interface MaterialState {
  SatelliteEnabled: boolean,
  SatelliteTexture: any,
  InterpolatedUrl: string,
  WaterFlowUrl: string,
}

const InitialMaterialState: MaterialState = {
  SatelliteEnabled: true,
  SatelliteTexture: null,
  InterpolatedUrl: "",
  WaterFlowUrl: "",
}

interface UserSettings {
  Weight: number,
  Resolution: number,
  Radius: number,
  Samples: number,
  SquaredHeight: number,
  ShowSatellite: boolean,
  InterpolatedUrl: string,
  Opacity: number,
  WaterWeight: number,
  Iterations: number,
  WaterResolution: number,
  WaterSamples: number,
  WaterRadius: number,
  WaterOpacity: number,
  ShowBoundaries: boolean,
  SatelliteScaleUp: boolean,
}

interface ISceneSettings {
  autoRotateSpeed: number,
  sunAngle: number,
  sunHeight: number,
}

const SceneSettings: ISceneSettings = {
  autoRotateSpeed: 0.0,
  sunAngle: 0,
  sunHeight: 30,
}
const InitialUserSettings: UserSettings = {
  Weight: 0.05,
  Resolution: 15,
  Radius: 50,
  Samples: 30,
  SquaredHeight: 5,
  ShowSatellite: true,
  InterpolatedUrl: "",
  Opacity: 1,
  WaterWeight: 0.05,
  Iterations: 75000,
  WaterResolution: 4,
  WaterSamples: 50,
  WaterRadius: 75,
  WaterOpacity: 1,
  ShowBoundaries: true,
  SatelliteScaleUp: false,
}

const InitialThreeJsStore: ThreeJsStoreState = {
  Block: "",
  XColumn: 0,
  YColumn: 0,
  Bbox: null,
  InterpolatedData: [],
  BaseHeight: 0,
  BoundaryElevationData: null,
}

interface InterpolationResult {
  values: [],
  x_column: number,
  y_column: number,
}

export interface BoundaryElevationDto {
  outer: [],
  inner: [][],
}


interface ReceivedData {
  interpolation_results: InterpolationResult,
  boundary_elevation_dto: Array<BoundaryElevationDto>,

}

export let threeJsStore = {
  basicState: InitialThreeJsStore,
  userSettings: InitialUserSettings,
  sceneSettings: SceneSettings,
  mapSettings: InitialMaterialState,
}

export const threeJsUserSettingsMachine = new LoadingMachine('ThreeJs User Settings Machine')
threeJsUserSettingsMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        threeJsStore = {...threeJsStore, userSettings: InitialUserSettings}
        break
      case LoadingEvent.Update:
        const payload = state.payload

        threeJsStore = {
          ...threeJsStore, userSettings: {
            ...threeJsStore.userSettings,
            Weight: payload.weight,
            Resolution: payload.resolution,
            Samples: payload.samples,
            Radius: payload.radius,
            SquaredHeight: payload.squaredHeight,
            ShowSatellite: payload.showSatellite,
            InterpolatedUrl: payload.interpolatedUrl,
            Opacity: payload.opacity,
            WaterWeight: payload.waterWeight,
            Iterations: payload.iterations,
            WaterResolution: payload.waterResolution,
            WaterOpacity: payload.waterOpacity,
            WaterSamples: payload.waterSamples,
            WaterRadius: payload.waterRadius,
            ShowBoundaries: payload.showBoundaries,
            SatelliteScaleUp: payload.satelliteScaleUp,
          }
        }
        threeJsUserSettingsMachine.success()
        break
    }
  }
})

export const threeJsSceneSettingsMachine = new LoadingMachine('ThreeJs Camera Settings Machine')
threeJsSceneSettingsMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        threeJsStore = {...threeJsStore, sceneSettings: SceneSettings}
        break
      case LoadingEvent.Update:
        const args = state.payload
        threeJsStore = {...threeJsStore,
          sceneSettings: {
            ...threeJsStore.sceneSettings,
            autoRotateSpeed: args.autoRotateSpeed,
            sunHeight: args.sunHeight,
            sunAngle: args.sunAngle
          }
        }
        threeJsSceneSettingsMachine.success()
        break;
      case LoadingEvent.Success:
        break;
      case LoadingEvent.Failure:
        break;
      default:
        threeJsSceneSettingsMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})


/** ThreeJsMachine sets the basic state needed in the threeJsStore.
 * It takes in a Block and a Bbox
 * @param {[string]} Block - The block of the current client
 * @param {[Bbox]} Bbox - The bounding box of the current client
 */
export const threeJsHeightMachine = new LoadingMachine('ThreeJs Machine')
threeJsHeightMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        threeJsStore = {...threeJsStore, basicState: {...InitialThreeJsStore, BoundaryElevationData: null}}
        break
      case LoadingEvent.Load:
        // Check if the bbox is ready for use
        if (!boundaryStore.bbox || boundaryStore.bbox.isUnset()) {
          threeJsHeightMachine.failExpected('Bbox is not set')
          break
        }

        // eslint-disable-next-line no-case-declarations
        const data = {
          dealer: state.payload.dealer,
          client: state.payload.client,
          block: state.payload.block,
          season: Number.parseInt(state.payload.season),
          resolution: state.payload.resolution,
          interpolation_weight: state.payload.weight,
          max_samples: state.payload.samples,
          type: "em",
          status: "clean",
          column: 2,
          radius: state.payload.radius,
        };

        const stringifyData:string = JSON.stringify(data)
        // const uri = encodeURI(stringifyData)
        const uri:string = window.btoa(stringifyData)

        const url:string = `/api/v1/map/elevation-map?uid=${uri}`;
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(response => {
          return response.json()
        }).then(response => {
          // console.log("------------- RESPONSE", response)
          const receivedData = (response as ReceivedData)
          const columnData = receivedData.interpolation_results.values
          const x_column = receivedData.interpolation_results.x_column
          const y_column = receivedData.interpolation_results.y_column
          const boundaries = receivedData.boundary_elevation_dto

          let interpolatedArray = []
          let min = 100000000
          for (let i = 0; i < columnData.length; i++) {
            if (columnData[i] === -100) continue
            if (columnData[i] < min) min = columnData[i]
          }
          interpolatedArray = columnData.map((value) => {
            if (value === -100) return 0
            if (value < min) return 0
            return value - min
          })
          // console.log("BEFORE FORMAT: ", boundaries)
          const boundaryData = convertBoundariesToLines(boundaryStore.bbox, boundaryStore.boundary, boundaries, min)
          // console.log("FORMATTED BOUNDARIES INTO LINES", boundaryData.values)
          let maxHeight = -100000
          for (let i = 0; i < interpolatedArray.length; i++) {
            if (interpolatedArray[i] > maxHeight) maxHeight = interpolatedArray[i]
          }
          threeJsStore = {
            ...threeJsStore,
            basicState: {
              ...threeJsStore.basicState,
              InterpolatedData: interpolatedArray,
              BaseHeight: maxHeight,
              XColumn: x_column,
              YColumn: y_column,
              BoundaryElevationData: boundaryData
            }
          }
          threeJsHeightMachine.success()

        }).catch(error => {
          logFailure('3D Error', 'Failed to load elevation data, trying to load satellite elevation.')
          console.log(error)
          threeJsStore = {...threeJsStore, basicState: {...InitialThreeJsStore, BoundaryElevationData: null}}
          threeJsHeightMachine.fail('Failed to load elevation data, trying to load satellite elevation.')
        }).catch(() => {
          logFailure('3D Error', 'There was an error loading elevation data for this client.')
          threeJsStore = {
            ...threeJsStore,
            basicState: {
              ...threeJsStore.basicState,
              InterpolatedData: [],
              BaseHeight: 0,
              XColumn: 0,
              YColumn: 0,
              BoundaryElevationData: null
            }
          }
          threeJsHeightMachine.fail('(Fallthrough) There was an error loading elevation data for this client.')
        })
        break;
      case LoadingEvent.Success:
        break;
      case LoadingEvent.Failure:
        break;
      default:
        threeJsHeightMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

//          COME BACK TO THIS
//            let columnData = data.elevation
//             let interpolatedArray = []
//             let min = 100000000
//             for(let i = 0; i < columnData.length; i++) {
//               if(columnData[i] === -100) continue
//               if(columnData[i] < min) min = columnData[i]
//             }
//             interpolatedArray = columnData.map((value) => {
//               if(value === -100) return 0
//               if(value < min) return 0
//               return value - min
//             })
//
//             threeJsStore = {...threeJsStore,
//               basicState: {...threeJsStore.basicState,
//                 InterpolatedData: interpolatedArray,
//                 BaseHeight:0,
//                 XColumn: data.cols,
//                 YColumn: data.rows,
//                 BoundaryElevationData: null
//               }}
//             threeJsHeightMachine.success()

/** ThreeJsSatelliteMachine sets the satellite data in the threeJsStore.
 * It takes in a Block and a Bbox
 * @param {[string]} Block - The block of the current client
 * @param {[Bbox]} Bbox - The bounding box of the current client
 */


export const threeJsSatelliteMachine = new LoadingMachine('ThreeJs Satellite Machine')
threeJsSatelliteMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        threeJsStore = {...threeJsStore}
        break
      case LoadingEvent.Load:
        // Check if the bbox is ready for use
        if (!boundaryStore.bbox || boundaryStore.bbox.isUnset()) {
          threeJsSatelliteMachine.failExpected('Bbox is not set')
          break
        }
        let args = state.payload
        const currentBlock = args.block
        if (args.showSatellite === false) {
          threeJsStore = {
            ...threeJsStore,
            basicState: {...threeJsStore.basicState, Block: currentBlock, Bbox: args.bbox},
            mapSettings: {...threeJsStore.mapSettings, SatelliteTexture: null}
          }
          threeJsSatelliteMachine.success()
          break
        }

        let scaleUp = threeJsStore.userSettings.SatelliteScaleUp
        let texturePromise = scaleUp ? getStaticImage4X(args.bbox) : getStaticImageFromBbox(args.bbox)
        texturePromise.then((res) => {
          threeJsStore = {
            ...threeJsStore,
            basicState: {...threeJsStore.basicState, Block: currentBlock, Bbox: args.bbox},
            mapSettings: {...threeJsStore.mapSettings, SatelliteTexture: res}
          }

          threeJsSatelliteMachine.success()
        }).catch((err) => {
          logFailure('3D Error', 'Failed to load satellite image.')
          threeJsStore = {
            ...threeJsStore,
            basicState: {...threeJsStore.basicState},
            mapSettings: {...threeJsStore.mapSettings, SatelliteTexture: null}
          }

          threeJsSatelliteMachine.fail(err)
          // threeJsSatelliteMachine.fail('(Fallthrough) Failed to load satellite image.')
        })
        break
      case LoadingEvent.Success:
        break;
      case LoadingEvent.Failure:
        break;
      default:
        threeJsSatelliteMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})


export const threeJsWaterFlowMachine = new LoadingMachine('ThreeJs Water Flow Machine')
threeJsWaterFlowMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        threeJsStore = {...threeJsStore, mapSettings: {...threeJsStore.mapSettings, WaterFlowUrl: ''}}
        break
      case LoadingEvent.Load:
        // Check if the bbox is ready for use
        if (!boundaryStore.bbox || boundaryStore.bbox.isUnset()) {
          threeJsWaterFlowMachine.failExpected('Bbox is not set')
          break
        }
        let payload = state.payload

        const data = {
          dealer: payload.dealer,
          client: payload.client,
          block: payload.block,
          season: Number.parseInt(payload.season),
          iterations: payload.iterations,
          interpolation_weight: payload.waterWeight,
          resolution: payload.waterResolution,
          radius: payload.waterRadius,
          samples: payload.waterSamples,
        };
        const stringifyData = JSON.stringify(data)
        // const uri = encodeURI(stringifyData)
        const uri = window.btoa(stringifyData)

        const url = `/api/v1/map/water-sim?uid=${uri}`
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => {
          if (!res.ok) {
            throw new Error(res.statusText)
          }
          return res.arrayBuffer()
        }).then((res) => {
          let blob = new Blob([res], {type: 'image/png'})

          let loader = new THREE.TextureLoader()
          loader.crossOrigin = "Anonymous"
          let url = URL.createObjectURL(blob)
          threeJsStore = {...threeJsStore, mapSettings: {...threeJsStore.mapSettings, WaterFlowUrl: url}}
          threeJsWaterFlowMachine.success()
        }).catch(() => {
          logFailure('3D Error', 'Failed to simulate water relief.')
          threeJsWaterFlowMachine.fail('Failed to simulate water relief.')
        })
        break;
      default:
        threeJsWaterFlowMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})
