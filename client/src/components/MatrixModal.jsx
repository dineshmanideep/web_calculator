import React, { useState, useEffect } from "react";
import math from "../utils/index.js";
import { toast } from 'react-toastify';

const MatrixModal = ({ show, onClose, onResult, initialInput = "", operation: propOperation }) => {
  const [operation, setOperation] = useState(propOperation || "multiply");
  const [step, setStep] = useState(0); // 0: operation select, 1+: matrix input steps
  const [matrices, setMatrices] = useState([]); // store collected matrices
  const [currentMatrixText, setCurrentMatrixText] = useState("");
  const [matrixNames, setMatrixNames] = useState([]); // names like 'A', 'B', 'C'...

  useEffect(() => {
    if (propOperation) {
      setOperation(propOperation);
    }
  }, [propOperation]);

  useEffect(() => {
    if (!show) {
      // Reset state when modal closes
      setStep(0);
      setMatrices([]);
      setCurrentMatrixText("");
      setMatrixNames([]);
      return;
    }

    // When modal opens, try to parse initialInput
    if (initialInput) {
      try {
        const parsedA = JSON.parse(initialInput);
        if (Array.isArray(parsedA) && Array.isArray(parsedA[0])) {
          math.matrix(parsedA);
          setCurrentMatrixText(initialInput);
          toast.success('Matrix loaded from input');
        }
      } catch {}
    }
  }, [show, initialInput]);

  if (!show) return null;

  const needsMultipleMatrices = ['multiply', 'add', 'subtract'].includes(operation);

  const validateMatrix = (text, name) => {
    if (!text || text.trim() === '') {
      throw new Error(`${name} cannot be empty`);
    }
    
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error(`${name} must be an array`);
      }
      if (parsed.length === 0) {
        throw new Error(`${name} cannot be empty`);
      }
      if (!Array.isArray(parsed[0])) {
        throw new Error(`${name} must be a 2D array`);
      }
      
      const cols = parsed[0].length;
      for (let i = 1; i < parsed.length; i++) {
        if (!Array.isArray(parsed[i]) || parsed[i].length !== cols) {
          throw new Error(`${name} rows must have equal length`);
        }
      }
      
      for (let row of parsed) {
        for (let val of row) {
          if (typeof val !== 'number' || !isFinite(val)) {
            throw new Error(`${name} must contain only valid numbers`);
          }
        }
      }
      
      return parsed;
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`${name} has invalid JSON syntax`);
      }
      throw e;
    }
  };

  const handleAddMatrix = () => {
    try {
      const matrixName = String.fromCharCode(65 + matrices.length);
      const parsed = validateMatrix(currentMatrixText, `Matrix ${matrixName}`);
      
      setMatrices([...matrices, parsed]);
      setMatrixNames([...matrixNames, matrixName]);
      setCurrentMatrixText("");
      
      toast.success(`Matrix ${matrixName} added successfully`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleCompute = () => {
    try {
      if (matrices.length < 2 && needsMultipleMatrices) {
        toast.error('Need at least 2 matrices for this operation');
        return;
      }

      if (matrices.length < 1) {
        toast.error('Need at least 1 matrix for this operation');
        return;
      }

      let result = "";
      let expr = "";

      if (operation === "multiply") {
        // Multiply all matrices sequentially
        let resultMatrix = math.matrix(matrices[0]);
        expr = `MatMul ${JSON.stringify(matrices[0])}`;
        
        for (let i = 1; i < matrices.length; i++) {
          const nextMatrix = math.matrix(matrices[i]);
          const prevShape = resultMatrix.size();
          const nextShape = nextMatrix.size();
          
          if (prevShape[1] !== nextShape[0]) {
            toast.error(`Cannot multiply: Matrix ${matrixNames[i-1]} columns (${prevShape[1]}) must equal Matrix ${matrixNames[i]} rows (${nextShape[0]})`);
            return;
          }
          
          resultMatrix = math.multiply(resultMatrix, nextMatrix);
          expr += ` × ${JSON.stringify(matrices[i])}`;
        }
        
        result = JSON.stringify(resultMatrix.toArray());
        toast.success(`Multiplication completed: ${matrices.length} matrices`);
      } 
      else if (operation === "add") {
        // Add all matrices
        let resultMatrix = math.matrix(matrices[0]);
        const firstShape = resultMatrix.size();
        expr = `Add ${JSON.stringify(matrices[0])}`;
        
        for (let i = 1; i < matrices.length; i++) {
          const nextMatrix = math.matrix(matrices[i]);
          const nextShape = nextMatrix.size();
          
          if (firstShape[0] !== nextShape[0] || firstShape[1] !== nextShape[1]) {
            toast.error(`Matrices must have same dimensions. Matrix A: ${firstShape[0]}×${firstShape[1]}, Matrix ${matrixNames[i]}: ${nextShape[0]}×${nextShape[1]}`);
            return;
          }
          
          resultMatrix = math.add(resultMatrix, nextMatrix);
          expr += ` + ${JSON.stringify(matrices[i])}`;
        }
        
        result = JSON.stringify(resultMatrix.toArray());
        toast.success(`Addition completed: ${matrices.length} matrices`);
      }
      else if (operation === "subtract") {
        // Subtract all matrices sequentially
        let resultMatrix = math.matrix(matrices[0]);
        const firstShape = resultMatrix.size();
        expr = `Subtract ${JSON.stringify(matrices[0])}`;
        
        for (let i = 1; i < matrices.length; i++) {
          const nextMatrix = math.matrix(matrices[i]);
          const nextShape = nextMatrix.size();
          
          if (firstShape[0] !== nextShape[0] || firstShape[1] !== nextShape[1]) {
            toast.error(`Matrices must have same dimensions. Matrix A: ${firstShape[0]}×${firstShape[1]}, Matrix ${matrixNames[i]}: ${nextShape[0]}×${nextShape[1]}`);
            return;
          }
          
          resultMatrix = math.subtract(resultMatrix, nextMatrix);
          expr += ` - ${JSON.stringify(matrices[i])}`;
        }
        
        result = JSON.stringify(resultMatrix.toArray());
        toast.success(`Subtraction completed: ${matrices.length} matrices`);
      }
      else if (operation === "transpose") {
        const mat = matrices[0];
        const res = math.transpose(math.matrix(mat));
        result = JSON.stringify(res.toArray());
        expr = `Transpose: ${JSON.stringify(mat)}`;
        toast.success('Matrix transposed');
      } 
      else if (operation === "det") {
        const mat = matrices[0];
        if (mat.length !== mat[0].length) {
          toast.error(`Determinant requires square matrix. Matrix is ${mat.length}×${mat[0].length}`);
          return;
        }
        const res = math.det(math.matrix(mat));
        result = String(math.format(res, { notation: 'fixed', precision: 6 }));
        expr = `Determinant: ${JSON.stringify(mat)}`;
        toast.success('Determinant calculated');
      }
      else if (operation === "inverse") {
        const mat = matrices[0];
        if (mat.length !== mat[0].length) {
          toast.error(`Inverse requires square matrix. Matrix is ${mat.length}×${mat[0].length}`);
          return;
        }
        const det = math.det(math.matrix(mat));
        if (Math.abs(det) < 1e-10) {
          toast.error('Matrix is singular (determinant ≈ 0), cannot invert');
          return;
        }
        const res = math.inv(math.matrix(mat));
        result = JSON.stringify(res.toArray());
        expr = `Inverse: ${JSON.stringify(mat)}`;
        toast.success('Matrix inverse calculated');
      }

      onResult(expr, result);
      onClose();
      
      // Reset for next use
      setStep(0);
      setMatrices([]);
      setMatrixNames([]);
      setCurrentMatrixText("");
    } catch (e) {
      toast.error("Matrix operation failed: " + e.message);
      console.error('Matrix operation error:', e);
    }
  };

  const handleBack = () => {
    if (matrices.length > 0) {
      // Remove last matrix
      const lastMatrix = matrices[matrices.length - 1];
      setMatrices(matrices.slice(0, -1));
      setMatrixNames(matrixNames.slice(0, -1));
      toast.info(`Matrix ${matrixNames[matrixNames.length - 1]} removed`);
    } else if (step > 0) {
      // Go back to operation selection
      setStep(0);
      setCurrentMatrixText("");
      toast.info('Back to operation selection');
    }
  };

  const getCurrentMatrixName = () => {
    return String.fromCharCode(65 + matrices.length);
  };

  const handleButtonClick = (value) => {
    setCurrentMatrixText(prev => prev + value);
  };

  const handleClear = () => {
    setCurrentMatrixText("");
    toast.info('Input cleared');
  };

  const handleBackspace = () => {
    setCurrentMatrixText(prev => prev.slice(0, -1));
  };

  const canProceed = () => {
    return currentMatrixText.trim() !== '';
  };

  const numberButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-'];
  const specialButtons = ['[', ']', ','];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded w-[700px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-yellow-400 font-bold text-xl px-2 hover:text-yellow-300"
          aria-label="Close"
        >
          ×
        </button>

        <h3 className="text-white mb-3 text-lg font-semibold">Matrix Operations</h3>

        {step === 0 && (
          <>
            <div className="mb-4">
              <label className="text-white mr-2 block mb-1">Select Operation:</label>
              <select
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  toast.info(`Operation: ${e.target.value}`);
                }}
                className="w-full bg-gray-700 text-white p-2 rounded"
              >
                <option value="multiply">Multiply (A × B × C...)</option>
                <option value="add">Add (A + B + C...)</option>
                <option value="subtract">Subtract (A - B - C...)</option>
                <option value="transpose">Transpose</option>
                <option value="det">Determinant</option>
                <option value="inverse">Inverse</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep(1);
                  toast.info(`Enter Matrix ${getCurrentMatrixName()}`);
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 p-2 rounded text-white font-semibold"
              >
                Start
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-red-600 hover:bg-red-500 p-2 rounded text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {step > 0 && (
          <>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-semibold">
                  Matrix {getCurrentMatrixName()}:
                </p>
                <span className="text-gray-400 text-xs">
                  {matrices.length} matrices added
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-2">Format: [[1,2],[3,4]]</p>
              
              {/* Layout: Keypad on left, Input on right */}
              <div className="flex gap-3">
                {/* Button pad - LEFT SIDE */}
                <div className="flex-shrink-0">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {numberButtons.map(btn => (
                      <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className="p-3 bg-purple-700 hover:bg-purple-600 rounded text-white font-semibold w-16 h-12"
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {specialButtons.map(btn => (
                      <button
                        key={btn}
                        onClick={() => handleButtonClick(btn)}
                        className="p-3 bg-blue-700 hover:bg-blue-600 rounded text-white font-semibold w-16 h-12"
                      >
                        {btn}
                      </button>
                    ))}
                    <button
                      onClick={handleBackspace}
                      className="p-3 bg-orange-700 hover:bg-orange-600 rounded text-white font-semibold w-16 h-12"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleClear}
                      className="p-3 bg-red-700 hover:bg-red-600 rounded text-white font-semibold col-span-2 h-12"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Display input - RIGHT SIDE */}
                <div className="flex-1 min-h-[280px] p-3 bg-gray-700 text-white rounded font-mono text-base break-all overflow-auto">
                  {currentMatrixText || <span className="text-gray-500">Enter matrix using keypad...</span>}
                </div>
              </div>
            </div>

            {/* Show previously entered matrices */}
            {matrices.length > 0 && (
              <div className="mb-3 p-2 bg-gray-700 rounded max-h-32 overflow-y-auto">
                <p className="text-white text-xs font-semibold mb-1">Previously entered matrices:</p>
                {matrices.map((mat, idx) => (
                  <div key={idx} className="text-gray-300 text-xs font-mono mb-1">
                    <span className="text-green-400">Matrix {matrixNames[idx]}:</span> {JSON.stringify(mat)}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white font-semibold px-4"
              >
                Back
              </button>
              
              <button
                onClick={handleAddMatrix}
                disabled={!canProceed()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 p-2 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Matrix {getCurrentMatrixName()}
              </button>
              
              <button
                onClick={handleCompute}
                disabled={matrices.length < 1}
                className="flex-1 bg-green-600 hover:bg-green-500 p-2 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Compute
              </button>
              
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-500 p-2 rounded text-white font-semibold px-4"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatrixModal;