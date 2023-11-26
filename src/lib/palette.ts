

export const rgbToHex = (rgb:RGB) => '#' + [rgb.r, rgb.g, rgb.b].map(x => {
  if (x === undefined) {
    throw new Error('rgbToHex: rgb is undefined')
  }
  const hex = x.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('')

export class RGB {
  r: number
  g: number
  b: number
  constructor(r: number, g: number, b: number) {
    this.r = r
    this.g = g
    this.b = b
  }
  hex() {
    return rgbToHex(this)
  }
  isZero() {
    return this.r === 0 && this.g === 0 && this.b === 0
  }
}

// interpolate between colors { r, g, b } where  0 < t < 1
// when assigning a color for a number in a range larger than 0-1, scale the number to the 0-1 range first
// https://gist.github.com/peacefixation/5eeb6e992a012ea2f42cd5419df65ea7
export function lerpRGB(color1:RGB, color2:RGB, t: number) {
  const r = Math.round(color1.r + ((color2.r - color1.r) * t))
  const g = Math.round(color1.g + ((color2.g - color1.g) * t))
  const b = Math.round(color1.b + ((color2.b - color1.b) * t))
  return new RGB(r, g, b)
}



// --------------------------------------------------------------------------------------------------------------------
// EM PALETTES


const cA = new RGB(124, 18, 36)
const cB = new RGB(193, 36, 68)
const cC = new RGB(211, 60, 40)
const cD = new RGB(211, 60, 40)
const cE = new RGB(246, 184, 25)
const cF = new RGB(239, 209, 54)
const cG = new RGB(249, 233, 75)
const cH = new RGB(190, 216, 83)
const cI = new RGB(75, 184, 78)
const cJ = new RGB(43, 147, 105)
const cK = new RGB(24, 139, 125)
const cL = new RGB(19, 140, 169)
const cM = new RGB(29, 153, 208)
const cN = new RGB(17, 106, 181)
const cO = new RGB(56, 184, 165)
const cP = new RGB(80, 99, 174)
const cQ = new RGB(98, 66, 154)
const cR = new RGB(73, 56, 148)
const cS = new RGB(51, 43, 107)

export const emPalette20 = [cA, cB, cC, cD, cE, cF, cG, cH, cI, cJ, cK, cL, cM, cN, cO, cP, cQ, cR, cS]
export const emPalette10 = [cA, cC, cE, cG, cI, cK, cM, cO, cQ, cS]

export const emPalette12 = [
  new RGB(160, 29, 0),
  new RGB(206, 40, 0),
  new RGB(223, 91, 0),
  new RGB(245, 144, 1),
  new RGB(229, 197, 1),
  new RGB(167, 210, 24),
  new RGB(15, 124, 60),
  new RGB(5, 170, 117),
  new RGB(1, 178, 180),
  new RGB(2, 133, 197),
  new RGB(8, 77, 134),
  new RGB(0, 4, 73),
]
const emInverted12 = emPalette12.map(x => x).reverse()

// --------------------------------------------------------------------------------------------------------------------
// GR PALETTES
export const potassium12 = [
  new RGB(100, 0, 0),
  new RGB(128, 0, 0),
  new RGB(159, 63, 0),
  new RGB(191, 127, 0),
  new RGB(223, 191, 0),
  new RGB(167, 176, 0),
  new RGB(105, 218, 3),
  new RGB(57, 108, 40),
  new RGB(57, 108, 40),
  new RGB(120, 121, 100),
  new RGB(79, 80, 67),
  new RGB(49, 49, 49),
]

export const thorium12 = [
  new RGB(254, 250, 214),
  new RGB(250, 230, 90),
  new RGB(200, 231, 141),
  new RGB(161, 194, 46),
  new RGB(0, 151, 0),
  new RGB(2, 117, 80),
  new RGB(1, 90, 62),
  new RGB(83, 91, 104),
  new RGB(121, 132, 149),
  new RGB(95, 111, 175),
  new RGB(0, 0, 215),
  new RGB(83, 0, 166),
]
// --------------------------------------------------------------------------------------------------------------------
// PALETTE GROUPS


export const EMPalettes = [
  emPalette12,
  emPalette10,
  emPalette20,
  emInverted12,
]

export const PotassiumPalettes = [
  potassium12,
  emPalette12,
]

export const UraniumPalettes = [
  emPalette12,
]

export const ThoriumPalettes = [
  thorium12,
  emPalette12,
]

export const TotalCountPalettes = [
  emPalette12,
]

export const paletteHandler = (palette:RGB[]): (n:number) => RGB => {
  return (n) => {
    return palette[n % palette.length]
  }
}

export const palettes = {
  em: emPalette12,
  potassium: potassium12,
  uranium: emPalette12,
  thorium: thorium12,
  totalCount: emPalette12,
}
export const palettesAsArray = [
    emPalette12,
    potassium12,
  emPalette12,
    thorium12,
    emPalette12,
]



// export const getEMPaletteHandler = (total:number) => {
//   const _n = Math.round(total)
//   const palette = _n <= 12? palette12: palette20
//   return (i:number):string => {
//     try {
//       return rgbToHex(palette[i % palette.length])
//     } catch (e) {
//       console.log(`${i} not in palette`)
//     }
//   }
// }

// export const getGRPaletteHandler = getEMPaletteHandler



// https://www.codegrepper.com/code-examples/javascript/javascript+add+alpha+to+hex
export const addAlpha = (color: string, opacity: number): string => {
  // coerce values so ti is between 0 and 1.
  const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
  return color + _opacity.toString(16).toUpperCase()
}

