
import {groupMetasByClient, metaTreeByClient,} from "./transform"
import {just, Maybe, nothing} from "true-myth/maybe";
import {logWarning} from "../logging";
import {LoadingEvent, LoadingMachine} from "../../../core/machine";
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
export const metaMachine = new LoadingMachine('Meta Machine')
metaMachine.observer.subscribe({
  next: (state: any) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        metaStore = {...metaStore, metas: []}
        break
      case LoadingEvent.Update:
        const payload = state.payload
        if (payload === undefined || payload.metas === undefined) {
          metaMachine.fail('No payload or payload.metas')
          return
        }

        if (payload.metas.length > 0) {
          const client = updateState(payload.metas, state.context)
          metaMachine.success()
          metaClientMachine.service.send(LoadingEvent.Update,{client})

          return
        }
        metaMachine.fail('No payload.metas')
        break
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        metaMachine.fail(`Unhandled state ${state.type}`)
        break

  }}
})


networkMetaMachine.observer.subscribe({
  next: (state) => {
    if (state.type == LoadingEvent.Success) {
      let metas = parseMetas(networkMetaStore.data)
      metaMachine.service.send(LoadingEvent.Update, {metas: metas})
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
    switch (state.type) {
      case LoadingEvent.Reset:
        metaStore = {...metaStore, client: nothing()}
        break
      case LoadingEvent.Update:
        let client = state.payload.client

        if (client === undefined) {
          metaClientMachine.fail('No payload.client')
          return
        }

        if (client.isJust) {
          metaStore = {
            ...metaStore,
            client: client,
            seasonSelected: client.value.season(),
            clientBools: createRecordDetail(client)
          }
          metaClientMachine.success()
          return
        }
        if (client.isNothing) {
          if (metaStore.client.isJust) {
            logWarning('Clearing client', 'client is selected and being replaced by nothing')
          }

          metaStore = {...metaStore, nextClient: nothing(), client: nothing(), seasonSelected: 0}
          metaClientMachine.success()
          return
        }
        metaClientMachine.fail('(Fallthrough) No payload.client')
        break
      case LoadingEvent.Success:
        break
      case LoadingEvent.Failure:
        break
      default:
        metaClientMachine.fail(`Unhandled state ${state.type}`)
        break
    }
  }
})

export const metaNextClientMachine = new LoadingMachine('Meta Next Client Machine')
metaNextClientMachine.observer.subscribe({
  next: (state) => {
    switch (state.type) {
      case LoadingEvent.Reset:
        metaStore = {...metaStore, nextClient: nothing()}
        break
      case LoadingEvent.Update:
        let payload = state.payload
        if (payload !== undefined && payload.length > 0) {
          metaStore = {...metaStore, nextClient: just(payload)}
          metaNextClientMachine.success()
          return
        }
        metaNextClientMachine.fail('(Fallthrough) No payload')
        break
      default:
        metaNextClientMachine.fail(`Unhandled state ${state.type}`)
        break
    }
  }
})
