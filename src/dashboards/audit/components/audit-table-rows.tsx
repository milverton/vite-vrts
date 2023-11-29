import {DBMetaGroup, recordDetails} from "../../../lib/db";
import {just, Maybe} from "true-myth/maybe";
import {classNames, fltTrue, slugify} from "../../../lib/common";
import {getIcon} from "./shared";
import {metaClientMachine} from "../../../lib/stores/meta/store";
import {LoadingEvent} from "../../../core/machine";

interface AuditTableCellProps {
  meta: DBMetaGroup,
  season: string,
  clickable: boolean,
  setSelectedClient: (client: Maybe<DBMetaGroup>) => void
  bools: Array<boolean>

}

const AuditTableRow = ({meta, bools, clickable, season} : AuditTableCellProps) => {
  const setClientAndSeason = (client: DBMetaGroup) => {
    if (client) {
      // metaSeasonMachine.reset()
      // metaSeasonMachine.service.send({type: LoadingEvent.Load, payload: {menuName: client.season(), menuType: client.season()}})
      metaClientMachine.service.send(LoadingEvent.Update, just(client))
    }
  }
  return (
    <tr key={name + 'a'} className="">
      <td
        className={classNames("whitespace-nowrap text-left py-2 pl-4 pr-3 text-sm sm:pl-6", clickable ? "hover:text-blue-500 cursor-pointer" : '')}
        onClick={() => clickable ? setClientAndSeason(meta) : ''}>
        {meta.name}
        {/*{props.summary ? <props.summary key={slugify(meta.name+"x")} client={meta} setSelectedClient={props.setSelectedClient}/> : meta.name}*/}
      </td>
      <td className="whitespace-nowrap text-center px-1 py-2 text-sm text-gray-500">{season}</td>
      {
        bools.map((b, i) => {
          return <td key={i + 'rdt'} title={recordDetails[i].title}
                     className="whitespace-nowrap text-center px-1 py-2 text-sm text-gray-500">{getIcon(b)}</td>
        })
      }
    </tr>
  )
}
interface AuditProps {
  clients: Array<DBMetaGroup>,
  season: string,
  clickable: boolean,
  setSelectedClient: (client: Maybe<DBMetaGroup>) => void
}

// pass in clients
// returns an array of objects that have {isFlagged: boolean, bools: Array<boolean>, meta:DBMeta}

interface RowObj {
  isFlagged: boolean,
  bools: Array<boolean>,
  meta: DBMetaGroup
  name: string
}
const createRows = (metas:DBMetaGroup[], _:string):RowObj[] => {
  return metas.map(meta => {
    const name = slugify(meta.name)

    // if (!meta) return ''
    let bools = meta.recordSummaryAsBooleans(fltTrue)
    let [Br, Bc] = meta.recordSummaryAsBooleans(fltTrue)
    bools.splice(0, 1, Br)
    bools.splice(1, 1, Bc)

    return {bools, meta, name} as RowObj
  })

}

export const AuditTableRows = ({clients,season,clickable,setSelectedClient} : AuditProps) => {
  return (
    <>
      {createRows(clients, season)?.map((row) => {
        return (
          <AuditTableRow
            key={row.name + 'b'}
            meta={row.meta}
            bools={row.bools}
            clickable={clickable}
            setSelectedClient={setSelectedClient}
            season={season}
          />
        )
      })
      }
    </>
  )
}