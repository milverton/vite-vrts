import {metaClientMachine, metaMachine, metaStore,} from "../../../lib/stores/meta/store";
import {classNames} from "../../../lib/common";
import {boundaryStore} from "../../../lib/stores/boundary/store";
import {useLoadMachinesState} from "../../../core/machine";
import {boundaryMachine} from "../../../lib/stores/boundary/machines";
import {round} from "../../../lib/stats";

export const ClientInfo = ({className}: {className:string}) => {
  useLoadMachinesState([metaMachine, metaClientMachine, boundaryMachine])

  // console.log("BOUNDARY HECTARES", boundaryStore.hectares)

  if (!metaStore.client.isJust) {
    return (
      <div className={classNames("flex flex-col items-center p-2 text-gray-600 text-xs justify-center", className)}>
        <div className="text-base">Welcome</div>
        {/*<div className="text-xs text-gray-100">VRT Solutions</div>*/}
        <div className="text-xs text-gray-500">{Object.keys(metaStore.metasByGroup).length-1} Blocks, {metaStore.metas.length-1} Records</div>
      </div>
    )
  }
  let recordsDetail = metaStore.clientBools

  return (
    <div className="flex flex-col items-center p-2 text-gray-600 text-xs justify-center">
      {/*<ChevronDoubleRightIcon className="h-3 w-3 mr-2"/>*/}
      <div className="text-base">{recordsDetail.name}</div>
      <div className="text-xs">{recordsDetail.block}</div>
      <div className={"text-xs text-gray-500"}>{round(boundaryStore.hectares, 2)}ha</div>

      {/*<div className="mt-2 text-gray-400 flex flex-wrap justify-center">*/}
      {/*  {*/}
      {/*    recordsDetail.bools.map((b, i) => {*/}
      {/*      return (*/}
      {/*        <span key={i} title={recordDetails[i].title}*/}
      {/*              className={classNames("ml-1 mb-2 bg-gray-100 p-1 rounded text-xs font-mono", !b ? 'text-red-300' : '')}>{recordDetails[i].abbr}</span>*/}
      {/*      )*/}
      {/*    })*/}
      {/*  }*/}
      {/*</div>*/}
    </div>
  )
}