import {classNames, slugify} from "../../../lib/common";
import {RegressionRanking, RegressionResults, StatsRegressionTypesMenu,} from "../model";
// @ts-ignore
import {statsStore, statsUIForRegressionsMachine, updateSelectedXYMenus} from "../store";
import {round} from "../../../lib/stats";
import {LoadingEvent} from "../../../core/machine";


const headers = ['Comparison', 'Type', 'R2']
const createHeaders = (headers: string[]) => {
  return headers.map((h, i) => {
    return (
      <th
        key={slugify(h) + i.toString()}
        scope="col"
        className={classNames("whitespace-nowrap text-left text-gray-500 font-normal py-2 pl-5 pr-4")}
      >
        {h}
      </th>
    )
  })
}

const createRows = (results: RegressionResults, rankings: RegressionRanking[], selected: string[], r2Threshold: number, onSelected: (xName:string, yName:string, regression:string) => void) => {
  const isSelected = (xName: string, yName: string) => {
    return xName === selected[0] && yName === selected[1]
  }
  // Filter out invalid numbers and r2 > threshold
  const filter = (x:RegressionRanking) => !isNaN(x.r2) && !isNaN(x.cov) && x.r2 > r2Threshold

  return rankings.filter(filter).map((row, i) => {
    const regression = results[row.regressionResultKey]
    return (
      <tr key={i.toString() + 'b'}
          onClick={() => onSelected(regression.xName, regression.yName, row.type)}
          className={classNames("text-gray-500 hover:bg-blue-300 hover:text-white", isSelected(regression.xName, regression.yName)? 'bg-blue-500 text-white': 'even:bg-gray-100')}>
        <td className={classNames("px-4 py-2 max-w-[30ch] truncate ...")}>
          {regression.xName} vs {regression.yName}
        </td>
        <td className={classNames("px-4 py-2 whitespace-nowrap")}>
          {row.type?.slice(0, 3)}
        </td>
        <td className={classNames("px-4 py-2 whitespace-nowrap")}>
          {round(row.r2, 2)}
        </td>
      </tr>
    )
  })
}
interface Props {
  title: string,
  className: string,
}

const useUpdateOnRankSelectionHook = () => {


  const updateSelectedRegression = (regression:string) => {
    const menuEntry = StatsRegressionTypesMenu.find((x) => x.menuName?.toLowerCase() === regression.toLowerCase())
    if (menuEntry) {
      statsUIForRegressionsMachine.service.send(LoadingEvent.Update, {selectedRegression: menuEntry.menuType})
    }
  }
  const onRankingClick = (xName: string, yName:string, regression:string) => {
    updateSelectedXYMenus(xName, yName)
    updateSelectedRegression(regression)
  }

  return onRankingClick
}



const RankingTable = ({title, className}: Props) => {
  const results = statsStore.regressionState.results//useAtomValue(statsRegressionResultsAtom)
  const rankings = statsStore.regressionState.ranking//useAtomValue(statsRegressionResultsRankingAtom)
  const r2Threshold = statsStore.uiRegressionState.r2Threshold
  const xyMenu = [statsStore.xyState.xName, statsStore.xyState.yName]

  const onRankingClick = useUpdateOnRankSelectionHook()

  const hasData = rankings.length > 0

  return (
    <div className={className}>
      <div className="flex flex-col text-xs bg-gray-50">
        <div className="">
          <div className="inline-block min-w-full align-middle">
            <div className="">
              <h2 className="text-xl text-center p-2">{hasData ? title : ''}</h2>
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                <tr className="sticky">
                  {createHeaders(headers)}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {createRows(results, rankings, xyMenu, r2Threshold, onRankingClick)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RankingTable