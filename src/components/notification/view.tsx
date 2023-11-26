import {Fragment, useEffect, useState} from "react";
import {LogChannel, LogLevel, LogMessage} from "../../lib/stores/logging";
import {filter} from "rxjs/operators";
import {CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon} from "@heroicons/react/24/outline";
import {Transition} from "@headlessui/react";
import {classNames} from "../../lib/common";
import {XMarkIcon} from "@heroicons/react/24/solid";

const PRUNE_INTERVAL = 1000 * 5 // 5 seconds

export default function Notification() {
  const [show, setShow] = useState(false)
  const [notification, setNotification] = useState<LogMessage>()
  const [icon, setIcon] = useState(null)
  const [alreadyShown] =  useState<{ [key: string]: number }>({});

  useEffect(() => {
    const unsub = LogChannel
      .pipe(
        filter((result) => result.level !== LogLevel.Debug),
      )
      .subscribe((result) => {
        for (const key in alreadyShown) {
          // console.log(key, alreadyShown[key], Date.now()-PRUNE_INTERVAL)
          if (alreadyShown[key] < Date.now() - PRUNE_INTERVAL) {
            delete alreadyShown[key]
          }
        }

        if (alreadyShown[result.checksum] !== undefined) {
          return
        }

        alreadyShown[result.checksum] = Date.now()
        setNotification(result)
        setShow(true)

      })
    return () => unsub.unsubscribe()
  }, [])

  useEffect(() => {
    if (notification) {
      switch (notification.level) {
        case LogLevel.Success:
          // @ts-ignore
          setIcon(<CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true"/>)
          break
        case LogLevel.Warning:
          // @ts-ignore
          setIcon(<ExclamationTriangleIcon className="h-6 w-6 text-orange-400" aria-hidden="true"/>)
          break
        case LogLevel.Failure:
          // @ts-ignore
          setIcon(<ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true"/>)
          break
        case LogLevel.Info:
          // @ts-ignore
          setIcon(<InformationCircleIcon className="h-6 w-6 text-blue-400" aria-hidden="true"/>)
          break
      }
    }
  }, [notification])

  useEffect(() => {
    if (notification) {
      setTimeout(() => {
        setShow(false)
        setNotification(undefined)
      }, 10000)
    }
  }, [notification]);

  const isFailure = notification && notification.level === LogLevel.Failure
  const isInfo = notification && notification.level === LogLevel.Info
  const isSuccess = notification && notification.level === LogLevel.Success
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={classNames("pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5", isFailure ? 'border-failure' : '', isInfo ? 'border-info' : '', isSuccess ? 'border-success' : '')}>
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{notification?.label?.toString()}</p>
                    {notification?.message?.toString().split('\n').map((s,i) => <p key={"n" + i} className="mt-1 text-sm text-gray-500">{s}</p>)}
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
          {/*<NotificationComponent notification={notification} isFailure={isFailure} isInfo={isInfo} isSuccess={isSuccess} icon={icon} setShow={setShow}/>*/}
          </Transition>
        </div>
      </div>
    </>
  )
}