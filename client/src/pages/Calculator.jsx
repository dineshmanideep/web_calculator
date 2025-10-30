import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, Moon, Sun } from 'lucide-react';
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
  const [darkMode, setDarkMode] = useState(true);

  const handlePlotGraph = (expression, isComplex) => {
    if (!expression || expression.trim() === '') {
      toast.warn('Please enter an expression to plot');
      return;
    }

    triggerPlot();

    if (isComplex || complexMode) {
      setShowComplexPlot(true);
    } else {
      setShowPlot(true);
    }
  };

  useEffect(() => {
    if (complexMode) {
      setPlotMode(false);
      setShowPlot(false);
      setShowComplexPlot(true);
      setInput('');
    } else {
      setShowComplexPlot(false);
    }
  }, [complexMode, setInput, setPlotMode, setShowComplexPlot, setShowPlot]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    toast.info(`${!darkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100'} relative overflow-hidden transition-colors duration-300`}>
    

      {/* Top Navigation Bar */}
      <nav className={`relative z-20 ${darkMode ? 'bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-white/10' : 'bg-gradient-to-r from-white/95 via-indigo-50/95 to-white/95 border-slate-200'} backdrop-blur-xl border-b`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-xl">
                  <CalcIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Scientific Calculator
                </h1>
               
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              {/* <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10' : 'bg-white hover:bg-slate-50 border-slate-300'} border transition-all duration-300`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </button> */}

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`group flex items-center gap-3 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-800/50 hover:bg-slate-800 border-white/10 hover:border-violet-500/50' : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-violet-400'} border transition-all duration-300`}
                >
                  <div className="relative">
                    <div className="relative w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-inner">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.username || 'User'}</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.isAdmin ? 'Admin' : 'Member'}</p>
                  </div>
                  <svg className={`w-4 h-4 ${darkMode ? 'text-slate-400 group-hover:text-violet-400' : 'text-slate-600 group-hover:text-violet-600'} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className={`absolute right-0 mt-3 w-72 ${darkMode ? 'bg-gradient-to-br from-slate-900/95 to-indigo-900/95 border-white/10' : 'bg-gradient-to-br from-white/95 to-indigo-50/95 border-slate-200'} backdrop-blur-2xl rounded-2xl shadow-2xl border overflow-hidden z-40 animate-in slide-in-from-top-2 duration-200`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-white/10 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20' : 'border-slate-200 bg-gradient-to-r from-violet-100 via-fuchsia-100 to-cyan-100'}`}>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.fullName}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{user?.email}</p>
                    </div>

                    {user?.isAdmin && (
                      <button
                        onClick={() => navigate('/admin')}
                        className={`w-full text-left px-4 py-3 ${darkMode ? 'hover:bg-violet-600/20 text-white' : 'hover:bg-violet-100 text-slate-900'} transition-colors duration-200 flex items-center gap-3 group`}
                      >
                        <div className={`w-8 h-8 ${darkMode ? 'bg-violet-500/20 group-hover:bg-violet-500/30' : 'bg-violet-200 group-hover:bg-violet-300'} rounded-lg flex items-center justify-center transition-colors`}>
                          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="font-medium">Admin Dashboard</span>
                      </button>
                    )}

                    <div className={`p-4 border-t border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                      <label className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 block`}>Angle Mode</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAngleMode('rad');
                            toast.info('Angle mode set to Radians');
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            angleMode === 'rad'
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                              : darkMode
                                ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Radians
                        </button>
                        <button
                          onClick={() => {
                            setAngleMode('deg');
                            toast.info('Angle mode set to Degrees');
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            angleMode === 'deg'
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                              : darkMode
                                ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Degrees
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSignOut();
                        toast.info('Signed out successfully');
                      }}
                      className={`w-full text-left px-4 py-3 ${darkMode ? 'hover:bg-red-600/20' : 'hover:bg-red-100'} text-red-400 transition-colors duration-200 flex items-center gap-3 group`}
                    >
                      <div className={`w-8 h-8 ${darkMode ? 'bg-red-500/20 group-hover:bg-red-500/30' : 'bg-red-200 group-hover:bg-red-300'} rounded-lg flex items-center justify-center transition-colors`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex justify-center items-start pt-16 gap-6 px-4">
        {/* Calculator column */}
        <div className="flex flex-col items-center gap-4 max-w-2xl w-full">
          <LastLoginInfo darkMode={darkMode} />

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
            darkMode={darkMode}
          />
        </div>

        {/* Side panel: Plot and History */}
        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-6">
            {/* Function Plot Area */}
            {showPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={(show) => {
                  setShowPlot(show);
                  if (!show) setPlotMode(false);
                }}
                angleMode={angleMode}
                calculatorInput={input}
                isComplexMode={false}
                onPlotTrigger={plotTrigger}
                darkMode={darkMode}
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
                  if (!show) setComplexMode(false);
                }}
                angleMode={angleMode}
                calculatorInput={input}
                isComplexMode={complexMode}
                onPlotTrigger={plotTrigger}
                darkMode={darkMode}
              />
            )}

            {/* History Panel */}
            <div className={`${darkMode ? 'bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border-white/10' : 'bg-gradient-to-br from-white/80 to-indigo-50/80 border-slate-200'} backdrop-blur-2xl rounded-2xl p-5 shadow-2xl border w-80`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="relative w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  History
                </h3>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto text-sm font-mono max-h-96 scrollbar-thin scrollbar-thumb-violet-600/50 scrollbar-track-transparent">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20' : 'bg-gradient-to-br from-violet-200 to-fuchsia-200'} rounded-2xl flex items-center justify-center`}>
                      <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>No history yet</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Start calculating!</p>
                  </div>
                ) : (
                  history.map((item, index) => (
                    <button
                      key={`history-item-${history.length - index}-${item.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      type="button"
                      onClick={() => handleHistoryClick(item)}
                      className={`group cursor-pointer ${darkMode ? 'hover:bg-gradient-to-r hover:from-violet-600/20 hover:to-fuchsia-600/20 hover:border-violet-500/30 hover:shadow-violet-500/10' : 'hover:bg-gradient-to-r hover:from-violet-100 hover:to-fuchsia-100 hover:border-violet-300 hover:shadow-violet-300/20'} p-3 rounded-xl transition-all duration-200 border border-transparent hover:shadow-lg transform hover:scale-[1.02] text-left w-full`}
                      title="Click to load this expression"
                    >
                      <div className={`${darkMode ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'} transition-colors break-words`}>
                        {item}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Calculator({ user, onSignOut }) {
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <p className="text-white text-lg">Session expired. Redirecting...</p>
        </div>
      </div>
    );
  }
  return (
    <CalculatorProvider user={user}>
      <CalculatorContent user={user} onSignOut={onSignOut} />
    </CalculatorProvider>
  );
}
