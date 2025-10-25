import React from "react";

const CalculatorInfoBox = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gray-700 text-white rounded p-6 text-sm shadow-lg w-[400px] max-h-[90vh] overflow-y-auto border border-yellow-500 relative">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">Calculator Help</span>
          <button
            onClick={onClose}
            className="text-yellow-400 font-bold text-lg px-2 absolute top-2 right-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <h2 className="font-bold text-base mb-2 text-yellow-300">Basic Operations</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Arithmetic:</b> <code>2+3*4</code>, <code>(1+2)^3</code>, <code>5%3</code></li>
          <li><b>Parentheses:</b> Use <code>( )</code> for grouping</li>
          <li><b>Power:</b> <code>2^8</code> or <code>pow(2,8)</code></li>
          <li><b>Square Root:</b> <code>sqrt(16)</code></li>
          <li><b>Factorial:</b> <code>5!</code></li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Trigonometry</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Functions:</b> <code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code></li>
          <li><b>Inverse:</b> <code>asin(x)</code>, <code>acos(x)</code>, <code>atan(x)</code></li>
          <li><b>Hyperbolic:</b> <code>sinh(x)</code>, <code>cosh(x)</code>, <code>tanh(x)</code></li>
          <li className="text-yellow-300">Toggle between Radians/Degrees in profile menu</li>
          <li className="text-yellow-300">Use Inv button to switch to inverse trig functions</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Constants</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><code>pi</code> or <code>π</code> ≈ 3.14159</li>
          <li><code>e</code> ≈ 2.71828 (Euler's number)</li>
          <li><code>i</code> = imaginary unit (√-1)</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Complex Numbers</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Notation:</b> <code>2+3i</code>, <code>complex(2,3)</code></li>
          <li><b>Real part:</b> <code>re(2+3i)</code> → 2</li>
          <li><b>Imaginary part:</b> <code>im(2+3i)</code> → 3</li>
          <li><b>Conjugate:</b> <code>conj(2+3i)</code> → 2-3i</li>
          <li><b>Magnitude:</b> <code>abs(2+3i)</code> → 3.606</li>
          <li><b>Argument:</b> <code>arg(2+3i)</code> → angle in radians</li>
          <li><b>Operations:</b> All arithmetic works with complex numbers</li>
          <li className="text-yellow-300">Enable Complex mode for quick access to functions</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Matrix Operations</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Format:</b> <code>[[1,2],[3,4]]</code></li>
          <li><b>Multiply:</b> Click MatMul button</li>
          <li><b>Add/Subtract:</b> MatAdd, MatSub buttons</li>
          <li><b>Transpose:</b> TransA, TransB buttons</li>
          <li><b>Determinant:</b> DetA, DetB buttons</li>
          <li><b>Inverse:</b> InvA, InvB buttons</li>
          <li><b>Eigenvalues:</b> EigenA button</li>
          <li><b>Rank:</b> RankA button</li>
          <li className="text-yellow-300">Enable Matrix mode to access all operations</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Logarithms</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Common log:</b> <code>log(100)</code> → 2 (base 10)</li>
          <li><b>Natural log:</b> <code>ln(e)</code> → 1</li>
          <li><b>Custom base:</b> <code>log(8, 2)</code> → 3</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Combinatorics</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Permutations:</b> <code>nPr(5,2)</code> → 20</li>
          <li><b>Combinations:</b> <code>nCr(5,2)</code> → 10</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Calculus (Numerical)</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Derivative:</b> <code>derivative(x^2, x)</code></li>
          <li><b>Integration:</b> Not yet implemented</li>
          <li className="text-yellow-300">Enable Calculus mode for quick access</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Plotting</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>Enter function with variable <code>x</code></li>
          <li>Example: <code>sin(x)</code>, <code>x^2+2x+1</code></li>
          <li>Click <b>Plot</b> button to visualize</li>
          <li>Supports real and complex functions (plots real part)</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Special Features</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Ans:</b> Inserts last answer into expression</li>
          <li><b>History:</b> Click any history item to reload expression</li>
          <li><b>ML Mode:</b> Access machine learning utilities</li>
          <li><b>Clear History:</b> Remove all calculation history</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Keyboard Shortcuts</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li><b>Enter:</b> Evaluate expression</li>
          <li><b>Backspace:</b> Delete last character</li>
          <li>Type numbers, operators, and functions directly</li>
        </ul>

        <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
          <b>Tips:</b>
          <ul className="list-disc ml-4 mt-1">
            <li>Use parentheses generously for clarity</li>
            <li>Complex numbers: <code>sqrt(-1)</code> returns <code>i</code></li>
            <li>Matrix dimensions must match for operations</li>
            <li>Angle mode affects trig functions globally</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculatorInfoBox;