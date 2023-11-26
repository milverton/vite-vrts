import {emptyCsv, ICsv} from "../../lib/csv";
import {SoilHorizonsMenu} from "../soil/model";

export const statsXHeaders = [
  "EM 50",
  "EM 150",
  "GR Potassium",
  "GR Uranium",
  "GR Thorium",
  "GR Total Count"
]

export const statsYExcludedHeaders = [
  "Sample ID",
  "Longitude",
  "Latitude",
  "X[m]",
  "Y[m]",
  "Code",
  "Depth",
  "Depth Min[cm]",
  "Depth Max[cm]",
  "Season",
  "EM Index",
  "EM Distance[m]",
  "EM Longitude",
  "EM Latitude",
  "EM Elevation[m]",
  "EM 150",
  "EM 50",
  "GR Index",
  "GR Distance[m]",
  "GR Longitude",
  "GR Latitude",
  "GR Total Count",
  "GR Potassium",
  "GR Uranium",
  "GR Thorium"
]
export const statsYShortHeaders = [
  "Soil K Colwell[ppm]",
  "Soil P Colwell[ppm]",
  "Soil Na %[%]",
  "Soil pH CaCl"
]

export const StatsRegressionTypesMenu = [
  {menuName: "Linear", menuType: 0},
  {menuName: "Polynomial", menuType: 1},
  {menuName: "Exponential", menuType: 2},
]
export interface XYPrediction {
  id:string
  uid: string,
  x: number
  y: number
  residual: number
  prediction: number
  zScore: number
  outlier: boolean
  horizon: string
}
export interface RegressionResult {
  r2: number
  cov: number
  predictions: {[key: string]: XYPrediction}
  horizon: string
}
export interface RegressionResultEntry {
  id: string
  xName: string
  yName: string
  results: {
    linear: RegressionResult
    polynomial: RegressionResult
    exponential: RegressionResult
  }
}
export interface RegressionResults {
  [key: string]: RegressionResultEntry
}
export interface XYEntry {
  id: string
  x: number
  y: number
}
export interface XYData {
  id: string
  xName: string
  yName: string
  horizon: string
  xy: {[key:string]: XYEntry}
  uid: string
}

// export interface XYDataWithRegression extends XYData {
//   linear: RegressionResult
//   polynomial: RegressionResult
//   exponential: RegressionResult
// }
export interface GoogleDataTable {
  addColumn: (...arg0: any[]) => void
  addRows: (...arg0: any[]) => void
}


export interface RegressionRanking {
  r2: number
  cov: number
  type: string
  regressionResultKey: string
}
export interface StatsUIForXYState {
  longList: boolean
  selectedHorizon: number
  selectedHorizonName: string
  selectedXVar: number
  selectedYVar: number
}
export const resetStatsUIForXY = (): StatsUIForXYState => {
  return {
    longList: false,
    selectedHorizon: SoilHorizonsMenu[0].menuType,
    selectedHorizonName: SoilHorizonsMenu[0].menuName,
    selectedXVar: 0,
    selectedYVar: 0,
  }
}
export interface StatsUIForRegressionsState {
  selectedRegression: number
  selectedRegressionName: string
  degree: number
  r2Threshold: number
  outlierThreshold: number
  showOutliers: boolean
  showThresholds: boolean
  showLabels: boolean
  showSoilPhotos: boolean
}

export const resetStatsUIForRegression = (): StatsUIForRegressionsState => {
  return {
    selectedRegression: 0,
    selectedRegressionName: StatsRegressionTypesMenu[0].menuName,
    degree: 2,
    r2Threshold: 0,
    outlierThreshold: 6,
    showOutliers: true,
    showThresholds: true,
    showLabels: true,
    showSoilPhotos: false,
  }
}
export interface StatsXYDataState {
  xData: ICsv
  xName: string
  xDataExtra: ICsv
  yData: ICsv
  yName: string
  yDataExtra: ICsv
  sampleIds: string[]
  xyResults: {[key: string]: XYData}
}
export const resetStatsXYData = (): StatsXYDataState => {
  return {
    xName: "",
    xData: emptyCsv(),
    xDataExtra: emptyCsv(),
    yName: "",
    yData: emptyCsv(),
    yDataExtra: emptyCsv(),
    sampleIds: [],
    xyResults: {},
  }
}
export interface StatsOutliersState {
  outliers: {[key: string]: Set<number>}
}
export const resetStatsOutliers = (): StatsOutliersState => {
  return {
    outliers: {},
  }
}
export interface StatsRegressionDataState {

  results: RegressionResults
  ranking: RegressionRanking[]
  selectedResult: RegressionResultEntry | null
  predictions: XYPrediction[]

}
export const resetStatsRegressionData = (): StatsRegressionDataState => {
  return {
    results: {},
    ranking: [],
    selectedResult: null,
    predictions: [],
  }
}

export interface ReportItem {
  title:string
  x:string
  y:string
  horizonIndex: number
  active: boolean
  regression: string
  regressionResult: RegressionResult | null
  // outliers: number[]
  pagesBefore: string[]
  sortKey: string
  note:string
  showOutliers: boolean
}

export interface SlideRelationShip {
  x: string
  y: string
  title: string
  sortKey: string
}

export interface SlideReportItems {
  relationship: SlideRelationShip
  reports: ReportItem[]
}
export interface StatsReportState {
  isLongList: boolean
  reportItemsWithData: {0: boolean, 1: boolean, 2: boolean}
  reportItems: {
    0: ReportItem[],
    1: ReportItem[],
    2: ReportItem[],
  }
  slideReportItems: SlideReportItems[]
}

const horizonZeroReportItem: ReportItem[] = [
  {x: "EM 150", y: "Soil K Colwell[ppm]", active: true, horizonIndex: 0, regression: "", regressionResult: null, showOutliers: true, title: "Potash", pagesBefore:[], sortKey: "C-0", note: ''},
  {x: "EM 50", y: "Soil pH CaCl", active: true, horizonIndex: 0, regression: "", regressionResult: null, showOutliers: true, title: "Lime", pagesBefore:[], sortKey: "C-1", note: ''},
  {x: "EM 50", y: "Soil Na %[%]", active: true, horizonIndex: 0, regression: "", regressionResult: null, showOutliers: true, title: "Gypsum", pagesBefore: ["esp"], sortKey: "C-2", note: ''},
  {x: "GR Uranium", y: "Soil P Colwell[ppm]", active: true, horizonIndex: 0, regression: "", regressionResult: null, showOutliers: true, title: "Phosphorus", pagesBefore:[], sortKey: "C-3", note: ''},
]
const horizonAReportItem: ReportItem[] = [
  {x: "EM 150", y: "Soil K Colwell[ppm]", active: true, horizonIndex: 1, regression: "", regressionResult: null, showOutliers: true, title: "Potash", pagesBefore:[], sortKey: "C-0", note: ''},
  {x: "EM 50", y: "Soil pH CaCl", active: true, horizonIndex: 1, regression: "", regressionResult: null, showOutliers: true, title: "Lime", pagesBefore:[], sortKey: "C-1", note: ''},
  {x: "EM 50", y: "Soil Na %[%]", active: true, horizonIndex: 1, regression: "", regressionResult: null, showOutliers: true, title: "Gypsum", pagesBefore: [], sortKey: "C-2", note: ''},
  {x: "GR Uranium", y: "Soil P Colwell[ppm]", active: false, horizonIndex: 1, regression: "", regressionResult: null, showOutliers: true, title: "Phosphorus", pagesBefore:[], sortKey: "C-3", note: ''},
]

const horizonBReportItem: ReportItem[] = [
  {x: "EM 150", y: "Soil K Colwell[ppm]", active: true, horizonIndex: 2, regression: "", regressionResult: null, showOutliers: true, title: "Potash", pagesBefore:[], sortKey: "C-0", note: ''},
  {x: "EM 50", y: "Soil pH CaCl", active: true, horizonIndex: 2, regression: "", regressionResult: null, showOutliers: true, title: "Lime", pagesBefore:[], sortKey: "C-1", note: ''},
  {x: "EM 50", y: "Soil Na %[%]", active: true, horizonIndex: 2, regression: "", regressionResult: null, showOutliers: true, title: "Gypsum", pagesBefore: [], sortKey: "C-2", note: ''},
  {x: "GR Uranium", y: "Soil P Colwell[ppm]", active: false, horizonIndex: 2, regression: "", regressionResult: null, showOutliers: true, title: "Phosphorus", pagesBefore:[], sortKey: "C-3", note: ''},
]
export const createReportItem = (horizonIndex:number) => {
  return {x: "EM 50", y: "Soil K Colwell[ppm]", active: true, horizonIndex: horizonIndex, regression: null, regressionResult: null, showOutliers: true, title: "New Item", pagesBefore:[], sortKey: "C-0", note: ''}
}
export const resetStatsReport = (): StatsReportState => {
  return {
    isLongList: false,
    reportItemsWithData: {0: false, 1: false, 2: false},
    reportItems: {
      0: horizonZeroReportItem,
      1: horizonAReportItem,
      2: horizonBReportItem,
    },
    slideReportItems: [],
  }
}

export interface StatsState {
  uiXYState: StatsUIForXYState
  uiRegressionState: StatsUIForRegressionsState
  xyState: StatsXYDataState
  regressionState: StatsRegressionDataState
  outliersState: StatsOutliersState
  reportState: StatsReportState
}
export const resetStats = (): StatsState => {
  return {
    uiXYState: resetStatsUIForXY(),
    uiRegressionState: resetStatsUIForRegression(),
    xyState: resetStatsXYData(),
    regressionState: resetStatsRegressionData(),
    outliersState: resetStatsOutliers(),
    reportState: resetStatsReport(),
  }
}