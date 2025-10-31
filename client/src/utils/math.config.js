/**
 * Author: P. Dinesh Manideep
 * Description: Configures a custom math.js instance with enhanced division handling. 
 * Prevents division by zero, provides descriptive error messages, and shows toast 
 * notifications for math-related errors.
 */

import { create, all } from 'mathjs';
import { toast } from 'react-toastify';


// Create mathjs instance with custom configuration
 
const math = create(all, { number: 'number', precision: 15 });


 // Store original divide function before override

const originalDivide = math.divide;

// Override divide function to handle division by zero gracefully Shows toast error and throws meaningful error message
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
