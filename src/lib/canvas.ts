// Define function for drawing points on canvas

import {scalePoint, scalePointWithBoundingBox} from "./map";


import {NewBoundary} from "./stores/boundary/model";
import {BoundingBox} from "../core/bounding-box";

export const drawRotatingTriangle = (ctx:any, x:any, y:any, _radius:any, angle:any, color:any, _strokeColor:any, strokeSize:any) => {
  let radius = _radius * 0.5
  let lx = x - radius * Math.cos(angle)
  let ly = y - radius * Math.sin(angle)
  // let cx = x + radius/2 * Math.cos(angle)
  // let cy = y + radius/2 * Math.sin(angle)
  let apexX = x + radius / 2 * Math.cos(angle + Math.PI / 2) * 4
  let apexY = y + radius / 2 * Math.sin(angle + Math.PI / 2) * 4
  let rx = x + radius * Math.cos(angle)
  let ry = y + radius * Math.sin(angle)

  ctx.beginPath()
  ctx.moveTo(lx, ly)
  ctx.lineTo(apexX, apexY)
  ctx.lineTo(rx, ry)
  ctx.lineTo(lx, ly)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()

  ctx.beginPath()
  ctx.moveTo(apexX, apexY)
  ctx.lineTo(x + radius / 2 * Math.cos(angle - (Math.PI / 2)) * 4, y + radius / 2 * Math.sin(angle - (Math.PI / 2)) * 4)
  ctx.strokeStyle = color
  ctx.lineWidth = strokeSize
  ctx.stroke()
  ctx.closePath()


  // ctx.beginPath()
  // ctx.moveTo(x, y)
  // ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
  // ctx.lineTo(x + radius * Math.cos(angle + Math.PI / 3), y + radius * Math.sin(angle + Math.PI / 3))
  // ctx.lineTo(x, y)
  // ctx.fillStyle = color
  // ctx.strokeStyle = strokeColor
  // ctx.lineWidth = strokeSize
  // ctx.fill()
  // ctx.stroke()
  // ctx.closePath()

  // draws a point at the apex of the triangle
  // ctx.beginPath()
  // const _x = x + radius * Math.cos(angle + Math.PI / 3)
  // const _y = y + radius * Math.sin(angle + Math.PI / 3)
  // ctx.arc(_x, _y, 0.25, 0, 2 * Math.PI, false)
  // ctx.fillStyle = strokeColor
  // ctx.fill()
  // ctx.closePath()

  // ctx.beginPath()
  // // move to apex of triangle
  // const _x = x + radius * Math.cos(angle + Math.PI / 3)
  // const _y = y + radius * Math.sin(angle + Math.PI / 3)
  // ctx.moveTo(_x, _y)
  // // get midpoint at base of triangle
  // const _nx = x + radius/2 * Math.cos(angle)
  // const _ny = y + radius/2 * Math.sin(angle)
  // // draw a line to form an arrow
  // ctx.lineTo(_nx + radius * Math.cos(angle-(Math.PI/2))*1.1, _ny + radius * Math.sin(angle-(Math.PI/2))*1.1)
  // ctx.strokeStyle = color
  // ctx.stroke()
  // ctx.closePath()
}

export const drawTriangle = (ctx:any, x:any, y:any, size:any, color:any, strokeColor:any, strokeSize:any) => {
  ctx.fillStyle = color
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = strokeSize
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x + size / 2, y - size)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

export const canvasDrawLine = (ctx: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, color: string, width: number) => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
  ctx.closePath()
}

export const canvasDrawRoundPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fillStyle: string) => {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = fillStyle
  ctx.fill()
  ctx.closePath()
}

export const canvasDrawRectangle = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, fillStyle: string, strokeStyle: string = 'transparent', strokeWidth: number = 0) => {
  ctx.beginPath()
  ctx.fillStyle = fillStyle
  ctx.fillRect(x, y, width, height)
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = strokeWidth
    ctx.strokeRect(x, y, width, height)
  }
  ctx.closePath()
}

export const drawFeaturePoint = (ctx: CanvasRenderingContext2D, point: any, radius: number, fillStyle: string) => {
  // const [x, y] = point.geometry.coordinates
  canvasDrawRoundPoint(ctx, point.properties.scaledX, point.properties.scaledY, radius, fillStyle)
}

export const drawFeatureRectangle = (ctx: CanvasRenderingContext2D, point: any, _bbox: BoundingBox, width: number, height: number, fillStyle: string, strokeStyle: string, strokeWidth: number) => {
  canvasDrawRectangle(ctx, point.properties.scaledX, point.properties.scaledY, width, height, fillStyle, strokeStyle, strokeWidth)
}

export const drawPolygonFeatures = (ctx: CanvasRenderingContext2D, bbox: BoundingBox, polygons: any, lineWidth: number = 1, fillInnerPolygons: boolean = false) => {

  const features = polygons.features
  const bboxArray = bbox.toArray()
  for (let k = 0; k < features.length; k++) {
    const feature = features[k]
    const featureCount = feature.geometry.coordinates.length
    for (let i = 0; i < feature.geometry.coordinates.length; i++) {
      const points = feature.geometry.coordinates[i]
      const shouldSkipFill = fillInnerPolygons && featureCount > 0 && i > 0

      ctx.fillStyle = 'transparent'
      ctx.lineWidth = lineWidth

      ctx.beginPath()
      const [startX, startY] = scalePoint(bboxArray, points[0][0], points[0][1], bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
      ctx.moveTo(startX, startY)
      for (let j = 1; j < points.length; j++) {
        const point = points[j]
        const [x, y] = scalePoint(bboxArray, point[0], point[1], bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
        ctx.lineTo(x, y)
      }

      // console.log('drawing polygon', feature.properties.style, shouldSkipFill)
      if (feature.properties.style && !shouldSkipFill) {

        if (feature.properties.style.fill) {
          ctx.fillStyle = feature.properties.style.fill
          ctx.fill()
        }
      }

      if (shouldSkipFill) {
        ctx.fillStyle = 'white'
        ctx.fill()
      }

      if (feature.properties.style && feature.properties.style.stroke) {
        ctx.strokeStyle = feature.properties.style.stroke
        ctx.stroke()
      }


      ctx.closePath()
    }
  }
}

// function choose(choices) {
//   var index = Math.floor(Math.random() * choices.length);
//   return choices[index];
// }

export const drawBoundary = (ctx: CanvasRenderingContext2D, bbox: BoundingBox, boundary: NewBoundary, lineWidth: number, outerColor: string, innerColor: string, fillColor: string, showBoundingBox: boolean) => {
  ctx.lineWidth = lineWidth
  ctx.fillStyle = fillColor
  ctx.strokeStyle = outerColor
  ctx.beginPath()
  for (let i = 0; i < boundary.exterior_ring.length; i++) {
    const [x, y] = scalePointWithBoundingBox(bbox, boundary.exterior_ring[i][0], boundary.exterior_ring[i][1])
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()
  ctx.fill()
  ctx.closePath()

  if (showBoundingBox) {
    ctx.beginPath()
    const [minX, minY, maxX, maxY] = boundary.bounding_box
    const [mx, my] = scalePointWithBoundingBox(bbox, minX, maxY)
    const [mx2, my2] = scalePointWithBoundingBox(bbox, maxX, minY)
    ctx.strokeStyle = 'gray'
    ctx.moveTo(mx, my)
    ctx.lineTo(mx, my2)
    ctx.lineTo(mx2, my2)
    ctx.lineTo(mx2, my)
    ctx.lineTo(mx, my)
    ctx.stroke()
    // drawRoundPoint(ctx, mx, my, 10, 'lime')
    // drawRoundPoint(ctx, mx2, my2, 10, 'blue')
    ctx.closePath()

  }


  for (let i = 0; i < boundary.interior_ring.length; i++) {
    const inner = boundary.interior_ring[i]
    ctx.strokeStyle = innerColor
    ctx.fillStyle = 'white'
    ctx.beginPath()
    for (let j = 0; j < inner.length; j++) {
      const [x, y] = scalePointWithBoundingBox(bbox, inner[j][0], inner[j][1])
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
  }
  ctx.closePath()
}

export const drawBoundaryLabels = (ctx: CanvasRenderingContext2D, bbox: BoundingBox, boundary: NewBoundary, label: string, fontSize: string) => {
  ctx.beginPath()
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.fillStyle = 'black'
  const sums = boundary.exterior_ring.reduce((acc, curr) => {
    acc.xSum += curr[0]
    acc.ySum += curr[1]
    return acc
  }, {xSum: 0, ySum: 0})
  const [x, y] = [sums.xSum / boundary.exterior_ring.length, sums.ySum / boundary.exterior_ring.length]

  const [ax, ay] = scalePoint(bbox.toArray(), x, y, bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
  // const [bx,by] = scalePoint(bbox.toArray(), boundary.minMaxX.max, boundary.minMaxY.min, bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
  // console.log(`drawing label ${label} at ax${ax} ay${ay} bx${bx} by${by}`)
  ctx.fillText(label.toUpperCase(), ax, ay)
  // drawRoundPoint(ctx, ax, ay, 25, 'black')
  // drawRoundPoint(ctx, bx, by, 25, 'red')
  ctx.closePath()
}

export const canvasDrawLabels = (ctx: CanvasRenderingContext2D, bbox: BoundingBox, points: number[][], labels: string[], fontSize: number, fontColor:string, pointColor:string, showPoints:boolean, align:string = 'start') => {
  ctx.beginPath()
  ctx.font = `bold ${fontSize}pt sans-serif`
  ctx.fillStyle = fontColor
  for (let i = 0; i < points.length; i++) {
    const [x, y] = scalePointWithBoundingBox(bbox, points[i][0], points[i][1])
    let padding = ''
    if (showPoints) {
      canvasDrawRoundPoint(ctx, x, y, fontSize/3, pointColor)
      padding = '    '
    }
    ctx.fillStyle = fontColor
    // ctx.fill()
    ctx.textAlign = align as CanvasTextAlign
    ctx.textBaseline = 'middle'
    ctx.fillText(padding + labels[i], x, y)
  }
  ctx.closePath()
}


export const resetCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, canvasBuffer: number, zoomFactor: number) => {
  // Reset any transforms
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // Clear the canvas taking into account the canvas buffer
  ctx.clearRect(-canvasBuffer / 2, -canvasBuffer / 2, width + canvasBuffer / 2, height + canvasBuffer / 2)

  // Set the scale, this allows the canvas to zoom without having to rescale the coordinates
  ctx.scale(zoomFactor, zoomFactor)

  // A buffer is added to canvas width and height. Here, the origin is shifted by half the buffer
  // in the x and y direction and the result is a buffer around the whole canvas that centers the map on the canvas
  ctx.translate((canvasBuffer / 2), canvasBuffer / 2)
}