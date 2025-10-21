import { useEffect, useRef, useState } from "react";
import math from "../utils/mathSetup";
import CalculatorInput from "../components/CalculatorInput";
import PlotArea from "../components/PlotArea";
import { preprocess } from "../utils/mathEngine";
import MatrixModal from "../components/MatrixModal";

export default function Calculator({ user, onSignOut }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("calc_history")) || []; } catch { return []; }
  });
  const [lastAnswer, setLastAnswer] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPlot, setShowPlot] = useState(false);
  const [plotConfig, setPlotConfig] = useState(null);
  const [plotWidth, setPlotWidth] = useState(700);
  const [plotHeight, setPlotHeight] = useState(400);
  const [angleMode, setAngleMode] = useState("rad");
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [initialMatrixInput, setInitialMatrixInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("calc_history", JSON.stringify(history));
  }, [history]);

  const pushHistory = (expr, result) => {
    const entry = `${expr} = ${result}`;
    setHistory(h => [entry, ...h.slice(0, 99)]);
    setLastAnswer(String(result));
  };

  const handleMatrixResult = (expr, result) => {
    setInput(String(result));
    setHistory(h => [`${expr} = ${result}`, ...h.slice(0, 99)]);
    setLastAnswer(String(result));
  };

  const openMatrixModal = (show, initInput = "") => {
    setInitialMatrixInput(initInput);
    setShowMatrixModal(show);
  };

  const handleHistoryClick = (entry) => {
    const expr = entry.split(" = ")[0];
    setInput(expr);
    inputRef.current?.focus();
  };

  const handlePlot = () => {
    if (!input) return alert("Enter function of x to plot in input, e.g. sin(x)");
    try {
      const expr = preprocess(input);
      const xs = math.range(-10, 10, 0.1).toArray();
      const ys = xs.map(x => {
        try { return math.evaluate(expr.replace(/x/g, `(${x})`)); } catch { return NaN; }
      });
      setPlotConfig({
        x: xs,
        y: ys.map(v => (typeof v === "number" ? v : (v.re !== undefined ? v.re : NaN))),
        layout: { title: `y = ${input}` }
      });
      setShowPlot(true);
    } catch (e) {
      alert("Plot failed: " + e.message);
    }
  };

  return (
    <div className="h-screen bg-gray-900 relative">
      <div className="absolute top-2 right-2">
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white font-medium"
          >
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            {user?.username || "User"} <span>▼</span>
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
                <select value={angleMode} onChange={(e)=>setAngleMode(e.target.value)} className="bg-gray-600 text-white p-1 rounded">
                  <option value="rad">Radians</option>
                  <option value="deg">Degrees</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 justify-center items-start pt-16 gap-6 px-2">
        <div className="flex flex-col items-center gap-4">
          <CalculatorInput
            inputRef={inputRef}
            handlePlot={handlePlot}
            input={input}
            setInput={setInput}
            setHistory={setHistory}
            setLastAnswer={setLastAnswer}
            setShowPlot={setShowPlot}
            lastAnswer={lastAnswer}
            pushHistory={pushHistory}
            setShowMatrixModal={openMatrixModal}
            showMatrixModal={showMatrixModal} // NEW: Pass to conditionalize listener
          />
        </div>

        <div className="flex flex-row gap-4">
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
              {history.map((item, idx) => (
                <div key={idx} onClick={() => handleHistoryClick(item)} className="cursor-pointer hover:bg-gray-700 p-1 rounded">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MatrixModal
        show={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        onResult={handleMatrixResult}
        initialInput={initialMatrixInput}
      />
    </div>
  );
}