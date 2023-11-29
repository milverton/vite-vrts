import {LoadingEvent, LoadingMachine} from "../core/machine";

import {DBMetaGroup} from "../lib/db";
// @ts-ignore
import {Maybe} from "true-myth/maybe";
import {CsvType} from "../core/model";
import {soilStore} from "../lib/stores/soil/store";
import {fusionMachine} from "../lib/stores/fusion/store";
import {emptyCsv} from '../lib/csv';
export let networkSoilFusionStore = {
  data: {csv: emptyCsv(), meta: {}},
  error: {}
};

export const networkSoilFusionMachine = new LoadingMachine('Network Soil Fusion Machine');
networkSoilFusionMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        // Reset the store
        networkSoilFusionStore = {
          data: {csv: emptyCsv(), meta: {}},
          error: {}
        };
        break;
      case LoadingEvent.Load:
        let clientMaybe = state.payload as Maybe<DBMetaGroup>;
        if (!clientMaybe.isJust) {
          networkSoilFusionMachine.fail(`No client found`)
          return
        }
        const client = clientMaybe.value;
        const meta = client.getSoilFusionData();
        if (!meta) {
          console.warn('No soil fusion meta data found')
          networkSoilFusionMachine.fail(`No soil fusion meta data found`)
          return
        }

        fetch(`http://localhost:3001/api/v1/data/csv/${meta.uid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok, status: ${response.status} ${response.statusText}`)
            }
            return response.json();
          })
          .then(data => {
            networkSoilFusionStore.data = {csv: data, meta};
            networkSoilFusionMachine.success();
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkSoilFusionStore.error = error.message;
            networkSoilFusionMachine.fail(error.message);
          });
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        networkSoilFusionMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }

  }
});

networkSoilFusionMachine.observer.subscribe({
  next: (state) => {
    switch(state.type) {
      case LoadingEvent.Success:
        soilStore.data.soilFusion = {type: CsvType.SoilFusion, csv: networkSoilFusionStore.data.csv}
        fusionMachine.reset()
        fusionMachine.service.send(LoadingEvent.Load)
        break;
    }
  }
});