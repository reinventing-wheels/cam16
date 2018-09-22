"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abs = Math.abs, exports.acos = Math.acos, exports.acosh = Math.acosh, exports.asin = Math.asin, exports.asinh = Math.asinh, exports.atan = Math.atan, exports.atan2 = Math.atan2, exports.atanh = Math.atanh, exports.cbrt = Math.cbrt, exports.ceil = Math.ceil, exports.clz32 = Math.clz32, exports.cos = Math.cos, exports.cosh = Math.cosh, exports.exp = Math.exp, exports.expm1 = Math.expm1, exports.floor = Math.floor, exports.fround = Math.fround, exports.hypot = Math.hypot, exports.imul = Math.imul, exports.log = Math.log, exports.log10 = Math.log10, exports.log1p = Math.log1p, exports.log2 = Math.log2, exports.max = Math.max, exports.min = Math.min, exports.pow = Math.pow, exports.random = Math.random, exports.round = Math.round, exports.sign = Math.sign, exports.sin = Math.sin, exports.sinh = Math.sinh, exports.sqrt = Math.sqrt, exports.tan = Math.tan, exports.tanh = Math.tanh, exports.trunc = Math.trunc, exports.E = Math.E, exports.LN10 = Math.LN10, exports.LN2 = Math.LN2, exports.LOG10E = Math.LOG10E, exports.LOG2E = Math.LOG2E, exports.PI = Math.PI, exports.SQRT1_2 = Math.SQRT1_2, exports.SQRT2 = Math.SQRT2;
exports.isFinite = Number.isFinite, exports.isInteger = Number.isInteger, exports.isNaN = Number.isNaN, exports.isSafeInteger = Number.isSafeInteger, exports.parseFloat = Number.parseFloat, exports.parseInt = Number.parseInt, exports.EPSILON = Number.EPSILON, exports.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER, exports.MAX_VALUE = Number.MAX_VALUE, exports.MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER, exports.MIN_VALUE = Number.MIN_VALUE, exports.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, exports.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
exports.deg2rad = exports.PI / 180;
exports.rad2deg = 180 / exports.PI;
exports.nan2num = (n) => exports.isNaN(n) ? 0 : exports.isFinite(n) ? n : exports.sign(n) * exports.MAX_VALUE;
