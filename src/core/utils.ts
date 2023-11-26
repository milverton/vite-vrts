import {Subject} from "rxjs";


export const ActivityChannel = new Subject();
export interface ActivityChannelModel {
  name: string
  status: 'start' | 'stop'
  timeout: number
}
const actionMap = new Map<string, {timestamp: number, timeout: NodeJS.Timeout}>();

const _startAction = (name: string, timeout: number): () => void =>  {
  const count = actionMap.size;
  const tm = setTimeout(() => {
    console.warn(`[ACTIVITY] (${count}) WARN ${name} took more than ${timeout}ms to complete`)
    actionMap.delete(name);
    ActivityChannel.next({name, status: 'stop', timeout})
  }, timeout);

  const stopAction = () => {
    const data = actionMap.get(name);
    if (!data) {
      console.warn(`[ACTIVITY] (${count}) WARN ${name} already stopped`)
      return
    }
    // console.log(`[ACTIVITY] (${count}) STOP ${name} took ${Date.now() - data.timestamp}ms to complete`);
    clearTimeout(data.timeout);
    actionMap.delete(name);
    ActivityChannel.next({name, status: 'stop', timeout})
  }
  // console.log(`[ACTIVITY] (${count}) START ${name}`)
  actionMap.set(name, {timestamp: Date.now(), timeout: tm});
  ActivityChannel.next({name, status: 'start', timeout})

  return stopAction
}
export const startAction = (name: string, timeout: number = 30000): () => void => {
  const count = actionMap.size;
  if (actionMap.has(name)) {
    console.warn(`[ACTIVITY] (${count}) WARN ${name} already started`)
    return () => {}
  }
  return _startAction(name, timeout)

}