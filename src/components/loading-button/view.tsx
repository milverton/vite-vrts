import {classNames} from "../../lib/common";
import {ArrowPathIcon} from "@heroicons/react/24/solid";
import {LoadingButtonProps} from "./model";


export const LoadButton = ({label,onClick ,isLoading, activeClass, inactiveClass}: LoadingButtonProps) => {
  return(
    <button className={classNames("btn flex items-center justify-center", isLoading ? activeClass + " animate-pulse" : inactiveClass)} onClick={onClick}>
      {label}
      {<ArrowPathIcon className={classNames("ml-3 h-5 inline", isLoading ? "animate-spin" : "")}/>}
    </button>

  )
}