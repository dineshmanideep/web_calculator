import React from 'react';
import { toast } from 'react-toastify';
import {
  optimalPaddingStride, convOutputShape, receptiveField, paramCount, flopsCount, bestFit, optimalThreshold, estimateLearningRate, optimizeWeights, featureImportance,
} from '../utils/mathEngine';

export default function MLCompactColumns({
  startParamSequence, pushHistory, setInput, mlSize = 'md',
}) {
  const sizeClass = mlSize === 'sm' ? 'py-1 text-xs' : mlSize === 'lg' ? 'py-2 text-sm' : 'py-1.5 text-sm';
  
  const start = (specs, handler, label) => {
    if (!startParamSequence) {
      toast.error('Parameter sequence function not available');
      return;
    }

    startParamSequence(specs, (values) => {
      try {
        // Validate all values are present
        if (values.some(v => v === undefined || v === null || v === '')) {
          toast.error('All parameters must be provided');
          return;
        }

        // handler processes values and returns result
        const out = handler(values);
        const txt = typeof out === 'string' ? out : JSON.stringify(out);
        
        if (setInput) setInput(String(txt));
        if (pushHistory) pushHistory(label || 'ML', txt);
        
        toast.success(`${label} computed successfully`);
      } catch (error) {
        toast.error(`${label} failed: ${error.message}`);
        console.error(`${label} error:`, error);
      }
    }, label);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-800 p-2 rounded shadow-md flex flex-col items-center" style={{ width: 96 }}>
        <button
          title={'Optimal Padding & Stride\nExample: H=32, W=32, K=3'}
          className={`w-full bg-green-600 text-white ${sizeClass} rounded mb-1 hover:bg-green-500`}
          onClick={() => {
            start([
              'H', 'W', 'K',
            ], (vals) => {
              const [H, W, K] = vals.map(Number);
              
              if (isNaN(H) || isNaN(W) || isNaN(K)) {
                toast.error('H, W, and K must be valid numbers');
                throw new Error('Invalid input');
              }
              if (H <= 0 || W <= 0 || K <= 0) {
                toast.error('H, W, and K must be positive');
                throw new Error('Invalid input');
              }
              
              return optimalPaddingStride(H, W, K);
            }, 'Best P/S');
          }}
        >
          Best P/S
        </button>

        <button
          title="Convolution Output Shape\nFormat: H=32, W=32, K=3, P=1, S=1"
          className={`w-full bg-blue-600 text-white ${sizeClass} rounded mb-1 hover:bg-blue-500`}
          onClick={() => {
            start(['H', 'W', 'K', 'P', 'S'], (vals) => {
              const [H, W, K, P, S] = vals.map(Number);
              
              if (vals.some(v => isNaN(Number(v)))) {
                toast.error('All parameters must be valid numbers');
                throw new Error('Invalid input');
              }
              if (H <= 0 || W <= 0 || K <= 0 || S <= 0) {
                toast.error('H, W, K, and S must be positive');
                throw new Error('Invalid input');
              }
              
              return convOutputShape({
                H_in: H, W_in: W, K, P, S,
              });
            }, 'Out');
          }}
        >
          Out
        </button>

        <button
          title="Receptive Field\nExample: kernel_size=3, stride=1, num_layers=3\nOr stride as list: 1,2,1"
          className={`w-full bg-indigo-600 text-white ${sizeClass} rounded mb-1 hover:bg-indigo-500`}
          onClick={() => {
            start([{ name: 'kernel_size' }, { name: 'stride', parse: 'raw' }, { name: 'num_layers' }], (vals) => {
              const k = Number(vals[0]);
              let stride = vals[1];
              
              if (isNaN(k) || k <= 0) {
                toast.error('Kernel size must be a positive number');
                throw new Error('Invalid kernel size');
              }
              
              if (typeof stride === 'string' && stride.includes(',')) {
                stride = stride.split(',').map((x) => Number(x.trim()));
                if (stride.some(s => isNaN(s) || s <= 0)) {
                  toast.error('All stride values must be positive numbers');
                  throw new Error('Invalid stride');
                }
              } else {
                stride = Number(stride);
                if (isNaN(stride) || stride <= 0) {
                  toast.error('Stride must be a positive number');
                  throw new Error('Invalid stride');
                }
              }
              
              const L = Number(vals[2]);
              if (isNaN(L) || L <= 0) {
                toast.error('Number of layers must be a positive number');
                throw new Error('Invalid num_layers');
              }
              
              return receptiveField({ kernel_size: k, stride, num_layers: L });
            }, 'RF');
          }}
        >
          RF
        </button>

        <button
          title="Parameter Count & FLOPs\nExample: inCh=32, outCh=64, kernel=3"
          className={`w-full bg-yellow-600 text-white ${sizeClass} rounded hover:bg-yellow-500`}
          onClick={() => {
            start(['inCh', 'outCh', 'kernel'], (vals) => {
              const [inCh, outCh, k] = vals.map(Number);
              
              if (vals.some(v => isNaN(Number(v)))) {
                toast.error('All parameters must be valid numbers');
                throw new Error('Invalid input');
              }
              if (inCh <= 0 || outCh <= 0 || k <= 0) {
                toast.error('All parameters must be positive');
                throw new Error('Invalid input');
              }
              
              const params = paramCount({ in_channels: inCh, out_channels: outCh, kernel_size: k });
              const out = convOutputShape({
                H_in: 1, W_in: 1, K: k, P: 0, S: 1,
              });
              const fl = flopsCount({
                in_channels: inCh, out_channels: outCh, kernel_size: k, H_out: out.H_out, W_out: out.W_out,
              });
              return { params, flops: fl };
            }, 'Params');
          }}
        >
          Params
        </button>

        <button
          title={'Best-Fit Curve\nExample:\nx=1,2,3,4,5\ny=2,4,6,8,10'}
          className={`w-full bg-purple-600 text-white ${sizeClass} rounded mt-2 hover:bg-purple-500`}
          onClick={() => {
            start([{ name: 'x', parse: 'raw' }, { name: 'y', parse: 'raw' }], (vals) => {
              const parseNums = (s) => {
                if (!s || s.trim() === '') {
                  toast.error('Input cannot be empty');
                  throw new Error('Empty input');
                }
                const nums = (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !isNaN(x));
                if (nums.length === 0) {
                  toast.error('No valid numbers found in input');
                  throw new Error('No valid numbers');
                }
                return nums;
              };
              
              const xs = parseNums(vals[0]); 
              const ys = parseNums(vals[1]);
              
              if (xs.length !== ys.length) {
                toast.error(`X and Y must have same length (X: ${xs.length}, Y: ${ys.length})`);
                throw new Error('Length mismatch');
              }
              if (xs.length < 2) {
                toast.error('Need at least 2 data points');
                throw new Error('Insufficient data');
              }
              
              return bestFit(xs, ys);
            }, 'BestFit');
          }}
        >
          BestFit
        </button>

        <button
          title="Optimal Threshold\nExample:\nscores=0.1,0.9,0.6,0.8\nlabels=0,1,1,1"
          className={`w-full bg-pink-600 text-white ${sizeClass} rounded mt-1 hover:bg-pink-500`}
          onClick={() => {
            start([{ name: 'scores', parse: 'raw' }, { name: 'labels', parse: 'raw' }], (vals) => {
              const parseNums = (s) => {
                if (!s || s.trim() === '') {
                  toast.error('Input cannot be empty');
                  throw new Error('Empty input');
                }
                const nums = (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !isNaN(x));
                if (nums.length === 0) {
                  toast.error('No valid numbers found');
                  throw new Error('No valid numbers');
                }
                return nums;
              };
              
              const scores = parseNums(vals[0]); 
              const labels = parseNums(vals[1]);
              
              if (scores.length !== labels.length) {
                toast.error(`Scores and labels must have same length (scores: ${scores.length}, labels: ${labels.length})`);
                throw new Error('Length mismatch');
              }
              if (scores.length === 0) {
                toast.error('Need at least one data point');
                throw new Error('Empty data');
              }
              
              // Validate labels are binary
              if (labels.some(l => l !== 0 && l !== 1)) {
                toast.error('Labels must be binary (0 or 1)');
                throw new Error('Invalid labels');
              }
              
              return optimalThreshold(scores, labels, 'f1');
            }, 'Threshold');
          }}
        >
          Thresh
        </button>

        <button
          title="Learning Rate Estimator\nExample:\nlosses=0.9,0.8,0.7,0.85\nsteps=0.001,0.01,0.1,1.0"
          className={`w-full bg-teal-600 text-white ${sizeClass} rounded mt-1 hover:bg-teal-500`}
          onClick={() => {
            start([{ name: 'losses', parse: 'raw' }, { name: 'steps', parse: 'raw' }], (vals) => {
              const parseNums = (s) => {
                if (!s || s.trim() === '') {
                  toast.error('Input cannot be empty');
                  throw new Error('Empty input');
                }
                const nums = (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !isNaN(x));
                if (nums.length === 0) {
                  toast.error('No valid numbers found');
                  throw new Error('No valid numbers');
                }
                return nums;
              };
              
              const losses = parseNums(vals[0]); 
              const steps = parseNums(vals[1]);
              
              if (losses.length !== steps.length) {
                toast.error(`Losses and steps must have same length (losses: ${losses.length}, steps: ${steps.length})`);
                throw new Error('Length mismatch');
              }
              if (losses.length === 0) {
                toast.error('Need at least one data point');
                throw new Error('Empty data');
              }
              if (steps.some(s => s <= 0)) {
                toast.error('All learning rate steps must be positive');
                throw new Error('Invalid steps');
              }
              
              return estimateLearningRate(losses, steps);
            }, 'LR Estimator');
          }}
        >
          LR
        </button>

        <button
          title="Weight Optimizer\nExample:\nXs: 1,2,3;2,4,6 (columns separated by ;)\nY: 3,6,9"
          className={`w-full bg-gray-600 text-white ${sizeClass} rounded mt-1 hover:bg-gray-500`}
          onClick={() => {
            start([{ name: 'Xs', parse: 'raw' }, { name: 'Y', parse: 'raw' }], (vals) => {
              const parseCols = (s) => {
                if (!s || s.trim() === '') {
                  toast.error('Xs input cannot be empty');
                  throw new Error('Empty Xs');
                }
                
                if (s.includes(';')) {
                  const cols = s.split(';').map((col) => {
                    const nums = col.split(',').map((x) => Number(x.trim()));
                    if (nums.some(n => isNaN(n))) {
                      toast.error('All Xs values must be valid numbers');
                      throw new Error('Invalid Xs values');
                    }
                    return nums;
                  });
                  
                  // Validate all columns have same length
                  const len = cols[0].length;
                  if (cols.some(col => col.length !== len)) {
                    toast.error('All Xs columns must have same length');
                    throw new Error('Xs column length mismatch');
                  }
                  return cols;
                }
                // single column
                const nums = s.split(',').map((x) => Number(x.trim()));
                if (nums.some(n => isNaN(n))) {
                  toast.error('All Xs values must be valid numbers');
                  throw new Error('Invalid Xs values');
                }
                return [nums];
              };
              
              const Xs = parseCols(vals[0]);
              
              if (!vals[1] || vals[1].trim() === '') {
                toast.error('Y input cannot be empty');
                throw new Error('Empty Y');
              }
              
              const Y = (vals[1] || '').split(',').map((x) => Number(x.trim()));
              if (Y.some(n => isNaN(n))) {
                toast.error('All Y values must be valid numbers');
                throw new Error('Invalid Y values');
              }
              
              if (Y.length !== Xs[0].length) {
                toast.error(`Y length (${Y.length}) must match Xs rows (${Xs[0].length})`);
                throw new Error('Length mismatch');
              }
              
              return optimizeWeights(Xs, Y);
            }, 'WeightOpt');
          }}
        >
          WOpt
        </button>

        <button
          title="Feature Importance\nExample:\nfeatures: 1,2;2,3;3,4 (rows separated by ;)\ntarget: 3,5,7"
          className={`w-full bg-indigo-400 text-white ${sizeClass} rounded mt-1 hover:bg-indigo-300`}
          onClick={() => {
            start([{ name: 'features', parse: 'raw' }, { name: 'target', parse: 'raw' }], (vals) => {
              if (!vals[0] || vals[0].trim() === '') {
                toast.error('Features input cannot be empty');
                throw new Error('Empty features');
              }
              
              const featRows = (vals[0] || '').split(';').map((r) => {
                const nums = r.split(',').map((x) => Number(x.trim()));
                if (nums.some(n => isNaN(n))) {
                  toast.error('All feature values must be valid numbers');
                  throw new Error('Invalid feature values');
                }
                return nums;
              });
              
              // Validate all rows have same number of features
              const numFeatures = featRows[0].length;
              if (featRows.some(row => row.length !== numFeatures)) {
                toast.error('All feature rows must have same number of features');
                throw new Error('Feature count mismatch');
              }
              
              if (!vals[1] || vals[1].trim() === '') {
                toast.error('Target input cannot be empty');
                throw new Error('Empty target');
              }
              
              const target = (vals[1] || '').split(',').map((x) => Number(x.trim()));
              if (target.some(n => isNaN(n))) {
                toast.error('All target values must be valid numbers');
                throw new Error('Invalid target values');
              }
              
              if (target.length !== featRows.length) {
                toast.error(`Target length (${target.length}) must match number of feature rows (${featRows.length})`);
                throw new Error('Length mismatch');
              }
              
              return featureImportance(featRows, target);
            }, 'FeatureImp');
          }}
        >
          FeatImp
        </button>
      </div>
    </div>
  );
}