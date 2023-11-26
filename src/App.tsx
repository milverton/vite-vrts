import {Suspense, useEffect} from "react";
import {Route, Routes, useLocation,} from "react-router-dom"
import AppContext, {InitialContext} from "./AppContext"
import Audit from "./dashboards/audit/view";
import Soil from "./dashboards/soil/view";
import StatsView from "./dashboards/stats/view";
import Photos from "./dashboards/photos/view";
import Export from "./dashboards/export/view";
import Import from "./dashboards/import/view";
import AppShell from "./dashboards/appshell/view";
import {metaMachine} from "./lib/stores/meta/store";
import Home from "./dashboards/home/view";
import Maps3D from "./dashboards/maps3d/view";
import loadGlobal from "./lib/stores/global/store";
import {LoadingEvent} from "./core/machine";
import {networkPingMachine} from "./network/ping";
import {networkMetaMachine} from "./network/meta";
import {RouteChannel} from "./lib/common";

// TODO: Find a home for global declarations
// https://stackoverflow.com/questions/4090491/how-to-get-the-first-element-of-an-array
// https://bobbyhadz.com/blog/typescript-array-extend
declare global {
  interface Array<T> {
    first(): T
  }
}
// Define first method for Array.
Object.defineProperty(Array.prototype, 'first', {
  value() {
    return this.find(Boolean)
  }
})

const App = () => {



  let location = useLocation();
  useEffect(() => {
    // console.log("App - location changed", location)
    RouteChannel.next(location)
  }, [location])

  useEffect(() => {
    const fn = () => {
      networkPingMachine.service.send({ type: LoadingEvent.Update });
      networkMetaMachine.service.send({ type: LoadingEvent.Load });
    }
    const id = setInterval(fn, 60000)
    // call immediately
    fn();
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const unsub = loadGlobal()
    metaMachine.reset()
    metaMachine.service.send({type: LoadingEvent.Update, payload: {loadCache: true}})
    metaMachine.service.send({type: LoadingEvent.Update, payload: {loadRemote: true}})
    return () => {
      unsub()
    }
  }, [])

  return (
      <AppContext.Provider value={InitialContext}>
        <div className="App h-full">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={

                <AppShell>
                  <Suspense fallback={<div>Loading Home...</div>}>
                    <Home />
                  </Suspense>
                </AppShell>
              }/>

              <Route path="/audit" element={
                <AppShell>

                  <Suspense fallback={<div>Loading Audit...</div>}>
                    <Audit />
                  </Suspense>
                </AppShell>
              }/>

              {/*<Route path="/notes" element={*/}
              {/*  <AppShell>*/}
              {/*    <Suspense fallback={<div>Loading Notes...</div>}>*/}
              {/*      <Notes />*/}
              {/*    </Suspense>*/}
              {/*  </AppShell>*/}
              {/*}/>*/}

              <Route path="/import" element={
                <AppShell>
                  <Suspense fallback={<div>Loading Import...</div>}>
                    <Import />
                  </Suspense>
                </AppShell>
              }/>

              <Route path="/export" element={
                <AppShell>
                  <Suspense fallback={<div>Loading Export...</div>}>
                    <Export />
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
                    <Maps3D />
                  </Suspense>
                </AppShell>
              }/>

              {/*<Route path="/map-maker" element={*/}
              {/*  <AppShell>*/}
              {/*    <Suspense fallback={<div>Loading MapMaker...</div>}>*/}
              {/*      <MapMaker />*/}
              {/*    </Suspense>*/}
              {/*  </AppShell>*/}
              {/*}/>*/}

            </Routes>
          </Suspense>
        </div>
      </AppContext.Provider>
  )
}

export default App