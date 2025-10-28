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
 * - Mode states: angle, complex, ml, calculus, inverse, matrix, plot
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
  const [mlMode, setMlMode] = useState(false);
  const [calculusMode, setCalculusMode] = useState(false);
  const [inverseMode, setInverseMode] = useState(false);

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
    mlMode,
    setMlMode,
    calculusMode,
    setCalculusMode,
    inverseMode,
    setInverseMode,
    matrixMode,
    setMatrixMode,

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
    mlMode,
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
    setMlMode,
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
