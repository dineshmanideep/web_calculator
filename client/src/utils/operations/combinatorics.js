import { toast } from "react-toastify";

export const combinatorics = {
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
  }
};