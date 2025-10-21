import React, { useEffect, useState, useCallback } from 'react';
import { preprocess, evaluateExpression } from '../utils/mathEngine';
import math from '../utils/mathSetup';
import CalculatorInfoBox from './CalculatorInfoBox';

const CalculatorInput = ({ inputRef, handlePlot, input, setInput, setHistory, setLastAnswer, setShowPlot, lastAnswer, pushHistory, setShowMatrixModal, showMatrixModal }) => {
  const [inverseTrig, setInverseTrig] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const buttons = [
    "C", "←", "Ans", "Plot", "=",
    "7", "8", "9", "/", "sqrt(",
    "4", "5", "6", "*", "^",
    "1", "2", "3", "-", "!",
    "0", ".", "%", "+", "pi",
    inverseTrig ? "asin(" : "sin(",
    inverseTrig ? "acos(" : "cos(",
    inverseTrig ? "atan(" : "tan(",
    "ln(", "log(",
    "(", ")", "e", "i", "x",
    "Perm", "Comb", "MatMul", "Int", "Der"
  ];

  // FIXED: Define handleEquals BEFORE useEffect (hoisting workaround)
  // Wrapped in useCallback to stabilize deps and prevent re-renders
  const handleEquals = useCallback(() => {
    try {
      const result = evaluateExpression(input);
      const formatted = math.format(result, { precision: 14 });
      pushHistory(input, formatted);
      setInput(String(formatted));
    } catch (err) {
      alert("Invalid Expression: " + (err.message || err));
    }
    inputRef.current?.focus();
  }, [input, pushHistory, setInput, inputRef]);

  // NEW: handleClick also useCallback for stability (optional but good practice)
  const handleClick = useCallback((btn) => {
    if (btn === "C") { 
      setInput(""); 
      inputRef.current?.focus(); 
      return; 
    }
    if (btn === "←") { 
      setInput(s => s.slice(0, -1)); 
      inputRef.current?.focus(); 
      return; 
    }
    if (btn === "Ans") { 
      setInput(s => s + lastAnswer); 
      inputRef.current?.focus(); 
      return; 
    }
    if (btn === "Plot") { 
      setShowPlot(s => !s); 
      return; 
    }
    if (btn === "=") { 
      handleEquals(); 
      return; 
    }

    if (btn === "Perm") { 
      setInput(s => s + " nPr("); 
      inputRef.current?.focus(); 
      return; 
    }
    if (btn === "Comb") { 
      setInput(s => s + " nCr("); 
      inputRef.current?.focus(); 
      return; 
    }
    if (btn === "MatMul") { 
      console.log('Opening modal with input:', input); // Debug
      setShowMatrixModal(true, input); 
      return; 
    }
    if (btn === "Int") {
      try {
        const [func, lower, upper] = input.split(",");
        if (!func || lower === undefined || upper === undefined) {
          alert("Format: f(x),a,b");
          return;
        }
        const f = (x) => math.evaluate(func, { x });
        const a = Number(lower), b = Number(upper), n = 200;
        const h = (b - a) / n;
        let s = f(a) + f(b);
        for (let i = 1; i < n; i++) {
          s += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
        }
        const result = (s * h) / 3;
        pushHistory(`∫[${lower},${upper}] ${func} dx`, math.format(result));
        setInput(String(math.format(result)));
      } catch (e) {
        setInput("Error");
      }
      return;
    }

    if (btn === "Der") {
      try {
        const derivative = math.derivative(input, "x").toString();
        pushHistory(`d/dx ${input}`, derivative);
        setInput(derivative);
      } catch (e) {
        setInput("Error");
      }
      return;
    }

    // Normal append
    setInput(s => s + btn);
    inputRef.current?.focus();
  }, [input, lastAnswer, setInput, setShowPlot, handleEquals, pushHistory, setShowMatrixModal, inputRef]);

  // NOW: useEffect after definitions
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    // Only add listener if modal is closed
    if (showMatrixModal) return;

    const handler = (e) => {
      console.log(e.key, 'on main input');
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return;
      }
      if (e.key === "Enter") {
        handleEquals(); // Now defined!
        e.preventDefault();
        return;
      }
      if (e.key === "Backspace") {
        setInput(s => s.slice(0, -1));
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        const allowed = "0123456789+-*/().%^![], ";
        if (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
          setInput(s => s + e.key);
          e.preventDefault();
        }
      }
    };

    inputElement.addEventListener("keydown", handler);
    return () => inputElement.removeEventListener("keydown", handler);
  }, [inputRef, handleEquals, showMatrixModal, setInput]); // Updated deps

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-3">
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
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setInverseTrig(s => !s)}
          className="bg-yellow-700 text-white px-3 py-1 rounded"
        >
          {inverseTrig ? "Show Trig Functions" : "Show Inverse Trig Functions"}
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-3 rounded font-medium text-white text-sm transition-all duration-150
              ${
                ["C", "←", "Ans", "Plot", "="].includes(btn)
                  ? "bg-teal-500 hover:bg-teal-400"
                  : ["+", "-", "*", "/", "^", "%", "!"].includes(btn)
                  ? "bg-blue-700 hover:bg-blue-600"
                  : "bg-purple-700 hover:bg-purple-600"
              }`}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <button onClick={handlePlot} className="flex-1 p-2 bg-indigo-600 rounded text-white">
          Plot Input
        </button>
        <button
          onClick={() => {
            setInput("");
            setHistory([]);
            setLastAnswer("");
            localStorage.removeItem("calc_history");
          }}
          className="p-2 bg-red-600 rounded text-white"
        >
          Clear History
        </button>
      </div>
    </div>
  );
};

export default CalculatorInput;