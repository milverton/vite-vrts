import {LoadingEvent, LoadingMachine} from "../core/machine";
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
    switch (state.type) {
      case LoadingEvent.Reset:
        // Reset the store
        networkSoilSamplesStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingEvent.Load:

        let client = state.payload;
        if (!client.isJust) {
          networkSoilSamplesMachine.fail("No client")
          return
        }
        client = client.value;
        const metas = client.getCleanSoilData()
        if (!metas || metas.length == 0) {
          networkSoilSamplesMachine.fail("No soil data");
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
            networkSoilSamplesMachine.fail(error.message);
          });
        })
         Promise.all(promises).then((values) => {
           return {metas, csvs: values.reduce((acc, cur) => ({...acc, ...cur}), {})};
        }).then(data => {
           networkSoilSamplesStore.data = data;
           networkSoilSamplesMachine.success();
         })
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        networkSoilSamplesMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }

  }
});
