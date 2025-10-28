/*
 * useCalculatorEvaluation
 *
 * Purpose:
 * Custom React hook to handle expression evaluation logic for different calculator modes.
 * Supports Standard, Machine Learning, Calculus, and Complex evaluation modes.
 * Separates computation logic from UI and manages result display and history updates.
 *
 * Parameters:
 * - mlMode, calculusMode, complexMode, matrixMode (bool): active calculation modes.
 * - angleMode (string): angle unit setting ("deg" or "rad").
 * - currentInput (string): current expression entered by the user.
 * - setCurrentInput (function): updates calculator input.
 * - pushHistory (function): logs expression and result to history.
 *
 * Return value:
 * An object with:
 *   - handleEquals (function): evaluates current expression.
 *   - lastResult (any): stores last evaluated result.
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { evaluateExpression } from '../utils/evaluator';

/**
 * Custom hook for calculator evaluation logic
 * Handles the complex logic of evaluating expressions with different modes
 * Separates evaluation concerns from UI component
 */
function useCalculatorEvaluation({
  mlMode,
  calculusMode,
  complexMode,
  matrixMode,
  angleMode,
  currentInput,
  setCurrentInput,
  pushHistory,
}) {
  const [lastResult, setLastResult] = useState(null);

  const handleEquals = useCallback(() => {
    if (!currentInput.trim()) {
      toast.error('Please enter an expression');
      return;
    }

    // Skip evaluation for matrix mode - handled by MatrixModal
    if (matrixMode) {
      toast.info('Use Matrix Modal for operations');
      return;
    }

    try {
      // Determine which mode is active
      let result;

      if (mlMode) {
        result = evaluateExpression(currentInput, {
          mode: 'ml',
          angleMode,
        });
      } else if (calculusMode) {
        result = evaluateExpression(currentInput, {
          mode: 'calculus',
          angleMode,
        });
      } else if (complexMode) {
        result = evaluateExpression(currentInput, {
          mode: 'complex',
          angleMode,
        });
      } else {
        // Standard mode
        result = evaluateExpression(currentInput, {
          mode: 'standard',
          angleMode,
        });
      }

      // Handle result display
      if (result !== null && result !== undefined) {
        const resultString = typeof result === 'object'
          ? JSON.stringify(result)
          : String(result);

        setCurrentInput(resultString);
        setLastResult(result);

        // Save to history
        pushHistory({
          expression: currentInput,
          result: resultString,
          mode: mlMode ? 'ML' : calculusMode ? 'Calculus' : complexMode ? 'Complex' : 'Standard',
        });

        toast.success('Calculated!');
      } else {
        toast.error('Invalid calculation');
      }
    } catch (error) {
      toast.error(`Error: ${error.message || 'Calculation failed'}`);
      console.error('Calculation error:', error);
    }
  }, [
    currentInput,
    mlMode,
    calculusMode,
    complexMode,
    matrixMode,
    angleMode,
    setCurrentInput,
    pushHistory,
  ]);

  return {
    handleEquals,
    lastResult,
  };
}

export default useCalculatorEvaluation;
