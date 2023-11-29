
import {DBMetaGroup} from "../../db";
import * as R from "ramda";

// @ts-ignore
import {err, ok, Result} from "true-myth/result";

import {Meta, parseMetas} from "../../../core/meta";
import {metaMachine, metaStore} from "./store";
import {LoadingEvent} from "../../../core/machine";


// TODO: Remove ramda usage
// Takes a list of DBMeta and returns an object that maps the groupBy key to an DBMetaGroup object
const _mapMetasToGroup = (_num: any, key: string, obj: { [x: string]: Meta[]; }) => new DBMetaGroup(key, obj[key])

export const groupMetasByClient = R.compose(
  // @ts-ignore
  R.mapObjIndexed(_mapMetasToGroup),            // {client: DBMetaGroup}
  // @ts-ignore
  R.groupBy((meta: Meta) => meta.groupBy()) // group by client
)

// Takes an object with seasons as keys and returns an array of seasons
// @ts-ignore
export const metaSeasons = R.compose(R.sort(R.descend(R.identity)), R.uniq)


// Takes an object with seasons and returns a list of SelectedProps
// const RMapI = R.addIndex(R.map)
// export const metaSeasonsMenu = R.compose(RMapI((s: string, n: number) => ({
//   menuName: s,
//   menuType: n
// })), R.sort(R.descend(R.identity)))


// Takes a list of DBMeta and splits them into dealer, client and block names
export const metaNames = R.compose(
  (x => (
      {
        dealers: R.sort(R.ascend(R.identity), R.uniq(x.dealers)),
        clients: R.sort(R.ascend(R.identity), R.uniq(x.clients)),
        blocks: R.sort(R.ascend(R.identity), R.uniq(x.blocks))
      })
  ),
  R.reduce<{ [key: string]: string }, { [key: string]: Array<string> }>((acc, obj) => {
    acc.dealers.push(obj.dealer)
    acc.clients.push(obj.client)
    acc.blocks.push(obj.block)
    return acc
  }, {dealers: [], clients: [], blocks: []}),
  R.map((x:Meta) => ({dealer: x.dealer, client: x.client, block: x.block})),
  R.values
)


export const metaTreeByClient = ({clientsByGroup}: {clientsByGroup: any}) => {
  const _byClient = R.keys(clientsByGroup)
  return _byClient.reduce((acc, client) => {

    const dbGroup = clientsByGroup[client]
    const dealer = dbGroup.dealer()
    const clientName = dbGroup.client()
    const block = dbGroup.block()
    const field = dbGroup.field()

    return dbGroup.dbMetas.reduce((acc:any, meta: Meta) => {
      const season = meta.season
      if (!acc[dealer]) {
        acc[dealer] = {[clientName]: {[block]: {[season]: {[field]: dbGroup}}}}
      }
      if (!acc[dealer][clientName]) {
        acc[dealer][clientName] = {[block]: {[season]: {[field]: dbGroup}}}
      }
      if (!acc[dealer][clientName][block]) {
        acc[dealer][clientName][block] = {[season]: {[field]: dbGroup}}
      }
      if (!acc[dealer][clientName][block][season]) {
        acc[dealer][clientName][block][season] = {[field]: dbGroup}
      }
      if (!acc[dealer][clientName][block][season][field]) {
        acc[dealer][clientName][block][season][field] = dbGroup
      }
      else {
        if (dbGroup.uid !== acc[dealer][clientName][block][season][field].uid) {
          console.error('Duplicate meta', dbGroup.uid, acc[dealer][clientName][block][season][field].uid)
        }
      }

      return acc
    }, acc)


  }, {})
}

export const updateMetaChannel = (response: {updated: Meta[], new: Meta[], deleted: Meta[]}) => {
  // console.log("UPDATE META CHANNEL", response)
  let metas = metaStore.metas
  if (response.deleted.length > 0) {
    metas = metas.filter((m:Meta) => {
      const deleted = parseMetas(response.deleted).find(x => x.uid === m.uid)
      return !deleted;
    })
  if (response.new.length > 0) {
    metas = [...metas, ...parseMetas(response.new)]
  }

  if (response.updated.length > 0) {
    metas = metas.map((m:Meta) => {
      const updated = parseMetas(response.updated).find(x => x.uid === m.uid)
      if (updated) {
        return updated
      }
      return m
    })
  }


  }

  metaMachine.service.send(LoadingEvent.Update, {metas})

}