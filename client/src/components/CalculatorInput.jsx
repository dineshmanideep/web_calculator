/*
 * CalculatorInput
 *
 * Purpose:
 * Core calculator component responsible for managing input, mode toggles,
 * button interactions, and calculation execution using context-based state.
 *
 * Features:
 * - Input field and result management
 * - Mode toolbar (ML, Calculus, Complex, Matrix, Inverse, Plot)
 * - Matrix operation handling and display
 * - History tracking and clearing
 * - Keyboard shortcuts for efficient input
 * - Dynamic feedback via toast notifications
 *
 * Parameters:
 * None (uses global state from CalculatorContext)
 *
 * Return value:
 * A complete calculator input interface React element.
 */


import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { evaluateExpression, math } from '../utils/evaluator';
import CalculatorInfoBox from './CalculatorInfoBox';
import ButtonGrid from './ButtonGrid';
import ModeToolbar from './ModeToolbar';
import MatrixStatusDisplay from './MatrixStatusDisplay';
import { useCalculatorContext } from '../contexts/CalculatorContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { MATRIX_BUTTONS } from '../constants/buttonConstants';

function CalculatorInput() {
  const {
    input,
    setInput,
    inputRef,
    angleMode,
    lastAnswer,
    pushHistory,
    mlMode,
    setMlMode,
    calculusMode,
    setCalculusMode,
    complexMode,
    setComplexMode,
    matrixMode,
    setMatrixMode,
    inverseMode,
    setInverseMode,
    plotMode,
    handlePlot,
    handleMatrixOperation,
    matrixOperation,
    firstMatrix,
    handleMatrixClear,
    clearHistory,
    showInfo,
    setShowInfo,
    showMatrixModal,
  } = useCalculatorContext();

  const handleEquals = useCallback(() => {
    if (!input || input.trim() === '') {
      toast.warn('Please enter an expression first');
      inputRef.current?.focus();
      return;
    }

    try {
      // If in matrix mode and there's a pending operation, execute it
      if (matrixMode && firstMatrix && matrixOperation) {
        // Trigger the matrix operation to complete with the current input as second matrix
        handleMatrixOperation('=');
        return;
      }

      const result = evaluateExpression(input, angleMode);
      const formatted = math.format(result, { notation: 'fixed', precision: 6 });
      pushHistory(input, formatted);
      setInput(String(formatted));
      toast.success('Calculation complete!');
    } catch (err) {
      console.error('Evaluation error:', err);
    }
    inputRef.current?.focus();
  }, [input, angleMode, pushHistory, setInput, inputRef, matrixMode, firstMatrix, matrixOperation, handleMatrixOperation]);

  const handleClick = useCallback(
    (btn) => {
      // Handle matrix operation buttons
      if (MATRIX_BUTTONS.includes(btn)) {
        handleMatrixOperation(btn);
        return;
      }

      if (btn === 'C') {
        setInput('');
        // Clear matrix operation if in matrix mode
        if (matrixMode && handleMatrixClear) {
          handleMatrixClear();
        }
        toast.info('Input cleared');
        return;
      }
      if (btn === '←') {
        if (input.length > 0) {
          setInput((s) => s.slice(0, -1));
        } else {
          toast.info('Nothing to delete');
        }
        return;
      }
      if (btn === 'Ans') {
        if (!lastAnswer) {
          toast.warn('No previous answer available');
          return;
        }
        setInput((s) => s + lastAnswer);
        toast.info('Last answer inserted');
        return;
      }
      if (btn === '=') { handleEquals(); return; }

      if (btn === 'd/dx(') {
        setInput((s) => `${s}d/dx(`);
        toast.info('Derivative: d/dx(function)');
        return;
      }
      if (btn === '∫(') {
        setInput((s) => `${s}∫(`);
        toast.info('Integral function format: ∫(function, lowerLimit, upperLimit)');
        return;
      }

      // ML operations - removed startParamSequence as it's not in context
      if (mlMode && btn === 'Params') {
        toast.info('ML Parameters feature - implement parameter collection');
        return;
      }

      // Auto-enable complex mode if using complex functions
      if (['i', 're(', 'im(', 'conj(', 'arg('].includes(btn) && !complexMode) {
        toast.info('Complex mode enabled');
        setComplexMode(true);
      }

      setInput((s) => s + btn);
      inputRef.current?.focus();
    },
    [inputRef, lastAnswer, handleEquals, setInput, mlMode,
      input, complexMode, matrixMode, handleMatrixClear, handleMatrixOperation, setComplexMode],
  );

  // Use keyboard shortcuts hook for cleaner code
  useKeyboardShortcuts(inputRef, showMatrixModal, handleEquals, setInput);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-3">
      {/* Mode Toggle Toolbar */}
      <ModeToolbar
        mlMode={mlMode}
        setMlMode={setMlMode}
        calculusMode={calculusMode}
        setCalculusMode={setCalculusMode}
        complexMode={complexMode}
        setComplexMode={setComplexMode}
        matrixMode={matrixMode}
        setMatrixMode={setMatrixMode}
        inverseMode={inverseMode}
        setInverseMode={setInverseMode}
        plotMode={plotMode}
        handlePlot={handlePlot}
      />

      {/* Matrix operation display - using MatrixStatusDisplay component */}
      <MatrixStatusDisplay
        matrixMode={matrixMode}
        firstMatrix={firstMatrix}
        matrixOperation={matrixOperation}
      />

      {/* Input bar */}
      <div className="flex items-center relative">
        <input
          ref={inputRef}
          type="text"
          className="bg-gray-700 text-white p-3 rounded text-lg font-mono text-right shadow-inner flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter expression"
        />
        <button
          onClick={() => setShowInfo(true)}
          className="ml-2 w-8 h-8 rounded-full bg-yellow-500 text-white font-bold text-lg flex items-center justify-center shadow hover:bg-yellow-600"
          title="Calculator Help"
        >
          ?
        </button>
        <CalculatorInfoBox show={showInfo} onClose={() => setShowInfo(false)} />
      </div>

      {/* All Calculator Buttons */}
      <ButtonGrid
        inverseMode={inverseMode}
        complexMode={complexMode}
        mlMode={mlMode}
        calculusMode={calculusMode}
        matrixMode={matrixMode}
        handleClick={handleClick}
      />

      {/* Clear History Button */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={clearHistory}
          className="flex-1 p-2 bg-red-600 rounded text-white hover:bg-red-500"
        >
          Clear History
        </button>
      </div>
    </div>
  );
}

export default CalculatorInput;
