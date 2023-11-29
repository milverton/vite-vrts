import {DBMetaGroup} from "../../db";
import {MAP_URL, PHOTO_URL, SoilState} from "./model";
// @ts-ignore
import {just, Maybe} from "true-myth/maybe";
import {soilStore} from "./store";
import {MapVariant} from "../../../dashboards/soil/model";


export const loadSoilPhotoMetas = (store: SoilState, client: DBMetaGroup): Promise<null> => {
  return new Promise((resolve, _reject) => {
    const soilPhotoMeta = client.getSoilPhotos()
    // Maps each meta to the Sample ID i.e. ZF01
    store.photos.soilPhotoMetas = soilPhotoMeta.reduce((acc, m) => {
      // @ts-ignore
      acc[m.variation] = m // ref is the Sample ID
      return acc
    }, {})
    resolve(null)
  })
}
export const loadSoilPhotoUrls = (store: SoilState, _client: DBMetaGroup): Promise<null> => {
  return new Promise((resolve, _reject) => {
    const metas = store.photos.soilPhotoMetas
    soilStore.photos.soilPhotoUrls = Object.keys(metas).reduce((acc:any, key) => {
      acc[key] = {
        url: `${PHOTO_URL}/${metas[key].uid}`,
        ref: key,
        uid: metas[key].uid
      }
      return acc
    }, {})
    resolve(null)
  })
}
export const loadSoilMapMetas = (store: SoilState, client: DBMetaGroup): Promise<null> => {
  return new Promise((resolve, _reject) => {
    const soilPhotoMeta = client.getInterpolatedMaps()
    // Maps each meta to the map type i.e. 'dual-em-50'
    store.maps.soilMapMetas = soilPhotoMeta.reduce((acc, m) => {
      // @ts-ignore
      acc[m.variation] = m // variation is a slugified name i.e. dual-em-50
      return acc
    }, {})
    resolve(null)
  })

}
export const loadSoilMapUrls = (store: SoilState, _client: DBMetaGroup): Promise<null> => {
  return new Promise((resolve, _reject) => {
    const metas = store.maps.soilMapMetas
    const urls = Object.keys(metas).reduce((acc:any, key) => {
      const meta = metas[key]
      const gps = meta.getGpsBoundingBox()
      const prj = meta.getPrjBoundingBox()
      // console.log("PRJ", prj, gps, meta.attributes)
      const data = {
        name: meta.format,
        url: (variant:MapVariant) => `${MAP_URL}/${variant.toString()}/${metas[key].uid}`,
        bbox_gps: [gps.min_x, gps.min_y, gps.max_x, gps.max_y],
        bbox_prj: [prj.min_x, prj.min_y, prj.max_x, prj.max_y]
      }
      // console.log(data)
      acc[key] = data
      return acc
    }, {})
    soilStore.maps.soilMapUrls = urls
    resolve(null)
  })
}
// export const loadSoilHorizonData = (store: SoilState, client: DBMetaGroup, season: string): Promise<null> => {
//   return new Promise((resolve, reject) => {
//     const metas = store.data.soilDataMetas
//     loadCleanSoilData(metas)
//       .then((data) => {
//         store.data.soilHorizonData = data
//         resolve(null)
//       })
//       .catch(e => {
//         reject(e)
//       })
//   })
// }

// export const loadSoilFusionData = (store: SoilState, client: DBMetaGroup, season: string): Promise<null> => {
//   return new Promise((resolve, reject) => {
//     const metas = client.getSoilFusionData(filterForSeason(season))
//     if (metas) {
//       loadCsvFileFromServer(metas)
//         .then((csv) => {
//           store.data.soilFusion = {type: CsvType.SoilFusion, csv}
//         })
//         .catch(e => {
//           reject(e)
//         })
//     }
//     reject(`No soil fusion data for ${season}`)
//   })
// }

