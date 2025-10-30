import { toast } from 'react-toastify';
import * as math from 'mathjs';

export const advancedMath = {
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
      if (!error.message.toLowerCase().includes('log'.toLowerCase())) {
        toast.error('Logarithm calculation failed');
      }
      throw error;
    }
  },

  ln: (x) => {
    try {
      const val = Number(x);
      if (isNaN(val)) {
        toast.error('ln : Input must be a number');
        throw new Error('Invalid input to ln');
      }
      if (val <= 0) {
        toast.error('ln : Cannot take natural log of zero or negative number');
        throw new Error('Natural log of non-positive number');
      }
      return Math.log(val);
    } catch (error) {
      if (!error.message.toLowerCase().includes('ln'.toLowerCase())) {
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
};
