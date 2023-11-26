import {MapLayerSelection} from "../model";
import {LoadingEvent} from "../../../core/machine";
import {useEffect, useState} from "react";
import {mapStore, mapStoreInputsMachine} from "../store";
import {Layer} from "./map-layer";
import {NumberInput} from "../../../components/number-input/view";
import {StringSelect} from "../../../components/string-select/view";
import {soilStore} from "../../../lib/stores/soil/store";


export const InterpolatedMapLayer = ({fn, toggle}: { fn: MapLayerSelection, toggle: (id: string) => void }) => {

  // requires useSoilHook and useSoilViewHook
  const mapMenu = Object.keys(soilStore.maps.soilMapUrls).map((x, i) => ({menuName: x, menuType: i}))
  mapMenu.splice(0, 0, {menuName: 'NA', menuType: -1})

  const [opacity, setOpacity] = useState(1)
  const [grayscale, setGrayscale] = useState(mapStore.mapLayerInputsState.mapGrayScale)
  const [map, setMap] = useState(mapMenu[0])

  const context = {
    order: 1,
    name: 'Grayscale',
    id: 'grayscale',
    active: grayscale,
    toggle: () => {
      setGrayscale(!grayscale)
    }
  }

  useEffect(() => {
    mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {interpolatedMapOpacity: opacity}})
  }, [opacity])

  useEffect(() => {
    mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {mapGrayScale: grayscale}})
  }, [grayscale])

  useEffect(() => {
    mapStoreInputsMachine.service.send({type: LoadingEvent.Update, payload: {interpolatedMapUrl: soilStore.maps.soilMapUrls[map.menuName]}})
  }, [map])

  return (
    <Layer fn={fn} toggle={toggle}>
      {
        fn.active?
          <div className="flex flex-col space-y-3">
            <div className="lbl-ring-outer">
              <label htmlFor="map" className="lbl-sm lbl-ring-inner">Map</label>
              <StringSelect name={'map'} className={'text-xs w-full rounded border-gray-200'} menu={mapMenu}
                            selected={map} setSelected={setMap}/>
            </div>
            <div className="lbl-ring-outer">
              <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Opacity</label>
              <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'opacity'} name={'opacity'} min={0} max={1} step={0.1} selected={opacity} setSelected={setOpacity} />
            </div>
            <div className="lbl-ring-outer">
              {/*<label htmlFor="grayscale" className="lbl-sm lbl-ring-inner"></label>*/}
              <Layer fn={context} toggle={context.toggle} children={undefined}>{}</Layer>
            </div>
          </div>

          : null
      }

    </Layer>

  )

}