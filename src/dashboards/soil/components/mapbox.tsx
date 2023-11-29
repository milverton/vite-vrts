import {useEffect} from "react";
import {ImageOverlay, MapContainer, TileLayer, useMapEvents} from "react-leaflet";
import {MinMax} from "../../../lib/stats";
import {BoundaryOverlay} from "./boundary";
import PointsOverlay from "./pointsOverlay.tsx";
import {soilStore} from "../../../lib/stores/soil/store";
// @ts-ignore
import {Maybe} from "true-myth/maybe";
import {emptyMapOverlay, MapOverlayProps} from "../../../lib/stores/soil/model";
import L, {LatLngBoundsExpression} from "leaflet";
import {MapBoxSetup, MapVariant} from "../model";
import {classNames} from "../../../lib/common";
import {MenuProps} from "../../../components/string-select/model";
import {boundaryStore} from "../../../lib/stores/boundary/store";
import {soilUIStore} from "../store";
import {NewBoundary} from "../../../lib/stores/boundary/model";
import {BoundingBox} from "../../../core/bounding-box";


// Use React Leaflet hook to alter behaviour
const MapEvents = ({mapFit, updateNumber,boundary}: {mapFit: number, updateNumber:number, setZoom: (n:number) => void, boundary: NewBoundary[]}) => {

  // update zoom
  const map = useMapEvents({
    // zoomend: () => {
    //   console.log("ZOOM END", map.getZoom())
    //   setZoom(map.getZoom())
    // },
    // click: () => {
    //
    // }

  })
  // L.control.zoom({
  //   position: 'topright'
  // }).addTo(map);
  let mapFitCalc = mapFit
  if (mapFitCalc === 0) {
    mapFitCalc = updateNumber + boundary.length
  }


  // fit map to boundaries
  useEffect(() => {

    if (boundary && boundary.length > 0) {
      const minMaxX = new MinMax()
      const minMaxY = new MinMax()
      boundary.forEach(b => {
        const [minX, minY, maxX, maxY] = b.bounding_box
        minMaxX.update(minX)
        minMaxY.update(minY)
        minMaxX.update(maxX)
        minMaxY.update(maxY)
      })

      map.fitBounds([[minMaxY.min, minMaxX.min], [minMaxY.max, minMaxX.max]])
    }

  }, [mapFitCalc])

  return null
}

const MapOverlay = ({overlay, opacity, bbox,mapVariant}: {overlay:Maybe<MapOverlayProps>, opacity:number, bbox: BoundingBox, selectedBoundary:NewBoundary[], mapVariant: MapVariant}) => {

  if (overlay.isNothing) {
    return null
  }
  const data = overlay.unwrapOr(emptyMapOverlay())

  const latlngBbox = [[bbox.min_y, bbox.min_x], [bbox.max_y, bbox.max_x]]

  let url = data.url(mapVariant)
  return(
    // @ts-ignore
    <ImageOverlay key={url} opacity={opacity} url={url} bounds={latlngBbox as LatLngBoundsExpression}/>
  )
}

export interface MapBoxProps {
  updateNumber: number
  className: string
  mapBoxSetup: MapBoxSetup
  mapSize: MenuProps
  points: L.LatLngExpression[]
  showZoomControl:boolean
  scrollToZoom:boolean
  showPoints:boolean
  showBoundaries:boolean
  showAttributes:boolean
  selectedMap: MenuProps
  mapOpacity:number,
  mapZoom:number,
  setMapZoom: (z:number) => void,
  mapFit: number
}





const MapBox = ({updateNumber,className,points,mapBoxSetup, showZoomControl,scrollToZoom,showPoints,showBoundaries,selectedMap, mapOpacity, mapZoom, setMapZoom, mapFit}:MapBoxProps) => {

  // FIXME: pass in mapUrls
  const mapUrls = soilStore.maps.soilMapUrls
  const selectedBoundary = boundaryStore.boundary
  const bbox = boundaryStore.bbox
  const selectedMapVariant = soilUIStore.toolbarState.mapVariant
  const center = points[0] || [0, 0]
  const urlData = Maybe.of(mapUrls[selectedMap.menuName])
  let fsbBnd = selectedBoundary.first()
  const keyBase = fsbBnd?.block + fsbBnd?.client + fsbBnd?.field

  return (
    <>
      <MapContainer
                    key={keyBase}
                    className={classNames(className)}
                    // @ts-ignore
                    center={center}
                    zoom={mapZoom}
                    zoomControl={showZoomControl}
                    scrollWheelZoom={scrollToZoom}
                    style={{width: '100%', height: "100%"}}>
        <MapEvents mapFit={mapFit} updateNumber={updateNumber} setZoom={setMapZoom} boundary={selectedBoundary}/>
        <TileLayer
          // @ts-ignore
          attribution={mapBoxSetup.attribution}
          url={mapBoxSetup.url}
          keepBuffer={100} />
        <BoundaryOverlay key={keyBase + 'bo'} show={showBoundaries} boundary={selectedBoundary}/>
        <MapOverlay overlay={urlData} mapVariant={selectedMapVariant} bbox={bbox} selectedBoundary={selectedBoundary} opacity={mapOpacity} />
        <PointsOverlay show={showPoints}/>
      </MapContainer>
    </>
  )
}

export default MapBox