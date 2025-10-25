import React, { useState, useEffect } from "react";
import math from "../utils/index.js";
import { toast } from 'react-toastify';

const MatrixModal = ({ show, onClose, onResult, initialInput = "", operation: propOperation }) => {
  const [operation, setOperation] = useState(propOperation || "multiply");
  const [matrixAText, setMatrixAText] = useState("[[1,0],[0,1]]");
  const [matrixBText, setMatrixBText] = useState("[[1,2],[3,4]]");

  useEffect(() => {
    if (propOperation) {
      setOperation(propOperation);
    }
  }, [propOperation]);

  useEffect(() => {
    if (!show) return;

    setMatrixAText("[[1,0],[0,1]]");
    setMatrixBText("[[1,2],[3,4]]");

    if (!initialInput) return;

    try {
      const parsedA = JSON.parse(initialInput);
      if (Array.isArray(parsedA) && Array.isArray(parsedA[0])) {
        math.matrix(parsedA);
        setMatrixAText(initialInput);
        toast.success('Matrix A loaded from input');
        return;
      }
    } catch {}

    const parts = initialInput.split('*').map(p => p.trim());
    if (parts.length === 2) {
      try {
        const parsedA = JSON.parse(parts[0]);
        const parsedB = JSON.parse(parts[1]);
        if (Array.isArray(parsedA) && Array.isArray(parsedA[0]) &&
            Array.isArray(parsedB) && Array.isArray(parsedB[0])) {
          math.matrix(parsedA);
          math.matrix(parsedB);
          setMatrixAText(JSON.stringify(parsedA));
          setMatrixBText(JSON.stringify(parsedB));
          toast.success('Matrices loaded from input');
          return;
        }
      } catch {}
    }

    toast.warn(`Could not parse "${initialInput}" as matrix(es). Using defaults.`);
  }, [show, initialInput]);

  if (!show) return null;

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

  const handleOperation = () => {
    try {
      let parsedA, parsedB;
      let expr = "";
      let result = "";

      if (['multiply', 'add', 'subtract', 'transposeA', 'detA', 'inverseA'].includes(operation)) {
        parsedA = validateMatrix(matrixAText, "Matrix A");
      }
      if (['multiply', 'add', 'subtract', 'transposeB', 'detB', 'inverseB'].includes(operation)) {
        parsedB = validateMatrix(matrixBText, "Matrix B");
      }

      if (operation === "multiply") {
        const aRows = parsedA.length;
        const aCols = parsedA[0].length;
        const bRows = parsedB.length;
        const bCols = parsedB[0].length;
        
        if (aCols !== bRows) {
          toast.error(`Cannot multiply: Matrix A columns (${aCols}) must equal Matrix B rows (${bRows})`);
          return;
        }
        
        const res = math.multiply(math.matrix(parsedA), math.matrix(parsedB));
        result = JSON.stringify(res.toArray());
        expr = `MatMul ${JSON.stringify(parsedA)} * ${JSON.stringify(parsedB)}`;
        toast.success(`Multiplication: ${aRows}×${aCols} × ${bRows}×${bCols} = ${aRows}×${bCols}`);
      } 
      else if (operation === "add") {
        if (parsedA.length !== parsedB.length || parsedA[0].length !== parsedB[0].length) {
          toast.error('Matrices must have same dimensions for addition');
          return;
        }
        const res = math.add(math.matrix(parsedA), math.matrix(parsedB));
        result = JSON.stringify(res.toArray());
        expr = `Add ${JSON.stringify(parsedA)} + ${JSON.stringify(parsedB)}`;
        toast.success('Matrix addition successful');
      }
      else if (operation === "subtract") {
        if (parsedA.length !== parsedB.length || parsedA[0].length !== parsedB[0].length) {
          toast.error('Matrices must have same dimensions for subtraction');
          return;
        }
        const res = math.subtract(math.matrix(parsedA), math.matrix(parsedB));
        result = JSON.stringify(res.toArray());
        expr = `Subtract ${JSON.stringify(parsedA)} - ${JSON.stringify(parsedB)}`;
        toast.success('Matrix subtraction successful');
      }
      else if (operation === "transposeA") {
        const res = math.transpose(math.matrix(parsedA));
        result = JSON.stringify(res.toArray());
        expr = `Transpose A: ${JSON.stringify(parsedA)}`;
        toast.success('Matrix A transposed');
      } 
      else if (operation === "transposeB") {
        const res = math.transpose(math.matrix(parsedB));
        result = JSON.stringify(res.toArray());
        expr = `Transpose B: ${JSON.stringify(parsedB)}`;
        toast.success('Matrix B transposed');
      } 
      else if (operation === "detA") {
        if (parsedA.length !== parsedA[0].length) {
          toast.error(`Determinant requires square matrix. Matrix A is ${parsedA.length}×${parsedA[0].length}`);
          return;
        }
        const res = math.det(math.matrix(parsedA));
        result = String(math.format(res, { notation: 'fixed', precision: 6 }));
        expr = `Determinant A: ${JSON.stringify(parsedA)}`;
        toast.success('Determinant calculated');
      } 
      else if (operation === "detB") {
        if (parsedB.length !== parsedB[0].length) {
          toast.error(`Determinant requires square matrix. Matrix B is ${parsedB.length}×${parsedB[0].length}`);
          return;
        }
        const res = math.det(math.matrix(parsedB));
        result = String(math.format(res, { notation: 'fixed', precision: 6 }));
        expr = `Determinant B: ${JSON.stringify(parsedB)}`;
        toast.success('Determinant calculated');
      }
      else if (operation === "inverseA") {
        if (parsedA.length !== parsedA[0].length) {
          toast.error(`Inverse requires square matrix. Matrix A is ${parsedA.length}×${parsedA[0].length}`);
          return;
        }
        const det = math.det(math.matrix(parsedA));
        if (Math.abs(det) < 1e-10) {
          toast.error('Matrix is singular (determinant ≈ 0), cannot invert');
          return;
        }
        const res = math.inv(math.matrix(parsedA));
        result = JSON.stringify(res.toArray());
        expr = `Inverse A: ${JSON.stringify(parsedA)}`;
        toast.success('Matrix inverse calculated');
      }
      else if (operation === "inverseB") {
        if (parsedB.length !== parsedB[0].length) {
          toast.error(`Inverse requires square matrix. Matrix B is ${parsedB.length}×${parsedB[0].length}`);
          return;
        }
        const det = math.det(math.matrix(parsedB));
        if (Math.abs(det) < 1e-10) {
          toast.error('Matrix is singular (determinant ≈ 0), cannot invert');
          return;
        }
        const res = math.inv(math.matrix(parsedB));
        result = JSON.stringify(res.toArray());
        expr = `Inverse B: ${JSON.stringify(parsedB)}`;
        toast.success('Matrix inverse calculated');
      }
      else if (operation === "eigenA") {
        if (parsedA.length !== parsedA[0].length) {
          toast.error(`Eigenvalues require square matrix. Matrix A is ${parsedA.length}×${parsedA[0].length}`);
          return;
        }
        const res = math.eigs(math.matrix(parsedA));
        result = JSON.stringify({ 
          values: res.values.map(v => math.format(v, { notation: 'fixed', precision: 6 })),
          vectors: res.vectors.map(vec => vec.map(v => math.format(v, { notation: 'fixed', precision: 6 })))
        });
        expr = `Eigenvalues A: ${JSON.stringify(parsedA)}`;
        toast.success('Eigenvalues calculated');
      }
      else if (operation === "eigenB") {
        if (parsedB.length !== parsedB[0].length) {
          toast.error(`Eigenvalues require square matrix. Matrix B is ${parsedB.length}×${parsedB[0].length}`);
          return;
        }
        const res = math.eigs(math.matrix(parsedB));
        result = JSON.stringify({ 
          values: res.values.map(v => math.format(v, { notation: 'fixed', precision: 6 })),
          vectors: res.vectors.map(vec => vec.map(v => math.format(v, { notation: 'fixed', precision: 6 })))
        });
        expr = `Eigenvalues B: ${JSON.stringify(parsedB)}`;
        toast.success('Eigenvalues calculated');
      }
      else if (operation === "rankA") {
        const res = math.rank(math.matrix(parsedA));
        result = String(res);
        expr = `Rank A: ${JSON.stringify(parsedA)}`;
        toast.success('Rank calculated');
      }
      else if (operation === "rankB") {
        const res = math.rank(math.matrix(parsedB));
        result = String(res);
        expr = `Rank B: ${JSON.stringify(parsedB)}`;
        toast.success('Rank calculated');
      }

      onResult(expr, result);
      onClose();
    } catch (e) {
      toast.error("Matrix operation failed: " + e.message);
      console.error('Matrix operation error:', e);
    }
  };

  const needsBothMatrices = ['multiply', 'add', 'subtract'].includes(operation);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 rounded w-[500px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-yellow-400 font-bold text-xl px-2 hover:text-yellow-300"
          aria-label="Close"
        >
          ×
        </button>

        <h3 className="text-white mb-3 text-lg font-semibold">Matrix Operations</h3>

        <div className="mb-3">
          <label className="text-white mr-2 block mb-1">Operation:</label>
          <select
            value={operation}
            onChange={(e) => {
              setOperation(e.target.value);
              toast.info(`Operation: ${e.target.value}`);
            }}
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="multiply">Multiply (A × B)</option>
            <option value="add">Add (A + B)</option>
            <option value="subtract">Subtract (A - B)</option>
            <option value="transposeA">Transpose A</option>
            <option value="transposeB">Transpose B</option>
            <option value="detA">Determinant of A</option>
            <option value="detB">Determinant of B</option>
            <option value="inverseA">Inverse of A</option>
            <option value="inverseB">Inverse of B</option>
            <option value="eigenA">Eigenvalues of A</option>
            <option value="eigenB">Eigenvalues of B</option>
            <option value="rankA">Rank of A</option>
            <option value="rankB">Rank of B</option>
          </select>
        </div>

        <div className="mb-3">
          <p className="text-white text-sm mb-1 font-semibold">
            Matrix A: 
            <span className="text-gray-400 ml-2 text-xs font-normal">Format: [[1,2],[3,4]]</span>
          </p>
          <textarea
            className="w-full h-24 p-2 bg-gray-700 text-white rounded font-mono text-sm"
            value={matrixAText}
            onChange={(e) => setMatrixAText(e.target.value)}
            placeholder="e.g. [[1,2],[3,4]]"
          />
        </div>

        {needsBothMatrices && (
          <div className="mb-3">
            <p className="text-white text-sm mb-1 font-semibold">
              Matrix B:
              <span className="text-gray-400 ml-2 text-xs font-normal">Format: [[5,6],[7,8]]</span>
            </p>
            <textarea
              className="w-full h-24 p-2 bg-gray-700 text-white rounded font-mono text-sm"
              value={matrixBText}
              onChange={(e) => setMatrixBText(e.target.value)}
              placeholder="e.g. [[5,6],[7,8]]"
            />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleOperation}
            className="bg-green-600 hover:bg-green-500 p-2 rounded text-white flex-1 font-semibold"
          >
            Compute
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded text-white flex-1 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatrixModal;