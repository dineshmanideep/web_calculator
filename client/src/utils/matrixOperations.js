import { toast } from 'react-toastify';
import math from './index.js';

/**
 * Parse matrix string input like "[[1,2],[3,4]]" into a matrix
 */
export const parseMatrix = (str) => {
  try {
    // Remove whitespace
    const cleaned = str.trim();

    // Check if it's a valid matrix format
    if (!cleaned.startsWith('[') || !cleaned.endsWith(']')) {
      throw new Error('Matrix must start with [ and end with ]');
    }

    // Parse using JSON
    const parsed = JSON.parse(cleaned);

    // Validate it's a 2D array
    if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) {
      throw new Error('Invalid matrix format');
    }

    return math.matrix(parsed);
  } catch (error) {
    throw new Error(`Invalid matrix format: ${error.message}`);
  }
};

/**
 * Perform matrix multiplication
 */
export const matrixMultiply = (matrix1, matrix2) => {
  try {
    const result = math.multiply(matrix1, matrix2);
    return result;
  } catch (error) {
    throw new Error(`Matrix multiplication failed: ${error.message}`);
  }
};

/**
 * Perform matrix addition
 */
export const matrixAdd = (matrix1, matrix2) => {
  try {
    const result = math.add(matrix1, matrix2);
    return result;
  } catch (error) {
    throw new Error(`Matrix addition failed: ${error.message}`);
  }
};

/**
 * Perform matrix subtraction
 */
export const matrixSubtract = (matrix1, matrix2) => {
  try {
    const result = math.subtract(matrix1, matrix2);
    return result;
  } catch (error) {
    throw new Error(`Matrix subtraction failed: ${error.message}`);
  }
};

/**
 * Calculate matrix determinant
 */
export const matrixDeterminant = (matrix) => {
  try {
    const result = math.det(matrix);
    return result;
  } catch (error) {
    throw new Error(`Determinant calculation failed: ${error.message}`);
  }
};

/**
 * Calculate matrix transpose
 */
export const matrixTranspose = (matrix) => {
  try {
    const result = math.transpose(matrix);
    return result;
  } catch (error) {
    throw new Error(`Transpose calculation failed: ${error.message}`);
  }
};

/**
 * Format matrix for display
 */
export const formatMatrix = (matrix) => {
  try {
    return math.format(matrix, { notation: 'fixed', precision: 4 });
  } catch (error) {
    return String(matrix);
  }
};

/**
 * Perform matrix operation based on type
 */
export const performMatrixOperation = (operation, matrix1, matrix2 = null) => {
  switch (operation) {
    case 'MatMul':
      if (!matrix2) throw new Error('Matrix multiplication requires two matrices');
      return matrixMultiply(matrix1, matrix2);

    case 'MatAdd':
      if (!matrix2) throw new Error('Matrix addition requires two matrices');
      return matrixAdd(matrix1, matrix2);

    case 'MatSub':
      if (!matrix2) throw new Error('Matrix subtraction requires two matrices');
      return matrixSubtract(matrix1, matrix2);

    case 'Det':
      return matrixDeterminant(matrix1);

    case 'Transpose':
      return matrixTranspose(matrix1);

    default:
      throw new Error('Unknown matrix operation');
  }
};
