import {Vector, vectorDistance} from "../../../core/vector";
import CheapRuler from "cheap-ruler";
import {mean} from "../../../lib/stats";


export function pointGridFromUnscaled(bbox: number[], cell_side: number): number[][] {
  if (bbox.length !== 4) {
    throw new Error('bbox must be an array of length 4')
  }
  const west = bbox[0]
  const south = bbox[1]
  const east = bbox[2]
  const north = bbox[3]
  const cheapRuler = new CheapRuler(mean([south,north]), 'meters')
  const x_fraction = cell_side / cheapRuler.distance([west, south], [east, south])
  // const x_fraction = cell_side / vectorDistance(new Vector(west, south), new Vector(east, south))
  const cell_width = x_fraction * (east - west)
  const y_fraction = cell_side / cheapRuler.distance([west, south], [west, north])
  // const y_fraction = cell_side / vectorDistance(new Vector(west, south), new Vector(west, north))
  const cell_height = y_fraction * (north - south)

  const bbox_width = east - west
  const bbox_height = north - south
  const columns = Math.floor((bbox_width / cell_width))
  const rows = Math.floor((bbox_height / cell_height))

  const delta_x = (bbox_width - columns * cell_width) / 2.0
  const delta_y = (bbox_height - rows * cell_height) / 2.0

  const grid: Array<Array<number>> = new Array<Array<number>>()
  let current_x = west + delta_x
  while (current_x < east) {
    let current_y = south + delta_y
    while (current_y < north) {
      grid.push([current_x, current_y])
      current_y += cell_height
    }
    current_x += cell_width
  }

  return grid
}

export function pointGridFromScaled(bbox: number[], cell_side: number): number[][] {
  if (bbox.length !== 4) {
    throw new Error('bbox must be an array of length 4')
  }
  const west = bbox[0]
  const south = bbox[1]
  const east = bbox[2]
  const north = bbox[3]
  const x_fraction = cell_side / vectorDistance(new Vector(west, south), new Vector(east, south))
  const cell_width = x_fraction * (east - west)
  const y_fraction = cell_side / vectorDistance(new Vector(west, south), new Vector(west, north))
  const cell_height = y_fraction * (north - south)

  // console.log(x_fraction, y_fraction, cell_width, cell_height)

  const bbox_width = east - west
  const bbox_height = north - south
  const columns = Math.floor((bbox_width / cell_width))
  const rows = Math.floor((bbox_height / cell_height))

  const delta_x = (bbox_width - columns * cell_width) / 2.0
  const delta_y = (bbox_height - rows * cell_height) / 2.0

  const grid: Array<Array<number>> = new Array<Array<number>>()
  let current_x = west + delta_x
  while (current_x < east) {
    let current_y = south + delta_y
    while (current_y < north) {
      grid.push([current_x, current_y])
      current_y += cell_height
    }
    current_x += cell_width
  }

  return grid
}