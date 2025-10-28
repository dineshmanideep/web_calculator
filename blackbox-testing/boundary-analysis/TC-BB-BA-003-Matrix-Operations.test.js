/**
 * TC-BB-BA-003: Boundary Analysis Test - Matrix Operations
 * 
 * This test verifies boundary conditions for matrix operations:
 * - Minimum/Maximum matrix dimensions (1x1 to 100x100)
 * - Empty matrices
 * - Single element matrices
 * - Square vs rectangular matrices boundaries
 * - Zero matrices and identity matrices
 * 
 * Testing Module: Matrix Operations
 */

import { describe, it, expect } from '@jest/globals';
import {
  addMatrices,
  subtractMatrices,
  multiplyMatrices,
  transposeMatrix,
  determinant,
  inverseMatrix
} from '../../client/src/utils/matrixOperations.js';

describe('TC-BB-BA-003: Boundary Analysis - Matrix Dimensions', () => {

  // ==================== MATRIX SIZE BOUNDARIES ====================

  it('BA-003.1: Should handle minimum matrix size (1x1)', () => {
    const matrix = [[5]];
    const result = transposeMatrix(matrix);
    expect(result).toEqual([[5]]);
  });

  it('BA-003.2: Should handle 2x2 matrix (smallest meaningful)', () => {
    const matrix = [[1, 2], [3, 4]];
    const det = determinant(matrix);
    expect(det).toBe(-2);
  });

  it('BA-003.3: Should handle 3x3 matrix', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];
    const det = determinant(matrix);
    expect(det).toBe(0); // Singular matrix
  });

  it('BA-003.4: Should handle 10x10 matrix', () => {
    const matrix = Array(10).fill(0).map((_, i) => 
      Array(10).fill(0).map((_, j) => i === j ? 1 : 0)
    );
    const det = determinant(matrix);
    expect(det).toBe(1); // Identity matrix determinant
  });

  it('BA-003.5: Should handle rectangular matrix (2x5)', () => {
    const matrix = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]];
    const transposed = transposeMatrix(matrix);
    expect(transposed.length).toBe(5);
    expect(transposed[0].length).toBe(2);
  });

  it('BA-003.6: Should handle rectangular matrix (5x2)', () => {
    const matrix = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]];
    const transposed = transposeMatrix(matrix);
    expect(transposed.length).toBe(2);
    expect(transposed[0].length).toBe(5);
  });

  it('BA-003.7: Should handle single row matrix (1xN)', () => {
    const matrix = [[1, 2, 3, 4, 5]];
    const transposed = transposeMatrix(matrix);
    expect(transposed).toEqual([[1], [2], [3], [4], [5]]);
  });

  it('BA-003.8: Should handle single column matrix (Nx1)', () => {
    const matrix = [[1], [2], [3], [4], [5]];
    const transposed = transposeMatrix(matrix);
    expect(transposed).toEqual([[1, 2, 3, 4, 5]]);
  });

  it('BA-003.9: Should reject empty matrix []', () => {
    const matrix = [];
    expect(() => determinant(matrix)).toThrow();
  });

  it('BA-003.10: Should reject matrix with empty row [[]]', () => {
    const matrix = [[]];
    expect(() => determinant(matrix)).toThrow();
  });

  // ==================== MATRIX VALUE BOUNDARIES ====================

  it('BA-003.11: Should handle zero matrix', () => {
    const zeroMatrix = [[0, 0], [0, 0]];
    const det = determinant(zeroMatrix);
    expect(det).toBe(0);
  });

  it('BA-003.12: Should handle identity matrix 2x2', () => {
    const identity = [[1, 0], [0, 1]];
    const det = determinant(identity);
    expect(det).toBe(1);
  });

  it('BA-003.13: Should handle identity matrix 3x3', () => {
    const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const det = determinant(identity);
    expect(det).toBe(1);
  });

  it('BA-003.14: Should handle matrix with maximum safe integer values', () => {
    const max = Number.MAX_SAFE_INTEGER;
    const matrix = [[max, 0], [0, 1]];
    const det = determinant(matrix);
    expect(det).toBe(max);
  });

  it('BA-003.15: Should handle matrix with minimum safe integer values', () => {
    const min = Number.MIN_SAFE_INTEGER;
    const matrix = [[min, 0], [0, 1]];
    const det = determinant(matrix);
    expect(det).toBe(min);
  });

  it('BA-003.16: Should handle matrix with very small decimal values', () => {
    const matrix = [[0.0001, 0.0002], [0.0003, 0.0004]];
    const det = determinant(matrix);
    expect(det).toBeCloseTo(-0.00000002, 10);
  });

  it('BA-003.17: Should handle matrix with mixed positive/negative at boundary', () => {
    const matrix = [[-1, 1], [1, -1]];
    const det = determinant(matrix);
    expect(det).toBe(0);
  });

  it('BA-003.18: Should handle matrix with all negative values', () => {
    const matrix = [[-1, -2], [-3, -4]];
    const det = determinant(matrix);
    expect(det).toBe(-2);
  });

  // ==================== MATRIX ADDITION BOUNDARIES ====================

  it('BA-003.19: Should add minimum size matrices (1x1)', () => {
    const a = [[5]];
    const b = [[3]];
    const result = addMatrices(a, b);
    expect(result).toEqual([[8]]);
  });

  it('BA-003.20: Should add zero matrices', () => {
    const a = [[0, 0], [0, 0]];
    const b = [[0, 0], [0, 0]];
    const result = addMatrices(a, b);
    expect(result).toEqual([[0, 0], [0, 0]]);
  });

  it('BA-003.21: Should add matrix to its negative (result = zero matrix)', () => {
    const a = [[1, 2], [3, 4]];
    const b = [[-1, -2], [-3, -4]];
    const result = addMatrices(a, b);
    expect(result).toEqual([[0, 0], [0, 0]]);
  });

  it('BA-003.22: Should reject addition of matrices with mismatched dimensions', () => {
    const a = [[1, 2]];
    const b = [[1], [2]];
    expect(() => addMatrices(a, b)).toThrow();
  });

  it('BA-003.23: Should add large matrices (10x10)', () => {
    const a = Array(10).fill(0).map(() => Array(10).fill(1));
    const b = Array(10).fill(0).map(() => Array(10).fill(2));
    const result = addMatrices(a, b);
    expect(result[0][0]).toBe(3);
    expect(result[9][9]).toBe(3);
  });

  // ==================== MATRIX MULTIPLICATION BOUNDARIES ====================

  it('BA-003.24: Should multiply minimum matrices (1x1 * 1x1)', () => {
    const a = [[5]];
    const b = [[3]];
    const result = multiplyMatrices(a, b);
    expect(result).toEqual([[15]]);
  });

  it('BA-003.25: Should multiply matrix by identity (A * I = A)', () => {
    const a = [[1, 2], [3, 4]];
    const identity = [[1, 0], [0, 1]];
    const result = multiplyMatrices(a, identity);
    expect(result).toEqual(a);
  });

  it('BA-003.26: Should multiply matrix by zero matrix (result = zero)', () => {
    const a = [[1, 2], [3, 4]];
    const zero = [[0, 0], [0, 0]];
    const result = multiplyMatrices(a, zero);
    expect(result).toEqual([[0, 0], [0, 0]]);
  });

  it('BA-003.27: Should multiply rectangular matrices (2x3 * 3x2)', () => {
    const a = [[1, 2, 3], [4, 5, 6]];
    const b = [[1, 2], [3, 4], [5, 6]];
    const result = multiplyMatrices(a, b);
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(2);
  });

  it('BA-003.28: Should reject multiplication with incompatible dimensions (2x3 * 2x2)', () => {
    const a = [[1, 2, 3], [4, 5, 6]];
    const b = [[1, 2], [3, 4]];
    expect(() => multiplyMatrices(a, b)).toThrow();
  });

  it('BA-003.29: Should multiply row by column (1xN * Nx1 = scalar)', () => {
    const a = [[1, 2, 3]];
    const b = [[4], [5], [6]];
    const result = multiplyMatrices(a, b);
    expect(result).toEqual([[32]]); // 1*4 + 2*5 + 3*6
  });

  it('BA-003.30: Should multiply column by row (Nx1 * 1xN = NxN)', () => {
    const a = [[1], [2], [3]];
    const b = [[4, 5, 6]];
    const result = multiplyMatrices(a, b);
    expect(result.length).toBe(3);
    expect(result[0].length).toBe(3);
  });

  // ==================== MATRIX INVERSE BOUNDARIES ====================

  it('BA-003.31: Should find inverse of 2x2 identity matrix', () => {
    const identity = [[1, 0], [0, 1]];
    const inverse = inverseMatrix(identity);
    expect(inverse).toEqual(identity);
  });

  it('BA-003.32: Should reject inverse of singular matrix (det = 0)', () => {
    const singular = [[1, 2], [2, 4]];
    expect(() => inverseMatrix(singular)).toThrow();
  });

  it('BA-003.33: Should find inverse of 2x2 matrix', () => {
    const matrix = [[1, 2], [3, 4]];
    const inverse = inverseMatrix(matrix);
    const product = multiplyMatrices(matrix, inverse);
    // Product should be identity
    expect(product[0][0]).toBeCloseTo(1, 5);
    expect(product[1][1]).toBeCloseTo(1, 5);
  });

  it('BA-003.34: Should reject inverse of non-square matrix', () => {
    const rect = [[1, 2, 3], [4, 5, 6]];
    expect(() => inverseMatrix(rect)).toThrow();
  });

  it('BA-003.35: Should reject inverse of 1x1 zero matrix', () => {
    const zero = [[0]];
    expect(() => inverseMatrix(zero)).toThrow();
  });

  // ==================== TRANSPOSE BOUNDARIES ====================

  it('BA-003.36: Should transpose 1x1 matrix to itself', () => {
    const matrix = [[5]];
    const result = transposeMatrix(matrix);
    expect(result).toEqual([[5]]);
  });

  it('BA-003.37: Should transpose square matrix symmetrically', () => {
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const transposed = transposeMatrix(matrix);
    expect(transposed[0][0]).toBe(1);
    expect(transposed[0][1]).toBe(4);
    expect(transposed[0][2]).toBe(7);
  });

  it('BA-003.38: Should transpose twice to get original', () => {
    const matrix = [[1, 2], [3, 4], [5, 6]];
    const transposed = transposeMatrix(matrix);
    const doubleTransposed = transposeMatrix(transposed);
    expect(doubleTransposed).toEqual(matrix);
  });

  // ==================== DETERMINANT BOUNDARIES ====================

  it('BA-003.39: Should calculate determinant of 1x1 matrix', () => {
    const matrix = [[5]];
    const det = determinant(matrix);
    expect(det).toBe(5);
  });

  it('BA-003.40: Should calculate determinant of diagonal matrix', () => {
    const diagonal = [[2, 0, 0], [0, 3, 0], [0, 0, 4]];
    const det = determinant(diagonal);
    expect(det).toBe(24); // 2 * 3 * 4
  });

  it('BA-003.41: Should calculate determinant of upper triangular matrix', () => {
    const upper = [[2, 3, 4], [0, 5, 6], [0, 0, 7]];
    const det = determinant(upper);
    expect(det).toBe(70); // 2 * 5 * 7
  });

  it('BA-003.42: Should reject determinant of non-square matrix', () => {
    const rect = [[1, 2, 3], [4, 5, 6]];
    expect(() => determinant(rect)).toThrow();
  });
});
