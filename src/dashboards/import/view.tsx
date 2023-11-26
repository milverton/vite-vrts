import {metaClientMachine, metaMachine, metaStore} from "../../lib/stores/meta/store";
import {useEffect, useState} from "react";
import {DisplayClient} from "../audit/components/audit-display-client";
import {classNames, getSeasons} from "../../lib/common";
import {ArchiveDrop} from "./components/archive-drop";
import {EMGRDrop} from "./components/emgr-drop";
import {BoundaryDrop} from "./components/boundary-drop";
import {RawSoilDataDrop} from "./components/raw-soil-data-drop";
import {SoilPointsDataDrop} from "./components/soil-points-data-drop";
import {CleanSoilDataDrop} from "./components/clean-soil-data-drop";

import ToggleSwitch from "../../components/toggle-switch/view";
import {useLoadMachinesState} from "../../core/machine";
import {metaNames} from "../../lib/stores/meta/transform";

const Import = () => {
  useLoadMachinesState([metaMachine, metaClientMachine])
  const selectedClient = metaStore.client
  // const flaggedClient = metaStore.flaggedClients

  const names = metaNames(metaStore.metas)
  const dealerNames = names.dealers
  const clientNames = names.clients
  const blockNames = names.blocks


  const selectedSeason = metaStore.seasonSelected

  const [dealer, setDealer] = useState("")
  const [client, setClient] = useState("")
  const [block, setBlock] = useState("")
  const [overwrite, setOverwrite] = useState(false)
  const [season, setSeason] = useState<number|null>(new Date().getFullYear())

  // const [_, setResetFiles] = useAtom(resetFilesAtom)

  useEffect(() => {
    if (selectedClient.isJust) {
      setSeason(selectedSeason)
      setDealer(selectedClient.value.dealer())
      setClient(selectedClient.value.client())
      setBlock(selectedClient.value.block())
    }

  }, [selectedClient])

  const reset = () => {
    setDealer("")
    setClient("")
    setBlock("")
    setOverwrite(false)
    // setResetFiles(Date.now())
  }
  const isClear = () => {
    // @ts-ignore
    return dealer.isEmpty() && client.isEmpty() && block.isEmpty()
  }


  return (
    <div className="flex flex-col sticky top-16 mt-16">
      <DisplayClient client={selectedClient} setSelectedClient={() => {}}/>
      <div
        className="flex flex-row flex-wrap justify-center w-full  z-40 p-4 border-solid border-b-2 border-gray-100 bg-white">
        {/*<DropDown onChange={setSeason} values={seasons} title="Season"/>*/}
        <div className="control-container-col px-2">
          <label htmlFor="season" className="lbl-badge text-sm text-gray-500">Season</label>
          <input name="season" className="number-input-standard" type="text" list="seasons"
                 value={season?.toString()} onChange={(e) => setSeason(parseInt(e.target.value))}/>
          <datalist id="seasons">
            {getSeasons().map((season, idx) => {
              return (
                <option className="bg-white text-gray-700" key={idx}>{season}</option>
              )
            })}
          </datalist>
        </div>
        <div className="control-container-col px-2">
          <label htmlFor="dealer" className="lbl-badge text-sm text-gray-500">Dealer</label>
          <input name="dealer" className="number-input-standard text-sm" type="text" list="dealers"
                 value={dealer} onChange={(e) => setDealer(e.target.value)}/>
          <datalist id="dealers">
            {dealerNames.map((dealer, idx) => {
              return (
                <option className="bg-white text-gray-700"  key={idx}>{dealer}</option>
              )
            })}
          </datalist>
        </div>
        <div className="control-container-col px-2">
          <label htmlFor="client" className="lbl-badge text-sm text-gray-500">Client</label>
          <input name="client" className="number-input-standard text-sm" type="text" list="clients"
                 value={client} onChange={(e) => setClient(e.target.value)}/>
          <datalist id="clients">
            {clientNames.map((client, idx) => {
              return (
                <option className="text-sm" key={idx}>{client}</option>
              )
            })}
          </datalist>
        </div>
        <div className="control-container-col px-2">
          <label htmlFor="block" className="lbl-badge text-sm text-gray-500">Block</label>
          <input name="block" className="number-input-standard" type="text" list="blocks" value={block}
                 onChange={(e) => setBlock(e.target.value)}/>
          <datalist id="blocks">
            {blockNames.map((block, idx) => {
              return (
                <option key={idx}>{block}</option>
              )
            })}
          </datalist>
        </div>
        <div className="control-container-col px-2">
          <label htmlFor="scroll-zoom" className="lbl-badge text-sm text-gray-500">Overwrite</label>
          <div className="toggle-middle">
            <ToggleSwitch name="" default={overwrite} toggle={setOverwrite}/>
          </div>
        </div>
        <div className="control-container-col px-4 text-sm">
          <label htmlFor="scroll-zoom" className="lbl-badge text-sm text-gray-500">Clear Inputs</label>
          <div className="toggle-middle">
            <button className={classNames("text-sm px-5 py-1 border-1 rounded hover:bg-gray-50", isClear() ? '' : 'bg-blue-600 text-white hover:bg-blue-500')}
                    onClick={() => reset()}>Clear
            </button>
          </div>
        </div>

      </div>


      {/* Drag and Drop Section */}
      <div className="flex flex-wrap justify-center">
        <ArchiveDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
        <EMGRDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
        <BoundaryDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
        <RawSoilDataDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
        <SoilPointsDataDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
        <CleanSoilDataDrop season={season} dealer={dealer} client={client} block={block} field={"All"} overwrite={overwrite}/>
      </div>
    </div>
  )
}
export default Import;