export declare class CAM16 {
    c: number;
    N_c: number;
    F_L: number;
    n: number;
    z: number;
    N_bb: number;
    N_cb: number;
    A_w: number;
    h: number[];
    e: number[];
    H: number[];
    Mʹ: number[][];
    invMʹ: number[][];
    constructor(c?: number, Y_b?: number, L_A?: number, wp?: number[]);
    fromXYZ([X, Y, Z]: number[]): number[];
    toXYZ(data: number[], description: string): number[];
}
