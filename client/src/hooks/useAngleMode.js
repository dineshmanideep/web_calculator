/*
 * useAngleMode
 *
 * Purpose:
 * Custom React hook to manage the calculator's trigonometric angle mode (radians or degrees).
 * Provides a simple stateful interface to switch and track the current mode.
 *
 * Parameters:
 * None
 *
 * Return value:
 * An object containing:
 *   - angleMode (string): current mode, either 'rad' or 'deg'.
 *   - setAngleMode (function): function to change the current mode.
 */

import { useState } from 'react';

export default function useAngleMode() {
  const [angleMode, setAngleMode] = useState('rad'); // 'rad' or 'deg'

  return {
    angleMode,
    setAngleMode,
  };
}
