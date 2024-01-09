import {useEffect, useRef, useState} from 'react'
import {classNames} from "../../../lib/common";
import {MachinesHaveLoaded} from "./transform";
import {useLoadMachineState} from "../../../core/machine";
import {
  threeJsHeightMachine,
  threeJsSatelliteMachine,
  threeJsSceneSettingsMachine,
  threeJsStore,
  threeJsUserSettingsMachine,
  threeJsWaterFlowMachine
} from "./components/MeshCreationMachine";
import {
  LoadMesh,
  UpdateBoundariesWithScaledPositions,
  UpdateMeshWaterOpacity,
  UpdateMeshWithInterpolatedMap,
  UpdateMeshWithScaledPositions,
  UpdateMeshWithWaterFlow
} from "./components/MeshUpdates";
import {ThreeJsComponent} from "./components/ThreeJSStructure";
import {boundaryStore} from "../../../lib/stores/boundary/store";


export const ThreeJs = ({width, height, className} : {width: number, height: number, className: string}) => {
  const satelliteTime = useLoadMachineState(threeJsSatelliteMachine)
  const heightTime = useLoadMachineState(threeJsHeightMachine)
  const userTime = useLoadMachineState(threeJsUserSettingsMachine)
  const waterTime = useLoadMachineState(threeJsWaterFlowMachine)
  const sceneTime = useLoadMachineState(threeJsSceneSettingsMachine)

  const [newThree, setThreeJs] = useState<ThreeJsComponent>(new ThreeJsComponent())
  const [interpolatedUrlPrivate, setInterpolatedUrlPrivate] = useState("")
  const [waterOpacityPrivate, setWaterOpacityPrivate] = useState(threeJsStore.userSettings.WaterOpacity)

  const [squaredHeight, setSquaredHeight] = useState(5)
  const [showBoundaries, setShowBoundaries] = useState(false)

  const canvasRef = useRef(null);
  let canvas:HTMLElement | null


  useEffect(() => {
    window.addEventListener('resize', onWindowResize, false);

    return () => {
      window.removeEventListener('resize', onWindowResize, false);
    }
  }, []);

  function onWindowResize() {
    if (newThree.camera === undefined) return
    newThree.camera.aspect = window.innerWidth / window.innerHeight;
    newThree.camera.updateProjectionMatrix();
    if (!newThree.renderer) return;
    newThree.renderer?.setSize(window.innerWidth, window.innerHeight);
  }

  // SCENE SETTINGS ----
  useEffect(() => {
    try{
      canvas = canvasRef.current
      if(canvas === null) {
        console.error(`Could not find canvas element`)
        return () => {}
      }
      newThree.UpdateWithRenderer(width, height, canvas as HTMLCanvasElement)

      setThreeJs(newThree)
    } catch (e) {

      console.log(e)
      return () => {}
    }

    return() => {
      newThree.ClearScene()
      newThree.controls?.dispose()
      newThree.renderer?.dispose()
      newThree.renderer?.renderLists?.dispose()

      if (newThree.blockMesh) {
        newThree.blockMesh.geometry.dispose();
        // If material is an array, dispose each one
        // if (Array.isArray(newThree.blockMesh.material)) {
        //   newThree.blockMesh.material.forEach(material => material.dispose());
        // }
        newThree.scene.remove(newThree.blockMesh);
        newThree.blockMesh = null; // Dereference the mesh
      }
      newThree.renderer = undefined;
      newThree.camera = undefined;
      newThree.controls = undefined;
      newThree.sceneObjects = [];


    }
  },[])

  useEffect(() => {
    const animate = () => {
      if(newThree.camera === undefined) return
      newThree.renderer?.render(newThree.scene, newThree.camera)
      requestAnimationFrame(animate)
      newThree.controls?.update()
    }
    animate()

    return () => {
      // cancelAnimationFrame(0);
      // Remove the renderer
      const rendererDomElement = newThree?.GetDomElement();

      // Check if rendererDomElement is actually a child of canvas
      if (canvas && rendererDomElement && canvas === rendererDomElement.parentNode) {
        canvas.removeChild(rendererDomElement);
      }
      newThree.ClearScene()
      newThree.controls?.dispose()
      newThree.renderer?.dispose()
      newThree.renderer?.renderLists?.dispose()

      if (newThree.blockMesh) {
        newThree.blockMesh.geometry.dispose();
        // If material is an array, dispose each one
        if (Array.isArray(newThree.blockMesh.material)) {
          newThree.blockMesh.material.forEach(material => material?.dispose());
        }
        newThree.scene.remove(newThree.blockMesh);
        newThree.blockMesh = null; // Dereference the mesh
      }


      newThree.renderer = undefined;
      newThree.camera = undefined;
      newThree.controls = undefined;
      newThree.sceneObjects = [];


    }
  }, [newThree])

  useEffect(() => {
    if(newThree.controls === undefined) return
    newThree.controls.autoRotateSpeed = threeJsStore.sceneSettings.autoRotateSpeed
    newThree.UpdateSun(threeJsStore.sceneSettings.sunAngle, threeJsStore.sceneSettings.sunHeight)
  },[sceneTime])

  /* This updates the mesh when the user selects an interpolated map */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine]))return
    if(newThree.blockMesh === null) return

    UpdateMeshWithInterpolatedMap(newThree, interpolatedUrlPrivate)
    setInterpolatedUrlPrivate(threeJsStore.userSettings.InterpolatedUrl)
  },[userTime])

  /* This updates the mesh when the user changes the opacity of the water */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine]))return
    if(newThree.blockMesh === null) return
    if(waterOpacityPrivate === threeJsStore.userSettings.WaterOpacity) return

    UpdateMeshWaterOpacity(newThree)
    setWaterOpacityPrivate(threeJsStore.userSettings.WaterOpacity)
  },[userTime])

  /* This updates the mesh with a water flow map once the server has sent back the data */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine, threeJsWaterFlowMachine])) return
    if(newThree.blockMesh === null) return

    UpdateMeshWithWaterFlow(newThree)
  },[waterTime])

  /* This updates the mesh when the user changes the height of the mesh */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine]))return
    if(!newThree.isInitialized) return
    if(newThree.blockMesh === null) return


    UpdateMeshWithScaledPositions(newThree, squaredHeight)
    setSquaredHeight(threeJsStore.userSettings.SquaredHeight)
    // Just in case we cant get boundary data for the farm.
    if(threeJsStore.basicState.BoundaryElevationData === null) return
    if(threeJsStore.userSettings.ShowBoundaries || showBoundaries){
      UpdateBoundariesWithScaledPositions(newThree, squaredHeight,false)
    }

  }, [userTime])

  /* This updates the mesh when the user changes the boundaries */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine])) return
    if(!newThree.isInitialized) return
    if(newThree.blockMesh === null) return
    if(threeJsStore.basicState.BoundaryElevationData === null) return;

    if(threeJsStore.userSettings.ShowBoundaries as boolean === showBoundaries as boolean) return
    if(threeJsStore.userSettings.ShowBoundaries){
      newThree.RemoveBoundaries()
      newThree.AddBoundaries(boundaryStore.bbox, threeJsStore.basicState.BoundaryElevationData.lines)
      UpdateBoundariesWithScaledPositions(newThree, squaredHeight,true)
      setShowBoundaries(true)
      return;
    }

    newThree.RemoveBoundaries()
    setShowBoundaries(false)
  }, [userTime])

  /* This updates the mesh when the user wants to generate a new map or higher resolution mesh */
  useEffect(() => {
    if(!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine])) return
    if(!newThree.isInitialized) return

    newThree.ClearScene()
    LoadMesh(newThree).then(() => {
      newThree.UpdateCameraPosition(boundaryStore.bbox)
      if(threeJsStore.userSettings.ShowBoundaries){
        if(threeJsStore.basicState.BoundaryElevationData === null) return;
        newThree.AddBoundaries(boundaryStore.bbox, threeJsStore.basicState.BoundaryElevationData?.lines)
        UpdateBoundariesWithScaledPositions(newThree, squaredHeight, true)
        UpdateMeshWithScaledPositions(newThree, threeJsStore.userSettings.SquaredHeight)
        setSquaredHeight(threeJsStore.userSettings.SquaredHeight)
      }
    })
  }, [satelliteTime, heightTime])



  return (
      <canvas ref={canvasRef} className={classNames(className) + ' justify-start'}></canvas>
  )
}


export default ThreeJs


