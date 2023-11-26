import {useEffect} from "react";
import {soilMachine, soilStore} from "../../lib/stores/soil/store";
import {soilUIStore, soilUIToolbarMachine,} from "./store";
import SoilToolbar from "./components/toolbar";
import MapBox from "./components/mapbox";
import SoilTable from "./components/table";
import {DefaultMapBoxSetup, MapSize} from "./model";
import {useLoadMachinesState, useLoadMachineStateWithUpdate} from "../../core/machine";


const Soil = () => {
  const suTm = useLoadMachinesState([soilMachine])
  const [_, update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)

  useEffect(() => {
    update({mapFit: soilUIStore.toolbarState.mapFit+1})
  }, [])

  return (
    <div className="h-full z-0">
      <SoilToolbar id={'m' + suTm + Object.keys(soilStore.maps.soilMapUrls).join(',')}/>
      <div className="flex flex-col w-full h-full bg-gray-50 items-center z-0">
        <MapBox
          key={suTm}
          className="z-0 mt-16 w-full h-full"
          mapBoxSetup={DefaultMapBoxSetup}
          mapSize={MapSize[soilUIStore.toolbarState.selectedMapSize]}
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
      <SoilTable/>
    </div>
  )
}
export default Soil