import {logDebug} from "../logging";
import {metaStore} from "../meta/store";

// @ts-ignore
import {just, Maybe, nothing} from "true-myth/maybe";
import {LoadingEvent, LoadingMachine} from "../../../core/machine";
import {
  loadSoilMapMetas,
  loadSoilMapUrls,
  loadSoilPhotoMetas,
  loadSoilPhotoUrls,
} from "./transform";
// @ts-ignore
import {Result} from "true-myth/result";
import {resetSoil, resetSoilData, resetSoilMaps, resetSoilPhotos, SoilState} from "./model";
import {networkSoilPointsMachine, networkSoilPointsStore} from "../../../network/soil-points";
import {CsvType} from "../../../core/model";
import {networkSoilSamplesMachine, networkSoilSamplesStore} from "../../../network/soil-samples";
import {networkSoilPhotoUploadMachine} from "../../../network/soil-photo-upload";
import {networkSoilSamplesUploadMachine} from "../../../network/soil-samples-upload";
import {networkSoilPointsUploadMachine} from "../../../network/soil-points-upload";

// TODO: need to validate points file against horizons file to ensure that the points match.
// const checkSoilPoints = (points:ICsv, horizons:{[s:string]: ICsv}):Result<string[],string> => {
//   // 0 is the id column for soil points
//   // 2 is the id column for soil horizons but this could change
//   const ids = csvColumnData(points, 0)
//
//   const soilIds = Object
//     .keys(horizons)
//     .map(k => csvColumnData(horizons[k], 2))
//     .reduce((acc, ids) => {
//       for (let i = 0; i < ids.length; i++) {
//         // remove - A or - B from the id
//         const id = ids[i].split('-')[0].trim()
//         if (!acc.includes(id)) {
//           acc.push(id)
//         }
//       }
//       return acc
//     }, [])
//
//   const s1 = soilIds.filter(id => !ids.includes(id))
//   const s2 = ids.filter(id => !soilIds.includes(id))
//   if (s1.length > 0) {
//     return Result.err(`Soil points file contains ids that are not in the soil horizons file: ${s1.join(', ')}`)
//   }
//   if (s2.length > 0) {
//     return Result.err(`Soil horizons file contains ids that are not in the soil points file: ${s2.join(', ')}`)
//   }
//   return Result.ok([])
// }

export let soilStore: SoilState = resetSoil()
export const soilMachine = new LoadingMachine('Soil Machine')

soilMachine.observer.subscribe(
  (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        soilStore = {...soilStore,data: resetSoilData()}
        break
      case LoadingEvent.Update:
        soilStore.data.soilSampleIds = soilStore.data.soilPoints.csv.body.map(row => row[0])
        soilStore.data.soilPointsXY = soilStore.data.soilPoints.csv.body.map(row => [parseFloat(row[1]), parseFloat(row[2])])
        soilMachine.success()
        break
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        soilMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
)

networkSoilPointsMachine.observer.subscribe({
  next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        // @ts-ignore
        soilStore.data.soilPoints = {type: CsvType.SoilPoints, csv: networkSoilPointsStore.data.csv}
        // @ts-ignore
        soilStore.data.soilPointsMeta = just(networkSoilPointsStore.data.meta)
        soilMachine.service.send(LoadingEvent.Update)
        break;
      default:
        // networkSoilPointsMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
});

networkSoilSamplesMachine.observer.subscribe({
  next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        // @ts-ignore
        soilStore.data.soilDataMetas = networkSoilSamplesStore.data.metas;
        // @ts-ignore
        soilStore.data.soilHorizonData = networkSoilSamplesStore.data.csvs;
        soilMachine.service.send(LoadingEvent.Update)
        break;
        default:
          break;
    }
  }
});


networkSoilPointsUploadMachine.observer.subscribe({
  next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        networkSoilPointsMachine.reset()
        // @ts-ignore
        networkSoilPointsMachine.service.send(LoadingEvent.Load, client.value)
        break;
      default:
        break;
    }
  }
});

networkSoilSamplesUploadMachine.observer.subscribe({
next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        networkSoilSamplesMachine.reset()
        // @ts-ignore
        networkSoilSamplesMachine.service.send(LoadingEvent.Load, metaStore.client.value)
        break;
      default:
        break;
    }
  }
});






// networkSoilFusionMachine.observer.subscribe({
//   next: (state) => {
//     switch(state.value) {
//       case LoadingEvent.Success:
//         soilStore.data.soilFusion = {type: CsvType.SoilFusion, csv: networkSoilFusionStore.data.csvs}
//         break;
//     }
//   }
// });

// merge(networkSoilPointsMachine.observer, networkSoilSamplesMachine.observer).subscribe({
//   next: (state) => {
//     if (state.value === LoadingEvent.Success) {
//       if (soilStore.data.soilPoints.csv.body.length > 0 && Object.keys(soilStore.data.soilHorizonData).length > 0) {
//         console.log('Soil points and soil horizons loaded, sending load to soilMachine')
//         soilMachine.service.send(LoadingEvent.Update)
//       }
//     }
//   }
// });



export const soilPhotosMachine = new LoadingMachine('Soil Photos Machine')
soilPhotosMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        soilStore = {...soilStore, photos: resetSoilPhotos()}
        break
      case LoadingEvent.Load:
        if (!metaStore.client.isJust) {
          soilPhotosMachine.fail('No meta client')
          return
        }
        if (metaStore.client.isJust) {
          const p1 = loadSoilPhotoMetas(soilStore, metaStore.client.value)
          const p2 = loadSoilPhotoUrls(soilStore, metaStore.client.value)
          Promise.all([p1,p2])
            .then(() => {
              soilPhotosMachine.success()
            })
            .catch((e) => {
              logDebug('Error loading soil photos', e)
              soilPhotosMachine.fail(`Error loading soil photos: ${e.toString()}`)
            })
        }
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        soilPhotosMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break


    }
  }
})

networkSoilPhotoUploadMachine.observer.subscribe({
  next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        soilPhotosMachine.reset()
        soilPhotosMachine.service.send(LoadingEvent.Load)
        break;
      default:
        break;
    }
  }
});

export const soilMapsMachine = new LoadingMachine('Soil Maps Machine')
soilMapsMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        soilStore = {...soilStore, maps: resetSoilMaps()}
        break
      case LoadingEvent.Load:
        if (!metaStore.client.isJust) {
          soilMapsMachine.fail('No meta client')
          return
        }
        if (metaStore.client.isJust) {
          const p1 = loadSoilMapMetas(soilStore, metaStore.client.value)
          const p2 = loadSoilMapUrls(soilStore, metaStore.client.value)
          Promise.all([p1,p2])
            .then(() => {
              // console.log(soilStore)
              soilMapsMachine.success()
            })
            .catch((e) => {
              logDebug('Error loading soil maps', e)
              soilMapsMachine.fail(`Error loading soil maps: ${e.toString()}`)
            })
        }
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        soilMapsMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

