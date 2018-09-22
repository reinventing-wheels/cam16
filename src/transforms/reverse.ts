import { cos, sin, sqrt, abs, sign, nan2num, deg2rad } from '../math'
import { searchsorted } from '../util'
import { CAM16 } from '../cam16'

export const reverse = (cam: CAM16, data: number[], description: string) => {
  let J, Q, h, α = 0

  if (description[0] === 'J') {
    J = data[0]
    // Q perhaps needed for C
    Q = (4/cam.c) * sqrt(J/100) * (cam.A_w+4) * cam.F_L**0.25
  }
  else {
    // Step 1-1: Compute J from Q (if start from Q)
    // console.assert(description[0] === 'Q')
    Q = data[0]
    J = 6.25 * (cam.c*Q / (cam.A_w+4) / cam.F_L**0.25)**2
  }

  // Step 1-2: Calculate t from C, M, or s
  if ('CM'.includes(description[1])) {
    let M, C
    if (description[1] === 'M') {
      M = data[1]
      C = M / cam.F_L**0.25
    }
    else {
      C = data[1]
    }

    // If C or M is given and equal 0, the value of `t` cannot
    // algebraically deduced just by C or M. However, from other
    // considerations we know that it must be 0. Hence, allow division
    // by 0 and set nans to 0 afterwards.
    α = C / sqrt(J/100)
    α = nan2num(α)
  }
  else {
    // console.assert(description[1] === 's')
    const s = data[1] / 100
    // const C = s*s * Q / cam.F_L**0.25
    α = 4*s*s * (cam.A_w+4) / cam.c
  }

  const t = (α / (1.64 - 0.29**cam.n)**0.73)**(1/0.9)

  if (description[2] === 'h') {
    h = data[2]
  }
  else {
    // console.assert(description[2] === 'H')
    // Step 1-3: Calculate h from H (if start from H)
    const H = data[2]
    const i = searchsorted(cam.H, H) - 1
    const Hi = cam.H[i]
    const hi = cam.h[i], hi1 = cam.h[i+1]
    const ei = cam.e[i], ei1 = cam.e[i+1]
    const hʹ = ((H-Hi)*(ei1*hi-ei*hi1)-100*hi*ei1) / ((H-Hi)*(ei1-ei)-100*ei1)
    h = hʹ % 360
  }

  // Step 2: Calculate t, et, p1, p2 and p3
  const e_t = 0.25 * (cos(deg2rad*h + 2) + 3.8)
  const A = cam.A_w * (J/100)**(1/cam.c/cam.z)
  const pʹ_1 = e_t * 50000/13 * cam.N_c * cam.N_cb
  const pʹ_2 = A / cam.N_bb // no 0.305

  // Step 3: Calculate a and b
  // ENH Much more straightforward computation of a, b
  const sin_h = sin(deg2rad*h)
  const cos_h = cos(deg2rad*h)
  const γ = 23*(pʹ_2 + 0.305)*t / (23*pʹ_1 + 11*t*cos_h + 108*t*sin_h)
  const a = γ*cos_h
  const b = γ*sin_h

  // Step 4: Calculate RGB_a_
  const Rʹ_a = (460*pʹ_2 + 451*a +  288*b) / 1403
  const Gʹ_a = (460*pʹ_2 - 891*a -  261*b) / 1403
  const Bʹ_a = (460*pʹ_2 - 220*a - 6300*b) / 1403

  // Step 5: Calculate RGB_
  const R_c = sign(Rʹ_a) * 100/cam.F_L * (27.13*abs(Rʹ_a) / (400 - abs(Rʹ_a)))**(1/0.42)
  const G_c = sign(Gʹ_a) * 100/cam.F_L * (27.13*abs(Gʹ_a) / (400 - abs(Gʹ_a)))**(1/0.42)
  const B_c = sign(Bʹ_a) * 100/cam.F_L * (27.13*abs(Bʹ_a) / (400 - abs(Bʹ_a)))**(1/0.42)

  return [ R_c, G_c, B_c ]
}
