import React, { useState, useEffect } from "react";
import math from "../utils/mathSetup";

const MatrixModal = ({ show, onClose, onResult, initialInput = "" }) => {
  const [operation, setOperation] = useState("multiply");

  // Keep editable text versions for both matrices
  const [matrixAText, setMatrixAText] = useState("[[1,0],[0,1]]");
  const [matrixBText, setMatrixBText] = useState("[[1,2],[3,4]]");

  // Updated: Parse initialInput when modal opens, overriding defaults on success
  useEffect(() => {
    if (!show) return;

    // Start with defaults
    setMatrixAText("[[1,0],[0,1]]");
    setMatrixBText("[[1,2],[3,4]]");

    if (!initialInput) return;

    // Try as single matrix for A
    try {
      const parsedA = JSON.parse(initialInput);
      if (Array.isArray(parsedA) && Array.isArray(parsedA[0])) {
        math.matrix(parsedA); // Validate as matrix
        setMatrixAText(initialInput);
        return; // Success
      }
    } catch {}

    // Try as "A * B" expression
    const parts = initialInput.split('*').map(p => p.trim());
    if (parts.length === 2) {
      try {
        const parsedA = JSON.parse(parts[0]);
        const parsedB = JSON.parse(parts[1]);
        if (Array.isArray(parsedA) && Array.isArray(parsedA[0]) &&
            Array.isArray(parsedB) && Array.isArray(parsedB[0])) {
          math.matrix(parsedA); // Validate
          math.matrix(parsedB); // Validate
          setMatrixAText(JSON.stringify(parsedA)); // Clean JSON format
          setMatrixBText(JSON.stringify(parsedB));
          return; // Success
        }
      } catch {}
    }

    // Failed parse
    alert(`Could not parse "${initialInput}" as matrix(es). Using defaults. Expected: [[1,2],[3,4]] or "[[1,2],[3,4]] * [[5,6],[7,8]]"`);
  }, [show, initialInput]);

  if (!show) return null;

  const handleOperation = () => {
    try {
      let parsedA, parsedB;
      let expr = "";
      let result = "";

      // Conditionally parse based on operation
      if (operation === "multiply" || operation === "transposeA" || operation === "detA") {
        if (!matrixAText.trim()) {
          throw new Error("Matrix A is required for this operation.");
        }
        parsedA = JSON.parse(matrixAText);
      }
      if (operation === "multiply" || operation === "transposeB" || operation === "detB") {
        if (!matrixBText.trim()) {
          throw new Error("Matrix B is required for this operation.");
        }
        parsedB = JSON.parse(matrixBText);
      }

      if (operation === "multiply") {
        const res = math.multiply(math.matrix(parsedA), math.matrix(parsedB));
        result = math.format(res, { precision: 14 });
        expr = `MatMul ${JSON.stringify(parsedA)} * ${JSON.stringify(parsedB)}`;
      } else if (operation === "transposeA") {
        const res = math.transpose(math.matrix(parsedA));
        result = math.format(res, { precision: 14 });
        expr = `Transpose A: ${JSON.stringify(parsedA)}`;
      } else if (operation === "transposeB") {
        const res = math.transpose(math.matrix(parsedB));
        result = math.format(res, { precision: 14 });
        expr = `Transpose B: ${JSON.stringify(parsedB)}`;
      } else if (operation === "detA") {
        const res = math.det(math.matrix(parsedA));
        result = math.format(res, { precision: 14 });
        expr = `Determinant A: ${JSON.stringify(parsedA)}`;
      } else if (operation === "detB") {
        const res = math.det(math.matrix(parsedB));
        result = math.format(res, { precision: 14 });
        expr = `Determinant B: ${JSON.stringify(parsedB)}`;
      }

      result = Array.isArray(result) ? JSON.stringify(result) : String(result);
      onResult(expr, result);
      onClose();
    } catch (e) {
      alert("Invalid matrix JSON or operation: " + e.message);
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

        <h3 className="text-white mb-3 text-lg font-semibold">Matrix Operations</h3>

        <div className="mb-2">
          <label className="text-white mr-2">Operation:</label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="bg-gray-700 text-white p-1 rounded"
          >
            <option value="multiply">Multiply (A × B)</option>
            <option value="transposeA">Transpose A</option>
            <option value="transposeB">Transpose B</option>
            <option value="detA">Determinant of A</option>
            <option value="detB">Determinant of B</option>
          </select>
        </div>

        <p className="text-white text-sm mb-1">Matrix A:</p>
        <textarea
          className="w-full h-20 p-2 bg-gray-700 text-white rounded"
          value={matrixAText}
          onChange={(e) => {
            console.log('Matrix A updated:', e.target.value); // Debug: Check F12 Console on type
            setMatrixAText(e.target.value);
          }}
          placeholder="e.g. [[1,2],[3,4]]"
        />

        <p className="text-white text-sm mt-2 mb-1">Matrix B:</p>
        <textarea
          className="w-full h-20 p-2 bg-gray-700 text-white rounded"
          value={matrixBText}
          onChange={(e) => {
            console.log('Matrix B updated:', e.target.value); // Debug: Check F12 Console on type
            setMatrixBText(e.target.value);
          }}
          placeholder="e.g. [[5,6],[7,8]] (optional for non-multiply ops)"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleOperation}
            className="bg-green-600 hover:bg-green-500 p-2 rounded text-white flex-1"
          >
            Compute
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded text-white flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrixModal;