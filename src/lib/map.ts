
import {BoundingBox} from "../core/bounding-box";



enum BoundingBoxOrder {
  MinX,
  MinY,
  MaxX,
  MaxY
}


export const scalePoint = (bb: Array<number>, x: number, y: number, dist_x: number, dist_y: number, width: number, height: number): [number, number] => {
  // Logic is:
  // 1. get x,y distance from the boundary (max)
  // 2. scale according to the ratio of the canvas and the max x and y distances
  // 3. subtract max canvas width/height from our scaled x/y

  // My original python method
  // const real_distance_of_x = bb.max_x - x
  // const real_distance_of_y = bb.max_y - y
  // const scaled_distance_of_x = real_distance_of_x * bb.ratio_x
  // const scaled_distance_of_y = real_distance_of_y * bb.ratio_y
  // const adjusted_x = bb.width - scaled_distance_of_x
  // const adjusted_y = bb.height - scaled_distance_of_y


  // const real_distance_of_x = x - bb.min_x
  // const real_distance_of_y = y - bb.min_y
  // const scaled_distance_of_x = real_distance_of_x / bb.dist_x
  // const scaled_distance_of_y = real_distance_of_y / bb.dist_y
  // const adjusted_x = scaled_distance_of_x * bb.width
  // const adjusted_y = scaled_distance_of_y * bb.height

  // Victors method
  const real_distance_of_x = x - bb[BoundingBoxOrder.MinX]
  const real_distance_of_y = y - bb[BoundingBoxOrder.MinY]
  const scaled_distance_of_x = real_distance_of_x / dist_x
  const scaled_distance_of_y = real_distance_of_y / dist_y
  const adjusted_x = scaled_distance_of_x * width
  const adjusted_y = scaled_distance_of_y * height

  // Invert y or the map will be upside down
  // return [adjusted_x, Math.abs(adjusted_y - height)]
  return [adjusted_x, Math.abs(adjusted_y - height)]
}

export const unScalePoint = (bb: Array<number>, x: number, y: number, dist_x: number, dist_y: number, width: number, height: number): [number, number] => {

  const adjusted_x = x / width * dist_x
  const adjusted_y = (height - y) / height * dist_y // FIXME: Is this the best approach for a negative latitude?
  return [adjusted_x + bb[BoundingBoxOrder.MinX], adjusted_y + bb[BoundingBoxOrder.MinY]]
}

export const scalePointWithBoundingBox = (bb: BoundingBox, x: number, y: number): [number, number] => {
  return scalePoint(bb.toArray(), x, y, bb.dist_x, bb.dist_y, bb.width, bb.height)
}


// Takes a bbox array and scales it
export const scaleBoundingBox = (bbox: BoundingBox, targetBbox: [number, number, number, number]): [number, number, number, number] => {
  const [minX, minY] = scalePointWithBoundingBox(bbox, targetBbox[0], targetBbox[3])
  const [maxX, maxY] = scalePointWithBoundingBox(bbox, targetBbox[2], targetBbox[1])
  return [minX, minY, maxX, maxY]
}