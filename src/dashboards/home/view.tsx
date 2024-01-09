import React, {useEffect, useState} from "react";
import {soilUIDataMachine, soilUIStore, soilUIToolbarMachine,} from "../soil/store";
import MapBox from "../soil/components/mapbox";
import {DefaultMapBoxSetup, MapSize} from "../soil/model";
import {StringSelectorControl} from "../soil/components/controls";
import {metaClientMachine, metaMachine, metaStore} from "../../lib/stores/meta/store";
import {classNames, MenuEntry} from "../../lib/common";
import {useLoadMachinesState, useLoadMachineState, useLoadMachineStateWithUpdate} from "../../core/machine";
import {boundaryMachine} from "../../lib/stores/boundary/machines";
import {soilMachine, soilStore} from "../../lib/stores/soil/store";


import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell} from 'recharts';
import {round} from "../../lib/stats";
import {Schema} from "../../core/meta";
import {MenuProps} from "../../components/string-select/model.tsx";
import {ChartBarIcon, InformationCircleIcon, MapIcon} from "@heroicons/react/24/outline";

// const ToggleButton = (props: { setSelected: (arg0: boolean) => void; selected: any; label: string; className:string }) => {
//   return (
//     <button onClick={() => props.setSelected(!props.selected)} className={classNames(
//       "p-2 border-1 text-center rounded text-sm", props.className,
//       !props.selected ? "border-blue-500 bg-white text-blue-500 shadow-inner" : "text-white bg-blue-500 border-blue-500 shadow-md")}>
//       {props.selected ? "Hide " + props.label : "Show " + props.label}
//     </button>
//   )
// }


interface HomePaletteProps {
  title: string;
  selected: boolean;
  setSelected: (value: boolean) => void;
  name: string;
  value: string;
  className:string;
}

const RadioStyleSelector: React.FC<HomePaletteProps> = (props: HomePaletteProps) => {

  const handleChange = () => {
    props.setSelected(!props.selected);
  }

  return (
    <div className={classNames('flex items-end', props.className)}>
      <input
        type='radio'
        className='mr-2 mb-[3px]'
        name={props.name}
        value={props.value}
        checked={props.selected}
        onChange={handleChange}
      />
      <label className='text-sm' onClick={handleChange}>{props.title}</label>
    </div>
  );
}

const HorizontalBarChart = ({data, colors, width}: { data: any, colors: any, width: number }) => {
  if (data.length == 0) {
    return null
  }
  return (
    <BarChart
      className="flex min-h-[4rem]"
      width={width}
      height={250}
      data={data}
      layout="horizontal"
      margin={{
        top: 20, right: 20, left: 20, bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis type="category" dataKey="name" tick={{"fontSize": 11, 'width': 5}}/>
      <YAxis type="number" tick={{"fontSize": 11, 'width': 5}}/>
      <Tooltip/>
      {/*<Legend />*/}
      <Bar dataKey="count">
        {
          data.map((_: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]}/>
          ))
        }
      </Bar>
      {/*<Line type="monotone" dataKey="name" stroke="#ff7300" strokeWidth={2} dot={false} />*/}
    </BarChart>
  );
};


const rgbaArray = (s: string) => s.split('), ').map(item => {
  // @ts-ignore
  const values = item.match(/\d+/g).map(Number);
  return {
    r: values[0],
    g: values[1],
    b: values[2],
    a: values[3]
  };
});

const toHex = (value: number) => value.toString(16).padStart(2, '0');

const rgbaArrayToHex = (rgba: any[]) => {
  return rgba.map(x => {
    const rHex = toHex(x.r);
    const gHex = toHex(x.g);
    const bHex = toHex(x.b);
    toHex(Math.round(x.a * 255 / 100));
    return `#${rHex}${gHex}${bHex}`;
  });
}

const formatInterpolationParams = (params: {
  type: any;
  resolution_m2: any;
  radius_m: any;
  samples: any;
  weight: any;
}) => {

  switch (params.type) {
    case "ExponentialDecay":
      return `Resolution: ${params.resolution_m2}m, Radius: ${params.radius_m}m, Samples: ${params.samples}, Weight: ${params.weight}`
    default:
      return JSON.stringify(params)
  }
}

const formatBinningParams = (type: string, params: {
  bin_count: any;
  interval_in_meters: any;
  intervals: any;
  scalar: any;
}) => {
  switch (type) {
    case "Euler":
      return `Bins: ${params.bin_count}`
    case "Elevation":
      return `Interval: ${params.interval_in_meters}m`
    case "StandardDeviation":
      return `Bins: ${params.bin_count}, Intervals: ${params.intervals}, Scalar: ${params.scalar}`
    case "Em50HardBreaks":
      return ``
    default:
      return JSON.stringify(params)
  }
}
function capitalizeEachWord(str: string) {
  if (str === undefined) return str
  return str.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const DataCard = ({schema, bins, meta, interpolationParams}: {schema: any, bins: any, meta: any, interpolationParams: any}) => {
  return (
    <div className="w-3/6 flex items-center justify-center text-xs p-2">
      <table className="min-w-full table-auto">
        <tbody>
        <tr>
          <td className="px-4 py-1 border">Description</td>
          <td className="px-4 py-1 border">{schema.description}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Unit</td>
          <td className="px-4 py-1 border">{capitalizeEachWord(schema.unit)} ({schema.unit_abbreviation})</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Stats</td>
          <td className="px-4 py-1 border">Min: {bins.length ? bins[0].start_value : 0},
            Max: {bins.length ? bins[bins.length - 1].end_value : 0},
            Mean: {round(Number(meta.attributes.mean), 2)},
            StdDev: {round(Number(meta.attributes.std_dev), 2)}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Hectares</td>
          <td className="px-4 py-1 border">{round(Number(meta.attributes.hectares), 2)}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Samples</td>
          <td className="px-4 py-1 border">{meta.attributes.count}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Density</td>
          <td className="px-4 py-1 border">{round(Number(meta.attributes.density), 2)} (samples/hectare)</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Projection</td>
          <td className="px-4 py-1 border">{meta.attributes.projection}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Binning</td>
          <td
            className="px-4 py-1 border">Strategy: {meta.attributes.binning_strategy}, {formatBinningParams(meta.attributes.binning_strategy, {
            ...JSON.parse(meta.attributes.binning_parameters),
            bin_count: bins.length
          })}</td>
        </tr>
        <tr>
          <td className="px-4 py-1 border">Interpolation</td>
          <td
            className="px-4 py-1 border">Method: {interpolationParams.type}, {formatInterpolationParams(interpolationParams)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  )
}

const HomeMap = () => {
  const bm = useLoadMachineState(boundaryMachine)
  const tm = useLoadMachinesState([metaClientMachine, soilMachine, metaMachine, soilUIDataMachine])

  const [_, update] = useLoadMachineStateWithUpdate(soilUIToolbarMachine)

  const client = metaStore.client

  const map = soilUIStore.toolbarState.selectedMapMenuEntry
  const mapMenu = soilUIStore.toolbarState.mapMenu
  // const mapVariant = soilUIStore.toolbarState.mapVariant // TODO: Fixme

  const tabs = [{menuName: "Chart", menuType: "chart"}, {menuName: "Data", menuType: "data"}]

  const [bins, setBins] = useState<any>([])
  const [palettes, setPalettes] = useState([])
  const [histogram, setHistogram] = useState([])
  const [width, __] = useState(1200)
  const [schema, setSchema] = useState({} as Schema)
  const [interpolationParams, setInterpolationParams] = useState({} as any)
  const [tabChoice, setTabChoice] = useState(tabs[0])

  const selectedMapVariant = soilUIStore.toolbarState.mapVariant
  const mapVariants = soilUIStore.toolbarState.mapVariants
  const setShowPoints = (showPoints: any) => update({showPoints: showPoints})
  const setMap = (map: MenuEntry) => update({selectedMapMenuEntry: map})
  const setMapVariant = (variant: MenuProps) => update({mapVariant: variant})
  const setMapVariants = (variants: MenuProps[]) => update({mapVariants: variants})
  const setShowBoundaries = (showBoundaries: boolean) => update({showBoundaries: showBoundaries})


  useEffect(() => {
    update({mapFit: soilUIStore.toolbarState.mapFit + 1})
  }, [bm])

  //
  const meta = soilStore.maps.soilMapMetas[map.menuName]
  useEffect(() => {
    if (meta) {
      const bins = JSON.parse(meta.attributes.bins)
      const palettes = rgbaArrayToHex(rgbaArray(meta.attributes.palette_colors))
      const schemata = meta.schemata.first() || {} as Schema


      setBins(bins)
      // @ts-ignore
      setPalettes(palettes)
      setHistogram(bins.map((x: { schema: Schema; }) => {
        x.schema = schemata;
        return x;
      }).map((x: {
        start_value: number;
        end_value: number;
        total: any;
      }) => ({name: `${round(x.start_value, 2)}\r\n${round(x.end_value, 2)}`, count: x.total})))
      setSchema(schemata)
      setInterpolationParams(JSON.parse(meta.attributes.interpolation_parameters))
      // console.log("META", meta)
      // TODO: need schema packed in attributes
      // TODO: palette needs to be put in as json
      // TODO: need palette colors maybe for black and white?
      // TODO: std dev and mean are not in bins

      const variations = Object.values(JSON.parse(meta.attributes.variations))
      setMapVariant({menuName: 'Default', menuType: 'data'})
      setMapVariants( [{menuName: 'Default', menuType: 'data'}])
      setMapVariants(variations.map((x:any) => {
        return {menuName: x.name, menuType: x.uri}
      }))
    }
  }, [meta?.url]);

  // useEffect(() => {
  //   setMapVariants( [{menuName: 'Default', menuType: 'data'}])
  // }, [map]);


  // console.log(mapVariants, meta)
  // console.log(meta.attributes)
  return (

    <div className="w-full flex-col h-full flex items-center justify-start">
      <div className="min-h-[4rem]"></div>
      <div className="flex flex-row w-full bg-gray-50 p-4 ">
        <div className="flex w-1/6 flex-col space-y-4 min-w-[300px]">
          <h1
            className="text-xl text-secondary text-center">{client.isJust ? client.value.client() : "No Client Selected"}</h1>


          <div className='bg-gray-100 p-4 rounded border-1'>
            <div className='flex justify-between flex-col space-y-3'>
              <div className="flex space-x-2">
                <button
                  className={classNames('btn-base text-xs flex items-center justify-center w-1/2', tabChoice.menuName === tabs[0].menuName ? "bg-blue-500 text-white" : "bg-white text-gray-500")}
                  onClick={() => setTabChoice(tabs[0])}>
                  <ChartBarIcon className={"mr-2 h-5 inline"}/>
                  Chart
                </button>
                <button
                  className={classNames('btn-base text-xs flex items-center justify-center w-1/2', tabChoice.menuName === tabs[1].menuName ? "bg-green-500 text-white" : "bg-white text-gray-500")}
                  onClick={() => setTabChoice(tabs[1])}>
                  <InformationCircleIcon className={"mr-2 h-5 inline"}/>
                  Info
                </button>
              </div>

              <StringSelectorControl menu={mapMenu} selected={map} setSelected={(e) => {
                setMap(e)
              }}/>
              {mapVariants.map((mapVariant: any) => {
                return (
                  <RadioStyleSelector key={mapVariant.menuName} name="map-type" value={mapVariant.menuType}
                                      title={mapVariant.menuName}
                                      setSelected={() => setMapVariant(mapVariant)}
                                      selected={mapVariant.menuType === selectedMapVariant.menuType}
                                      className={"ml-1"}/>
                )
              })

              }

              <div className="flex justify-between space-x-2 pt-2 w-full">
                <button
                  className={classNames('btn-base text-xs flex items-center justify-center w-1/2', soilUIStore.toolbarState.showPoints ? "bg-blue-500 text-white" : "bg-white text-gray-500")}
                  onClick={() => setShowPoints(!soilUIStore.toolbarState.showPoints)}>
                  <InformationCircleIcon className={"mr-2 h-5 inline"}/>
                  Show Points
                </button>
                <button
                  className={classNames('btn-base text-xs flex items-center justify-center w-1/2', soilUIStore.toolbarState.showBoundaries ? "bg-blue-500 text-white" : "bg-white text-gray-500")}
                  onClick={() => setShowBoundaries(!soilUIStore.toolbarState.showBoundaries)}>
                  <MapIcon className={"mr-2 h-5 inline"}/>
                  Boundaries
                </button>
              </div>
            </div>

          </div>
          {/*<hr/>*/}
          {/*<StringSelectorControl label="Map Size" menu={MapSize} selected={mapSize} setSelected={(e) => setMapSize(e.menuType)} />*/}
          <div>


            {/*{tabs.map((mapVariant: any) => {*/}
            {/*  return (*/}
            {/*    <RadioStyleSelector key={mapVariant.menuName} name="tab-choice" value={mapVariant.menuType}*/}
            {/*                        title={mapVariant.menuName}*/}
            {/*                        setSelected={() => setTabChoice(mapVariant)}*/}
            {/*                        selected={mapVariant.menuType === tabChoice.menuType}/>*/}
            {/*  )*/}
            {/*})}*/}
          </div>
        </div>
        {/*<div>*/}
        {/*  <h1 className="text-sm text-gray-500 mt-4">{schema?.description} ({schema?.unit_abbreviation})</h1>*/}
        {/*</div>*/}

        <div className="flex flex-col justify-center w-full">
          {
            meta != undefined && tabChoice.menuType === 'chart' ?
              <HorizontalBarChart data={histogram} colors={palettes} width={width}/> : null
          }

          {
            meta != undefined && tabChoice.menuType === 'data' ?
              <DataCard schema={schema} bins={bins} meta={meta} interpolationParams={interpolationParams}/> : null
          }
        </div>



      </div>
      <div className="flex flex-col w-full h-full bg-gray-50 items-center">
        <MapBox
          key={bm}
          updateNumber={tm}
          className="w-full h-full z-0 m-0"
          mapBoxSetup={DefaultMapBoxSetup}
          mapSize={MapSize[2]}
          points={soilUIStore.soilDataState.selectedHorizonDataPoints}
          showZoomControl={false}
          scrollToZoom={true}
          showPoints={soilUIStore.toolbarState.showPoints}
          showBoundaries={soilUIStore.toolbarState.showBoundaries}
          showAttributes={true}
          selectedMap={map}
          mapOpacity={soilUIStore.toolbarState.mapOpacity}
          mapZoom={soilUIStore.toolbarState.mapZoom}
          setMapZoom={(z) => update({mapZoom: z})}
          mapFit={soilUIStore.toolbarState.mapFit}

        />
        {/*<HomeBarChart bins={barChartProps.bins} palettes={barChartProps.palettes} selectedPalette={barChartProps.selectedPalette}/>*/}

      </div>
    </div>
  )
}


const Home = () => {
  // useSoilHook()
  useLoadMachineState(soilUIDataMachine)

  return (
    <div className="flex items-center justify-center h-full w-full">
      <HomeMap/>

    </div>
  )
}
export default Home