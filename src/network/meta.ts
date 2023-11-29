import {LoadingEvent, LoadingMachine} from "../core/machine";

export let networkMetaStore = {
  data: null,
  error: null
};

export const networkMetaMachine = new LoadingMachine('Network Meta Machine');
networkMetaMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        // Reset the store
        networkMetaStore = {
          data: null,
          error: null
        };
        break;
      case LoadingEvent.Update:
        fetch('http://localhost:3001/api/v1/core/metadata')
          .then(response => {
            if (!response.ok) {
              // console.error(response)
              throw new Error(`Network response was not ok, status: ${response.status} ${response.statusText}`)
            }
            return response.json();
          })
          .then(data => {
            networkMetaStore.data = data;
            networkMetaMachine.success();
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkMetaStore.error = error.message;
            networkMetaMachine.fail(error.message);
          });
        break;
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        networkMetaMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
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
