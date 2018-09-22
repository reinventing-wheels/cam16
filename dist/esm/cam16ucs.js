import { atan2, cos, sin, hypot, exp, log, rad2deg, deg2rad } from './math';
import { CAM16 } from './cam16';
const K_L = 1.0;
const c_1 = 0.007;
const c_2 = 0.0228;
export class CAM16UCS extends CAM16 {
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
