
type MetaBbox = {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
};
export enum MetaRecordFormat {
  Pct,
  Apal,
  Pctv,
  Csbp,
  Vrts,
  Shapefile,
  ShpVrts,
  ShpPct,
  ShpJd,
  Kml,
  KmlPct,
  KmlVrts,
  SoilPhoto,
  DualEm50,
  DualEm100,
  DualEm150,
  DualEm300,
  DualEmIp50,
  DualEmIp100,
  DualEmIp150,
  DualEmIp300,
  Potassium,
  Thorium,
  Uranium,
  TotalCount,
  Emgr,
  ClientNote,
  Png,
  Jpg,
  Em1s,
  Em21s,
  Em1SGrSoilFusion,
  AllFieldsVrts,
  AllBoundariesKml,
  AllFieldsShp,
  AllFieldsWkt,
  AllFieldsKml,
  IndividualFieldsShp,
  GrTerrestrial,
  GrAirborne,
  Wkt,
  Unassigned,
  Deprecated,
}



export enum MetaRecordType {
  Em,
  Gr,
  EmGr,
  SoilSamples,
  SoilPoints,
  SoilPhoto,
  Boundary,
  Image,
  MapImage,
  BulkData,
  Document,
  SoilFusion,
  StatsReport,
  Unassigned,
  Deprecated
}

export enum MetaRecordStatus {
  Clean,
  Raw,
  Unassigned
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, ''); // Remove leading underscore
}

export function snakeToPascalCase(str: string): string {
  return str.toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function mapStringToEnum<T>(enumObj: { [s: string]: T }, str: string): T {
  const camelCaseStr = snakeToPascalCase(str);
  for (const key in enumObj) {
    if (Object.prototype.hasOwnProperty.call(enumObj, key)) {
      if (key === camelCaseStr) {
        return enumObj[key];
      }
    }
  }
  throw new Error(`Unknown enum value: ${str}`);
}
export class Schema {
  slug: string;
  type: string;
  category!: string;
  unit: string;
  unit_abbreviation!: string;
  description!: string;
  primary_data!: boolean;
  tags: string[];
  rounding: number = -1;

  constructor(slug: string, type: string, category: string, unit: string, unitAbbreviation: string, description: string, primaryData: boolean, tags: string[]) {
    this.slug = slug;
    this.type = type;
    this.category = category;
    this.unit = unit;
    this.unit_abbreviation = unitAbbreviation;
    this.description = description;
    this.primary_data = primaryData;
    this.tags = tags;
  }
}


export class Meta {
  dealer: string;
  client: string;
  block: string;
  field: string;
  uid: string;
  version: number;
  set_id: number;
  attributes: Record<string, string>;
  type: MetaRecordType;
  format: MetaRecordFormat;
  status: MetaRecordStatus;
  variation: string;
  size: number;
  archived: boolean;
  created: Date;
  created_by: string;
  modified: Date;
  modified_by: string;
  season: number;
  url: string;
  schemata: Schema[];

  constructor(data: any) {
    this.dealer = data.dealer;
    this.client = data.client;
    this.block = data.block;
    this.field = data.field;
    this.uid = data.uid;
    this.version = data.version;
    this.set_id = data.set_id;
    this.attributes = data.attributes;
    this.type = mapStringToEnum(MetaRecordType, data.type) as MetaRecordType;
    this.format = mapStringToEnum(MetaRecordFormat, data.format) as MetaRecordFormat;
    this.status = mapStringToEnum(MetaRecordStatus, data.status) as MetaRecordStatus;
    this.variation = data.variation;
    this.size = data.size;
    this.archived = data.archived;
    this.created = new Date(data.created);
    this.created_by = data.created_by;
    this.modified = new Date(data.modified);
    this.modified_by = data.modified_by;
    this.season = data.season;
    this.url = data.url;
    this.schemata = data.schemata;
  }

  groupBy(): string {
    return `${this.dealer} - ${this.client} - ${this.block} - ${this.field}`
  }

  getGpsBoundingBox(): MetaBbox {
    return {
      min_x: parseFloat(this.attributes.bbox_gps_min_lon_x),
      min_y: parseFloat(this.attributes.bbox_gps_min_lat_y),
      max_x: parseFloat(this.attributes.bbox_gps_max_lon_x),
      max_y: parseFloat(this.attributes.bbox_gps_max_lat_y)
    }
  }
  getPrjBoundingBox(): MetaBbox {
    return {
      min_x: parseFloat(this.attributes.bbox_projection_min_x),
      min_y: parseFloat(this.attributes.bbox_projection_min_y),
      max_x: parseFloat(this.attributes.bbox_projection_max_x),
      max_y: parseFloat(this.attributes.bbox_projection_max_y)
    }
  }

}

// The function to parse the array of DbMeta
export function parseMetas(data: any): Meta[] {
  return data.map((item: any) => new Meta(item));
}

// Usage
// const dbMetasData = [...]; // some array of data
// const parsedDbMetas = parseDbMetas(dbMetasData);
