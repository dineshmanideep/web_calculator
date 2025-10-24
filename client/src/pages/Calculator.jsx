import { useEffect, useRef, useState } from 'react';

import math from '../utils/mathSetup';
import CalculatorInput from '../components/CalculatorInput';
import PlotArea from '../components/PlotArea';
import MatrixModal from '../components/MatrixModal';
import MLCompactColumns from '../components/MLCompactColumns';
import { preprocess } from '../utils/mathEngine';

// Main Calculator page component managing UI state and interactions
export default function Calculator({ user, onSignOut }) {
  const [input, setInput] = useState('');
 const [history, setHistory] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('calc_history')) || [];
  } catch {
    return [];
  }
});

const [lastAnswer, setLastAnswer] = useState(() => {
  if (Array.isArray(history) && history.length > 0) {
    const entry=String(history[0]);
    const parts=entry.split('=');
    return parts.length>1 ? parts[1] : ''
  }
  return '';
});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPlot, setShowPlot] = useState(false);
  const [plotConfig, setPlotConfig] = useState(null); // { x, y, layout }
  const [plotWidth, setPlotWidth] = useState(700); // initial width
  const [plotHeight, setPlotHeight] = useState(400); // initial height
  const [showMLMode, setShowMLMode] = useState(false);
  const [mlParamMode, setMlParamMode] = useState(null);
  const [angleMode, setAngleMode] = useState('rad'); // 'rad' or 'deg'
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixA, setMatrixA] = useState([[1, 0], [0, 1]]);
  const [matrixB, setMatrixB] = useState([[1, 2], [3, 4]]);
  const inputRef = useRef(null);

  // Persist history
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  // keyboard support - physical keyboard

  // helpers
  const pushHistory = (expr, result) => {
    const entry = `${expr} = ${result}`;
    setHistory((h) => [entry, ...h.slice(0, 99)]);
    setLastAnswer(String(result));
  };

  // Start a ML parameter collection sequence: params is array of names, onComplete(values)
  const startParamSequence = (params, onComplete, label) => {
    setMlParamMode({
      params, values: [], onComplete, label,
    });
    // set input to first prompt
    if (params && params.length > 0) setInput(`${params[0]}=`);
  };

  const handleMatrixResult = (expr, result) => {
    setInput(String(result));
    setHistory((h) => [`${expr} = ${result}`, ...h.slice(0, 99)]);
    setLastAnswer(String(result));
  };

  // handle special buttons

  // History reuse: click to insert into input or evaluate
  const handleHistoryClick = (entry) => {
    // entry like "expr = result"
    const expr = entry.split(' = ')[0];
    setInput(expr);
    inputRef.current?.focus();
  };

  // Matrix modal helpers (simple)
  const matrixToString = (m) => JSON.stringify(m);
  const handleMatrixMultiply = () => {
    try {
      const res = math.multiply(math.matrix(matrixA), math.matrix(matrixB));
      const formatted = math.format(res, { precision: 14 });
      pushHistory(`MatMul ${matrixToString(matrixA)} * ${matrixToString(matrixB)}`, formatted);
      setShowMatrixModal(false);
      setInput(String(formatted));
    } catch (e) {
      alert(`Matrix multiply failed: ${e.message}`);
    }
  };

  const handlePlot = () => {
    // tries to interpret input as function in x, e.g. "sin(x)" or expression with x
    if (!input) {
      console.warn('Enter function of x to plot in input, e.g. sin(x)');
      return null;
    }
    try {
      const expr = preprocess(input);
      const xs = math.range(-10, 10, 0.1).toArray();
      const ys = xs.map((x) => {
        try { return math.evaluate(expr.replace(/x/g, `(${x})`)); } catch { return NaN; }
      });
      setPlotConfig({
        x: xs,
        y: ys.map((v) => (typeof v === 'number' ? v : (v.re !== undefined ? v.re : NaN))),
        layout: { title: `y = ${input}` },
      });
      setShowPlot(true);
    } catch (e) {
      alert(`Plot failed: ${e.message}`);
    }
  };

  // Render
  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Profile top-right */}
      <div className="absolute top-2 right-2">
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white font-medium"
          >
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {user?.username || 'User'}
            {' '}
            <span>▼</span>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded shadow-md flex flex-col z-50">
              <div className="text-white p-2 border-b border-gray-600">{user?.fullName}</div>
              <button
                onClick={onSignOut}
                className="text-white p-2 hover:bg-red-600 rounded"
              >
                Sign Out
              </button>
              <div className="flex gap-2 p-2">
                <label className="text-white text-sm">Mode:</label>
                <select value={angleMode} onChange={(e) => setAngleMode(e.target.value)} className="bg-gray-600 text-white p-1 rounded">
                  <option value="rad">Radians</option>
                  <option value="deg">Degrees</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main calculator area centered */}
      <div className="flex flex-1 justify-center items-start pt-16 gap-6 px-2">
        {/* Calculator column */}
        <div className="flex flex-col items-center gap-4">
          <CalculatorInput
            inputRef={inputRef}
            handlePlot={handlePlot}
            input={input}
            angleMode={angleMode}
            setInput={setInput}
            setHistory={setHistory}
            setLastAnswer={setLastAnswer}
            setShowPlot={setShowPlot}
            lastAnswer={lastAnswer}
            pushHistory={pushHistory}
            setShowMatrixModal={setShowMatrixModal}
            mlParamMode={mlParamMode}
            setMlParamMode={setMlParamMode}
            showMLMode={showMLMode}
            startParamSequence={startParamSequence}
            setShowMLMode={setShowMLMode}
          />
        </div>

        {/* Side panel: Plot, History, and ML compact controls below history */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            {showPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={setShowPlot}
                plotConfig={plotConfig}
              />
            )}

            <div className="bg-gray-800 rounded p-3 shadow-md w-64">
              <h3 className="text-white font-semibold text-sm mb-2">History</h3>
              <div className="flex flex-col gap-1 overflow-y-auto text-sm font-mono text-white max-h-96">
                {history.length === 0 && <div className="text-gray-400">No history</div>}
                {history.map((item,i) => (
                  <div key={i+item} onClick={() => handleHistoryClick(item)} className="cursor-pointer hover:bg-gray-700 p-1 rounded">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-2 flex justify-center">
                <button type="button" onClick={() => setShowMLMode((s) => !s)} className="bg-gray-700 text-white px-3 py-1 rounded">ML Mode</button>
              </div>

              {showMLMode && (
              <div className="mt-3 flex justify-center">
                <MLCompactColumns startParamSequence={startParamSequence} pushHistory={pushHistory} setInput={setInput} />
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Modal */}
      <MatrixModal
        show={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        onResult={handleMatrixResult}
      />
    </div>
  );
}