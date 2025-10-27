import { useState } from 'react';
import { toast } from 'react-toastify';
import { parseMatrix, performMatrixOperation, formatMatrix } from '../utils/matrixOperations';

const useMatrixOperations = (input, setInput, pushHistory, setLastAnswer) => {
  const [matrixMode, setMatrixMode] = useState(false);
  const [matrixOperation, setMatrixOperation] = useState(null);
  const [firstMatrix, setFirstMatrix] = useState(null);

  const handleMatrixOperation = (operation) => {
    try {
      const currentInput = input.trim();

      // Handle equals (=) - complete pending operation
      if (operation === '=') {
        if (!firstMatrix || !matrixOperation) {
          toast.warn('No pending matrix operation to complete');
          return;
        }

        if (!currentInput) {
          toast.warn('Please enter the second matrix');
          return;
        }

        const secondMatrix = parseMatrix(currentInput);
        const size1 = firstMatrix.matrix.size();
        const size2 = secondMatrix.size();

        if (matrixOperation === 'MatMul') {
          if (size1[1] !== size2[0]) {
            toast.error(`Matrix multiplication error: First matrix columns (${size1[1]}) must equal second matrix rows (${size2[0]})`);
            return;
          }
        } else if (matrixOperation === 'MatAdd' || matrixOperation === 'MatSub') {
          if (size1[0] !== size2[0] || size1[1] !== size2[1]) {
            toast.error(`Matrix ${matrixOperation === 'MatAdd' ? 'addition' : 'subtraction'} error: Matrices must have same dimensions`);
            return;
          }
        }

        const result = performMatrixOperation(matrixOperation, firstMatrix.matrix, secondMatrix);
        const formatted = formatMatrix(result);

        setInput(formatted);
        pushHistory(`${firstMatrix.input} ${matrixOperation} ${currentInput}`, formatted);

        setFirstMatrix(null);
        setMatrixOperation(null);

        toast.success(`${matrixOperation} completed successfully!`);
        return;
      }

      // Unary operations (Det, Transpose)
      if (operation === 'Det' || operation === 'Transpose') {
        if (!currentInput) {
          toast.warn('Please enter a matrix first');
          return;
        }

        const matrix = parseMatrix(currentInput);

        if (operation === 'Det') {
          const size = matrix.size();
          if (size[0] !== size[1]) {
            toast.error('Determinant requires a square matrix');
            return;
          }
        }

        const result = performMatrixOperation(operation, matrix);
        const formatted = formatMatrix(result);
        setInput(formatted);
        pushHistory(`${operation}(${currentInput})`, formatted);
        toast.success(`${operation} calculated successfully`);
        return;
      }

      // Binary operations (MatMul, MatAdd, MatSub)
      if (!firstMatrix) {
        if (!currentInput) {
          toast.warn('Please enter the first matrix');
          return;
        }

        const matrix = parseMatrix(currentInput);
        setFirstMatrix({ matrix, input: currentInput });
        setMatrixOperation(operation);
        setInput('');
        toast.info(`${operation} - Now enter the second matrix and press "="`);
      } else {
        if (!currentInput) {
          toast.warn('Please enter the second matrix');
          return;
        }

        const secondMatrix = parseMatrix(currentInput);
        const size1 = firstMatrix.matrix.size();
        const size2 = secondMatrix.size();

        if (matrixOperation === 'MatMul') {
          if (size1[1] !== size2[0]) {
            toast.error(`Matrix multiplication error: First matrix columns (${size1[1]}) must equal second matrix rows (${size2[0]})`);
            return;
          }
        } else if (matrixOperation === 'MatAdd' || matrixOperation === 'MatSub') {
          if (size1[0] !== size2[0] || size1[1] !== size2[1]) {
            toast.error(`Matrix ${matrixOperation === 'MatAdd' ? 'addition' : 'subtraction'} error: Matrices must have same dimensions`);
            return;
          }
        }

        const result = performMatrixOperation(matrixOperation, firstMatrix.matrix, secondMatrix);
        const formatted = formatMatrix(result);

        pushHistory(`${firstMatrix.input} ${matrixOperation} ${currentInput}`, formatted);

        setInput('');
        setFirstMatrix({ matrix: result, input: formatted });
        setMatrixOperation(operation);
        toast.success(`${matrixOperation} completed! ${operation} started - Enter second matrix and press "="`);
      }
    } catch (error) {
      toast.error(error.message || 'Matrix operation failed');
      console.error('Matrix operation error:', error);
    }
  };

  const handleMatrixClear = () => {
    setFirstMatrix(null);
    setMatrixOperation(null);
    setInput('');
    toast.info('Matrix operation cleared');
  };

  const handleMatrixResult = (expr, result) => {
    try {
      setInput(String(result));
      pushHistory(expr, result);
      setLastAnswer(String(result));
      toast.success('Matrix operation completed successfully');
    } catch (error) {
      toast.error('Failed to process matrix result');
      console.error('Matrix result error:', error);
    }
  };

  return {
    matrixMode,
    setMatrixMode,
    matrixOperation,
    firstMatrix,
    handleMatrixOperation,
    handleMatrixClear,
    handleMatrixResult,
  };
};

export default useMatrixOperations;
