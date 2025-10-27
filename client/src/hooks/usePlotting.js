import { useState } from 'react';

/**
 * Custom hook to manage plotting functionality
 * Handles both regular function plots and complex number plots
 *
 * @param {Function} setComplexMode - Function to control complex mode state
 * @returns {Object} Plot state and handlers
 */
export default function usePlotting(setComplexMode) {
  const [showPlot, setShowPlot] = useState(false); // Controls plot box visibility
  const [plotMode, setPlotMode] = useState(false); // Track if function plot mode is active
  const [showComplexPlot, setShowComplexPlot] = useState(false); // Controls complex plot box visibility
  const [plotWidth, setPlotWidth] = useState(700);
  const [plotHeight, setPlotHeight] = useState(400);
  const [plotTrigger, setPlotTrigger] = useState(0);

  /**
   * Toggle function plot mode
   * When enabling plot mode, turns off complex mode and closes complex plot
   * When disabling plot mode, hides the plot box
   */
  const handlePlot = () => {
    const newPlotMode = !plotMode;
    setPlotMode(newPlotMode);
    setShowPlot(newPlotMode);

    if (newPlotMode) {
      setComplexMode(false);
      setShowComplexPlot(false);
    }
  };

  /**
   * Trigger a plot update
   * Used to force re-render of plot area when needed
   */
  const triggerPlot = () => {
    setPlotTrigger((prev) => prev + 1);
  };

  return {
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
  };
}
