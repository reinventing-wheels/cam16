import { element, append, xyz2rgb } from './util.js'
import { cube } from './cube.js'

const cam16ucs = new cam16.CAM16UCS

const render = (x, y, z) =>
  xyz2rgb(cam16ucs.toXYZ([100*(z + .5), 100*x, 100*y]))

const main = async () => {
  const root = element('div')({ className: 'root' })
  append(document.body)(root)

  for await (const layer of cube(120, 120, render))
    append(root)(layer)
}

main()
