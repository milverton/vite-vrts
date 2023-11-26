import {classNames} from "../../../lib/common";
import {XMarkIcon} from "@heroicons/react/24/solid";
import {LogMessage} from "../../../lib/stores/logging";

interface NotificationProps {
  isFailure: boolean
  isSuccess: boolean
  isInfo: boolean
  notification: LogMessage
  icon: JSX.Element
  setShow: (show: boolean) => void
}

export const NotificationComponent = ({isFailure, isInfo, isSuccess, icon, notification, setShow}: NotificationProps) => {
  return (
    <div
      className={classNames("pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5", isFailure ? 'border-failure' : '', isInfo ? 'border-info' : '', isSuccess ? 'border-success' : '')}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{notification?.label?.toString()}</p>
            <p className="mt-1 text-sm text-gray-500">{notification?.message?.toString()}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                setShow(false)
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}