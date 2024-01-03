import {CsvContainer, CsvType} from "../../../core/model";
import {emptyCsv, ICsv} from "../../csv";
// @ts-ignore
import {Maybe, nothing} from "true-myth/maybe";
import {Meta} from "../../../core/meta";
import {MenuProps} from "../../../components/string-select/model.tsx";


export interface MapOverlayProps {
  name: string
  url: (variant:MenuProps) => string
  bbox: [number, number, number, number]
  image?: HTMLImageElement | null
}

export const emptyMapOverlay = ():MapOverlayProps => {
  return {
    name: '',
    url: (_:MenuProps) => '',
    bbox: [0, 0, 0, 0],
    image: null
  }
}

export interface PhotoReference {
  url: string
  ref: string
  uid: string
}

export interface SoilDataState {
  soilPoints: CsvContainer
  soilPointsMeta: Maybe<Meta>
  soilDataMetas: Meta[]
  soilHorizonData: { [key: string]: ICsv }
  soilFusion: CsvContainer
  soilSampleIds: string[]
  soilPointsXY: [number, number][]
}

export interface SoilPhotosState {
  soilPhotoMetas: { [key: string]: Meta }
  soilPhotoUrls: { [key: string]: PhotoReference }
}

export interface SoilMapsState {
  soilMapMetas: { [key: string]: Meta }
  soilMapUrls: { [key: string]: MapOverlayProps }
}

export interface SoilState {
  data: SoilDataState
  photos: SoilPhotosState
  maps: SoilMapsState
}
export const resetSoilData = (): SoilDataState => {
  return {
    soilPoints: {type: CsvType.Empty, csv: emptyCsv()},
    soilPointsMeta: nothing<Meta>(),
    soilDataMetas: [],
    soilHorizonData: {},
    soilFusion: {type: CsvType.Empty, csv: emptyCsv()},
    soilSampleIds: [],
    soilPointsXY: []
  }
}
export const resetSoilPhotos = (): SoilPhotosState => {
  return {
    soilPhotoMetas: {},
    soilPhotoUrls: {},
  }
}
export const resetSoilMaps = (): SoilMapsState => {
  return {
    soilMapMetas: {},
    soilMapUrls: {},
  }
}

export const resetSoil = (): SoilState => {
  return {
    data: resetSoilData(),
    maps: resetSoilMaps(),
    photos: resetSoilPhotos(),
  }
}

export const MAP_URL = 'http://localhost:3001/api/v1/map/image'
export const PHOTO_URL = 'http://localhost:3001/api/v1/photo/soil'
export const UPLOAD_URL = 'http://localhost:3001/api/v1/upload'