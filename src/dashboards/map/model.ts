import {NewBoundary} from "../../lib/stores/boundary/model";

import {emptyCsv, ICsv} from "../../lib/csv";
import {BoundingBox} from "../../core/bounding-box";
import {MenuProps} from "../../components/string-select/model";
import {RGB} from "../../lib/palette";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export enum CsvType {
  Empty,
  Generic,
  EmRaw,
  EmClean,
  GrRaw,
  GrClean,
  PctAgEM,
  PctAgGR,
  DEX,
  TerraLogga,
  DLog,
  SoilPoints,
  SoilFusion,
}

export interface CsvContainer {
  csv: ICsv
  type: CsvType
}

export interface Bin {
  count: number
  startValue: number
  endValue: number
  sortedStartIndex: number
  sortedEndIndex: number
  isLast: boolean
}

export interface MapLayerSelection {
  id: string
  name: string
  active: boolean
  order: number
}
export interface CleanupFunction {
  (): void
}
export interface MapLayersState {
  layers: MapLayerSelection[]
}

export interface DrawFunction2D {
  (ref: any, canvasScale: number, zoom:number,lineScale: number, pointScaleFn: (n: number) => number): Promise<null>
}

export interface DrawFunction3D {
  (scene: THREE.Scene, bbox: BoundingBox, orbitControl: OrbitControls): Promise<CleanupFunction>
}

export interface SiteSelection {
  point: [number,number]
  columnIndex: number
  value: number
  bin:number
  locationIndex: number

}

export interface DrawFunction2DArgs {
  layers: MapLayerSelection[],
  bbox: BoundingBox,
  boundaries: NewBoundary[],
  scaledCoordinates: number[][],
  unscaledCoordinates: number[][],
  interpolatedMapUrl: {bbox: number[], url: string},
  column: number[],
  columnFilter:ToolColumnFilterState,
  soilCoordinates: CsvContainer,
  selectedBreakpoint: Bin,
  siteSelection: {[n:number]: SiteSelection},
  interpolatedMapOpacity: number,
  columnValuesPointSize: number,
  columnValuesPercentageToShow: number,
  headingsPointSize: number,
  headingsPercentageToShow: number,
  coordinatesPointSize: number,
  mapGrayScale: boolean,
  soilPointSize: number
  potentialSitesPointSize: number
  selectedSitesPointSize: number
  paletteRGBHandler: (n: number) => RGB
  binIndexHandler: (n: number) => number
}

export interface DrawFunction3DArgs extends DrawFunction2DArgs {
  showWireframe: boolean,
  accentuateHeight: boolean,
  heightTimeStamp: number,
  scalePercentage: number,
  interpolatedPoints: THREE.Vector3[],
  weight: number,
  is3D: boolean,
  meshResolution: number,
  showSatellite: boolean,
  interpolated3DMapOpacity: number,
}


export interface MapDrawFunctions2D {
  drawFunctions2D: DrawFunction2D[],
  drawFunctions2DArgs: DrawFunction2DArgs,

}
export interface MapDrawFunctions3D {
  drawFunctions3D: DrawFunction3D[],
  drawFunctions3DArgs: DrawFunction3DArgs,
}

export interface MapLayerInputsState {
  siteFilterMin: number
  siteFilterDiff: number
  selectedBin: Bin
  selectedBinIndex: number
  selectedInterpolatedMap: MenuProps,
  siteID: string
  interpolatedMapOpacity: number
  interpolatedMapUrl: {bbox: number[], url: string},
  columnValuesPointSize: number
  columnValuesPercentageToShow: number
  headingsPointSize: number
  headingsPercentageToShow: number
  coordinatesPointSize: number
  mapGrayScale: boolean
  soilPointSize: number
  potentialSitesPointSize: number
  selectedSitesPointSize: number,
  showWireframe: boolean,
  accentuateHeight: boolean,
  heightTimeStamp: number,
  scalePercentage: number,
  interpolatedPoints: THREE.Vector3[],
  weight: number,
  is3D: boolean,
  meshResolution: number,
  showSatellite: boolean,
  interpolated3DMapOpacity: number,
}

export const resetMapLayerInputs = (): MapLayerInputsState => {
  return {
    siteFilterMin: 3,
    siteFilterDiff: 3,
    selectedBin: {count: 0, startValue: 0, endValue: 0, sortedStartIndex: 0, sortedEndIndex: 0, isLast: false},
    selectedBinIndex: 0,
    selectedInterpolatedMap: {menuName: 'NA', menuType: -1},
    siteID: 'NA',
    interpolatedMapOpacity: 1,
    interpolatedMapUrl: {bbox: [], url: ''},
    columnValuesPointSize: 1.25,
    columnValuesPercentageToShow: 100,
    headingsPointSize: 1.25,
    headingsPercentageToShow: 25,
    coordinatesPointSize: 1.25,
    mapGrayScale: false,
    soilPointSize: 10,
    potentialSitesPointSize: 6,
    selectedSitesPointSize: 6,
    showWireframe: false,
    accentuateHeight: true,
    heightTimeStamp: 0,
    scalePercentage: 5,
    interpolatedPoints: [],
    weight: 0.015,
    is3D: true,
    meshResolution: 15,
    showSatellite: true,
    interpolated3DMapOpacity: 1,
  }
}
export interface MapStoreState {
  mapLayersState: MapLayersState
  mapDrawFunctions2DState: MapDrawFunctions2D
  mapDrawFunctions3DState: MapDrawFunctions3D
  mapLayerInputsState: MapLayerInputsState
}
export const MapLayerIDs = {
  BBox: 'draw-bbox',
  Boundaries: 'draw-boundaries',
  Coordinates: 'draw-coordinates',
  Headings: 'draw-headings',
  InterpolatedMap: 'draw-interpolated-map',
  Labels: 'draw-labels',
  StartEnd: 'draw-start-end',
  Bins: 'draw-bins',
  PointGrid: 'draw-point-grid',
  SoilPoints: 'draw-soil-points',
  SoilFusion: 'draw-soil-fusion',
  ColumnValues: 'draw-column-values',
  PotentialSites: 'draw-potential-sites',
  SelectedSites: 'draw-selected-sites',
  HeightMap: 'draw-height-map',
  InterpolationGPU: 'draw-interpolation-gpu',
}
export const resetMapLayers = (): MapLayersState => {
  return {
    layers: [
      {id: MapLayerIDs.BBox, name: 'Bounding Box', active: false, order: 10},
      {id: MapLayerIDs.Boundaries, name: 'Boundaries', active: false, order: 100},
      {id: MapLayerIDs.Coordinates, name: 'Coordinates', active: false, order: 10},
      {id: MapLayerIDs.Headings, name: 'Headings', active: false, order: 20},
      {id: MapLayerIDs.InterpolatedMap, name: 'Map', active: false, order: 1},
      // {id: MapLayersIDs.drawLabels, name: 'Labels', active: false, order: 40},
      {id: MapLayerIDs.StartEnd, name: 'Start and End', active: false, order: 30},
      // {id: MapLayerIDs.drawBreakpoints, name: 'Breakpoints', active: false, order: 70},
      {id: MapLayerIDs.PointGrid, name: 'Point Grid', active: false, order: 80},
      {id: MapLayerIDs.SoilPoints, name: 'Soil Points', active: false, order: 40},
      // {id: MapLayerIDs.drawSoilFusion, name: 'Soil Fusion', active: false, order: 100},
      {id: MapLayerIDs.ColumnValues, name: 'Column Values', active: false, order: 90},
      {id: MapLayerIDs.PotentialSites, name: 'Potential Sites', active: false, order: 70},
      {id: MapLayerIDs.SelectedSites, name: 'Selected Sites', active: false, order: 80},
      {id: MapLayerIDs.HeightMap, name: 'Height Map', active: true, order: 60},
      // {id: MapLayerIDs.InterpolationGPU, name: 'Interpolation GPU', active: false, order: 50},
    ] as MapLayerSelection[]
  }
}
// export interface ToolCoordinatesState {
//   type: CsvType
//   csv: ICsv,
//   rawCoordinates: number[][],
//   scaledCoordinates: number[][],
//   bbox: BoundingBox,
// }
// export const resetToolCoordinatesState = (): ToolCoordinatesState => {
//   return {
//     type: CsvType.Generic,
//     csv: emptyCsv(),
//     rawCoordinates: [],
//     scaledCoordinates: [],
//     bbox: new BoundingBox(0, 0),
//   }
// }

export interface SortedValue {
  value: number
  idx: number
}

export interface SiteSelectionValue {
  value: number
  idx: number
  diff: number
}
export interface ToolColumnFilterState {
  filterMin: number,
  filterDiff: number,
  locations: SortedValue[][],
  locationsForSelectedBin: SiteSelectionValue[][],
}

export const resetToolColumnFilterState = ():ToolColumnFilterState => {
  return {
    filterMin: 0,
    filterDiff: 0,
    locations: [] as SortedValue[][],
    locationsForSelectedBin: [] as SiteSelectionValue[][],
  }
}

export const resetMapDrawFunctions2D = (): MapDrawFunctions2D => {
  return {
    drawFunctions2D: [],
    drawFunctions2DArgs: {
      layers: [],
      bbox: new BoundingBox(0, 0),
      boundaries: [],
      scaledCoordinates: [],
      unscaledCoordinates: [],
      interpolatedMapUrl: {bbox: [], url: ''},
      column: [],
      columnFilter: resetToolColumnFilterState(),
      soilCoordinates: {csv: emptyCsv(), type: CsvType.SoilPoints},
      interpolatedMapOpacity: 1,
      columnValuesPointSize: 1.25,
      selectedBreakpoint: {},
      siteSelection: {},
      columnValuesPercentageToShow: 100,
      headingsPointSize: 1.25,
      headingsPercentageToShow: 25,
      coordinatesPointSize: 1.25,
      mapGrayScale: false,
      soilPointSize: 10,
      potentialSitesPointSize: 6,
      selectedSitesPointSize: 6,
      // paletteRGBHandler: (n: number) => new RGB(0,0,0),
      // binIndexHandler: (n: number) => 0,
    } as unknown as DrawFunction2DArgs
  }
}


export const resetMapDrawFunctions3D = (): MapDrawFunctions3D => {
  return {
    drawFunctions3D: [],
    drawFunctions3DArgs: {
      showWireframe: false,
      accentuateHeight: true,
      heightTimeStamp: 0,
      scalePercentage: 5,
      interpolatedPoints: [],
      weight: 0.015,
      is3D: true,
      meshResolution: 15,
      showSatellite: true,
      interpolated3DMapOpacity: 1,
      ...resetMapDrawFunctions2D().drawFunctions2DArgs
    } as DrawFunction3DArgs
  }
}

export const resetMapStore = (): MapStoreState => {
  return {
    mapLayersState: resetMapLayers(),
    mapDrawFunctions2DState: resetMapDrawFunctions2D(),
    mapDrawFunctions3DState: resetMapDrawFunctions3D(),
    mapLayerInputsState: resetMapLayerInputs(),
  }
}


// export interface PngCallbackProps {
//   png: string
//   id: string
//   width: number
//   height: number
// }
export interface ImageCallback {
  (imgData: string, id: string, width: number, height: number): void
}

