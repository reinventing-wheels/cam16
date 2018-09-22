import { PI, exp, sqrt, cbrt, min, max } from './math';
import { D65 } from './illuminants/cie1931';
import { forward } from './transforms/forward';
import { reverse } from './transforms/reverse';
import { interp } from './util';
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
export class CAM16 {
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
