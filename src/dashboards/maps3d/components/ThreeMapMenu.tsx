import {classNames} from "../../../lib/common";
import {MinusIcon, PlusIcon} from "@heroicons/react/24/solid";


interface ThreeMapInterface {
  Title: string,
  Machines: any[],
  State: any,
  SetState: any,
  class: string,
}


export const ThreeMapMenu = (props: ThreeMapInterface) => {

  return (
    <div className={'' + props.class}>
      <button onClick={_ => props.SetState(!props.State)} className={classNames('my-2 w-full bg-gray-100 hover:bg-gray-200 border-b-[1px] border-gray-200')}>
        <div className="flex py-2 align-middle justify-between">
          <div className='flex ml-2 space-x-2'>
            { props.State ?
              <MinusIcon className={classNames('h-5 w-5 pt-1 text-gray-400 text-center')}/> :
              <PlusIcon className={classNames('h-5 w-5 pt-1 text-gray-400 text-center')}/>
            }
            <legend className="font-medium text-gray-900">{props.Title}</legend>
          </div>

          <div className="flex space-x-2 mr-2">
            {
              props.Machines.length === 0 ? null :
                <>
                  <p>Status: </p>
                  {props.Machines}
                </>
            }
          </div>
        </div>
      </button>
    </div>
  )
}