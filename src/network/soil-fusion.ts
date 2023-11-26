import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";

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
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkSoilFusionStore = {
          data: {csv: emptyCsv(), meta: {}},
          error: {}
        };
        break;
      case LoadingState.Loading:
        let clientMaybe = state.event.payload as Maybe<DBMetaGroup>;
        if (!clientMaybe.isJust) {
          networkSoilFusionMachine.service.send({ type: LoadingEvent.Failure })
          return
        }
        const client = clientMaybe.value;
        const meta = client.getSoilFusionData();
        if (!meta) {
          console.warn('No soil fusion meta data found')
          networkSoilFusionMachine.service.send({ type: LoadingEvent.Failure })
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
            networkSoilFusionMachine.service.send({ type: LoadingEvent.Success });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkSoilFusionStore.error = error.message;
            networkSoilFusionMachine.service.send({ type: LoadingEvent.Failure });
          });
        break;
    }

  }
});

networkSoilFusionMachine.observer.subscribe({
  next: (state) => {
    switch(state.value) {
      case LoadingEvent.Success:
        soilStore.data.soilFusion = {type: CsvType.SoilFusion, csv: networkSoilFusionStore.data.csv}
        fusionMachine.reset()
        fusionMachine.service.send(LoadingEvent.Load)
        break;
    }
  }
});