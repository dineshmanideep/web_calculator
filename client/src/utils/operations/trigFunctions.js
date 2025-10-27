import { toast } from 'react-toastify';

export const trigFunctions = {
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
};
