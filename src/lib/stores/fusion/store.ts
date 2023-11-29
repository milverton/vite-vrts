import {CsvType} from "../../../core/model";
import {csvToObject, emptyCsv, ICsv} from "../../csv";
import {logFailure} from "../logging";
import {LoadingEvent, LoadingMachine} from "../../../core/machine";
import {soilStore} from "../soil/store";


interface FusionState {
  fusionData: {type: CsvType, csv: ICsv}
  fusionSampleIds: string[]
}

const resetFusion = (): FusionState => {
  return {
    fusionData: {type: CsvType.Empty, csv: emptyCsv()},
    fusionSampleIds: [],
  }
}
export let fusionStore = resetFusion()

export const fusionMachine = new LoadingMachine('Fusion Machine')
fusionMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        fusionStore = resetFusion()
        break
      case LoadingEvent.Load:
        const {csv} = soilStore.data.soilFusion

        if (csv === undefined) {
          // logFailure('Fusion Header Error', 'Fusion csv is undefined')
          fusionMachine.fail('Fusion csv is undefined')
          return
        }
        if (csv.head.length === 0) {
          logFailure('Fusion Header Error', 'Fusion csv has no header')
          fusionMachine.fail('Fusion csv has no header')
          return
        }
        if (csv.body.length === 0) {
          logFailure('Fusion Body Error', 'Fusion csv has no body')
          fusionMachine.fail('Fusion csv has no body')
          return
        }

        fusionStore = {...fusionStore, fusionData: {type: CsvType.SoilFusion, csv: csv}}

        const ids = csvToObject(fusionStore.fusionData.csv)['Sample ID']
        if (ids === undefined) {
          fusionMachine.fail('Fusion csv has no Sample ID column')
          return
        }
        fusionStore = {...fusionStore, fusionSampleIds: ids}
        fusionMachine.success()

        break
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        fusionMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

