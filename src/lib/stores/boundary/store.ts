
import {BoundariesState} from "./model";
import {boundaryMachine,} from "./machines";
import {metaClientMachine, metaStore} from "../meta/store";
import {LoadingEvent, LoadingState} from "../../../core/machine";
import {BoundingBox} from "../../../core/bounding-box";
import {networkBoundaryAllFieldsMachine, networkBoundaryAllFieldsStore} from "../../../network/boundary";
import {boundaryGetHectares, boundaryToBoundingBox} from "./transform";

const initial: BoundariesState = {
  hectares: 0,
  boundary: [],
  meta: null,
  bbox: new BoundingBox(0, 0),
}

// const bridge = proxy<{client: Maybe<DBMetaGroup>}>({client: Maybe.nothing()})

export const boundaryStore = {...initial}


boundaryMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        boundaryStore.meta = null
        boundaryStore.boundary = []
        boundaryStore.hectares = 0
        boundaryStore.bbox = new BoundingBox(0, 0)
        break
      case LoadingState.Loading:
        const meta = state.event.payload.meta;
        const boundaries = state.event.payload.boundaries;

        boundaryStore.boundary = boundaries
        boundaryStore.bbox = boundaryToBoundingBox(boundaries)
        boundaryStore.hectares = boundaryGetHectares(boundaries)
        boundaryStore.meta = meta
        boundaryMachine.service.send(LoadingEvent.Success)

        // boundaryLoadFromServer(state.event.client)
        //   .then((data) => {
        //     boundaryStore.boundary = data.boundary
        //     boundaryStore.bbox = boundaryToBoundingBox(data.boundary)
        //     boundaryStore.hectares = boundaryGetHectares(data.boundary)
        //     boundaryStore.meta = state.event.client.getBoundary()
        //     boundaryMachine.service.send(LoadingEvent.Success)
        //   })
        //   .catch((err) => {
        //     logFailure('Error loading boundary', err)
        //     boundaryMachine.service.send(LoadingEvent.Failure)
        //   })
        break
      default:
        break
    }
  }
})

metaClientMachine.observer.subscribe({
  next: (state) => {
    if (state.event.type === LoadingEvent.Success) {
      if (metaStore.client.isJust) {
        if (boundaryMachine.service.getSnapshot().value === LoadingState.Loaded) {
          boundaryMachine.service.send(LoadingEvent.Reset)
        }
        const client = metaStore.client.value;
        const meta = client.getAllFieldsBoundary()
        networkBoundaryAllFieldsMachine.reset()
        networkBoundaryAllFieldsMachine.service.send({type: LoadingEvent.Load, payload: meta})
        // boundaryMachine.service.send({type: LoadingEvent.Load, payload: metaStore.client})
      }
    }
  }
})

networkBoundaryAllFieldsMachine.service.subscribe({
  next: (state: { event: { type: string; }; }) => {
    if (state.event.type == LoadingEvent.Success) {
      // @ts-ignore
      boundaryMachine.service.send({type: LoadingEvent.Load, payload: {...networkBoundaryAllFieldsStore.data}})
    }
  }
});
