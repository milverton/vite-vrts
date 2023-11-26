import {NewBoundary} from "../lib/stores/boundary/model";
import CheapRuler from "cheap-ruler";
import {Vector} from "./vector";

export class BoundingBox {
  width: number
  height: number
  max_x: number
  min_x: number
  max_y: number
  min_y: number

  // set max x,y and min,xy to the opposite so data will incrementally update actual max,min values
  // width and height are for the canvas
  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.max_x = -180
    this.min_x = 180
    this.max_y = -90
    this.min_y = 90
  }

  copy() {
    const bb = new BoundingBox(this.width, this.height)
    bb.max_x = this.max_x
    bb.min_x = this.min_x
    bb.max_y = this.max_y
    bb.min_y = this.min_y
    return bb
  }

  isUnset() {
    return this.width === 0 || this.height === 0 || (this.max_x === -180 && this.min_x === 180 && this.max_y === -90 && this.min_y === 90)
  }

  // distance between east and west
  get dist_x() {
    return this.max_x - this.min_x
  }

  // distance between north and south
  get dist_y() {
    return this.max_y - this.min_y
  }

  // ratio of height to width
  get ratio_hw() {
    return this.dist_y / this.dist_x
  }

  // ratio of width to height
  get ratio_wh() {
    return this.dist_x / this.dist_y
  }

  // ratio of canvas width to distance
  get ratio_x() {
    return this.width / this.dist_x
  }

  // ratio of canvas height to distance
  get ratio_y() {
    return this.height / this.dist_y
  }

  // area of data
  get area() {
    return this.dist_x * this.dist_y
  }

  // center x and y of data (halfway point of the distance
  get center() {
    return [this.min_x + (this.dist_x / 2), this.min_y + (this.dist_y / 2)]
    // return [[this.dist_x / 2], [this.dist_y / 2]]
  }

  isInitialized = () => {
    let d = [180, 90, -180, -90]
    return this.toArray().filter((x, i) => x === d[i]).length !== 4
  }

  // Update bounding box max,min values using x,y point
  update = (x: number, y: number) => {
    let bb = this
    // x == lon, y == lat
    if (x > bb.max_x) bb.max_x = x
    if (x < bb.min_x) bb.min_x = x
    if (y > bb.max_y) bb.max_y = y
    if (y < bb.min_y) bb.min_y = y
  }

  // updateWithVectors = (vectors: Array<Vector>) => {
  //   for (let i = 0; i < vectors.length; i++) {
  //     const point = vectors[i]
  //     this.update(point.x, point.y)
  //   }
  // }

  updateWithPoints = (points: Array<Array<number>>) => {
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      this.update(point[0], point[1])
    }
  }

  updateUsingFeaturePoints = (points: any[]) => {
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      this.update(point.geometry.coordinates[0], point.geometry.coordinates[1])
    }
  }

  updateWithBoundingBox = (bb: BoundingBox) => {
    this.update(bb.min_x, bb.min_y)
    this.update(bb.max_x, bb.max_y)
  }

  updateWithBoundingBoxArray = (minX:number, minY:number, maxX:number, maxY:number) => {
    this.update(minX, minY)
    this.update(maxX, maxY)
  }

  updateWithBoundaries = (boundaries: NewBoundary[]) => {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      const [min_x, min_y, max_x, max_y] = boundary.bounding_box
      this.update(min_x, min_y)
      this.update(max_x, max_y)
    }
  }


  toArray = (): Array<number> => {
    return [this.min_x, this.min_y, this.max_x, this.max_y]
  }

  toObject = () => {
    return {
      min_x: this.min_x,
      min_y: this.min_y,
      max_x: this.max_x,
      max_y: this.max_y
    }
  }

  haversine = (startingPoint: Vector, endingPoint: Vector) => {
    // radius of earth in meters
    const R = 6371000 //6378137 // 6371000
    const P180 = Math.PI / 180

    // convert decimal degrees to radians
    const start_lat = startingPoint.y * P180
    const start_lon = startingPoint.x * P180
    const end_lat = endingPoint.y * P180
    const end_lon = endingPoint.x * P180

    // difference in radians
    const delta_lat = end_lat - start_lat
    const delta_lon = end_lon - start_lon

    let a =
      Math.pow(Math.sin(delta_lat / 2), 2) +
      Math.cos(start_lat) * Math.cos(end_lat) *
      Math.pow(Math.sin(delta_lon / 2), 2)

    // https://gis.stackexchange.com/questions/84885/difference-between-vincenty-and-great-circle-distance-calculations/336602#336602
    // From the post:
    // If a negative value finds its way into a sqrt(), such as sqrt(-0.00000000000000000122739),
    // there will be an exception error. In the haversine formula, the manner in which it progresses
    // towards a solution, there are two sqrt() methods in the atan2(). The a that is calculated and
    // then used in the sqrt(), can, at the antipodal points on the globe, slightly stray below
    // 0.0 or above 1.0, very slightly because of fp64 approximations and rounding,
    // rarely, but repeatably. Consistent reliable repeatability, in this context,
    // makes this an exception risk, an edgecase to protect, to mitigate, rather than an isolated random fluke.

    if (a < 0.0) {
      a = 0.0
    }
    if (a > 1.0) {
      a = 1.0
    }

    const distInRadians = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * distInRadians
  }

  widthInMeters = (): number => {
    return this.haversine(new Vector(this.min_x, this.min_y), new Vector(this.max_x, this.min_y))
  }

  heightInMeters = (): number => {
    return this.haversine(new Vector(this.min_x, this.min_y), new Vector(this.min_x, this.max_y))
  }

  adjustDimensionsWithHaversine = () => {
    this.width = this.widthInMeters()
    this.height = this.heightInMeters()
    // this.adjustDimensions()
  }
  adjustDimensionsWithCheapRuler = () => {
    const ruler = new CheapRuler((this.min_y + this.max_y) / 2, 'meters')
    this.width = ruler.distance([this.min_x, this.min_y], [this.max_x, this.min_y])
    this.height = ruler.distance([this.min_x, this.min_y], [this.min_x, this.max_y])
  }
  adjustDimensions = () => {
    // https://github.com/mapbox/cheap-ruler
    this.adjustDimensionsWithCheapRuler()
  }

  adjustDimensionsVictor = (debug: boolean = false) => {

    // VICTOR: Calculate the ratio between x and y extent
    const circ_e = 40075017 // Earth's circumference around the Equator (m)
    const circ_y = 40007863 // Earth's circumference around the poles (m)


    const A = Math.abs
    // VICTOR: Average latitude in study area (radians)
    const lat_avg_dd = A((this.max_y + this.min_y) / 2)
    const lat_avg = lat_avg_dd * (Math.PI / 180)
    if (debug) {
      // console.log(`lat_avg: ${lat_avg} dd ${lat_avg_dd} max_y ${this.max_y} min_y ${this.min_y}`)
    }
    // VICTOR: Earth's circumference in horizontal direction
    const circ_x = Math.cos(lat_avg) * circ_e
    if (debug) {
      // console.log(`circ_x: ${circ_x}`)
    }
    // VICTOR: Ratio between circumferences in x and y directions
    // const circ_rat = circ_y / circ_x
    // VICTOR: Ratio between extents in x and y directions
    // const xy_ratio = Math.abs(this.dist_x / (circ_rat * this.dist_y))

    if (this.ratio_wh < this.ratio_hw) {
      // map height is greater than map width

      // My original method
      // this.height = Math.abs(this.height * this.ratio_wh)

      // My updated method
      // Multiply ratio of circumference to ratio of canvas
      const ratio_wh_global = (circ_x / circ_y) * this.ratio_wh
      this.width = Math.abs(this.width * ratio_wh_global)

      // Victors method
      // this.width = 1 / this.xy_ratio * this.width

    } else {
      // map width is greater than map height

      // My original method
      // this.height = Math.abs(this.height * this.ratio_hw)

      // My updated method
      // Multiply ratio of circumference to ratio of canvas
      const ratio_hw_global = (circ_y / circ_x) * this.ratio_hw
      this.height = Math.abs(this.height * ratio_hw_global)

      // Victors method
      // this.height = 1 / this.xy_ratio * this.height

    }
  }

  toString = () => {
    return `
        width:${this.width} height:${this.height}\n        
        max_x:${this.max_x} min_x:${this.min_x}\n
        max_y:${this.max_y} min_y:${this.min_y}\n        
        dist_x:${this.dist_x} dist_y:${this.dist_y}\n
        ratio_wh:${this.ratio_wh} ratio_hw:${this.ratio_hw}\n                
        `
  }

}