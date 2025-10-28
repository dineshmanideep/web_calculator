/*
 * CalculatorContext
 */
/*
 * CalculatorContext
 *
 * Purpose:
 * Provides a centralized global state management system for the calculator.
 * It eliminates prop drilling by using React Context and integrates multiple custom hooks
 * for handling input, modes, history, matrix operations, and plotting.
 *
 * Parameters:
 * - children (ReactNode): Components wrapped inside the provider.
 * - user (object): Optional user data (email, username, isAdmin).
 *
 * Context Values:
 * - Input and reference management
 * - Mode states: angle, complex, DL, calculus, inverse, matrix, plot
 * - UI states: info modal, profile dropdown, matrix modal
 * - History: logs, handlers, last answer
 * - Matrix: operation handlers and state
 * - Plot: visualization handlers, dimensions, triggers
 *
 * Return value:
 * A React Context Provider component wrapping calculator-related global states and handlers.
 */

import React, {
  createContext, useContext, useState, useRef, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import useCalculatorHistory from '../hooks/useCalculatorHistory';
import useMatrixOperations from '../hooks/useMatrixOperations';
import usePlotting from '../hooks/usePlotting';
import useAngleMode from '../hooks/useAngleMode';
import {
  convOut1D,
  transOut1D,
  padSame1D,
  padDiff1D,
  poolOut1D,
  convParams1D,
  transParams1D,
  convParams2D,
  transParams2D,
} from '../utils/dlHelperFunctions';

const CalculatorContext = createContext(null);

export function useCalculatorContext() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculatorContext must be used within CalculatorProvider');
  }
  return context;
}

export function CalculatorProvider({ children, user }) {
  // Core input state
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Mode states
  const [complexMode, setComplexMode] = useState(false);
  const [DLMode, setDLMode] = useState(false);
  const [calculusMode, setCalculusMode] = useState(false);
  const [inverseMode, setInverseMode] = useState(false);

  // DL parameter collection state
  const [dlActiveOp, setDlActiveOp] = useState(null);
  const [dlParamIndex, setDlParamIndex] = useState(0);
  const [dlParams, setDlParams] = useState([]);
  const [dlSchema, setDlSchema] = useState(null);

  // UI states
  const [showInfo, setShowInfo] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Use angle mode hook
  const { angleMode, setAngleMode } = useAngleMode();

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
  } = useMatrixOperations(input, setInput, pushHistory, setLastAnswer, angleMode);

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

  // DL parameter collection handlers
  const startDLOperation = (opKey, initialValue) => {
    const opMap = {
      'C→O': {
        schema: ['L_in', 'K', 'S', 'P', 'd'],
        fn: ({ L_in, K, S, P, d }) => convOut1D({ L_in, K, S, P, d }),
        resultKey: 'L_out',
      },
      'P→O': {
        schema: ['L_in', 'K', 'S', 'P'],
        fn: ({ L_in, K, S, P }) => poolOut1D({ L_in, K, S, P }),
        resultKey: 'L_out',
      },
      'PSAME': {
        schema: ['L_in', 'K', 'S', 'd'],
        fn: ({ L_in, K, S, d }) => padSame1D({ L_in, K, S, d }),
        resultKey: 'P',
      },
      'PDOUT': {
        schema: ['L_in', 'K', 'S', 'L_out_desired', 'd'],
        fn: ({ L_in, K, S, L_out_desired, d }) => padDiff1D({ L_in, K, S, L_out_desired, d }),
        resultKey: 'P',
      },
      'TC→O': {
        schema: ['L_in', 'K', 'S', 'P', 'opad', 'd'],
        fn: ({ L_in, K, S, P, opad, d }) => transOut1D({ L_in, K, S, P, opad, d }),
        resultKey: 'L_out',
      },
      'C1D→P': {
        schema: ['Cin', 'Cout', 'K', 'groups', 'biasFlag'],
        fn: ({ Cin, Cout, K, groups, biasFlag }) => convParams1D({ Cin, Cout, K, groups, biasFlag }),
        resultKey: 'params',
      },
      'TC1D→P': {
        schema: ['Cin', 'Cout', 'K', 'groups', 'biasFlag'],
        fn: ({ Cin, Cout, K, groups, biasFlag }) => transParams1D({ Cin, Cout, K, groups, biasFlag }),
        resultKey: 'params',
      },
      'C2D→P': {
        schema: ['Cin', 'Cout', 'Kh', 'Kw', 'groups', 'biasFlag'],
        fn: ({ Cin, Cout, Kh, Kw, groups, biasFlag }) => convParams2D({ Cin, Cout, Kh, Kw, groups, biasFlag }),
        resultKey: 'params',
      },
      'TC2D→P': {
        schema: ['Cin', 'Cout', 'Kh', 'Kw', 'groups', 'biasFlag'],
        fn: ({ Cin, Cout, Kh, Kw, groups, biasFlag }) => transParams2D({ Cin, Cout, Kh, Kw, groups, biasFlag }),
        resultKey: 'params',
      },
    };

    const config = opMap[opKey];
    if (!config) return;
    setDlActiveOp({ key: opKey, ...config });
    setDlSchema(config.schema);
    // Always start fresh and ask for the first parameter in the textbox
    setDlParams([]);
    setDlParamIndex(0);
  };

  const handleDLEquals = (currentValue, angleModeParam = angleMode) => {
    if (!dlActiveOp || !dlSchema) return null;

    const nextParams = [...dlParams];
    const incoming = currentValue != null && String(currentValue).trim() !== '' ? String(currentValue).trim() : null;
    if (incoming !== null) {
      nextParams.push(incoming);
    }

    if (nextParams.length < dlSchema.length) {
      setDlParams(nextParams);
      setDlParamIndex(nextParams.length);
      return { type: 'continue', needed: dlSchema[nextParams.length] };
    }

    const args = {};
    dlSchema.forEach((name, i) => { args[name] = Number(nextParams[i]); });

    let out;
    try {
      out = dlActiveOp.fn(args, angleModeParam);
    } catch (e) {
      setDlActiveOp(null);
      setDlSchema(null);
      setDlParams([]);
      setDlParamIndex(0);
      throw e;
    }

    const resultKey = dlActiveOp.resultKey;
    const value = out && typeof out === 'object' && resultKey in out ? out[resultKey] : out;

    setDlActiveOp(null);
    setDlSchema(null);
    setDlParams([]);
    setDlParamIndex(0);

    return { type: 'done', value };
  };

  const cancelDLOperation = () => {
    setDlActiveOp(null);
    setDlSchema(null);
    setDlParams([]);
    setDlParamIndex(0);
  };

  const value = useMemo(() => ({
    // Input state
    input,
    setInput,
    inputRef,

    // Mode states
    angleMode,
    setAngleMode,
    complexMode,
    setComplexMode,
    DLMode,
    setDLMode,
    calculusMode,
    setCalculusMode,
    inverseMode,
    setInverseMode,
    matrixMode,
    setMatrixMode,

    dlActiveOp,
    dlParamIndex,
    dlParams,
    dlSchema,
    startDLOperation,
    handleDLEquals,
    cancelDLOperation,
    // UI states
    showInfo,
    setShowInfo,
    showProfileDropdown,
    setShowProfileDropdown,
    showMatrixModal,
    setShowMatrixModal,

    // History
    history,
    lastAnswer,
    setLastAnswer,
    pushHistory,
    handleHistoryClick,
    clearHistory,

    // Matrix operations
    matrixOperation,
    firstMatrix,
    handleMatrixOperation,
    handleMatrixClear,
    handleMatrixResult,

    // Plotting
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
  }), [
    input,
    angleMode,
    complexMode,
    DLMode,
    calculusMode,
    inverseMode,
    matrixMode,
    showInfo,
    showProfileDropdown,
    showMatrixModal,
    history,
    lastAnswer,
    matrixOperation,
    firstMatrix,
    showPlot,
    plotMode,
    showComplexPlot,
    plotWidth,
    plotHeight,
    plotTrigger,
    setAngleMode,
    setComplexMode,
    setDLMode,
    setCalculusMode,
    setInverseMode,
    setMatrixMode,
    setShowInfo,
    setShowProfileDropdown,
    setShowMatrixModal,
    setLastAnswer,
    pushHistory,
    handleHistoryClick,
    clearHistory,
    handleMatrixOperation,
    handleMatrixClear,
    handleMatrixResult,
    setShowPlot,
    setPlotMode,
    setShowComplexPlot,
    setPlotWidth,
    setPlotHeight,
    handlePlot,
    triggerPlot,
  ]);

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
}

CalculatorProvider.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string,
    username: PropTypes.string,
    isAdmin: PropTypes.bool,
  }),
};

CalculatorProvider.defaultProps = {
  user: null,
};

export default CalculatorContext;
