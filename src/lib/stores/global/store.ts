import {LoadingEvent} from "../../../core/machine";
import {soilUIDataMachine, soilUIToolbarMachine} from "../../../dashboards/soil/store";
import {soilMachine, soilMapsMachine, soilPhotosMachine} from "../soil/store";
import {fusionMachine} from "../fusion/store";
import {metaClientMachine, metaStore} from "../meta/store";
import {merge} from "rxjs";
import {networkSoilPointsMachine} from "../../../network/soil-points";
import {networkSoilSamplesMachine} from "../../../network/soil-samples";
import {networkSoilFusionMachine} from "../../../network/soil-fusion";
import {
  statsDataMachine,
  statsRegressionMachine,
  statsRegressionOutliersMachine, statsUIForRegressionsMachine,
  statsUIForXYDataMachine
} from "../../../dashboards/stats/store.ts";

const loadGlobal = () => {

  const subB = merge(metaClientMachine.observer).subscribe({
    next: (state:any) => {
        if (state.type === LoadingEvent.Reset) {
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
          // statsReportUpdatingMachine.reset()
          networkSoilPointsMachine.reset()
          networkSoilSamplesMachine.reset()
          networkSoilFusionMachine.reset()
        }

        if (state.type === LoadingEvent.Success) {
          console.log(`[GLOBAL] Received metaClientMachine success, sending load to 4 machines, metas: `, metaStore.metasByGroup)
          soilMachine.service.send(LoadingEvent.Update)
          networkSoilPointsMachine.service.send(LoadingEvent.Load, metaStore.client);
          networkSoilSamplesMachine.service.send(LoadingEvent.Load, metaStore.client);
          networkSoilFusionMachine.service.send(LoadingEvent.Load, metaStore.client);
          soilPhotosMachine.service.send(LoadingEvent.Load)
          soilMapsMachine.service.send(LoadingEvent.Load)
        }
      }
  })

  return () => {
    subB.unsubscribe()
  }
}
export default loadGlobal

