import {GoogleDataTable, XYPrediction} from "../model";


const addColumn = (cols: any[][], ar: any[]) => {
  for (let i = 0; i < cols.length; i++) {
    cols[i].push(ar[i])
  }
}

// Na % = 6% , 15% (solid), 30% (dotted)
// pH CaCl2 0-10cm = 4.5, 4.8 (solid), 5.5 (dotted)
// pH cacl2 A,b = 4.5, 4.8
// Col K (All depths) = 50 ppm / mg/kg
// Col P (0-10cm) = 25ppm / mg/kg
const hAxis = {
  // hAxis: {
  //   ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
  // }
  // hAxes: {
  //   viewWindow: {
  //     min:0
  //   },
  //   hAxes: {
  //     1: {baseline: 0},
  //   },
  // },
  // vAxes: {
  //   viewWindow: {
  //     min:0
  //   },
  //   vAxes: {
  //     1: {baseline: 0},
  //   },
  // }
}
class ColumnBuilder {
  cData: GoogleDataTable
  predictions: XYPrediction[]
  xName: string
  yName: string
  rows: number[][]
  series: {}
  nextInSeries: () => number
  hasOutliers: boolean
  constructor(cData:GoogleDataTable, predictions:XYPrediction[], xName: string, yName: string, nextInSeries: () => number) {
    this.cData = cData
    this.predictions = predictions
    this.xName = xName
    this.yName = yName
    this.rows = []
    this.series = {}
    this.nextInSeries = nextInSeries
    this.hasOutliers = predictions.filter(x => x.outlier).length > 0
  }
  setX() {
    // add x column
    this.cData.addColumn("number", this.xName)
    // console.log("PREDICTIONS", this.predictions)
    this.rows.push(...this.predictions.map(x => [x.x]))
    return this
  }
  setY() {
    this.cData.addColumn("number", this.yName)
    addColumn(this.rows, this.predictions.map(x => x.outlier ? null : x.y))
    return this
  }
  setPointLabels(showLabels: boolean) {
    // add point labels
    if (showLabels) {
      this.cData.addColumn({type: 'string', role: 'annotation'})
      addColumn(this.rows, this.predictions.map(x => x.id))
    }
    return this
  }

  setOutliers(showOutliers:boolean) {
    if (showOutliers && this.hasOutliers) {
      // @ts-ignore
      this.cData.addColumn('number', 'Outlier')
      // @ts-ignore
      this.series[this.nextInSeries()] = {
        type: 'scatter',
        color: 'red',
        pointSize: 10,
        lineWidth: 0,
        visibleInLegend: true,
        enableInteractivity: true,
        pointShape: 'square'
      }
      addColumn(this.rows, this.predictions.map(x => x.outlier ? x.y : null))
      // @ts-ignore
      this.cData.addColumn({type: 'string', role: 'annotation', color: 'red'})
      addColumn(this.rows, this.predictions.map(x => x.outlier ? x.id : null))
    }
    return this
  }

  setSodiumThresholds(show: boolean, _horizon:string, low:number, mid:number, high:number) {
    // l1 = 6
    // l2 = 15
    // l3 = 30
    if (!show) return this
    const colors = ['red', 'red', 'red']
    const thresholds = [low, mid, high]
    thresholds.forEach((threshold,i) => {
      this.cData.addColumn('number', `Sodium % @ ${threshold}%`)
      addColumn(this.rows, this.predictions.map(_ => threshold))
      // @ts-ignore
      this.series[this.nextInSeries()] = {
        type: 'line',
        color: colors[i],
        pointSize: 0,
        lineWidth: 2,
        visibleInLegend: false,
        enableInteractivity: false,
        ...hAxis,

      }
    })
    return this
  }

  setPhCaCl2Thresholds(show:boolean, horizon:string, low:number, mid:number, high:number) {
    // l1 = 4.5
    // l2 = 4.8
    // l3 = 5.5
    // _max > l2
    if (!show) return this

    const colors = ['red', 'red', '#ff9f94']
    const thresholds = [low, mid]
    thresholds.forEach((threshold,i) => {
      this.cData.addColumn('number', `pH CaCl2 @ ${threshold}%`)
      addColumn(this.rows, this.predictions.map(_ => threshold))
      // @ts-ignore
      this.series[this.nextInSeries()] = {
        type: 'line',
        color: colors[i],
        pointSize: 0,
        lineWidth: 2,
        visibleInLegend: false,
        enableInteractivity: false,
        ...hAxis,
      }
    })
    // Only include upper threshold for 0-10 horizon
    if (horizon !== '0-10') {
      return this
    }

    const maxV = Math.max(...this.predictions.map(x => x.y))
    if (maxV > high) {
      const thresholds = [high]
      thresholds.forEach((threshold,i) => {
        this.cData.addColumn('number', `pH CaCl2 @ ${threshold}%`)
        addColumn(this.rows, this.predictions.map(_ => threshold))
        // @ts-ignore
        this.series[this.nextInSeries()] = {
          type: 'line',
          color: colors[i],
          pointSize: 0,
          lineWidth: 2,
          visibleInLegend: false,
          enableInteractivity: false,
          ...hAxis,
        }
      })
    }
    return this
  }
  // @ts-ignore
  setPotassiumColwellThresholds(show: boolean, horizon:string, low:number) {
    if (!show) return this

    const colors = ['red']
    const thresholds = [low]
    thresholds.forEach((threshold,i) => {
      this.cData.addColumn('number', `Potassium Colwell @ ${threshold}%`)
      addColumn(this.rows, this.predictions.map(_ => threshold))
      // @ts-ignore
      this.series[this.nextInSeries()] = {
        type: 'line',
        color: colors[i],
        pointSize: 0,
        lineWidth: 2,
        visibleInLegend: false,
        enableInteractivity: false,
        ...hAxis,
      }
    })
    return this
  }

  setPhosphorusColwellThresholds(show:boolean, _horizon:string, low:number) {
    if (!show) return this

    const colors = ['red']
    const thresholds = [low]
    thresholds.forEach((threshold,i) => {
      this.cData.addColumn('number', `Phosphorus Colwell @ ${threshold}%`)
      addColumn(this.rows, this.predictions.map(_ => threshold))
      // @ts-ignore
      this.series[this.nextInSeries()] = {
        type: 'line',
        color: colors[i],
        pointSize: 0,
        lineWidth: 2,
        visibleInLegend: false,
        enableInteractivity: false,
        ...hAxis,
      }
    })
    return this
  }
  build() {
    // console.log("ROWS", this.rows, this.series)
    this.cData.addRows(this.rows)
  }
}

export default ColumnBuilder



