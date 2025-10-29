import React from 'react';
import {
  COMPLEX_BUTTONS,
  DL_BUTTONS,
  CONSTANT_BUTTONS,
  CALCULUS_BUTTONS,
  MATRIX_BUTTONS,
  PLOT_BUTTONS,
  BASE_BUTTONS,
  INVERSE_BUTTONS,
  STANDARD_BUTTONS,
} from '../constants/buttonConstants';

function ButtonGrid({
  inverseMode,
  complexMode,
  DLMode,
  calculusMode,
  matrixMode,
  plotMode,
  handleClick,
}) {
  const AdvFxnButtons = inverseMode ? INVERSE_BUTTONS : STANDARD_BUTTONS;
  return (
    <>
      {/* Trig buttons */}
      <div className="grid grid-cols-4 gap-2">
        {AdvFxnButtons.map((b) => (
          <button
            key={b}
            onClick={() => handleClick(b)}
            className="group relative px-3 py-3 bg-gradient-to-br from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/50 hover:scale-105 border border-white/10"
            type="button"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <span className="relative">{b}</span>
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
              className="group relative px-3 py-3 bg-gradient-to-br from-pink-700/80 to-rose-700/80 hover:from-pink-600 hover:to-rose-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-pink-500/50 hover:scale-105 border border-white/10"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-700 to-rose-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">{b}</span>
            </button>
          ))}
        </div>
      )}

      {/* DL mode buttons */}
      {DLMode && (
        <div className="grid grid-cols-3 gap-2">
          {DL_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="group relative px-3 py-3 bg-gradient-to-br from-indigo-700/80 to-blue-700/80 hover:from-indigo-600 hover:to-blue-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/50 hover:scale-105 border border-white/10"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-blue-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">{b}</span>
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
              className="group relative px-3 py-3 bg-gradient-to-br from-green-700/80 to-emerald-700/80 hover:from-green-600 hover:to-emerald-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/50 hover:scale-105 border border-white/10"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-emerald-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">{b}</span>
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
              className="group relative px-3 py-3 bg-gradient-to-br from-blue-700/80 to-cyan-700/80 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/50 hover:scale-105 border border-white/10"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-cyan-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">{b}</span>
            </button>
          ))}
        </div>
      )}

      {/* Plot mode buttons */}
      {plotMode && (
        <div className="grid grid-cols-2 gap-2">
          {PLOT_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="group relative px-3 py-3 bg-gradient-to-br from-purple-700/80 to-fuchsia-700/80 hover:from-purple-600 hover:to-fuchsia-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 border border-white/10"
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-fuchsia-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <span className="relative">{b}</span>
            </button>
          ))}
        </div>
      )}

      {/* Constant buttons */}
      <div className="grid grid-cols-2 gap-2">
        {CONSTANT_BUTTONS.map((b) => (
          <button
            key={b}
            onClick={() => handleClick(b)}
            className="group relative px-3 py-3 bg-gradient-to-br from-yellow-700/80 to-amber-700/80 hover:from-yellow-600 hover:to-amber-600 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-yellow-500/50 hover:scale-105 border border-white/10"
            type="button"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-700 to-amber-700 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <span className="relative">{b}</span>
          </button>
        ))}
      </div>

      {/* Base keypad */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {BASE_BUTTONS.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`group relative px-4 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 shadow-lg border border-white/10 ${
              ['C', '←', 'Ans', '='].includes(btn)
                ? 'bg-gradient-to-br from-teal-600/80 to-cyan-600/80 hover:from-teal-500 hover:to-cyan-500 hover:shadow-teal-500/50'
                : ['+', '-', '*', '/', '^', '%', '!', '(', ')', '[', ']', ','].includes(btn)
                  ? 'bg-gradient-to-br from-blue-700/80 to-indigo-700/80 hover:from-blue-600 hover:to-indigo-600 hover:shadow-blue-500/50'
                  : 'bg-gradient-to-br from-purple-700/80 to-fuchsia-700/80 hover:from-purple-600 hover:to-fuchsia-600 hover:shadow-purple-500/50'
            }`}
            type="button"
          >
            <div className={`absolute inset-0 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity ${
              ['C', '←', 'Ans', '='].includes(btn)
                ? 'bg-gradient-to-br from-teal-600 to-cyan-600'
                : ['+', '-', '*', '/', '^', '%', '!', '(', ')', '[', ']', ','].includes(btn)
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-700'
                  : 'bg-gradient-to-br from-purple-700 to-fuchsia-700'
            }`}></div>
            <span className="relative">{btn}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default ButtonGrid