import {useEffect, useState} from 'react'
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

  // SCENE SETTINGS ----
  useEffect(() => {
    try{
      let canvas = document.getElementById("three-js")
      newThree.UpdateWithRenderer(width, height, canvas)

      setThreeJs(newThree)
    } catch (e) {

      console.log(e)
      return () => {}
    }

    return() => {
      newThree.renderer?.dispose()
    }
  },[])

  useEffect(() => {
    const animate = () => {
      // @ts-ignore
      newThree.renderer?.render(newThree.scene, newThree.camera)
      requestAnimationFrame(animate)
      newThree.controls?.update()
    }
    animate()
  }, [newThree])

  useEffect(() => {
    // @ts-ignore
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

    newThree.ClearScene().then(() => {
      // Once the scene is cleared, load the new mesh
      LoadMesh(newThree).then(() => {
        newThree.UpdateCameraPosition(boundaryStore.bbox)
        if(threeJsStore.userSettings.ShowBoundaries){
          if(threeJsStore.basicState.BoundaryElevationData === null) return;
          newThree.AddBoundaries(boundaryStore.bbox, threeJsStore.basicState.BoundaryElevationData?.lines)
          UpdateBoundariesWithScaledPositions(newThree, squaredHeight, true)
        }
      })

    })
  }, [satelliteTime, heightTime])



  return (
      <canvas id="three-js" className={classNames(className) + ' justify-start'}></canvas>
  )
}


export default ThreeJs


