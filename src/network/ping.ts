

// Assuming you've imported necessary dependencies from the provided code

// Initial state for the Ping store
import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
import {logFailure} from "../lib/stores/logging";

let networkPingStore = {
  data: {},
  error: {}
};

export const networkPingMachine = new LoadingMachine('Ping Machine');
networkPingMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkPingStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingState.Updating:
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
            networkPingMachine.service.send({ type: LoadingEvent.Success });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkPingStore.error = error.message;
            networkPingMachine.service.send({ type: LoadingEvent.Failure });
          });
        break;
    }

    switch (state.value) {

      case LoadingEvent.Failure:
        logFailure('Ping Machine', "Could not ping the server");
        break;
    }
  }
});



// Initiate the loading process
// pingMachine.service.send({ type: LoadingEvent.Load });
