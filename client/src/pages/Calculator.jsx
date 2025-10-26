import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import math from '../utils/index.js';
import CalculatorInput from '../components/CalculatorInput';
import PlotArea from '../components/PlotArea';
import MatrixModal from '../components/MatrixModal';
import MLCompactColumns from '../components/MLCompactColumns';
import { preprocess } from '../utils/mathEngine';
import { toast } from 'react-toastify';
import { parseMatrix, performMatrixOperation, formatMatrix } from '../utils/matrixOperations';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

// Main Calculator page component managing UI state and interactions
export default function Calculator({ user, onSignOut }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]); // Remove localStorage logic
  const [lastAnswer, setLastAnswer] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPlot, setShowPlot] = useState(false); // Controls plot box visibility
  const [plotMode, setPlotMode] = useState(false); // Track if function plot mode is active
  const [showComplexPlot, setShowComplexPlot] = useState(false); // Controls complex plot box visibility
  const [plotWidth, setPlotWidth] = useState(700);
  const [plotHeight, setPlotHeight] = useState(400);
  const [showMLMode, setShowMLMode] = useState(false);
  const [mlParamMode, setMlParamMode] = useState(null);
  const [angleMode, setAngleMode] = useState('rad'); // 'rad' or 'deg'
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixA, setMatrixA] = useState([[1, 0], [0, 1]]);
  const [matrixB, setMatrixB] = useState([[1, 2], [3, 4]]);
  const [complexMode, setComplexMode] = useState(false); // Track if complex mode is active
  const [matrixMode, setMatrixMode] = useState(false); // Track if matrix mode is active
  const [matrixOperation, setMatrixOperation] = useState(null); // Current matrix operation
  const [firstMatrix, setFirstMatrix] = useState(null); // First matrix in operation
  const [plotTrigger, setPlotTrigger] = useState(0);
  const inputRef = useRef(null);
  //define navigate

  const navigate = useNavigate();

useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/auth/history`,{withCredentials: true});
        // The backend now returns objects, let's format them for display
        const formattedHistory = data.history.map(item => `${item.expr} = ${item.result}`);
        setHistory(formattedHistory);
        if (formattedHistory.length > 0) {
            const parts = formattedHistory[0].split('=');
            setLastAnswer(parts.length > 1 ? parts[1].trim() : '');
        }
      } catch (error) {
        toast.error('Failed to fetch history.');
        console.error('Fetch history error:', error);
      }
    };

    if (user) {
      fetchHistory();
      console.log('User logged in, history fetched.', user);
    }
  }, [user]);

  // helpers
  const pushHistory = async (expr, result) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/history`, { expr, result }, { withCredentials: true });
      // The backend returns the updated history array
      const formattedHistory = data.history.map(item => `${item.expr} = ${item.result}`);
      setHistory(formattedHistory);
      setLastAnswer(String(result));
    } catch (error) {
      toast.error('Failed to save to history');
      console.error('History push error:', error);
    }
  };

  // Start a ML parameter collection sequence: params is array of names, onComplete(values)
  const startParamSequence = (params, onComplete, label) => {
    try {
      if (!params || params.length === 0) {
        toast.error('No parameters specified for ML operation');
        return;
      }
      setMlParamMode({
        params, values: [], onComplete, label,
      });
      // set input to first prompt
      if (params && params.length > 0) setInput(`${params[0]}=`);
      toast.info(`Enter ${params[0]} and press =`);
    } catch (error) {
      toast.error('Failed to start parameter sequence');
      console.error('Param sequence error:', error);
    }
  };

  const handleMatrixResult = (expr, result) => {
    try {
      setInput(String(result));
      setHistory((h) => [`${expr} = ${result}`, ...h.slice(0, 99)]);
      setLastAnswer(String(result));
      toast.success('Matrix operation completed successfully');
    } catch (error) {
      toast.error('Failed to process matrix result');
      console.error('Matrix result error:', error);
    }
  };

  // History reuse: click to insert into input or evaluate
  const handleHistoryClick = (entry) => {
    try {
      // entry like "expr = result"
      const expr = entry.split(' = ')[0];
      setInput(expr);
      inputRef.current?.focus();
      toast.info('Expression loaded from history');
    } catch (error) {
      toast.error('Failed to load from history');
      console.error('History click error:', error);
    }
  };

  // Matrix modal helpers (simple)
  const matrixToString = (m) => JSON.stringify(m);
  const handleMatrixMultiply = () => {
    try {
      const res = math.multiply(math.matrix(matrixA), math.matrix(matrixB));
      const formatted = math.format(res, { notation: 'fixed', precision: 6 });
      pushHistory(`MatMul ${matrixToString(matrixA)} * ${matrixToString(matrixB)}`, formatted);
      setShowMatrixModal(false);
      setInput(String(formatted));
      toast.success('Matrix multiplication completed');
    } catch (e) {
      toast.error(`Matrix multiply failed: ${e.message}`);
    }
  };

  const handlePlot = () => {
    // Toggle function plot mode
    const newPlotMode = !plotMode;
    setPlotMode(newPlotMode);
    setShowPlot(newPlotMode); // Show/hide function plot box
    
    // When enabling plot mode, turn off complex mode and close complex plot
    if (newPlotMode) {
      setComplexMode(false);
      setShowComplexPlot(false);
      // Clear input when switching to plot mode
      setInput('');
      toast.info('Graph plot mode enabled - enter function to plot');
    } else {
      toast.info('Graph plot mode disabled');
    }
  };

  const handlePlotGraph = (expression, isComplex) => {
    // This function will be called when user clicks "Plot Graph" button
    if (!expression || expression.trim() === '') {
      toast.warn('Please enter an expression to plot');
      return;
    }
    
    // Increment trigger to notify PlotArea to plot
    setPlotTrigger(prev => prev + 1);
    
    // Show the appropriate plot box
    if (isComplex || complexMode) {
      setShowComplexPlot(true);
    } else {
      setShowPlot(true);
    }
  };

  // Watch complex mode changes
  useEffect(() => {
    if (complexMode) {
      // When complex mode is enabled, disable plot mode and show complex plot
      setPlotMode(false);
      setShowPlot(false);
      setShowComplexPlot(true);
      // Clear input when switching to complex mode
      setInput('');
    } else {
      // When complex mode is disabled, hide complex plot
      setShowComplexPlot(false);
    }
  }, [complexMode]);

  // Matrix operation handlers
  const handleMatrixOperation = (operation) => {
    try {
      const currentInput = input.trim();
      
      // Handle equals (=) - complete pending operation
      if (operation === '=') {
        if (!firstMatrix || !matrixOperation) {
          toast.warn('No pending matrix operation to complete');
          return;
        }
        
        if (!currentInput) {
          toast.warn('Please enter the second matrix');
          return;
        }
        
        const secondMatrix = parseMatrix(currentInput);
        
        // Validate dimensions for the operation
        const size1 = firstMatrix.matrix.size();
        const size2 = secondMatrix.size();
        
        if (matrixOperation === 'MatMul') {
          if (size1[1] !== size2[0]) {
            toast.error(`Matrix multiplication error: First matrix columns (${size1[1]}) must equal second matrix rows (${size2[0]})`);
            return;
          }
        } else if (matrixOperation === 'MatAdd' || matrixOperation === 'MatSub') {
          if (size1[0] !== size2[0] || size1[1] !== size2[1]) {
            toast.error(`Matrix ${matrixOperation === 'MatAdd' ? 'addition' : 'subtraction'} error: Matrices must have same dimensions (${size1[0]}x${size1[1]} vs ${size2[0]}x${size2[1]})`);
            return;
          }
        }
        
        // Perform the operation
        const result = performMatrixOperation(matrixOperation, firstMatrix.matrix, secondMatrix);
        const formatted = formatMatrix(result);
        
        setInput(formatted);
        pushHistory(`${firstMatrix.input} ${matrixOperation} ${currentInput}`, formatted);
        
        // Clear the operation state
        setFirstMatrix(null);
        setMatrixOperation(null);
        
        toast.success(`${matrixOperation} completed successfully!`);
        return;
      }
      
      // If it's a unary operation (Det, Transpose), execute immediately
      if (operation === 'Det' || operation === 'Transpose') {
        if (!currentInput) {
          toast.warn('Please enter a matrix first');
          return;
        }
        
        const matrix = parseMatrix(currentInput);
        
        // Additional validation for determinant (must be square matrix)
        if (operation === 'Det') {
          const size = matrix.size();
          if (size[0] !== size[1]) {
            toast.error('Determinant requires a square matrix');
            return;
          }
        }
        
        const result = performMatrixOperation(operation, matrix);
        const formatted = formatMatrix(result);
        setInput(formatted);
        pushHistory(`${operation}(${currentInput})`, formatted);
        toast.success(`${operation} calculated successfully`);
        return;
      }
      
      // For binary operations (MatMul, MatAdd, MatSub)
      if (!firstMatrix) {
        // First step: Store the first matrix
        if (!currentInput) {
          toast.warn('Please enter the first matrix');
          return;
        }
        
        const matrix = parseMatrix(currentInput);
        setFirstMatrix({ matrix, input: currentInput });
        setMatrixOperation(operation);
        setInput(''); // Clear input for second matrix
        toast.info(`${operation} - Now enter the second matrix and press "="`);
      } else {
        // Second step: User clicked another operation, complete the pending operation first
        if (!currentInput) {
          toast.warn('Please enter the second matrix');
          return;
        }
        
        const secondMatrix = parseMatrix(currentInput);
        
        // Validate dimensions for the operation
        const size1 = firstMatrix.matrix.size();
        const size2 = secondMatrix.size();
        
        if (matrixOperation === 'MatMul') {
          // For multiplication: columns of first must equal rows of second
          if (size1[1] !== size2[0]) {
            toast.error(`Matrix multiplication error: First matrix columns (${size1[1]}) must equal second matrix rows (${size2[0]})`);
            return;
          }
        } else if (matrixOperation === 'MatAdd' || matrixOperation === 'MatSub') {
          // For addition/subtraction: dimensions must match exactly
          if (size1[0] !== size2[0] || size1[1] !== size2[1]) {
            toast.error(`Matrix ${matrixOperation === 'MatAdd' ? 'addition' : 'subtraction'} error: Matrices must have same dimensions (${size1[0]}x${size1[1]} vs ${size2[0]}x${size2[1]})`);
            return;
          }
        }
        
        // Perform the pending operation
        const result = performMatrixOperation(matrixOperation, firstMatrix.matrix, secondMatrix);
        const formatted = formatMatrix(result);
        
        pushHistory(`${firstMatrix.input} ${matrixOperation} ${currentInput}`, formatted);
        
        // Start new operation chain with result as first matrix
        setInput('');
        setFirstMatrix({ matrix: result, input: formatted });
        setMatrixOperation(operation);
        toast.success(`${matrixOperation} completed! ${operation} started - Enter second matrix and press "="`);
      }
    } catch (error) {
      toast.error(error.message || 'Matrix operation failed');
      console.error('Matrix operation error:', error);
    }
  };

  const handleMatrixClear = () => {
    setFirstMatrix(null);
    setMatrixOperation(null);
    setInput('');
    toast.info('Matrix operation cleared');
  };

  // Render
  return (
    <div className="h-screen bg-gray-900 relative">
      {/* Profile top-right */}
      <div className="absolute top-2 right-2">
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-white font-medium"
          >
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {user?.username || 'User'}
            {' '}
            <span>▼</span>
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded shadow-md flex flex-col z-50">
              <div className="text-white p-2 border-b border-gray-600">{user?.fullName}</div>
              
              {/* Admin Dashboard Link - Only for admin users */}
              {user?.isAdmin && (
                <button
                  onClick={() => {
                    // Navigate to admin dashboard using react router
                    navigate('/admin');
                  }}
                  className="text-white p-2 hover:bg-purple-600 rounded text-left"
                >
                   Admin Dashboard
                </button>
              )}
              
              <button
                onClick={() => {
                  onSignOut();
                  toast.info('Signed out successfully');
                }}
                className="text-white p-2 hover:bg-red-600 rounded"
              >
                Sign Out
              </button>
              <div className="flex gap-2 p-2">
                <label className="text-white text-sm">Mode:</label>
                <select 
                  value={angleMode} 
                  onChange={(e) => {
                    setAngleMode(e.target.value);
                    toast.info(`Angle mode set to ${e.target.value === 'rad' ? 'Radians' : 'Degrees'}`);
                  }} 
                  className="bg-gray-600 text-white p-1 rounded"
                >
                  <option value="rad">Radians</option>
                  <option value="deg">Degrees</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main calculator area centered */}
      <div className="flex flex-1 justify-center items-start pt-16 gap-6 px-2">
        {/* Calculator column */}
        <div className="flex flex-col items-center gap-4">
          <CalculatorInput
            inputRef={inputRef}
            handlePlot={handlePlot}
            input={input}
            angleMode={angleMode}
            setInput={setInput}
            setHistory={setHistory}
            setLastAnswer={setLastAnswer}
            setShowPlot={setShowPlot}
            lastAnswer={lastAnswer}
            pushHistory={pushHistory}
            setShowMatrixModal={setShowMatrixModal}
            mlParamMode={mlParamMode}
            setMlParamMode={setMlParamMode}
            showMLMode={showMLMode}
            startParamSequence={startParamSequence}
            setShowMLMode={setShowMLMode}
            history={history}
            showPlot={plotMode || complexMode}
            plotMode={plotMode}
            onPlotGraph={handlePlotGraph}
            complexMode={complexMode}
            setComplexMode={setComplexMode}
            matrixMode={matrixMode}
            setMatrixMode={setMatrixMode}
            onMatrixOperation={handleMatrixOperation}
            matrixOperation={matrixOperation}
            firstMatrix={firstMatrix}
            onMatrixClear={handleMatrixClear}
          />
        </div>

        {/* Side panel: Plot, History, and ML compact controls below history */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            {/* Function Plot Area */}
            {showPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={(show) => {
                  setShowPlot(show);
                  if (!show) setPlotMode(false); // Also disable plot mode when closing
                }}
                angleMode={angleMode}
                calculatorInput={input}
                complexMode={false}
                onPlotTrigger={plotTrigger}
              />
            )}
            
            {/* Complex Plot Area */}
            {showComplexPlot && (
              <PlotArea
                plotWidth={plotWidth}
                setPlotWidth={setPlotWidth}
                plotHeight={plotHeight}
                setPlotHeight={setPlotHeight}
                setShowPlot={(show) => {
                  setShowComplexPlot(show);
                  if (!show) setComplexMode(false); // Also disable complex mode when closing
                }}
                angleMode={angleMode}
                calculatorInput={input}
                complexMode={true}
                onPlotTrigger={plotTrigger}
              />
            )}

            <div className="bg-gray-800 rounded p-3 shadow-md w-64">
              <h3 className="text-white font-semibold text-sm mb-2">History</h3>
              <div className="flex flex-col gap-1 overflow-y-auto text-sm font-mono text-white max-h-96">
                {history.length === 0 && <div className="text-gray-400">No history</div>}
                {history.map((item, i) => (
                  <div 
                    key={i + item} 
                    onClick={() => handleHistoryClick(item)} 
                    className="cursor-pointer hover:bg-gray-700 p-1 rounded"
                    title="Click to load this expression"
                  >
                    {item}
                  </div>
                ))}
              </div>

              

             
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Modal */}
      <MatrixModal
        show={showMatrixModal}
        onClose={() => {
          setShowMatrixModal(false);
          toast.info('Matrix modal closed');
        }}
        onResult={handleMatrixResult}
        initialInput={input}
      />
    </div>
  );
}