import { atan2, cos, sqrt, hypot, abs, sign, deg2rad, rad2deg } from '../math'
import { searchsorted } from '../util'
import { CAM16 } from '../cam16'

export const forward = (cam: CAM16, RGB_c: number[]) => {
  // Step 4: Calculate the post-adaptation cone response (resulting in
  //         dynamic range compression)
  const α_0 = (cam.F_L * abs(RGB_c[0]) / 100)**0.42
  const α_1 = (cam.F_L * abs(RGB_c[1]) / 100)**0.42
  const α_2 = (cam.F_L * abs(RGB_c[2]) / 100)**0.42

  // Omit the 0.1 here; that's canceled out in almost all cases below anyways
  // (except the computation of `t`).
  const Rʹ_a = 400 * sign(RGB_c[0]) * α_0/(α_0+27.13) // + 0.1
  const Gʹ_a = 400 * sign(RGB_c[1]) * α_1/(α_1+27.13) // + 0.1
  const Bʹ_a = 400 * sign(RGB_c[2]) * α_2/(α_2+27.13) // + 0.1

  // Mix steps 5, 7, and part of step 10 here in one big dot-product.
  // Step 5: Calculate Redness-Greenness (a) , Yellowness-Blueness (b)
  //         components and hue angle (h)
  // Step 7: Calculate achromatic response A
  const pʹ_2 = 2*Rʹ_a   +    Gʹ_a    +    Bʹ_a/20
  const a    =   Rʹ_a   - 12*Gʹ_a/11 +    Bʹ_a/11
  const b    =   Rʹ_a/9 +    Gʹ_a/9  -  2*Bʹ_a/9
  const u    =   Rʹ_a   +    Gʹ_a    + 21*Bʹ_a/20

  const A = pʹ_2 * cam.N_bb
  if (A < 0)
    throw Error('CIECAM02 breakdown')

  // Make sure that h is in [0, 360]
  const h = (rad2deg*atan2(b, a) + 360) % 360

  // Step 6: Calculate eccentricity (e_t) and hue composition (H), using
  //         the unique hue data given in Table 2.4.
  const hʹ = (h - cam.h[0]) % 360 + cam.h[0]
  const e_t = (cos(deg2rad*hʹ + 2) + 3.8) / 4
  const i = searchsorted(cam.h, hʹ) - 1
  const β = cam.e[i+1] * (hʹ - cam.h[i])
  const H = cam.H[i] + 100*β/(β + cam.e[i]*(cam.h[i+1] - hʹ))

  // Step 8: Calculate the correlate of lightness
  const J = 100 * (A/cam.A_w)**(cam.c*cam.z)

  // Step 9: Calculate the correlate of brightness
  const sqrt_J_100 = sqrt(J/100)
  const Q = (4/cam.c) * sqrt_J_100 * (cam.A_w + 4) * cam.F_L**0.25

  // Step 10: Calculate the correlates of chroma (C), colourfulness (M)
  //          and saturation (s)
  //
  // Note the extra 0.305 here from the adaptation in rgb_a_ above.
  const t = 50000/13*e_t*cam.N_c*cam.N_cb*hypot(a, b) / (u + 0.305)

  const α = t**0.9 * (1.64 - 0.29**cam.n)**0.73
  const C = α * sqrt_J_100
  const M = C * cam.F_L**0.25

  // ENH avoid division by Q=0 here.
  // s = 100 * numpy.sqrt(M/Q)
  const s = 50 * sqrt(cam.c*α / (cam.A_w + 4))

  return [J, C, H, h, M, s, Q]
}
