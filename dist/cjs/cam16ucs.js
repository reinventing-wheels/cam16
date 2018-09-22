"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = require("./math");
const cam16_1 = require("./cam16");
const K_L = 1.0;
const c_1 = 0.007;
const c_2 = 0.0228;
class CAM16UCS extends cam16_1.CAM16 {
    fromXYZ(xyz) {
        const [J, , , h, M] = super.fromXYZ(xyz);
        const Jʺ = (1 + 100 * c_1) * J / (1 + c_1 * J);
        const Jʹ = Jʺ / K_L;
        const Mʹ = 1 / c_2 * math_1.log(1 + c_2 * M);
        const hʹ = math_1.deg2rad * h;
        return [Jʹ, Mʹ * math_1.cos(hʹ), Mʹ * math_1.sin(hʹ)];
    }
    toXYZ([J, a, b]) {
        const Jʺ = J * K_L;
        const Jʹ = Jʺ / (1 - (Jʺ - 100) * c_1);
        const h = math_1.rad2deg * math_1.atan2(b, a) % 360;
        const M = math_1.hypot(a, b);
        const Mʹ = (math_1.exp(M * c_2) - 1) / c_2;
        return super.toXYZ([Jʹ, Mʹ, h], 'JMh');
    }
}
exports.CAM16UCS = CAM16UCS;
