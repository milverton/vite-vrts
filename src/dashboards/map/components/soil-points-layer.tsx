import {MapLayerSelection} from "../model";
import {useEffect, useState} from "react";
import {mapStore, mapStoreInputsMachine} from "../store";
import {LoadingEvent} from "../../../core/machine";
import {Layer} from "./map-layer";
import {NumberInput} from "../../../components/number-input/view";

export const SoilPointsLayer = ({fn, toggle}: { fn: MapLayerSelection, toggle: (id: string) => void }) => {
  const [pointSize, setPointSize] = useState(mapStore.mapLayerInputsState.soilPointSize)

  useEffect(() => {
    mapStoreInputsMachine.service.send(LoadingEvent.Update, {soilPointSize: pointSize})
  }, [pointSize])

  return (
    <Layer fn={fn} toggle={toggle}>
      {
        fn.active?
          <div className="flex flex-col space-y-3">
            <div className="lbl-ring-outer">
              <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Point Size</label>
              <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'pointSize'} name={'pointSize'} min={0} max={100} step={0.1} selected={pointSize} setSelected={setPointSize} />
            </div>
          </div>
          : null
      }
    </Layer>

  )

}