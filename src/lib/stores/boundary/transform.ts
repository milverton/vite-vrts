import {NewBoundary} from "./model"
import CheapRuler, {Point} from "cheap-ruler";
import {sum} from "../../stats";
import {BoundingBox} from "../../../core/bounding-box";

export const boundaryToBoundingBox = (boundary: NewBoundary[]): BoundingBox => {
    const bb = new BoundingBox(0, 0)
    if (!boundary || boundary.length === 0) {
        return bb
    }
    for (let i = 0; i < boundary.length; i++) {
        const b = boundary[i]
        const [minX, minY, maxX, maxY] = b.bounding_box
        bb.update(minX, minY)
        bb.update(maxX, maxY)
    }
    bb.adjustDimensions()
    return bb
}

export const getCenterPointForBoundary = (boundary: NewBoundary[]): number[] => {

    const points = []
    for (let i = 0; i < boundary.length; i++) {
        const b = boundary[i]
        let x = 0
        let y = 0
        for (let j = 0; j < b.exterior_ring.length; j++) {
            const c = b.exterior_ring[j]
            x += c[0]
            y += c[1]
        }
        points.push([x / b.exterior_ring.length, y / b.exterior_ring.length])
    }
    let x = 0
    let y = 0
    for (let i = 0; i < points.length; i++) {
        const p = points[i]
        x += p[0]
        y += p[1]
    }
    return [x / points.length, y / points.length]
}

export const boundaryToFeatureCollection = (boundary: NewBoundary): any => {

    const properties = {BOUNDARY: boundary.client, REGION: boundary.block, ID: boundary.field}
    const feature = {
        bbox: [...boundary.bounding_box],
        type: 'Polygon',
        coordinates: [boundary.exterior_ring.map(x => [x[0], x[1]]), ...boundary.interior_ring.map(i => i.map(x => [x[0], x[1]]))]
    }
    return {
        type: 'Feature',
        properties,
        geometry: feature
    }
}


const cheapRulerArea = (points: number[][]) => {
    const bbox = new BoundingBox(0, 0)
    bbox.updateWithPoints(points)
    const lat = (bbox.min_y + bbox.max_y) / 2
    const ruler = new CheapRuler(lat, 'meters')
    const pA = points.map(p => [p[0], p[1]])
    return ruler.area([pA] as Point[][])
}

export const boundaryGetHectares = (boundary: Array<NewBoundary>) => {
    let total = 0
    for (let b of boundary) {
        total += cheapRulerArea(b.exterior_ring)
        total -= sum(b.interior_ring.map(x => cheapRulerArea(x)))
    }
    return total / 10000
}

