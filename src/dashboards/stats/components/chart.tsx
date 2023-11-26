import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import ColumnBuilder from "./columns";
import {ReportItem} from "../model";
import useGoogleCharts from "../../../hooks/google-charts";
import  "../../../lib/extensions"

type rowDispatcher = (row: number) => void


// Dispatch selected row on user selection and update selected row on outside change (e.g. table row click)
const useRowSyncHook = (
  {google, chart, selectedRow, setSelectedRow}:
    { google: any, chart: any, selectedRow: number, setSelectedRow: rowDispatcher }) => {

  useEffect(() => {
    if (!google || !chart) {
      return
    }

    google.visualization.events.addListener(chart, 'select', function () {
      const selection = chart.getSelection()
      if (selection.length > 0) {
        setSelectedRow(selection[0].row)
      }

    });
    return () => {
      google.visualization.events.removeAllListeners(chart)
    }
  }, [google, chart])

  useEffect(() => {
    if (chart && selectedRow > -1) {
      chart.setSelection([{row: selectedRow}])
    }
  }, [google, selectedRow, chart])

}

interface GoogleChartProps {
  id: string
  className: string
  reportItem: ReportItem
  xName: string
  yName: string
  horizon: string
  regressionType: string
  degree: number
  showLabels: boolean
  showOutliers: boolean
  showThresholds: boolean
  selectedRow: number
  setSelectedRow: rowDispatcher
  height: number
  onMount: (chartRef: React.MutableRefObject<HTMLDivElement>) => void
  onChartReady?: (chart: any) => void
}

export const useGoogleChart = ({reportItem, xName,yName, horizon, regressionType, degree, showLabels, showOutliers, showThresholds, selectedRow, setSelectedRow, height,onChartReady}: GoogleChartProps) => {
  const google = useGoogleCharts()
  const [chart, setChart] = useState<any>(null)
  const chartRef = useRef()


  const nextInSeries = () => {
    let count = 1
    return () => {
      return count++
    }
  }
  useRowSyncHook({google, chart, selectedRow, setSelectedRow})

  const chartReset = ({google, chartRef}: {google: any, chartRef: any}) => {
    const newChart = new google.visualization.ComboChart(chartRef.current)
    const cData = new google.visualization.DataTable(null)
    cData.addColumn('number', 'X')
    cData.addColumn('number', 'Y')
    const options = {
      legend: 'none',
      width: '100%',
      height: height,
      title: `No Data`,
      chartArea: {left: '10%', bottom: '10%', right: '20%', top: '10%'},
    }
    newChart.draw(cData, options)
    setChart(newChart)
  }

  // useEffect(() => {
  //   if (chartRef.current && onMount) {
  //     console.log("A MOUNT HORSEY", chartRef.current)
  //     onMount(chartRef)
  //   }
  // }, [chartRef,onMount])


  useEffect(() => {

    if (google && chartRef.current && !reportItem) {
      chartReset({google, chartRef})
      return
    }

    // console.log(google, chartRef.current, regressionResult, predictions, predictions.length)
    if (!google || !chartRef.current || !reportItem || !reportItem?.regressionResult?.predictions) return

    const predictions = Object.values(reportItem.regressionResult.predictions)
    // @ts-ignore
    const cData = new google.visualization.DataTable(null)
    const builder = new ColumnBuilder(cData, predictions, xName, yName, nextInSeries())
    const showSodium = showThresholds && yName.includes('Na %')
    const showPh = showThresholds && yName.includes('pH CaCl')
    const showColK = showThresholds && yName.includes('K Colwell')
    const showColP = showThresholds && yName.includes('P Colwell')

    builder
      .setX()
      .setY()
      .setPointLabels(showLabels)
      .setOutliers(showOutliers)
      .setSodiumThresholds(showSodium, horizon,6, 15, 30)
      .setPhCaCl2Thresholds(showPh, horizon,4.5, 4.8, 5.5)
      .setPotassiumColwellThresholds(showColK,horizon, 50)
      .setPhosphorusColwellThresholds(showColP,horizon, 25)
      .build()

    // viewWindow: {min: 0} or baseline: 0
    const maxX = predictions.reduce((acc, x) => Math.max(acc,x.x), -Infinity) //Math.max(...predictions.map(x => x.x))
    // const minX = predictions.reduce((acc, x) => Math.min(acc,x.x), Infinity)//Math.min(...predictions.map(x => x.x))

    // const minY = predictions.reduce((acc, x) => Math.min(acc,x.y), Infinity)//Math.min(...predictions.map(x => x.y))
    const maxY = showOutliers?
      predictions.reduce((acc, x) => Math.max(acc,x.y), -Infinity):
      predictions.filter(x => !x.outlier).reduce((acc, x) => Math.max(acc,x.y), -Infinity)

    // Aidan request for ph to start from 3.5
    let yMin = 0

    if (yName.toLowerCase().includes('ph')) {
      yMin = 3.5
    }
    // let xMin = 0

    let yMax = maxY
    const yMaxBuffer = yMax * 0.05
    const xMax = Math.ceil(maxX)
    const xMaxBuffer = xMax * 0.05


    const options = {
      title: `(${horizon}) ${xName} vs ${yName}`,
      crosshair: {trigger: "both", orientation: "vertical"},
      hAxis: {
        title: xName,
        viewWindow: {min: 0, max: Math.ceil(maxX + xMaxBuffer)},
        // count: Math.floor((maxX - minX) / 0.5),
        // minorGridlines: {count: 0 }, // hide minor gridlines
        // gridlines: {
        //   interval: 0,
        //   count: -1,
        // }
      },
      vAxis: {
        title: yName,
        viewWindow: {min: yMin, max: Math.ceil(maxY + yMaxBuffer)},
        // minorGridlines: {count: 0 }, // hide minor gridlines
        // gridlines: {
        //   count: -1,
        //   interval: 0
        // }
      },

      seriesType: 'scatter',
      // width: '80%',
      // legend: {
      //   alignment: 'start',
      //   position: 'right', // place the legend on the right
      //   textStyle: {
      //     color: 'black',
      //     fontSize: 12
      //   }
      // },
      height: 800,
      chartArea: {
        width: '65%'
        // left: '10%',
        // top: '10%',
        // right: '20%', // Adjust this value to exclude the vertical gray line
        // bottom: '10%'
      },
      series: {...builder.series},

      trendlines: {
        0: {
          color: 'green',
          lineWidth: 3,
          type: regressionType.toLowerCase(),
          degree: degree,
          visibleInLegend: true,
          // @ts-ignore
          labelInLegend: regressionType.capitalize(),
          showR2: true,
          pointSize: 2,
          pointsVisible: false,
        },
      },
    }


    // @ts-ignore
    const newChart = new google.visualization.ComboChart(chartRef.current)
    // @ts-ignore
    google.visualization.events.addListener(newChart, 'ready', function () {
      if (onChartReady) {
        onChartReady(newChart)
      }
    })
    newChart.draw(builder.cData, options)
    setChart(newChart)

  }, [chartRef, google, reportItem, showThresholds, showOutliers, showLabels])

  return chartRef
}

export const GoogleChart = ({id, className, reportItem, xName, yName, horizon, regressionType, degree, showLabels, showOutliers, showThresholds, selectedRow, setSelectedRow, height, onMount, onChartReady}: GoogleChartProps) => {

    const [refIsSet, setRefIsSet] = useState(false)
    const chartRef = useGoogleChart({id,className, reportItem, xName,yName,horizon, regressionType, degree, showLabels, showOutliers, showThresholds, selectedRow, setSelectedRow, height,onMount,onChartReady})

    if (!refIsSet && chartRef?.current) {
      if (onMount) {
        onMount(chartRef as MutableRefObject<any>)
      }

      setRefIsSet(true)
    }

    return (
      <div id={id} ref={chartRef as MutableRefObject<any>} className={className}/>
    )



}