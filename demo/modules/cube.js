import { frame, context2d } from './util.js'

const layer = (quality, z, fn) => {
  const ctx = context2d({ width: quality, height: quality })
  const data = ctx.createImageData(quality, quality)

  for (let yi = 0; yi < quality; yi++) {
    for (let xi = 0; xi < quality; xi++) {
      const x = xi/(quality - 1) - .5
      const y = yi/(quality - 1) - .5
      const rgb = fn(x, y, z)

      if (rgb) {
        let i = xi + yi*quality << 2
        data.data[i++] = 0xff * rgb[0]
        data.data[i++] = 0xff * rgb[1]
        data.data[i++] = 0xff * rgb[2]
        data.data[i++] = 0xff
      }
    }
  }

  ctx.canvas.style = `--z: ${z}`
  ctx.putImageData(data, 0, 0)
  return ctx
}

export const cube = async function* (layers, quality, fn) {
  for (let zi = 0; zi < layers; zi++) {
    const z = zi/(layers - 1) - .5
    yield layer(quality, z, fn).canvas
    await frame()
  }
}
