import {LoadingEvent, LoadingMachine, LoadingState} from "../../../../core/machine";
import {CubeIcon, GlobeAsiaAustraliaIcon} from "@heroicons/react/24/solid";
import {BeakerIcon} from "@heroicons/react/20/solid";
import {JSX} from "react";

export const SatelliteStatus = {
  loaded: <GlobeAsiaAustraliaIcon key="sstg" className="h-5 w-5 mt-[2px] text-green-500" />,
  loading: <GlobeAsiaAustraliaIcon key="ssto" className="h-5 w-5 mt-[2px] text-orange-500 animate-pulse" />,
  failed: <GlobeAsiaAustraliaIcon key="sstr" className="h-5 w-5 mt-[2px] text-gray-500" />,
  empty: <GlobeAsiaAustraliaIcon key="sstg" className="h-5 w-5 mt-[2px] text-gray-500" />
}
export const MeshStatus = {
  loaded: <CubeIcon key="mstg" className="h-5 w-5 mt-[2px] text-green-500" />,
  loading: <CubeIcon key="msto" className="h-5 w-5 mt-[2px] text-orange-500 animate-pulse" />,
  failed: <CubeIcon key="mstr" className="h-5 w-5 mt-[2px] text-gray-500" />,
  empty: <CubeIcon key="mstg" className="h-5 w-5 mt-[2px] text-gray-500" />
}

export const WaterStatus = {
  loaded: <BeakerIcon key="wstg" className="h-5 w-5 mt-[2px] text-green-500" />,
  loading: <BeakerIcon key="wsto" className="h-5 w-5 mt-[2px] text-orange-500 animate-pulse" />,
  failed: <BeakerIcon key="wstr" className="h-5 w-5 mt-[2px] text-gray-500" />,
  empty: <BeakerIcon key="wstg" className="h-5 w-5 mt-[2px] text-gray-500" />
}
export const GetWaterStatus = (machine: LoadingMachine): [JSX.Element, boolean] => {
  const event = machine.value

  switch (event){
    case LoadingEvent.Failure:
      return [WaterStatus.failed, false]
    case LoadingState.Loaded:
      return[ WaterStatus.loaded, false]
    case LoadingState.Loading:
      return [WaterStatus.loading, true]
    default: return [WaterStatus.empty, false]
  }
}

export const GetHeightStatus = (machine: LoadingMachine): [JSX.Element, boolean] => {

  const event = machine.value
  console.log(event)
  switch (event){
    case LoadingEvent.Failure:
      return [MeshStatus.failed, false]
    case LoadingState.Loaded:
      return [MeshStatus.loaded, false]
    case LoadingState.Loading:
      return [MeshStatus.loading, true]
    default: return [MeshStatus.empty, false]
  }
}

export const GetSatelliteStatus = (machine: LoadingMachine): [JSX.Element, boolean] => {
  const event = machine.value

  switch (event){
    case LoadingEvent.Failure:
      return [SatelliteStatus.failed, false]
    case LoadingState.Loaded:
      return [SatelliteStatus.loaded, false]
    case LoadingState.Loading:
      return [SatelliteStatus.loading, true]
    default: return [SatelliteStatus.empty, false]
  }
}









