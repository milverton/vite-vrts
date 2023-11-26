import * as THREE from 'three';


export class ThreeJsDisposer {

  /* CleanupScene traverses the whole scene that is passed in and disposes of each mesh,material ect... */
  /*  We need it because javascript is slow to dispose of memory, we need to do it manually */
  public static CleanupScene =  async (scene: THREE.Scene): Promise<boolean>  =>  {
    const objectsToRemove:any = [];

    // Traverse the scene and store objects to remove in an array
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        objectsToRemove.push(object);
      }
    });

    // Remove objects and dispose of their resources
    objectsToRemove.forEach((object:THREE.Mesh) => {
      scene.remove(object);

      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material: THREE.Material) => {
            material.dispose();
          });
        } else {
          if (object.material) object.material.dispose();
          object.material.dispose();
        }
      }
    });
    return Promise.resolve(true)
  }

  public static DisposeGeometry = async (geometry: THREE.Mesh): Promise<boolean> => {
    return new Promise((resolve, _) => {
      // Dispose of the geometry itself
      geometry.geometry.dispose();

      // Dispose of the associated material and its textures
      if (geometry.material) {
        if (Array.isArray(geometry.material)) {
          geometry.material.forEach((material) => {
            ThreeJsDisposer.DisposeMaterialProps(material).then(() => { resolve(true) });
          });
        }
        else {
          ThreeJsDisposer.DisposeMaterialProps(geometry.material).then(() => { resolve(true) })
        }
      }

      resolve(true)
    })
  }

  public static DisposeMaterial = (material:THREE.Material): Promise<boolean>  => {
    return new Promise((resolve, _) => {
      if(material){
        ThreeJsDisposer.DisposeMaterialProps(material).then(() => {
          resolve(true)
        })
      }
    })

  }

  public static RemoveFromScene = (scene:THREE.Scene, objectsToRemove: any): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      for (const object of objectsToRemove) {
        if (object instanceof THREE.Mesh) {
          // Remove the object from the scene
          scene.remove(object);

          // Dispose of the geometry and its associated resources
          Promise.all([
            ThreeJsDisposer.DisposeGeometry(object.geometry),
            ThreeJsDisposer.DisposeMaterial(object.material)
          ]).then(() => {
              // Dispose of any other resources associated with the object
              resolve(true)
            })
            .catch((err) => {
              reject(err)
          })
        }
      }
    })

  }


  private static DisposeMaterialProps = (material: any): Promise<boolean> => {
    return new Promise((resolve, _) => {
      if (material.map) {
        material.map.dispose();
      }

      if (material.lightMap) {
        material.lightMap.dispose();
      }

      if (material.bumpMap) {
        material.bumpMap.dispose();
      }

      if (material.normalMap) {
        material.normalMap.dispose();
      }

      if (material.specularMap) {
        material.specularMap.dispose();
      }

      if (material.envMap) {
        material.envMap.dispose();
      }

      if (material.alphaMap) {
        material.alphaMap.dispose();
      }

      if (material.aoMap) {
        material.aoMap.dispose();
      }

      if (material.emissiveMap) {
        material.emissiveMap.dispose();
      }

      if (material.gradientMap) {
        material.gradientMap.dispose();
      }

      if (material.displacementMap) {
        material.displacementMap.dispose();
      }

      if (material.metalnessMap) {
        material.metalnessMap.dispose();
      }

      if (material.roughnessMap) {
        material.roughnessMap.dispose();
      }

      material.dispose();
      resolve(true)
    })

  }
}








