import {assign, createMachine, interpret} from "xstate";
import {from, merge, Observable} from "rxjs";
import {useEffect, useState} from "react";
import {logFailure} from "../lib/stores/logging";
import {startAction} from "./utils.ts";

const Empty = 'Empty'
const Waiting = 'Waiting'
const Updating = 'Updating'
const Loading = 'Loading'
const Loaded = 'Loaded'

const Queue = 'QUEUE'
const Update = 'UPDATE'
const Load = 'LOAD'
const Success = 'SUCCESS'
const Failure = 'FAILURE'
const Reset = 'RESET'
const Flush = 'FLUSH'

export const LoadingState = {
  Empty: Empty,
  Waiting: Waiting,
  Updating: Updating,
  Loading: Loading,
  Loaded: Loaded,
}

export const LoadingEvent = {
  Queue: Queue,
  Update: Update,
  Load: Load,
  Success: Success,
  Failure: Failure,
  Reset: Reset,
  Flush: Flush,
}

const handleQueue = assign((context:any, event:any) => {
  context.queue = {...context.queue, ...event.payload}
  return context
})

const handleQueueFlush = assign((context:any, event:any) => {
  try {
    return event.payload(context)
  } catch (e:any) {
    logFailure('handleQueueFlush', e.message)
    return context
  }
})

export const createLoadingMachine = (name: string) => {
  return createMachine(
    {
      predictableActionArguments: true,
      id: name,
      initial: Empty,
      context: {
        notifiers: {},
        queue: {}
      },
      states: {
        Empty: {
          entry: ["log"],
          on: {
            LOAD: {
              target: Loading,
              actions: "handleLoad",
            },
            UPDATE: {
              target: Updating,
            },
            QUEUE: {
              target: Empty,
              actions: "handleQueue",
            },
            FLUSH: {
              target: Empty,
              actions: "handleQueueFlush",
            },
          },
        },
        Waiting: {
          entry: ["log"],
          on: {
            UPDATE: {
              target: Updating,
            },
            RESET: {
              target: Empty,
            }
          }
        },
        Loading: {
          entry: ["log"],
          on: {
            SUCCESS: {
              target: Loaded,
            },
            FAILURE: {
              target: Empty,
            },
            QUEUE: {
              target: Loading,
              actions: "handleQueue",
            },
            FLUSH: {
              target: Loading,
              actions: "handleQueueFlush",
            },
          },
        },
        Loaded: {
          entry: ["log"],
          on: {
            RESET: {
              target: Empty,
            },
            QUEUE: {
              target: Loaded,
              actions: "handleQueue",
            },
            FLUSH: {
              target: Loaded,
              actions: "handleQueueFlush",
            },
          },
        },
        Updating: {
          entry: ["log"],
          on: {
            RESET: {
              target: Empty,
            },
            SUCCESS: {
              target: Waiting,
            },
            FAILURE: {
              target: Empty,
            }
          }
        },
      },
    },
    {
      actions: {
        log: (context, event) => {
          const storeStopEvent = () => {
            // @ts-ignore
            if (context.notifiers[name] === undefined) {
              // @ts-ignore
              context.notifiers[name] = startAction(name)
            }
          }
          const stopEvent = () => {
            // @ts-ignore
            if (context.notifiers[name] !== undefined) {
              // @ts-ignore
              context.notifiers[name]()
              // @ts-ignore
              delete context.notifiers[name]
            }
          }
          switch (event.type) {
            case LoadingEvent.Load:
              storeStopEvent()
              break
            case LoadingEvent.Update:
              storeStopEvent()
              break
            case LoadingEvent.Success:
              stopEvent()
              break
            case LoadingEvent.Failure:
              stopEvent()
              break
            // case LoadingEvent.Reset:
            //   stopEvent()
            //   break
          }

          switch (event.type) {
            case LoadingEvent.Failure:
              console.warn(`[XSTATE] ${name}`, event.type)
              break
            default:
              console.log(`[XSTATE] ${name}`, event.type);
              break

          }

        },
        // handleLoad: (_, __) => {
        //   // console.log('[XSTATE] Boundary Machine - handleLoad', context, event);
        // },
        handleQueue,
        handleQueueFlush,

      },
    }
  );
}

export class LoadingMachine  {
  private readonly _machine: any
  private readonly _service: any
  private readonly _observer: Observable<any>

  constructor(name: string) {
    this._machine = createLoadingMachine(name)
    this._service = interpret(this._machine).start()
    this._observer = from(this._service)
    this.reset = this.reset.bind(this)
  }

  public get machine() {
    return this._machine
  }

  public get service() {
    return this._service
  }

  public get observer() {
    return this._observer
  }

  public reset() {
    if (this._service.getSnapshot().value === LoadingState.Loaded || this._service.getSnapshot().value === LoadingState.Waiting) {
      this._service.send(LoadingEvent.Reset)
    }
  }
}


export const useLoadMachinesState = (machines:LoadingMachine[]) => {
  const [ts, setTs] = useState(0)
  // const [stopFn, setStopFn] = useState<() => void>(null)
  useEffect(() => {
    const invalidMachines = machines.filter(x => !x?.observer)
    if (invalidMachines.length > 0) {
      console.warn('useLoadMachinesState', 'invalid machines', invalidMachines)
    }
    const sub = merge(...machines.filter(x => x?.observer).map(x => x.observer)).subscribe(
      (state:any) => {
        if (state.value === LoadingState.Loaded && state.event.type === LoadingEvent.Success) {
          setTs(Date.now())
        }
        if (state.value === LoadingState.Empty) {
          setTs(Date.now())
        }
        if (state.value === LoadingState.Waiting && state.event.type === LoadingEvent.Success) {
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
    machine.service.send({type: LoadingEvent.Update, payload})
  }
  return [ts, update]
}

