import { create, all } from 'mathjs';

const math = create(all, { number: 'number', precision: 7 });

math.import({
  deg2rad: (deg) => (typeof deg === 'number' ? deg * Math.PI / 180 : math.evaluate(`${deg} * pi / 180`)),
  rad2deg: (rad) => (typeof rad === 'number' ? rad * 180 / Math.PI : math.evaluate(`${rad} * 180 / pi`)),
  nCr: (n, r) => {
    if (!Number.isFinite(n) || !Number.isFinite(r)) throw new Error('Invalid inputs');
    return math.combinations ? math.combinations(n, r)
      : math.factorial(n) / (math.factorial(r) * math.factorial(n - r));
  },
  nPr: (n, r) => {
    if (!Number.isFinite(n) || !Number.isFinite(r)) throw new Error('Invalid inputs');
    return math.factorial(n) / math.factorial(n - r);
  },
}, { override: true });

export default math;
