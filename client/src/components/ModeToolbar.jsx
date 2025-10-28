/*
 * ModeToolbar
 *
 * Purpose:
 * Renders calculator mode toggle buttons (ML, Calculus, Complex, Matrix, Inverse, Plot)
 * and manages their active states with toast feedback.
 *
 * Parameters:
 * - mlMode, setMlMode: control ML mode
 * - calculusMode, setCalculusMode: control calculus mode
 * - complexMode, setComplexMode: control complex mode
 * - matrixMode, setMatrixMode: control matrix mode
 * - inverseMode, setInverseMode: control inverse mode
 * - plotMode: indicates active plot mode
 * - handlePlot: external plot handler
 *
 * Return value:
 * A toolbar component with buttons to toggle calculator modes.
 */
import React from 'react';
import { toast } from 'react-toastify';

function ModeToolbar({
  mlMode,
  setMlMode,
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
  // Generic mode toggle handler - ONE function for all modes
  const toggleMode = (modeName, currentValue, setter) => {
    // Toggle the selected mode
    setter(!currentValue);

    // Turn off other modes (except inverse which works independently)
    if (modeName !== 'inverse') {
      if (modeName !== 'ml') setMlMode(false);
      if (modeName !== 'calculus') setCalculusMode(false);
      if (modeName !== 'complex') setComplexMode(false);
      if (modeName !== 'matrix') setMatrixMode(false);
    }

    // Show appropriate message
    const modeLabel = modeName.charAt(0).toUpperCase() + modeName.slice(1);
    toast.info(`${modeLabel} Mode ${currentValue ? 'OFF' : 'ON'}`);
  };

  // Plot handler - special case as it calls external function
  const handlePlotToggle = () => {
    setComplexMode(false);
    handlePlot();
  };

  return (
    <div className="flex flex-wrap gap-2 justify-between">
      <button
        onClick={() => toggleMode('ml', mlMode, setMlMode)}
        className={`px-3 py-1 rounded ${mlMode ? 'bg-indigo-600' : 'bg-gray-700'} text-white`}
        type="button"
      >
        ML
      </button>

      <button
        onClick={() => toggleMode('calculus', calculusMode, setCalculusMode)}
        className={`px-3 py-1 rounded ${calculusMode ? 'bg-green-600' : 'bg-gray-700'} text-white`}
        type="button"
      >
        Calculus
      </button>

      <button
        onClick={() => toggleMode('complex', complexMode, setComplexMode)}
        className={`px-3 py-1 rounded ${complexMode ? 'bg-pink-600' : 'bg-gray-700'} text-white`}
        type="button"
      >
        Complex
      </button>

      <button
        onClick={() => toggleMode('matrix', matrixMode, setMatrixMode)}
        className={`px-3 py-1 rounded ${matrixMode ? 'bg-blue-600' : 'bg-gray-700'} text-white`}
        type="button"
      >
        Matrix
      </button>

      <button
        onClick={() => toggleMode('inverse', inverseMode, setInverseMode)}
        className={`px-3 py-1 rounded ${inverseMode ? 'bg-yellow-600' : 'bg-gray-700'} text-white`}
        type="button"
      >
        Inverse
      </button>

      <button
        onClick={handlePlotToggle}
        className={`px-3 py-1 rounded ${plotMode ? 'bg-purple-600' : 'bg-gray-700'} text-white hover:bg-purple-600`}
        type="button"
      >
        Plot
      </button>
    </div>
  );
}

export default ModeToolbar;
