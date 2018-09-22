export const { abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc, E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2 } = Math;
export const { isFinite, isInteger, isNaN, isSafeInteger, parseFloat, parseInt, EPSILON, MAX_SAFE_INTEGER, MAX_VALUE, MIN_SAFE_INTEGER, MIN_VALUE, NEGATIVE_INFINITY, POSITIVE_INFINITY } = Number;
export const deg2rad = PI / 180;
export const rad2deg = 180 / PI;
export const nan2num = (n) => isNaN(n) ? 0 : isFinite(n) ? n : sign(n) * MAX_VALUE;
