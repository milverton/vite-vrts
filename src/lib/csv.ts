// Define element types of csv objects
// @ts-ignore
import {Result} from "true-myth/result";

export interface ICsv {
  head: Array<string>
  body: Array<Array<string>>
}

export interface ITypedCsv<T> {
  head: Array<string>
  body: Array<T>
}


export const emptyCsv = (): ICsv => {
  return {head: [], body: []}
}
// return windows formatted csv
export const csvToText = (csv: ICsv): string => {
  const head = csv.head.map(x => x.trim()).join(',') + '\r\n'
  const body = csv.body.map(x => x.map(z => z.toString().trim()).join(',')).join('\r\n')
  return head + body
  // return csv.head.map(x => x.trim()).join(',') + '\r\n' + csv.body.map(x => x.join(',')).join('\r\n')
}

export const csvFromText = (text: string): ICsv => {
  const lines = text.trim().split(/\r?\n/)
  const head = lines.shift()?.trim().split(',').map(x => x.trim()) || []
  const body = lines.map((line: string) => line.trim().split(',').map(x => x.trim()))
  return {head: head, body}
}

// unpack a long csv formatted string into a header and body
export const unpackHeadAndBody = (text: string): [string[], string[][]] => {
  const {head, body} = csvFromText(text)
  return [head, body]
}

export const reorderCsvColumns = (csv: ICsv): ICsv => {
  const head = [...csv.head].sort()
  const indices = head.map(x => csv.head.indexOf(x))
  const reorderedRows = csv.body.map(row => indices.map(i => row[i]))
  return {head: head, body: reorderedRows}
}

export const floatValuesAtColumn = (csv: ICsv, columnIndex: number): { name: string, values: number[] } => {
  const h = csv.head[columnIndex]
  const v = csv.body.map((row) => parseFloat(row[columnIndex]))
  return {name: h, values: v}
}

/**
 * Return true if csv has data
 * @param {ICsv} csv - Contains the csv data to check
 * @returns boolean
 */
export const csvHasData = (csv: ICsv): boolean => {
  return csv && csv.body && csv.body.length > 0 && csv.head && csv.head.length > 0
}

export const csvIndicesOf = (csv: ICsv, header: string[]): number[] => {
  return header.map((h) => csv.head.indexOf(h))
}

export const csvIndicesNotOf = (csv: ICsv, header: string[]): number[] => {
  return csv.head.filter((h) => !header.includes(h)).map((h) => csv.head.indexOf(h))
}

export const csvForIndices = (csv: ICsv, indices: number[]): ICsv => {
  const head = indices.map((i) => csv.head[i])
  const body = csv.body.map((row) => indices.map((i) => row[i]))
  return {head: head, body}
}

/**
 * Return a new csv with only the specified headers
 * @param csv
 * @param headers
 * @returns ICsv
 */
export const csvInclude = (csv: ICsv, headers: string[]): ICsv => {
  const indices = csvIndicesOf(csv, headers)
  return csvForIndices(csv, indices)
}

/**
 * Return a new csv with all headers except the specified headers
 * @param csv
 * @param headers
 * @returns ICsv
 */
export const csvExclude = (csv: ICsv, headers: string[]): ICsv => {
  const indices = csvIndicesNotOf(csv, headers)
  return csvForIndices(csv, indices)
}

export const csvColumnData = (csv: ICsv, columnIndex: number): string[] => {
  return csv.body.map((row) => row[columnIndex])
}

export const csvToObject = (csv: ICsv) => {
  const obj: any = {}
  csv.head.forEach((h, i) => {
    obj[h] = csv.body.map((row) => row[i])
  })
  return obj
}

export const csvRemoveColumns = (csv: ICsv, columnIndices: number[]): ICsv => {
  const head = csv.head.filter((_, i) => !columnIndices.includes(i))
  const body = csv.body.map(row => row.filter((_, i) => !columnIndices.includes(i)))
  return {head: head, body}
}

export const csvRemoveColumnsByName = (csv: ICsv, columnNames: string[]): ICsv => {
  const indices = columnNames.map(name => csv.head.indexOf(name))
  return csvRemoveColumns(csv, indices)
}

export const csvReorderColumnsByName = (csv: ICsv, columnNames: string[]): ICsv => {
  const indices = columnNames.map(name => csv.head.indexOf(name))
  const head = indices.map(i => csv.head[i])
  const body = csv.body.map(row => indices.map(i => row[i]))
  return {head: head, body}
}


export const fileToCsv = (file: File): Promise<ICsv> => {
  return new Promise((resolve, _reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const csv = csvFromText(data as string)
      resolve(csv)
    }
    reader.readAsText(file)
  })
}

export const filesToCsvs = (files: File[]): Promise<ICsv[]> => {
  return Promise.all(files.map(fileToCsv))
}

export const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, _reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      // 'utf8'?
      resolve((data as string).toString())
    }

    reader.readAsText(file)
  })
}

export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, _reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      resolve(data as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file)
  })
}

export const filesToText = (files: File[]): Promise<string[]> => {
  return Promise.all(files.map(fileToText))
}

export const csvRemoveRows = (csv: ICsv, rowIndices: number[]): ICsv => {
  const body = csv.body.filter((_, i) => !rowIndices.includes(i))
  return {head: csv.head, body}
}

export const csvCompressHeaders = (csv: ICsv, headerStartRow: number, headerEndRow: number): Result<ICsv, string> => {
  const headers = [[...csv.head]]

  // we have the first row already in csv.head, so row 0 is actually row 1 so loop from 0 to headerEndRow-1
  for (let i = headerStartRow; i <= headerEndRow - 1; i++) {
    headers.push(csv.body[i])
    csv.body.splice(i, 1)
  }
  const lengths = headers
    .map(h => h.length)
    .reduce((a, b) => {
      if (a === b) {
        return a
      } else {
        return -1
      }
    }, headers[0].length)
  if (lengths === -1) {
    return Result.err(`Headers are not all the same length. ${headers.map(x => x.length).join(', ')}`)
  }
  const head = headers.reduce((a, b) => a.map((_, i) => (a[i].trim() + ' ' + b[i].trim()).trim()))
  return Result.ok({head: head, body: csv.body})
}

export const csvCollectResults = (results:Result<ICsv,string>[]):Result<ICsv[],string> => {
  const csvs = []
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (!result.isOk) {
      // @ts-ignore
      return Result.err(results[i].error)
    }
    csvs.push(result.value)
  }
  return Result.ok(csvs)
}