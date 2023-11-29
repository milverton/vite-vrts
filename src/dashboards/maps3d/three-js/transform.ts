import {NewBoundary} from "../../../lib/stores/boundary/model";
import {scalePointWithBoundingBox} from "../../../lib/map";
import * as THREE from "three";
import {BoundingBox} from "../../../core/bounding-box";
// @ts-ignore
import {Result} from "true-myth/result";
// import {Bin, SiteSelection, SortedValue} from "../model";
import {LoadingMachine} from "../../../core/machine";
import {BoundaryElevationDto, threeJsStore} from "./components/MeshCreationMachine";

export interface BoundaryElevationData {
  lines: THREE.Line[]
  values: number[][]
}
export const BOUNDARY_HEIGHT_OFFSET = 2



export function convertBoundariesToLines(bbox:BoundingBox, boundaries: NewBoundary[], newBoundaries: BoundaryElevationDto[], minValue: number): BoundaryElevationData {
  // -------------------- Data Initialization
  let outerMaterial = new THREE.LineBasicMaterial({color: 0x00ff00})
  let innerMaterial = new THREE.LineBasicMaterial({color: 0xff0000})

  let lineBufferGeometries = []
  let innerBufferGeometries = []
  let allInnerValues = []
  let allOuterLines = []
  let allLineGeometries = []
  let allValues:number[][] = []

  // -------------------- Loop through each boundary
  for(let boundaryIdx = 0; boundaryIdx < boundaries.length; boundaryIdx++) {
    let currentBoundary = boundaries[boundaryIdx]
    let currentValue = newBoundaries[boundaryIdx]
    let outerPoints = []
    let outerValues = []

    // Loop through all outer points
    // --- Outer[]
    for(let outerBoundaryIdx = 0; outerBoundaryIdx < currentBoundary.exterior_ring.length; outerBoundaryIdx++) {
      let vector = currentBoundary.exterior_ring[outerBoundaryIdx]
      let value = Number.parseFloat(currentValue.outer[outerBoundaryIdx])
      let flattenedValue = value <= 0.05 ? 0 : value - minValue
      let scaledValue = scaleHeight(threeJsStore.userSettings.SquaredHeight, flattenedValue) + BOUNDARY_HEIGHT_OFFSET
      const [x, z] = scalePointWithBoundingBox(bbox, vector[0], vector[1])
      outerPoints.push(new THREE.Vector3(x, scaledValue, z))
      outerValues.push(flattenedValue)
    }
    // Set the outer points, and create geometries
    lineBufferGeometries.push(new THREE.BufferGeometry().setFromPoints(outerPoints))
    allOuterLines.push(outerValues)

    // Loop through all inner points
    // --- Inner[][]
    for(let innerBoundaryIdx = 0; innerBoundaryIdx < currentBoundary.interior_ring.length; innerBoundaryIdx++) {
      let innerBoundary = currentBoundary.interior_ring[innerBoundaryIdx]
      let innerValue = currentValue.inner[innerBoundaryIdx]
      let innerPoints = []
      let innerValues = []
      // --- Inner[]
      // Loop through all inner points of the inner points
      for(let innerPointIdx = 0; innerPointIdx < innerBoundary.length; innerPointIdx++) {
        let vector = innerBoundary[innerPointIdx]
        let value = Number.parseFloat(innerValue[innerPointIdx])
        let flattenedValue = value <= 0.05 ? 0 : value - minValue
        let scaledValue = scaleHeight(threeJsStore.userSettings.SquaredHeight, flattenedValue) + BOUNDARY_HEIGHT_OFFSET
        const [x, z] = scalePointWithBoundingBox(bbox, vector[0], vector[1])
        innerPoints.push(new THREE.Vector3(x, scaledValue, z))
        innerValues.push(flattenedValue)
      }
      // Set the inner points, and create geometries
      innerBufferGeometries.push(new THREE.BufferGeometry().setFromPoints(innerPoints))
      allInnerValues.push(innerValues)
    }
  }
  for(let i = 0; i < lineBufferGeometries.length; i++) {
    allLineGeometries.push(new THREE.Line(lineBufferGeometries[i], outerMaterial))
    allValues.push(allOuterLines[i])
  }
  for(let i = 0; i < innerBufferGeometries.length; i++) {
    allLineGeometries.push(new THREE.Line(innerBufferGeometries[i], innerMaterial))
    allValues.push(allInnerValues[i])
  }
  let data:BoundaryElevationData = {
    lines: allLineGeometries,
    values: allValues
  }
  return data
}






// export function generateSpriteFromText(text: number, position: THREE.Vector3): THREE.Sprite {
//   const [texture, width] = generateTextTexture(round(text, 2).toString())
//   const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
//     map: texture
//   }))
//   sprite.vertexColors = true
//
//   sprite.position.set(position.x, position.y, position.z)
//   sprite.scale.set(width, 2, 2)
//
//   ThreeJsDisposer.DisposeMaterial(sprite.material).then(() => {
//     return sprite
//   })
// }

// export function generateTextTexture(text: string): THREE.Texture {
//   let canvas = document.createElement('canvas');
//   let context = canvas.getContext('2d')
//   let font = "Helvetica",
//     size = 200,
//     color = "#0e0e0e";
//
//   font = "normal " + size + "px " + font;
//
//
//   context.font = font;
//
//   // get size data (height depends only on font size)
//   let metrics = context.measureText(text),
//     textWidth = metrics.width;
//
//   canvas.width = textWidth + 20;
//   canvas.height = size + 5;
//
//   context.font = font;
//   context.fillStyle = color;
//
//   context.fillText(text, 0, size + 3, canvas.width);
//
//   // canvas contents will be used for a texture
//   let texture = new THREE.Texture(canvas);
//   texture.needsUpdate = true;
//
//   return [texture, textWidth / 100]
// }
//





// draw3DHeightMap
// export const draw3DSiteSelection = (siteSelections: { [n: number]: any }, pointSize: number) => {
//
//   return (scene: THREE.Scene, bbox: BoundingBox, orbitControl: OrbitControls): Promise<CleanupFunction> => {
//     let sprites = []
//
//     const keys = Object.keys(siteSelections)
//     const objs = keys.map(k => siteSelections[k]).sort((a, b) => a.value - b.value)
//
//     for (let i = 0; i < objs.length; i++) {
//       const obj = objs[i]
//       const labels = `(Z${obj.bin + 1}) ${obj.value}`
//       const [texture, width] = generateTextTexture(labels)
//       const [x, y] = scalePointWithBoundingBox(bbox, obj.point[0], obj.point[1])
//
//       const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
//         map: texture
//       }))
//
//       let scale = new THREE.Vector3(width, 1, 1)
//       let multiplier = 25
//
//       sprite.scale.set(scale.x * multiplier / 2, scale.y * multiplier, scale.z * multiplier)
//       sprite.position.set(x, 50, y)
//
//       sprites.push(sprite)
//       scene.add(sprite)
//     }
//     return new Promise((resolve, reject) => {
//
//       if (!bbox.width || !keys.length) {
//         return reject(`check drawSiteSelection: ${bbox.width} ${keys.length}`)
//       }
//       const cleanup = () => {
//         for (let i = 0; i < sprites?.length; i++) {
//           ThreeJsDisposer.RemoveFromScene(scene, [sprites[i]]).then(_ => _)
//         }
//         sprites = []
//       }
//
//       resolve(cleanup)
//     })
//   }
// }
// export const draw3DPotentialSites = (coordinates: number[][], column: number[], filterMin: number, filterDiff: number, results: SortedValue[][], selectedBreakpoint: Bin, siteSelection:{[n:number]: SiteSelection}) => {
//   return (scene: THREE.Scene, bbox: BoundingBox, orbitControl: OrbitControls): Promise<CleanupFunction> => {
//     let sprites = []
//     if(!results){
//       return Promise.resolve(() => {})
//     }
//     // Generate sprite for values
//     for (let i = 0; i < results.length; i++) {
//       const potential = results[i]
//       const points = potential.map(potential => coordinates[potential.idx])
//       const shouldDisplay = potential.map(x => siteSelection[x.idx] === undefined? 0: 1).reduce((a, b) => a + b, 0) === 0
//       if (!shouldDisplay) {
//         continue
//       }
//       const together = `${i.toString()}`
//       const pointX = mean([points[0][0], points[points.length - 1][0]])
//       const pointY = mean([points[0][1], points[points.length - 1][1]])
//       const pointsTogether = [pointX, pointY]
//
//       const [texture, width] = generateTextTexture(together)
//
//       const [x, y] = scalePointWithBoundingBox(bbox, pointsTogether[0], pointsTogether[1])
//
//       const sprite = new THREE.Sprite(
//         new THREE.SpriteMaterial({
//           map: texture
//         }))
//
//       const scale = new THREE.Vector3(width, 1, 1)
//       const multiplier = 15
//
//       sprite.position.set(x, 20, y)
//       sprite.scale.set(scale.x * multiplier / 2, scale.y * multiplier, scale.z * multiplier)
//       sprites.push(sprite)
//       scene.add(sprite)
//     }
//
//     return new Promise((resolve, reject) => {
//       if (!bbox.width || !coordinates.length ) {
//         console.log("No data to draw - three-js/network.ts - draw3DPotentialSites - l-417")
//         return resolve(() => {})
//       }
//
//       const cleanup = () => {
//         try{
//           for(let i = 0; i < sprites?.length; i++) {
//             scene.remove(sprites[i])
//             ThreeJsDisposer.RemoveFromScene(scene, [sprites[i]]).then(_ => _)
//           }
//           sprites = []
//         } catch(e){
//           console.log("Error cleaning up sprites: ", e)
//         }
//
//       }
//
//       resolve(cleanup)
//     })
//   }
// }
export const MachinesHaveLoaded = (machines: LoadingMachine[]): boolean => {
  for(let i = 0; i < machines.length; i++){
    if(machines[i].value !== 'Loaded'){
      return false
    }
  }
  return true;
}

// export const draw3DMap = (mapImage, opacity) => {
//
//   return (scene: THREE.Scene, bbox: BoundingBox, orbitControl: OrbitControls): Promise<CleanupFunction> => {
//     return new Promise((resolve, reject) => {
//       if (!mapImage) {
//         reject('check drawImageUrl: no url')
//       }
//
//       const [minX, minY, maxX, maxY] = scaleBoundingBox(bbox, bbox.toArray() as [number, number, number, number])
//       const loader = new THREE.TextureLoader();
//       const texture = loader.load(mapImage.url)
//
//       const map = new THREE.Mesh(
//         new THREE.PlaneGeometry(maxX, maxY, 1, 1),
//         new THREE.MeshBasicMaterial({
//           map: texture,
//           transparent: true,
//           opacity: opacity,
//       }))
//
//       scene.add(map)
//       map.position.set(maxX / 2, -10, maxY / 2)
//       map.rotation.x = -Math.PI / 2
//       const cleanup = () => {
//         ThreeJsDisposer.RemoveFromScene(scene, [map.sprite]).then(_ => _)
//       }
//
//       resolve(cleanup)
//     })
//   }
// }

export const scaleHeight = (percentage:number, height:number) => {
  if(percentage <= 1){
    return height
  }
  const square = height * height

  return (square * percentage) / 100
}

// export const draw3DColumnValues = (cellSize:number, bbox: BoundingBox, scaledCoordinates, column) => {
//   // Generate cells
//   const [minX, minY, maxX, maxY] = scaleBoundingBox(bbox, bbox.toArray() as [number, number, number, number])
//
//   let generatedCells = generateSpritesGrid(cellSize, [minX, minY, maxX, maxY])
//   // Create textPoint data for all points
//   let pointData = generateTextData(scaledCoordinates, column, 4)
//   // Place all points into each cell
//   let orderedCells = placeTextInCells(pointData, generatedCells)
//   // Generate a bush for fast lookup of cell positions
//   let cellsBush = new PolyBush(orderedCells.map(p => [p.position.x, p.position.z]))
//
//
//   let activeList = []
//   const sub = new Subject<{scene, orbitControl}>()
//   sub
//     .pipe(
//       throttleTime(150),
//     )
//     .subscribe({
//       error: (err) => console.error("Update Cell RXJS Error", err),
//       next: ({scene,orbitControl}) => {
//         // const p = performance.now()
//         let newActiveList = updateCellsVisibility(
//           cellsBush,
//           orderedCells,
//           orbitControl.object.position,
//           100,
//           activeList,
//           scene
//         )
//         activeList = newActiveList
//       }
//     })
//
//   return (scene: THREE.Scene, bbox: BoundingBox, orbitControl): Promise<CleanupFunction> => {
//     orbitControl.addEventListener('change', () => {
//       sub.next({scene, orbitControl})
//     })
//     return new Promise((resolve, reject) => {
//
//       // visualizePoints(orderedCells.map(x => x.position), scene)
//
//       const cleanup = () => {
//         sub.unsubscribe()
//         orbitControl.removeEventListener('change', () => {})
//         orderedCells.forEach((cell) => {
//           cell.points.forEach((point) => {
//             if(point.sprite){
//               ThreeJsDisposer.RemoveFromScene(scene, [point.sprite.geometry]).then(_ => _)
//             }
//           })
//         })
//
//         orderedCells = undefined
//         cellsBush = undefined
//         activeList = undefined
//         generatedCells = undefined
//       }
//       resolve(cleanup)
//       //
//     })
//   }
// }


// export const mapLayersTo3DDrawFunctions = (props: DrawFunction3DArgs): Result<DrawFunction3D[], string> => {
//
//   let toDraw = []
//   let errors = []
//   let activeFunctions = props.layers.filter(x => x.active)
//   activeFunctions = activeFunctions.sort((a, b) => a.order - b.order)
//
//   for (let i = 0; i < activeFunctions.length; i++) {
//     const f = activeFunctions[i]
//     switch (f.id) {
//       case MapLayerIDs.Coordinates:
//         // if(props.scaledCoordinates.length){
//         //   toDraw.push(draw3DPoints(props.scaledCoordinates, props.column, props.paletteRGBHandler))
//         // }
//         break
//       case MapLayerIDs.Boundaries:
//         // toDraw.push(draw3DBoundaries(props.boundaries))
//         break
//       case MapLayerIDs.BBox:
//         // toDraw.push(drawBoundingBoxes(props.bbox, props.boundaries, 'black'))
//         break
//       case MapLayerIDs.InterpolatedMap:
//         // toDraw.push(draw3DMap(props.interpolatedMapUrl, props.interpolatedMapOpacity))
//         break
//       case MapLayerIDs.Headings:
//         // toDraw.push(draw3DHeading(props.scaledCoordinates, props.headingsPercentageToShow))
//         break
//       case MapLayerIDs.StartEnd:
//         // toDraw.push(draw3DStartEnd(props.scaledCoordinates))
//         break
//
//       case MapLayerIDs.SoilPoints:
//         break
//       case MapLayerIDs.SoilFusion:
//         // drawSoilFusion(bbox, soilCoordinates)
//         break
//       case MapLayerIDs.ColumnValues:
//         // if (props.column.length && props.scaledCoordinates.length) {
//         //     toDraw.push(draw3DColumnValues(50, props.bbox ,props.scaledCoordinates, props.column))
//         // }
//         break
//       case MapLayerIDs.PotentialSites:
//         // if (props.column.length && props.unscaledCoordinates.length) {
//         //     toDraw.push(draw3DPotentialSites(props.unscaledCoordinates,
//         //       props.column,
//         //       props.columnFilter.filterMin,
//         //       props.columnFilter.filterDiff,
//         //       props.columnFilter.locationsForSelectedBin,
//         //       props.selectedBreakpoint,
//         //       props.siteSelection
//         //     ))
//         // }
//         break
//       case MapLayerIDs.SelectedSites:
//         // toDraw.push(draw3DSiteSelection(props.siteSelection, props.selectedSitesPointSize))
//         break
//       case MapLayerIDs.HeightMap:
//         // if(props.column.length && props.scaledCoordinates.length){
//         //   toDraw.push(draw3DHeightMap(
//         //     props.bbox,
//         //     props.interpolatedMapUrl,
//         //     props.accentuateHeight,
//         //     props.scalePercentage,
//         //     props.interpolatedPoints,
//         //     props.meshResolution,
//         //     props.showSatellite,
//         //     props.interpolated3DMapOpacity
//         //   ))
//         // }
//         break
//       // case MapLayerIDs.InterpolationGPU:
//       //   if(props.column.length && props.scaledCoordinates.length){
//       //     toDraw.push(draw3DInterpolationGPU(props.bbox, props.scaledCoordinates, props.column, props.interpolatedMapUrl))
//       //   }
//     }
//   }
//   return Result.ok(toDraw)
// }