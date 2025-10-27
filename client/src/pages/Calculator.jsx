import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CalculatorInput from '../components/CalculatorInput';
import PlotArea from '../components/PlotArea';
import LastLoginInfo from '../components/LastLoginInfo';
import useCalculatorHistory from '../hooks/useCalculatorHistory';
import useMatrixOperations from '../hooks/useMatrixOperations';
import usePlotting from '../hooks/usePlotting';
import useAngleMode from '../hooks/useAngleMode';

// Main Calculator page component managing UI state and interactions
export default function Calculator({ user, onSignOut }) {
  const [input, setInput] = useState('');
  const [complexMode, setComplexMode] = useState(false); // Track complex number mode
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const inputRef = useRef(null);
  
  // Use history hook
  const {
    history,
    lastAnswer,
    setLastAnswer,
    pushHistory,
    handleHistoryClick,
    clearHistory,
  } = useCalculatorHistory(user, setInput, inputRef);

  // Use matrix operations hook
  const {
    matrixMode,
    setMatrixMode,
    matrixOperation,
    firstMatrix,
    handleMatrixOperation,
    handleMatrixClear,
    handleMatrixResult,
  } = useMatrixOperations(input, setInput, pushHistory, setLastAnswer);

  // Use plotting hook
  const {
    showPlot,
    setShowPlot,
    plotMode,
    setPlotMode,
    showComplexPlot,
    setShowComplexPlot,
    plotWidth,
    setPlotWidth,
    plotHeight,
    setPlotHeight,
    plotTrigger,
    handlePlot,
    triggerPlot,
  } = usePlotting(setComplexMode);

  // Use angle mode hook
  const { angleMode, setAngleMode } = useAngleMode();

  const navigate = useNavigate();

  const handlePlotGraph = (expression, isComplex) => {
    // This function will be called when user clicks "Plot Graph" button
    if (!expression || expression.trim() === '') {
      toast.warn('Please enter an expression to plot');
      return;
    }

    // Increment trigger to notify PlotArea to plot
    triggerPlot();

    // Show the appropriate plot box
    if (isComplex || complexMode) {
      setShowComplexPlot(true);
    } else {
      setShowPlot(true);
    }
  };

  // Watch complex mode changes
  useEffect(() => {
    if (complexMode) {
      // When complex mode is enabled, disable plot mode and show complex plot
      setPlotMode(false);
      setShowPlot(false);
      setShowComplexPlot(true);
      // Clear input when switching to complex mode
      setInput('');
    } else {
      // When complex mode is disabled, hide complex plot
      setShowComplexPlot(false);
    }
  }, [complexMode]);

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

              {/* Admin Dashboard Link - Only for admin users */}
              {user?.isAdmin && (
                <button
                  onClick={() => {
                    // Navigate to admin dashboard using react router
                    navigate('/admin');
                  }}
                  className="text-white p-2 hover:bg-purple-600 rounded text-left"
                >
                  Admin Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  onSignOut();
                  toast.info('Signed out successfully');
                }}
                className="text-white p-2 hover:bg-red-600 rounded"
              >
                Sign Out
              </button>
              <div className="flex gap-2 p-2">
                <label htmlFor="angle-mode-select" className="text-white text-sm">Mode:</label>
                <select
                  id="angle-mode-select"
                  value={angleMode}
                  onChange={(e) => {
                    setAngleMode(e.target.value);
                    toast.info(`Angle mode set to ${e.target.value === 'rad' ? 'Radians' : 'Degrees'}`);
                  }}
                  className="bg-gray-600 text-white p-1 rounded"
                >
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
        <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
          {/* Last Login Info Banner */}
          <LastLoginInfo />

          <CalculatorInput
            inputRef={inputRef}
            handlePlot={handlePlot}
            input={input}
            angleMode={angleMode}
            setInput={setInput}
            setShowPlot={setShowPlot}
            lastAnswer={lastAnswer}
            pushHistory={pushHistory}
            showPlot={plotMode || complexMode}
            plotMode={plotMode}
            onPlotGraph={handlePlotGraph}
            complexMode={complexMode}
            setComplexMode={setComplexMode}
            matrixMode={matrixMode}
            setMatrixMode={setMatrixMode}
            onMatrixOperation={handleMatrixOperation}
            matrixOperation={matrixOperation}
            firstMatrix={firstMatrix}
            onMatrixClear={handleMatrixClear}
            clearHistory={clearHistory}
          />
        </div>

        {/* Side panel: Plot, History, and ML compact controls below history */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            {/* Function Plot Area */}
            {showPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={(show) => {
                  setShowPlot(show);
                  if (!show) setPlotMode(false); // Also disable plot mode when closing
                }}
                angleMode={angleMode}
                calculatorInput={input}
                complexMode={false}
                onPlotTrigger={plotTrigger}
              />
            )}

            {/* Complex Plot Area */}
            {showComplexPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={(show) => {
                  setShowComplexPlot(show);
                  if (!show) setComplexMode(false); // Also disable complex mode when closing
                }}
                angleMode={angleMode}
                calculatorInput={input}
                complexMode
                onPlotTrigger={plotTrigger}
              />
            )}

            <div className="bg-gray-800 rounded p-3 shadow-md w-64">
              <h3 className="text-white font-semibold text-sm mb-2">History</h3>
              <div className="flex flex-col gap-1 overflow-y-auto text-sm font-mono text-white max-h-96">
                {history.length === 0 && <div className="text-gray-400">No history</div>}
                {history.map((item, i) => (
                  <div
                    key={i + item}
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer hover:bg-gray-700 p-1 rounded"
                    title="Click to load this expression"
                  >
                    {item}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
