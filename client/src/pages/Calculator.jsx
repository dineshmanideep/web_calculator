/*
  Calculator

  Purpose:
  Main calculator page with full functionality including standard math,
  matrix operations, ML features, calculus, complex numbers, and plotting.

  Props:
  - user (Object): Current authenticated user data
  - onSignOut (Function): Handler for user sign out action

  Features:
  - Multi-mode calculator (Standard, ML, Calculus, Complex, Matrix)
  - History management with backend persistence
  - Plot/graph visualization
  - Matrix operations modal
  - Angle mode toggle (degrees/radians)

  Parameters/Return:
  Returns the main calculator page React element.
*/

import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CalculatorInput from '../components/CalculatorInput';
import PlotArea from '../components/PlotArea';
import LastLoginInfo from '../components/LastLoginInfo';
import { CalculatorProvider, useCalculatorContext } from '../contexts/CalculatorContext';

function CalculatorContent({ user, onSignOut }) {
  const {
    input,
    setInput,
    inputRef,
    complexMode,
    setComplexMode,
    showProfileDropdown,
    setShowProfileDropdown,
    history,
    lastAnswer,
    pushHistory,
    handleHistoryClick,
    clearHistory,
    handleMatrixOperation,
    handleMatrixClear,
    matrixOperation,
    firstMatrix,
    matrixMode,
    setMatrixMode,
    angleMode,
    setAngleMode,
    plotMode,
    setPlotMode,
    showPlot,
    setShowPlot,
    showComplexPlot,
    setShowComplexPlot,
    plotWidth,
    setPlotWidth,
    plotHeight,
    setPlotHeight,
    handlePlot,
    triggerPlot,
    plotTrigger,
  } = useCalculatorContext();

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
  }, [complexMode, setInput, setPlotMode, setShowComplexPlot, setShowPlot]);

  // Render
  return (
    <div className="h-screen bg-gray-900 relative ">
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
                <label htmlFor="angle-mode-select" className="text-white text-sm">
                  Mode:
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
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main calculator area centered */}
      {/**/}
      <div className="flex justify-center items-start pt-16 gap-6 px-2">
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
                {history.map((item, index) => (
                  <button
                    key={`history-item-${history.length - index}-${item.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    type="button"
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer hover:bg-gray-700 p-1 rounded text-left w-full"
                    title="Click to load this expression"
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that provides Calculator context
export default function Calculator({ user, onSignOut }) {
  return (
    <CalculatorProvider user={user}>
      <CalculatorContent user={user} onSignOut={onSignOut} />
    </CalculatorProvider>
  );
}
