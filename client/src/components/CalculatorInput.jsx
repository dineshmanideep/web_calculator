/*
 * CalculatorInput
 *
 * Purpose:
 * Core calculator component responsible for managing input, mode toggles,
 * button interactions, and calculation execution using context-based state.
 *
 * Features:
 * - Input field and result management
 * - Mode toolbar (DL, Calculus, Complex, Matrix, Inverse, Plot)
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
import { MATRIX_BUTTONS, DL_BUTTONS } from '../constants/buttonConstants';

function CalculatorInput() {
  const {
    input,
    setInput,
    inputRef,
    angleMode,
    lastAnswer,
    pushHistory,
    DLMode,
    setDLMode,
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
    triggerPlot,
    handleMatrixOperation,
    matrixOperation,
    firstMatrix,
    handleMatrixClear,
    clearHistory,
    showInfo,
    setShowInfo,
    showMatrixModal,
    dlActiveOp,
    dlParamIndex,
    dlParams,
    dlSchema,
    startDLOperation,
    handleDLEquals,
    cancelDLOperation,
  } = useCalculatorContext();

  const handleEquals = useCallback(() => {
    if (!input || input.trim() === '') {
      if (DLMode && dlActiveOp) {
        inputRef.current?.focus();
        return;
      }
      toast.warn('Please enter an expression first');
      inputRef.current?.focus();
      return;
    }

    try {
      if (DLMode && dlActiveOp) {
        const opKey = dlActiveOp.key;
        const schema = dlSchema || [];
        const prevParams = dlParams || [];
        const res = handleDLEquals(input, angleMode);
        if (!res) return;
        if (res.type === 'continue') {
          setInput('');
          return;
        }
        if (res.type === 'done') {
          const fullParams = schema.map((_, i) => (i < prevParams.length ? prevParams[i] : input));
          const label = `${opKey}(${fullParams.join(', ')})`;
          const resultStr = String(res.value);
          pushHistory(label, resultStr);
          setInput(resultStr);
          toast.success('Calculation complete!');
          inputRef.current?.focus();
          return;
        }
      }

      if (matrixMode && firstMatrix && matrixOperation) {
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
  }, [input, angleMode, pushHistory, setInput, inputRef, matrixMode, firstMatrix, matrixOperation, handleMatrixOperation, DLMode, dlActiveOp, dlSchema, dlParams, handleDLEquals]);

  const handleClick = useCallback(
    (btn) => {
      if (MATRIX_BUTTONS.includes(btn)) {
        handleMatrixOperation(btn);
        return;
      }

      if (btn === 'C') {
        setInput('');
        if (DLMode && dlActiveOp) {
          cancelDLOperation();
          toast.info('DL operation canceled');
          return;
        }
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

      if (btn === 'Plot') {
        if (!input || input.trim() === '') {
          toast.warn('Enter a function to plot (e.g., x^2, sin(x))');
          return;
        }
        triggerPlot();
        toast.success('Plotting function...');
        return;
      }

      if (DLMode && DL_BUTTONS.includes(btn)) {
        startDLOperation(btn, input);
        setInput('');
        return;
      }

      if (['i', 're(', 'im(', 'conj(', 'arg('].includes(btn) && !complexMode) {
        toast.info('Complex mode enabled');
        setComplexMode(true);
      }

      setInput((s) => s + btn);
      inputRef.current?.focus();
    },
    [inputRef, lastAnswer, handleEquals, setInput, DLMode,
      input, complexMode, matrixMode, handleMatrixClear, handleMatrixOperation, setComplexMode, startDLOperation, dlActiveOp, cancelDLOperation, triggerPlot],
  );

  useKeyboardShortcuts(inputRef, showMatrixModal, handleEquals, setInput);

  const inputPlaceholder = (DLMode && dlActiveOp)
    ? `Enter ${dlSchema?.[dlParamIndex] || 'parameter'}`
    : 'Enter expression';

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl shadow-2xl flex flex-col gap-3 border border-slate-700/50 max-w-lg mx-auto">
      {/* Mode Toggle Toolbar */}
      <ModeToolbar
        DLMode={DLMode}
        setDLMode={setDLMode}
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

      {/* Matrix operation display */}
      <MatrixStatusDisplay
        matrixMode={matrixMode}
        firstMatrix={firstMatrix}
        matrixOperation={matrixOperation}
      />

      {/* Input bar */}
      <div className="flex items-center relative gap-2">
        <input
          ref={inputRef}
          type="text"
          className="bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-xl text-lg font-mono text-right shadow-inner flex-1 border border-slate-700/50 focus:border-purple-600/50 focus:outline-none transition-all placeholder:text-slate-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
        />
        <button
          onClick={() => setShowInfo(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 text-white font-bold text-base flex items-center justify-center shadow-lg hover:scale-110 transition-all"
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
        DLMode={DLMode}
        calculusMode={calculusMode}
        matrixMode={matrixMode}
        plotMode={plotMode}
        handleClick={handleClick}
      />

      {/* Clear History Button */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={clearHistory}
          className="flex-1 p-2.5 bg-gradient-to-r from-red-700 to-red-800 rounded-xl text-white text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear History
        </button>
      </div>
    </div>
  );
}

export default CalculatorInput;