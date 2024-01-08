import Home from "./dashboards/home/view.tsx";
import AppShell from "./dashboards/appshell/view.tsx";
import {Route, Routes, useLocation} from "react-router-dom";
import {Suspense, useEffect, useState} from "react";
import AppContext, {InitialContext} from "./AppContext.ts";
import {RouteChannel} from "./lib/common.ts";
import {networkPingMachine, networkPingStore} from "./network/ping.ts";
import {LoadingEvent, useLoadMachinesState} from "./core/machine.ts";
import {networkMetaMachine} from "./network/meta.ts";
import loadGlobal from "./lib/stores/global/store.ts";

import Export from "./dashboards/export/view.tsx";
import Photos from "./dashboards/photos/view.tsx";
import Maps3D from "./dashboards/maps3d/view.tsx";
import Soil from "./dashboards/soil/view.tsx";
import StatsView from "./dashboards/stats/view.tsx";
import {metaStore} from "./lib/stores/meta/store.ts";

// TODO: Find a home for global declarations
// https://stackoverflow.com/questions/4090491/how-to-get-the-first-element-of-an-array
// https://bobbyhadz.com/blog/typescript-array-extend
declare global {
  interface Array<T> {
    first(): T
  }
}
// // Define first method for Array.
Object.defineProperty(Array.prototype, 'first', {
  value() {
    return this.find(Boolean)
  }
})

// isConnected
const App = () => {
  const networkTm = useLoadMachinesState([networkPingMachine])
  const metaTm = useLoadMachinesState([networkMetaMachine])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  let location = useLocation();
  useEffect(() => {
    // console.log("App - location changed", location)
    RouteChannel.next(location)
  }, [location])

  useEffect(() => {
    const fn = () => {
      networkPingMachine.service.send(LoadingEvent.Update);
    }
    const id = setInterval(fn, 30000)
    // call immediately
    fn();
    return () => clearInterval(id)
  }, [])
  //
  useEffect(() => {
    const unsub = loadGlobal()
    // metaMachine.reset()
    // metaMachine.service.send(LoadingEvent.Update, {loadCache: true})
    // metaMachine.service.send(LoadingEvent.Update, {loadRemote: true})
    return () => {
      unsub()
    }
  }, [])


  useEffect(() => {
    if (networkPingStore.data > -1) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }

  }, [networkTm]);

  useEffect(() => {
    if (metaStore.metas.length > 0) {
      setIsLoaded(true)
    } else {
      setIsLoaded(false)
    }
  }, [metaTm]);

  useEffect(() => {
    if (!isLoaded && isConnected) {
      networkMetaMachine.service.send(LoadingEvent.Update);
    }
  }, [isLoaded, isConnected]);

  return (
    <AppContext.Provider value={InitialContext}>
      <Routes>
        <Route path="/" element={
          <AppShell>
            <Suspense fallback={<div>Loading Home...</div>}>
              <Home/>
            </Suspense>
          </AppShell>
        }/>

        {/*<Route path="/audit" element={*/}
        {/*  <AppShell>*/}

        {/*    <Suspense fallback={<div>Loading Audit...</div>}>*/}
        {/*      <Audit/>*/}
        {/*    </Suspense>*/}
        {/*  </AppShell>*/}
        {/*}/>*/}


        {/*<Route path="/import" element={*/}
        {/*  <AppShell>*/}
        {/*    <Suspense fallback={<div>Loading Import...</div>}>*/}
        {/*      <Import/>*/}
        {/*    </Suspense>*/}
        {/*  </AppShell>*/}
        {/*}/>*/}

        <Route path="/export" element={
          <AppShell>
            <Suspense fallback={<div>Loading Export...</div>}>
              <Export/>
            </Suspense>
          </AppShell>
        }/>

        <Route path="/soil" element={
          <AppShell>
            <Suspense fallback={<div>Loading Soil...</div>}>
              <Soil/>
            </Suspense>
          </AppShell>
        }/>

        <Route path="/photos" element={
          <AppShell>
            <Suspense fallback={<div>Loading Photos...</div>}>
              <Photos/>
            </Suspense>
          </AppShell>
        }/>

        <Route path="/stats" element={
          <AppShell>
            <Suspense fallback={<div>Loading Stats...</div>}>
              <StatsView/>
            </Suspense>
          </AppShell>
        }/>

        <Route path="/maps3d" element={
          <AppShell>
            <Suspense fallback={<div>Loading Maps3D...</div>}>
              <Maps3D/>
            </Suspense>
          </AppShell>
        }/>


      </Routes>
    </AppContext.Provider>
  )
}
export default App;
