

// Assuming you've imported necessary dependencies from the provided code

// Initial state for the Ping store
import {LoadingEvent, LoadingMachine} from "../core/machine";
import {logFailure} from "../lib/stores/logging";

let networkPingStore = {
  data: {},
  error: {}
};

export const networkPingMachine = new LoadingMachine('Ping Machine');
networkPingMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        // Reset the store
        networkPingStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingEvent.Update:
        // Fetch data from /api/v1/ping
        fetch('http://localhost:3001/api/v1/core/check')
          .then(response => {
            if (!response.ok) {
              console.log(response)
              throw new Error(`Network response was not ok, status: ${response.status} ${response.statusText}`)
            }
            // return response.json();
          })
          .then((data: any) => {
            networkPingStore.data = data;
            networkPingMachine.success();
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkPingStore.error = error.message;
            networkPingMachine.fail(error.message);
          });
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        networkPingMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }

    switch (state.type) {

      case LoadingEvent.Failure:
        logFailure('Ping Machine', "Could not ping the server");
        break;
    }
  }
});



// Initiate the loading process
// pingMachine.service.send({ type: LoadingEvent.Load });
