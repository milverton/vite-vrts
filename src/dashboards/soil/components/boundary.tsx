import {GeoJSON} from "react-leaflet";
import {boundaryToFeatureCollection} from "../../../lib/stores/boundary/transform";
import { NewBoundary } from "../../../lib/stores/boundary/model";

export const BoundaryOverlay = ({show, boundary}: { show: boolean, boundary: any }) => {


  if (show) {
    const boundaries = boundary.map((b: NewBoundary) => boundaryToFeatureCollection(b))
    const key = boundaries.map((x: { geometry: { bbox: any; }; }) => x.geometry.bbox).flat().join('-')
    return (
      <>
        {
          boundaries.map((d: any, i: any) => {
            // @ts-ignore
            return <GeoJSON key={i + key} data={d} style={{color: 'limegreen', weight: 2, fillColor: 'transparent'}}/>
          })
        }
      </>
    )

  }

  return <>{[]}</>
}