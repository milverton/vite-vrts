import {metaClientMachine, metaMachine, metaStore,} from "../../../lib/stores/meta/store";
import {useEffect, useMemo, useState} from "react";
import {DBMetaGroup} from "../../../lib/db";
import {classNames} from "../../../lib/common";
// @ts-ignore
import {just, Maybe} from 'true-myth/maybe';
import {LoadingEvent, useLoadMachinesState} from "../../../core/machine";
import {StringSelect} from "../../../components/string-select/view";
import {Meta} from "../../../core/meta";

export const Clients = ({className}: { className: string }) => {
  const tm = useLoadMachinesState([metaMachine, metaClientMachine])
  const clientTree = metaStore.metaTree
  const selectedClient = metaStore.client

  const setSelectedClient = (client: Maybe<DBMetaGroup>, boundary: Meta) => {
    metaClientMachine.reset()
    metaClientMachine.service.send({type: LoadingEvent.Update, payload: {client, boundary}})
  }

  const [dealer, setDealer] = useState({menuName: 'VRTS', menuType: 'vrts'})

  const [localSelectedDealer, setLocalSelectedDealer] = useState('')
  const [localSelectedClient, setLocalSelectedClient] = useState('')
  const [localSelectedBlock, setLocalSelectedBlock] = useState('')
  const [localSelectedSeason, setLocalSelectedSeason] = useState('')
  const [localSelectedField, setLocalSelectedField] = useState('')
  const dealers = Object.keys(clientTree).sort()



  useMemo(() => {

    if (selectedClient.isJust && selectedClient.value.dbMetas.length > 0) {
      const c = selectedClient.value.dbMetas[0]
      setLocalSelectedDealer(c.dealer)
      setLocalSelectedClient(c.client)
      setLocalSelectedBlock(c.block)
      setLocalSelectedField(c.field)
      setLocalSelectedSeason(c.season.toString())
    }
  }, [selectedClient, tm])

  useEffect(() => {
    if (dealer && dealer.menuName.length > 0) {
      setLocalSelectedDealer(dealer.menuName)
    }

  }, [dealer])


  const dealersMenu = dealers.map(x => ({menuName: x, menuType: x}))
  // console.log("DEALERS MENU", dealersMenu, dealer, localSelectedDealer, clientTree[localSelectedDealer])
  let cTree = clientTree[localSelectedDealer]
  if (!cTree) {
    cTree = {} as DBMetaGroup
  }

  const getDealerAndClient = (dealer:string, client:string) => {
    // @ts-ignore
    return clientTree[dealer][client]
  }

  const getDealerAndClientAndBlock = (dealer:string, client:string, block:string) => {
    // @ts-ignore
    return clientTree[dealer][client][block]
  }

  const getDealerAndClientAndBlockAndSeason = (dealer:string, client:string, block:string, season:string) => {
    // @ts-ignore
    return clientTree[dealer][client][block][season]
  }

  const getDealerAndClientAndBlockAndSeasonField = (dealer:string, client:string, block:string, season:string, field: string) => {
    // @ts-ignore
    return clientTree[dealer][client][block][season][field]
  }

  return (
    <div className={classNames("p-2 text-gray-500 text-sm", className)}>
      <StringSelect name={"Dealers"} className="text-sm string-select mb-2" menu={dealersMenu} selected={dealer} setSelected={setDealer} />

            {Object.keys(cTree).sort().map(client => {
              // const first = clientTree[localSelectedDealer][client].first()
              return (
                <details key={`${localSelectedDealer}-${client}`}
                         open={localSelectedDealer === localSelectedDealer && client === localSelectedClient}>
                  <summary
                    className={classNames("text-gray-600 cursor-pointer hover:underline")}>
                    {client}
                  </summary>
                  {Object.keys(getDealerAndClient(localSelectedDealer, client)).sort().map((block:string) => {
                    return (
                      <details key={`${localSelectedDealer}-${client}-${block}`}
                               open={localSelectedDealer === localSelectedDealer && client === localSelectedClient && block === localSelectedBlock}>
                        <summary
                          className={classNames("ml-4 text-gray-600 cursor-pointer hover:underline")}>
                          {block}
                        </summary>
                        {Object.keys(getDealerAndClientAndBlock(localSelectedDealer,client,block).sort().map((season:string) => {
                          // const isActive = selectedClient.isJust && selectedClient.value.client() === client && selectedClient.value.block() === block && localSelectedField === field
                          // const dbGroup = clientTree[localSelectedDealer][client][block][field]
                          // const boundary = dbGroup.getAllFieldsBoundary()


                          return (
                            <details key={`${localSelectedDealer}-${client}-${block}-${season}`}
                                     open={localSelectedDealer === localSelectedDealer && client === localSelectedClient && block === localSelectedBlock && season === localSelectedSeason}>
                              <summary
                                className={classNames("ml-8 text-gray-600 cursor-pointer hover:underline")}>
                                {season}
                              </summary>
                              {Object.keys(getDealerAndClientAndBlockAndSeason(localSelectedDealer, client, block, season)).sort().map((field:string) => {
                                const dbGroup = getDealerAndClientAndBlockAndSeasonField(localSelectedDealer, client, block, season, field)
                                const isActive = selectedClient.isJust && selectedClient.value.client() === client && selectedClient.value.block() === block && localSelectedField === field && localSelectedSeason === season
                                const boundary = dbGroup.getAllFieldsBoundary()
                                return (
                                  <div
                                    onClick={() => {
                                      // set season first, setting client first requires a double click for the user to load data
                                      // uiSetSelectedSeason({menuName: season, menuType: season})
                                      setSelectedClient(just(dbGroup), boundary)
                                    }
                                    }
                                    key={`${dealer}-${client}-${block}-${season}`}
                                    className={classNames("ml-12 text-gray-600 cursor-pointer hover:underline", isActive ? 'font-bold text-blue-500' : '')}>
                                    {field}
                                  </div>
                                )
                              })}
                            </details>

                            // <div
                            //   onClick={() => {
                            //     // set season first, setting client first requires a double click for the user to load data
                            //     // uiSetSelectedSeason({menuName: season, menuType: season})
                            //     setSelectedClient(just(dbGroup), boundary)
                            //   }
                            //   }
                            //   key={`${dealer}-${client}-${block}-${season}`}
                            //   className={classNames("ml-8 text-gray-600 cursor-pointer hover:underline", isActive ? 'font-bold text-blue-500' : '')}>
                            //   {season}
                            // </div>
                          )

                        }))
                        }
                      </details>
                    )
                  })}
                </details>
              )
            }
            )}
    </div>
  )
}