import { create, all } from 'mathjs';
import { toast } from 'react-toastify';

const math = create(all, { number: 'number', precision: 15 });

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



export default math;