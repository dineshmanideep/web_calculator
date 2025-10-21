import React from "react";

const CalculatorInfoBox = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gray-700 text-white rounded p-6 text-sm shadow-lg w-[350px] border border-yellow-500 relative">
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
        <h2 className="font-bold text-lg mb-2">Calculator Usage & Syntax Guide</h2>
        <ul className="list-disc ml-5 mb-2">
          <li>
            <b>Basic Arithmetic:</b> <code>2+3*4</code>, <code>(1+2)^3</code>
          </li>
          <li>
            <b>Parentheses:</b> <code>( ... )</code> for grouping, e.g. <code>(2+3)*4</code>
          </li>
          <li>
            <b>Trigonometric Functions:</b> <code>sin(x)</code>, <code>cos(45)</code>, <code>tan(x)</code>
            <br />
            <span className="text-yellow-300">Tip: Switch between radians/degrees in profile menu.</span>
          </li>
          <li>
            <b>Constants:</b> <code>pi</code> (≈3.1416), <code>e</code> (≈2.718), <code>i</code> (imaginary unit)
          </li>
          <li>
            <b>Factorial:</b> <code>5!</code>
          </li>
          <li>
            <b>Power:</b> <code>2^8</code>
          </li>
          <li>
            <b>Square Root:</b> <code>sqrt(16)</code>
          </li>
          <li>
            <b>Logarithms:</b> <code>log(100)</code> (base 10), <code>ln(e)</code> (natural log)
          </li>
          <li>
            <b>Permutations/Combinations:</b> <code>nPr(5,2)</code>, <code>nCr(5,2)</code>
          </li>
          <li>
            <b>Integration:</b> <code>x^2,0,2</code> (function, lower, upper) <br />
            <span className="text-yellow-300">Example: <code>sin(x),0,pi</code></span>
          </li>
          <li>
            <b>Derivative:</b> Enter function in <code>x</code>, then press <b>Der</b> button
          </li>
          <li>
            <b>Matrix Multiplication:</b> Press <b>MatMul</b>, enter matrices as <code>[[1,2],[3,4]]</code>
          </li>
          <li>
            <b>Plotting:</b> Enter function in <code>x</code> (e.g. <code>sin(x)</code>), then press <b>Plot</b>
          </li>
          <li>
            <b>Ans:</b> Inserts last answer
          </li>
          <li>
            <b>History:</b> Click history item to reuse expression
          </li>
        </ul>
        <div className="mt-2">
          <b>Keyboard Shortcuts:</b>
          <ul className="list-disc ml-5">
            <li><b>Enter</b>: Evaluate</li>
            <li><b>Backspace</b>: Delete last character</li>
            <li>Type numbers, operators, or functions directly</li>
          </ul>
        </div>
        <div className="mt-2">
          <b>Advanced:</b>
          <ul className="list-disc ml-5">
            <li>
              <b>Complex Numbers:</b> <code>2+3i</code>
            </li>
            <li>
              <b>Matrices:</b> <code>[[1,2],[3,4]]</code>
            </li>
            <li>
              <b>Functions:</b> <code>f(x) = x^2 + 2x + 1</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalculatorInfoBox;