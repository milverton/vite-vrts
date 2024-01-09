import {soilUIStore, soilUIToolbarMachine,} from "../store";
import {PointColorMenu, SoilHorizonsMenu} from "../model";
import {MagnifyingGlassIcon} from "@heroicons/react/20/solid";
import {NumberInputControl, StringSelectorControl, ToggleControl} from "./controls";
import {useLoadMachineState, useLoadMachineStateWithUpdate} from "../../../core/machine";


// const MapSizeSelector = () => {
//   const [_,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
//   return <StringSelectorControl label={'Map Size'} menu={MapSize} selected={MapSize[soilUIStore.toolbarState.selectedMapSize]} setSelected={(e) => update({selectedMapSize: e.menuType})}/>
// }
// const MapViewSelector = () => {
//   const [selected, setSelected] = useAtom(soilUISelectedViewAtom)
//   return <StringSelectorControl label={'Map View'} menu={ViewMenu} selected={selected} setSelected={setSelected}/>
// }

// const SoilHorizonSelector = () => {
//   const [selected, setSelected] = useAtom(soilUISelectedHorizonAtom)
//   return <StringSelectorControl label={'Horizon'} menu={SoilHorizonsMenu} selected={selected} setSelected={setSelected}/>
// }
const SoilHorizonSelector = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <StringSelectorControl label={'Horizon'} menu={SoilHorizonsMenu} selected={SoilHorizonsMenu[soilUIStore.toolbarState.selectedHorizon]} setSelected={(e) => update({selectedHorizon: e.menuType, selectedHorizonName: e.menuName})}/>
}

const SoilHeaderSelector = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  const soilHorizonData = Object.keys(soilUIStore.soilDataState.combinedHorizonData)
  const menu = soilHorizonData.map((h: string,i:number) => ({menuName: h, menuType: i}))
  menu.splice(0, 0, {menuName: 'NA', menuType: -1})

  return <StringSelectorControl label={'Header'} menu={menu} selected={menu[soilUIStore.toolbarState.selectedSoilHeader+1]} setSelected={(e) => {update({selectedSoilHeader: e.menuType, selectedSoilHeaderName: e.menuName})}}/>
}
const SoilMapSelector = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  const menu = soilUIStore.toolbarState.mapMenu

  return <StringSelectorControl label={'Map'} menu={menu} selected={soilUIStore.toolbarState.selectedMapMenuEntry} setSelected={(e) => update({selectedMap: e.menuType, selectedMapMenuEntry: e})}/>
}
const ShrinkTableToggle = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <ToggleControl label={'Shrink'} selected={soilUIStore.toolbarState.shrinkTable} setSelected={() => update({shrinkTable: !soilUIStore.toolbarState.shrinkTable})}/>
}
// const StatsColorsToggle = () => {
//   const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
//   return <ToggleControl label={'Stats'} selected={soilUIStore.toolbarState.colorTable} setSelected={() => update({colorTable: !soilUIStore.toolbarState.colorTable})}/>
// }

const MapOpacityControl = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <NumberInputControl label={'Opacity'} selected={soilUIStore.toolbarState.mapOpacity} setSelected={(e) => update({mapOpacity: e})} min={0} max={1} step={0.05}/>
}

const ShowBoundariesToggle = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <ToggleControl label={'Boundaries'} selected={soilUIStore.toolbarState.showBoundaries} setSelected={() => update({showBoundaries: !soilUIStore.toolbarState.showBoundaries})}/>
}
const ShowPointsToggle = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <ToggleControl label={'Points'} selected={soilUIStore.toolbarState.showPoints} setSelected={() => update({showPoints: !soilUIStore.toolbarState.showPoints})}/>
}

const FitMapToBoundariesAction = () => {
  const [, update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return (
    <div className="control-container-col">
      <label htmlFor="fit-map" className="lbl-xs lbl-badge mb-1">Fit</label>
      <button className="flex-auto hover:text-blue-500" onClick={() => update({mapFit: soilUIStore.toolbarState.mapFit+1})}>
        <MagnifyingGlassIcon className="h-6 w-full"/>
      </button>
    </div>
  )
}

const MapScrollZoomToggle = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <ToggleControl label={'Scroll Zoom'} selected={soilUIStore.toolbarState.scrollZoom} setSelected={() => update({scrollZoom: !soilUIStore.toolbarState.scrollZoom})}/>
}

const PointColorSelectorControl = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <StringSelectorControl label={'Point Color'} menu={PointColorMenu} selected={PointColorMenu[soilUIStore.toolbarState.pointColor]} setSelected={(e) => update({pointColor: e.menuType})}/>
}

const SelectedPointColorSelectorControl = () => {
  const [,update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)
  return <StringSelectorControl label={'Selected Color'} menu={PointColorMenu} selected={PointColorMenu[soilUIStore.toolbarState.selectedPointColor]} setSelected={(e) => update({selectedPointColor: e.menuType})}/>
}
const SoilToolbar = ({id}: {id:string}) => {
  const tm = useLoadMachineState(soilUIToolbarMachine)
  return (
    <div key={id + tm} className="flex flex-col text-xs justify-start sticky top-16 z-10">
      <div className="flex flex-row w-full py-1 space-x-2 bg-gray-100">
        {/*<div className="bg-blue-100 flex flex-row p-2 border-r-4 border-gray-100 px-4">*/}
        {/*  <MapSizeSelector/>*/}
        {/*</div>*/}
        <div className="flex flex-row p-2 px-4 space-x-3 border-r-[1px] border-gray-300">
          <SoilHorizonSelector/>
          <SoilHeaderSelector/>
          <ShrinkTableToggle/>
          {/*<StatsColorsToggle/>*/}
        </div>
        <div className="flex flex-row p-2 px-4 space-x-3 border-r-[1px] border-gray-300">
          <SoilMapSelector/>
          <MapOpacityControl/>
          <ShowBoundariesToggle/>
          <ShowPointsToggle/>
          <FitMapToBoundariesAction />
        </div>
        <div className="flex w-full flex-row p-2 px-4 2xl:flex space-x-3 border-r-[1px] border-gray-300">
          <PointColorSelectorControl/>
          <SelectedPointColorSelectorControl/>
          <MapScrollZoomToggle/>
        </div>
      </div>
    </div>
  )
}

export default SoilToolbar