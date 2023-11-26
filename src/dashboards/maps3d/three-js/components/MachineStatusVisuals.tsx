import {LoadingEvent, LoadingMachine} from "../../../../core/machine";
import {CubeIcon, GlobeAsiaAustraliaIcon} from "@heroicons/react/24/solid";
import {BeakerIcon} from "@heroicons/react/20/solid";

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
export const GetWaterStatus = (machine: LoadingMachine): any => {
  let event = machine.service.state.value

  switch (event){
    case LoadingEvent.Failure:
      return WaterStatus.failed
    case LoadingEvent.Success:
      return WaterStatus.loaded
    case LoadingEvent.Load:
      return WaterStatus.loading
    default: return WaterStatus.empty
  }
}

export const GetHeightStatus = (machine: LoadingMachine): any => {
  console.log("MOOOOOOOOOOOOO", machine.service.state)
  let event = machine.service.state.value

  switch (event){
    case LoadingEvent.Failure:
      return MeshStatus.failed
    case LoadingEvent.Success:
      return MeshStatus.loaded
    case LoadingEvent.Load:
      return MeshStatus.loading
    default: return MeshStatus.empty
  }
}

export const GetSatelliteStatus = (machine: LoadingMachine): any => {
  let event = machine.service.state.value

  switch (event){
    case LoadingEvent.Failure:
      return SatelliteStatus.failed
    case LoadingEvent.Success:
      return SatelliteStatus.loaded
    case LoadingEvent.Load:
      return SatelliteStatus.loading
    default: return SatelliteStatus.empty
  }
}









