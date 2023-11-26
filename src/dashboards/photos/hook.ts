// Hook to manage zooming an image
import {useEffect, useState} from "react";

// Hook to manage zooming an image
export const useWidthHeight = (widthHeightAverage:number, _maxHeight:number) => {

  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null)

  const scale = (n: number) => {
    return n / (n / widthHeightAverage)
  }

  useEffect(() => {
    if (imgRef) {
      setHeight(scale(imgRef.naturalHeight || 100))
      setWidth(scale(imgRef.naturalWidth || 100))
    }
  }, [imgRef?.naturalHeight, imgRef?.naturalWidth])

  const zoomIn = () => {
    if (imgRef) {
      const height = imgRef.height
      setWidth(width + (width * 0.15))
      setHeight(height + (height * 0.15))
    }
  }

  const zoomOut = () => {
    if (height >= 400) {
      setWidth(width - (width * 0.15))
      setHeight(height - (height * 0.15))
    }
  }
  return {height, width, zoomIn, zoomOut, setImgRef}
}

// Only increment when busy is false
export const useDelayedIncrement = (maxIncrement: number):[number,number,(n:number) => void, boolean, (b:boolean) => void] => {
  const [delayedInc, setDelayedInc] = useState(0)
  const [instantInc, setInstantInc] = useState(0)
  const [busy, setBusy] = useState(false)

  // Utilise modulo to increment on positive and decrement on negative (whilst still being a positive number)
  const doInc = (n: number, m: number): number => {
    return (m + n) % m
  }

  // Increment delayed counter when not busy
  useEffect(() => {
    if (!busy) {
      setDelayedInc(doInc(instantInc, maxIncrement))
    }
  }, [instantInc, busy])

  // Reset on maxIncrement change
  useEffect(() => {
    setDelayedInc(0)
    setInstantInc(0)
  }, [maxIncrement])

  // Increment the instance counter when user clicks
  const _setInc = (inc: number) => {
    if (maxIncrement > 1) {
      setBusy(true)
      setInstantInc(doInc(inc, maxIncrement))
    }
  }
  return [delayedInc, instantInc, _setInc, busy, setBusy]
}