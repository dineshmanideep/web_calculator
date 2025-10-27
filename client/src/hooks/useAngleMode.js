import { useState } from 'react';

/**
 * Custom hook to manage angle mode (radians vs degrees) for trigonometric operations
 *
 * @returns {Object} Angle mode state and setter
 */
export default function useAngleMode() {
  const [angleMode, setAngleMode] = useState('rad'); // 'rad' or 'deg'

  return {
    angleMode,
    setAngleMode,
  };
}
