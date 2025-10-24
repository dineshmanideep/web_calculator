import React from 'react';
import {
  optimalPaddingStride, convOutputShape, receptiveField, paramCount, flopsCount, bestFit, optimalThreshold, estimateLearningRate, optimizeWeights, featureImportance,
} from '../utils/mathEngine';

export default function MLCompactColumns({
  startParamSequence, pushHistory, setInput, mlSize = 'md',
}) {
  const sizeClass = mlSize === 'sm' ? 'py-1 text-xs' : mlSize === 'lg' ? 'py-2 text-sm' : 'py-1.5 text-sm';
  const start = (specs, handler, label) => {
    startParamSequence && startParamSequence(specs, (values) => {
      // handler processes values and returns result
      const out = handler(values);
      const txt = typeof out === 'string' ? out : JSON.stringify(out);
      setInput && setInput(String(txt));
      pushHistory && pushHistory(label || 'ML', txt);
    }, label);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-800 p-2 rounded shadow-md flex flex-col items-center" style={{ width: 96 }}>
        <button
          title={'Example: H=32 (enter 32 then =)\nW=32\nK=3'}
          className={`w-full bg-green-600 text-white ${sizeClass} rounded mb-1`}
          onClick={() => {
            start([
              'H', 'W', 'K',
            ], (vals) => {
              const [H, W, K] = vals.map(Number);
              return optimalPaddingStride(H, W, K);
            }, 'Best P/S');
          }}
        >
          Best P/S
        </button>

        <button
          title="Format: H=32 then =, W=32, K=3, P=1, S=1"
          className={`w-full bg-blue-600 text-white ${sizeClass} rounded mb-1`}
          onClick={() => {
            start(['H', 'W', 'K', 'P', 'S'], (vals) => {
              const [H, W, K, P, S] = vals.map(Number);
              return convOutputShape({
                H_in: H, W_in: W, K, P, S,
              });
            }, 'Out');
          }}
        >
          Out
        </button>

        <button
          title="kernel_size=3, stride=1 or stride=1,2,1, num_layers=3"
          className={`w-full bg-indigo-600 text-white ${sizeClass} rounded mb-1`}
          onClick={() => {
            // RF: kernel_size, stride, num_layers. stride may be comma list -> use raw parse
            start([{ name: 'kernel_size' }, { name: 'stride', parse: 'raw' }, { name: 'num_layers' }], (vals) => {
              const k = Number(vals[0]);
              let stride = vals[1];
              if (typeof stride === 'string' && stride.includes(',')) stride = stride.split(',').map((x) => Number(x.trim()));
              else stride = Number(stride);
              const L = Number(vals[2]);
              return receptiveField({ kernel_size: k, stride, num_layers: L });
            }, 'RF');
          }}
        >
          RF
        </button>

        <button
          title="inCh=32, outCh=64, kernel=3"
          className={`w-full bg-yellow-600 text-white ${sizeClass} rounded`}
          onClick={() => {
            // params: inCh,outCh,kernel
            start(['inCh', 'outCh', 'kernel'], (vals) => {
              const [inCh, outCh, k] = vals.map(Number);
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
          title={'x=1,2,3 (comma list)\ny=2,4,6'}
          className={`w-full bg-purple-600 text-white ${sizeClass} rounded mt-2`}
          onClick={() => {
            // Best-Fit: x list, y list (raw)
            start([{ name: 'x', parse: 'raw' }, { name: 'y', parse: 'raw' }], (vals) => {
              const parseNums = (s) => (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));
              const xs = parseNums(vals[0]); const ys = parseNums(vals[1]);
              return bestFit(xs, ys);
            }, 'BestFit');
          }}
        >
          BestFit
        </button>

        <button
          title="scores=0.1,0.9,0.6 ; labels=0,1,1"
          className={`w-full bg-pink-600 text-white ${sizeClass} rounded mt-1`}
          onClick={() => {
            // Threshold: scores raw, labels raw
            start([{ name: 'scores', parse: 'raw' }, { name: 'labels', parse: 'raw' }], (vals) => {
              const parseNums = (s) => (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));
              const scores = parseNums(vals[0]); const labels = parseNums(vals[1]);
              return optimalThreshold(scores, labels, 'f1');
            }, 'Threshold');
          }}
        >
          Thresh
        </button>

        <button
          title="losses=0.9,0.8,0.85 ; steps=0.001,0.01,0.1"
          className={`w-full bg-teal-600 text-white ${sizeClass} rounded mt-1`}
          onClick={() => {
            // LR estimator: losses raw, steps raw
            start([{ name: 'losses', parse: 'raw' }, { name: 'steps', parse: 'raw' }], (vals) => {
              const parseNums = (s) => (s || '').split(',').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));
              const losses = parseNums(vals[0]); const steps = parseNums(vals[1]);
              return estimateLearningRate(losses, steps);
            }, 'LR Estimator');
          }}
        >
          LR
        </button>

        <button
          title="Xs: col1;col2 e.g. 1,2,3;2,4,6 and Y: 3,6,9"
          className={`w-full bg-gray-600 text-white ${sizeClass} rounded mt-1`}
          onClick={() => {
            // Weight optimizer: Xs raw (columns separated by ';'), Y raw
            start([{ name: 'Xs', parse: 'raw' }, { name: 'Y', parse: 'raw' }], (vals) => {
              const parseCols = (s) => {
                if (!s) return [];
                if (s.includes(';')) return s.split(';').map((col) => col.split(',').map((x) => Number(x.trim())));
                // single column
                return [s.split(',').map((x) => Number(x.trim()))];
              };
              const Xs = parseCols(vals[0]);
              const Y = (vals[1] || '').split(',').map((x) => Number(x.trim()));
              return optimizeWeights(Xs, Y);
            }, 'WeightOpt');
          }}
        >
          WOpt
        </button>

        <button
          title="features rows: f1,f2;f1,f2 e.g. 1,2;2,3 and target: 3,5"
          className={`w-full bg-indigo-400 text-white ${sizeClass} rounded mt-1`}
          onClick={() => {
            // Feature importance: features rows separated by ';' (each row comma-separated), target raw
            start([{ name: 'features', parse: 'raw' }, { name: 'target', parse: 'raw' }], (vals) => {
              const featRows = (vals[0] || '').split(';').map((r) => r.split(',').map((x) => Number(x.trim())));
              const target = (vals[1] || '').split(',').map((x) => Number(x.trim()));
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