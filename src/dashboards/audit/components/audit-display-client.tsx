import {Maybe} from "true-myth/maybe";
import {DBMetaGroup} from "../../../lib/db";
import {AuditTable} from "./audit-table";
import {AuditHeader} from "./audit-header";
import {AuditTableRows} from "./audit-table-rows";
import {classNames} from "../../../lib/common";

export const DisplayClient = (props: { className?:string, client: Maybe<DBMetaGroup>, setSelectedClient: (group: Maybe<DBMetaGroup>) => void }) => {

  const seasons = props.client.isJust ? props.client.value.seasons() : []
  const client = props.client.isJust ? props.client.value : []

  const hasClient = props.client.isJust
  return (

    hasClient ?
      <div className={classNames("bg-white bg-blue-100 border-b-2 border-b-gray-100", props.className)}>
        <AuditTable header={AuditHeader}>
          {
            seasons.map(season =>
              <AuditTableRows
                key={season}
                setSelectedClient={props.setSelectedClient}
                clickable={true}
                clients={[client as DBMetaGroup]}
                season={season.toString()}/>)
          }
        </AuditTable>
      </div>
      : <></>


  )
}