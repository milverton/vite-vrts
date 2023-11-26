export const sum = (items: Array<number>): number => items.reduce((acc, i) => {
  return acc + i
}, 0)

// const counter = (items: Array<any>): Object => {
//   const c = {}
//   items.forEach(i => {
//     const p = c[i]
//     if (!p) {
//       c[i] = 1
//     } else {
//       c[i] = p + 1
//     }
//   })
//   return c
// }


export const mean_squared_error = (a:number[], b:number[]):number => {
    let error = 0
    for (let i = 0; i < a.length; i++) {
      error += Math.pow((b[i] - a[i]), 2)
    }
    return error / a.length
  }

// average
export const mean = (items: Array<number>): number => {
  return sum(items) / items.length
}

// variation of each item against the mean
export const variation = (items: Array<number>, mean: number): Array<number> => {
  return items.map(i => Math.pow(i - mean,2))
}

// sample variance
export const variance = (items: Array<number>, mean: number): number => {
  const v = variation(items, mean)
  return sum(v) / (v.length - 1)
}
// population variance
export const variance_p = (items: Array<number>, mean: number): number => {
  const v = variation(items, mean)
  return sum(v) / (v.length)
}

export const r_squared = (actuals: number[], predictions: number[]): number => {
  const actual_mean = mean(actuals)
  const actual_var = variation(actuals, actual_mean)
  const pred_var = variation(predictions, actual_mean)
  return sum(pred_var) / sum(actual_var)
}


export const standard_deviation = (items: Array<number>, mean: number, variance_fn = variance): number => {
  return Math.sqrt(variance_fn(items, mean))
}

export const standard_deviation_no_mean = (items: Array<number>,variance_fn = variance): number => {
  const m = mean(items)
  return Math.sqrt(variance_fn(items, m))
}

export const z_score_with_mean = (items: Array<number>, mean: number, variance_fn = variance): Array<number> => {
  const s = standard_deviation(items, mean, variance_fn)
  const calc = (i: number) => (i - mean) / s
  return items.map(i => calc(i))
}

export const z_score = (items: Array<number>, variance_fn = variance): Array<number> => {
  const m = mean(items)
  return z_score_with_mean(items, m, variance_fn)
}

export const coefficient_of_variation_with_mean = (items: Array<number>, mean: number, variance_fn = variance): number => {
  const s = standard_deviation(items, mean, variance_fn)
  return (s / mean) * 100
}

export const coefficient_of_variation = (items: Array<number>, variance_fn = variance): number => {
  const m = mean(items)
  return coefficient_of_variation_with_mean(items, m, variance_fn)
}

// const normalise = (items: Array<number>) => {
//   const factor = 1 / sum(items)
//   return items.map(x => x *= factor)
// }

const normalise_map = (items: any): Object => {
  const keys = Object.keys(items)
  const _sum = keys.reduce((acc, k) => acc + items[k], 0)
  const factor = 1 / _sum
  return keys.reduce((acc:any, k) => {
    acc[k] = items[k] *= factor
    return acc
  }, {})
}
//
// export const histogram = (items: Array<any>): Object => {
//   return counter(items)
// }

// PMF: probability mass function
// Essentially a histogram that shows probability instead of frequency
export const pmf = (histogram: any) => {
  const keys = Object.keys(histogram)
  const n = keys.length
  const d = keys.reduce((acc:any, k) => {
    acc[k] = (histogram[k] / n)
    return acc
  }, {})
  return normalise_map(d)
}


// CDF: Cumulative distribution function
export const cdf = (items: Array<number>, val: number) => {
  let count = 0
  items.forEach(item => {
    if (item <= val) {
      count += 1
    }
  })
  return count / items.length
}

// https://stackoverflow.com/questions/41974615/how-do-i-calculate-pdf-probability-density-function-in-python
// PDF: Probability density function
export const pdf = (stdev: number, mean: number, x: number): number => {
  return (1.0 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stdev) ** 2)
}


// https://stackoverflow.com/questions/8069315/create-array-of-all-integers-between-two-numbers-inclusive-in-javascript-jquer
// export const range = (j, k):Array<number> => {
//   return Array
//     .apply(null, Array((k - j) + 1))
//     .map(function (_, n) {
//       return n + j
//     })
// }

export const round = (value:number, places:number):number => {
  const multiplier = Math.pow(10, places)
  return (Math.round(value * multiplier) / multiplier)
}

// export const reverse_cdf = (cdf_list:Array<number>, round_to:number=4):Array<number> =>
// {
//   let last = cdf_list[0]
//   const x = cdf_list.slice(1).map(r => {
//     // console.log(last, r, last - r)
//     const diff = last - r
//     last = r
//     return Number(diff.toFixed(round_to))
//   })
//   return [...x, Number(last.toFixed(round_to))]
//   // return cdf_list.slice(1).reduce((acc:Array<number>, n:number) => {
//   //   const last = acc.slice(-1)[0]
//   //   const diff = last - n
//   //   acc.push(round(diff, round_to))
//   //   return acc
//   // }, [cdf_list[0]])
// }


export class MinMax {
  min: number;
  max: number;
  constructor() {
    this.min = Infinity
    this.max = -Infinity
  }
  update = (n:number) => {
    if (isNaN(n)) return
    this.min = Math.min(this.min, n)
    this.max = Math.max(this.max, n)
  }
  isUnset = () => {
    return this.min === Infinity || this.max === -Infinity
  }
}

