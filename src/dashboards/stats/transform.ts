import {csvColumnData, csvHasData, csvToObject, ICsv} from "../../lib/csv"
// @ts-ignore
import regression from "regression"
import * as R from "ramda";
import {zip} from "ramda";
import {
  RegressionRanking,
  RegressionResult,
  RegressionResultEntry,
  RegressionResults,
  ReportItem,
  XYData,
  XYPrediction
} from "./model";
import {coefficient_of_variation, round, sum, z_score} from "../../lib/stats";
import {err, ok, Result} from "true-myth/result";
import {SoilHorizonsMenu} from "../soil/model";
import {slugify} from "../../lib/common";

/**
 * Map each string id to its index
 * @param  {string[]} s - string array
 * @returns {[p: string]: number}
 */
const toMap = (s: string[]) => s.reduce((acc:any, id, i): { [key: string]: number } => {
  acc[id] = i;
  return acc
}, {})

/**
 * Prune the csv to only include the rows with the given ids
 * @param sampleIds
 * @param csv
 * @returns {ICsv}
 */
export const statsPruneCsv = ({sampleIds, csv}: { sampleIds: string[], csv: ICsv }): ICsv => {
  if (!csvHasData(csv)) {
    return csv
  }

  const xSampleIds = getSampleIds(csv)
  // map each id to its index
  const xMap = toMap(xSampleIds)
  const newBody: any = []
  // if (sampleIds.length !== csv.body.length) {
  //   return csv
  // }

  sampleIds.forEach((id) => {
    const index = xMap[id]
    if (index !== undefined) {
      newBody.push(csv.body[index])
    }
  })
  return ({head: [...csv.head], body: newBody})
}

/**
 * Create a string key for the XY pair
 * @param xName
 * @param yName
 * @returns {string}
 */
export const statsCreatePrimaryKey = (xName: string, yName: string): string => {
  return slugify(`${xName}-${yName}`)
}

/**
 * Build the XY data by mapping each column of xData to the corresponding column of yData
 * @param ids - sample ids
 * @param horizon - soil horizon
 * @param xData - x data as an ICsv
 * @param yData - y data as an ICsv
 * @returns {{[key: string]: XYData}} - map of XYData
 * @example "em-50-soil-k-colwell-ppm" : {
 *     "id": "em-50-soil-k-colwell-ppm",
 *     "xName": "EM 50",
 *     "yName": "Soil K Colwell[ppm]",
 *     "horizon": "0-10",
 *     "xy": {
 *         "ZN01": {
 *             "id": "ZN01",
 *             "x": 1.4,
 *             "y": 206
 *         },
 *     }
 * }
 */
export const statsBuildXY = (ids: string[], horizon: string, xData: ICsv, yData: ICsv): Result<{ [key: string]: XYData }, string> => {
  const xy: any = {}
  const duplicates = []
  if (!ids.length) {
    return err('No ids')
  }

  for (let i = 0; i < xData.head.length; i++) {
    for (let j = 0; j < yData.head.length; j++) {
      const xCol = csvColumnData(xData, i)
      const yCol = csvColumnData(yData, j)
      const xyData = zip(xCol.map(x => parseFloat(x)), yCol.map(y => parseFloat(y)))
      const entries = xyData.reduce((acc: any, xy, i) => {
        const id = ids[i]
        if (!id) {
          return acc
        }
        acc[id] = {id: ids[i], x: xy[0], y: xy[1]}
        return acc
      }, {})
      const id = statsCreatePrimaryKey(xData.head[i], yData.head[j])
      if (xy[id] !== undefined) {
        duplicates.push(id)
      }

      xy[id] = {id, xName: xData.head[i], yName: yData.head[j], horizon, xy: entries} as XYData
    }
  }
  if (duplicates.length > 0) {
    return err(`Duplicate primary keys: ${duplicates.join(", ")}`)
  }
  if (Object.keys(xy).length === 0) {
    return err(`No data found`)
  }

  return ok(xy)
}

interface Prediction {
  prediction: number[][]
  r2: number
}

const linearFn = (): (data: number[][]) => Prediction => {
  return (data: number[][]) => {
    const result = regression.linear(data, {precision: 20})
    return {prediction: result.points, r2: result.r2}
  }
}

const polyFn = (degree: number): (data: number[][]) => Prediction => {
  return (data: number[][]) => {
    const result = regression.polynomial(data, {precision: 20, order: degree})
    return {prediction: result.points, r2: result.r2}
  }
}

const expFn = (degree: number): (data: number[][]) => Prediction => {
  return (data: number[][]) => {
    const result = regression.exponential(data, {precision: 20, order: degree})
    return {prediction: result.points, r2: result.r2}
  }
}
export const fixNumber = (x: number): number => isNaN(x) || !isFinite(x) ? 0 : x
const getRegression = (uid: string, regressionFn: (data: number[][]) => Prediction, data: XYData, _threshold: number, manualOutliers: number[]): Result<RegressionResult, string> => {
  let xyEntries = Object.values(data.xy)
  let justXYValues = xyEntries.map(xy => [xy.x, xy.y])
  const manualOutliersIds = Array
    .from(manualOutliers)
    .map(i => xyEntries[i]?.id || "")
    .filter(id => id !== "")

  const output = xyEntries.reduce((acc: any, xy) => {
    const isOutlier = manualOutliersIds.includes(xy.id)
    acc[xy.id] = {
      id: xy.id,
      uid,
      x: xy.x,
      y: xy.y,
      prediction: 0,
      residual: 0,
      zScore: 0,
      outlier: isOutlier,
      horizon: data.horizon
    } as XYPrediction
    return acc
  }, {})

  // let count = 0
  //
  // while (count <= xyEntries.length) {
  try {
    // get the regression
    let regressionResult = regressionFn(justXYValues)
    // calculate the residuals
    const residuals = regressionResult.prediction.map((p, i) => justXYValues[i][1] - p[1])
    const cov = coefficient_of_variation(residuals.map(r => Math.abs(r)))
    // calculate the z-scores using the absolute value of the residuals
    const z = z_score(residuals).map(x => round(Math.abs(x), 3))
    // find the outliers
    // const outlierIndices = z.map((z, i) => z > threshold ? i : -1).filter(x => x !== -1)


    // map these results onto the output using the id (Sample ID)
    for (let i = 0; i < xyEntries.length; i++) {
      const outputEntry = output[xyEntries[i].id]
      outputEntry.prediction = regressionResult.prediction[i][1]

      outputEntry.residual = residuals[i]
      outputEntry.zScore = z[i]

      // const isManualOutlier = manualOutliersIds.includes(xyEntries[i].id)
      // if (isManualOutlier) {
      //   outlierIndices.push(i)
      // }
      //
      // outputEntry.outlier = outlierIndices.includes(i) || isManualOutlier
      // if (isManualOutlier) {
      //   console.log("MANUAL OUTLIER", xyEntries[i].id, outputEntry.outlier)
      // }
    }
    // if (manualOutliers.length > 0) {
    //   console.log("MANUAL OUTLIERS", uid, output)
    // }
    return ok({r2: fixNumber(regressionResult.r2), cov: fixNumber(cov), predictions: output, horizon: data.horizon})
    // if there are no outliers, we're done
    // if (outlierIndices.length === 0) {
    //   console.log("OUTPOUT", output)
    //   return ok({r2: fixNumber(regressionResult.r2), cov:fixNumber(cov),predictions: output, horizon: data.horizon})
    // }

    // update the data without the outliers
    // justXYValues = justXYValues.filter((_, i) => !outlierIndices.includes(i))
    // xyEntries = xyEntries.filter((_, i) => !outlierIndices.includes(i))
  } catch (e:any) {
    return err(e.toString())
  }

}

/**
 * function to create a unique key for the regression outliers
 * @param horizonName
 * @param regressionName
 * @param xName
 * @param yName
 */
export const createStatsOutlierKey = (horizonName: string, regressionName: string, xName: string, yName: string): string => {
  return slugify(`${horizonName}-${regressionName}-${xName}-${yName}`)
}
/**
 * get regressions for each xy pair
 * @param xyData - the data to build the regression
 * @param degree - the degree of the polynomial
 * @param outlierThreshold - the threshold for the z-score
 * @param _selectedRegression - the selected regression (linear, polynomial, exponential)
 * @param outliers - the outliers
 * @returns {Result<RegressionResults, string>}
 * @example "em-50-soil-k-colwell-ppm": {
 *     "id": "em-50-soil-k-colwell-ppm",
 *     "xName": "EM 50",
 *     "yName": "Soil K Colwell[ppm]",
 *     "results": {
 *         "linear": {
 *             "r2": 0.00018040685666076417,
 *             "cov": 80.67949144966174,
 *             "predictions": {
 *                 "ZN01": {
 *                     "id": "ZN01",
 *                     "uid": "0-10-linear-em-50-soil-k-colwell-ppm",
 *                     "x": 1.4,
 *                     "y": 206,
 *                     "prediction": 261.06867619301636,
 *                     "residual": -55.06867619301636,
 *                     "zScore": 0.408,
 *                     "outlier": false,
 *                     "horizon": "0-10"
 *                 },
 *             },
 *             "horizon": "0-10"
 *         }
 *     }
 * }
 */
export const statsBuildRegression = (xyData: { [key: string]: XYData }, degree: number, outlierThreshold: number, _selectedRegression: string, outliers: { [k: string]: Set<number> }): Result<RegressionResults, string> => {
  const xyKeys:any = Object.keys(xyData)
  const errors:any = []
  const regressions:any = {}
  for (let i = 0; i < xyKeys.length; i++) {
    const key = xyKeys[i]
    const xy = xyData[xyKeys[i]]

    // get any outliers for this regression, horizon and xy pair
    const linearKey = createStatsOutlierKey(xy.horizon, 'linear', xy.xName, xy.yName)
    const polyKey = createStatsOutlierKey(xy.horizon, 'polynomial', xy.xName, xy.yName)
    const expKey = createStatsOutlierKey(xy.horizon, 'exponential', xy.xName, xy.yName)

    const linearOutliers = outliers[linearKey] || new Set<number>()
    const polyOutliers = outliers[polyKey] || new Set<number>()
    const expOutliers = outliers[expKey] || new Set<number>()


    const linear = getRegression(linearKey, linearFn(), xy, outlierThreshold, Array.from(linearOutliers))
    const poly = getRegression(polyKey, polyFn(degree), xy, outlierThreshold, Array.from(polyOutliers))
    const exp = getRegression(expKey, expFn(degree), xy, outlierThreshold, Array.from(expOutliers))
    const result:any = {}


    if (linear.isOk) {
      result["linear"] = linear.value
    }
    if (poly.isOk) {
      result["polynomial"] = poly.value
    }
    if (exp.isOk) {
      result["exponential"] = exp.value
    }
    // store the results
    regressions[key] = {
      id: key,
      xName: xy.xName,
      yName: xy.yName,
      results: result
    }

    if (linear.isErr) {
      errors.push('linear: ' + linear.error)
    }
    if (poly.isErr) {
      errors.push('polynomial: ' + poly.error)
    }
    if (exp.isErr) {
      errors.push('exponential: ' + exp.error)
    }
  }
  if (errors.length > 0) {
    return err(R.uniq(errors).join(", "))
  }
  // console.log("REGRESSIONS", regressions)
  return ok(regressions)
}

/**
 *  This function takes an array of numbers, calculates the average of the values, normalises the values so that their sum is 1, and returns the normalised values as a new array
 * @param data - the data to normalise
 * @returns {number[]}
 * @see https://stats.stackexchange.com/questions/10289/whats-the-difference-between-normalization-and-standardization
 */
const normalise = (data: number[]): number[] => {
  const averaged = data.map(x => x / data.length)
  const factor = 1 / sum(averaged)
  return averaged.map(x => x * factor)
}
const isValidNumber = (x: number): boolean => !isNaN(x) && isFinite(x)
const notZero = R.all((y) => y !== 0)

/**
 * get the ranking for the regression results
 * @param result
 * @param key
 */
export const getRegressionResultRanking = (result: RegressionResultEntry, key: string): Result<[number, number, string], string> => {
  if (result === undefined || result.results === undefined) {
    return err(`Invalid regression result for ${key}`)
  }
  const order = ["linear", "polynomial", "exponential"]
  // Store r2 and cov
  const r2 = [result.results.linear.r2, result.results.polynomial.r2, result.results.exponential.r2].map(x => !isValidNumber(x) ? 0 : x)
  const cov = [result.results.linear.cov, result.results.polynomial.cov, result.results.exponential.cov].map(x => !isValidNumber(x) ? 0 : x)

  // Normalise r2 and cov so that they can be compared in relative terms rather than absolute terms. The sum of the normalised values should be 1.
  const normalisedR2 = normalise(r2)
  const normalisedCov = normalise(cov)

  // Check that the normalisation is valid
  if (sum(normalisedR2) < 0.99 || sum(normalisedCov) < 0.99) {
    return err(`Invalid normalisation for ${key}. R2: ${normalisedR2} sum: ${sum(normalisedR2)}, Cov: ${normalisedCov} sum: ${sum(normalisedCov)}`)
  }

  // Calculate the rank. Cov is inverted because we want the highest value of both r2 and cov.
  // Why a high value of cov? It indicates a higher variability in the data and coupled with a high r2 value could indicate better quality data and a more reliable regression.
  const pairs = zip(normalisedR2, normalisedCov)
    .filter(notZero)
    .sort((a, b) => b[0] - a[0] + a[1] - b[1])

  // Pick the best
  const top = pairs[0]
  // Find the index of the best
  const index = normalisedR2.indexOf(top[0])

  // Store the result
  const topR2 = r2[index]
  const topCov = cov[index]
  const rType = order[index]
  return ok([topR2, topCov, rType])
}

/**
 * Sort the regression results by R2 and the COV and return the results
 * @param regressionResults
 */
export const statsSortRegressionResults = (regressionResults: RegressionResults): Result<RegressionRanking[], string> => {

  const keys = Object.keys(regressionResults)
  const toRank = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const result = regressionResults[key]
    const rank = getRegressionResultRanking(result, key)
    if (!rank.isOk) {
      return err(rank.error)
    }
    const [topR2, topCov, rType] = rank.value
    toRank.push([topR2, topCov, rType, key])
  }
  // Sort by R2 and return
  // @ts-ignore
  toRank.sort((a, b) => b[0] - a[0])

  // @ts-ignore
  return ok(toRank.map(r => ({r2: r[0], cov: r[1], type: r[2], regressionResultKey: r[3]})))
}
/**
 * Get the sample IDs from the CSV
 * @param csv - The ICsv object
 * @returns {string[]} - The sample IDs
 *
 * Pulls out the Sample ID column and returns the values as an array of strings.
 * Sample IDs usually take the form EM01 (for 0-10) EM01 - A (for A horizon) and EM01 - B (for B horizon)
 * This function just returns the EM01 part.
 * Note: If the Sample ID column names changes, this will break. If the way Sample IDs are formatted changes, this will break.
 */
export const getSampleIds = (csv: ICsv): string[] => {
  const obj = csvToObject(csv)['Sample ID']
  if (obj === undefined) {
    return []
  }
  // FIXME: Sample ID hack. Just need Sample ID in the form EM01 and not EM01 - A or EM01 - B etc.
  return obj.map((x:string) => x.split(' ')[0])
}

/**
 * Takes two arrays of sample IDs and returns the intersection of the two (sorted).
 * @param xSampleIds
 * @param ySampleIds
 * @returns {string[]}
 */
export const unifySampleIds = (xSampleIds: string[], ySampleIds: string[]): string[] => {

  if (!xSampleIds.length || !ySampleIds.length) {
    return []
  }
  // Use only Sample IDs that are in both X and Y
  const s1 = new Set<string>(xSampleIds)
  const s2 = new Set<string>(ySampleIds)
  const intersection = Array.from(new Set<string>([...s1].filter(x => s2.has(x)))).sort()
  return intersection
}

// export const loadJSON = (meta:DBMeta) => {
//   return new Promise((resolve, reject) => {
//     if (meta === undefined) {
//       reject('No meta')
//       return
//     }
//     const stopAction = startAction(`GET text file uid: ${meta.uid}`)
//     ajax.getJSON('http://127.0.0.1:3000/api/v1/text-file/' + meta.uid)
//       .pipe(
//         mergeMap(async (x: any) => {
//           if (x.error) {
//             logFailure('Error loading document', x.error)
//             // FIXME: report error
//           } else {
//             const b = Buffer.from(x.file, 'base64')
//             const a = Uint8Array.from(b)
//             const z = new jsZip.Uint8ArrayReader(a)
//             const r = new jsZip.ZipReader(z)
//             const d = await r.getEntries()
//             return d.first().getData(new TextWriter())
//           }
//         }),
//       )
//       .subscribe({
//         next: (x: string) => {
//           const data = JSON.parse(x)
//           stopAction()
//           resolve(data)
//         },
//         error: (err) => {
//           stopAction()
//           reject(err)
//         }
//       })
//   })
// }

export const regressionResultEntryToReportItem = (entry: RegressionResultEntry | null, horizonIndex: number, selectedRegression: string): ReportItem => {

  if (entry === null || entry === undefined || entry.xName === undefined || entry.yName === undefined) {
    // @ts-ignore regressionResult
    return {title: '', x: '', y: '', horizonIndex, active: false, regression: '', regressionResult: {}, pagesBefore: [], sortKey: '', note: ''}
  }
  const title = `${entry.xName} vs ${entry.yName} (${SoilHorizonsMenu[horizonIndex].menuName.toLowerCase()})`
  const x = entry.xName
  const y = entry.yName
  const active = true
  const regression = selectedRegression
  // @ts-ignore
  const regressionResult = entry.results[selectedRegression.toLowerCase()] as RegressionResult
  // const outliers = Object.values(regressionResult).map((x,i) => x.outlier ? i : -1).filter(x => x !== -1)
  const pagesBefore:any = []
  const sortKey = `A0`
  const note = ''
  return {title, x, y, horizonIndex, active, regression, regressionResult, pagesBefore, sortKey, note, showOutliers: false}
}