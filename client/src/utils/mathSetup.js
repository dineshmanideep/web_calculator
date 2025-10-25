import { create, all } from 'mathjs';
import { toast } from 'react-toastify';

const math = create(all, { number: 'number', precision: 14 });

// Override divide for division by zero checking
const originalDivide = math.divide;
math.import({
  divide: function(...args) {
    try {
      const result = originalDivide(...args);
      if (!isFinite(result) && typeof result === 'number') {
        toast.error('Error: Division by zero');
        throw new Error('Division by zero');
      }
      return result;
    } catch (error) {
      if (error.message.includes('Division by zero')) {
        throw error;
      }
      toast.error('Division error: ' + error.message);
      throw error;
    }
  }
}, { override: true });

// Add custom functions
math.import({
  // Angle conversions
  deg2rad: (deg) => {
    try {
      if (typeof deg !== 'number' && isNaN(Number(deg))) {
        toast.error('deg2rad: Input must be a number');
        throw new Error('Invalid input to deg2rad');
      }
      return typeof deg === 'number' ? deg * Math.PI / 180 : math.evaluate(`${deg} * pi / 180`);
    } catch (error) {
      toast.error('Degree to radian conversion failed');
      throw error;
    }
  },
  
  rad2deg: (rad) => {
    try {
      if (typeof rad !== 'number' && isNaN(Number(rad))) {
        toast.error('rad2deg: Input must be a number');
        throw new Error('Invalid input to rad2deg');
      }
      return typeof rad === 'number' ? rad * 180 / Math.PI : math.evaluate(`${rad} * 180 / pi`);
    } catch (error) {
      toast.error('Radian to degree conversion failed');
      throw error;
    }
  },

  // Combinatorics
  nCr: (n, r) => {
    try {
      if (!Number.isFinite(n) || !Number.isFinite(r)) {
        toast.error('nCr: Both n and r must be finite numbers');
        throw new Error('Invalid inputs');
      }
      if (n < 0 || r < 0) {
        toast.error('nCr: n and r must be non-negative');
        throw new Error('Negative input to nCr');
      }
      if (r > n) {
        toast.error('nCr: r cannot be greater than n');
        throw new Error('Invalid combination: r > n');
      }
      if (!Number.isInteger(n) || !Number.isInteger(r)) {
        toast.error('nCr: n and r must be integers');
        throw new Error('Non-integer input to nCr');
      }
      return math.combinations ? math.combinations(n, r)
        : math.factorial(n) / (math.factorial(r) * math.factorial(n - r));
    } catch (error) {
      if (!error.message.includes('nCr')) {
        toast.error('Combination calculation failed');
      }
      throw error;
    }
  },

  nPr: (n, r) => {
    try {
      if (!Number.isFinite(n) || !Number.isFinite(r)) {
        toast.error('nPr: Both n and r must be finite numbers');
        throw new Error('Invalid inputs');
      }
      if (n < 0 || r < 0) {
        toast.error('nPr: n and r must be non-negative');
        throw new Error('Negative input to nPr');
      }
      if (r > n) {
        toast.error('nPr: r cannot be greater than n');
        throw new Error('Invalid permutation: r > n');
      }
      if (!Number.isInteger(n) || !Number.isInteger(r)) {
        toast.error('nPr: n and r must be integers');
        throw new Error('Non-integer input to nPr');
      }
      return math.factorial(n) / math.factorial(n - r);
    } catch (error) {
      if (!error.message.includes('nPr')) {
        toast.error('Permutation calculation failed');
      }
      throw error;
    }
  },

  // Math functions with validation
  sqrt: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('sqrt: Input must be a number');
        throw new Error('Invalid input to sqrt');
      }
      if (val < 0) {
        // Allow complex result
        return math.complex(0, Math.sqrt(-val));
      }
      return Math.sqrt(val);
    } catch (error) {
      if (!error.message.includes('sqrt')) {
        toast.error('Square root calculation failed');
      }
      throw error;
    }
  },

  log: (x, base) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('log: Input must be a number');
        throw new Error('Invalid input to log');
      }
      if (val <= 0) {
        toast.error('log: Cannot take logarithm of zero or negative number');
        throw new Error('Logarithm of non-positive number');
      }
      if (base !== undefined) {
        const b = Number(base);
        if (isNaN(b) || b <= 0 || b === 1) {
          toast.error('log: Base must be positive and not equal to 1');
          throw new Error('Invalid logarithm base');
        }
        return Math.log(val) / Math.log(b);
      }
      return Math.log10(val);
    } catch (error) {
      if (!error.message.includes('log')) {
        toast.error('Logarithm calculation failed');
      }
      throw error;
    }
  },

  ln: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('ln: Input must be a number');
        throw new Error('Invalid input to ln');
      }
      if (val <= 0) {
        toast.error('ln: Cannot take natural log of zero or negative number');
        throw new Error('Natural log of non-positive number');
      }
      return Math.log(val);
    } catch (error) {
      if (!error.message.includes('ln')) {
        toast.error('Natural logarithm calculation failed');
      }
      throw error;
    }
  },

  factorial: (n) => {
    try {
      const val = Number(n);
      if (isNaN(val)) {
        toast.error('factorial: Input must be a number');
        throw new Error('Invalid input to factorial');
      }
      if (val < 0) {
        toast.error('factorial: Cannot calculate factorial of negative number');
        throw new Error('Factorial of negative number');
      }
      if (!Number.isInteger(val)) {
        toast.error('factorial: Input must be an integer');
        throw new Error('Factorial of non-integer');
      }
      if (val > 170) {
        toast.error('factorial: Number too large (max 170)');
        throw new Error('Factorial overflow');
      }
      
      let result = 1;
      for (let i = 2; i <= val; i++) {
        result *= i;
      }
      return result;
    } catch (error) {
      if (!error.message.includes('factorial')) {
        toast.error('Factorial calculation failed');
      }
      throw error;
    }
  },

  // Trig functions
  sin: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('sin: Input must be a number');
        throw new Error('Invalid input to sin');
      }
      if (!isFinite(val)) {
        toast.error('sin: Input must be finite');
        throw new Error('Infinite input to sin');
      }
      return Math.sin(val);
    } catch (error) {
      if (!error.message.includes('sin')) {
        toast.error('Sine calculation failed');
      }
      throw error;
    }
  },

  cos: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('cos: Input must be a number');
        throw new Error('Invalid input to cos');
      }
      if (!isFinite(val)) {
        toast.error('cos: Input must be finite');
        throw new Error('Infinite input to cos');
      }
      return Math.cos(val);
    } catch (error) {
      if (!error.message.includes('cos')) {
        toast.error('Cosine calculation failed');
      }
      throw error;
    }
  },

  tan: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('tan: Input must be a number');
        throw new Error('Invalid input to tan');
      }
      if (!isFinite(val)) {
        toast.error('tan: Input must be finite');
        throw new Error('Infinite input to tan');
      }
      
      const result = Math.tan(val);
      
      if (!isFinite(result)) {
        toast.error('tan: Result undefined at this angle');
        throw new Error('Tangent undefined');
      }
      
      return result;
    } catch (error) {
      if (!error.message.includes('tan')) {
        toast.error('Tangent calculation failed');
      }
      throw error;
    }
  },

  asin: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('asin: Input must be a number');
        throw new Error('Invalid input to asin');
      }
      if (val < -1 || val > 1) {
        toast.error('asin: Input must be between -1 and 1');
        throw new Error('asin input out of range');
      }
      return Math.asin(val);
    } catch (error) {
      if (!error.message.includes('asin')) {
        toast.error('Arcsine calculation failed');
      }
      throw error;
    }
  },

  acos: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('acos: Input must be a number');
        throw new Error('Invalid input to acos');
      }
      if (val < -1 || val > 1) {
        toast.error('acos: Input must be between -1 and 1');
        throw new Error('acos input out of range');
      }
      return Math.acos(val);
    } catch (error) {
      if (!error.message.includes('acos')) {
        toast.error('Arccosine calculation failed');
      }
      throw error;
    }
  },

  atan: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('atan: Input must be a number');
        throw new Error('Invalid input to atan');
      }
      if (!isFinite(val)) {
        toast.error('atan: Input must be finite');
        throw new Error('Infinite input to atan');
      }
      return Math.atan(val);
    } catch (error) {
      if (!error.message.includes('atan')) {
        toast.error('Arctangent calculation failed');
      }
      throw error;
    }
  },

  pow: (base, exponent) => {
    try {
      const b = Number(base);
      const e = Number(exponent);
      
      if (isNaN(b) || isNaN(e)) {
        toast.error('pow: Both base and exponent must be numbers');
        throw new Error('Invalid input to pow');
      }
      
      if (b === 0 && e === 0) {
        toast.error('pow: 0^0 is undefined');
        throw new Error('0^0 is undefined');
      }
      
      if (b < 0 && !Number.isInteger(e)) {
        // Return complex result
        const r = Math.pow(Math.abs(b), e);
        const theta = Math.PI * e;
        return math.complex(r * Math.cos(theta), r * Math.sin(theta));
      }
      
      if (b === 0 && e < 0) {
        toast.error('pow: Cannot raise 0 to negative power');
        throw new Error('0^(-n) is undefined');
      }
      
      const result = Math.pow(b, e);
      
      if (!isFinite(result)) {
        toast.error('pow: Result is too large or undefined');
        throw new Error('Power result overflow');
      }
      
      return result;
    } catch (error) {
      if (!error.message.includes('pow') && !error.message.includes('^')) {
        toast.error('Power calculation failed');
      }
      throw error;
    }
  },

  mod: (dividend, divisor) => {
    try {
      const a = Number(dividend);
      const b = Number(divisor);
      
      if (isNaN(a) || isNaN(b)) {
        toast.error('mod: Both dividend and divisor must be numbers');
        throw new Error('Invalid input to mod');
      }
      
      if (b === 0) {
        toast.error('mod: Cannot perform modulo with divisor of zero');
        throw new Error('Modulo by zero');
      }
      
      return a % b;
    } catch (error) {
      if (!error.message.includes('mod')) {
        toast.error('Modulo calculation failed');
      }
      throw error;
    }
  },
}, { override: true });

// Override evaluate to catch errors
const originalEvaluate = math.evaluate;
math.evaluate = function(...args) {
  try {
    const result = originalEvaluate.apply(this, args);
    
    if (typeof result === 'number') {
      if (isNaN(result)) {
        toast.error('Calculation resulted in undefined value (NaN)');
        throw new Error('Result is NaN');
      }
      if (result === Infinity) {
        toast.error('Calculation resulted in positive infinity');
        throw new Error('Result is Infinity');
      }
      if (result === -Infinity) {
        toast.error('Calculation resulted in negative infinity');
        throw new Error('Result is -Infinity');
      }
    }
    
    return result;
  } catch (error) {
    if (!error.message.includes('Division by zero') && 
        !error.message.includes('sqrt') &&
        !error.message.includes('log') &&
        !error.message.includes('factorial') &&
        !error.message.includes('nCr') &&
        !error.message.includes('nPr') &&
        !error.message.includes('pow') &&
        !error.message.includes('mod') &&
        !error.message.includes('tan') &&
        !error.message.includes('asin') &&
        !error.message.includes('acos') &&
        !error.message.includes('NaN') &&
        !error.message.includes('Infinity')) {
      
      if (error.message.includes('Undefined symbol')) {
        const symbol = error.message.split('Undefined symbol')[1]?.trim() || 'unknown';
        toast.error(`Error: Unknown variable or function '${symbol}'`);
      } else if (error.message.includes('Unexpected')) {
        toast.error('Syntax Error: Invalid expression format');
      } else if (error.message.includes('value expected')) {
        toast.error('Syntax Error: Missing value in expression');
      } else if (error.message.includes('unexpected end of expression')) {
        toast.error('Syntax Error: Incomplete expression');
      } else if (error.message.includes('unexpected operator')) {
        toast.error('Syntax Error: Operator used incorrectly');
      } else {
        toast.error(`Math Error: ${error.message}`);
      }
    }
    throw error;
  }
};

export default math;