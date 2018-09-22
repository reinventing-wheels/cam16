export const frame = () =>
  new Promise(resolve => requestAnimationFrame(resolve))

export const element = name => options =>
  Object.assign(document.createElement(name), options)

export const append = parent => (...children) =>
  children.forEach(child => parent.appendChild(child))

export const context2d = options =>
  element('canvas')(options).getContext('2d')

export const rgb2srgb = value =>
  value<=0.0031308 ? value*12.92 : (value**(1/2.4))*1.055 - 0.055

export const xyz2rgb = ([x, y, z]) => {
  const r = +3.2404542*x + -1.5371385*y + -0.4985314*z
  const g = -0.9692660*x + +1.8760108*y + +0.0415560*z
  const b = +0.0556434*x + -0.2040259*y + +1.0572252*z

  if (0<=r&&r<=100 && 0<=g&&g<=100 && 0<=b&&b<=100)
    return [rgb2srgb(r/100), rgb2srgb(g/100), rgb2srgb(b/100)]
}
