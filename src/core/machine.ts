
import {merge, Observable, Subject} from "rxjs";
import {useEffect, useState} from "react";


const Empty = 'Empty'
const Waiting = 'Waiting'
const Updating = 'Updating'
const Loading = 'Loading'
const Loaded = 'Loaded'

const Update = 'UPDATE'
const Load = 'LOAD'
const Success = 'SUCCESS'
const Failure = 'FAILURE'
const FailureExpected = 'FAILURE_EXPECTED'
const Reset = 'RESET'


export const LoadingState = {
  Empty: Empty,
  Waiting: Waiting,
  Updating: Updating,
  Loading: Loading,
  Loaded: Loaded,
}

export const LoadingEvent = {
  Update: Update,
  Load: Load,
  Success: Success,
  Failure: Failure,
  FailureExpected: FailureExpected,
  Reset: Reset,
}

type LoadingState = typeof LoadingState[keyof typeof LoadingState]
type LoadingEvent = typeof LoadingEvent[keyof typeof LoadingEvent]
export const MachineLogging = true;
export class LoadingMachine {
  private state: LoadingState = Empty
  private observable: Observable<any> = new Subject()
  private readonly _name: string;
  // @ts-ignore
  private _payload: any;

  constructor(name: string) {
    this._name = name;
  }

  public get observer() {
    return this.observable
  }

  public get machine() {
    return this
  }
  public get value() {
    return this.state
  }

  public subscribe = (fn: { next: (state: { type: string }) => void }) => {
    return this.observable.subscribe(fn)
  }

  service = this

  send(event: LoadingEvent, payload?: any) {

    if (event === undefined || event === null) {
      throw new Error(`Invalid send event ${event}`)
    }

    if (MachineLogging) {
      console.log(`%c[${this._name}:SEND] ${event}:${this.state}`, 'color:gray;')
    }
    // Can send
    if (this.state === LoadingState.Empty && event == LoadingEvent.Load) {

      this.state = LoadingState.Loading
      this._payload = payload
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload, meta: {name: this._name}})
      return;
    }

    if ((this.state === LoadingState.Empty || this.state === LoadingState.Waiting) && event == LoadingEvent.Update) {

      this.state = LoadingState.Updating
      this._payload = payload
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Loaded && event == LoadingEvent.Reset) {
      // FIXME: This should be Emptying and it should have a resolve counterpart
      this.state = LoadingState.Empty
      this._payload = null
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Loading && event == LoadingEvent.Load) {
      console.warn(`[${this._name}:SEND] ${event}:${this.state} - already loading`)
      return;
    }

    if (this.state === LoadingState.Loaded && event == LoadingEvent.Load) {
      console.warn(`[${this._name}:SEND] ${event}:${this.state} - already loaded`)
      return;
    }

    if (this.state === LoadingState.Updating && event == LoadingEvent.Update) {
      console.warn(`[${this._name}:SEND] ${event}:${this.state} - already updating`)
      return;
    }

    throw new Error(`Invalid send state transition ${this.state} -> ${event}`)
  }

  public fail(reason: string) {
    this.resolve(LoadingEvent.Failure, reason);
  }

  public failExpected(reason: string) {
    this.resolve(LoadingEvent.FailureExpected, reason);
  }

  public success() {
    this.resolve(LoadingEvent.Success, '');
  }

  private resolve(event: LoadingEvent, reason: string) {

    if (event === undefined || event === null) {
      throw new Error(`Invalid send event ${event}`)
    }

    if (MachineLogging) {
      if (reason === '') {
        if (event === LoadingEvent.Success) {
          console.log(`%c[${this._name}:RESOLVE] ${event}:${this.state}`, "color:green;")
        } else {
          console.log(`%c[${this._name}:RESOLVE] ${event}:${this.state}`, "color:gray;")
        }
      }
      if (event === LoadingEvent.Failure) {
        console.warn(`[${this._name}:RESOLVE] ${event}:${this.state} - ${reason}`)
      }

      if (event === LoadingEvent.FailureExpected) {
        console.log(`%c[${this._name}:RESOLVE] ${event}:${this.state} - ${reason}`, "color:gray;")
      }

    }

    if (event === LoadingEvent.FailureExpected) {
      event = LoadingEvent.Failure
    }

    if (this.state === LoadingState.Loading && event == LoadingEvent.Success) {

      this.state = LoadingState.Loaded
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload: this._payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Loading && event == LoadingEvent.Failure) {

      this.state = LoadingState.Empty
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload: this._payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Updating && event == LoadingEvent.Success) {

      this.state = LoadingState.Waiting
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload: this._payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Updating && event == LoadingEvent.Failure) {

      this.state = LoadingState.Waiting
      // @ts-ignore
      this.observable.next({type: event,value: this.state, payload: this._payload, meta: {name: this._name}})
      return;
    }

    if (this.state === LoadingState.Empty && event == LoadingEvent.Failure) {
      this.state = LoadingState.Empty
      // console.warn(`[${this._name}:SEND] ${event}:${this.state} - already updating`)
      return;
    }

    if (this.state === LoadingState.Loaded && event == LoadingEvent.Success) {
      // Ignore
      return;
    }


    throw new Error(`Invalid resolve state transition ${this.state} -> ${event}`)
  }

  reset() {
    this.state = LoadingState.Empty
    this._payload = null
    // @ts-ignore
    this.observable.next({type: LoadingEvent.Reset,value: this.state, payload:null, meta: {name: this._name}})
  }

}


//
// export const createLoadingMachine = (name: string) => {
//   return createMachine(
//     {
//       id: name,
//       initial: Empty,
//       context: {
//         notifiers: {},
//         queue: {}
//       },
//       states: {
//         Empty: {
//           entry: ["log"],
//           on: {
//             LOAD: {
//               target: Loading,
//               actions: "handleLoad",
//             },
//             UPDATE: {
//               target: Updating,
//             },
//             QUEUE: {
//               target: Empty,
//               actions: "handleQueue",
//             },
//             FLUSH: {
//               target: Empty,
//               actions: "handleQueueFlush",
//             },
//           },
//         },
//         Waiting: {
//           entry: ["log"],
//           on: {
//             UPDATE: {
//               target: Updating,
//             },
//             RESET: {
//               target: Empty,
//             }
//           }
//         },
//         Loading: {
//           entry: ["log"],
//           on: {
//             SUCCESS: {
//               target: Loaded,
//             },
//             FAILURE: {
//               target: Empty,
//             },
//             QUEUE: {
//               target: Loading,
//               actions: "handleQueue",
//             },
//             FLUSH: {
//               target: Loading,
//               actions: "handleQueueFlush",
//             },
//           },
//         },
//         Loaded: {
//           entry: ["log"],
//           on: {
//             RESET: {
//               target: Empty,
//             },
//             QUEUE: {
//               target: Loaded,
//               actions: "handleQueue",
//             },
//             FLUSH: {
//               target: Loaded,
//               actions: "handleQueueFlush",
//             },
//           },
//         },
//         Updating: {
//           entry: ["log"],
//           on: {
//             RESET: {
//               target: Empty,
//             },
//             SUCCESS: {
//               target: Waiting,
//             },
//             FAILURE: {
//               target: Empty,
//             }
//           }
//         },
//       },
//     },
//     {
//       actions: {
//         log: ({context, event}) => {
//           const storeStopEvent = () => {
//             // @ts-ignore
//             if (context.notifiers[name] === undefined) {
//               // @ts-ignore
//               context.notifiers[name] = startAction(name)
//             }
//           }
//           const stopEvent = () => {
//             // @ts-ignore
//             if (context.notifiers[name] !== undefined) {
//               // @ts-ignore
//               context.notifiers[name]()
//               // @ts-ignore
//               delete context.notifiers[name]
//             }
//           }
//           switch (event.type) {
//             case LoadingEvent.Load:
//               storeStopEvent()
//               break
//             case LoadingEvent.Update:
//               storeStopEvent()
//               break
//             case LoadingEvent.Success:
//               stopEvent()
//               break
//             case LoadingEvent.Failure:
//               stopEvent()
//               break
//             // case LoadingEvent.Reset:
//             //   stopEvent()
//             //   break
//           }
//
//           switch (event.type) {
//             case LoadingEvent.Failure:
//               console.warn(`[XSTATE] ${name}`, event.type)
//               break
//             default:
//               console.log(`[XSTATE] ${name}`, event.type);
//               break
//
//           }
//
//         },
//         // handleLoad: (_, __) => {
//         //   // console.log('[XSTATE] Boundary Machine - handleLoad', context, event);
//         // },
//         // handleQueue,
//         // handleQueueFlush,
//
//       },
//     }
//   );
// }

// export class LoadingMachine  {
//   private readonly _machine: any
//   private readonly _service: any
//   private readonly _observer: Observable<any>
//
//   constructor(name: string) {
//     this._machine = createLoadingMachine(name)
//     this._service = createActor(this._machine).start()
//     this._observer = from(this._service)
//     this.reset = this.reset.bind(this)
//   }
//
//   public get machine() {
//     return this._machine
//   }
//
//   public get service() {
//     return this._service
//   }
//
//   public get observer() {
//     return this._observer
//   }
//
//   public reset() {
//     if (this._service.getSnapshot().value === LoadingState.Loaded || this._service.getSnapshot().value === LoadingState.Waiting) {
//       this._service.send(LoadingEvent.Reset)
//     }
//   }
// }


export const useLoadMachinesState = (machines:LoadingMachine[]) => {
  const [ts, setTs] = useState(0)

  useEffect(() => {
    const invalidMachines = machines.filter(x => !x?.observer)
    if (invalidMachines.length > 0) {
      console.warn('useLoadMachinesState', 'invalid machines', invalidMachines)
    }
    const sub = merge(...machines.filter(x => x?.observer).map(x => x.observer)).subscribe(
      (state:any) => {
        if (state.value === LoadingState.Loaded && state.type === LoadingEvent.Success) {
          setTs(Date.now())
        }
        if (state.value === LoadingState.Empty) {
          setTs(Date.now())
        }
        if (state.value === LoadingState.Waiting && state.type === LoadingEvent.Success) {
          setTs(Date.now())
        }
      }
    )
    return () => sub.unsubscribe()
  }, [])
  return ts
}
export const useLoadMachineState = (machine:LoadingMachine) => {
  return useLoadMachinesState([machine])
}
export const useLoadMachineStateWithUpdate = (machine:LoadingMachine):[number,(payload:any) => void] => {
  const ts = useLoadMachineState(machine)
  const update = (payload:any) => {
    machine.service.send(LoadingEvent.Update, payload)
  }
  return [ts, update]
}

