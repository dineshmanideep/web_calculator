/*
 * ButtonGrid
 *
 * Purpose:
 * Renders all calculator buttons dynamically based on the active mode.
 * Groups buttons into functional categories (trig, matrix, calculus, DL, constants, base keypad)
 * and applies distinct styling for each.
 *
 * Features:
 * - Supports multiple modes (inverse, complex, DL, calculus, matrix)
 * - Dynamically switches between standard and inverse trigonometric buttons
 * - Consistent grid layout and color-coded button groups
 * - Delegates all button click logic to parent via handleClick
 *
 * Parameters:
 * - inverseMode (boolean): Toggles between standard and inverse trig functions
 * - complexMode (boolean): Enables complex number operation buttons
 * - DLMode (boolean): Enables machine learning operation buttons
 * - calculusMode (boolean): Enables calculus operation buttons
 * - matrixMode (boolean): Enables matrix operation buttons
 * - handleClick (function): Handles button press logic
 *
 * Return value:
 * A collection of button grids rendered conditionally based on modes.
 */

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

      {/* DL mode buttons */}
      {DLMode && (
        <div className="grid grid-cols-3 gap-2">
          {DL_BUTTONS.map((b) => (
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

      {/* Plot mode buttons */}
      {plotMode && (
        <div className="grid grid-cols-2 gap-2">
          {PLOT_BUTTONS.map((b) => (
            <button
              key={b}
              onClick={() => handleClick(b)}
              className="p-2 bg-purple-700 hover:bg-purple-600 rounded text-white text-sm font-medium transition-colors shadow-md"
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
        {BASE_BUTTONS.map((btn) => (
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
