import React from 'react';

// Button constants
const COMPLEX_BUTTONS = ['i', 're(', 'im(', 'conj(', 'abs(', 'arg('];
const ML_BUTTONS = ['BestFit', 'Params', 'WOpt', 'RF', 'LR', 'FeatImp'];
const CONSTANT_BUTTONS = ['π', 'e'];
const CALCULUS_BUTTONS = ['d/dx(', '∫(', 'x', ','];
const MATRIX_BUTTONS = ['MatMul', 'MatAdd', 'MatSub', 'Det', 'Transpose'];

/**
 * ButtonGrid Component
 * Renders all calculator buttons based on active modes
 * Simple, clean, and focused on button display
 */
function ButtonGrid({
  baseButtons,
  AdvFxnButtons,
  complexMode,
  mlMode,
  calculusMode,
  matrixMode,
  handleClick,
}) {
  return (
    <>
      {/* Trig buttons - always show */}
      <div className="grid grid-cols-6 gap-2">
        {AdvFxnButtons.map((b) => (
          <button
            key={b}
            onClick={() => handleClick(b)}
            className="p-2 bg-orange-600 hover:bg-orange-500 rounded text-white text-sm"
            type="button"
          >
            {b}
          </button>
        ))}
      </div>

      {/* Complex mode buttons */}
      {complexMode && (
        <div className="grid grid-cols-4 gap-2">
          {COMPLEX_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="p-2 bg-pink-700 hover:bg-pink-600 rounded text-white text-sm"
              type="button"
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* ML mode buttons */}
      {mlMode && (
        <div className="grid grid-cols-3 gap-2">
          {ML_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white text-sm"
              type="button"
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Calculus mode buttons */}
      {calculusMode && (
        <div className="grid grid-cols-4 gap-2">
          {CALCULUS_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="p-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm"
              type="button"
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Matrix mode buttons */}
      {matrixMode && (
        <div className="grid grid-cols-3 gap-2">
          {MATRIX_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white text-sm font-medium transition-colors shadow-md"
              type="button"
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Constant buttons (π, e) */}
      <div className="grid grid-cols-2 gap-2">
        {CONSTANT_BUTTONS.map((b) => (
          <button
            key={b}
            onClick={() => handleClick(b)}
            className="p-2 bg-yellow-700 hover:bg-yellow-600 rounded text-white text-sm"
            type="button"
          >
            {b}
          </button>
        ))}
      </div>

      {/* Base keypad (numbers and operators) */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {baseButtons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-3 rounded font-medium text-white text-sm transition-all duration-150
              ${
                ['C', '←', 'Ans', '='].includes(btn)
                  ? 'bg-teal-500 hover:bg-teal-400'
                  : ['+', '-', '*', '/', '^', '%', '!', '(', ')', '[', ']', ','].includes(btn)
                    ? 'bg-blue-700 hover:bg-blue-600'
                    : 'bg-purple-700 hover:bg-purple-600'
              }`}
            type="button"
          >
            {btn}
          </button>
        ))}
      </div>
    </>
  );
}

export default ButtonGrid;
