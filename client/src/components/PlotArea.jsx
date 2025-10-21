import React, { useRef } from 'react'
import Plot from "react-plotly.js";

const MIN_WIDTH = 400;
const MAX_WIDTH = 900;
const MIN_HEIGHT = 300;
const MAX_HEIGHT = 700;

const PlotArea = ({plotWidth, setPlotWidth, plotHeight, setPlotHeight, setShowPlot, plotConfig}) => {
  const resizing = useRef({ type: null });

  // Mouse move handler for resizing
  const onMouseMove = (e) => {
    if (resizing.current.type === "width") {
      let newWidth = resizing.current.startWidth + (e.clientX - resizing.current.startX);
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setPlotWidth(newWidth);
    }
    if (resizing.current.type === "height") {
      let newHeight = resizing.current.startHeight + (e.clientY - resizing.current.startY);
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));
      setPlotHeight(newHeight);
    }
    if (resizing.current.type === "corner") {
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
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const startResize = (type, e) => {
    resizing.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: plotWidth,
      startHeight: plotHeight
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Height of the header (adjust if you change header size)
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
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 10
      }}
    >
      <div className="flex justify-between items-center mb-1" style={{height: `${headerHeight}px`}}>
        <h2 className="text-white font-semibold text-sm">Plot Area</h2>
        <button onClick={() => setShowPlot(false)} className="text-white bg-gray-700 px-2 rounded hover:bg-gray-600">X</button>
      </div>

      <div
        className="border-2 border-gray-600 rounded bg-white flex-1 flex items-center justify-center p-0"
        style={{
          minHeight: 0,
          minWidth: 0,
          margin: 0,
          height: `calc(100% - ${headerHeight}px)`
        }}
      >
        {plotConfig ? (
          <Plot
            data={[{ x: plotConfig.x, y: plotConfig.y, type: 'scatter', mode: 'lines' }]}
            layout={{
              ...plotConfig.layout,
              autosize: true,
              paper_bgcolor: '#1f2937',
              plot_bgcolor: '#111827',
              font: { color: '#fff' },
              margin: { l: 40, r: 20, t: 40, b: 40 }
            }}
            config={{ responsive: true, displayModeBar: true }}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">Plot placeholder</div>
        )}
      </div>

      {/* Resize handles */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
        style={{ zIndex: 20 }}
        onMouseDown={e => startResize("width", e)}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize"
        style={{ zIndex: 20 }}
        onMouseDown={e => startResize("height", e)}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize bg-gray-500 rounded"
        style={{ zIndex: 30 }}
        onMouseDown={e => startResize("corner", e)}
      />
    </div>
  );
};

export default PlotArea;