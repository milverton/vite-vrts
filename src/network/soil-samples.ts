import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {logWarning} from "../lib/stores/logging";
import {Meta} from "../core/meta";
import {emptyCsv} from "../lib/csv";

export let networkSoilSamplesStore = {
  data: {},
  error: {}
};

export const networkSoilSamplesMachine = new LoadingMachine('Network Soil Samples Machine');
networkSoilSamplesMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkSoilSamplesStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingState.Loading:

        let client = state.event.payload;
        if (!client.isJust) {
          networkSoilSamplesMachine.service.send({ type: LoadingEvent.Failure })
          return
        }
        client = client.value;
        const metas = client.getCleanSoilData()
        if (!metas || metas.length == 0) {
          networkSoilSamplesMachine.service.send({ type: LoadingEvent.Failure });
          return;
        }
        let promises = metas.map((meta:Meta) => {
          return fetch(`http://localhost:3001/api/v1/data/csv/${meta.uid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok, status: ${response.status} ${response.statusText}`)
            }
            return response.json().then(csv => {
              // Map the csv to the horizon, see SoilHorizonsMenu
              switch (meta.variation.toLowerCase()) {
                case "horizon-0":
                  return {0: csv}
                case "horizon-1":
                  return {1: csv}
                case "horizon-2":
                  return {2: csv}
                default:
                  logWarning('Network Soil Samples Machine', `Unknown horizon variation ${meta.variation}`)
                  return {0: emptyCsv()}
              }
              // return {[meta.variation]: csv}
            })

          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkSoilSamplesStore.error = error.message;
            networkSoilSamplesMachine.service.send({ type: LoadingEvent.Failure });
          });
        })
         Promise.all(promises).then((values) => {
           return {metas, csvs: values.reduce((acc, cur) => ({...acc, ...cur}), {})};
        }).then(data => {
           networkSoilSamplesStore.data = data;
           networkSoilSamplesMachine.service.send({ type: LoadingEvent.Success });
         })
        break;
    }

    // switch (state.event.type) {
    //
    //   case LoadingEvent.Failure:
    //     logFailure('Network Meta Machine', "Could not load metadata");
    //     break;
    // }
  }
});
