import L from "leaflet";
import {emptyCsv, ICsv} from "../../lib/csv";
import {MenuProps} from "../../components/string-select/model";

export const MapSize = [
  {menuName: 'Off', menuType: 0},
  {menuName: 'Small', menuType: 1},
  {menuName: 'Medium', menuType: 2},
  {menuName: 'Large', menuType: 3},
  {menuName: "Full", menuType: 4},
]
export const PointColorMenu = [
  {menuName: 'Blue', menuType: 0},
  {menuName: 'LimeGreen', menuType: 1},
  {menuName: 'Yellow', menuType: 2},
  {menuName: 'Red', menuType: 3},
  {menuName: 'White', menuType: 4},
  {menuName: 'Black', menuType: 5},
]
export const ViewMenu = [
  {menuName: 'Soil Results', menuType: 0},
  {menuName: 'Soil Photos', menuType: 1},
]
export const SoilHorizonsMenu = [
  // {menuName: 'NA', menuType: 0},
  {menuName: '0-10', menuType: 0},
  {menuName: 'A', menuType: 1},
  {menuName: 'B', menuType: 2},
]

export interface SelectedPoint {
  point: [number,number]
  latlng: L.LatLng
  sampleId: string
  rowIndex: number
}

// FIXME: Token needs to come in through the environment and not hard coded
export const token = "sk.eyJ1IjoibWlsdmVydG9uIiwiYSI6ImNrenRhaWd3cTB6anIyd3BrZ3Jzc2czbHMifQ.FvHS5P4tdvx44VsETgedmg"
export const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${token}`
export const attribution =   `© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>`
export interface MapBoxSetup {
  token: string
  url: string
  attribution: string
}

export const DefaultMapBoxSetup: MapBoxSetup = {
  token: token,
  url: url,
  attribution: attribution
}
// export enum MapVariant {
//   Default = "default",
//   BlackAndWhite = "black-and-white",
//   Gradient = "gradient"
// }

export interface SoilUIToolbarState {
  selectedHorizon: number
  selectedHorizonName: string
  selectedMapSize: number
  selectedSoilHeader: number
  selectedSoilHeaderName: string
  selectedMap: number
  selectedMapMenuEntry: MenuProps
  mapMenu: MenuProps[],
  shrinkTable: boolean
  colorTable: boolean
  mapOpacity: number
  showBoundaries: boolean
  showPoints: boolean
  scrollZoom: boolean
  pointColor: number
  selectedPointColor: number
  mapZoom: number
  mapFit: number
  mapVariant: MenuProps
  mapVariants: MenuProps[]
}

export const resetSoilUIToolbar = ():SoilUIToolbarState => {

  return {
    selectedHorizon: 0,
    selectedHorizonName: '0-10',
    selectedMapSize: 2,
    selectedSoilHeader: -1,
    selectedSoilHeaderName: 'NA',
    selectedMap: -1,
    selectedMapMenuEntry: {menuName: 'NA', menuType: -1},
    mapMenu: [],
    shrinkTable: true,
    colorTable: false,
    mapOpacity: 1,
    showBoundaries: true,
    showPoints: true,
    scrollZoom: false,
    pointColor: 0,
    selectedPointColor: 3,
    mapZoom: 12,
    mapFit: 0,
    mapVariant: {menuName: 'Default', menuType: 'data'},
    mapVariants: [{menuName: 'Default', menuType: 'data'}]
  }
}

export interface SoilUIDataState {
  selectedHorizonData: ICsv
  selectedHorizonDataPoints: L.LatLngExpression[]
  shrunkHorizonData: ICsv
  selectedColumnData: {columnIndex: number, columnData: string[]}
  combinedHorizonData: {[k:string]: {[h:number]: []}}
}

export const resetSoilUIData = (): SoilUIDataState => {
  return {
    selectedHorizonData: emptyCsv(),
    selectedHorizonDataPoints: [],
    shrunkHorizonData: emptyCsv(),
    selectedColumnData: {columnIndex: -1, columnData: []},
    combinedHorizonData: {},
  }
}


export interface SoilUIState {
  toolbarState: SoilUIToolbarState
  soilDataState: SoilUIDataState
}

export const resetSoilUI = (): SoilUIState => {
  return {
    toolbarState: resetSoilUIToolbar(),
    soilDataState: resetSoilUIData()
  }
}





