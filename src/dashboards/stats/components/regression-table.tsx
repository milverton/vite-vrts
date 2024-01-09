import {classNames} from "../../../lib/common";
import {XYPrediction} from "../model";
import {round} from "../../../lib/stats";
import {fixNumber} from "../transform";
import Checkbox from "../../../components/checkbox/view";

interface Props {
  title: string,
  predictions: XYPrediction[],
  xName: string | undefined,
  yName: string | undefined
  selected: number,
  className: string,
  onClick: (n: number) => void,
  onOutlierClicked: (index: number, outlier: boolean) => void,
}

const RegressionTable = ({
    title,
    predictions,
    xName,
    yName,
    selected,
    className,
    onClick,
    onOutlierClicked,
  }: Props) => {

  const hasData = predictions.length > 0
  const header = () => {
    return (
      <tr className="sticky">
        <th key="a" scope="col"
            className="text-center whitespace-nowrap text-left text-gray-500 font-normal py-2">Id
        </th>
        <th key="c" scope="col"
            className="text-center whitespace-nowrap text-left text-gray-500 font-normal py-2 ">{xName}</th>
        <th key="d" scope="col"
            className="text-center whitespace-nowrap text-left text-gray-500 font-normal py-2 ">{yName}</th>
        <th key="g" scope="col"
            className="text-center whitespace-nowrap text-left text-gray-500 font-normal py-2 ">Z-Score
        </th>
        <th key="z" scope="col"
            className="text-center whitespace-nowrap text-left text-gray-500 font-normal py-2 ">Outlier
        </th>
      </tr>
    )
  }

  const body = () => {
    return (
      <>
        {predictions.map((row, i) => (
          <tr key={i.toString() + 'z'}
              onClick={() => onClick(i)}
              className={classNames("text-center hover:bg-blue-300 hover:text-white", row.outlier ? 'text-red-500' : 'text-gray-500', i === selected ? 'bg-blue-500 text-white' : 'even:bg-gray-100')}>
            <td key={i.toString() + 'a'} className="px-4 py-2 whitespace-nowrap ">{row.id}</td>
            <td key={i.toString() + 'c'} className="px-4 py-2 whitespace-nowrap ">{round(fixNumber(row.x), 3)}</td>
            <td key={i.toString() + 'd'}
                className="px-4 py-2 whitespace-nowrap font-bold">{round(row.y, 3)}</td>
            <td key={i.toString() + 'g'} className="px-4 py-2 whitespace-nowrap ">{round(fixNumber(row.zScore), 2)}</td>
            <td key={i.toString() + 'x'} className="px-4 py-2 whitespace-nowrap w-2"><Checkbox id={row.id} selected={row.outlier} onClick={(status) => onOutlierClicked(i, status)}/>
            </td>
          </tr>

        ))}
      </>
    )
  }

  return (
    <div className={className}>
      <div className="flex flex-col bg-gray-50">
        <div className="">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <h2 className="text-xl text-center p-2">{hasData ? title : ''}</h2>
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                {header()}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {body()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegressionTable