import * as THREE from 'three'
import {BoundingBox} from "../../../core/bounding-box";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Vector3} from "three";

export class PointData {
    position: THREE.Vector3 | null
    value: number
    public sprite: THREE.Sprite | null
    constructor(_position: THREE.Vector3, _value: number, _sprite: THREE.Sprite) {
        this.position = _position
        this.value = _value
        this.sprite = _sprite
    }
}


export class Cell {
    position: THREE.Vector3
    isActive: boolean
    minX: number
    maxX: number
    minY: number
    maxY: number
    points: PointData[]
    hasGeneratedSprites: boolean

    constructor(_position: THREE.Vector3, _isActive: boolean, _points: PointData[], [minX, minY, maxX, maxY]: number[]) {
        this.position = _position
        this.isActive = false
        this.points = _points

        this.minX = minX
        this.maxX = maxX
        this.minY = minY
        this.maxY = maxY
        this.hasGeneratedSprites = false
    }

    setActivation(active: boolean) {
        this.isActive = active
        for (let i = 0; i < this.points.length; i++) {
            let point = this.points[i].sprite
            if (point == null) continue
            point.visible = active
        }
    }

    // Returns an array of sprites that need to be created
    loadPointsIntoText() {
        this.points.forEach(p => {
            if (p.sprite == null) {
                p.sprite = new THREE.Sprite()

            }
        })
        this.hasGeneratedSprites = true
    }

    clearPoints() {
        this.points.forEach(p => {
            if (p.sprite == null) return
            p.sprite.material.dispose()

            p.value = 0
            p.position = new Vector3(0, 0, 0)
        })
        this.points = []
    }

}

export class GridCell {
    public position: THREE.Vector3
    public value: number

    constructor(_position: THREE.Vector3, _value: number) {
        this.position = _position
        this.value = _value
    }

}



export const FetchRequests = {
    initialize: {url: "http://localhost:3001/api/v1/core/check", method: "GET"},
}

export interface MapLayerSelection {
    id: string
    name: string
    active: boolean
    order: number
}
export interface CleanupFunction {
    (): void
}
export interface MapLayersState {
    layers: MapLayerSelection[]
}

export interface DrawFunction2D {
    (ref: any, canvasScale: number, zoom:number,lineScale: number, pointScaleFn: (n: number) => number): Promise<null>
}

export interface DrawFunction3D {
    (scene: THREE.Scene, bbox: BoundingBox, orbitControl: OrbitControls): Promise<CleanupFunction>
}