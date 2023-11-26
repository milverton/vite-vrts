import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {DBMetaGroup} from "../lib/db";
// @ts-ignore
import {Maybe} from "true-myth/maybe";

export let networkSoilPointsStore = {
  data: {},
  error: {}
};

export const networkSoilPointsMachine = new LoadingMachine('Network Soil Points Machine');
networkSoilPointsMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkSoilPointsStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingState.Loading:
        let clientMaybe: Maybe<DBMetaGroup> = state.event.payload as Maybe<DBMetaGroup>;
        if (!clientMaybe.isJust) {
          networkSoilPointsMachine.service.send({ type: LoadingEvent.Failure })
          return
        }
        let client = clientMaybe.value;
        const meta = client.getCleanSoilPoints();
        if (!meta) {
          networkSoilPointsMachine.service.send({ type: LoadingEvent.Failure })
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
            networkSoilPointsStore.data = {csv: data, meta};
            networkSoilPointsMachine.service.send({ type: LoadingEvent.Success });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkSoilPointsStore.error = error.message;
            networkSoilPointsMachine.service.send({ type: LoadingEvent.Failure });
          });
        break;
    }

    // switch (state.value) {
    //
    //   case LoadingEvent.Failure:
    //     logFailure('Network Meta Machine', "Could not load metadata");
    //     break;
    // }
  }
});
