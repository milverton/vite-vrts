import {threeJsStore} from "./MeshCreationMachine";
import * as THREE from "three"
import {BOUNDARY_HEIGHT_OFFSET, scaleHeight} from "../transform";
import {boundaryStore} from "../../../../lib/stores/boundary/store";
import {InterpolatedIdx, MeshMaterials, ThreeJsComponent, WaterIdx} from "./ThreeJSStructure";

export const UpdateMeshWaterOpacity = (newThree: ThreeJsComponent) => {
  if (threeJsStore.mapSettings.WaterFlowUrl === "") {
    return
  }
  // ---------- UPDATE WATER OPACITY
  // @ts-ignore
  newThree.blockMesh.material[WaterIdx].opacity = threeJsStore.userSettings.WaterOpacity
  // @ts-ignore
  newThree.blockMesh.material[WaterIdx].needsUpdate = true
}
export const UpdateMeshWithInterpolatedMap = (newThree: ThreeJsComponent, interpolatedUrlPrivate: string) => {

  if(threeJsStore.userSettings.InterpolatedUrl !== ""){
    if(newThree.blockMesh == null) return;
    const material:THREE.Material[] = newThree.blockMesh.material as THREE.Material[]
    material[InterpolatedIdx].opacity = threeJsStore.userSettings.Opacity
    material[InterpolatedIdx].needsUpdate = true
  }
  if(interpolatedUrlPrivate !== threeJsStore.userSettings.InterpolatedUrl){
    // ------ SET INTERPOLATED TO MESH
    MeshMaterials.GetAllMaterialsUpdated().then((materials) => {
      if(newThree.blockMesh == null) return;
      newThree.blockMesh.material = materials
      // @ts-ignore
      newThree.blockMesh.material.needsUpdate = true
    })
  }
}

export const UpdateMeshWithWaterFlow = (newThree: ThreeJsComponent) => {
  // ------------- UPDATE MESH WITH WATER MAP ON LAST MATERIAL
  MeshMaterials.GetAllMaterialsUpdated().then((materials) => {
    if(newThree.blockMesh == null) return;
    newThree.blockMesh.material = materials
    for(let i = 0; i < newThree.blockMesh.material.length; i++){
      newThree.blockMesh.material[i].needsUpdate = true
    }
  })
}


export const LoadMesh = (newThree: ThreeJsComponent) => {
  return new Promise<string>((resolve, reject) => {
    const bbox = boundaryStore.bbox
    const interpolatedPoints = threeJsStore.basicState.InterpolatedData
    let xColumn = threeJsStore.basicState.XColumn-1
    let yColumn = threeJsStore.basicState.YColumn-1
    if(xColumn <= 0 || yColumn <= 0){
      xColumn = bbox.width / threeJsStore.userSettings.Resolution
      yColumn = bbox.height / threeJsStore.userSettings.Resolution
    }


    const geometry = new THREE.PlaneGeometry(bbox.width, bbox.height, xColumn, yColumn)
    // Just in case there is no elevation data
    if(interpolatedPoints.length === 0){
      for(let i = 0; i < geometry.attributes.position.count; i++){
        interpolatedPoints[i] = 0
      }
    }
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      geometry.attributes.position.setZ(i, scaleHeight(threeJsStore.userSettings.SquaredHeight, interpolatedPoints[i]))
    }
    // For making sure the lighting is not being calculated incorrectly
    geometry.computeVertexNormals()
    geometry.computeTangents()
    geometry.normalizeNormals()

    if (geometry.index !== null) {
      geometry.addGroup(0, geometry.index.count, 0)
      geometry.addGroup(0, geometry.index.count, 1)
      geometry.addGroup(0, geometry.index.count, 2)
    }
    geometry.attributes.position.needsUpdate = true

    MeshMaterials.GetAllMaterialsUpdated().then((materials) => {
      const mesh = newThree.CreateMesh(geometry, materials, bbox)
      newThree.AddMeshOutline(mesh ,bbox)
      resolve("Done")
    }).catch((err) => {
      console.log(err)
      reject(err)
    })
  })
}

export const UpdateMeshWithScaledPositions = (newThree: ThreeJsComponent, squaredHeight:number) => {
  // Making sure that there is data do change.
  if(squaredHeight !== threeJsStore.userSettings.SquaredHeight
    && threeJsStore.basicState.InterpolatedData.length > 0){
    if(newThree.blockMesh == null) return;
    const positionAttribute = newThree.blockMesh.geometry.getAttribute('position')
    for (let i = 0; i < positionAttribute.count; i++) {
      positionAttribute.setZ(i, scaleHeight(threeJsStore.userSettings.SquaredHeight, threeJsStore.basicState.InterpolatedData[i]))
    }
    positionAttribute.needsUpdate = true
    newThree.blockMesh.geometry.attributes.position.needsUpdate = true;
    newThree.blockMesh.geometry.computeVertexNormals()
  }
}

export const UpdateBoundariesWithScaledPositions = (newThree: ThreeJsComponent, squaredHeight:number, forceRun:boolean) => {
  // console.log("RUNNING UpdateBoundariesWithScaledPositions")
  if(forceRun || squaredHeight !== threeJsStore.userSettings.SquaredHeight){
    // console.log("RUNNING UpdateBoundariesWithScaledPositions IN FORCE RUN", threeJsStore.basicState.BoundaryElevationData)
    for(let lineIdx = 0; lineIdx < newThree.boundaries.length; lineIdx++){
      const elevationData = threeJsStore.basicState.BoundaryElevationData?.values[lineIdx] as unknown as []
      const line = newThree?.boundaries[lineIdx]
      const linePositionAttribute = line?.geometry?.attributes?.position?.array
      let pos = 0
      for (let i = 1; i < linePositionAttribute.length; i+=3) {
        const elevationValue:number = pos >= elevationData.length ? 0 : elevationData[pos]
        linePositionAttribute[i] = scaleHeight(threeJsStore.userSettings.SquaredHeight, elevationValue) + BOUNDARY_HEIGHT_OFFSET
        pos++
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
  }
}