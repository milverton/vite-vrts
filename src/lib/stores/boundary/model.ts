
import {BoundingBox} from "../../../core/bounding-box";
import {Meta} from "../../../core/meta.ts";

export class NewBoundary {
  constructor(
    public exterior_ring: number[][],
    public interior_ring: number[][][],
    public bounding_box: [number, number, number, number],
    public client: string,
    public block: string,
    public field: string,
  ) {

  }

  toObject() {
    return {
      outer: this.exterior_ring.map(x => [x[0], x[1]]),
      inner: this.interior_ring.map(line => line.map(x => [x[0], x[1]])),
      bbox: this.bounding_box,
      boundary: this.client,
      region: this.block,
      id: this.field,

    }
  }
}

export interface BoundariesState {
  meta: Meta | null
  boundary: NewBoundary[]
  hectares: number
  bbox: BoundingBox
}