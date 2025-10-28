/*
 * buttonConstants
 *
 * Purpose:
 * Defines categorized constant arrays of button labels used across the calculator UI.
 * Each array groups buttons by their mathematical functionality for organized rendering.
 *
 * Return value:
 * Exports button label arrays for calculator component rendering.
 */


/**
 * Complex number operation buttons
 * @constant {string[]}
 */
export const COMPLEX_BUTTONS = ['i', 're(', 'im(', 'conj(', 'abs(', 'arg('];


export const ML_BUTTONS = ['BestFit', 'Params', 'WOpt', 'RF', 'LR', 'FeatImp'];


export const CONSTANT_BUTTONS = ['π', 'e'];

/**
 * Calculus operation buttons (derivative, integral)
 * @constant {string[]}
 */
export const CALCULUS_BUTTONS = ['d/dx(', '∫(', 'x', ','];

/**
 * Matrix operation buttons
 * @constant {string[]}
 */
export const MATRIX_BUTTONS = ['MatMul', 'MatAdd', 'MatSub', 'Det', 'Transpose'];

/**
 * Base calculator buttons (numbers, basic operators, control)
 * @constant {string[]}
 */
export const BASE_BUTTONS = [
  'C', '←', 'Ans', '=',
  '7', '8', '9', '/',
  '4', '5', '6', '*',
  '1', '2', '3', '-',
  '0', '.', '+', '^', '%',
  '(', ')', '!', ',', '[', ']',
];

/**
 * Inverse trigonometric and hyperbolic function buttons
 * @constant {string[]}
 */
export const INVERSE_BUTTONS = ['asin(', 'acos(', 'atan(', 'asinh(', 'acosh(', 'atanh(', '10^(', 'e^('];

/**
 * Standard trigonometric and hyperbolic function buttons
 * @constant {string[]}
 */
export const STANDARD_BUTTONS = ['sin(', 'cos(', 'tan(', 'sinh(', 'cosh(', 'tanh(', 'log(', 'ln('];
