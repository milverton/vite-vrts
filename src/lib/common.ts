
import {customAlphabet} from "nanoid";
// @ts-ignore
import {h64} from "xxhashjs";

export const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

export const enumToArray = (_enums:any): Array<String> => {
  const recordTypes: Array<string> = []
  for(let rec of Object.values(_enums)){
    if(rec == "0") break;
    // @ts-ignore
    recordTypes.push(rec)
  }
  return recordTypes
}


export interface MenuEntry {
  id: number
  name: string
  href?: string,
  current: boolean
}

export const isValidNumber = (n:number) => {
  if (n === null) return false
  if (isNaN(n)) return false
  if (n === undefined) return false
  if (n === Infinity || n === -Infinity) return false
  return true
}

export interface IDocument {
  meta: {
    season: string,
    type: string
  }
  csv: {
    head: Array<string>,
    body: Array<Array<string>>
  }
}

export enum ServerResponse {
  Error,
  Success,
  UidList ,
  MetaList,
}

export interface IUidList {
  type: ServerResponse
  good: string[]
  bad: string[]
}


const nanoid_chars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const nanoid_length = 25
export const uidGenerator = customAlphabet(nanoid_chars, nanoid_length)



export const getSeasons = () => {
  const now = new Date()
  // get year from 10 years ago
  const year = now.getFullYear() - 10
  const seasons = []
  for (let i = 0; i < 15; i++) {
    seasons.push(year + i)
  }
  return seasons
}
export const fltTrue = (_: Meta) => true
export const hashText = (text: string) => {
  let H = h64(0xAFAF)
  return H.update(text).digest().toString(16)
}

const notWord = /\W/g
const separator = /\|+/g
const capital = /([a-z])([A-Z])/g
const spaces = /\s+/g

/**
 * slugify is a function that takes a string and returns a slugified version of it
 *
 * @example slugify('Hello World') // hello-world
 * @param s - The string to slugify
 * @param sep
 * @returns - The slugified string
 */
export const slugify = (s: string, sep: string = "-"): string => {
  if (!s) {
    s = ''
  }


  return s
    .toString()
    .trim()
    // @ts-ignore
    .replaceAll(capital, "$1|$2")
    .replaceAll(notWord, "|")
    .replaceAll(spaces, "|")
    .replaceAll('_', '|')
    .replaceAll(separator, " ")
    .trim()
    .replaceAll(spaces, sep)
    .toLowerCase()
}
/**
 * slugifyNoDashes returns a slugified string without dashes
 *
 * @example slugifyNoDashes('Hello World') // helloworld
 * @param s - The string to slugify
 * @returns - The slugified string
 */
export const slugifyNoDashes = (s: string): string => {
  // @ts-ignore
  return slugify(s).replaceAll('-', '')
}

export const slugifySnakeCase = (s: string): string => {
  return slugify(s, "_")
}


export function isNotNull(v: any): boolean {
  return v !== null && v !== undefined
}

export function isNull(v: any): boolean {
  return !isNotNull(v);
}

export function isEmpty(v: string): boolean {
  if (isNull(v)) return true;
  if (v.trim().length == 0) {
    return true;
  }
  return false;
}

export function isNotEmpty(v: string): boolean {
  return !isEmpty(v);
}

import {Subject} from "rxjs";
import {Meta} from "../core/meta.ts";

export const RouteChannel = new Subject()