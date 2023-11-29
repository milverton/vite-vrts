
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
    switch (state.type) {
      case LoadingEvent.Reset:
        boundaryStore.meta = null
        boundaryStore.boundary = []
        boundaryStore.hectares = 0
        boundaryStore.bbox = new BoundingBox(0, 0)
        break
      case LoadingEvent.Load:
        const meta = state.payload.meta;
        const boundaries = state.payload.boundaries;

        boundaryStore.boundary = boundaries
        boundaryStore.bbox = boundaryToBoundingBox(boundaries)
        boundaryStore.hectares = boundaryGetHectares(boundaries)
        boundaryStore.meta = meta
        boundaryMachine.success()
        break
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break;
      default:
        boundaryMachine.fail(`Unknown event: ${state.type}, state: ${state.value}`);
        break
    }
  }
})

metaClientMachine.observer.subscribe({
  next: (state) => {
    if (state.type === LoadingEvent.Success) {
      if (metaStore.client.isJust) {
        if (boundaryMachine.value === LoadingState.Loaded) {
          boundaryMachine.service.send(LoadingEvent.Reset)
        }
        const client = metaStore.client.value;
        const meta = client.getAllFieldsBoundary()
        networkBoundaryAllFieldsMachine.reset()
        networkBoundaryAllFieldsMachine.service.send(LoadingEvent.Load, meta)
        // boundaryMachine.service.send({type: LoadingEvent.Load, payload: metaStore.client})
      }
    }
  }
})

networkBoundaryAllFieldsMachine.service.subscribe({
  next: (state: {type: string}) => {
    if (state.type == LoadingEvent.Success) {
      // @ts-ignore
      boundaryMachine.service.send(LoadingEvent.Load, {...networkBoundaryAllFieldsStore.data})
    }
  }
});
