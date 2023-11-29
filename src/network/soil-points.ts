import {LoadingEvent, LoadingMachine} from "../core/machine";
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
    switch (state.type) {
      case LoadingEvent.Reset:
        // Reset the store
        networkSoilPointsStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingEvent.Load:
        let clientMaybe: Maybe<DBMetaGroup> = state.payload as Maybe<DBMetaGroup>;
        if (!clientMaybe.isJust) {
          networkSoilPointsMachine.fail(`Could not load client`)
          return
        }
        let client = clientMaybe.value;
        const meta = client.getCleanSoilPoints();
        if (!meta) {
          networkSoilPointsMachine.fail(`Could not load soil points`)
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
            networkSoilPointsMachine.success();
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkSoilPointsStore.error = error.message;
            networkSoilPointsMachine.fail(error.message);
          });
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        networkSoilPointsMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }

    // switch (state.type) {
    //
    //   case LoadingEvent.Failure:
    //     logFailure('Network Meta Machine', "Could not load metadata");
    //     break;
    // }
  }
});
