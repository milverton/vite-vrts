import {classNames, slugify} from "../../../lib/common";
import {SelectedPoint} from "../model";
// @ts-ignore
import {just} from "true-myth/maybe";
import {getColorForSoilSample, latLngToPoint} from "../transform";
import {soilUIStore} from "../store";
import {soilStore} from "../../../lib/stores/soil/store";
import {useLoadMachineStateWithUpdate} from "../../../core/machine";
import {statsUISharedStateMachine, uiSharedState} from "../../stats/store";


const Header = ({header, highlight, shrinkTable}: {header:string, key:string, highlight: boolean, shrinkTable: boolean}) => {

  return (
    <th
      scope="col"
      className={classNames("whitespace-nowrap text-left", highlight ? 'text-gray-700 font-bold' : 'text-gray-500 font-normal', shrinkTable ? 'pl-2' : 'py-3.5 pl-4 pr-3')}
    >
      {header}
    </th>
  )
}

const SoilTable = () => {
  const [_,update] = useLoadMachineStateWithUpdate(statsUISharedStateMachine)
  const csv = soilUIStore.soilDataState.shrunkHorizonData
  const latlngs = soilUIStore.soilDataState.selectedHorizonDataPoints
  const sampleIds = soilStore.data.soilSampleIds
  const shrinkTable = soilUIStore.toolbarState.shrinkTable
  const [selectedPoint, setSelectedPoint] = [uiSharedState.soilUISelectedPointAtom, update]


  return (
    <div className={classNames("relative bg-gray-100", shrinkTable? 'text-xs': '')}>
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                <tr className="sticky">
                  {
                    csv.head.map((h, i) => {
                      return <Header header={h} key={'thead' + h + i} highlight={false} shrinkTable={shrinkTable} />
                    })
                  }

                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {csv.body.map((row, i) => (
                  <tr key={i.toString() + 'b'}
                      onClick={() => setSelectedPoint(just({latlng: latlngs[i], point: latLngToPoint(latlngs[i]), sampleId: sampleIds[i], rowIndex: i} as SelectedPoint))}
                      className="even:bg-gray-200 hover:bg-blue-300">
                    {
                      row.map((cell, j) => {
                        const cellData = cell.trim().length > 0 ? cell.trim() : 'N/A';
                        const head = csv.head[j]
                        return (
                          <td key={slugify('tbody' + head + j )}
                              style={{color: getColorForSoilSample(head, cellData, '#374151')}}
                              className={classNames("whitespace-nowrap", selectedPoint.unwrapOr({rowIndex: -1}).rowIndex === i ? 'bg-blue-200 font-bold text-gray-700' : '', shrinkTable ? 'pl-2' : 'py-2 pl-4 pr-3')}>
                            {cellData}
                          </td>
                        )
                      })
                    }
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoilTable