import {CheckIcon} from "@heroicons/react/24/outline";
import {XMarkIcon} from "@heroicons/react/24/solid";

export const getIcon = (b: boolean) => {
  return b ? <CheckIcon className="h-6 w-6 text-green-500 m-auto"/> :
    <XMarkIcon className="h-6 w-6 text-red-500 m-auto"/>
}