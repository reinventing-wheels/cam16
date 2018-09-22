(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.cam16 = {})));
}(this, (function (exports) { 'use strict';

  const { abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2 } = Math;
  const { isFinite, isInteger, isNaN, isSafeInteger, parseFloat, parseInt, EPSILON, MAX_SAFE_INTEGER, MAX_VALUE, MIN_SAFE_INTEGER, MIN_VALUE, NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;
  const deg2rad = PI / 180;
  const rad2deg = 180 / PI;
  const nan2num = (n) => isNaN(n) ? 0 : isFinite(n) ? n : sign(n) * MAX_VALUE;

  const D65 = [95.047, 100, 108.883];

  const interp = (xp, fp) => (x) => {
      for (let i = 1; i < xp.length; i++) {
          const xʹ = xp[i - 1];
          const xʺ = xp[i];
          if (xʹ <= x && x <= xʺ) {
              const fʹ = fp[i - 1];
              const fʺ = fp[i];
              const t = (x - xʹ) / (xʺ - xʹ);
              return fʹ + t * (fʺ - fʹ);
          }
      }
      throw new Error('wtf');
  };
  const searchsorted = (a, v) => {
      if (v < a[0])
          return 0;
      if (v > a[a.length - 1])
          return a.length;
      for (let i = 1; i < a.length; i++) {
          const aʹ = a[i - 1];
          const aʺ = a[i];
          if (aʹ <= v && v <= aʺ)
              return i;
      }
      throw new Error('wtf');
  };

  const forward = (cam, RGB_c) => {
      const α_0 = (cam.F_L * abs(RGB_c[0]) / 100) ** 0.42;
      const α_1 = (cam.F_L * abs(RGB_c[1]) / 100) ** 0.42;
      const α_2 = (cam.F_L * abs(RGB_c[2]) / 100) ** 0.42;
      const Rʹ_a = 400 * sign(RGB_c[0]) * α_0 / (α_0 + 27.13);
      const Gʹ_a = 400 * sign(RGB_c[1]) * α_1 / (α_1 + 27.13);
      const Bʹ_a = 400 * sign(RGB_c[2]) * α_2 / (α_2 + 27.13);
      const pʹ_2 = 2 * Rʹ_a + Gʹ_a + Bʹ_a / 20;
      const a = Rʹ_a - 12 * Gʹ_a / 11 + Bʹ_a / 11;
      const b = Rʹ_a / 9 + Gʹ_a / 9 - 2 * Bʹ_a / 9;
      const u = Rʹ_a + Gʹ_a + 21 * Bʹ_a / 20;
      const A = pʹ_2 * cam.N_bb;
      if (A < 0)
          throw Error('CIECAM02 breakdown');
      const h = (rad2deg * atan2(b, a) + 360) % 360;
      const hʹ = (h - cam.h[0]) % 360 + cam.h[0];
      const e_t = (cos(deg2rad * hʹ + 2) + 3.8) / 4;
      const i = searchsorted(cam.h, hʹ) - 1;
      const β = cam.e[i + 1] * (hʹ - cam.h[i]);
      const H = cam.H[i] + 100 * β / (β + cam.e[i] * (cam.h[i + 1] - hʹ));
      const J = 100 * (A / cam.A_w) ** (cam.c * cam.z);
      const sqrt_J_100 = sqrt(J / 100);
      const Q = (4 / cam.c) * sqrt_J_100 * (cam.A_w + 4) * cam.F_L ** 0.25;
      const t = 50000 / 13 * e_t * cam.N_c * cam.N_cb * hypot(a, b) / (u + 0.305);
      const α = t ** 0.9 * (1.64 - 0.29 ** cam.n) ** 0.73;
      const C = α * sqrt_J_100;
      const M = C * cam.F_L ** 0.25;
      const s = 50 * sqrt(cam.c * α / (cam.A_w + 4));
      return [J, C, H, h, M, s, Q];
  };

  const reverse = (cam, data, description) => {
      let J, Q, h, α = 0;
      if (description[0] === 'J') {
          J = data[0];
          Q = (4 / cam.c) * sqrt(J / 100) * (cam.A_w + 4) * cam.F_L ** 0.25;
      }
      else {
          Q = data[0];
          J = 6.25 * (cam.c * Q / (cam.A_w + 4) / cam.F_L ** 0.25) ** 2;
      }
      if ('CM'.includes(description[1])) {
          let M, C;
          if (description[1] === 'M') {
              M = data[1];
              C = M / cam.F_L ** 0.25;
          }
          else {
              C = data[1];
          }
          α = C / sqrt(J / 100);
          α = nan2num(α);
      }
      else {
          const s = data[1] / 100;
          α = 4 * s * s * (cam.A_w + 4) / cam.c;
      }
      const t = (α / (1.64 - 0.29 ** cam.n) ** 0.73) ** (1 / 0.9);
      if (description[2] === 'h') {
          h = data[2];
      }
      else {
          const H = data[2];
          const i = searchsorted(cam.H, H) - 1;
          const Hi = cam.H[i];
          const hi = cam.h[i], hi1 = cam.h[i + 1];
          const ei = cam.e[i], ei1 = cam.e[i + 1];
          const hʹ = ((H - Hi) * (ei1 * hi - ei * hi1) - 100 * hi * ei1) / ((H - Hi) * (ei1 - ei) - 100 * ei1);
          h = hʹ % 360;
      }
      const e_t = 0.25 * (cos(deg2rad * h + 2) + 3.8);
      const A = cam.A_w * (J / 100) ** (1 / cam.c / cam.z);
      const pʹ_1 = e_t * 50000 / 13 * cam.N_c * cam.N_cb;
      const pʹ_2 = A / cam.N_bb;
      const sin_h = sin(deg2rad * h);
      const cos_h = cos(deg2rad * h);
      const γ = 23 * (pʹ_2 + 0.305) * t / (23 * pʹ_1 + 11 * t * cos_h + 108 * t * sin_h);
      const a = γ * cos_h;
      const b = γ * sin_h;
      const Rʹ_a = (460 * pʹ_2 + 451 * a + 288 * b) / 1403;
      const Gʹ_a = (460 * pʹ_2 - 891 * a - 261 * b) / 1403;
      const Bʹ_a = (460 * pʹ_2 - 220 * a - 6300 * b) / 1403;
      const R_c = sign(Rʹ_a) * 100 / cam.F_L * (27.13 * abs(Rʹ_a) / (400 - abs(Rʹ_a))) ** (1 / 0.42);
      const G_c = sign(Gʹ_a) * 100 / cam.F_L * (27.13 * abs(Gʹ_a) / (400 - abs(Gʹ_a))) ** (1 / 0.42);
      const B_c = sign(Bʹ_a) * 100 / cam.F_L * (27.13 * abs(Bʹ_a) / (400 - abs(Bʹ_a))) ** (1 / 0.42);
      return [R_c, G_c, B_c];
  };

  const M16 = [
      [+0.401288, +0.650173, -0.051461],
      [-0.250268, +1.204414, +0.045854],
      [-0.002079, +0.048952, +0.953127]
  ];
  const invM16 = [
      [+1.86206786, -1.01125463, +0.14918677],
      [+0.38752654, +0.62144744, -0.00897398],
      [-0.01584150, -0.03412294, +1.04996444]
  ];
  const interp_F = interp([0.525, 0.590, 0.690], [0.800, 0.900, 1.000]);
  class CAM16 {
      constructor(c = 0.69, Y_b = 20, L_A = 64 / PI / 5, wp = D65) {
          const Y_w = wp[1];
          const F = interp_F(c);
          this.c = c;
          this.N_c = F;
          const k = 1 / (5 * L_A + 1);
          const k4 = k * k * k * k;
          const l4 = 1 - k4;
          this.F_L = k4 * L_A + 0.1 * l4 * l4 * cbrt(5 * L_A);
          this.n = Y_b / Y_w;
          this.z = 1.48 + sqrt(this.n);
          this.N_bb = 0.725 / this.n ** 0.2;
          this.N_cb = this.N_bb;
          const R_w = M16[0][0] * wp[0] + M16[0][1] * wp[1] + M16[0][2] * wp[2];
          const G_w = M16[1][0] * wp[0] + M16[1][1] * wp[1] + M16[1][2] * wp[2];
          const B_w = M16[2][0] * wp[0] + M16[2][1] * wp[1] + M16[2][2] * wp[2];
          const D = max(0.0, min(1.0, F * (1 - 1 / 3.6 * exp((-L_A - 42) / 92))));
          const D_r = D * Y_w / R_w + 1 - D;
          const D_g = D * Y_w / G_w + 1 - D;
          const D_b = D * Y_w / B_w + 1 - D;
          const R_wc = D_r * R_w;
          const G_wc = D_g * G_w;
          const B_wc = D_b * B_w;
          const α_0 = (this.F_L * R_wc / 100) ** 0.42;
          const α_1 = (this.F_L * G_wc / 100) ** 0.42;
          const α_2 = (this.F_L * B_wc / 100) ** 0.42;
          const R_aw = 400 * α_0 / (α_0 + 27.13) + 0.1;
          const G_aw = 400 * α_1 / (α_1 + 27.13) + 0.1;
          const B_aw = 400 * α_2 / (α_2 + 27.13) + 0.1;
          this.A_w = (2 * R_aw + G_aw + B_aw / 20 - 0.305) * this.N_bb;
          this.h = [20.14, 90.00, 164.25, 237.53, 380.14];
          this.e = [0.80, 0.70, 1.00, 1.20, 0.80];
          this.H = [0.00, 100.00, 200.00, 300.00, 400.00];
          this.Mʹ = [
              [M16[0][0] * D_r, M16[0][1] * D_r, M16[0][2] * D_r],
              [M16[1][0] * D_g, M16[1][1] * D_g, M16[1][2] * D_g],
              [M16[2][0] * D_b, M16[2][1] * D_b, M16[2][2] * D_b]
          ];
          this.invMʹ = [
              [invM16[0][0] / D_r, invM16[0][1] / D_g, invM16[0][2] / D_b],
              [invM16[1][0] / D_r, invM16[1][1] / D_g, invM16[1][2] / D_b],
              [invM16[2][0] / D_r, invM16[2][1] / D_g, invM16[2][2] / D_b]
          ];
      }
      fromXYZ([X, Y, Z]) {
          const [m_0, m_1, m_2] = this.Mʹ;
          const RGB_c = [
              m_0[0] * X + m_0[1] * Y + m_0[2] * Z,
              m_1[0] * X + m_1[1] * Y + m_1[2] * Z,
              m_2[0] * X + m_2[1] * Y + m_2[2] * Z
          ];
          return forward(this, RGB_c);
      }
      toXYZ(data, description) {
          const [R_c, G_c, B_c] = reverse(this, data, description);
          const [m_0, m_1, m_2] = this.invMʹ;
          return [
              m_0[0] * R_c + m_0[1] * G_c + m_0[2] * B_c,
              m_1[0] * R_c + m_1[1] * G_c + m_1[2] * B_c,
              m_2[0] * R_c + m_2[1] * G_c + m_2[2] * B_c
          ];
      }
  }

  const K_L = 1.0;
  const c_1 = 0.007;
  const c_2 = 0.0228;
  class CAM16UCS extends CAM16 {
      fromXYZ(xyz) {
          const [J, , , h, M] = super.fromXYZ(xyz);
          const Jʺ = (1 + 100 * c_1) * J / (1 + c_1 * J);
          const Jʹ = Jʺ / K_L;
          const Mʹ = 1 / c_2 * log(1 + c_2 * M);
          const hʹ = deg2rad * h;
          return [Jʹ, Mʹ * cos(hʹ), Mʹ * sin(hʹ)];
      }
      toXYZ([J, a, b]) {
          const Jʺ = J * K_L;
          const Jʹ = Jʺ / (1 - (Jʺ - 100) * c_1);
          const h = rad2deg * atan2(b, a) % 360;
          const M = hypot(a, b);
          const Mʹ = (exp(M * c_2) - 1) / c_2;
          return super.toXYZ([Jʹ, Mʹ, h], 'JMh');
      }
  }

  exports.CAM16 = CAM16;
  exports.CAM16UCS = CAM16UCS;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=cam16.js.map
