import { create, all } from 'mathjs';
import { toast } from 'react-toastify';

/**
 * Create mathjs instance with custom configuration
 * @type {Object}
 */
const math = create(all, { number: 'number', precision: 15 });

/**
 * Store original divide function before override
 * @private
 */
const originalDivide = math.divide;

/**
 * Override divide function to handle division by zero gracefully
 * Shows toast error and throws meaningful error message
 */
math.import({
  divide(...args) {
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
      toast.error(`Division error: ${error.message}`);
      throw error;
    }
  },
}, { override: true });

export default math;
