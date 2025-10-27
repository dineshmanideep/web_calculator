import { toast } from 'react-toastify';
import math from './index.js';

// Override evaluate to catch errors
const originalEvaluate = math.evaluate;
math.evaluate = function (...args) {
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
    if (!error.message.includes('Division by zero')
        && !error.message.includes('sqrt')
        && !error.message.includes('log')
        && !error.message.includes('factorial')
        && !error.message.includes('nCr')
        && !error.message.includes('nPr')
        && !error.message.includes('pow')
        && !error.message.includes('mod')
        && !error.message.includes('tan')
        && !error.message.includes('asin')
        && !error.message.includes('acos')
        && !error.message.includes('NaN')
        && !error.message.includes('Infinity')) {
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
