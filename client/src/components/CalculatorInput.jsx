import React, { useEffect, useState, useCallback } from 'react';
import { evaluateExpression } from '../utils/mathEngine';
import math from '../utils/index.js';
import CalculatorInfoBox from './CalculatorInfoBox';
import { toast } from 'react-toastify';

const CalculatorInput = ({
  inputRef,
  handlePlot,
  input,
  angleMode,
  setInput,
  setHistory,
  setLastAnswer,
  setShowPlot,
  lastAnswer,
  pushHistory,
  setShowMatrixModal,
  showMatrixModal,
  showMLMode: parentShowMLMode,
  setShowMLMode: parentSetShowMLMode,
  startParamSequence,
  setMatrixOperation,
  history,
  showPlot,
  onPlotGraph,
  complexMode: parentComplexMode,
  setComplexMode: parentSetComplexMode
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
    '(', ')', '!', '[', ']', ','
  ];

  const complexButtons = [
    'i', 're(', 'im(', 'conj(',
    'abs(', 'arg('
  ];

  const mlButtons = ['BestFit', 'Params', 'WOpt', 'RF', 'LR', 'FeatImp'];
  const constantButtons = ['π', 'e'];
  const calculusButtons = [ 'd/dx(', '∫(' ,'x',','];

  const AdvFxnButtons = inverseMode 
    ? ['asin(', 'acos(', 'atan(', 'asinh(', 'acosh(', 'atanh(','10^(', 'e^(']
    : ['sin(', 'cos(', 'tan(', 'sinh(', 'cosh(', 'tanh(','log(', 'ln('];

  const handleEquals = useCallback(() => {
    if (!input || input.trim() === '') {
      toast.warn('Please enter an expression first');
      inputRef.current?.focus();
      return;
    }

    try {
      const result = evaluateExpression(input, angleMode);
      const formatted = math.format(result, { notation:'fixed', precision: 6 });
      pushHistory(input, formatted);
      setInput(String(formatted));
      toast.success('Calculation complete!');
    } catch (err) {
      console.error('Evaluation error:', err);
    }
    inputRef.current?.focus();
  }, [input, angleMode, pushHistory, setInput, inputRef]);

  const handleClick = useCallback(
    (btn) => {
      if (btn === 'C') { 
        setInput(''); 
        toast.info('Input cleared');
        return; 
      }
      if (btn === '←') { 
        if (input.length > 0) {
          setInput(s => s.slice(0, -1)); 
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
        setInput(s => s + lastAnswer); 
        toast.info('Last answer inserted');
        return;
      }
      if (btn === '=') { handleEquals(); return; }

      if (btn === 'd/dx(') { 
        setInput(s => s + 'd/dx('); 
        toast.info('Derivative: d/dx(function)');
        return; 
      }
      if (btn === '∫(') { 
        setInput(s => s + '∫('); 
        toast.info('Integral function format: ∫(function, lowerLimit, upperLimit)');
        return; 
      }

      // ML operations
      if (mlMode && btn === 'Params' && typeof startParamSequence === 'function') {
        startParamSequence(['H', 'W', 'K'], (vals) => {
          try {
            if (vals.some(v => !v || isNaN(Number(v)))) {
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

      setInput(s => s + btn);
      inputRef.current?.focus();
    },
    [inputRef, lastAnswer, handleEquals, setInput, mlMode, startParamSequence, 
     input, complexMode]
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
        setInput(s => s.slice(0, -1)); 
        e.preventDefault(); 
        return; 
      }
      if (e.key.length === 1) {
        const allowed = '0123456789+-*/().%^![], ';
        if (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
          setInput(s => s + e.key);
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
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 justify-between">
        <button onClick={() => { 
          setMlMode(m => !m); 
          setCalculusMode(false); 
          setComplexMode(false); 
          toast.info(mlMode ? 'ML Mode OFF' : 'ML Mode ON');
        }}
          className={`px-3 py-1 rounded ${mlMode ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}>ML</button>
        
        <button onClick={() => { 
          setCalculusMode(c => !c); 
          setMlMode(false);  
          toast.info(calculusMode ? 'Calculus OFF' : 'Calculus ON');
        }}
          className={`px-3 py-1 rounded ${calculusMode ? 'bg-green-600' : 'bg-gray-700'} text-white`}>Calculus</button>
        
        <button onClick={() => { 
          setComplexMode(c => !c); 
          setMlMode(false); 
          toast.info(complexMode ? 'Complex OFF' : 'Complex ON');
        }}
          className={`px-3 py-1 rounded ${complexMode ? 'bg-pink-600' : 'bg-gray-700'} text-white`}>Complex</button>
        
        <button onClick={() => { 
          setMatrixOperation && setMatrixOperation('multiply');
          setShowMatrixModal && setShowMatrixModal(true); 
          toast.info('Matrix mode - Select operation');
        }}
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600">Matrix</button>
        
        <button onClick={() => { 
          setInverseMode(i => !i); 
          toast.info(inverseMode ? 'Inverse OFF (normal trig)' : 'Inverse ON (arc trig)');
        }}
          className={`px-3 py-1 rounded ${inverseMode ? 'bg-yellow-600' : 'bg-gray-700'} text-white`}>
          Inverse
        </button>
        
        <button onClick={() => {
          handlePlot();
        }}
          className={`px-3 py-1 rounded bg-gray-700 text-white hover:bg-purple-600`}>Plot</button>
      </div>

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

      {/* Trig buttons - always show */}
      <div className="grid grid-cols-6 gap-2">
        {AdvFxnButtons.map(b => (
          <button key={b} onClick={() => handleClick(b)}
            className="p-2 bg-orange-600 hover:bg-orange-500 rounded text-white text-sm">{b}</button>
        ))}
      </div>

      {/* Mode-specific buttons */}
      {complexMode && (
        <div className="grid grid-cols-4 gap-2">
          {complexButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-pink-700 hover:bg-pink-600 rounded text-white text-sm">{b}</button>
          ))}
        </div>
      )}

      {mlMode && (
        <div className="grid grid-cols-3 gap-2">
          {mlButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white text-sm">{b}</button>
          ))}
        </div>
      )}

      {calculusMode && (
        <div className="grid grid-cols-4 gap-2">
          {calculusButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm">{b}</button>
          ))}
        </div>
      )}
      
      {/* constant buttons */}
      <div className="grid grid-cols-2 gap-2">
        {constantButtons.map(b => (
          <button key={b} onClick={() => handleClick(b)}
            className="p-2 bg-yellow-700 hover:bg-yellow-600 rounded text-white text-sm">{b}</button>
        ))}
      </div>

      {/* Base keypad */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {baseButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-3 rounded font-medium text-white text-sm transition-all duration-150
              ${
                ['C', '←', 'Ans', '='].includes(btn)
                  ? 'bg-teal-500 hover:bg-teal-400'
                  : ['+', '-', '*', '/', '^', '%', '!' ,'(' ,')', '[', ']', ','].includes(btn)
                  ? 'bg-blue-700 hover:bg-blue-600'
                  : 'bg-purple-700 hover:bg-purple-600'
              }`}
          >
            {btn}
          </button>
        ))}
      </div>

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
            📊 Plot Graph
          </button>
        )}
        <button
          onClick={() => {
            if (history.length === 0) {
              toast.info('History is already empty');
              return;
            }
            setInput('');
            setHistory([]);
            setLastAnswer('');
            localStorage.removeItem('calc_history');
            toast.success('History cleared');
          }}
          className={`${showPlot ? 'flex-1' : 'flex-1'} p-2 bg-red-600 rounded text-white hover:bg-red-500`}
        >
          Clear History
        </button>
      </div>
    </div>
  );
};

export default CalculatorInput;