import {useEffect} from "react";
import {soilMachine, soilStore} from "../../lib/stores/soil/store";
import {soilUIDataMachine, soilUIStore, soilUIToolbarMachine,} from "./store";
import SoilToolbar from "./components/toolbar";
import MapBox from "./components/mapbox";
import SoilTable from "./components/table";
import {DefaultMapBoxSetup, MapSize} from "./model";
import {useLoadMachinesState, useLoadMachineStateWithUpdate} from "../../core/machine";
import {metaClientMachine, metaMachine} from "../../lib/stores/meta/store.ts";
import {boundaryMachine} from "../../lib/stores/boundary/machines.ts";


const Soil = () => {
  const bm = useLoadMachinesState([boundaryMachine])
  useLoadMachinesState([soilUIDataMachine])
  const [stm, update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  const tm = useLoadMachinesState([soilMachine,metaClientMachine, soilMachine, metaMachine])

  useEffect(() => {
    update({mapFit: soilUIStore.toolbarState.mapFit+1})
  }, [bm])

  // FIXME: see dashboard soil store as it won't update unless toolbar is triggered
  useEffect(() => {
    update({shrinkTable: true})
  }, [tm]);

  return (
    <div className="h-full w-full z-0">
      <SoilToolbar id={'m' + bm + Object.keys(soilStore.maps.soilMapUrls).join(',')}/>
      <div className={"flex items-end justify-center h-full w-full"}>
        <div className="h-full w-full">
          <MapBox
            key={bm + stm}
            updateNumber={tm}
            className="z-0 h-full w-full mt-16"
            mapBoxSetup={DefaultMapBoxSetup}
            mapSize={MapSize[2]}
            points={soilUIStore.soilDataState.selectedHorizonDataPoints}
            showZoomControl={true}
            scrollToZoom={soilUIStore.toolbarState.scrollZoom}
            showPoints={soilUIStore.toolbarState.showPoints}
            showBoundaries={soilUIStore.toolbarState.showBoundaries}
            showAttributes={true}
            selectedMap={soilUIStore.toolbarState.selectedMapMenuEntry}
            mapOpacity={soilUIStore.toolbarState.mapOpacity}
            mapZoom={soilUIStore.toolbarState.mapZoom}
            setMapZoom={(z) => update({mapZoom: z})}
            mapFit={soilUIStore.toolbarState.mapFit}
          />

        </div>
      </div>

      <SoilTable/>
    </div>
  )
}
export default Soil