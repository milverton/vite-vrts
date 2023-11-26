import {scaleBoundingBox, scalePointWithBoundingBox} from "../../lib/map";
import {mean} from "../../lib/stats";
import {
  canvasDrawLabels,
  canvasDrawRectangle,
  canvasDrawRoundPoint,
  drawBoundary,
  drawRotatingTriangle,
  resetCanvas
} from "../../lib/canvas";
import {Bin, DrawFunction2D, DrawFunction2DArgs, MapLayerIDs, SiteSelection, SortedValue} from "./model";
import {NewBoundary} from "../../lib/stores/boundary/model";

import React from "react";
import {csvColumnData} from "../../lib/csv";

// @ts-ignore
import {Result} from "true-myth/result";
import {BoundingBox} from "../../core/bounding-box";
import {Vector, vectorAngleIn360Degrees} from "../../core/vector";

import {extractCoordinatesForCsvType} from "../stats/view";
// import {interpolatePoint} from "../tools/three-js/model";

export const updateBoundingBoxWithPoints = (lngIdx: number, latIdx: number, bbox: BoundingBox, data: any[][]): BoundingBox => {
  const copy = bbox.copy()
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const lng = parseFloat(row[lngIdx])
    const lat = parseFloat(row[latIdx])
    if (lng && lat) {
      copy.update(lng, lat)
    }
  }
  return copy
}

export const updateBoundingBoxWithBoundaries = (bbox: BoundingBox, boundaries: NewBoundary[]): BoundingBox => {
  const copy = bbox.copy()
  copy.updateWithBoundaries(boundaries)
  return copy
}

export const calculateScaleForCanvas = (bbox: BoundingBox, targetWidth: number = 600): number => {
  if (bbox.width === 0) {
    return 1 / targetWidth
  }
  return 1 / ((mean([bbox.width, bbox.height])) / targetWidth)
}

export const calculateScaleForLine = (canvasScale: number, targetWidth: number = 1.25): number => {
  return targetWidth / canvasScale
}

export const calculateScaleForPoints = (canvasScale: number, targetSize: number, _zoom: number, numberOfPoints: number): number => {
  // console.log("calculateScaleForPoints", numberOfPoints, numberOfPoints.toString().length, (1/numberOfPoints.toString().length), (1/numberOfPoints.toString().length) * targetSize)
  // console.log('calculateScaleForPoints', canvasScale, targetSize, zoom, numberOfPoints)
  return ((1 / numberOfPoints.toString().length) * targetSize) / canvasScale
  // 0.28035614118428903 1 75222
  // 0.06672055231515628 1 412957
  // return targetSize / canvasScale

}

// TODO: Merge lib canvas into here
export const updateCanvasSize = (ref: any, bbox: BoundingBox, canvasBuffer: number, targetCanvasWidth: number, targetLineWidth: number, zoom: number): CanvasRenderingContext2D => {
  const canvasScale = calculateScaleForCanvas(bbox, targetCanvasWidth * zoom)
  const lineWidth = calculateScaleForLine(canvasScale, targetLineWidth * zoom)
  const ctx = ref.current.getContext('2d', {alpha: true})

  const w = (bbox.width + (bbox.width + canvasBuffer) * canvasScale)
  const h = (bbox.height + (bbox.height + canvasBuffer) * canvasScale)
  resetCanvas(ctx, w, h, lineWidth, canvasScale)

  const cw = ref.current.width / canvasScale
  const ch = ref.current.height / canvasScale
  const bx = ((bbox.width * canvasBuffer))
  const by = ((bbox.height * canvasBuffer))
  const tx = (cw - (bbox.width) - bx / 2)
  const ty = (ch - (bbox.height) - by / 2)
  // const [x, y] = scalePointWithBoundingBox(bbox, bbox.max_x, bbox.max_y)

  ctx.translate(tx, ty)

  // if (zoom) {
  //   ctx.scale(zoom, zoom)
  // }

  return ctx

}
// https://stackoverflow.com/questions/195262/can-i-turn-off-antialiasing-on-an-html-canvas-element
// https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
// const canvasDrawRoundPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fillStyle: string) => {
//   ctx.beginPath()
//   ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
//   ctx.fillStyle = fillStyle
//   ctx.fill()
//   ctx.closePath()
// }


export const drawCoordinates = (bbox: BoundingBox, coordinates: number[][], pointSize: number, pointColor: string) => {
  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawCoordinates: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, coordinates.length)
      for (let i = 0; i < coordinates.length; i++) {
        const p = coordinates[i]
        const _p = scalePointWithBoundingBox(bbox, p[0], p[1])
        canvasDrawRoundPoint(ctx, _p[0], _p[1], ps, pointColor)
      }
      resolve(null)
    })
  }
}

export const drawFixedSizeCoordinates = (bbox: BoundingBox, coordinates: number[][], pointSize: number, pointColor: string) => {
  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawCoordinates: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, 1)
      for (let i = 0; i < coordinates.length; i++) {
        const p = coordinates[i]
        const _p = scalePointWithBoundingBox(bbox, p[0], p[1])
        canvasDrawRoundPoint(ctx, _p[0], _p[1], ps, pointColor)
      }
      resolve(null)
    })
  }
}


export const drawBoundaries = (bbox: BoundingBox, boundaries: NewBoundary[], outerColor: string, innerColor: string, fillColor: string) => {
  return (ref: any, _canvasScale: number, _zoom: number, lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !boundaries.length || !ref.current) {
        return reject(`check drawBoundaries: ${bbox.width} ${boundaries.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        drawBoundary(ctx, bbox, boundary, lineScale, outerColor, innerColor, fillColor, false)
      }
      resolve(null)
      //ctx.restore()
    })
  }
}

export const drawBoundingBoxes = (bbox: BoundingBox, boundaries: NewBoundary[], _strokeColor: string) => {
  return (ref: any, _canvasScale: number, _zoom: number, lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !boundaries.length || !ref.current) {
        return reject(`check drawBoundaries: ${bbox.width} ${boundaries.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        drawBoundary(ctx, bbox, boundary, lineScale, 'transparent', 'transparent', 'transparent', true)
      }
      //ctx.restore()
      // const _x = [bbox.min_x, bbox.min_y]
      // const _y = [bbox.max_x, bbox.max_y]
      const [minX, minY, maxX, maxY] = scaleBoundingBox(bbox, bbox.toArray() as [number, number, number, number])
      canvasDrawRectangle(ctx, minX, minY, maxX, maxY, 'transparent', 'blue', lineScale)
      resolve(null)
    })
  }
}

export const drawImageUrl = (bbox: BoundingBox, url: { bbox?: number[]; url: any; }, opacity: number, grayScale: boolean) => {

  return (ref: any, _canvasScale: number, _zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject('check drawImageUrl: no url')
      }
      if (!ref.current) {
        reject('check drawImageUrl: no ref')
      }
      const image = new Image()
      image.onload = () => {
        const ctx = ref.current?.getContext('2d', {alpha: true})
        if (!ctx) {
          reject('check drawImageUrl: no ctx')
          return
        }
        const [minX, minY, maxX, maxY] = scaleBoundingBox(bbox, bbox.toArray() as [number, number, number, number])
        ctx.save()
        ctx.globalAlpha = opacity

        if (grayScale) {
          ctx.filter = 'grayscale(100%)'
        }
        ctx.drawImage(image, minX, minY, maxX, maxY)
        ctx.restore()
        resolve(null)
      }
      image.src = url.url
    })
  }
}

export const drawHeadingTriangles = (bbox: BoundingBox, coordinates: number[][], percentageToShow: number, pointSize: number) => {
  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawHeadingTriangles: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      const percentage = percentageToShow < 100 ? (percentageToShow % 100) / 100 : 1
      const pointLength = Math.floor(coordinates.length * percentage)
      const steps = Math.floor(coordinates.length / pointLength)
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, Math.floor(coordinates.length / pointLength))


      for (let i = 0; i < coordinates.length - 1; i = i + steps) {
        const c = coordinates[i]
        const nextC = coordinates[i + 1]
        const currentPosition = new Vector(c[0], c[1])
        const nextPosition = new Vector(nextC[0], nextC[1])

        const angle = currentPosition.angle(nextPosition)
        const angleOffset = angle - (Math.PI / 2)

        drawRotatingTriangle(ctx, nextPosition.x, nextPosition.y, ps, angleOffset, 'gray', 'black', pointSize * 0.1)
      }
      //ctx.restore()
      resolve(null)
    })
  }
}

export const drawStartAndEndCoordinates = (bbox: BoundingBox, coordinates: number[][], percentageToShow: number) => {
  return (ref: any, _canvasScale: number, _zoom: number, _lineScale: number, pointSizeFn: (n: number) => number) => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawStartAndEndCoordinates: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      const firstPoint = coordinates[0]
      const lastPoint = coordinates[coordinates.length - 1]
      const percentage = percentageToShow < 100 ? (percentageToShow % 100) / 100 : 1
      const pointLength = Math.floor(coordinates.length * percentage)
      const pointSize = pointSizeFn(pointLength) * 4
      canvasDrawRoundPoint(ctx, firstPoint[0], firstPoint[1], pointSize * 5, 'green')
      canvasDrawRoundPoint(ctx, lastPoint[0], lastPoint[1], pointSize * 5, 'red')
      resolve(null)
      //ctx.restore()
    })

  }
}

// export const drawBreakpoints = (bbox: BoundingBox, breakpointIndices: number[][], coordinates: number[][]) => {
//   return (ref: any, canvasScale: number, zoom: number, lineScale: number, pointSizeFn: (n: number) => number) => {
//     return new Promise((resolve, reject) => {
//       if (!bbox.width || !coordinates.length || !ref.current) {
//         return reject(`check drawBreakpoints: ${bbox.width} ${coordinates.length} ${ref.current}`)
//       }
//       const ctx = ref.current.getContext('2d', {alpha: true})
//       //ctx.save()
//       const pointSize = pointSizeFn(coordinates.length) / 2
//       const colors = ['red', 'orange', 'blue', 'green', 'purple', 'pink', 'brown', 'black', 'white']
//       // const colors = emPalette12
//
//       const grid = pointGridFromUnscaled(bbox.toArray(), 25)
//       const tree = new PolyBush(coordinates)
//
//
//       for (let i = 0; i < breakpointIndices.length; i++) {
//         const breakpoints = breakpointIndices[i]
//         const points = breakpoints.map(breakpoint => coordinates[breakpoint])
//         for (let j = 0; j < points.length; j++) {
//           const point = points[j]
//           // canvasDrawRoundPoint(ctx, point[0], point[1], pointSize * 5, rgbToHex(colors[i % colors.length]))
//           canvasDrawRoundPoint(ctx, point[0], point[1], pointSize * 5, colors[i % colors.length])
//         }
//       }
//       resolve(null)
//     })
//
//   }
//
//
// }

// export const drawPointGrid = (bbox: BoundingBox, cellSize: number,coords:number[][] , column:number[]) => {
//   const tree = new PolyBush(coords.map((p) => [p[0], p[1]]))
//   return (ref: any, canvasScale: number, zoom: number, lineScale: number, pointSizeFn: (n: number) => number): Promise<null> => {
//     return new Promise((resolve, reject) => {
//       const grid = pointGridFromUnscaled(bbox.toArray(), cellSize)
//
//       const ctx = ref.current.getContext('2d', {alpha: true})
//       ctx.save()
//       for (let i = 0; i < grid.length; i++) {
//         const point = grid[i]
//         const [sx, sy] = scalePointWithBoundingBox(bbox, point[0], point[1])
//         let newValue = interpolatePoint(tree, 50, [sx, sy], 0.08,50, column, coords)
//
//         // if(newValue === null){
//         //   canvasDrawRectangle(ctx, point[0], point[1], cellSize, cellSize, 'transparent', 'white', 0.1)
//         //   continue
//         // }
//
//         canvasDrawRectangle(ctx, sx, sy, cellSize, cellSize, 'transparent', 'black', 0.1)
//       }
//       ctx.restore()
//       resolve(null)
//
//     })
//
//   }
// }

export const drawSoilPoints = (bbox: BoundingBox, coordinates: number[][], labels: string[], pointSize: number) => {

  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawSoilPoints: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, 1)
      canvasDrawLabels(ctx, bbox, coordinates, labels, ps, 'black', 'black', true)
      //ctx.restore()
      resolve(null)
    })
  }
}

export const drawSiteSelection = (bbox: BoundingBox, siteSelections: { [n: number]: SiteSelection }, pointSize: number) => {

  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(siteSelections)
      if (!bbox.width || !ref.current || !keys.length) {
        return reject(`check drawSiteSelection: ${bbox.width} ${ref.current} ${keys.length}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      ctx.save()
      // const ps = pointSizeFn(coordinates.length) * 15
      const objs = keys.map((k:any) => siteSelections[k]).sort((a, b) => a.value - b.value)
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, 1)
      for (let i = 0; i < objs.length; i++) {
        const obj = objs[i] as SiteSelection
        const labels = `(Z${obj.bin + 1}) ${obj.value}`
        canvasDrawLabels(ctx, bbox, [obj.point], [labels], ps, '#404040', '#404040', true)
      }

      ctx.restore()
      resolve(null)
    })
  }
}

export const drawPotentialSites = (bbox: BoundingBox, coordinates: number[][], _column: number[], _filterMin: number, _filterDiff: number, results: SortedValue[][], _selectedBreakpoint: Bin, siteSelection: { [n: number]: SiteSelection }, pointSize: number) => {

  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawFilteredData: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      ctx.save()

      // const l = results.length.toString().length
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, 1)

      for (let i = 0; i < results.length; i++) {
        const potential = results[i]
        const points = potential.map(potential => coordinates[potential.idx])
        const shouldDisplay = potential.map(x => siteSelection[x.idx] === undefined ? 0 : 1).reduce((a:number, b) => a + b, 0) === 0
        if (!shouldDisplay) {
          continue
        }
        const together = `${i.toString()}`
        const pointX = mean([points[0][0], points[points.length - 1][0]])
        const pointY = mean([points[0][1], points[points.length - 1][1]])
        canvasDrawLabels(ctx, bbox, [[pointX, pointY]], [' ' + together], ps, '#404040', '#404040', false)

      }
      ctx.restore()
      resolve(null)
    })
  }
}


export const drawColumnValues = (bbox: BoundingBox, coordinates: number[][], column: number[], pointSize: number, percentageToShow: number) => {

  return (ref: any, canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    console.log('drawColumnValues')
    return new Promise((resolve, reject) => {
      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawColumnValues: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      const ps = calculateScaleForPoints(canvasScale, pointSize, zoom, 1)
      const percentage = percentageToShow < 100 ? (percentageToShow % 100) / 100 : 1
      const pointLength = Math.floor(coordinates.length * percentage)
      const steps = Math.floor(coordinates.length / pointLength)
      const showNumbers = false
      for (let i = 0; i < coordinates.length - 1; i = i + steps) {
        // if (i % 2 !== 0) continue


        const value = column[i]
        // const nextValue = column[i + 1]

        // if (Math.abs(value - nextValue) < 5) continue
        if (showNumbers) {
          const point = Vector.from(...coordinates[i])
          const nextPoint = Vector.from(...coordinates[i + 1])
          const angle = vectorAngleIn360Degrees(point, nextPoint)

          ctx.save()
          const scaled = scalePointWithBoundingBox(bbox, point.x, point.y)
          ctx.translate(scaled[0], scaled[1])
          if (angle > 240 && angle < 300) {
            ctx.rotate(45 * Math.PI / 180)
          }
          if (angle > 60 && angle < 120) {
            ctx.rotate(45 * Math.PI / 180)
          }
          // ctx.rotate(angleRad)
          ctx.font = `bold ${ps}pt sans-serif`
          // ctx.textAlign = 'start'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = '#404040'
          ctx.fillText(' ' + value, 0, 0)
          // canvasDrawLabels(ctx, bbox, [[point.x, point.y]], [value],ps, 'black', 'black', true)
          ctx.restore()
        }
        // const color  = toolStore.paletteState.handler(toolStore.binState.nToBinIndex(value))
        const [sx, sy] = scalePointWithBoundingBox(bbox, coordinates[i][0], coordinates[i][1])
        canvasDrawRoundPoint(ctx, sx,sy, ps, 'gray')
      }


      resolve(null)
    })
  }
}

export const drawSoilFusion = (bbox: BoundingBox, coordinates: number[][], labels: string[]) => {

  return (ref: any, _canvasScale: number, _zoom: number, _lineScale: number, pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, reject) => {

      if (!bbox.width || !coordinates.length || !ref.current) {
        return reject(`check drawSoilFusion: ${bbox.width} ${coordinates.length} ${ref.current}`)
      }
      const ctx = ref.current.getContext('2d', {alpha: true})
      //ctx.save()
      const ps = pointSizeFn(coordinates.length) * 15
      // for (let i = 0; i < coordinates.length; i++) {
      //   const point = coordinates[i]
      //   const [sx, sy] = scalePointWithBoundingBox(bbox, point[0], point[1])
      //   canvasDrawRoundPoint(ctx, sx, sy, ps, 'brown')
      // }
      // console.log("LABERLS", labels)
      canvasDrawLabels(ctx, bbox, coordinates, labels, ps, 'black', 'brown', true)
      //ctx.restore()
      resolve(null)
    })
  }
}

export const drawNothing = (bbox: BoundingBox, buffer: number, _zoom: number) => {
  return (ref: any, _canvasScale: number, zoom: number, _lineScale: number, _pointSizeFn: (n: number) => number): Promise<null> => {
    return new Promise((resolve, _reject) => {
      if (bbox.width && ref.current) {
        const ctx = ref.current.getContext('2d', {alpha: true})
        resetCanvas(ctx, bbox.width, bbox.height, buffer, zoom)
        //ctx.save()
        //ctx.restore()
        resolve(null)
      }
    })
  }
}

export const mapLayersTo2DDrawFunctions = (props: DrawFunction2DArgs): Result<DrawFunction2D[], string> => {

  let toDraw = []
  let errors = []
  let activeFunctions = props.layers.filter(x => x.active)
  activeFunctions = activeFunctions.sort((a, b) => a.order - b.order)

  for (let i = 0; i < activeFunctions.length; i++) {
    const f = activeFunctions[i]
    switch (f.id) {
      case MapLayerIDs.Coordinates:
        toDraw.push(drawCoordinates(props.bbox, props.scaledCoordinates, props.coordinatesPointSize, 'gray'))
        break
      case MapLayerIDs.Boundaries:
        toDraw.push(drawBoundaries(props.bbox, props.boundaries, 'lime', 'red', 'transparent'))
        break
      case MapLayerIDs.BBox:
        toDraw.push(drawBoundingBoxes(props.bbox, props.boundaries, 'black'))
        break
      case MapLayerIDs.InterpolatedMap:
        toDraw.push(drawImageUrl(props.bbox, props.interpolatedMapUrl, props.interpolatedMapOpacity, props.mapGrayScale))
        break
      case MapLayerIDs.Headings:
        toDraw.push(drawHeadingTriangles(props.bbox, props.scaledCoordinates, props.headingsPercentageToShow, props.headingsPointSize))
        break
      case MapLayerIDs.StartEnd:
        toDraw.push(drawStartAndEndCoordinates(props.bbox, props.scaledCoordinates, props.headingsPercentageToShow))
        break

      // case 'draw-breakpoints':
      //   toDraw.push(drawBreakpoints(bbox, breakpointIndices, unscaledCoordinates))
      //   break
      // case MapLayerIDs.PointGrid:
      //   toDraw.push(drawPointGrid(props.bbox,16, props.scaledCoordinates, props.column))
      //   break
      case MapLayerIDs.SoilPoints:
        const coords = extractCoordinatesForCsvType(props.soilCoordinates.csv, props.soilCoordinates.type)
        if (!coords.isOk) {
          errors.push(`Draw Points Error: ${coords.error}`)
          break
        }
        const labels = csvColumnData(props.soilCoordinates.csv, 0)
        toDraw.push(drawSoilPoints(props.bbox, coords.value, labels, props.soilPointSize))
        break
      case MapLayerIDs.SoilFusion:
        // drawSoilFusion(bbox, soilCoordinates)
        break
      case MapLayerIDs.ColumnValues:
        if (props.column.length && props.unscaledCoordinates.length) {
          toDraw.push(drawColumnValues(props.bbox, props.unscaledCoordinates, props.column, props.columnValuesPointSize, props.columnValuesPercentageToShow))
        }
        break
      case MapLayerIDs.PotentialSites:
        if (props.column.length && props.unscaledCoordinates.length) {
          toDraw.push(drawPotentialSites(props.bbox, props.unscaledCoordinates, props.column, props.columnFilter.filterMin, props.columnFilter.filterDiff, props.columnFilter.locationsForSelectedBin, props.selectedBreakpoint, props.siteSelection, props.potentialSitesPointSize))
        }
        break
      case MapLayerIDs.SelectedSites:
        toDraw.push(drawSiteSelection(props.bbox, props.siteSelection, props.selectedSitesPointSize))
        break
    }
  }
  // @ts-ignore
  return Result.ok(toDraw)
}

export const stripPNGURI = (img: string): string => {
  img = img.replace('data:image/png;base64,', '')
  return img.replace(' ', '+')
}

export const stripJPGURI = (img: string): string => {
  img = img.replace('data:image/jpeg;base64,', '')
  return img.replace(' ', '+')
}
export const convertCanvasToPNG = (canvasRef:React.RefObject<HTMLCanvasElement>):string => {
  const canvas = canvasRef.current
  if (!canvas) {
    return ''
  }
  let img = canvas.toDataURL("image/png")
  // the data is base64 but needs two changes to be valid
  return stripPNGURI(img)

}

export const convertCanvasToJPG = (canvasRef:React.RefObject<HTMLCanvasElement>):string => {
  const canvas = canvasRef.current
  if (!canvas) {
    return ''
  }
  let img = canvas.toDataURL("image/jpeg")
  // the data is base64 but needs two changes to be valid
  return stripJPGURI(img)

}

