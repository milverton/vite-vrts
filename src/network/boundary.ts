
import {LoadingEvent, LoadingMachine, LoadingState} from "../core/machine";

import {NewBoundary} from "../lib/stores/boundary/model";

export let networkBoundaryAllFieldsStore = {
  data: {},
  error: {}
};

export const networkBoundaryAllFieldsMachine = new LoadingMachine('Network Boundary All Fields Machine');
networkBoundaryAllFieldsMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        // Reset the store
        networkBoundaryAllFieldsStore = {
          data: {},
          error: {}
        };
        break;
      case LoadingState.Loading:
        const meta = state.event.payload;
        if (meta === undefined || meta.uid === undefined) {
          networkBoundaryAllFieldsStore.error = "Meta is undefined";
          networkBoundaryAllFieldsMachine.service.send({ type: LoadingEvent.Failure });
          return;
        }
        fetch(`http://localhost:3001/api/v1/boundary/all/vrts/${meta.uid}`)
          .then(response => {
            if (!response.ok) {
              // console.error(response)
              throw new Error(`Network response was not ok, status: ${response.status} ${response.statusText}`)
            }
            return response.json();
          })
          .then(data => {
            const boundaries = [];
            for (let i = 0; i < data.length; i++) {
              const x = data[i];
              boundaries.push(new NewBoundary(x.exterior_ring, x.interior_ring, x.bounding_box, x.client, x.block, x.field));
            }
            networkBoundaryAllFieldsStore.data = {meta,boundaries};
            networkBoundaryAllFieldsMachine.service.send({ type: LoadingEvent.Success });
          })
          .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            networkBoundaryAllFieldsStore.error = error.message;
            networkBoundaryAllFieldsMachine.service.send({ type: LoadingEvent.Failure });
          });
        break;
    }

  }
});

