import { toast } from "react-toastify";

export const basicOperations ={

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
  }
}