import {createContext} from "react";
// import {DbProps} from "./lib/files";
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClipboardIcon,
  CogIcon,
  HomeIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import {IMenu} from "./dashboards/appshell/model";
import {CubeIcon, SignalIcon} from "@heroicons/react/24/solid";


let mainNav = [
  {name: 'Home', href: '/', icon: HomeIcon, current: false, description: ""},
  {name: 'Soil', href: '/soil', icon: SunIcon, current: false, description: ""},
  {name: 'Photos', href: '/photos', icon: PhotoIcon, current: false, description: ""},
  {name: 'Stats', href: '/stats', icon: ChartBarIcon, current: false, description: ""},
  {name: '3D', href: '/maps3d', icon: CubeIcon, current: false, description: ""},
  // {name: 'Import', href: '/import', icon: ArrowUpTrayIcon, current: false, description: ""},
  {name: 'Export', href: '/export', icon: ArrowDownTrayIcon, current: false, description: ""},
  // {name: 'Audit', href: '/audit', icon: ShieldCheckIcon, current: false, description: ""},

]

// const archivePath = window.electron.archive();
// let parts = atob(archivePath).split(/[\\/]/).join("/");
// const isTrimmedVersion = parts.includes("app/data/vrts-archive")
// if (isTrimmedVersion) {
//   const remove = ['Reports', 'Import', 'Tools', 'Dev']
//   mainNav = mainNav.filter((e) => !remove.includes(e.name))
// }

export const toolsNav: IMenu[] = [
  {name: 'EmGr', href: '/emgr', icon: SignalIcon, current: false, description: ""},
  // {name: 'Notes', href: '/notes', icon: PencilIcon, current: false, description: ""},
  {name: 'Audit', href: '/audit', icon: ShieldCheckIcon, current: false, description: ""},
  {name: 'Logs', href: '/logs', icon: ClipboardIcon, current: false, description: ""},
]

const userNav: IMenu[] = [
  {name: 'Preferences', href: '/preferences', icon: CogIcon, current: false, description: ""},
]


function setByPath(path: string, menu: IMenu[]) {
  return menu.map((e) => {
    if (e.href === path) {
      return {...e, current: true}
    }
    return e
  })
}

export interface IAppContext {
  // dbFileProps: DbProps
  allowedFileTypes: Array<string>
  maxImportBytes: number
  mainNavigationMenu: IMenu[]
  userNavigationMenu: IMenu[]
  makeCurrentPageActive: (path: string, menu: IMenu[]) => IMenu[]

}

export const InitialContext: IAppContext = {
  // dbFileProps: {dbName: 'files', storeName: 'files', metaName: 'files-meta', version: 1},
  allowedFileTypes: ["text/plain", "text/csv"],
  maxImportBytes: 50 * 1024 * 1024,
  mainNavigationMenu: mainNav,
  userNavigationMenu: userNav,
  makeCurrentPageActive: setByPath,
}

const AppContext = createContext(InitialContext)

export default AppContext