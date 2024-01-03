import {useEffect, useRef, useState} from "react"
import {BoundingBox} from "../../core/bounding-box";
import ThreeJs from "./three-js/view";
import {soilStore} from "../../lib/stores/soil/store";
import {LoadingEvent, useLoadMachinesState, useLoadMachineState} from "../../core/machine";
import {metaClientMachine, metaStore} from "../../lib/stores/meta/store";
import {Bars3BottomLeftIcon, Bars3Icon} from "@heroicons/react/24/solid";
import {StringSelect} from "../../components/string-select/view";
import {soilUIStore} from "../soil/store";
import {classNames} from "../../lib/common";
import {NumberInput} from "../../components/number-input/view";
import {
  threeJsHeightMachine,
  threeJsSatelliteMachine,
  threeJsSceneSettingsMachine,
  threeJsStore,
  threeJsUserSettingsMachine,
  threeJsWaterFlowMachine
} from "./three-js/components/MeshCreationMachine";
import {boundaryMachine} from "../../lib/stores/boundary/machines";
import {LoadButton} from "../../components/loading-button/view";
import {MachinesHaveLoaded} from "./three-js/transform";
import {GetWaterStatus, WaterStatus} from "./three-js/components/MachineStatusVisuals";
import {boundaryStore} from "../../lib/stores/boundary/store";
import {ThreeMapMenu} from "./components/ThreeMapMenu";
import {HeightLayer} from "../map/components/height-layer";

let CANVAS_WIDTH: number = 1400
let CANVAS_HEIGHT: number = 900

const Maps3D = () => {
  useLoadMachinesState([metaClientMachine])
  const pTime = useLoadMachineState(boundaryMachine)
  const satelliteTime = useLoadMachineState(threeJsSatelliteMachine)
  const heightTime = useLoadMachineState(threeJsHeightMachine)
  const waterSimTime = useLoadMachineState(threeJsWaterFlowMachine)
  const [_, setCanvasSize] = useState([CANVAS_WIDTH, CANVAS_HEIGHT])
  const threeJs = useRef<HTMLDivElement>(null)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Store
  const client = metaStore.client
  const block = client.unwrapOr(null)?.block()
  const season: number | undefined = client.unwrapOr(null)?.season()
  // const season = metaStore.seasonSelected

  const [opacity, setOpacity] = useState(threeJsStore.userSettings.Opacity)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showMapLayers, setShowMapLayers] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(threeJsStore.userSettings.ShowBoundaries)
  const [showSatellite, setShowSatellite] = useState(threeJsStore.userSettings.ShowSatellite)
  const [satelliteScaleUp, _setSatelliteScaleUp] = useState(threeJsStore.userSettings.SatelliteScaleUp)
  // ---- WATER STATE
  const [waterTime, _setWaterTime] = useState(Date.now())
  const [waterWeight, setWaterWeight] = useState(threeJsStore.userSettings.WaterWeight)
  const [iterations, setIterations] = useState(threeJsStore.userSettings.Iterations)
  const [waterSamples, setWaterSamples] = useState(threeJsStore.userSettings.WaterSamples)
  const [waterRadius, setWaterRadius] = useState(threeJsStore.userSettings.WaterRadius)
  const [waterResolution, setWaterResolution] = useState(threeJsStore.userSettings.WaterResolution)
  const [waterOpacity, setWaterOpacity] = useState(threeJsStore.userSettings.WaterOpacity)
  const mapMenu = soilUIStore.toolbarState.mapMenu

  const [showWaterMenu, setShowWaterMenu] = useState(false)
  const [showGeneral, setShowGeneral] = useState(true)
  const [showSceneSettings, setShowSceneSettings] = useState(false)
  // ---- CAMERA STATE
  const [rotateSpeed, setRotateSpeed] = useState(threeJsStore.sceneSettings.autoRotateSpeed)
  const [sunAngle, setSunAngle] = useState(threeJsStore.sceneSettings.sunAngle)
  const [sunHeight, setSunHeight] = useState(threeJsStore.sceneSettings.sunHeight)

  const [machinesLoading, setMachinesLoading] = useState([])
  const emptySelection = {menuName: "NA", menuType: -1}
  const [selectedMap, setSelectedMap] = useState(emptySelection)
  const [simpleMode, setSimpleMode] = useState(true)


  const [mapVariant, setMapVariant] = useState(soilUIStore.toolbarState.mapVariant)


  useEffect(() => {
    threeJsSceneSettingsMachine.service.send(LoadingEvent.Update,{
        autoRotateSpeed: rotateSpeed,
        sunAngle: sunAngle,
        sunHeight: sunHeight
    })
  }, [rotateSpeed, sunAngle, sunHeight])

  const handleValue = (event: any, func: any) => {
    func(parseFloat(event.target.value))
  }

  useEffect(() => {
    let loading = [WaterStatus.loading]
    loading[0] = GetWaterStatus(threeJsWaterFlowMachine)

    if (threeJsWaterFlowMachine.value === 'Empty') {
      setIsSimulating(false)
    }
    // @ts-ignore

    if (threeJsWaterFlowMachine.value === 'Loading') {
      setIsSimulating(true)
    }
    if (threeJsWaterFlowMachine.value === 'Loaded') {
      setIsSimulating(false)
    }
    // @ts-ignore
    setMachinesLoading(loading)

  }, [waterTime, waterSimTime])

  useEffect(() => {
    let mapUrl = soilStore.maps.soilMapUrls[selectedMap.menuName]?.url(mapVariant)
    if (mapUrl === undefined) mapUrl = ""

    threeJsUserSettingsMachine.service.send(LoadingEvent.Update,{

        weight: threeJsStore.userSettings.Weight,
        resolution: threeJsStore.userSettings.Resolution,
        radius: threeJsStore.userSettings.Radius,
        samples: threeJsStore.userSettings.Samples,
        squaredHeight: threeJsStore.userSettings.SquaredHeight,
        showSatellite: showSatellite,
        interpolatedUrl: mapUrl,
        opacity: opacity,
        waterWeight: waterWeight,
        iterations: iterations,
        waterResolution: waterResolution,
        waterOpacity: waterOpacity,
        waterSamples: waterSamples,
        waterRadius: waterRadius,
        showBoundaries: showBoundaries,
        satelliteScaleUp: satelliteScaleUp,
    })
  }, [selectedMap, opacity, waterWeight, iterations, waterResolution, waterOpacity, showBoundaries, satelliteScaleUp, mapVariant])

  useEffect(() => {
    if (threeJsStore.basicState.Bbox === boundaryStore.bbox) {
      return
    }
    threeJsSatelliteMachine.reset()
    threeJsSatelliteMachine.service.send(LoadingEvent.Load, {
        block: block as string,
        bbox: boundaryStore.bbox as BoundingBox,
        showSatellite: showSatellite,

    })
    threeJsHeightMachine.reset()
    threeJsHeightMachine.service.send(LoadingEvent.Load, {
        dealer: client.unwrapOr(null)?.dealer() as string,
        client: client.unwrapOr(null)?.client() as string,
        block: block as string,
        season: season,
        weight: threeJsStore.userSettings.Weight,
        resolution: threeJsStore.userSettings.Resolution,
        radius: threeJsStore.userSettings.Radius,
        samples: threeJsStore.userSettings.Samples,
    })
    threeJsWaterFlowMachine.reset()
  }, [pTime])

  const waterSim = () => {
    threeJsWaterFlowMachine.reset()
    threeJsWaterFlowMachine.service.send(LoadingEvent.Load,{
        dealer: client.unwrapOr(null)?.dealer() as string,
        client: client.unwrapOr(null)?.client() as string,
        block: block as string,
        season: season,
        iterations: iterations,
        waterWeight: waterWeight,
        waterResolution: waterResolution,
        waterSamples: waterSamples,
        waterRadius: waterRadius,
    })
    let loading = [WaterStatus.loading]
    loading[0] = GetWaterStatus(threeJsWaterFlowMachine)
    // @ts-ignore
    setMachinesLoading(loading)
    return setIsSimulating(true)
  }
  useEffect(() => {
    threeJsSatelliteMachine.reset()
    threeJsSatelliteMachine.service.send(LoadingEvent.Load,{
        block: block as string,
        bbox: boundaryStore.bbox as BoundingBox,
        showSatellite: showSatellite,
    })
  }, [showSatellite])

  useEffect(() => {
    //TODO - Review machine loading
    if (!MachinesHaveLoaded([threeJsSatelliteMachine, threeJsHeightMachine])) return;
    let mapUrl = soilStore.maps.soilMapUrls[selectedMap.menuName]?.url(mapVariant)
    if (mapUrl === undefined) mapUrl = ""

    threeJsUserSettingsMachine.service.send(LoadingEvent.Update,{
        weight: threeJsStore.userSettings.Weight,
        resolution: threeJsStore.userSettings.Resolution,
        radius: threeJsStore.userSettings.Radius,
        samples: threeJsStore.userSettings.Samples,
        squaredHeight: threeJsStore.userSettings.SquaredHeight,
        showSatellite: showSatellite,
        interpolatedUrl: mapUrl,
        opacity: opacity,
        waterWeight: threeJsStore.userSettings.WaterWeight,
        iterations: threeJsStore.userSettings.Iterations,
        waterResolution: threeJsStore.userSettings.WaterResolution,
        waterOpacity: threeJsStore.userSettings.WaterOpacity,
        waterSamples: threeJsStore.userSettings.WaterSamples,
        waterRadius: threeJsStore.userSettings.WaterRadius,
        showBoundaries: showBoundaries,
    })
  }, [satelliteTime, heightTime])
  useEffect(() => {

    return setCanvasSize([
      // @ts-ignore
      threeJs.current.clientWidth,
      // @ts-ignore
      threeJs.current.clientHeight
    ])
  }, [windowSize])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='overflow-hidden w-full h-full'>
      <div
        className="flex overflow-hidden flex-col justify-between text-gray-700 h-full w-screen relative space-x-4">
        <header className="flex bg-gray-100 h-20 w-screen min-h-[75px] top-16 sticky">
          <button className="flex items-center justify-center bg-gray-100 h-full w-[4.5rem]"
                  onClick={(_) => setShowMapLayers(!showMapLayers)}>{
            showMapLayers ? <Bars3BottomLeftIcon
                className="flex bg-gray-50 hover:bg-gray-200 p-5 w-[4.5rem] drop-shadow-md h-full justify-center"/> :
              <Bars3Icon className="flex hover:bg-gray-200 p-5 w-[4.5rem] h-full justify-center"/>
          }</button>
          <h1 className="flex self-center mb-1 ml-6 font-medium text-2xl ">
            {
              block ?
                block :
                "No Client"
            }
          </h1>

          <div className="flex absolute overflow-y-scroll scroll-auto flex-col drop-shadow-sm min-w-[375px] max-h-[800px] max-w-[500px] mt-[4.6rem]">
            <div
              className={classNames("border-r-[1px] border-b-[1px] border-gray-200 p-4 bg-gray-50", showMapLayers ? '' : 'hidden')}>
              <div className='flex justify-between align-middle'>
                <ThreeMapMenu class={'w-full'} Title={"General Settings"} Machines={[]} State={showGeneral}
                              SetState={setShowGeneral}/>
                <button
                  className="p-2 my-2 w-[8rem] border-l-[1px] border-b-[1px] border-gray-200 bg-gray-100 hover:bg-gray-200"
                  onClick={_ => setSimpleMode(!simpleMode)}>
                  <legend className="text-gray-700 text-sm font-medium">{simpleMode ? "Simple" : "Advanced"}</legend>
                </button>
              </div>
              {
                showGeneral ?
                  <div className="w-full mt-4">
                    <div className="flex flex-row m-0 w-full justify-between">
                      <div className="lbl-ring-outer mb-1 w-1/2">
                        <label htmlFor="map" className="lbl-sm lbl-ring-inner">Map Variant</label>
                        <StringSelect name={'map'} className={'text-xs w-full rounded border-gray-200'} menu={soilUIStore.toolbarState.mapVariants}
                                      selected={mapVariant} setSelected={setMapVariant}/>
                      </div>
                      <div className="lbl-ring-outer mb-1 w-52">
                        <label htmlFor="map" className="lbl-sm lbl-ring-inner">Map</label>
                        <StringSelect name={'map'} className={'text-xs w-full rounded border-gray-200'} menu={mapMenu}
                                      selected={selectedMap} setSelected={setSelectedMap}/>
                      </div>
                    </div>
                    <div className="lbl-ring-outer mb-1">
                      <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Map Opacity</label>
                      <input className="w-full" id={'opacity'} type="range" min={0} max={1} value={opacity}
                             onInput={e => handleValue(e, setOpacity)} step={0.001}/>
                    </div>
                    <div className="lbl-ring-outer mb-1 flex justify-between items-center">
                      <label htmlFor="difference" className="text-sm">Show Boundaries</label>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={showBoundaries}
                        onChange={_ => {
                          return setShowBoundaries(!showBoundaries)
                        }}
                      />
                    </div>
                    <div className='flex space-x-2'>
                      {/*<div className="lbl-ring-outer px-4 space-x-2 mb-1 flex justify-between items-center">*/}
                      {/*  <label htmlFor="difference" className="text-sm">4x</label>*/}
                      {/*  <input*/}
                      {/*    type="checkbox"*/}
                      {/*    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"*/}
                      {/*    checked={satelliteScaleUp}*/}
                      {/*    onChange={_ => {*/}
                      {/*      setSatelliteScaleUp(!satelliteScaleUp)*/}
                      {/*    }}*/}
                      {/*  />*/}
                      {/*</div>*/}
                      <div className="lbl-ring-outer w-full mb-1 flex justify-between items-center">
                        <label htmlFor="difference" className="text-sm">Show Satellite</label>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={showSatellite}
                          onChange={_ => {
                            setShowSatellite(!showSatellite)
                          }}
                        />
                      </div>
                    </div>
                    <div>
                    </div>

                  </div>
                  : null
              }
              <ThreeMapMenu class={'w-full'} Title={"Scene Settings"} Machines={[]} State={showSceneSettings}
                            SetState={setShowSceneSettings}/>
              {
                !showSceneSettings ? null :
                  <div className="w-full mt-4">
                    <div className="lbl-ring-outer mb-1">
                      <label htmlFor="difference" className="bg-gray-100 lbl-sm lbl-ring-inner">Camera Rotation
                        Speed</label>
                      <input className="w-full" id={'waterOpacity'} type="range" min={0} max={2} value={rotateSpeed}
                             onInput={e => handleValue(e, setRotateSpeed)} step={0.001}/>
                    </div>
                    <div className="lbl-ring-outer mb-1">
                      <label htmlFor="difference" className="bg-gray-100 lbl-sm lbl-ring-inner">Sun Height</label>
                      <input className="w-full" id={'waterOpacity'} type="range" min={-1} max={45} value={sunHeight}
                             onInput={e => handleValue(e, setSunHeight)} step={0.05}/>
                    </div>
                    <div className="lbl-ring-outer mb-1">
                      <label htmlFor="difference" className="bg-gray-100 lbl-sm lbl-ring-inner">Sun Angle</label>
                      <input className="w-full" id={'waterOpacity'} type="range" min={-180} max={180} value={sunAngle}
                             onInput={e => handleValue(e, setSunAngle)} step={0.05}/>
                    </div>
                  </div>
              }
              <HeightLayer simpleMode={simpleMode}/>
              <ThreeMapMenu class={''} Title={"Water Relief Settings"} Machines={machinesLoading} State={showWaterMenu}
                            SetState={setShowWaterMenu}/>
              {showWaterMenu ?
                <div className="w-full mt-4">
                  <div className="lbl-ring-outer">
                    <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Iterations</label>
                    <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'iterations'}
                                 name={'iterations'} min={5000} max={400000} step={1} selected={iterations}
                                 setSelected={setIterations}/>
                  </div>
                  <div className="flex flex-row">
                    <div className="lbl-ring-outer w-1/2">
                      <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Water Resolution</label>
                      <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'waterWeight'}
                                   name={'waterWeight'} min={1} max={50} step={1} selected={waterResolution}
                                   setSelected={setWaterResolution}/>
                    </div>
                    <div className="lbl-ring-outer w-1/2">
                      <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Weight</label>
                      <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'waterWeight'}
                                   name={'waterWeight'} min={0.0000001} max={2} step={0.01} selected={waterWeight}
                                   setSelected={setWaterWeight}/>
                    </div>
                  </div>

                  {simpleMode ? null : <div className="flex flex-row">
                    <div className="lbl-ring-outer w-1/2">
                      <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Radius</label>
                      <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'meshResolution'}
                                   name={'meshResolution'} min={5} max={1000} step={1} selected={waterRadius}
                                   setSelected={setWaterRadius}/>
                    </div>
                    <div className=" lbl-ring-outer w-1/2">
                      <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Samples</label>
                      <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'weight'}
                                   name={'weight'} min={5} max={1000} step={1} selected={waterSamples}
                                   setSelected={setWaterSamples}/>
                    </div>
                  </div>}
                  <div className="lbl-ring-outer mb-4">
                    <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Water Relief Opacity</label>
                    <input className="w-full" id={'waterOpacity'} type="range" min={0} max={1} value={waterOpacity}
                           onInput={e => handleValue(e, setWaterOpacity)} step={0.001}/>
                  </div>
                </div> : null
              }
              <LoadButton label={"Simulate Water Relief"} isLoading={isSimulating} onClick={() => {
                waterSim()
              }} activeClass={'mt-2 p-2 text-normal bg-green-50 border-blue-500 text-blue-900 w-full'}
                          inactiveClass={'mt-2 p-2 text-normal w-full'}/>

            </div>
          </div>
        </header>
        <div id="threeJsDiv" ref={threeJs} className='flex h-full w-full bg-gray-100 overflow-y-hidden'>
          <ThreeJs

            className={"flex h-full w-full bg-blue-50"}
            width={windowSize.width * 0.9}
            height={windowSize.height * 0.95}/>
        </div>

      </div>
    </div>
  )
}

export default Maps3D