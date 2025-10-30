import math from './math.lib';
import { evaluateElement } from './evaluator';

// Maximum allowed matrix dimensions (rows and columns)
export const MAX_MATRIX_SIZE = 10;

/**
 * Parse matrix string input like "[[1,2],[3,4]]" or "[[π,e],[sin(0),cos(0)]]" into a matrix
 * Evaluates mathematical expressions and constants before creating the matrix
 *
 * @param {string} str - Matrix string in format "[[a,b],[c,d]]"
 * @param {string} angleMode - Either 'deg' or 'rad' (default: 'rad')
 * @returns {Matrix} Parsed and evaluated matrix
 * @throws {Error} If matrix format is invalid or elements cannot be evaluated
 */
export const parseMatrix = (str, angleMode = 'rad') => {
  try {
    // Remove whitespace
    const cleaned = str.trim();

    // Check if it's a valid matrix format
    if (!cleaned.startsWith('[') || !cleaned.endsWith(']')) {
      throw new Error('Matrix must start with [ and end with ]');
    }

    // Extract rows by splitting on "],["
    const rowsMatch = cleaned.match(/\[(.*)\]/);
    if (!rowsMatch) {
      throw new Error('Invalid matrix format');
    }

    const rowsString = rowsMatch[1];

    // Split by ],[ to get individual rows
    const rowStrings = rowsString.split(/\],\s*\[/);

    // Parse and evaluate each element using the centralized evaluateElement function
    const rows = rowStrings.map((rowString) => {
      const cleanRow = rowString.replace(/^\[|\]$/g, '');
      const elements = cleanRow.split(',').map((el) => el.trim());

      // Use evaluateElement from evaluator.js for consistent preprocessing
      return elements.map((element) => evaluateElement(element, angleMode));
    });

    // Validate it's a proper 2D array
    if (rows.length === 0 || rows[0].length === 0) {
      throw new Error('Matrix cannot be empty');
    }

    const colCount = rows[0].length;
    const hasInconsistentColumns = rows.some((row) => row.length !== colCount);

    if (hasInconsistentColumns) {
      throw new Error('All rows must have the same number of columns');
    }

    // Validate matrix size limits (10x10 maximum)
    if (rows.length > MAX_MATRIX_SIZE || colCount > MAX_MATRIX_SIZE) {
      throw new Error(`Matrix size exceeds maximum allowed dimensions of ${MAX_MATRIX_SIZE}×${MAX_MATRIX_SIZE}. Your matrix is ${rows.length}×${colCount}`);
    }

    return math.matrix(rows);
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
