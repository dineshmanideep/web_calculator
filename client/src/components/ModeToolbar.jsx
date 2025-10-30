import { toast } from 'react-toastify';

function ModeToolbar({
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
}) {
  const toggleMode = (modeName, currentValue, setter) => {
    setter(!currentValue);
    if (modeName === 'plot' && !currentValue) {
      setComplexMode(false);
      setMatrixMode(false);
      setDLMode(false);
      setCalculusMode(false);
      handlePlot();
    } else if (modeName === 'matrix' && !currentValue) {
      setComplexMode(false);
      setDLMode(false);
      setCalculusMode(false);
    } else if (modeName !== 'inverse') {
      if (modeName !== 'DL') setDLMode(false);
      if (modeName !== 'calculus') setCalculusMode(false);
      if (modeName !== 'complex') setComplexMode(false);
      if (modeName !== 'matrix') setMatrixMode(false);
    }

    const modeLabel = modeName.charAt(0).toUpperCase() + modeName.slice(1);
    toast.info(`${modeLabel} Mode ${currentValue ? 'OFF' : 'ON'}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => toggleMode('DL', DLMode, setDLMode)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          DLMode 
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        {DLMode && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur opacity-50"></div>}
        <span className="relative flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          ML
        </span>
      </button>
      
      <button
        onClick={() => toggleMode('calculus', calculusMode, setCalculusMode)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          calculusMode 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        {calculusMode && <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-50"></div>}
        <span className="relative">Calculus</span>
      </button>
      
      <button
        onClick={() => toggleMode('complex', complexMode, setComplexMode)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          complexMode 
            ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        {complexMode && <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl blur opacity-50"></div>}
        <span className="relative">Complex</span>
      </button>
      
      <button
        onClick={() => toggleMode('matrix', matrixMode, setMatrixMode)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          matrixMode 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        {matrixMode && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-50"></div>}
        <span className="relative">Matrix</span>
      </button>
      
      <button
        onClick={() => toggleMode('inverse', inverseMode, setInverseMode)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          inverseMode 
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        {inverseMode && <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-50"></div>}
        <span className="relative">Inverse</span>
      </button>
      
      <button
        onClick={() => toggleMode('plot', plotMode, handlePlot)}
        className={`group relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          plotMode 
            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/50' 
            : 'bg-slate-200/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-white/5'
        }`}
        type="button"
      >
        <span className="relative flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Plot
        </span>
      </button>
    </div>
  );
}

export default ModeToolbar;