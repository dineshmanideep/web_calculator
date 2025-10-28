import math from './math.config';
import { basicOperations } from './operations/basicOperations';
import { trigFunctions } from './operations/trigFunctions';
import { angleConversions } from './operations/angleConversions';
import { advancedMath } from './operations/advancedMath';
import { combinatorics } from './operations/combinatorics';

/**
 * Numerical integration using trapezoidal rule
 *
 * @param {string} exprStr - Expression string to integrate
 * @param {number} a - Lower limit of integration
 * @param {number} b - Upper limit of integration
 * @param {number} [n=1000] - Number of subintervals (higher = more accurate)
 * @returns {number} Approximate value of definite integral
 *
 * @example
 * math.defInt("x^2", 0, 1, 1000) // ≈ 0.333
 */
const defInt = (exprStr, a, b, n = 1000) => {
  const f = math.parse(exprStr).compile();
  const step = (b - a) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const x = a + i * step;
    const fx = f.evaluate({ x });
    sum += (i === 0 || i === n ? fx / 2 : fx);
  }
  return sum * step;
};

/**
 * Import all custom operations into math instance
 */
math.import({
  ...basicOperations,
  ...trigFunctions,
  ...angleConversions,
  ...advancedMath,
  ...combinatorics,
  defInt,
}, { override: true });

/**
 * Extended math instance with all custom operations
 * @type {Object}
 */
export default math;
