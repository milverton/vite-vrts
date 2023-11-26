import {csvToText, ICsv} from "./csv";

export const createUrlForCsv = (csv: ICsv, name: string) => {
  const file = new Blob([csvToText(csv)], {type: 'text/csv'})
  const dataUrl = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = name
  link.href = dataUrl
  link.click()
}
export const createUrl = (data: any, name: string, mime: string) => {
  const file = new Blob([data], {type: mime})
  const dataUrl = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = name
  link.href = dataUrl
  link.click()
}
export const createUrlForJSON = (data: Object, name: string) => {
  const file = new Blob([JSON.stringify(data)], {type: 'text/json'})
  const dataUrl = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = name
  link.href = dataUrl
  link.click()
}

export const createUrlForZipArchive = (data: Blob | Uint8Array, name: string) => {
  const file = new Blob([data], {type: 'application/zip'})
  const dataUrl = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = name
  link.href = dataUrl
  link.click()
}

export const createUrlForKMLFile = (data: string, name: string) => {
  const file = new Blob([data], {type: 'application/vnd.google-earth.kml+xml'})
  const dataUrl = window.URL.createObjectURL(file)
  const link = document.createElement('a')
  link.download = name
  link.href = dataUrl
  link.click()
}