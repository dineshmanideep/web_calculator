import { toast } from 'react-toastify';
import math from './mathCore';

export const preprocess = (expr, angleMode) => {
  try {
    // For degree mode we wrap trig functions: sin(x) -> sin(x * pi/180)
    if (angleMode === 'deg') {
      expr = expr.replace(/sin\(([^)]+)\)/g, 'sin(deg2rad($1))')
        .replace(/cos\(([^)]+)\)/g, 'cos(deg2rad($1))')
        .replace(/tan\(([^)]+)\)/g, 'tan(deg2rad($1))')
        .replace(/asin\(([^)]+)\)/g, 'rad2deg(asin($1))')
        .replace(/acos\(([^)]+)\)/g, 'rad2deg(acos($1))')
        .replace(/atan\(([^)]+)\)/g, 'rad2deg(atan($1))');
    }
    expr = expr.replace(/∫\(([^,]+),\s*([^)]+),\s*([^)]+)\)/g, 'defInt("$1", $2, $3)');
    expr = expr.replace(/d\/dx\((.+)\)/g, 'derivative("$1", "x")');

    expr = expr.replace(/log\(([^)]+)\)/g, 'log10($1)');
    expr = expr.replace(/ln\(([^)]+)\)/g, 'log($1)');

    expr = expr.replace(/ix/g, '(i * x)');
    expr = expr.replace(/xi/g, '(x * i)');

    return expr;
  } catch (error) {
    toast.error('Failed to preprocess expression');
    throw error;
  }
};

// Evaluate expression using mathjs
export const evaluateExpression = (expr, angleMode) => {
  if (!expr || expr.trim() === '') {
    toast.error('Please enter an expression');
    throw new Error('Empty expression');
  }

  try {
    // Check for common syntax errors before processing
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

    // Check for double operators (except for negative numbers)
    if (/[\+\*\/\^]{2,}/.test(expr) || /[\+\*\/\^]\s*$/.test(expr)) {
      toast.error('Syntax Error: Invalid operator usage');
      throw new Error('Invalid operators');
    }

    // Check for starting with invalid operator
    if (/^[\*\/\^]/.test(expr.trim())) {
      toast.error('Syntax Error: Expression cannot start with *, /, or ^');
      throw new Error('Invalid starting operator');
    }

    const pre = preprocess(expr, angleMode);
    const scope = { i: math.complex(0, 1) }; // complex unit
    const node = math.parse(pre);
    const res = node.evaluate(scope);

    // Additional validation of result
    if (typeof res === 'number') {
      if (isNaN(res)) {
        toast.error('Calculation resulted in an undefined value');
        throw new Error('Result is NaN');
      }
      if (!isFinite(res)) {
        toast.error('Calculation resulted in infinity (overflow)');
        throw new Error('Result is infinite');
      }
    }

    return res;
  } catch (error) {
    // Specific error handling - only show toast if not already shown
    const msg = error.message.toLowerCase();

    if (!msg.includes('division by zero')
        && !msg.includes('empty expression')
        && !msg.includes('mismatched parentheses')
        && !msg.includes('empty parentheses')
        && !msg.includes('invalid operators')
        && !msg.includes('invalid starting operator')
        && !msg.includes('sqrt')
        && !msg.includes('log')
        && !msg.includes('ln')
        && !msg.includes('factorial')
        && !msg.includes('ncr')
        && !msg.includes('npr')
        && !msg.includes('pow')
        && !msg.includes('mod')
        && !msg.includes('tan')
        && !msg.includes('asin')
        && !msg.includes('acos')
        && !msg.includes('nan')
        && !msg.includes('infinity')) {
      // Handle remaining math.js errors
      if (msg.includes('undefined symbol')) {
        const symbol = error.message.split('Undefined symbol')[1]?.trim() || 'unknown';
        toast.error(`Error: Unknown variable or function '${symbol}'`);
      } else if (msg.includes('unexpected')) {
        toast.error('Syntax Error: Invalid expression format');
      } else if (msg.includes('value expected')) {
        toast.error('Syntax Error: Missing value in expression');
      } else if (msg.includes('unexpected end of expression')) {
        toast.error('Syntax Error: Incomplete expression');
      } else if (msg.includes('unexpected operator')) {
        toast.error('Syntax Error: Operator used incorrectly');
      } else {
        toast.error(`Calculation Error: ${error.message}`);
      }
    }
    throw error;
  }
};
