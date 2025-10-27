import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * useKeyboardShortcuts Hook
 * Handles keyboard input for the calculator
 * Manages Enter, Backspace, and character input
 */
function useKeyboardShortcuts(inputRef, showMatrixModal, handleEquals, setInput) {
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || showMatrixModal) return undefined;

    const handler = (e) => {
      // Prevent Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return;
      }

      // Handle Enter key - calculate result
      if (e.key === 'Enter') {
        handleEquals();
        e.preventDefault();
        return;
      }

      // Handle Backspace - delete last character
      if (e.key === 'Backspace') {
        setInput((s) => s.slice(0, -1));
        e.preventDefault();
        return;
      }

      // Handle single character input
      if (e.key.length === 1) {
        const allowed = '0123456789+-*/().%^![], ';
        if (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key)) {
          setInput((s) => s + e.key);
          e.preventDefault();
        } else {
          toast.warn(`Character '${e.key}' not allowed`);
          e.preventDefault();
        }
      }
    };

    inputElement.addEventListener('keydown', handler);
    return () => inputElement.removeEventListener('keydown', handler);
  }, [inputRef, handleEquals, showMatrixModal, setInput]);
}

export default useKeyboardShortcuts;
