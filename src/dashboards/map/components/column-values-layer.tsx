import {MapLayerSelection} from "../model";
import {useEffect, useState} from "react";
import {mapStore, mapStoreInputsMachine} from "../store";
import {LoadingEvent} from "../../../core/machine";
import {Layer} from "./map-layer";
import {DelayedNumberInput, NumberInput} from "../../../components/number-input/view";


export const ColumnValuesLayer = ({fn, toggle}: { fn: MapLayerSelection, toggle: (id: string) => void }) => {

  const [pointSize, setPointSize] = useState(mapStore.mapLayerInputsState.columnValuesPointSize)
  const [pointPercentage, setPointPercentage] = useState(mapStore.mapLayerInputsState.columnValuesPercentageToShow)

  useEffect(() => {
    mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {columnValuesPointSize: pointSize}})
  }, [pointSize])

  useEffect(() => {
    mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {columnValuesPercentageToShow: pointPercentage}})
  }, [pointPercentage])

  return (
    <Layer fn={fn} toggle={toggle}>
      {
        fn.active?
          <div className="flex flex-col space-y-3">
            <div className="lbl-ring-outer">
              <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Point Size</label>
              <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'pointSize'} name={'pointSize'} min={0} max={100} step={0.1} selected={pointSize} setSelected={setPointSize} />
            </div>
            <div className="lbl-ring-outer">
              <label htmlFor="showpoints" className="lbl-xs lbl-ring-inner">% of Points To Show</label>
              <DelayedNumberInput className="number-input-sm" id={'showpoints'} name={'Show Points %'} min={1} max={100} step={10} delay={500}
                                  selected={pointPercentage} setSelected={setPointPercentage}/>
            </div>
          </div>
          : null
      }

    </Layer>

  )

}