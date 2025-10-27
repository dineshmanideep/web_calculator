import React from 'react';

/**
 * MatrixStatusDisplay Component
 * Shows the current matrix operation status when in matrix mode
 * Displays first matrix and pending operation
 */
function MatrixStatusDisplay({ matrixMode, firstMatrix, matrixOperation }) {
  // Only show if in matrix mode and has a first matrix
  if (!matrixMode || !firstMatrix) {
    return null;
  }

  return (
    <div className="bg-blue-900 p-2 rounded">
      <div className="text-white text-xs mb-1">First Matrix:</div>
      <div className="text-yellow-300 text-sm font-mono">{firstMatrix.input}</div>
      {matrixOperation && (
        <div className="text-white text-xs mt-1">
          Operation:
          {' '}
          <span className="text-green-400">{matrixOperation}</span>
        </div>
      )}
    </div>
  );
}

export default MatrixStatusDisplay;
