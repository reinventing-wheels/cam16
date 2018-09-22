// https://docs.scipy.org/doc/numpy/reference/generated/numpy.interp.html
export const interp = (xp: number[], fp: number[]) => (x: number) => {
  for (let i = 1; i < xp.length; i++) {
    const xʹ = xp[i - 1]
    const xʺ = xp[i]
    if (xʹ <= x && x <= xʺ) {
      const fʹ = fp[i - 1]
      const fʺ = fp[i]
      const t = (x - xʹ) / (xʺ - xʹ)
      return fʹ + t*(fʺ - fʹ)
    }
  }

  throw new Error('wtf')
}

// https://docs.scipy.org/doc/numpy/reference/generated/numpy.searchsorted.html
export const searchsorted = (a: number[], v: number) => {
  if (v < a[0])
    return 0

  if (v > a[a.length-1])
    return a.length

  for (let i = 1; i < a.length; i++) {
    const aʹ = a[i - 1]
    const aʺ = a[i]
    if (aʹ <= v && v <= aʺ)
      return i
  }

  throw new Error('wtf')
}
