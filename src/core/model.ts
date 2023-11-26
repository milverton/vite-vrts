import {ICsv} from "../lib/csv";

export interface MetaChanges {
  update: string[]
  delete: string[]
}

export enum CsvType {
  Empty,
  Generic,
  EmRaw,
  EmClean,
  GrRaw,
  GrClean,
  PctAgEM,
  PctAgGR,
  DEX,
  TerraLogga,
  DLog,
  SoilPoints,
  SoilFusion,
}

export interface CsvContainer {
  csv: ICsv
  type: CsvType
}
export interface ActionType {
  type: string
  payload: any
}

