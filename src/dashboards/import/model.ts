export interface ImportMetaModel {
  boundaryId?: string,
  season: string,
  dealer: string,
  client: string,
  block: string,
  field: string,
  format: string,
  type: string,
  status: string,
  variation: string,
  path: string,
  overwrite: boolean,
  remote: false,
  flagged: false,
  archived: false,
  modified: string,
  created: string,
  modifiedBy: string,
  createdBy: string,
}
export interface OwnerProps {
  dealer: string
  client: string
  block: string
  field: string
}

export interface DropFileProps extends OwnerProps {
  overwrite: boolean
  season: number | null,
}

