import {LoadingEvent} from "../../../core/machine";
import {soilUIDataMachine, soilUIToolbarMachine} from "../../../dashboards/soil/store";
import {soilMachine, soilMapsMachine, soilPhotosMachine} from "../soil/store";
import {fusionMachine} from "../fusion/store";
import {metaClientMachine, metaMachine, metaStore} from "../meta/store";
import {
  statsDataMachine,
  statsRegressionMachine,
  statsRegressionOutliersMachine,
  statsReportUpdatingMachine,
  statsUIForRegressionsMachine,
  statsUIForXYDataMachine
} from "../../../dashboards/stats/store";
import {merge} from "rxjs";
import {networkSoilPointsMachine} from "../../../network/soil-points";
import {networkSoilSamplesMachine} from "../../../network/soil-samples";
import {networkSoilFusionMachine} from "../../../network/soil-fusion";

const loadGlobal = () => {
  const subA = metaMachine.observer.subscribe({

    next: () => {
      // console.log("[GLOBAL] metaMachine update, resetting metaClientMachine", state)
      // if (state.event.type === LoadingEvent.Success) {
      //   const client = metaStore.client
      //
      //   metaClientMachine.reset()
      //   metaClientMachine.service.send({type: LoadingEvent.Update, payload: client})
      // }
    }
  })
  const subB = merge(metaClientMachine.observer).subscribe({
    next: (state:any) => {
        if (state.event.type === LoadingEvent.Reset) {
          console.log('[GLOBAL] Received metaClientMachine reset, resetting all other machines')
          fusionMachine.reset()
          soilMachine.reset()
          soilPhotosMachine.reset()
          soilMapsMachine.reset()
          soilUIToolbarMachine.reset()
          soilUIDataMachine.reset()
          soilMapsMachine.reset()
          soilPhotosMachine.reset()
          statsRegressionOutliersMachine.reset()
          statsRegressionMachine.reset()
          statsUIForXYDataMachine.reset()
          statsUIForRegressionsMachine.reset()
          statsDataMachine.reset()
          statsDataMachine.reset()
          statsRegressionMachine.reset()
          statsUIForXYDataMachine.reset()
          statsUIForRegressionsMachine.reset()
          statsRegressionOutliersMachine.reset()
          statsReportUpdatingMachine.reset()
          // metaNoteLoadMachine.reset()
          networkSoilPointsMachine.reset()
          networkSoilSamplesMachine.reset()
          networkSoilFusionMachine.reset()
        }

        if (state.event.type === LoadingEvent.Success) {
          console.log(`[GLOBAL] Received metaClientMachine success, sending load to 4 machines, metas: `, metaStore.metas.length)
          // soilMachine.service.send(LoadingEvent.Load)
          networkSoilPointsMachine.service.send(LoadingEvent.Load, {payload: metaStore.client});
          networkSoilSamplesMachine.service.send(LoadingEvent.Load, {payload: metaStore.client});
          networkSoilFusionMachine.service.send(LoadingEvent.Load, {payload: metaStore.client});
          soilPhotosMachine.service.send(LoadingEvent.Load)
          soilMapsMachine.service.send(LoadingEvent.Load)
          // fusionMachine.service.send(LoadingEvent.Load)
          // metaNoteLoadMachine.service.send({type: LoadingEvent.Load, payload: metaStore.client})
        }
      }
  })
  // const subC = merge(metaCli).subscribe({
  //
  // });
  return () => {
    subA.unsubscribe()
    subB.unsubscribe()
  }
}
export default loadGlobal

