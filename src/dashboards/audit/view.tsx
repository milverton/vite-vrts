import {useEffect, useState} from 'react'
import {DBMetaGroup} from "../../lib/db";
// @ts-ignore
import {just, Maybe, nothing} from "true-myth/maybe";
import {metaClientMachine, metaMachine, metaStore} from "../../lib/stores/meta/store";
import {AuditTableRows} from "./components/audit-table-rows";
import {AuditHeader} from "./components/audit-header";
import {AuditTable} from "./components/audit-table";
import {DisplayClient} from "./components/audit-display-client";
import ErrorBoundary from "../../components/error-boundary/view";
import {LoadingEvent, useLoadMachinesState} from "../../core/machine";

const Audit = () => {
  useLoadMachinesState([metaMachine, metaClientMachine])


  const clientsGrouped = metaStore.metasByGroup
  const setSelectedClient = (client: Maybe<DBMetaGroup>) => {
    metaClientMachine.service.send({type: LoadingEvent.Update, payload: client})
  }

  const clients = Object.values(clientsGrouped).filter(c => c.block() !== 'Note')
  const [selected, setSelected] = useState<Maybe<DBMetaGroup>>(nothing<DBMetaGroup>())

  useEffect(() => {
    if (selected.isJust) {
      setSelectedClient(selected)
    }
  }, [selected])

  return (
    <ErrorBoundary>
      <div className="">
        <div className="mt-16">
          <DisplayClient client={selected} setSelectedClient={setSelected}/>
          <AuditTable header={AuditHeader}>
            <AuditTableRows
              setSelectedClient={setSelected}
              clickable={true}
              clients={clients}
              season={''}
            />
          </AuditTable>
        </div>
      </div>

    </ErrorBoundary>
  )


}
export default Audit