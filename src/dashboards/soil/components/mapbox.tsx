import {useEffect} from "react";
import {ImageOverlay, MapContainer, TileLayer, useMapEvents} from "react-leaflet";
import {MinMax} from "../../../lib/stats";
import {BoundaryOverlay} from "./boundary";
import PointsOverlay from "./points";
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
const MapEvents = ({fitMap, setZoom, boundary}: {fitMap: number, setZoom: (n:number) => void, boundary: NewBoundary[]}) => {
  // console.log("MAP EVENTS", fitMap)
  // update zoom
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom())
    },
    // click: () => {
    //
    // }

  })
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
      // console.log("FIT MAP", fitMap, boundary)
      map.fitBounds([[minMaxY.min, minMaxX.min], [minMaxY.max, minMaxX.max]])
    }

  }, [fitMap])

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

const MapBox = ({className,mapBoxSetup,points,showZoomControl,scrollToZoom,showPoints,showBoundaries,selectedMap, mapOpacity, mapZoom, setMapZoom, mapFit}:MapBoxProps) => {

  // FIXME: pass in mapUrls
  const mapUrls = soilStore.maps.soilMapUrls
  const selectedBoundary = boundaryStore.boundary
  const bbox = boundaryStore.bbox
  const selectedMapVariant = soilUIStore.toolbarState.mapVariant
  const center = points[0] || [0, 0]
  const urlData = Maybe.of(mapUrls[selectedMap.menuName])
  let fsbBnd = selectedBoundary.first()
  const keyBase = fsbBnd?.block + fsbBnd?.client + fsbBnd?.field

  // @ts-ignore

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
        <MapEvents fitMap={mapFit} setZoom={setMapZoom} boundary={selectedBoundary}/>
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