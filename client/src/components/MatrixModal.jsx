import React, { useState } from "react";
import math from "../utils/mathSetup";

const MatrixModal = ({ show, onClose, onResult }) => {
  const [matrixA, setMatrixA] = useState([[1,0],[0,1]]);
  const [matrixB, setMatrixB] = useState([[1,2],[3,4]]);
  const [operation, setOperation] = useState("multiply");

  if (!show) return null;

  const matrixToString = (m) => JSON.stringify(m);

  const handleOperation = () => {
    try {
      let expr = "", result = "";
      if (operation === "multiply") {
        const res = math.multiply(math.matrix(matrixA), math.matrix(matrixB));
        result = math.format(res, { precision: 14 });
        expr = `MatMul ${matrixToString(matrixA)} * ${matrixToString(matrixB)}`;
      } else if (operation === "transposeA") {
        const res = math.transpose(math.matrix(matrixA));
        result = math.format(res, { precision: 14 });
        expr = `Transpose A: ${matrixToString(matrixA)}`;
      } else if (operation === "transposeB") {
        const res = math.transpose(math.matrix(matrixB));
        result = math.format(res, { precision: 14 });
        expr = `Transpose B: ${matrixToString(matrixB)}`;
      } else if (operation === "detA") {
        const res = math.det(math.matrix(matrixA));
        result = math.format(res, { precision: 14 });
        expr = `Determinant A: ${matrixToString(matrixA)}`;
      } else if (operation === "detB") {
        const res = math.det(math.matrix(matrixB));
        result = math.format(res, { precision: 14 });
        expr = `Determinant B: ${matrixToString(matrixB)}`;
      }
      onResult(expr, result);
      onClose();
    } catch (e) {
      alert("Matrix operation failed: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-yellow-400 font-bold text-xl px-2 hover:text-yellow-300"
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-white mb-2">Matrix Operations</h3>
        <div className="mb-2">
          <label className="text-white mr-2">Operation:</label>
          <select
            value={operation}
            onChange={e => setOperation(e.target.value)}
            className="bg-gray-700 text-white p-1 rounded"
          >
            <option value="multiply">Multiply (A × B)</option>
            <option value="transposeA">Transpose A</option>
            <option value="transposeB">Transpose B</option>
            <option value="detA">Determinant of A</option>
            <option value="detB">Determinant of B</option>
          </select>
        </div>
        <div className="text-white text-sm mb-2">Edit matrices as JSON arrays (e.g. [[1,2],[3,4]])</div>
        <textarea className="w-full h-20 p-2 bg-gray-700 text-white rounded" value={JSON.stringify(matrixA)} onChange={(e)=> {
          try{ setMatrixA(JSON.parse(e.target.value)); } catch {}
        }} />
        <textarea className="w-full h-20 p-2 bg-gray-700 text-white rounded mt-2" value={JSON.stringify(matrixB)} onChange={(e)=> {
          try{ setMatrixB(JSON.parse(e.target.value)); } catch {}
        }} />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleOperation}
            className="bg-green-600 p-2 rounded text-white flex-1"
          >
            Compute
          </button>
          <button onClick={onClose} className="bg-red-600 p-2 rounded text-white flex-1">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default MatrixModal;