import {useLocation} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import AppContext from "../../AppContext";
import {ClientInfo} from "./components/client-info";
import {Clients} from "./components/clients";
import {Main} from "./components/main";
import {TopMenu} from "./components/top-menu";
import {AppShellProps} from "./model";
import Notification from "../../components/notification/view";
import {Logo} from "./components/logo";
import {ActivityChannel} from "../../core/utils";
import {interval} from "rxjs";
import {classNames} from "../../lib/common";


const ActivitySpinner = ({className} :{className: string}) => {

  const [activityLog, setActivityLog] = useState<string[]>([])
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [activity, setActivity] = useState(0)
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState('')
  const [ping, setPing] = useState(0)
  useEffect(() => {
    const sub = ActivityChannel.subscribe({
      next: (value: any) => {
        setActive(true)
        setLastActivity(Date.now())
        if (value.status === 'start') {
          console.log('[ACTIVITY] START', value.name)
          setStatus(`[ACTIVITY] START ${value.name}`)
          setActivity(activity => activity + 1)
          setActivityLog(log => [...log, value.name])

        }
        if (value.status === 'stop') {
          console.log('[ACTIVITY] STOP', value.name)
          setStatus(`[ACTIVITY] STOP ${value.name}`)
          setActivity(activity => activity - 1)
          setActivityLog(log => [...log].filter(l => l !== value.name))
        }
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])


  useEffect(() => {
    const sub = interval(1000).subscribe({
      next: () => {
        setPing(Date.now())
      }
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const diff = Date.now() - lastActivity
    if (diff > 1000 && activity === 0 && active) {
      console.log(`[ACTIVITY] CLEANUP No activity for ${diff}ms, setting active to false (${activityLog.join(', ')})`)
      setActive(false)
      setActivity(0)
      setActivityLog([])
    }
    if (active && diff > 30000 && (activity < 0 || activity > 0)) {
      console.warn(`[ACTIVITY] CLEANUP (${activity}) No activity for ${diff}ms (${status} ${activityLog.join(', ')})`)
      setActive(false)
      setActivity(0)
      setActivityLog([])
    }
  }, [ping])

  return (
    <div className={classNames(className, 'fixed right-0')}>
      {/*<div className="flex flex-col">*/}
      {/*  <div className={classNames('text-xs flex flex-col',active? '': '')}>{activity}</div>*/}
      {/*  <div className={classNames('text-xs flex flex-col',active? '': '')}>{activityLog.map(x => <div key={x}>{x}</div>)}</div>*/}
      {/*</div>*/}

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
             className={classNames(active? "animate-spin text-blue-600": "animate-none text-gray-600", "w-6 h-6")}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
      </svg>
    </div>
  )
}

// export const presentationModeAtom = atom(false)
const TopMenuHeader = ({className}: {className: string}) => {
  const context = useContext(AppContext)
  const {pathname} = useLocation()
  const mainMenu = context.makeCurrentPageActive(pathname, context.mainNavigationMenu)
  return (
    <div
      className={classNames(className, '')}>
      <div className="px-2 flex justify-between p-2">
        <TopMenu mainMenu={mainMenu}/>
      </div>
      <ActivitySpinner className={"fixed right-0 flex items-center h-16 w-16 p-4"} />
    </div>
  )
}
// const NetworkRefresh = () => {
//   useLoadMachinesState([metaMachine,metaNetworkMachine])
//   const refresh = () => {
//     // metaMachine.reset()
//     // metaMachine.service.send({type: LoadingEvent.Update, payload: {loadCache: true}})
//     metaMachine.service.send({type: LoadingEvent.Update, payload: {loadRemote: true}})
//   }
//   const hasData = metaStore.networkUpdateCount > 0
//   return (
//     <div className="flex items-center">
//       <button className={classNames("flex p-2 m-2 text-xs", hasData? "text-green-600 font-bold": "text-gray-600")} onClick={() => refresh()}><ArrowPathIcon className="h-4 w-4"/><sup>{metaStore.networkUpdateCount}</sup></button>
//       <div className="text-xs text-gray-500">{Object.keys(metaStore.metasByGroup).length} Blocks, {metaStore.metas.length} Records</div>
//     </div>
//   )
// }
const LeftSideBar = ({id,className}: {id: string, className: string}) => {
  return (
    <div key={id} className={className}>
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className={classNames("flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto")}>
        <Logo className={"flex items-center justify-center flex-shrink-0 px-4 mb-4"}/>
        <ClientInfo className={""}/>
        <div className="flex-grow flex flex-col overflow-y-auto">
          <nav className="flex-1 p-2 space-y-2">
            <Clients className={""}/>
          </nav>
        </div>
      </div>
    </div>
  )
}

// const useKeyboardEventsHook = () => {
//   let location = useLocation();
//   const [key, setKey] = useState(null)
//   const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom)
//
//   useEffect(() => {
//     if (key?.key === 'p') {
//       // console.log("AppShell - onKeyDown", key)
//       setPresentationMode(!presentationMode)
//     }
//   }, [key])
//
//   const allowedPresentationRoutes = ['/reports']
//   useEffect(() => {
//     if (allowedPresentationRoutes.includes(location.pathname)) {
//       // console.log("AppShell - Adding keydown listener")
//       window.addEventListener('keydown', setKey)
//       return () => {
//         // console.log("AppShell - Removing keydown listener")
//         window.removeEventListener('keydown', setKey)
//       }
//     }
//   }, [location.pathname])
//   return {presentationMode}
// }

export default function AppShell(props: AppShellProps) {

  const changed = false;
  return (
    <>
      <LeftSideBar id={'lsb' + changed.toString()} className={classNames("flex flex-col fixed inset-y-0 w-64 z-1", changed? "hidden": "")}/>
      <div className={classNames("flex flex-col flex-1 h-full overflow-clip z-1", changed ? "pl-0" : "pl-64")}>
        <TopMenuHeader
          className={classNames("fixed w-full flex h-16 bg-white shadow z-50", changed ? 'hidden' : '')}/>
        <Main id={'m' + changed}
              className={classNames("flex-1 z-1 bg-white h-full w-full overflow-y-auto text-gray-700")}
              children={props.children} />


      </div>
      <Notification/>
    </>
  )
}