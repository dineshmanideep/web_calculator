import React, { useRef } from 'react';
import Plot from "react-plotly.js";

const MIN_WIDTH = 400; // Minimum allowed width for the plot area
const MAX_WIDTH = 900; // Maximum allowed width for the plot area
const MIN_HEIGHT = 300; // Minimum allowed height for the plot area
const MAX_HEIGHT = 700; // Maximum allowed height for the plot area

const PlotArea = ({plotWidth, setPlotWidth, plotHeight, setPlotHeight, setShowPlot, plotConfig}) => {
  // Ref to track resizing state including type and starting positions
  const resizing = useRef({ type: null });

  // Mouse move handler for resizing
  const onMouseMove = (e) => {
    // Handle width resize by calculating new width based on mouse delta
    if (resizing.current.type === "width") {
      let newWidth = resizing.current.startWidth + (e.clientX - resizing.current.startX);
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)); // Constrain width within limits
      setPlotWidth(newWidth);
    }
    // Handle height resize by calculating new height based on mouse delta
    if (resizing.current.type === "height") {
      let newHeight = resizing.current.startHeight + (e.clientY - resizing.current.startY);
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight)); // Constrain height within limits
      setPlotHeight(newHeight);
    }
    // Handle corner resize by updating both width and height
    if (resizing.current.type === "corner") {
      let newWidth = resizing.current.startWidth + (e.clientX - resizing.current.startX);
      let newHeight = resizing.current.startHeight + (e.clientY - resizing.current.startY);
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth)); // Constrain new width
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight)); // Constrain new height
      setPlotWidth(newWidth);
      setPlotHeight(newHeight);
    }
  };

  // Cleanup handler for when mouse is released
  const onMouseUp = () => {
    resizing.current.type = null; // Reset resizing type
    window.removeEventListener("mousemove", onMouseMove); // Remove mouse move listener
    window.removeEventListener("mouseup", onMouseUp); // Remove mouse up listener
  };

  // Start a resize operation for the given type
  const startResize = (type, e) => {
    // Capture initial state for resize calculation
    resizing.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: plotWidth,
      startHeight: plotHeight
    };
    // Add global event listeners for dragging
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Height of the header (adjust if you change header size)
  const headerHeight = 36;

  return (
    // Main container for the resizable plot area
    <div
      className="flex flex-col bg-gray-800 rounded p-2 shadow-md relative"
      style={{
        width: `${plotWidth}px`, // Set current width
        height: `${plotHeight}px`, // Set current height
        minWidth: `${MIN_WIDTH}px`, // Enforce minimum width
        maxWidth: `${MAX_WIDTH}px`, // Enforce maximum width
        minHeight: `${MIN_HEIGHT}px`, // Enforce minimum height
        maxHeight: `${MAX_HEIGHT}px`, // Enforce maximum height
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)", // Smooth resize animation
        zIndex: 10 // Ensure it's above other elements
      }}
    >
      {/* Header with title and close button */}
      <div className="flex justify-between items-center mb-1" style={{height: `${headerHeight}px`}}>
        <h2 className="text-white font-semibold text-sm">Plot Area</h2>
        {/* Close button to hide the plot */}
        <button onClick={() => setShowPlot(false)} className="text-white bg-gray-700 px-2 rounded hover:bg-gray-600">X</button>
      </div>

      {/* Container for the plot or placeholder */}
      <div
        className="border-2 border-gray-600 rounded bg-white flex-1 flex items-center justify-center p-0"
        style={{
          minHeight: 0, // Allow flex shrinking
          minWidth: 0, // Allow flex shrinking
          margin: 0, // No margins
          height: `calc(100% - ${headerHeight}px)` // Fill remaining space after header
        }}
      >
        {/* Conditionally render plot or placeholder */}
        {plotConfig ? (
          // Plotly component for rendering the chart
          <Plot
            // Data trace for scatter line plot
            data={[{ x: plotConfig.x, y: plotConfig.y, type: 'scatter', mode: 'lines' }]}
            // Layout configuration with custom styling
            layout={{
              ...plotConfig.layout, // Spread existing layout
              autosize: true, // Enable autosizing
              paper_bgcolor: '#1f2937', // Background color
              plot_bgcolor: '#111827', // Plot area color
              font: { color: '#fff' }, // Text color
              margin: { l: 40, r: 20, t: 40, b: 40 } // Margins
            }}
            // Plot config for responsiveness
            config={{ responsive: true, displayModeBar: true }}
            // Enable resize handler
            useResizeHandler
            // Full size styling
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          // Placeholder when no config is provided
          <div className="h-full w-full flex items-center justify-center text-gray-400">Plot placeholder</div>
        )}
      </div>

      {/* Resize handles */}
      {/* Right edge handle for width resize */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
        style={{ zIndex: 20 }}
        onMouseDown={e => startResize("width", e)}
      />
      {/* Bottom edge handle for height resize */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
        style={{ zIndex: 20 }}
        onMouseDown={e => startResize("height", e)}
      />
      {/* Corner handle for both width and height resize */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-gray-500 rounded"
        style={{ zIndex: 30 }}
        onMouseDown={e => startResize("corner", e)}
      />
    </div>
  );
};

export default PlotArea;