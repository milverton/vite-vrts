import {LoadingEvent,useLoadMachineState,} from "../../../core/machine";
import {metaStore} from "../../../lib/stores/meta/store";
import React, {useEffect, useRef, useState} from "react";
import {NumberInput} from "../../../components/number-input/view";
import {LoadButton} from "../../../components/loading-button/view";
import {
  ClearJsStore,
  threeJsHeightMachine,
  threeJsSatelliteMachine,
  threeJsStore,
  threeJsUserSettingsMachine
} from "../../maps3d/three-js/components/MeshCreationMachine";
import {BoundingBox} from "../../../core/bounding-box";
import {
  GetHeightStatus,
  GetSatelliteStatus,
  MeshStatus,
  SatelliteStatus
} from "../../maps3d/three-js/components/MachineStatusVisuals";
import {boundaryStore} from "../../../lib/stores/boundary/store";
import {ThreeMapMenu} from "../../maps3d/components/ThreeMapMenu";
import {debounceTime, Subject} from "rxjs";


export const HeightLayer = (props: { simpleMode: any; }) => {
  const satTime = useLoadMachineState(threeJsSatelliteMachine)
  const dataTime = useLoadMachineState(threeJsHeightMachine)
  const client = metaStore.client
  const block = client.unwrapOr(null)?.block()
  const season:number | undefined = client.unwrapOr(null)?.season()

  const [showMenu, setShowMenu] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const [meshResolution, setMeshResolution] = useState(threeJsStore.userSettings.Resolution)
  const [weight, setWeight] = useState(threeJsStore.userSettings.Weight)
  const [samples, setSamples] = useState(threeJsStore.userSettings.Samples)
  const [radius, setRadius] = useState(threeJsStore.userSettings.Radius)
  const [scalePercentage, setScalePercentage] = useState(threeJsStore.userSettings.SquaredHeight)
  const [scalePercentageSlider, setScalePercentageSlider] = useState(threeJsStore.userSettings.SquaredHeight)
  const scalePercentageSubject = useRef(new Subject<number>()).current;
  const [machinesLoading, setMachinesLoading] = useState([MeshStatus.empty, SatelliteStatus.empty])


  useEffect(() => {
    if (block === undefined) {
      return () => {
        setIsLoading(false)
      }
    }

    threeJsUserSettingsMachine.service.send(LoadingEvent.Update, {
        resolution: meshResolution,
        weight: weight,
        radius: radius,
        samples: samples,
        squaredHeight: scalePercentage,
        showSatellite: threeJsStore.userSettings.ShowSatellite,
        interpolatedUrl: threeJsStore.userSettings.InterpolatedUrl,
        opacity: threeJsStore.userSettings.Opacity,
        waterWeight: threeJsStore.userSettings.WaterWeight,
        iterations: threeJsStore.userSettings.Iterations,
        waterResolution: threeJsStore.userSettings.WaterResolution,
        waterOpacity: threeJsStore.userSettings.WaterOpacity,
        showBoundaries: threeJsStore.userSettings.ShowBoundaries,
        satelliteScaleUp: threeJsStore.userSettings.SatelliteScaleUp,

    })
  }, [meshResolution, weight, samples, radius, scalePercentage])

  useEffect(() => {
    const meshLoading = GetHeightStatus(threeJsHeightMachine)
    const satLoading= GetSatelliteStatus(threeJsSatelliteMachine)
    return setMachinesLoading([meshLoading[0], satLoading[0]])
  }, [satTime, dataTime])

  const heightSatellite = () => {
    ClearJsStore()

    threeJsHeightMachine.reset()
    threeJsHeightMachine.service.send(LoadingEvent.Load,{
        dealer: client.unwrapOr(null)?.dealer() as string,
        client: client.unwrapOr(null)?.client() as string,
        block: block as string,
        season: season,
        weight: threeJsStore.userSettings.Weight,
        resolution: threeJsStore.userSettings.Resolution,
        radius: threeJsStore.userSettings.Radius,
        samples: threeJsStore.userSettings.Samples,
    })
    threeJsSatelliteMachine.reset()
    threeJsSatelliteMachine.service.send(LoadingEvent.Load,{
        block: block as string,
        bbox: boundaryStore.bbox as BoundingBox,
        showSatellite: threeJsStore.userSettings.ShowSatellite,
    })
  }

  // Anytime a new value is submitted to scalePercentageSubject, we debounce it by 500ms
  useEffect(() => {
    const subscription = scalePercentageSubject.pipe(debounceTime(100))
      .subscribe(value => setScalePercentage(value));
    return () => subscription.unsubscribe(); //unsubscribe on unmount
  }, [scalePercentageSubject])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScalePercentageSlider(parseFloat(e.target.value));
    scalePercentageSubject.next(parseFloat(e.target.value));
  }
  return (
    <>
      <ThreeMapMenu Title={"Mesh Settings"} Machines={machinesLoading} State={showMenu} SetState={setShowMenu} class={''}/>
      {
        showMenu ?  <div className="flex flex-col space-y-3">
          <div className="space-y-2">
            <div className="flex lbl-ring-outer mt-4 justify-between">
              <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Squared Percentage of Height</label>
              <p className="flex text-sm w-4 mr-2 space-between">{scalePercentageSlider}</p>
              <input className="w-full flex" id={'scale'} type="range" min={0} max={200} value={scalePercentageSlider}
                     onInput={handleInputChange} step={1}/>
            </div>
            {props.simpleMode ? null : <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="lbl-ring-outer w-1/2">
                  <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Mesh Resolution</label>
                  <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'meshResolution'}
                               name={'meshResolution'} min={6} max={30} step={1} selected={meshResolution}
                               setSelected={setMeshResolution}/>
                </div>
                <div className=" lbl-ring-outer w-1/2">
                  <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Weight</label>
                  <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'weight'}
                               name={'weight'} min={0.0000001} max={2} step={0.01} selected={weight}
                               setSelected={setWeight}/>
                </div>
              </div>
              <div className="flex flex-row">
                <div className="lbl-ring-outer w-1/2">
                  <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Radius</label>
                  <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'meshResolution'}
                               name={'meshResolution'} min={5} max={1000} step={1} selected={radius}
                               setSelected={setRadius}/>
                </div>
                <div className=" lbl-ring-outer w-1/2">
                  <label htmlFor="difference" className="lbl-sm lbl-ring-inner">Interpolation Samples</label>
                  <NumberInput className={'text-xs w-full rounded border-gray-200'} id={'weight'}
                               name={'weight'} min={5} max={1000} step={1} selected={samples}
                               setSelected={setSamples}/>
                </div>
              </div>
            </div>
            }

          </div>
          <LoadButton label={"Generate Mesh"} isLoading={isLoading} onClick={heightSatellite}
                      activeClass={'mt-7 p-2 text-normal bg-green-50 border-green-500 text-green-900 w-full'}
                      inactiveClass={'mt-7 p-2 text-normal w-full'}/>

        </div> : null
      }

    </>


  )

}