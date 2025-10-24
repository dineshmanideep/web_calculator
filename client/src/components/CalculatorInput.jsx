import React, { useEffect, useState, useCallback } from 'react';
import { evaluateExpression } from '../utils/mathEngine';
import math from '../utils/mathSetup';
import CalculatorInfoBox from './CalculatorInfoBox';

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
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const [complexMode, setComplexMode] = useState(false);
  const [mlMode, setMlMode] = useState(!!parentShowMLMode);
  const [calculusMode, setCalculusMode] = useState(false);
  const [inverseMode, setInverseMode] = useState(false);

  // sync parent ML mode
  useEffect(() => {
    if (typeof parentSetShowMLMode === 'function') parentSetShowMLMode(mlMode);
  }, [mlMode, parentSetShowMLMode]);

  const baseButtons = [
    'C', '←', 'Ans', '=', 
    '7', '8', '9', '/', 
    '4', '5', '6', '*', 
    '1', '2', '3', '-', 
    '0', '.', '+', '^', '%',
    '(', ')', '!',
  ];

  const matrixButtons = ['MatMul', 'TransA', 'TransB', 'DetA', 'DetB'];
  const complexButtons = ['i', 're(', 'im(', 'conj('];
  const mlButtons = ['BestFit', 'Params', 'WOpt', 'RF', 'LR', 'FeatImp'];
  const calculusButtons = ['Int', 'Der', 'd/dx(', '∫('];

  const handleEquals = useCallback(() => {
    try {
      const result = evaluateExpression(input, angleMode);
      const formatted = math.format(result, { precision: 7 });
      pushHistory(input, formatted);
      setInput(String(formatted));
    } catch (err) {
      alert('Invalid Expression: ' + (err.message || err));
    }
    inputRef.current?.focus();
  }, [input, angleMode, pushHistory, setInput, inputRef]);

  const handleClick = useCallback(
    (btn) => {
      if (btn === 'C') { setInput(''); return; }
      if (btn === '←') { setInput(s => s.slice(0, -1)); return; }
      if (btn === 'Ans') {
        if (!lastAnswer) { alert('No previous answer available.'); return; }
        setInput(s => s + lastAnswer); return;
      }
      if (btn === '=') { handleEquals(); return; }

      // matrix actions
      if (btn === 'MatMul') { setShowMatrixModal && setShowMatrixModal(true); return; }
      if (btn.startsWith('Trans')) { setInput(s => s + btn.toLowerCase() + '('); return; }
      if (btn.startsWith('Det')) { setInput(s => s + btn.toLowerCase() + '('); return; }

      // calculus actions
      if (btn === 'Int') { setInput(s => s + 'int('); return; }
      if (btn === 'Der' || btn === 'd/dx(') { setInput(s => s + 'der('); return; }
      if (btn === '∫(') { setInput(s => s + 'integral('); return; }

      // ML params
      if (mlMode && btn === 'Params' && typeof startParamSequence === 'function') {
        startParamSequence(['H', 'W', 'K'], (vals) => {
          setInput(String(JSON.stringify(vals)));
        }, 'Params');
        return;
      }

      setInput(s => s + btn);
      inputRef.current?.focus();
    },
    [inputRef, lastAnswer, handleEquals, setInput, mlMode, startParamSequence, setShowMatrixModal]
  );

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || showMatrixModal) return;

    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); return; }
      if (e.key === 'Enter') { handleEquals(); e.preventDefault(); return; }
      if (e.key === 'Backspace') { setInput(s => s.slice(0, -1)); e.preventDefault(); return; }
      if (e.key.length === 1) {
        const allowed = '0123456789+-*/().%^![], ';
        if (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
          setInput(s => s + e.key);
          e.preventDefault();
        }
      }
    };

    inputElement.addEventListener('keydown', handler);
    return () => inputElement.removeEventListener('keydown', handler);
  }, [inputRef, handleEquals, showMatrixModal, setInput]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-3">

      {/* Toolbar above input */}
      <div className="flex flex-wrap gap-2 justify-between">
        <button onClick={() => { setMlMode(m => !m); setCalculusMode(false); setComplexMode(false); setMatrixMode(false); }}
          className={`px-3 py-1 rounded ${mlMode ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}>ML</button>
        <button onClick={() => { setCalculusMode(c => !c); setMlMode(false);  setMatrixMode(false); }}
          className={`px-3 py-1 rounded ${calculusMode ? 'bg-green-600' : 'bg-gray-700'} text-white`}>Calculus</button>
        <button onClick={() => { setComplexMode(c => !c); setMlMode(false); setMatrixMode(false); }}
          className={`px-3 py-1 rounded ${complexMode ? 'bg-pink-600' : 'bg-gray-700'} text-white`}>Complex</button>
        <button onClick={() => { setMatrixMode(m => !m); setMlMode(false); setComplexMode(false); setCalculusMode(false); }}
          className={`px-3 py-1 rounded ${matrixMode ? 'bg-blue-600' : 'bg-gray-700'} text-white`}>Matrix</button>
        <button onClick={() => { setInverseMode(i => !i); }}
          className={`px-3 py-1 rounded ${inverseMode ? 'bg-yellow-600' : 'bg-gray-700'} text-white`}>Inv</button>
        <button onClick={handlePlot}
          className={`px-3 py-1 rounded bg-gray-700 text-white`}>Plot</button>
      </div>

      {/* Input bar */}
      <div className="flex items-center relative">
        <input
          ref={inputRef}
          type="text"
          className="bg-gray-700 text-white p-3 rounded text-lg font-mono text-right shadow-inner flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter expression (use x for plotting)"
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

      {/* Mode-specific buttons between input and base keypad */}
      {matrixMode && (
        <div className="grid grid-cols-3 gap-2">
          {matrixButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-blue-700 hover:bg-blue-600 rounded text-white">{b}</button>
          ))}
        </div>
      )}

      {complexMode && (
        <div className="grid grid-cols-4 gap-2">
          {complexButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-pink-700 hover:bg-pink-600 rounded text-white">{b}</button>
          ))}
        </div>
      )}

      {mlMode && (
        <div className="grid grid-cols-3 gap-2">
          {mlButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white">{b}</button>
          ))}
        </div>
      )}

      {calculusMode && (
        <div className="grid grid-cols-3 gap-2">
          {calculusButtons.map(b => (
            <button key={b} onClick={() => handleClick(b)}
              className="p-2 bg-green-700 hover:bg-green-600 rounded text-white">{b}</button>
          ))}
        </div>
      )}

      {/* Base keypad at bottom */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {baseButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-3 rounded font-medium text-white text-sm transition-all duration-150
              ${
                ['C', '←', 'Ans', '='].includes(btn)
                  ? 'bg-teal-500 hover:bg-teal-400'
                  : ['+', '-', '*', '/', '^', '%', '!' ,'(' ,')'].includes(btn)
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
        <button
          onClick={() => {
            setInput('');
            setHistory([]);
            setLastAnswer('');
            localStorage.removeItem('calc_history');
          }}
          className="flex-1 p-2 bg-red-600 rounded text-white hover:bg-red-500"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};

export default CalculatorInput;
