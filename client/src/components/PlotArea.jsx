/*
 * PlotArea
 *
 * Purpose:
 * Provides an interactive plotting interface supporting both real function graphs
 * and complex number visualizations. Handles dynamic resizing, zooming, and
 * automatic mode switching between function and complex plots.
 *
 * Parameters:
 * - plotWidth, setPlotWidth: Controls the plot container’s width.
 * - plotHeight, setPlotHeight: Controls the plot container’s height.
 * - setShowPlot: Toggles visibility of the plot area.
 * - angleMode: Current trigonometric angle mode ('deg' or 'rad').
 * - calculatorInput: Expression string to be plotted.
 * - complexMode: Boolean to toggle between real and complex plotting.
 * - onPlotTrigger: External signal to trigger plot generation.
 *
 * Internal State:
 * - plotData: Stores current plot dataset and metadata.
 * - xRange: Defines the x-axis plotting range.
 * - plotMode: Current mode ('function' or 'complex').
 * - isPlotting: Indicates ongoing plotting operation.
 *
 * Return value:
 * A responsive, resizable React component rendering either:
 *   - Function plots (y = f(x)) using Plotly.
 *   - Complex number vectors (z = a + bi) with annotations and projections.
 */

import React, { useRef, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { toast } from 'react-toastify';
import { math, preprocessExpression } from '../utils/evaluator';

const MIN_WIDTH = 400;
const MAX_WIDTH = 900;
const MIN_HEIGHT = 300;
const MAX_HEIGHT = 700;

const PlotArea = ({
  plotWidth, setPlotWidth, plotHeight, setPlotHeight, setShowPlot, angleMode, calculatorInput, complexMode, onPlotTrigger,
}) => {
  const [plotData, setPlotData] = useState(null);
  const [xRange, setXRange] = useState([-10, 10]);
  const [, setIsPlotting] = useState(false);
  const [plotMode, setPlotMode] = useState('function'); // 'function' or 'complex'

  const resizing = useRef({ type: null });

  // Update plot mode based on complex mode from calculator
  React.useEffect(() => {
    if (complexMode !== undefined) {
      const newMode = complexMode ? 'complex' : 'function';
      if (newMode !== plotMode) {
        setPlotMode(newMode);
        // Clear the plot when switching modes
        setPlotData(null);
        toast.info(`Switched to ${newMode === 'complex' ? 'Complex' : 'Function'} mode`);
      }
    }
  }, [complexMode, plotMode]);
  const generatePlotData = useCallback((func, xMin, xMax) => {
    try {
      const expr = preprocessExpression(func, angleMode);
      const range = Math.abs(xMax - xMin);
      const numPoints = Math.min(Math.max(500, Math.floor(range * 20)), 5000);
      const step = range / numPoints;

      const xs = [];
      const ys = [];

      for (let x = xMin; x <= xMax; x += step) {
        try {
          // Replace x with actual value
          const exprWithX = expr.replace(/x/g, `(${x})`);

          // Evaluate with silent overrides to avoid domain toasts (e.g., log of negative)
          const silentLog = (vx, base) => {
            const val = Number(vx);
            if (!Number.isFinite(val) || val <= 0) return NaN;
            if (base !== undefined) {
              const b = Number(base);
              if (!Number.isFinite(b) || b <= 0 || b === 1) return NaN;
              return Math.log(val) / Math.log(b);
            }
            return Math.log10(val);
          };
          const silentLn = (vx) => {
            const val = Number(vx);
            if (!Number.isFinite(val) || val <= 0) return NaN;
            return Math.log(val);
          };

          const result = math.evaluate(exprWithX, { log: silentLog, ln: silentLn });

          // Extract numeric value
          let y;
          if (typeof result === 'number') {
            y = result;
          } else if (result && typeof result === 'object' && result.re !== undefined) {
            y = result.re;
          } else {
            // Skip non-numeric results
            y = null;
          }

          // Only add finite values (skip NaN and Infinity)
          if (y !== null && Number.isFinite(y)) {
            xs.push(x);
            ys.push(y);
          }
        } catch {
          // Silently skip points that cause errors (e.g., log(-1))
        }
      }

      if (xs.length === 0) {
        toast.error('No valid data points to plot. Check your function.');
        return null;
      }

      return { x: xs, y: ys };
    } catch (e) {
      toast.error(`Plot generation failed: ${e.message}`);
      return null;
    }
  }, [angleMode]);

  // Generate complex number plot (vector representation)
  const generateComplexPlot = useCallback((expr) => {
    try {
      // Evaluate the expression
      const result = math.evaluate(expr, { i: math.complex(0, 1) });

      // Extract real and imaginary parts
      let real; let
        imag;
      if (typeof result === 'number') {
        real = result;
        imag = 0;
      } else if (result.re !== undefined && result.im !== undefined) {
        real = result.re;
        imag = result.im;
      } else {
        toast.error('Result is not a valid complex number');
        return null;
      }

      // Calculate magnitude and angle
      const magnitude = Math.sqrt(real * real + imag * imag);
      const angle = Math.atan2(imag, real) * (180 / Math.PI); // Convert to degrees for display

      return {
        real,
        imag,
        magnitude,
        angle,
        expr,
      };
    } catch (e) {
      toast.error(`Complex evaluation failed: ${e.message}`);
      return null;
    }
  }, []);

  const handlePlotFunction = useCallback((inputExpression = null) => {
    const expressionToPlot = inputExpression || calculatorInput;

    if (!expressionToPlot || expressionToPlot.trim() === '') {
      toast.warn('Please enter a function to plot');
      return;
    }

    // Basic syntax validation for plotting
    const validateForPlot = (expr) => {
      // Must contain x in function mode
      if (!expr.includes('x')) {
        toast.warn('Function must contain variable "x"');
        return false;
      }
      const openParens = (expr.match(/\(/g) || []).length;
      const closeParens = (expr.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        toast.error('Syntax Error: Mismatched parentheses');
        return false;
      }
      if (expr.includes('()')) {
        toast.error('Syntax Error: Empty parentheses');
        return false;
      }
      if (/[+\-*/%^]{2,}/.test(expr.replace(/\*\*/g, ''))) {
        toast.error('Syntax Error: Consecutive operators');
        return false;
      }
      return true;
    };

    setIsPlotting(true);

    try {
      if (plotMode === 'complex') {
        // Complex number mode - no need for 'x'
        const data = generateComplexPlot(expressionToPlot);
        if (data) {
          setPlotData({ mode: 'complex', ...data });
          toast.success(`Complex number plotted: ${data.real.toFixed(3)} + ${data.imag.toFixed(3)}i`);
        }
      } else {
        // Function mode - validate expression
        if (!validateForPlot(expressionToPlot)) {
          setIsPlotting(false);
          return;
        }

        const data = generatePlotData(expressionToPlot, xRange[0], xRange[1]);
        if (data) {
          setPlotData({ mode: 'function', func: expressionToPlot, ...data });
          toast.success('Plot generated successfully');
        }
      }
    } catch (e) {
      toast.error(`Failed to plot: ${e.message}`);
    } finally {
      setIsPlotting(false);
    }
  }, [calculatorInput, xRange, generatePlotData, generateComplexPlot, plotMode]);

  // Listen for plot trigger from parent
  React.useEffect(() => {
    if (onPlotTrigger && calculatorInput) {
      handlePlotFunction(calculatorInput);
    }
  }, [onPlotTrigger, calculatorInput, handlePlotFunction]);

  // Generate plot data based on current x-range for real functions

  // Handle zoom/pan events from Plotly (only for function mode)
  const handleRelayout = useCallback((event) => {
    if (plotData?.mode !== 'function') return;

    if (event['xaxis.range[0]'] !== undefined && event['xaxis.range[1]'] !== undefined) {
      const newXMin = event['xaxis.range[0]'];
      const newXMax = event['xaxis.range[1]'];

      // Check if range changed significantly
      const currentRange = xRange[1] - xRange[0];
      const newRange = newXMax - newXMin;
      const rangeChange = Math.abs(newRange - currentRange) / currentRange;

      // Regenerate data if zoomed out/in significantly or panned far
      if (rangeChange > 0.1 || newXMin < xRange[0] || newXMax > xRange[1]) {
        setXRange([newXMin, newXMax]);

        if (plotData && plotData.func) {
          const newData = generatePlotData(plotData.func, newXMin, newXMax);
          if (newData) {
            setPlotData({ mode: 'function', func: plotData.func, ...newData });
          }
        }
      }
    }
  }, [xRange, plotData, generatePlotData]);

  const onMouseMove = (e) => {
    if (resizing.current.type === 'width') {
      let newWidth = resizing.current.startWidth + (e.clientX - resizing.current.startX);
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setPlotWidth(newWidth);
    }
    if (resizing.current.type === 'height') {
      let newHeight = resizing.current.startHeight + (e.clientY - resizing.current.startY);
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
      setPlotHeight(newHeight);
    }
    if (resizing.current.type === 'corner') {
      let newWidth = resizing.current.startWidth + (e.clientX - resizing.current.startX);
      let newHeight = resizing.current.startHeight + (e.clientY - resizing.current.startY);
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
      setPlotWidth(newWidth);
      setPlotHeight(newHeight);
    }
  };

  const onMouseUp = () => {
    resizing.current.type = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const startResize = (type, e) => {
    resizing.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: plotWidth,
      startHeight: plotHeight,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const headerHeight = 36;

  return (
    <div
      className="flex flex-col bg-gray-800 rounded p-2 shadow-md relative"
      style={{
        width: `${plotWidth}px`,
        height: `${plotHeight}px`,
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
        minHeight: `${MIN_HEIGHT}px`,
        maxHeight: `${MAX_HEIGHT}px`,
        transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2" style={{ height: `${headerHeight}px` }}>
        <h2 className="text-white font-semibold text-sm">
          Plot Area
          {' '}
          {plotMode === 'complex' ? '(Complex Mode)' : '(Function Mode)'}
        </h2>
        <button
          onClick={() => setShowPlot(false)}
          className="text-white bg-gray-700 px-2 rounded hover:bg-gray-600"
        >
          X
        </button>
      </div>

      {/* Plot Container */}
      <div
        className="border-2 border-gray-600 rounded bg-white flex-1 flex items-center justify-center p-0"
        style={{
          minHeight: 0,
          minWidth: 0,
          margin: 0,
          height: `calc(100% - ${headerHeight}px)`,
        }}
      >
        {plotData ? (
          plotData.mode === 'complex' ? (
            // Complex number plot
            <Plot
              data={[
                // Vector arrow from origin to complex point
                {
                  x: [0, plotData.real],
                  y: [0, plotData.imag],
                  type: 'scatter',
                  mode: 'lines+markers',
                  line: { color: '#3b82f6', width: 3 },
                  marker: { size: 10, color: '#3b82f6' },
                  name: 'Complex Number',
                  hovertemplate: `${plotData.real.toFixed(3)} + ${plotData.imag.toFixed(3)}i<extra></extra>`,
                },
                // Projection lines (dashed)
                {
                  x: [plotData.real, plotData.real],
                  y: [0, plotData.imag],
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#9ca3af', width: 1, dash: 'dot' },
                  showlegend: false,
                  hoverinfo: 'skip',
                },
                {
                  x: [0, plotData.real],
                  y: [plotData.imag, plotData.imag],
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#9ca3af', width: 1, dash: 'dot' },
                  showlegend: false,
                  hoverinfo: 'skip',
                },
              ]}
              layout={{
                title: {
                  text: `z = ${plotData.real.toFixed(3)} + ${plotData.imag.toFixed(3)}i<br>`
                        + `r = ${plotData.magnitude.toFixed(3)}, θ = ${plotData.angle.toFixed(2)}°`,
                  font: { size: 14 },
                },
                autosize: true,
                paper_bgcolor: '#1f2937',
                plot_bgcolor: '#111827',
                font: { color: '#fff' },
                margin: {
                  l: 60, r: 30, t: 80, b: 50,
                },
                xaxis: {
                  title: 'Real',
                  gridcolor: '#374151',
                  zerolinecolor: '#4b5563',
                  zerolinewidth: 2,
                  color: '#9ca3af',
                  range: [
                    Math.min(-1, plotData.real - Math.abs(plotData.real) * 0.5),
                    Math.max(1, plotData.real + Math.abs(plotData.real) * 0.5),
                  ],
                },
                yaxis: {
                  title: 'Imaginary',
                  gridcolor: '#374151',
                  zerolinecolor: '#4b5563',
                  zerolinewidth: 2,
                  color: '#9ca3af',
                  scaleanchor: 'x',
                  scaleratio: 1,
                  range: [
                    Math.min(-1, plotData.imag - Math.abs(plotData.imag) * 0.5),
                    Math.max(1, plotData.imag + Math.abs(plotData.imag) * 0.5),
                  ],
                },
                annotations: [
                  // Label for the point
                  {
                    x: plotData.real,
                    y: plotData.imag,
                    text: `(${plotData.real.toFixed(2)}, ${plotData.imag.toFixed(2)})`,
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 2,
                    arrowcolor: '#3b82f6',
                    ax: 30,
                    ay: -30,
                    font: { color: '#fff', size: 12 },
                    bgcolor: '#374151',
                    borderpad: 4,
                  },
                ],
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
              }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            // Function plot
            <Plot
              data={[
                {
                  x: plotData.x,
                  y: plotData.y,
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#3b82f6', width: 2 },
                },
              ]}
              layout={{
                title: `y = ${plotData.func}`,
                autosize: true,
                paper_bgcolor: '#1f2937',
                plot_bgcolor: '#111827',
                font: { color: '#fff' },
                margin: {
                  l: 50, r: 20, t: 50, b: 50,
                },
                xaxis: {
                  title: 'x',
                  gridcolor: '#374151',
                  zerolinecolor: '#4b5563',
                  color: '#9ca3af',
                },
                yaxis: {
                  title: 'y',
                  gridcolor: '#374151',
                  zerolinecolor: '#4b5563',
                  color: '#9ca3af',
                },
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToAdd: ['pan2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
              }}
              onRelayout={handleRelayout}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          )
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-400 text-lg mb-2">
              {plotMode === 'complex' ? '🔢 Complex Mode' : '📈 Function Mode'}
            </p>
            <p className="text-gray-500 text-sm mb-1">
              {plotMode === 'complex'
                ? 'Enter a complex expression (e.g., 3+4i, 2*e^(i*π/4))'
                : 'Enter a function of x (e.g., sin(x), x^2, tan(x))'}
            </p>
            <p className="text-gray-600 text-xs">
              Type in calculator input and click &quot;📊 Plot Graph&quot;
            </p>
          </div>
        )}
      </div>

      {/* Resize Handles */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-gray-500 bg-opacity-40 hover:bg-opacity-70"
        style={{ zIndex: 20 }}
        onMouseDown={(e) => startResize('width', e)}
        role="button"
        tabIndex={0}
        aria-label="Resize width"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startResize('width', e); }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-gray-500 bg-opacity-40 hover:bg-opacity-70"
        style={{ zIndex: 20 }}
        onMouseDown={(e) => startResize('height', e)}
        role="button"
        tabIndex={0}
        aria-label="Resize height"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startResize('height', e); }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-gray-500 rounded"
        style={{ zIndex: 30 }}
        onMouseDown={(e) => startResize('corner', e)}
        role="button"
        tabIndex={0}
        aria-label="Resize corner"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startResize('corner', e); }}
      />
    </div>
  );
};

export default PlotArea;
