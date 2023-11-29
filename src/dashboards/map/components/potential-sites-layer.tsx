import {MapLayerSelection} from "../model";
import {useEffect, useState} from "react";
import {mapStore, mapStoreInputsMachine} from "../store";
import {LoadingEvent} from "../../../core/machine";
import {NumberInput} from "../../../components/number-input/view";
import {Layer} from "./map-layer";


export const PotentialSitesLayer = ({fn, toggle}: { fn: MapLayerSelection, toggle: (id: string) => void }) => {


  const [filterDifference, setFilterDifference] = useState(mapStore.mapLayerInputsState.siteFilterDiff)
  const [filterMinimum, setFilterMinimum] = useState(mapStore.mapLayerInputsState.siteFilterMin)
  const [pointSize, setPointSize] = useState(mapStore.mapLayerInputsState.potentialSitesPointSize)

  useEffect(() => {
    mapStoreInputsMachine.service.send(LoadingEvent.Update, {siteFilterDiff: filterDifference, siteFilterMin: filterMinimum})
  }, [filterDifference, filterMinimum])

  useEffect(() => {
    mapStoreInputsMachine.service.send(LoadingEvent.Update, {potentialSitesPointSize: pointSize})
  }, [pointSize])


  return (
    <Layer fn={fn} toggle={toggle}>
      {
        fn.active?
          <div className="flex flex-col space-y-3">

            <div className="lbl-ring-outer">
              <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Filter Difference</label>
              <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'difference'}
                           name={'Filter Difference'} min={0} max={50} selected={filterDifference}
                           setSelected={setFilterDifference} step={0.01}/>
            </div>
            <div className="lbl-ring-outer">
              <label htmlFor="min" className="lbl-sm lbl-ring-inner">Filter Minimum</label>
              <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'min'} name={'Filter Minimum'} min={0}
                           max={50} selected={filterMinimum}
                           setSelected={setFilterMinimum} step={1}/>
            </div>
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