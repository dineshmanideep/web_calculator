import { toast } from 'react-toastify';
import math from './math.lib';

/**
 * Preprocess mathematical expression before evaluation
 * Handles angle mode conversions, special syntax, and function name transformations
 *
 * @param {string} expr - Mathematical expression to preprocess
 * @param {string} angleMode - Either 'deg' (degrees) or 'rad' (radians)
 * @returns {string} Preprocessed expression ready for evaluation
 * @throws {Error} If preprocessing fails
 *
 * @example
 * preprocess('sin(90)', 'deg') // 'sin(deg2rad(90))'
 * preprocess('∫(x^2, 0, 1)', 'rad') // 'defInt("x^2", 0, 1)'
 */
export const preprocessExpression = (expr, angleMode) => {
  try {
    let processed = expr;
    // replace pi wiht pi
    processed = processed.replace(/π/g, 'pi');
    // Handle angle mode conversions for trigonometric functions
    if (angleMode === 'deg') {
      processed = processed
        .replace(/sin\(([^)]+)\)/g, 'sin(deg2rad($1))')
        .replace(/cos\(([^)]+)\)/g, 'cos(deg2rad($1))')
        .replace(/tan\(([^)]+)\)/g, 'tan(deg2rad($1))')
        .replace(/asin\(([^)]+)\)/g, 'rad2deg(asin($1))')
        .replace(/acos\(([^)]+)\)/g, 'rad2deg(acos($1))')
        .replace(/atan\(([^)]+)\)/g, 'rad2deg(atan($1))');
    }

    // Convert special notation to function calls
    processed = processed
      .replace(/∫\(([^,]+),\s*([^)]+),\s*([^)]+)\)/g, 'defInt("$1", $2, $3)')
      .replace(/d\/dx\((.+)\)/g, 'derivative("$1", "x")');

    // Handle implicit multiplication with imaginary unit
    processed = processed
      .replace(/ix/g, '(i * x)')
      .replace(/xi/g, '(x * i)');

    return processed;
  } catch (error) {
    toast.error('Failed to preprocess expression');
    throw error;
  }
};

/**
 * Validate expression syntax before evaluation
 * Checks for common syntax errors like mismatched parentheses
 *
 * @param {string} expr - Expression to validate
 * @throws {Error} If syntax errors are detected
 * @private
 */
const validateSyntax = (expr) => {
  // Check for mismatched parentheses
  const openParens = (expr.match(/\(/g) || []).length;
  const closeParens = (expr.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    toast.error('Syntax Error: Mismatched parentheses');
    throw new Error('Mismatched parentheses');
  }

  // Check for empty parentheses
  if (expr.includes('()')) {
    toast.error('Syntax Error: Empty parentheses');
    throw new Error('Empty parentheses');
  }

  // Check for consecutive operators (except ** for power)
  if (/[+\-*/%^]{2,}/.test(expr.replace(/\*\*/g, ''))) {
    toast.error('Syntax Error: Consecutive operators');
    throw new Error('Consecutive operators');
  }
};

/**
 * Handle and format evaluation errors for user display
 *
 * @param {Error} error - Error object from evaluation
 * @throws {Error} Rethrows error after displaying toast
 * @private
 */
const handleEvaluationError = (error) => {
  const { message } = error;

  // Skip toast for certain errors that already show toasts
  const skipToast = [
    'Division by zero',
    'sqrt',
    'log',
    'factorial',
    'nCr',
    'nPr',
    'pow',
    'mod',
    'tan',
    'asin',
    'acos',
    'NaN',
    'Infinity',
  ].some((keyword) => message.includes(keyword));

  if (!skipToast) {
    if (message.includes('Undefined symbol')) {
      const symbol = message.split('Undefined symbol')[1]?.trim() || 'unknown';
      toast.error(`Error: Unknown variable or function '${symbol}'`);
    } else if (message.includes('Unexpected')) {
      toast.error('Syntax Error: Invalid expression format');
    } else if (message.includes('value expected')) {
      toast.error('Syntax Error: Missing value in expression');
    } else if (message.includes('unexpected end of expression')) {
      toast.error('Syntax Error: Incomplete expression');
    } else if (message.includes('unexpected operator')) {
      toast.error('Syntax Error: Operator used incorrectly');
    } else {
      toast.error(`Math Error: ${message}`);
    }
  }

  throw error;
};

/**
 * Validate evaluation result for invalid numeric values
 *
 * @param {*} result - Result from math evaluation
 * @throws {Error} If result is NaN or Infinity
 * @private
 */
const validateResult = (result) => {
  if (typeof result === 'number') {
    if (Number.isNaN(result)) {
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
};

/**
 * Evaluate mathematical expression with full error handling
 * Main entry point for expression evaluation in the calculator
 *
 * @param {string} expr - Mathematical expression to evaluate
 * @param {string} angleMode - Either 'deg' or 'rad'
 * @returns {number|Complex|Matrix} Evaluation result
 * @throws {Error} If expression is invalid or evaluation fails
 *
 * @example
 * evaluateExpression('2 + 2', 'rad') // 4
 * evaluateExpression('sin(90)', 'deg') // 1
 * evaluateExpression('sqrt(-1)', 'rad') // Complex(0, 1)
 */
export const evaluateExpression = (expr, angleMode) => {
  // Validate input
  if (!expr || expr.trim() === '') {
    toast.error('Please enter an expression');
    throw new Error('Empty expression');
  }

  try {
    // Validate syntax
    validateSyntax(expr);

    // Preprocess expression
    const processed = preprocessExpression(expr, angleMode);

    // Evaluate
    const result = math.evaluate(processed);

    // Validate result
    validateResult(result);

    return result;
  } catch (error) {
    handleEvaluationError(error);
    return null; // Never reached, but TypeScript happy
  }
};

/**
 * Evaluate a single mathematical element (used for matrix elements, etc.)
 * Similar to evaluateExpression but without toasts and with simpler error handling
 *
 * @param {string} element - Mathematical element to evaluate (e.g., 'π', 'sin(90)', '2+3')
 * @param {string} angleMode - Either 'deg' or 'rad' (default: 'rad')
 * @returns {number} Evaluated numeric value
 * @throws {Error} If element cannot be evaluated
 *
 * @example
 * evaluateElement('π') // 3.14159...
 * evaluateElement('e') // 2.71828...
 * evaluateElement('sin(90)', 'deg') // 1
 * evaluateElement('2+3') // 5
 */
export const evaluateElement = (element, angleMode = 'rad') => {
  try {
    const trimmed = element.trim();
    
    // Preprocess the element
    const processed = preprocessExpression(trimmed, angleMode);
    
    // Evaluate using mathjs
    const result = math.evaluate(processed);
    
    // Return the numeric value
    if (typeof result === 'number') {
      return result;
    }
    
    // Handle complex numbers - return real part for matrix elements
    if (result && typeof result === 'object' && result.re !== undefined) {
      return result.re;
    }
    
    throw new Error(`Element "${element}" did not evaluate to a number`);
  } catch (error) {
    throw new Error(`Could not evaluate "${element}": ${error.message}`);
  }
};

/**
 * Export math library for direct access
 * Use this when you need math.format(), math.parse(), etc.
 */
export { math };
