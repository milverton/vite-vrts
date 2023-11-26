import * as THREE from "three";
import {BoundingBox} from "../../../../core/bounding-box";

export class MeshContext {

  // ------ DATA COLLECTION ------
  public bbox: BoundingBox
    // ------ SATELLITE STATE ------
    | undefined

  // ------ SATELLITE STATE ------
  public satelliteTexture: THREE.Texture | undefined


  constructor() {}
  public setSatelliteTexture(texture: THREE.Texture | undefined){
    this.satelliteTexture = texture
  }
}

// class DataCollection implements IMeshCreationStep {
//
//   execute = async (): Promise<boolean> => {
//     return new Promise((resolve, _reject) => {
//
//
//       resolve(true)
//     })
//   }
// }

// class SatelliteLoading implements IMeshCreationStep {
//
//   execute = async (): Promise<boolean> => {
//     return new Promise((resolve, reject) => {
//
//
//
//       resolve(true)
//     })
//   }
// }
//
// export class MeshCreationPipeline {
//   meshContext: MeshContext
//   steps: IMeshCreationStep[]
//
//   constructor(meshContext: MeshContext) {
//     this.meshContext = meshContext
//     this.steps = []
//
//     this.steps.push(new DataCollection())
//
//   }
//
//
//   public Execute = async () => {
//     for(let i:number = 0; i < this.steps.length; i++) {
//       const result = await this.steps[i].execute()
//       if(!result) {
//         return false
//       }
//     }
//     return true
//   }
//
//
// }