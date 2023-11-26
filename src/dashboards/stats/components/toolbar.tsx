import {SoilHorizonsMenu} from "../../soil/model";
import {NumberInputControl, StringSelectorControl, ToggleControl} from "../../soil/components/controls";
import {statsStore, statsUIForRegressionsMachine, statsUIForXYDataMachine,} from "../store";
import {StatsRegressionTypesMenu} from "../model";
import {useLoadMachineStateWithUpdate} from "../../../core/machine";

const LongListToggle = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForXYDataMachine)
  return <ToggleControl key={statsStore.uiXYState.longList.toString()} label={'Long List'} selected={statsStore.uiXYState.longList} setSelected={() => update({longList: !statsStore.uiXYState.longList}) }/>
}

const SoilHorizonSelector = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForXYDataMachine)
  return <StringSelectorControl label={'Soil Data'} menu={SoilHorizonsMenu} selected={SoilHorizonsMenu[statsStore.uiXYState.selectedHorizon]} setSelected={(e) => update({selectedHorizon: e.menuType, selectedHorizonName: e.menuName})}/>
}


const ShowOutliersToggle = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <ToggleControl key={statsStore.uiRegressionState.showOutliers.toString()} label={'Show Outliers'} selected={statsStore.uiRegressionState.showOutliers} setSelected={() => update({showOutliers: !statsStore.uiRegressionState.showOutliers})}/>
}

const ShowThresholdsToggle = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <ToggleControl key={statsStore.uiRegressionState.showThresholds.toString()} label={'Show Thresholds'} selected={statsStore.uiRegressionState.showThresholds} setSelected={() => update({showThresholds: !statsStore.uiRegressionState.showThresholds})}/>
}

const ShowLabelsToggle = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <ToggleControl key={statsStore.uiRegressionState.showLabels.toString()} label={'Show Labels'} selected={statsStore.uiRegressionState.showLabels} setSelected={() => update({showLabels: !statsStore.uiRegressionState.showLabels})}/>
}

// const ShowSoilPhotos = () => {
//   const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
//   return <ToggleControl key={statsStore.uiRegressionState.showSoilPhotos.toString()} label={'Soil Photos In Report'} selected={statsStore.uiRegressionState.showSoilPhotos} setSelected={() => update({showSoilPhotos: !statsStore.uiRegressionState.showSoilPhotos})}/>
// }

const XHeaderSelector = () => {
  // const tm = useLoadMachineState(statsDataMachine)
  const menu = statsStore.xyState.xData.head.map((h, i) => ({menuName: h, menuType: i}))
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForXYDataMachine)
  return <StringSelectorControl label={'X Var'} menu={menu} selected={menu[statsStore.uiXYState.selectedXVar]} setSelected={(e) => update({selectedXVar: e.menuType})}/>
}

const YHeaderSelector = () => {
  // const tm = useLoadMachineState(statsDataMachine)
  const menu = statsStore.xyState.yData.head.map((h, i) => ({menuName: h, menuType: i}))
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForXYDataMachine)
  return <StringSelectorControl label={'Y Var'} menu={menu} selected={menu[statsStore.uiXYState.selectedYVar]} setSelected={(e) => update({selectedYVar: e.menuType})}/>
}

const RegressionSelector = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <StringSelectorControl label={'Regression'} menu={StatsRegressionTypesMenu} selected={StatsRegressionTypesMenu[statsStore.uiRegressionState.selectedRegression]} setSelected={(e) => update({selectedRegression: e.menuType})}/>
}

const RegressionDegreeControl = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <NumberInputControl label={'Degree'} selected={statsStore.uiRegressionState.degree} setSelected={(e) => update({degree: e})} min={0} max={10} step={1}/>
}

const RSquaredThresholdControl = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
  return <NumberInputControl label={'R2 Threshold'} selected={statsStore.uiRegressionState.r2Threshold} setSelected={(e) => update({r2Threshold: e})} min={0} max={1} step={0.1}/>
}

// const OutlierThreshold = () => {
//   const [_,update] = useLoadMachineStateWithUpdate(statsUIForRegressionsMachine)
//   return <NumberInputControl label={'Outlier Threshold'} selected={statsStore.uiRegressionState.outlierThreshold} setSelected={(e) => update({outlierThreshold: e})} min={0.1} max={20} step={0.25}/>
// }

const StatsToolbar = () => {
  return (
    <div className="flex flex-col relative text-xs justify-start sticky top-16 z-40">
      <div className="flex flex-row w-full bg-white">
        <div className="bg-blue-100 flex flex-row p-2 border-r-4 border-gray-100 ">
          <LongListToggle/>
          <SoilHorizonSelector/>
          <XHeaderSelector/>
          <YHeaderSelector/>
          <RegressionSelector/>
          <RegressionDegreeControl/>
        </div>

        <div className="bg-gray-100 flex flex-row p-2 border-r-4 border-gray-100 ">
          <RSquaredThresholdControl/>
          {/*<OutlierThreshold/>*/}
          <ShowOutliersToggle/>
          <ShowThresholdsToggle/>
          <ShowLabelsToggle/>
          {/*<ShowSoilPhotos/>*/}
        </div>
      </div>
    </div>
  )
}
export default StatsToolbar