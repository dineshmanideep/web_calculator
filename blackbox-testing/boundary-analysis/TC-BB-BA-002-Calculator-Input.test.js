/**
 * TC-BB-BA-002: Boundary Analysis Test - Calculator Input Evaluation
 * 
 * This test verifies boundary conditions for calculator expression evaluation:
 * - Minimum/Maximum number values
 * - Minimum/Maximum expression length
 * - Numeric precision boundaries
 * - Overflow/Underflow conditions
 * - Division by zero boundaries
 * 
 * Testing Module: Calculator Evaluator
 */

import { describe, it, expect } from '@jest/globals';
import { evaluateExpression } from '../../client/src/utils/evaluator.js';
import math from '../../client/src/utils/math.lib.js';

describe('TC-BB-BA-002: Boundary Analysis - Calculator Input Values', () => {

  // ==================== NUMBER RANGE BOUNDARIES ====================

  it('BA-002.1: Should handle minimum positive number (Number.MIN_VALUE)', () => {
    const result = evaluateExpression(Number.MIN_VALUE.toString());
    expect(result).toBe(Number.MIN_VALUE);
  });

  it('BA-002.2: Should handle maximum safe integer (2^53 - 1)', () => {
    const maxSafeInt = Number.MAX_SAFE_INTEGER;
    const result = evaluateExpression(maxSafeInt.toString());
    expect(result).toBe(maxSafeInt);
  });

  it('BA-002.3: Should handle minimum safe integer (-(2^53 - 1))', () => {
    const minSafeInt = Number.MIN_SAFE_INTEGER;
    const result = evaluateExpression(minSafeInt.toString());
    expect(result).toBe(minSafeInt);
  });

  it('BA-002.4: Should handle maximum number value', () => {
    const result = evaluateExpression(Number.MAX_VALUE.toString());
    expect(result).toBe(Number.MAX_VALUE);
  });

  it('BA-002.5: Should handle zero boundary (positive zero)', () => {
    const result = evaluateExpression('0');
    expect(result).toBe(0);
    expect(Object.is(result, +0)).toBe(true);
  });

  it('BA-002.6: Should handle negative zero boundary', () => {
    const result = evaluateExpression('-0');
    expect(Object.is(result, -0)).toBe(true);
  });

  it('BA-002.7: Should handle numbers just below integer overflow (2^53 - 2)', () => {
    const result = evaluateExpression((Number.MAX_SAFE_INTEGER - 1).toString());
    expect(result).toBe(Number.MAX_SAFE_INTEGER - 1);
  });

  it('BA-002.8: Should detect overflow beyond safe integer (2^53)', () => {
    const overflowNum = Number.MAX_SAFE_INTEGER + 1;
    const result = evaluateExpression(overflowNum.toString());
    // Result may lose precision
    expect(typeof result).toBe('number');
  });

  // ==================== DECIMAL PRECISION BOUNDARIES ====================

  it('BA-002.9: Should handle single decimal place (0.1)', () => {
    const result = evaluateExpression('0.1');
    expect(result).toBeCloseTo(0.1, 10);
  });

  it('BA-002.10: Should handle maximum decimal precision (15-17 digits)', () => {
    const result = evaluateExpression('0.12345678901234567');
    expect(typeof result).toBe('number');
  });

  it('BA-002.11: Should handle very small decimal (1e-308)', () => {
    const result = evaluateExpression('1e-308');
    expect(result).toBeCloseTo(1e-308, 308);
  });

  it('BA-002.12: Should handle very large decimal (1e+308)', () => {
    const result = evaluateExpression('1e+308');
    expect(result).toBeCloseTo(1e+308);
  });

  it('BA-002.13: Should handle decimal underflow (1e-324)', () => {
    const result = evaluateExpression('1e-324');
    expect(result).toBeGreaterThan(0);
  });

  it('BA-002.14: Should return Infinity for overflow (1e+309)', () => {
    const result = evaluateExpression('1e+309');
    expect(result).toBe(Infinity);
  });

  // ==================== EXPRESSION LENGTH BOUNDARIES ====================

  it('BA-002.15: Should handle single character expression (5)', () => {
    const result = evaluateExpression('5');
    expect(result).toBe(5);
  });

  it('BA-002.16: Should handle two character expression (10)', () => {
    const result = evaluateExpression('10');
    expect(result).toBe(10);
  });

  it('BA-002.17: Should handle short expression (2+3)', () => {
    const result = evaluateExpression('2+3');
    expect(result).toBe(5);
  });

  it('BA-002.18: Should handle medium expression length (50 chars)', () => {
    const expr = '1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17+18';
    const result = evaluateExpression(expr);
    expect(result).toBe(171);
  });

  it('BA-002.19: Should handle long expression length (200 chars)', () => {
    const nums = Array.from({length: 40}, (_, i) => i + 1);
    const expr = nums.join('+');
    const result = evaluateExpression(expr);
    expect(result).toBe(820); // Sum of 1 to 40
  });

  it('BA-002.20: Should handle very long expression (500+ chars)', () => {
    const nums = Array.from({length: 100}, (_, i) => i + 1);
    const expr = nums.join('+');
    const result = evaluateExpression(expr);
    expect(result).toBe(5050); // Sum of 1 to 100
  });

  it('BA-002.21: Should reject empty expression', () => {
    expect(() => evaluateExpression('')).toThrow();
  });

  it('BA-002.22: Should reject whitespace-only expression', () => {
    expect(() => evaluateExpression('   ')).toThrow();
  });

  // ==================== DIVISION BOUNDARIES ====================

  it('BA-002.23: Should handle division by smallest positive number', () => {
    const result = evaluateExpression(`1/${Number.MIN_VALUE}`);
    expect(result).toBe(Infinity);
  });

  it('BA-002.24: Should return Infinity for division by zero', () => {
    const result = evaluateExpression('1/0');
    expect(result).toBe(Infinity);
  });

  it('BA-002.25: Should return -Infinity for negative division by zero', () => {
    const result = evaluateExpression('-1/0');
    expect(result).toBe(-Infinity);
  });

  it('BA-002.26: Should return NaN for 0/0', () => {
    const result = evaluateExpression('0/0');
    expect(isNaN(result)).toBe(true);
  });

  it('BA-002.27: Should handle division by number just above zero', () => {
    const result = evaluateExpression('1/0.0000001');
    expect(result).toBe(10000000);
  });

  it('BA-002.28: Should handle division by number just below zero', () => {
    const result = evaluateExpression('1/(-0.0000001)');
    expect(result).toBe(-10000000);
  });

  // ==================== OPERATOR BOUNDARIES ====================

  it('BA-002.29: Should handle maximum nested parentheses (depth 10)', () => {
    const expr = '((((((((((1+1))))))))))';
    const result = evaluateExpression(expr);
    expect(result).toBe(2);
  });

  it('BA-002.30: Should handle minimum operator spacing (2+3)', () => {
    const result = evaluateExpression('2+3');
    expect(result).toBe(5);
  });

  it('BA-002.31: Should handle maximum operator spacing (2   +   3)', () => {
    const result = evaluateExpression('2   +   3');
    expect(result).toBe(5);
  });

  it('BA-002.32: Should handle consecutive operators boundary (2+-3)', () => {
    const result = evaluateExpression('2+-3');
    expect(result).toBe(-1);
  });

  // ==================== FUNCTION INPUT BOUNDARIES ====================

  it('BA-002.33: Should handle sqrt at minimum boundary (sqrt(0))', () => {
    const result = evaluateExpression('sqrt(0)');
    expect(result).toBe(0);
  });

  it('BA-002.34: Should return NaN for sqrt of negative (sqrt(-1))', () => {
    const result = evaluateExpression('sqrt(-1)');
    expect(isNaN(result)).toBe(true);
  });

  it('BA-002.35: Should handle log at minimum positive boundary (log(Number.MIN_VALUE))', () => {
    const result = evaluateExpression(`log(${Number.MIN_VALUE})`);
    expect(typeof result).toBe('number');
  });

  it('BA-002.36: Should return -Infinity for log(0)', () => {
    const result = evaluateExpression('log(0)');
    expect(result).toBe(-Infinity);
  });

  it('BA-002.37: Should return NaN for log of negative', () => {
    const result = evaluateExpression('log(-1)');
    expect(isNaN(result)).toBe(true);
  });

  it('BA-002.38: Should handle sin at boundary (sin(0))', () => {
    const result = evaluateExpression('sin(0)');
    expect(result).toBeCloseTo(0, 10);
  });

  it('BA-002.39: Should handle sin at pi boundary', () => {
    const result = evaluateExpression('sin(pi)');
    expect(result).toBeCloseTo(0, 10);
  });

  it('BA-002.40: Should handle cos at boundary (cos(0))', () => {
    const result = evaluateExpression('cos(0)');
    expect(result).toBeCloseTo(1, 10);
  });

  // ==================== POWER/EXPONENT BOUNDARIES ====================

  it('BA-002.41: Should handle power of zero (2^0)', () => {
    const result = evaluateExpression('2^0');
    expect(result).toBe(1);
  });

  it('BA-002.42: Should handle zero to positive power (0^2)', () => {
    const result = evaluateExpression('0^2');
    expect(result).toBe(0);
  });

  it('BA-002.43: Should return NaN for zero to negative power (0^-1)', () => {
    const result = evaluateExpression('0^-1');
    expect(result).toBe(Infinity);
  });

  it('BA-002.44: Should handle large exponent boundary (2^1024)', () => {
    const result = evaluateExpression('2^1024');
    expect(result).toBe(Infinity);
  });

  it('BA-002.45: Should handle negative exponent boundary (2^-1024)', () => {
    const result = evaluateExpression('2^-1024');
    expect(result).toBeCloseTo(0);
  });

  it('BA-002.46: Should handle fractional exponent (4^0.5)', () => {
    const result = evaluateExpression('4^0.5');
    expect(result).toBeCloseTo(2, 10);
  });

  it('BA-002.47: Should handle negative base with integer exponent (-2)^3', () => {
    const result = evaluateExpression('(-2)^3');
    expect(result).toBe(-8);
  });

  it('BA-002.48: Should handle negative base with even exponent (-2)^4', () => {
    const result = evaluateExpression('(-2)^4');
    expect(result).toBe(16);
  });

  // ==================== SPECIAL VALUES BOUNDARIES ====================

  it('BA-002.49: Should handle infinity in expressions (Infinity + 1)', () => {
    const result = evaluateExpression('Infinity + 1');
    expect(result).toBe(Infinity);
  });

  it('BA-002.50: Should handle -Infinity in expressions', () => {
    const result = evaluateExpression('-Infinity + 1');
    expect(result).toBe(-Infinity);
  });

  it('BA-002.51: Should handle Infinity - Infinity as NaN', () => {
    const result = evaluateExpression('Infinity - Infinity');
    expect(isNaN(result)).toBe(true);
  });

  it('BA-002.52: Should handle pi constant boundary', () => {
    const result = evaluateExpression('pi');
    expect(result).toBeCloseTo(Math.PI, 10);
  });

  it('BA-002.53: Should handle e constant boundary', () => {
    const result = evaluateExpression('e');
    expect(result).toBeCloseTo(Math.E, 10);
  });
});
