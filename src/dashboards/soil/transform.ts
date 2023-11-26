import L from "leaflet";
import {MenuProps} from "../../components/string-select/model";
import {csvColumnData, csvIndicesOf, ICsv} from "../../lib/csv";
import {SoilHorizonsMenu} from "./model";


export const getMapSize = (mapSize: MenuProps): string => {
  switch (mapSize.menuType) {
    case 0:
      return '0px'
    case 1:
      return '480px'
    case 2:
      return '675px'
    case 3:
      return '85vh'
    case 4:
      return '90vh'
    default:
      return '500px'
  }
}

export const latLngToPoint = (latLng: any): L.LatLngExpression => {
  return [latLng.lat, latLng.lng] as L.LatLngExpression
} // TODO: need this generalised solution for all csvs with coordinates
export const rowToPoint = (row: string[], latIndex: number, lonIndex: number) => {
  return [parseFloat(row[latIndex]), parseFloat(row[lonIndex])] as L.LatLngExpression
}

const matchInRange = (min: number, max: number) => {
  return (value: number) => {
    return value >= min && value < max
  }
}
const matchLessThan = (max: number) => {
  return (value: number) => {
    return value < max
  }
}
const matchGreaterThanOrEqual = (min: number) => {
  return (value: number) => {
    return value >= min
  }
}

interface Match {
  (value: number): boolean
}
const potash = [matchInRange(0,30), matchInRange(30,40), matchInRange(40,60), matchGreaterThanOrEqual(60)]
const phosphorus = [matchInRange(0,10), matchInRange(10,20), matchInRange(20,30), matchGreaterThanOrEqual(30)]
const sodium = [matchGreaterThanOrEqual(30), matchInRange(15,30), matchInRange(6,15), matchLessThan(6)]
const ph = [matchLessThan(4.5), matchInRange(4.5,4.8), matchInRange(4.8,5.5), matchGreaterThanOrEqual(5.5)]

const getMatchIndex = (value: number, matches:Match[]) => {
  return matches.findIndex(match => match(value))
}


const getColor = (idx: number) => {
  switch (idx) {
    case 0: return '#ef4444' // red
    case 1: return '#f97316' // orange
    case 2: return '#eab308' // yellow
    case 3: return '#22c55e' // green
  }
}

export const getColorForSoilSample = (header:string, value:string, defaultColor: string) => {
  const nValue  = parseFloat(value)
  if (isNaN(nValue)) {
    return defaultColor
  }
  if (header.startsWith('Soil K Colwell[ppm]')) {
    const idx = getMatchIndex(nValue, potash)
    return getColor(idx)
  }
  if (header.startsWith('Soil P Colwell[ppm]')) {
    const idx = getMatchIndex(nValue, phosphorus)
    return getColor(idx)
  }
  if (header.startsWith('Soil Na %')) {
    const idx = getMatchIndex(nValue, sodium)
    return getColor(idx)
  }
  if (header.startsWith('Soil pH') && !header.endsWith('CaCl')) {
    const idx = getMatchIndex(nValue, ph)
    return getColor(idx)
  }
  return defaultColor

}

// REQUIRE
// points file
// em data
// gr data
// 1. map points coords to closest em and gr coordinates
// 2. merge the em and gr values into a fusion object


export const createCombinedHorizonData = (horizonData: {[p:string]: ICsv}, _sampleIds: string[]): {[k:string]: {[h:number]: []}} => {
  const horizons = Object.keys(horizonData)
  return horizons.reduce((acc, h) => {
    const headers = horizonData[h].head

    return headers.reduce((acc2:any, h2, i) => {
      const sampleIdIndex = csvIndicesOf(horizonData[h], ['Sample ID'])
      const sampleIds = csvColumnData(horizonData[h], sampleIdIndex.first())
      const value = horizonData[h].body.map((row, _) => row[i]).map(x => x.trim().length ? x.trim() : 'NA')
      const _zipped = sampleIds.map((id, i) => ({id: id, value: value[i], header: h2, horizon: h, idGroup: id.split('-')[0].trim()}))
      const zipped = sampleIds.reduce((acc: any,id: string) => {
        acc[id] = _zipped.find((z) => z.id.startsWith(id))
        return acc
      }, {})

      if (acc2[h2] === undefined) {
        // @ts-ignore
        acc2[h2] = {[SoilHorizonsMenu[h].menuName]: zipped}
      } else {
        // @ts-ignore
        acc2[h2] = {...acc2[h2], [SoilHorizonsMenu[h].menuName]: zipped}
      }
      return acc2
    }, acc)

  }, {})
}

export const groupCombinedHorizonDataBySampleId = (combinedHorizonData: {[k:string]: {[h:number]: []}}): {[k:string]: {[h:number]: string}} => {
  const values = Object.values(combinedHorizonData).map(x => Object.values(x)).flat()
  return values.reduce((acc: any, x) => {
    const vals = Object.values(x) as { id: string, idGroup:string, value: string, header: string, horizon: string}[]
    // {
    //     "id": "ZN01",
    //     "value": "121.4747848",
    //     "header": "Longitude",
    //     "horizon": "1"
    // }
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]
      if (acc[v.idGroup] === undefined) {
        acc[v.idGroup] =  {[v.header]: {[v.horizon]: v.value}}
      } else {
        if (acc[v.idGroup][v.header] === undefined) {
          acc[v.idGroup][v.header] = {[v.horizon]: v.value}
        } else {
          acc[v.idGroup][v.header][v.horizon] = v.value
        }
      }
    }

    return acc
  }, {})
}