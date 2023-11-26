import {round} from "../lib/stats";

export const roundIfNecessary = (a: number, b: number, toRound: number) => {
  const ac = a.toString().split(".")[1]?.length || 0
  const bc = b.toString().split(".")[1]?.length || 0
  const cc = toRound.toString().split(".")[1]?.length || 0
  const max = Math.max(ac, bc)
  if (cc > max) {
    return round(toRound, max)
  }
  return toRound
}


// https://stackoverflow.com/questions/1458633/how-to-deal-with-floating-point-number-precision-in-javascript
export const precisionRound = (number: any, precision: number) => {
  const factor = Math.pow(10, precision)
  const n = precision < 0 ? number : 0.01 / factor + number
  return Math.round( n * factor) / factor
}
