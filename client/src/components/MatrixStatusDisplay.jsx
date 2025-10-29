import React from 'react';

function MatrixStatusDisplay({ matrixMode, firstMatrix, matrixOperation }) {
  if (!matrixMode || !firstMatrix) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-xl p-3 rounded-2xl border border-blue-500/30 shadow-lg">
      <div className="text-cyan-300 text-xs font-medium mb-1">First Matrix:</div>
      <div className="text-yellow-300 text-sm font-mono break-all">{firstMatrix.input}</div>
      {matrixOperation && (
        <div className="text-cyan-300 text-xs mt-2">
          Operation: <span className="text-green-400 font-semibold">{matrixOperation}</span>
        </div>
      )}
    </div>
  );
}

export default MatrixStatusDisplay;