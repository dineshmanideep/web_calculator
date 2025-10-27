import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { evaluateExpression } from '../utils/mathEngine';
import math from '../utils/index.js';
import CalculatorInfoBox from './CalculatorInfoBox';
import ButtonGrid from './ButtonGrid';
import ModeToolbar from './ModeToolbar';

// Constants defined outside component - created only once
const MATRIX_BUTTONS = ['MatMul', 'MatAdd', 'MatSub', 'Det', 'Transpose'];

const CalculatorInput = ({
  inputRef,
  handlePlot,
  input,
  angleMode,
  setInput,
  lastAnswer,
  pushHistory,
  showMatrixModal,
  showMLMode: parentShowMLMode,
  setShowMLMode: parentSetShowMLMode,
  startParamSequence,
  showPlot,
  plotMode,
  onPlotGraph,
  setComplexMode: parentSetComplexMode,
  matrixMode,
  setMatrixMode,
  onMatrixOperation,
  matrixOperation,
  firstMatrix,
  onMatrixClear,
  clearHistory,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [complexMode, setComplexMode] = useState(false);
  const [mlMode, setMlMode] = useState(!!parentShowMLMode);
  const [calculusMode, setCalculusMode] = useState(false);
  const [inverseMode, setInverseMode] = useState(false);

  useEffect(() => {
    if (typeof parentSetShowMLMode === 'function') parentSetShowMLMode(mlMode);
  }, [mlMode, parentSetShowMLMode]);

  // Sync complex mode with parent
  useEffect(() => {
    if (typeof parentSetComplexMode === 'function') parentSetComplexMode(complexMode);
  }, [complexMode, parentSetComplexMode]);

  const baseButtons = [
    'C', '←', 'Ans', '=',
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '+', '^', '%',
    '(', ')', '!', ',',
  ];

  const AdvFxnButtons = inverseMode
    ? ['asin(', 'acos(', 'atan(', 'asinh(', 'acosh(', 'atanh(', '10^(', 'e^(']
    : ['sin(', 'cos(', 'tan(', 'sinh(', 'cosh(', 'tanh(', 'log(', 'ln('];

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
        onMatrixOperation('=');
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
  }, [input, angleMode, pushHistory, setInput, inputRef, matrixMode, firstMatrix, matrixOperation, onMatrixOperation]);

  const handleClick = useCallback(
    (btn) => {
      // Handle matrix operation buttons
      if (MATRIX_BUTTONS.includes(btn)) {
        onMatrixOperation(btn);
        return;
      }

      if (btn === 'C') {
        setInput('');
        // Clear matrix operation if in matrix mode
        if (matrixMode && onMatrixClear) {
          onMatrixClear();
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

      // ML operations
      if (mlMode && btn === 'Params' && typeof startParamSequence === 'function') {
        startParamSequence(['H', 'W', 'K'], (vals) => {
          try {
            if (vals.some((v) => !v || isNaN(Number(v)))) {
              toast.error('All parameters must be valid numbers');
              return;
            }
            setInput(String(JSON.stringify(vals)));
            toast.success('Parameters collected');
          } catch (error) {
            toast.error('Failed to process parameters');
          }
        }, 'Params');
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
    [inputRef, lastAnswer, handleEquals, setInput, mlMode, startParamSequence,
      input, complexMode, matrixMode, onMatrixClear, onMatrixOperation, setComplexMode],
  );

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || showMatrixModal) return;

    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); return; }
      if (e.key === 'Enter') {
        handleEquals();
        e.preventDefault();
        return;
      }
      if (e.key === 'Backspace') {
        setInput((s) => s.slice(0, -1));
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        const allowed = '0123456789+-*/().%^![], ';
        if (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
          setInput((s) => s + e.key);
          e.preventDefault();
        } else {
          toast.warn(`Character '${e.key}' not allowed`);
          e.preventDefault();
        }
      }
    };

    inputElement.addEventListener('keydown', handler);
    return () => inputElement.removeEventListener('keydown', handler);
  }, [inputRef, handleEquals, showMatrixModal, setInput]);

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

      {/* Matrix operation display - shows when in matrix mode and has first matrix */}
      {matrixMode && firstMatrix && (
        <div className="bg-blue-900 p-2 rounded">
          <div className="text-white text-xs mb-1">First Matrix:</div>
          <div className="text-yellow-300 text-sm font-mono">{firstMatrix.input}</div>
          {matrixOperation && (
            <div className="text-white text-xs mt-1">
              Operation:
              <span className="text-green-400">{matrixOperation}</span>
            </div>
          )}
        </div>
      )}

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
        baseButtons={baseButtons}
        AdvFxnButtons={AdvFxnButtons}
        complexMode={complexMode}
        mlMode={mlMode}
        calculusMode={calculusMode}
        matrixMode={matrixMode}
        handleClick={handleClick}
      />

      {/* Bottom actions */}
      <div className="flex gap-2 mt-2">
        {showPlot && (
          <button
            onClick={() => {
              if (input && input.trim() !== '') {
                onPlotGraph(input, complexMode);
                toast.success('Plotting graph...');
              } else {
                toast.warn('Enter a function or expression first');
              }
            }}
            className="flex-1 p-2 bg-purple-600 rounded text-white hover:bg-purple-500 font-semibold"
          >
            Plot Graph
          </button>
        )}
        <button
          onClick={clearHistory}
          className="flex-1 p-2 bg-red-600 rounded text-white hover:bg-red-500"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};

export default CalculatorInput;
