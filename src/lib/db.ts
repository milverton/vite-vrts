import {uidGenerator} from "./common";
import {Meta, MetaRecordFormat, MetaRecordStatus, MetaRecordType} from "../core/meta";


export const recordDetails = [
  {'abbr': 'Bulk', 'title': 'Bulk EM/GR Archive'},
  {'abbr': 'Br', 'title': 'Boundary Raw'},
  {'abbr': 'Bc', 'title': 'Boundary Clean'},
  {'abbr': 'EMr', 'title': 'EM Raw'},
  {'abbr': 'EMc', 'title': 'EM Clean'},
  {'abbr': 'GRr', 'title': 'GR Raw'},
  {'abbr': 'GRc', 'title': 'GR Clean'},
  {'abbr': 'EmGr', 'title': 'EmGr Fusion'},
  // {'abbr': 'EmGrc', 'title': 'EmGr Fusion Clean'},
  {'abbr': 'Pr', 'title': 'Soil Points Raw'},
  {'abbr': 'Pc', 'title': 'Soil Points Clean'},
  {'abbr': 'Sr', 'title': 'Soil Results Raw'},
  {'abbr': 'S1', 'title': 'Soil Results Zero Horizon'},
  {'abbr': 'S2', 'title': 'Soil Results A Horizon'},
  {'abbr': 'S3', 'title': 'Soil Results B Horizon'},
  {'abbr': 'Sf', 'title': 'Soil Fusion Data'},
  {'abbr': 'Sp', 'title': 'Soil Photo'},
  {'abbr': 'Mi', 'title': 'Interpolated Map Image'},

]


export class DBMetaGroup {
  name: string
  dbMetas: Array<Meta>
  uid: string

  constructor(name: string, dbMetas: Array<Meta>) {
    this.name = name
    this.dbMetas = dbMetas
    this.uid = uidGenerator()
  }

  cleanMetas() {
    this.dbMetas = this.dbMetas.filter(x => x !== undefined)
  }

  noteName(): string {
    return `${this.dealer()} - ${this.client()} - Note`
  }

  dealer(): string {
    return this.dbMetas.first()?.dealer || ''
  }

  client(): string {
    return this.dbMetas.first()?.client || ''
  }

  block(): string {
    return this.dbMetas.first()?.block || ''
  }

  field(): string {
    return this.dbMetas.first()?.field || ''
  }

  season(): number {
    return this.dbMetas.first()?.season || 0
  }
  blocks(): string[] {
    return this.dbMetas.map(e => e.block).sort()
  }

  //
  recordSummary(filter:any): Array<string> {


    // const letters = this.dbMetas.filter(filter).map(e => {
    //
    // });

    const letters = this.dbMetas.filter(filter).map(e => {
      const s = e.status === MetaRecordStatus.Raw ? 'r' : 'c'
      // @ts-ignore
      if (e.type === MetaRecordType.SoilSamples) {
        const h = e.set_id.toString()
        if (s === 'r') {
          return `Sr`
        }
        return `S${h}`
      } else if (e.type === MetaRecordType.Em) {
        return `EM${s}`
      } else if (e.type === MetaRecordType.Gr) {
        return `GR${s}`
      } else if (e.type == MetaRecordType.EmGr) {
        return `EmGr`
      } else if (e.type === MetaRecordType.Boundary) {
        return `B${s}`
      } else if (e.type === MetaRecordType.SoilPoints) {
        return `P${s}`
      } else if (e.type === MetaRecordType.SoilPhoto) {
        return `Sp`
      } else if (e.type === MetaRecordType.MapImage) {
        return "Mi"
      } else if (e.type === MetaRecordType.BulkData) {
        return 'Bulk'
      } else if (e.type === MetaRecordType.Document) {
        return 'Doc'
      } else if (e.type === MetaRecordType.SoilFusion) {
        switch (e.format) {
          case MetaRecordFormat.Em1SGrSoilFusion:
            return `Sf`
          case MetaRecordFormat.Em21SGrSoilFusion:
            return `Sf`
        }
        console.warn(`Unknown record type ${MetaRecordType[e.type]} ${MetaRecordFormat[e.format]}`)
        return 'X'
      } else if (e.type === MetaRecordType.StatsReport) {
        switch (e.status) {
          case MetaRecordStatus.Raw:
            return `Srr`
          // case DBRecordState.Clean:
          //   return `Src`
        }
        console.warn(`Unknown record type ${MetaRecordType[e.type]} ${MetaRecordFormat[e.format]}`)
        return 'X'
      } else {
        console.warn(`Unknown record type ${MetaRecordType[e.type]} ${MetaRecordFormat[e.format]}`)
        return 'X'
      }
    }).filter(x => x.trim().length > 0)
    const s = Array.from(new Set(letters))
    return Array.from(s).sort()
    return []
  }
  // season(): string {
  //   const parts = this.name.split('-')
  //   return parts[parts.length - 1].trim()
  // }
  seasons(): Array<number> {
    return Array.from(new Set(this.dbMetas.map(e => e.season)))
  }

  dealers(): Array<string> {
    return Array.from(new Set(this.dbMetas.map(e => e.dealer)))
  }

  query(flt: (arg0: Meta) => boolean): Array<Meta> {
    return this.dbMetas.filter(flt)
  }

  hasSeason(season: number): boolean {
    return this.dbMetas.find((e) => e.season === season) !== undefined
  }

  recordSummaryAsBooleans(flt: (arg0: Meta) => boolean): Array<boolean> {
    const summary = this.recordSummary(flt)
    return recordDetails.map(s => summary.includes(s.abbr.trim()))
  }

  hasOnlyBoundary(flt: (arg0: Meta) => boolean): boolean {
    const summary = this.recordSummary(flt)
    return summary.length === 1 && summary[0].startsWith("B")
  }

  hasEmOrGr(flt: (arg0: Meta) => boolean): boolean {
    return this.dbMetas.some(e => e.type === MetaRecordType.Em || e.type === MetaRecordType.Gr && flt(e))
  }

  getRawEm(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.Em && e.status === MetaRecordStatus.Raw && flt(e))
  }

  getRawGr(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.Gr && e.status === MetaRecordStatus.Raw && flt(e))
  }

  getCleanEm(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.Em && e.status === MetaRecordStatus.Clean && flt(e))
  }

  getCleanGr(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.Gr && e.status === MetaRecordStatus.Clean && flt(e))
  }

  getAllFieldsBoundary(): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.Boundary && e.format === MetaRecordFormat.AllFieldsVrts)
  }

  getCleanSoilData(): Meta[] {
    return this.dbMetas.filter(e => e.type === MetaRecordType.SoilSamples && e.status === MetaRecordStatus.Clean)
  }

  getCleanSoilPoints(): Meta | undefined {
    return this.dbMetas.find(e => e.type === MetaRecordType.SoilPoints && e.status === MetaRecordStatus.Clean)
  }

  getSoilPhotos(): Meta[] {
    return this.dbMetas.filter(e => e.type === MetaRecordType.SoilPhoto && e.status === MetaRecordStatus.Clean)
  }

  getSoilPhoto(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.find(e => e.format === MetaRecordFormat.SoilPhoto && e.status === MetaRecordStatus.Clean && flt(e))
  }

  getInterpolatedMaps(): Meta[] {
    return this.dbMetas.filter(e => e.type === MetaRecordType.MapImage && e.status === MetaRecordStatus.Clean)
  }

  getBulkData(flt: (arg0: Meta) => boolean): Meta[] {
    return this.dbMetas.filter(e => e.type === MetaRecordType.BulkData && e.status === MetaRecordStatus.Raw && flt(e))
  }

  // getNote(flt: (Meta) => boolean): Meta | undefined {
  //   return this.dbMetas.filter(e => e.type === MetaRecordType.Document && e.format === MetaRecordFormat.ClientNote && flt(e)).first() as Meta
  // }

  getSoilFusionData(): Meta | undefined {
    return this.dbMetas.filter(e => e.type === MetaRecordType.SoilFusion && e.format === MetaRecordFormat.Em1SGrSoilFusion).first() as Meta
  }

  getRawStatsReport(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.filter(e => e.type === MetaRecordType.StatsReport && e.status === MetaRecordStatus.Raw && flt(e)).first() as Meta
  }

  getCleanStatsReport(flt: (arg0: Meta) => boolean): Meta | undefined {
    return this.dbMetas.filter(e => e.type === MetaRecordType.StatsReport && e.status === MetaRecordStatus.Clean && flt(e)).first() as Meta
  }

  displayName(): string {
    return this.name.split(' - ').slice(0, 2).join(' - ')
  }

}
