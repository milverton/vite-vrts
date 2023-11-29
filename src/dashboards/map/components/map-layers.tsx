import {LoadingEvent, useLoadMachineState} from "../../../core/machine";
import {mapStore, mapStoreDrawState2DMachine, mapStoreLayersMachine} from "../store";
import {MapLayerIDs} from "../model";
import {PotentialSitesLayer} from "./potential-sites-layer";
import {Layer} from "./map-layer";
import {InterpolatedMapLayer} from "./interpolate-map-layer";
import {ColumnValuesLayer} from "./column-values-layer";
import {HeadingsLayer} from "./headings-layer";
import {CoordinatesLayer} from "./coordinates-layer";
import {SoilPointsLayer} from "./soil-points-layer";
import { ReactElement, JSXElementConstructor, ReactNode } from "react";

export const MapLayers = () => {
  useLoadMachineState(mapStoreDrawState2DMachine)
  const layers = mapStore.mapLayersState.layers

  // const [functions, toggleFunction] = useDrawFunctionsHook(drawFunctions, setDrawFunctions, bbox, boundaries, scaledCoordinates, unscaledCoordinates, soilCoordinates, soilFusion, columnData, columnFilterState, interpolatedMapUrl, selectedBreakpoint, breakpointIndices, updateTm, percentagePoints)

  const toggle = (id: string) => {
    const idx = mapStore.mapLayersState.layers.findIndex(x => x.id === id)
    layers[idx].active = !layers[idx].active
    mapStoreLayersMachine.reset()
    mapStoreLayersMachine.service.send(LoadingEvent.Load, {layers})
  }

  const elements: any = []
  layers.map((fn, fnIdx) => {

    switch (fn.id) {
      case MapLayerIDs.PotentialSites:
        elements.push(<PotentialSitesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      // case MapLayerIDs.SelectedSites:
      //   elements.push(<SelectedSitesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
      //   break
      case MapLayerIDs.InterpolatedMap:
        elements.push(<InterpolatedMapLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.ColumnValues:
        elements.push(<ColumnValuesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.Headings:
        elements.push(<HeadingsLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.Coordinates:
        elements.push(<CoordinatesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.SoilPoints:
        elements.push(<SoilPointsLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.HeightMap:
        break
      default:
        elements.push(<Layer fn={fn} toggle={toggle} key={fnIdx} children={undefined}>{}</Layer>)
        break
    }
  })

  return (
    <fieldset>
      <legend className="font-medium text-gray-900">Map Layers</legend>
      {/*<div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">*/}
      {elements}
      {/*</div>*/}
    </fieldset>

  )
}


export const MapLayers3D = () => {
  useLoadMachineState(mapStoreDrawState2DMachine)
  const layers = mapStore.mapLayersState.layers

  const elements: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined = []
  layers.map((fn) => {

    switch (fn.id) {
      case MapLayerIDs.Boundaries:
        // FIXME: toggling boundaries disables height layer.
        // elements.push(<Layer fn={fn} toggle={toggle} key={fnIdx}>{}</Layer>)
        break
      case MapLayerIDs.PotentialSites:
        // elements.push(<PotentialSitesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.SelectedSites:
        // elements.push(<SelectedSitesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.HeightMap:
        // elements.push(<HeightLayer/>)
        break
      case MapLayerIDs.InterpolatedMap:
        break
      case MapLayerIDs.ColumnValues:
        // elements.push(<ColumnValuesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.Headings:
        // elements.push(<HeadingsLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.Coordinates:
        // elements.push(<CoordinatesLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break
      case MapLayerIDs.SoilPoints:
        // elements.push(<SoilPointsLayer fn={fn} toggle={toggle} key={fnIdx}/>)
        break

      case MapLayerIDs.BBox:
        break
      case MapLayerIDs.PointGrid:
        break
      case MapLayerIDs.StartEnd:
        break
      default:
        // elements.push(<Layer fn={fn} toggle={toggle} key={fnIdx}>{}</Layer>)
        break
    }
  })

  return (
    <fieldset>
      <legend className="font-medium text-gray-900 mb-2 mt-2">Map Layers</legend>
      {/*<div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">*/}
      {elements}
      {/*</div>*/}
    </fieldset>

  )
}