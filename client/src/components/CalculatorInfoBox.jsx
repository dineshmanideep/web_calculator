import React from 'react';

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
          <li>
            <b>Arithmetic:</b>
            {' '}
            <code>2+3*4</code>
            ,
            {' '}
            <code>(1+2)^3</code>
            ,
            {' '}
            <code>5%3</code>
          </li>
          <li>
            <b>Parentheses:</b>
            {' '}
            Use
            {' '}
            <code>( )</code>
            {' '}
            for grouping
          </li>
          <li>
            <b>Power:</b>
            {' '}
            <code>2^8</code>
            {' '}
            or
            {' '}
            <code>pow(2,8)</code>
          </li>
          <li>
            <b>Square Root:</b>
            {' '}
            <code>sqrt(16)</code>
          </li>
          <li>
            <b>Factorial:</b>
            {' '}
            <code>5!</code>
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">DL Mode Operations & Parameters</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Conv1D Output Length (convOut1D):</b>
            {' '}
            lOut = floor((lIn + 2*p - d*(k-1) - 1)/s) + 1
            <div className="ml-4 mt-1">
              <code>lIn</code> input length,
              {' '}
              <code>k</code> kernel size,
              {' '}
              <code>s</code> stride (≠ 0),
              {' '}
              <code>p</code> padding per side,
              {' '}
              <code>d</code> dilation (≥ 1)
            </div>
          </li>
          <li>
            <b>Transposed Conv1D Output Length (transOut1D):</b>
            {' '}
            lOut = (lIn - 1)*s - 2*p + d*(k-1) + oPad + 1
            <div className="ml-4 mt-1">
              <code>oPad</code>
              {' '}
              output padding (0..s-1), others like Conv1D
            </div>
          </li>
          <li>
            <b>SAME Padding per side (padSame1D):</b>
            {' '}
            computes <code>p</code> so output ≈ ceil(lIn/s)
            <div className="ml-4 mt-1">
              <code>lIn, k, s, d</code>
              ; large kernels relative to input are rejected
            </div>
          </li>
          <li>
            <b>Padding for desired output (padDiff1D):</b>
            {' '}
            returns <code>p</code> to reach a specific <code>lOut</code>
            <div className="ml-4 mt-1">
              <code>desiredLOut</code>
              {' '}
              must be feasible w.r.t <code>lIn, k, s, d</code>
            </div>
          </li>
          <li>
            <b>Pool1D Output Length (poolOut1D):</b>
            {' '}
            lOut = floor((lIn + 2*p - k)/s) + 1
            <div className="ml-4 mt-1">
              <code>k</code>
              {' '}
              must not exceed padded input; <code>s</code> ≠ 0
            </div>
          </li>
          <li>
            <b>Conv1D Parameters (convParams1D):</b>
            {' '}
            weights + bias
            <div className="ml-4 mt-1">
              <code>cIn, cOut, k, groups, biasFlag</code>
              ;
              {' '}
              <code>cIn</code>
              {' '}
              and
              {' '}
              <code>cOut</code>
              {' '}
              divisible by
              {' '}
              <code>groups</code>
              , groups ≥ 1
            </div>
          </li>
          <li>
            <b>Transposed Conv1D Parameters (transParams1D):</b>
            {' '}
            same formula as Conv1D params
            <div className="ml-4 mt-1">
              <code>cIn, cOut, k, groups, biasFlag</code>
            </div>
          </li>
          <li>
            <b>Conv2D Parameters (convParams2D):</b>
            {' '}
            weights + bias
            <div className="ml-4 mt-1">
              <code>cIn, cOut, kH, kW, groups, biasFlag</code>
              ;
              {' '}
              channel divisibility and groups constraints apply
            </div>
          </li>
          <li>
            <b>Transposed Conv2D Parameters (transParams2D):</b>
            {' '}
            same as Conv2D params
            <div className="ml-4 mt-1">
              <code>cIn, cOut, kH, kW, groups, biasFlag</code>
            </div>
          </li>
          <li className="text-yellow-300">
            <b>Notes:</b>
            {' '}
            <code>s</code> ≠ 0; <code>d</code> ≥ 1; <code>oPad</code> in [0, s-1]; inputs must be finite integers and within safe limits;
            grouped convs require <code>cIn</code> and <code>cOut</code> divisible by <code>groups</code>; effective kernel ≤ padded input
          </li>
        </ul>

        <h3 className="font-semibold mb-1">DL Modes overview</h3>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Convolution:</b>
            {' '}
            Use <code>convOut1D</code> for output size, <code>convParams1D</code>/<code>convParams2D</code> for parameter counts
          </li>
          <li>
            <b>Transposed Convolution:</b>
            {' '}
            Use <code>transOut1D</code> for output size, <code>transParams1D</code>/<code>transParams2D</code> for parameters
          </li>
          <li>
            <b>Pooling:</b>
            {' '}
            Use <code>poolOut1D</code> for max/avg pooling output size
          </li>
          <li>
            <b>Padding:</b>
            {' '}
            Use <code>padSame1D</code> to keep size, <code>padDiff1D</code> to reach a specific size
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Trigonometry</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Functions:</b>
            {' '}
            <code>sin(x)</code>
            ,
            {' '}
            <code>cos(x)</code>
            ,
            {' '}
            <code>tan(x)</code>
          </li>
          <li>
            <b>Inverse:</b>
            {' '}
            <code>asin(x)</code>
            ,
            {' '}
            <code>acos(x)</code>
            ,
            {' '}
            <code>atan(x)</code>
          </li>
          <li>
            <b>Hyperbolic:</b>
            {' '}
            <code>sinh(x)</code>
            ,
            {' '}
            <code>cosh(x)</code>
            ,
            {' '}
            <code>tanh(x)</code>
          </li>
          <li className="text-yellow-300">Toggle between Radians/Degrees in profile menu</li>
          <li className="text-yellow-300">Use Inv button to switch to inverse trig functions</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Constants</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <code>pi</code>
            {' '}
            or
            {' '}
            <code>π</code>
            {' '}
            ≈ 3.14159
          </li>
          <li>
            <code>e</code>
            {' '}
            ≈ 2.71828 (Euler&apos;s number)
          </li>
          <li>
            <code>i</code>
            {' '}
            = imaginary unit (√-1)
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Complex Numbers</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Notation:</b>
            {' '}
            <code>2+3i</code>
            ,
            {' '}
            <code>complex(2,3)</code>
          </li>
          <li>
            <b>Real part:</b>
            {' '}
            <code>re(2+3i)</code>
            {' '}
            → 2
          </li>
          <li>
            <b>Imaginary part:</b>
            {' '}
            <code>im(2+3i)</code>
            {' '}
            → 3
          </li>
          <li>
            <b>Conjugate:</b>
            {' '}
            <code>conj(2+3i)</code>
            {' '}
            → 2-3i
          </li>
          <li>
            <b>Magnitude:</b>
            {' '}
            <code>abs(2+3i)</code>
            {' '}
            → 3.606
          </li>
          <li>
            <b>Argument:</b>
            {' '}
            <code>arg(2+3i)</code>
            {' '}
            → angle in radians
          </li>
          <li>
            <b>Operations:</b>
            {' '}
            All arithmetic works with complex numbers
          </li>
          <li className="text-yellow-300">Enable Complex mode for quick access to functions</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Matrix Operations</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Format:</b>
            {' '}
            <code>[[1,2],[3,4]]</code>
          </li>
          <li>
            <b>Multiply:</b>
            {' '}
            Click Matrix button, select Multiply operation
          </li>
          <li>
            <b>Add/Subtract:</b>
            {' '}
            Support for multiple matrices (A+B+C...)
          </li>
          <li>
            <b>Transpose:</b>
            {' '}
            Available in Matrix operations
          </li>
          <li>
            <b>Determinant:</b>
            {' '}
            Calculate determinant of square matrix
          </li>
          <li>
            <b>Inverse:</b>
            {' '}
            Invert square non-singular matrix
          </li>
          <li className="text-yellow-300">You can add multiple matrices for operations</li>
          <li className="text-yellow-300">Use keypad on left, view input on right</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Logarithms</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Common log:</b>
            {' '}
            <code>log(100)</code>
            {' '}
            → 2 (base 10)
          </li>
          <li>
            <b>Natural log:</b>
            {' '}
            <code>ln(e)</code>
            {' '}
            → 1
          </li>
          <li>
            <b>Custom base:</b>
            {' '}
            <code>log(8, 2)</code>
            {' '}
            → 3
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Combinatorics</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Permutations:</b>
            {' '}
            <code>nPr(5,2)</code>
            {' '}
            → 20
          </li>
          <li>
            <b>Combinations:</b>
            {' '}
            <code>nCr(5,2)</code>
            {' '}
            → 10
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Calculus (Numerical)</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Derivative:</b>
            {' '}
            <code>derivative(x^2, x)</code>
          </li>
          <li>
            <b>Integration:</b>
            {' '}
            Not yet implemented
          </li>
          <li className="text-yellow-300">Enable Calculus mode for quick access</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Plotting (Interactive)</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Click Plot button</b>
            {' '}
            to open the plot area
          </li>
          <li>
            <b>Enter function</b>
            {' '}
            with variable
            {' '}
            <code>x</code>
            {' '}
            in the input field
          </li>
          <li>
            <b>Example:</b>
            {' '}
            <code>sin(x)</code>
            ,
            {' '}
            <code>x^2+2x+1</code>
            ,
            {' '}
            <code>1/x</code>
          </li>
          <li>
            <b>Click Plot button</b>
            {' '}
            in plot area to visualize
          </li>
          <li>
            <b>Resize plot:</b>
            {' '}
            Drag the right edge, bottom edge, or corner handle to resize
          </li>
          <li className="text-green-300">
            <b>Zoom out/in:</b>
            {' '}
            Graph extends infinitely - no range limits!
          </li>
          <li className="text-green-300">
            <b>Pan:</b>
            {' '}
            Drag the plot to explore different regions
          </li>
          <li className="text-green-300">
            <b>Auto-regenerate:</b>
            {' '}
            More data points generated when zooming
          </li>
          <li>Supports real and complex functions (plots real part)</li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">DL Mode (Sequential Parameters)</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Enter parameters in main textbox:</b>
            {' '}
            The placeholder will guide you (e.g., "Enter L_in")
          </li>
          <li>
            <b>Use = to confirm each parameter:</b>
            {' '}
            Press '=' to accept current value and move to the next parameter
          </li>
          <li>
            <b>Cancel:</b>
            {' '}
            Press 'C' to cancel the current DL operation at any time
          </li>
          <li>
            <b>Starting a new DL operation:</b>
            {' '}
            Always begins from the first required parameter
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Special Features</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Ans:</b>
            {' '}
            Inserts last answer into expression
          </li>
          <li>
            <b>History:</b>
            {' '}
            Click any history item to reload expression
          </li>
          <li>
            <b>ML Mode:</b>
            {' '}
            Access machine learning utilities
          </li>
          <li>
            <b>Clear History:</b>
            {' '}
            Remove all calculation history
          </li>
        </ul>

        <h2 className="font-bold text-base mb-2 text-yellow-300">Keyboard Shortcuts</h2>
        <ul className="list-disc ml-5 mb-3 text-sm">
          <li>
            <b>Enter:</b>
            {' '}
            Evaluate expression
          </li>
          <li>
            <b>Backspace:</b>
            {' '}
            Delete last character
          </li>
          <li>Type numbers, operators, and functions directly</li>
          <li>
            <b>In Plot Area:</b>
            {' '}
            Press Enter to plot function
          </li>
        </ul>

        <div className="mt-3 p-2 bg-gray-800 rounded text-xs">
          <b>Tips:</b>
          <ul className="list-disc ml-4 mt-1">
            <li>Use parentheses generously for clarity</li>
            <li>
              Complex numbers:
              <code>sqrt(-1)</code>
              {' '}
              returns
              <code>i</code>
            </li>
            <li>Maximum matrix size: 10×10 dimensions</li>
            <li>Matrix dimensions must match for operations</li>
            <li>Angle mode affects trig functions globally</li>
            <li className="text-green-300">Plot area: Zoom/pan freely - infinite range!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculatorInfoBox;