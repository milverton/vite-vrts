export const vectorShiftBy90Degrees = (currentPosition: Vector, nextPosition: Vector, byDistance: number) => {
  const angle = currentPosition.angle(nextPosition)
  const angleOffset = angle - (Math.PI / 2)
  return new Vector(nextPosition.x + byDistance * Math.cos(angleOffset+(Math.PI/2)),nextPosition.y + byDistance * Math.sin(angleOffset+(Math.PI/2)))
}

export const vectorSubtract = (v1: Vector, v2: Vector) => {
  return new Vector(v1.x - v2.x, v1.y - v2.y)
}

export const vectorAdd = (a: Vector, b: Vector) => {
  return new Vector(a.x + b.x, a.y + b.y)
}

export const vectorMultiply = (v: Vector, n: number) => {
  return new Vector(v.x * n, v.y * n)
}

export const vectorDivide = (v: Vector, n: number) => {
  return new Vector(v.x / n, v.y / n)
}

export const vectorDistance = (a: Vector, b: Vector) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

// export const vectorScale = (v: Vector, scale: number) => {
//   return new Vector(v.x * scale, v.y * scale)
// }

export const vectorRotate = (v: Vector, angle: number) => {
  return new Vector(v.x * Math.cos(angle) - v.y * Math.sin(angle), v.x * Math.sin(angle) + v.y * Math.cos(angle))
}

export const vectorIntersect = (a: Vector, b: Vector, c: Vector, d: Vector) => {
  let res = false;
  if (isLeft(a, b, c) * isLeft(a, b, d) <= 0) {
    res = true;
  }
  return res;
}

export const vectorAngle = (a: Vector, b: Vector) => {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

export const vectorFromAngle = (angle: number) => {
  return new Vector(Math.cos(angle), Math.sin(angle))
}

export const vectorMagnitude = (v: Vector) => {
  return Math.sqrt((v.x * v.x) + (v.y * v.y))
}
export const vectorAngleInDegrees = (a: Vector, b: Vector) => {
  let dir = vectorSubtract(b, a);
  return Math.atan2(dir.y, dir.x) * 180 / Math.PI
}

// Okay so, you didn't come home in time to see me fix it but it turns out that there was a difference in what we were doing to what we are meant to do.
// You can interchange these functions without any problems.
// The only two differences between them is Mathf.atan2(dir.y, dir.x) : Mathf.atan2(dir.y, -dir.x)
// The second is the fact that in the abs function we are subtracting instead of plussing.

// export const vectorAngleIn360DegreesPos = (a: Vector, b: Vector) => {
//   let dir = vectorNormalize(new Vector(b.x - a.x, b.y - a.y))
//   let angle = (Math.atan2(dir.y, dir.x) * (180 / Math.PI)) - 90
//   return Math.abs((angle + 360) % 360)
// }
export const vectorAngleIn360Degrees = (a: Vector, b: Vector) => {
  let dir = vectorNormalize(new Vector(b.x - a.x, b.y - a.y))
  let angle = (Math.atan2(dir.y, -dir.x) * (180 / Math.PI)) - 90
  // console.log(a,b,'dir', dir, 'angle', angle)
  return Math.abs((angle - 360) % 360)
}

export const vectorNormalize = (v: Vector) => {
  return new Vector(v.x / vectorMagnitude(v), v.y / vectorMagnitude(v))
}

// export const vectorNormalize = (v: Vector) => {
//   if(vectorMagnitude(v) > 0){
//     return vectorDivide(v, vectorMagnitude(v))
//   }
//   return v
// }

export const lerp = (a: Vector, b: Vector, t: number) => {
  // v1 * (1 - t) + v2 * t
  return vectorAdd(vectorMultiply(a, 1 - t), vectorMultiply(b, t))
}
// interface IRawParams {
//   [key: string]: any
// }

export class Vector {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  static from(...args: number[]) {
    return new Vector(args[0], args[1])
  }
  static fromString(str: string) {
    let [x, y] = str.split('.')
    return new Vector(parseFloat(x), parseFloat(y))
  }
  center(v: Vector) {
    return new Vector(this.x + v.x / 2, this.y + v.y / 2)
  }

  add(v: Vector) {
    return vectorAdd(this, v)
  }

  subtract(v: Vector) {
    return vectorSubtract(this, v)
  }

  multiply(n: number) {
    return vectorMultiply(this, n)
  }

  divide(n: number) {
    return vectorDivide(this, n)
  }

  distance(v: Vector) {
    return vectorDistance(this, v)
  }

  lerp(v: Vector, t: number) {
    return lerp(this, v, t)
  }

  angle(v: Vector) {
    return vectorAngle(this, v)
  }

  fromAngle(angle: number) {
    return vectorFromAngle(angle)
  }

  angleInDegrees(v: Vector) {
    return vectorAngleInDegrees(this, v)
  }
  angleIn360Degrees(v: Vector) {
    return vectorAngleIn360Degrees(this, v)
  }
  normalize() {
    return vectorNormalize(this)
  }
  magnitude() {
    return vectorMagnitude(this)
  }

  shift(nextPosition: Vector, byAmount:number) {
    // shift forward or backward byAmount in parallel to the direction of nextPosition
    return vectorShiftBy90Degrees(this, nextPosition, byAmount)
  }

  // scale(scale: number) {
  //   return vectorScale(this, scale)
  // }

  rotate(angle: number) {
    return vectorRotate(this, angle)
  }

  floor() {
    return new Vector(Math.floor(this.x), Math.floor(this.y))
  }

  ceil() {
    return new Vector(Math.ceil(this.x), Math.ceil(this.y))
  }
  round() {
    return new Vector(Math.round(this.x), Math.round(this.y))
  }
  toString() {
    return `${this.x}.${this.y}`
  }
  asArray():[number,number] {
    return [this.x, this.y]
  }
  cmp(v: Vector) {
    return this.x === v.x && this.y === v.y
  }

}



export const unityLerp = (a: Vector, b: Vector, t: number) => {
  // v + (difference * t) where t is a value between 0 and 1 (i.e. a percentage)
  return new Vector(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t
  )
}

export const north = (point:Vector, n:number):Vector => {
  return new Vector(point.x, point.y - n)
}
export const northEast = (point:Vector, n:number):Vector => {
  return new Vector(point.x + n, point.y - n)
}
export const northWest = (point:Vector, n:number):Vector => {
  return new Vector(point.x - n, point.y - n)
}
export const south = (point:Vector, n:number):Vector => {
  return new Vector(point.x, point.y + n)
}
export const southEast = (point:Vector, n:number):Vector => {
  return new Vector(point.x + n, point.y + n)
}
export const southWest = (point:Vector, n:number):Vector => {
  return new Vector(point.x - n, point.y + n)
}
export const east = (point:Vector, n:number):Vector => {
  return new Vector(point.x + n, point.y)
}
export const west = (point:Vector, n:number):Vector => {
  return new Vector(point.x - n, point.y)
}

export const directions = [north, northEast, east, southEast, south, southWest, west, northWest]

// export const northStep = (point:Vector, n:number):Vector[] => {
//   return [[point.x, point.y - n]].map(v => new Vector(v[0], v[1]))
// }
// export const northEastStep = (point:Vector, n:number):Vector[] => {
//   const _n = north(point, n)
//   const _e = east(_n, n)
//   return [_n,_e]
// }
// export const northWestStep = (point:Vector, n:number):Vector[] => {
//   const _n = north(point, n)
//   const _w = west(_n, n)
//   return [_n,_w]
// }
// export const southStep = (point:Vector, n:number):Vector[] => {
//   return [[point.x, point.y + n]].map(v => new Vector(v[0], v[1]))
// }
// export const southEastStep = (point:Vector, n:number):Vector[] => {
//   const _s = south(point, n)
//   const _e = east(_s, n)
//   return [_s,_e]
// }
// export const southWestStep = (point:Vector, n:number):Vector[] => {
//   const _s = south(point, n)
//   const _w = west(_s, n)
//   return [_s,_w].map(v => new Vector(v[0], v[1]))
// }
// export const eastStep = (point:Vector, n:number):Vector[] => {
//   return [[point.x + n, point.y]].map(v => new Vector(v[0], v[1]))
// }
// export const westStep = (point:Vector, n:number):Vector[] => {
//   return [[point.x - n, point.y]].map(v => new Vector(v[0], v[1]))
// }
//
// export const directionSteps = [northStep, northEastStep, eastStep, southEastStep, southStep, southWestStep, westStep, northWestStep]

export const angleToNavigator = (angle: number) => {
  switch (angle) {
    case 0:
      return north
    case 90:
      return east
    case 180:
      return south
    case 270:
      return west
  }
  if (angle > 0 && angle <= 45) {
    return northEast // northEast
  }
  if (angle > 45 && angle <= 90) {
    return east
  }
  if (angle > 90 && angle <= 135) {
    return southEast // southEast
  }
  if (angle > 135 && angle <= 180) {
    return south
  }
  if (angle > 180 && angle <= 225) {
    return southWest // southWest
  }
  if (angle > 225 && angle <= 270) {
    return west
  }
  if (angle > 270 && angle <= 315) {
    return northWest // northWest
  }
  if (angle > 315 && angle <= 359) {
    return north
  }
}


// export const euclideanDistance = (points) => {
//   let distance = 0.0
//   for (let i = 0; i < points.length - 1; i++) {
//     distance += (Math.pow(points[i][0] - points[i][1], 2))
//   }
//   return Math.sqrt(distance)
// }

// export const getIndex = (distX: number, ...point: [x: number, y: number]) => {
//   const [x, y] = point
//   return Math.abs((Math.floor(x)) + (Math.floor(y) * (distX)))
// }
export const getIndex = (distX: number, ...point: [x: number, y: number]) => {
  const [x, y] = point
  return Math.abs((Math.round(x)) + (Math.round(y) * (distX)))
}
export const getRoundedIndex = (roundFn:(number:number) => number, distX: number, ...point: [x: number, y: number]) => {
  const [x, y] = point
  return Math.abs(roundFn(x) + roundFn(y) * (distX))
}


export const getXYFromIndex = (distX:number, idx:number) => {
  return [idx % (distX), idx / (distX)]
}

export const getRoundedXYFromIndex = (roundFn:(number:number) => number, distX:number, idx:number) => {
  return [roundFn(idx % (distX)), roundFn(idx / (distX))]
}

// export const scaleXY = (bbox: BoundingBox, x, y) => {
//   const [sx, sy] = scalePoint(bbox.toArray(), x, y, bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
//   return [Math.floor(sx), Math.floor(sy)]
// }
// export const scaleXY = (bbox: BoundingBox, x, y) => {
//   const [sx, sy] = scalePoint(bbox.toArray(), x, y, bbox.dist_x, bbox.dist_y, bbox.width, bbox.height)
//   return [sx, sy]
// }
export function* lerpBetweenVectors(a: Vector, b: Vector, distance:number): Iterable<Vector> {
  // const d = vectorDistance(a, b)
  const lerpConst = 1 / distance
  for (let j = 0; j < distance; j++) {
    const nextPos = lerp(a, b, lerpConst * j)
    yield nextPos
  }
}

const squareAngles = {0:true, 90:true, 180:true, 270:true}
export function* lerpBetweenVectorsX(a: Vector, b: Vector, distance:number): Iterable<Vector> {

  const vectors = []
  const seen = {}
  for (let v of lerpBetweenVectors(a, b, distance)) {
    const f = v.floor()
    // @ts-ignore
    if (!seen[f.toString()]) {
      vectors.push(f)
      // @ts-ignore
      seen[f.toString()] = true
    }
  }
  yield vectors[0]
  for (let i = 0; i < vectors.length-1; i++) {
    const v = vectors[i]
    const n = vectors[i+1]
    const angle = vectorAngleIn360Degrees(v, n)
    // @ts-ignore
    if (!squareAngles[angle]) {
      switch (angle) {
        case 45:
          yield north(n, 1)
          yield east(n, 1)
          break
        case 135:
          yield south(n, 1)
          yield east(n, 1)
          break
        case 225:
          yield south(n, 1)
          yield west(n, 1)
          break
        case 315:
          yield north(n, 1)
          yield west(n, 1)
          break
      }

    }
    const _distance = vectorDistance(v, n)
    if (_distance >= 2) {
      yield* lerpBetweenVectors(v, n, _distance)
    }

    // console.log(vectorDistance(v, n))
    yield n

  }
  // console.log(vectors)
  // yield* vectors

}




// function cross(x: Vector, y: Vector, z: Vector): number {
//   return (y.x - x.x) * (z.y - x.y) - (z.x - x.x) * (y.y - x.y);
// }

// export function pointInPolygon(p: Vector, points: Array<Vector>): boolean {
//   let wn = 0; // winding number
//
//   points.forEach((a, i) => {
//     const b = points[(i+1) % points.length];
//     if (a.y <= p.y) {
//       if (b.y > p.y && cross(a, b, p) > 0) {
//         wn += 1;
//       }
//     } else if (b.y <= p.y && cross(a, b, p) < 0) {
//       wn -= 1;
//     }
//   });
//
//   return wn !== 0;
// }


export function pointInPolygon(point: any, vs: any) {
  const x = point[0], y = point[1];
  let wn = 0;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];

    if (yj <= y) {
      if (yi > y) {
        if (isLeft([xj, yj], [xi, yi], [x,y]) > 0) {
          wn++;
        }
      }
    } else {
      if (yi <= y) {
        if (isLeft([xj, yj], [xi, yi], [x, y]) < 0) {
          wn--;
        }
      }
    }
  }
  return wn != 0;
}

function isLeft(P0: any, P1: any, P2: any) {
  let res = ( (P1[0] - P0[0]) * (P2[1] - P0[1])
    - (P2[0] -  P0[0]) * (P1[1] - P0[1]) );
  return res;
}


export function* bresenham(a: Vector, b: Vector) {
  const slope = (b.y - a.y) / (b.x - a.x)
  const distance = Math.abs(b.x - a.x)
  let yIncrement = a.y
  let xIncrement = a.x
  for (let i = 0; i < distance; i++) {
    yield [xIncrement, yIncrement, slope]
    xIncrement += 1
    yIncrement += Math.round(slope)
    // console.log(xIncrement, yIncrement, slope)
  }



  // yield 1



  // let [x1, y1] = [a.x, a.y]
  // let [x2, y2] = [b.x, b.y]
  // let run = x2 - x1
  // let rise = y2 - y1
  //
  // if (run === 0) {
  //   if (y2 < y1) {
  //     [y1, y2] = [y2, y1]
  //   }
  //   for (let y = y1; y <= y2+1; y++) {
  //     yield [x1, y]
  //   }
  // } else {
  //   const slope = rise / run
  //   const adjust = slope >= 0 ? 1 : -1
  //   let offset = 0
  //
  //   if (slope <= 1 && slope >= -1) {
  //     const delta = Math.abs(run) * 2
  //     let threshold = Math.abs(rise)
  //     let thresholdInc = Math.abs(rise) * 2
  //     let y = y1
  //     if (x2 < x1) {
  //       [x1, x2] = [x2, x1]
  //       y = y2
  //     }
  //     for (let x = x1; x <= x2+1; x++) {
  //       yield [x, y]
  //       offset += delta
  //       if (offset >= threshold) {
  //         y += adjust
  //         threshold += thresholdInc
  //       }
  //     }
  //
  //   } else {
  //     // const delta = Math.abs(rise/run)
  //     const delta = Math.abs(run) * 2
  //     let threshold = Math.abs(rise)
  //     let thresholdInc = Math.abs(rise) * 2
  //     let x = x1
  //     if (y2 < y1) {
  //       [y1, y2] = [y2, y1]
  //       x = x2
  //     }
  //     for (let y = y1; y <= y2+1; y++) {
  //       yield [x, y]
  //       offset += delta
  //       if (offset >= threshold) {
  //         x += adjust
  //         threshold += thresholdInc
  //       }
  //     }
  //   }
  // }

  // console.log('bresenham', a, b)
  // let [x,y] = [a.x, a.y]
  // let x0 = a.x
  // let y0 = a.y
  // let x1 = b.x
  // let y1 = b.y
  // let dx = Math.abs(x1 - x0) // horizontal distance
  // let dy = Math.abs(y1 - y0) // vertical distance
  // const gradient = dy / dx
  //
  // if (gradient > 1 || gradient < -1) {
  //   [dx,dy] = [dy,dx];
  //   [x, y] = [y, x];
  //   [x0,y0] = [y0,x0];
  //   [x1,y1] = [y1,x1];
  // }
  // let p = 2 * dy - dx
  //
  // yield [x,y]
  // for (let i = 2; i < dx; i++) {
  //
  //   if (p > 0) {
  //     y = y < y1? y + 1 : y - 1
  //     p = p + 2  * (dy - dx)
  //   } else {
  //     p = p + 2 * dy
  //   }
  //   x = x < x1? x + 1 : x - 1
  //   // console.log(a, b, x, y)
  //   yield [x,y]
  // }

}