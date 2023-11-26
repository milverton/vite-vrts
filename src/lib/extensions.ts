import {slugify, slugifyNoDashes} from "./common";

// @ts-ignore
String.prototype.slugify = function (this: string): string {
  return slugify(this)
}

// @ts-ignore
String.prototype.slugifyNoDashes = function (this: string): string {
  return slugifyNoDashes(this)
}

// @ts-ignore
String.prototype.isEmpty = function (this: string): boolean {
  return this.trim().length === 0
}

// @ts-ignore
String.prototype.capitalize = function (this: string): string {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

// @ts-ignore
String.prototype.justNumbers = function (this: string): string {
  return this.replace(/\D/g, '')
}

// @ts-ignore
String.prototype.removeFileExtension = function (this: string): string {
  return this.replace(/\.[^/.]+$/, "")
}

// @ts-ignore
Array.prototype.range = function (this: any[], n: number): number[] {
  return [...Array(n).keys()]
}

export function range(n: number): number[] {
  return [...Array(n).keys()]
}

Array.prototype.first = function (this: any[]): any {
  return this[0] || null
}

// Object.prototype.clearObject = function (this: any): void {
//   Object.keys(this).forEach(key => {
//     delete this[key];
//   })
// }