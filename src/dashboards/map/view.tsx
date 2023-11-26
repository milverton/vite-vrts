import {useEffect, useRef} from "react"
import {
  calculateScaleForCanvas,
  calculateScaleForLine,
  calculateScaleForPoints,
  convertCanvasToJPG,
  convertCanvasToPNG,
  updateCanvasSize
} from "./transform";
import {classNames} from "../../lib/common";
import * as R from "ramda"
import {BoundingBox} from "../../core/bounding-box";
import {DrawFunction2D, ImageCallback} from "./model";

const MapView = (
  {
    id,
    bbox,
    className,
    targetCanvasWidth,
    targetCanvasLineWidth,
    targetCanvasPointSize,
    canvasBuffer,
    zoom,
    drawFunctions,
    pngCallback,
    jpegCallback,
  }: {
    id: string,
    bbox: BoundingBox,
    className?: string,
    targetCanvasWidth: number,
    targetCanvasLineWidth: number,
    targetCanvasPointSize: number,
    canvasBuffer: number
    zoom: number
    drawFunctions: DrawFunction2D[]
    pngCallback?: ImageCallback,
    jpegCallback?: ImageCallback,
  }) => {


  const canvasReference = useRef(null)
  const canvasScale = calculateScaleForCanvas(bbox, targetCanvasWidth)

  const width = (bbox.width + (bbox.width * canvasBuffer)) * canvasScale
  const height = (bbox.height + (bbox.height * canvasBuffer)) * canvasScale

  useEffect( () => {

    if (canvasReference.current) {
      const run = async () => {
        // console.log("drawing")
        const lw = zoom > 1 ? targetCanvasLineWidth / zoom : targetCanvasLineWidth * (zoom / 1.25)
        // const ps = zoom > 1 ? targetCanvasPointSize / zoom : targetCanvasPointSize * (zoom / 1.25)
        updateCanvasSize(canvasReference, bbox, canvasBuffer, targetCanvasWidth, targetCanvasLineWidth, zoom)
        const canvasScale = calculateScaleForCanvas(bbox, targetCanvasWidth)
        const lineScale = calculateScaleForLine(canvasScale, lw)
        const pointScaleFn = R.curry(calculateScaleForPoints)(canvasScale, targetCanvasPointSize, zoom)
        for (let i = 0; i < drawFunctions.length; i++) {
          const f = drawFunctions[i]
          // const p = performance.now()
          try {
            // the draw functions must wait for the previous one to finish
            await f(canvasReference, canvasScale, zoom, lineScale, pointScaleFn)
          } catch (e) {
            // a failure here is not a big deal, just log it
            console.warn(e)
          }
        }
      }
      run()
        .then(() => {
          if (pngCallback) {
            pngCallback(convertCanvasToPNG(canvasReference), id, width, height)
          }
          if (jpegCallback) {
            jpegCallback(convertCanvasToJPG(canvasReference), id, width, height)
          }
        })
        .catch(e => console.error(e))
    }
  }, [canvasReference, drawFunctions, bbox.width, bbox.height, targetCanvasWidth, canvasBuffer, zoom])

  return (
    <div className={classNames(className ? className : "m-auto")}>
      <canvas ref={canvasReference}
              key={width + "canvas" + height + id + zoom + targetCanvasPointSize + targetCanvasLineWidth + targetCanvasWidth}
              className="m-auto z-10"
              width={width * zoom}
              height={height * zoom}></canvas>
    </div>
  )
}
export default MapView
