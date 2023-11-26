import {formatServerError, logServerFailure} from "../lib/stores/logging";
import {startAction} from "./utils";

// const reset = (networkActivity:NetworkActivity) => {
//   setTimeout(() => {
//     NetworkActivityChannel.next(updateNetworkActivity(networkActivity, NetworkState.Idle))
//   }, 500)
// }

export const post = (url:string, data:any):Promise<any> => {

  return new Promise((resolve, reject) => {
    const stopAction = startAction(`POST ${url}`, 5000)

    fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      // mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => {
        try {

          response.json().then(json => {
            if (response.status !== 200) {
              console.warn("ERROR", json)
              stopAction()
              logServerFailure(json, '93c606ad')
              reject(formatServerError(json, '40503781'))
              return
            }
            stopAction()
            resolve(json)
          })
        } catch (e) {
          stopAction()
          logServerFailure(e, '42cde4a8')
          reject(formatServerError(e, '12a2d95b'))
        }

      })
      .catch(e => {
        stopAction()
        logServerFailure(e, 'fe07a6c2')
        reject(formatServerError(e, 'a05e2b67'))
      })
  })
}

export const postNoCatch = (url:string, data:any):Promise<any> => {

  return new Promise((resolve, reject) => {
    const stopAction = startAction(`POST ${url}`, 5000)

    fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
      .then(response => {
        try {
          response.json().then(json => {
            if (response.status !== 200) {
              stopAction()
              reject(formatServerError(json, 'a0d869a9'))
              return
            }
            stopAction()
            resolve(json)
          })
        } catch (e) {
          stopAction()
          reject(formatServerError(e, 'd457b2ea'))
        }

      })
      .catch(e => {
        stopAction()
        reject(formatServerError(e, 'f623c7dc'))
      })
  })
}