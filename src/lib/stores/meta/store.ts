
import {groupMetasByClient, metaTreeByClient,} from "./transform"
import {just, Maybe, nothing} from "true-myth/maybe";
import {logWarning} from "../logging";
import {LoadingEvent, LoadingMachine, LoadingState,} from "../../../core/machine";
import {fltTrue} from "../../common";
import {networkMetaMachine, networkMetaStore} from "../../../network/meta";
import {Meta, parseMetas} from "../../../core/meta";
import {DBMetaGroup} from "../../db.ts";

export interface MetaStoreState {
  nextClient: Maybe<string>
  clientNote: Maybe<string>
  networkUpdateCount: number
  lastUpdate: number
  metas: Meta[]
  metasBySeason: { [key: string]: string[] }
  metasByGroup: { [key: string]: DBMetaGroup }
  metaSeasons: string[]
  seasonSelected: number | null
  metaTree: { [key: string]: DBMetaGroup }
  client: Maybe<DBMetaGroup>
  clientBools: {
    name: string
    block: string
    bools: Array<boolean>
  }

}

const resetMetaStore = (): MetaStoreState => {
  return {
    nextClient: nothing(),
    clientNote: nothing(),
    networkUpdateCount: 0,
    lastUpdate: 0,
    seasonSelected: null,
    metaTree: {},
    metaSeasons: [],
    metasByGroup: {},
    metasBySeason: {},
    metas: [],
    client: nothing(),
    clientBools: {
      name: '',
      block: '',
      bools: []
    }
  }
}
export let metaStore: MetaStoreState = resetMetaStore()

export const metaMachine = new LoadingMachine('Meta Machine')


const updateMetaTree = () => {
  const clientsByGroup = metaStore.metasByGroup
    metaStore.metaTree = metaTreeByClient({clientsByGroup})
    // metaStore.menuSelectedSeason = topMenu

}


const updateSelectedClient = (client: Maybe<DBMetaGroup>, nextClient: Maybe<string>,clientsGrouped: { [p: string]: DBMetaGroup }) => {
  // console.log('updateSelectedClient', client, nextClient)
  if (nextClient.isJust) {
    const updatedClient = clientsGrouped[nextClient.value]
    if (!updatedClient) {
      // console.log('A updateSelectedClient', nextClient.value, 'not found')
      return nothing()
    }
    // console.log('A updateSelectedClient', updatedClient)
    return just(updatedClient)
  }
  if (client.isJust) {
    const updatedClient = clientsGrouped[client.value.name]
    if (!updatedClient) {
      // console.log('B updateSelectedClient', client.value.name, 'not found')
      return nothing()
    }
    // console.log('B updateSelectedClient', updatedClient)
    return just(updatedClient)
  }
  return client
}


const updateState = (metas: Meta[], _context: any) => {
  metaStore.metas = metas
  metaStore.metasByGroup = groupMetasByClient(metas)

  updateMetaTree()
  metaStore.lastUpdate = Date.now()
  const client = updateSelectedClient(metaStore.client, metaStore.nextClient,metaStore.metasByGroup)
  if (client.isJust) {
    metaStore.nextClient = nothing()
    metaStore.seasonSelected = client.value.season()
  }
  // console.log("CLIENT IS", client.unwrapOr('nothing'), metaStore.client, metaStore.nextClient)

  return client

}

metaMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        metaStore = {...metaStore, metas: []}
        break
      case LoadingState.Updating:
        const payload = state.event.payload
        if (payload === undefined || payload.metas === undefined) {
          metaMachine.service.send(LoadingEvent.Failure)
          return
        }

        if (payload.metas.length > 0) {
          const client = updateState(payload.metas, state.context)
          metaClientMachine.service.send({type: LoadingEvent.Update, payload: {client}})
          metaMachine.service.send(LoadingEvent.Success)
          return
        }
        metaMachine.service.send(LoadingEvent.Failure)
        break
        }




  }
})


networkMetaMachine.observer.subscribe({
  next: (state) => {
    if (state.event.type == LoadingEvent.Success) {
      let metas = parseMetas(networkMetaStore.data)
      metaMachine.service.send({type: LoadingEvent.Update, payload: {metas: metas}})
    }

  }
});

const createRecordDetail = (selectedClient: Maybe<DBMetaGroup>) => {
  if (selectedClient.isNothing) {
    return {name: '', block: '', bools: []}
  }
  let bools = selectedClient.value.recordSummaryAsBooleans(fltTrue)
  let [Br, Bc] = selectedClient.value.recordSummaryAsBooleans(fltTrue)
  bools.splice(0, 1, Br)
  bools.splice(1, 1, Bc)

  const parts = selectedClient.value.name.split(' - ')
  const name = parts[0]
  const block = parts[1]

  return {name, block, bools}

}

export const metaClientMachine = new LoadingMachine('Meta Client Machine')
metaClientMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        metaStore = {...metaStore, client: nothing()}
        break
      case LoadingState.Updating:
        let client = state.event.payload.client

        if (client === undefined) {
          metaClientMachine.service.send(LoadingEvent.Failure)
          return
        }

        if (client.isJust) {
          metaStore = {
            ...metaStore,
            client: client,
            seasonSelected: client.value.season(),
            clientBools: createRecordDetail(client)
          }
          metaClientMachine.service.send(LoadingEvent.Success)
          return
        }
        if (client.isNothing) {
          if (metaStore.client.isJust) {
            logWarning('Clearing client', 'client is selected and being replaced by nothing')
          }

          metaStore = {...metaStore, nextClient: nothing(), client: nothing(), seasonSelected: 0}
          metaClientMachine.service.send(LoadingEvent.Success)
          return
        }
        metaClientMachine.service.send(LoadingEvent.Failure)
        break
    }
  }
})

export const metaNextClientMachine = new LoadingMachine('Meta Next Client Machine')
metaNextClientMachine.observer.subscribe({
  next: (state) => {
    switch (state.value) {
      case LoadingState.Empty:
        metaStore = {...metaStore, nextClient: nothing()}
        break
      case LoadingState.Updating:
        let payload = state.event.payload
        if (payload !== undefined && payload.length > 0) {
          metaStore = {...metaStore, nextClient: just(payload)}
          metaNextClientMachine.service.send(LoadingEvent.Success)
          return
        }
        metaNextClientMachine.service.send(LoadingEvent.Failure)
        break
    }
  }
})
//
// let metaChangesStore: MetaChanges = {update: [], delete: []}
//
// export const metaChangesMachine = new LoadingMachine('Meta Changes Machine')
// metaChangesMachine.observer.subscribe({
//   next: (state) => {
//     switch (state.value) {
//       case LoadingState.Empty:
//         metaChangesStore = {update: [], delete: []}
//         break
//       case LoadingState.Updating:
//         const payload = state.event.payload as MetaChanges
//         if (payload) {
//           metaChangesStore = payload
//
//           applyMetaChanges(metaStore.metas, payload)
//             .then((changedMetas: DBMeta[]) => {
//               // Better to store changedMetas
//               metaMachine.reset()
//               metaMachine.service.send({type: LoadingEvent.Update, payload: {metas: changedMetas}})
//               metaChangesMachine.service.send(LoadingEvent.Success)
//             })
//             .catch((e) => {
//               metaChangesMachine.service.send(LoadingEvent.Failure)
//               logFailure('Failed to apply metadata changes', e)
//             })
//           return
//         }
//         metaChangesMachine.service.send(LoadingEvent.Failure)
//
//     }
//   }
// })

// export const metaNetworkMachine = new LoadingMachine('Meta Network Machine')
// metaNetworkMachine.observer.subscribe({
//   next: (state) => {
//     switch (state.value) {
//       case LoadingState.Empty:
//         metaStore = {...metaStore, networkUpdateCount: 0}
//         break
//       case LoadingState.Updating:
//         // const payload = state.event.payload
//         metaStore = {...metaStore, networkUpdateCount: metaStore.networkUpdateCount + 1}
//         metaNetworkMachine.service.send(LoadingEvent.Success)
//         break
//     }
//   }
// })



// export const metaNoteSaveMachine = new LoadingMachine('Meta Note Save Machine')
// metaNoteSaveMachine.observer.subscribe(
//   (state) => {
//     switch (state.value) {
//       case LoadingState.Empty:
//         metaStore = {...metaStore, clientNote: nothing()}
//         break
//       case LoadingState.Loading:
//         const {client, note} = state.event.payload as { client: Maybe<DBMetaGroup>, note: Maybe<string> }
//         if (!client.isJust) {
//           metaNoteSaveMachine.service.send(LoadingEvent.Failure)
//           return
//         }
//
//         if (client.isJust) {
//           post(`http://127.0.0.1:3000/api/v1/note/${client.value.dealer()}/${client.value.client()}`, {note: note.unwrapOr('')})
//             .then(result => {
//               const changes = parseServerResponse(result)
//               if (changes.isOk) {
//                 metaStore = {...metaStore, clientNote: note}
//                 metaChangesMachine.service.send({type: LoadingEvent.Update, payload: {...changes.value}})
//                 metaNoteSaveMachine.service.send(LoadingEvent.Success)
//               }
//               if (changes.isErr) {
//                 logFailure('Error saving note', changes.error)
//               }
//             })
//         }
//         break
//     }
//   }
// )
// export const metaNoteLoadMachine = new LoadingMachine('Meta Note Load Machine')
// metaNoteLoadMachine.observer.subscribe(
//   (state) => {
//     switch (state.value) {
//       case LoadingState.Empty:
//         metaStore = {...metaStore, clientNote: nothing()}
//         break
//       case LoadingState.Loading:
//         const client = state.event.payload
//         if (!client.isJust) {
//           metaNoteLoadMachine.service.send(LoadingEvent.Failure)
//           return
//         }
//         const noteMeta = getSelectedNote(metaStore.client, metaStore.seasonSelected,metaStore.metasByGroup)
//         if (!noteMeta.isJust && metaStore.client.isJust) {
//           metaNoteLoadMachine.service.send(LoadingEvent.Failure)
//           return
//         }
//
//         loadClientNote(noteMeta.value.dealer, noteMeta.value.client)
//           .then((note) => {
//             metaStore = {...metaStore, clientNote: just(note), selectedNoteMeta: noteMeta}
//             metaNoteLoadMachine.service.send(LoadingEvent.Success)
//           })
//           .catch(logServerFailure)
//
//     }
//   }
// )

// metaClientMachine.observer.subscribe(
//   (state) => {
//     if (state.event.type === LoadingEvent.Success) {
//       metaNoteLoadMachine.reset()
//       metaNoteLoadMachine.service.send({type: LoadingEvent.Load, payload: {client: metaStore.client}})
//     }
//   }
// )
