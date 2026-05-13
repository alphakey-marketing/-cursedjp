export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

export const sumOf = (arr: number[]): number =>
  arr.reduce((acc, v) => acc + v, 0);

export const productOf = (arr: number[]): number =>
  arr.reduce((acc, v) => acc * v, 1);
