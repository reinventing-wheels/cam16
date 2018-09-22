"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = require("../math");
const util_1 = require("../util");
exports.reverse = (cam, data, description) => {
    let J, Q, h, α = 0;
    if (description[0] === 'J') {
        J = data[0];
        Q = (4 / cam.c) * math_1.sqrt(J / 100) * (cam.A_w + 4) * cam.F_L ** 0.25;
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
        α = C / math_1.sqrt(J / 100);
        α = math_1.nan2num(α);
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
        const i = util_1.searchsorted(cam.H, H) - 1;
        const Hi = cam.H[i];
        const hi = cam.h[i], hi1 = cam.h[i + 1];
        const ei = cam.e[i], ei1 = cam.e[i + 1];
        const hʹ = ((H - Hi) * (ei1 * hi - ei * hi1) - 100 * hi * ei1) / ((H - Hi) * (ei1 - ei) - 100 * ei1);
        h = hʹ % 360;
    }
    const e_t = 0.25 * (math_1.cos(math_1.deg2rad * h + 2) + 3.8);
    const A = cam.A_w * (J / 100) ** (1 / cam.c / cam.z);
    const pʹ_1 = e_t * 50000 / 13 * cam.N_c * cam.N_cb;
    const pʹ_2 = A / cam.N_bb;
    const sin_h = math_1.sin(math_1.deg2rad * h);
    const cos_h = math_1.cos(math_1.deg2rad * h);
    const γ = 23 * (pʹ_2 + 0.305) * t / (23 * pʹ_1 + 11 * t * cos_h + 108 * t * sin_h);
    const a = γ * cos_h;
    const b = γ * sin_h;
    const Rʹ_a = (460 * pʹ_2 + 451 * a + 288 * b) / 1403;
    const Gʹ_a = (460 * pʹ_2 - 891 * a - 261 * b) / 1403;
    const Bʹ_a = (460 * pʹ_2 - 220 * a - 6300 * b) / 1403;
    const R_c = math_1.sign(Rʹ_a) * 100 / cam.F_L * (27.13 * math_1.abs(Rʹ_a) / (400 - math_1.abs(Rʹ_a))) ** (1 / 0.42);
    const G_c = math_1.sign(Gʹ_a) * 100 / cam.F_L * (27.13 * math_1.abs(Gʹ_a) / (400 - math_1.abs(Gʹ_a))) ** (1 / 0.42);
    const B_c = math_1.sign(Bʹ_a) * 100 / cam.F_L * (27.13 * math_1.abs(Bʹ_a) / (400 - math_1.abs(Bʹ_a))) ** (1 / 0.42);
    return [R_c, G_c, B_c];
};
