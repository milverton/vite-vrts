import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";
export let networkMetaStore = {
  data: null,
  error: null
};

export const networkMetaMachine = new LoadingMachine('Network Meta Machine');
networkMetaMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkMetaStore = {
          data: null,
          error: null
        };
        break;
      case LoadingState.Loading:
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
            networkMetaMachine.service.send({ type: LoadingEvent.Success });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkMetaStore.error = error.message;
            networkMetaMachine.service.send({ type: LoadingEvent.Failure });
          });
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
