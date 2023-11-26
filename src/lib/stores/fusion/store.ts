import {CsvType} from "../../../core/model";
import {csvToObject, emptyCsv, ICsv} from "../../csv";
import {logFailure} from "../logging";
import {LoadingEvent, LoadingMachine, LoadingState} from "../../../core/machine";
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
    switch (state.value) {
      case LoadingState.Empty:
        fusionStore = resetFusion()
        break
      case LoadingState.Loading:
        const {csv} = soilStore.data.soilFusion

        if (csv === undefined) {
          // logFailure('Fusion Header Error', 'Fusion csv is undefined')
          fusionMachine.service.send(LoadingEvent.Failure)
          return
        }
        if (csv.head.length === 0) {
          logFailure('Fusion Header Error', 'Fusion csv has no header')
          fusionMachine.service.send(LoadingEvent.Failure)
          return
        }
        if (csv.body.length === 0) {
          logFailure('Fusion Body Error', 'Fusion csv has no body')
          fusionMachine.service.send(LoadingEvent.Failure)
          return
        }

        fusionStore = {...fusionStore, fusionData: {type: CsvType.SoilFusion, csv: csv}}

        const ids = csvToObject(fusionStore.fusionData.csv)['Sample ID']
        if (ids === undefined) {
          fusionMachine.service.send(LoadingEvent.Failure)
          return
        }
        fusionStore = {...fusionStore, fusionSampleIds: ids}
        fusionMachine.service.send(LoadingEvent.Success)

        break
    }
  }
})

