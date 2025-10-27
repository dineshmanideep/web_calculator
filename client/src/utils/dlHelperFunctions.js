import { toast } from 'react-toastify';

// ---------------- ML / Conv helper utilities (ML mode) ----------------

// small numeric helpers
const mean = (arr) => {
  if (!arr || arr.length === 0) {
    toast.error('Cannot calculate mean of empty array');
    throw new Error('Empty array');
  }
  return arr.reduce((s, v) => s + v, 0) / arr.length;
};

const dot = (a, b) => {
  if (!a || !b || a.length !== b.length) {
    toast.error('Dot product requires arrays of equal length');
    throw new Error('Array length mismatch');
  }
  return a.reduce((s, v, i) => s + v * b[i], 0);
};

const transpose = (m) => {
  try {
    if (!m || m.length === 0 || !m[0]) {
      toast.error('Cannot transpose empty matrix');
      throw new Error('Empty matrix');
    }
    return m[0].map((_, i) => m.map((r) => r[i]));
  } catch (error) {
    toast.error('Matrix transpose failed');
    throw error;
  }
};

// solve linear system Ax=b using Gaussian elimination with partial pivoting
function solveLinearSystem(aIn, bIn) {
  try {
    if (!aIn || !bIn || aIn.length === 0 || bIn.length === 0) {
      toast.error('Cannot solve empty linear system');
      throw new Error('Empty system');
    }

    if (aIn.length !== bIn.length) {
      toast.error('Linear system dimensions mismatch');
      throw new Error('Dimension mismatch');
    }

    const n = aIn.length;
    const A = aIn.map((r) => r.slice());
    const b = bIn.slice();

    for (let i = 0; i < n; i += 1) {
      // pivot
      let maxRow = i; let maxVal = Math.abs(A[i][i]);
      for (let r = i + 1; r < n; r += 1) {
        if (Math.abs(A[r][i]) > maxVal) {
          maxVal = Math.abs(A[r][i]);
          maxRow = r;
        }
      }
      if (maxRow !== i) {
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];
      }

      const pivot = A[i][i];
      if (Math.abs(pivot) < 1e-12) {
        toast.error('Linear system is singular or near-singular (no unique solution)');
        throw new Error('Singular matrix');
      }

      if (Math.abs(pivot) >= 1e-12) {
        for (let r = i + 1; r < n; r += 1) {
          const factor = A[r][i] / pivot;
          for (let c = i; c < n; c += 1) A[r][c] -= factor * A[i][c];
          b[r] -= factor * b[i];
        }
      }
    }

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = b[i];
      for (let j = i + 1; j < n; j += 1) s -= A[i][j] * x[j];
      x[i] = Math.abs(A[i][i]) < 1e-12 ? 0 : s / A[i][i];

      if (!isFinite(x[i])) {
        toast.error('Linear system solution resulted in infinite values');
        throw new Error('Infinite solution');
      }
    }
    return x;
  } catch (error) {
    if (!error.message.includes('Linear system') && !error.message.includes('singular')) {
      toast.error('Failed to solve linear system');
    }
    throw error;
  }
}

// 1) Optimal Padding & Stride Finder
export function optimalPaddingStride(hIn, wIn, k, opts = {}) {
  try {
    if (!hIn || !wIn || !k || hIn <= 0 || wIn <= 0 || k <= 0) {
      toast.error('Invalid input: Height, Width, and Kernel must be positive numbers');
      throw new Error('Invalid input parameters');
    }

    if (!Number.isInteger(hIn) || !Number.isInteger(wIn) || !Number.isInteger(k)) {
      toast.error('Height, Width, and Kernel must be integers');
      throw new Error('Non-integer input');
    }

    if (k > Math.max(hIn, wIn)) {
      toast.error(`Kernel size (${k}) cannot be larger than input dimensions (${hIn}×${wIn})`);
      throw new Error('Kernel too large');
    }

    const maxP = opts.maxP != null ? opts.maxP : Math.max(0, Math.floor(k / 2) + 1);
    const maxS = opts.maxS != null ? opts.maxS : Math.max(1, k);
    const best = { score: -Infinity };

    for (let p = 0; p <= maxP; p += 1) {
      for (let s = 1; s <= maxS; s += 1) {
        const hOut = Math.floor((hIn + 2 * p - k) / s) + 1;
        const wOut = Math.floor((wIn + 2 * p - k) / s) + 1;
        if (hOut <= 0 || wOut <= 0) continue;

        const retention = (hOut * wOut) / (hIn * wIn);
        const sizeDiff = Math.abs(hOut - hIn) + Math.abs(wOut - wIn);
        const sizeMatch = 1 - sizeDiff / (hIn + wIn);
        const sizeMatchClamped = Math.max(0, sizeMatch);
        const strideScore = 1 / s;
        const rfCoverage = Math.min(1, k / Math.max(1, Math.min(hIn, wIn)));
        const borderLoss = Math.abs(hIn - (hOut * s)) + Math.abs(wIn - (wOut * s));
        const borderLossNorm = borderLoss / (hIn + wIn);

        const w_ret = 0.6;
        const w_size = 0.25;
        const w_stride = 0.1;
        const w_border = 0.05;

        const score = w_ret * retention + w_size * sizeMatchClamped + w_stride * strideScore - w_border * borderLossNorm + 0.0001 * p;

        if (score > best.score) {
          best.score = score;
          best.p = p; best.s = s; best.retention = retention * 100;
          best.H_out = hOut; best.W_out = wOut; best.sizeMatch = sizeMatchClamped;
          best.borderLoss = borderLoss;
        }
      }
    }

    if (best.score === -Infinity) {
      toast.error('Could not find valid padding/stride combination');
      throw new Error('No valid solution');
    }

    return {
      best_padding: best.p ?? 0,
      best_stride: best.s ?? 1,
      info_retention_percent: Number(((best.retention) || 0).toFixed(3)),
      output_size: [best.H_out || 0, best.W_out || 0],
      size_match: Number(((best.sizeMatch || 0) * 100).toFixed(3)),
      border_loss: best.borderLoss || 0,
    };
  } catch (error) {
    if (!error.message.includes('Invalid input') && !error.message.includes('Kernel')) {
      toast.error(`Padding/Stride Error: ${error.message}`);
    }
    throw error;
  }
}

// 2) Receptive Field Calculator
export function receptiveField(options = {}) {
  try {
    const {
      kernel_size: kernelSize = 3,
      stride = 1,
      num_layers: numLayers = 1,
    } = options;

    if (kernelSize <= 0 || numLayers <= 0) {
      toast.error('Kernel size and number of layers must be positive');
      throw new Error('Invalid parameters');
    }

    if (!Number.isInteger(kernelSize) || !Number.isInteger(numLayers)) {
      toast.error('Kernel size and number of layers must be integers');
      throw new Error('Non-integer parameters');
    }

    const k = kernelSize;
    const L = numLayers;
    const sArr = Array.isArray(stride) ? stride.slice(0, L) : Array(L).fill(stride);

    // Validate strides
    if (sArr.some((s) => s <= 0 || !Number.isFinite(s))) {
      toast.error('All strides must be positive finite numbers');
      throw new Error('Invalid stride values');
    }

    let sum = 0;
    for (let i = 0; i < L; i += 1) {
      let prod = 1;
      for (let j = 0; j <= i - 1; j += 1) prod *= sArr[j];
      sum += prod;
    }
    const RF = 1 + (k - 1) * sum;

    if (!isFinite(RF) || RF <= 0) {
      toast.error('Receptive field calculation resulted in invalid value');
      throw new Error('Invalid RF value');
    }

    return RF;
  } catch (error) {
    if (!error.message.includes('Kernel size') && !error.message.includes('stride')) {
      toast.error(`Receptive Field Error: ${error.message}`);
    }
    throw error;
  }
}

// 3) Parameter Count Estimator
export function paramCount({ in_channels = 1, out_channels = 1, kernel_size = 1 } = {}) {
  try {
    if (in_channels <= 0 || out_channels <= 0 || kernel_size <= 0) {
      toast.error('Channels and kernel size must be positive numbers');
      throw new Error('Invalid parameters');
    }

    if (!Number.isInteger(in_channels) || !Number.isInteger(out_channels) || !Number.isInteger(kernel_size)) {
      toast.error('Channels and kernel size must be integers');
      throw new Error('Non-integer parameters');
    }

    const inChannels = in_channels;
    const outChannels = out_channels;
    const kernelSize = kernel_size;
    const k2 = kernelSize * kernelSize;
    const params = inChannels * outChannels * k2 + outChannels;

    if (!isFinite(params) || params < 0) {
      toast.error('Parameter count calculation resulted in invalid value');
      throw new Error('Invalid parameter count');
    }

    return params;
  } catch (error) {
    if (!error.message.includes('Channels') && !error.message.includes('kernel')) {
      toast.error(`Parameter Count Error: ${error.message}`);
    }
    throw error;
  }
}

// 4) Output Shape Calculator for Convs
export function convOutputShape(options = {}) {
  try {
    const {
      H_in: hIn, W_in: wIn, K: k, P = 0, S = 1,
    } = options;

    if (!hIn || !wIn || !k || hIn <= 0 || wIn <= 0 || k <= 0 || S <= 0) {
      toast.error('Invalid convolution parameters: All values must be positive');
      throw new Error('Invalid parameters');
    }

    if (!Number.isInteger(hIn) || !Number.isInteger(wIn) || !Number.isInteger(k) || !Number.isInteger(S)) {
      toast.error('Height, Width, Kernel, and Stride must be integers');
      throw new Error('Non-integer parameters');
    }

    if (P < 0) {
      toast.error('Padding cannot be negative');
      throw new Error('Negative padding');
    }

    const hOut = Math.floor((hIn + 2 * P - k) / S) + 1;
    const wOut = Math.floor((wIn + 2 * P - k) / S) + 1;

    if (hOut <= 0 || wOut <= 0) {
      toast.error(`Output dimensions are invalid (${hOut}×${wOut}). Check your padding/stride values.`);
      throw new Error('Invalid output dimensions');
    }

    return { H_out: hOut, W_out: wOut };
  } catch (error) {
    if (!error.message.includes('Invalid convolution') && !error.message.includes('Output dimensions')) {
      toast.error(`Conv Output Error: ${error.message}`);
    }
    throw error;
  }
}

// 10) FLOPs Calculator
export function flopsCount(options = {}) {
  try {
    const {
      in_channels: inChannels = 1,
      out_channels: outChannels = 1,
      kernel_size: kernelSize = 1,
      H_out: hOut = 1,
      W_out: wOut = 1,
    } = options;

    if (inChannels <= 0 || outChannels <= 0 || kernelSize <= 0 || hOut <= 0 || wOut <= 0) {
      toast.error('All FLOPS parameters must be positive numbers');
      throw new Error('Invalid parameters');
    }

    if (!Number.isInteger(inChannels) || !Number.isInteger(outChannels)
        || !Number.isInteger(kernelSize) || !Number.isInteger(hOut) || !Number.isInteger(wOut)) {
      toast.error('All FLOPS parameters must be integers');
      throw new Error('Non-integer parameters');
    }

    const k2 = kernelSize * kernelSize;
    const flops = 2 * hOut * wOut * (inChannels * outChannels * k2);

    if (!isFinite(flops) || flops < 0) {
      toast.error('FLOPS calculation resulted in invalid value');
      throw new Error('Invalid FLOPS value');
    }

    return flops;
  } catch (error) {
    if (!error.message.includes('FLOPS')) {
      toast.error(`FLOPS Error: ${error.message}`);
    }
    throw error;
  }
}

// Helper: fit polynomial of degree d with normal equations, returns coeffs [c0,c1,...]
function _polyFit(x, y, degree) {
  try {
    if (!x || !y || x.length !== y.length || x.length === 0) {
      toast.error('Curve fitting requires equal-length non-empty arrays');
      throw new Error('Invalid input arrays');
    }

    if (x.length <= degree) {
      toast.error(`Need at least ${degree + 1} data points for degree ${degree} polynomial`);
      throw new Error('Insufficient data points');
    }

    const n = x.length;
    const m = degree + 1;
    const X = new Array(n).fill(0).map(() => new Array(m).fill(0));

    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < m; j += 1) {
        const val = x[i] ** j;
        if (!isFinite(val)) {
          toast.error('Curve fitting resulted in numerical overflow');
          throw new Error('Numerical overflow in polynomial fit');
        }
        X[i][j] = val;
      }
    }

    const Xt = transpose(X);
    const XtX = Xt.map((r) => r.map((_, c) => dot(r, X.map((row) => row[c]))));
    const Xty = Xt.map((r) => dot(r, y));
    const coeffs = solveLinearSystem(XtX, Xty);

    if (coeffs.some((c) => !isFinite(c))) {
      toast.error('Curve fitting produced invalid coefficients');
      throw new Error('Invalid coefficients');
    }

    return coeffs;
  } catch (error) {
    if (!error.message.includes('Curve fitting') && !error.message.includes('data points')) {
      toast.error('Polynomial fitting failed');
    }
    throw error;
  }
}

function _predictPoly(coeffs, xArr) {
  return xArr.map((xv) => {
    const result = coeffs.reduce((s, c, i) => s + c * xv ** i, 0);
    if (!isFinite(result)) {
      toast.error('Polynomial prediction resulted in overflow');
      throw new Error('Prediction overflow');
    }
    return result;
  });
}

function _r2(yArr, yPred) {
  try {
    if (yArr.length !== yPred.length) {
      throw new Error('Array length mismatch in R² calculation');
    }

    const ym = mean(yArr);
    const ssRes = yArr.reduce((s, v, i) => s + (v - yPred[i]) ** 2, 0);
    const ssTot = yArr.reduce((s, v) => s + (v - ym) ** 2, 0);

    if (!isFinite(ssRes) || !isFinite(ssTot)) {
      toast.error('R² calculation resulted in numerical issues');
      throw new Error('R² calculation error');
    }

    return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  } catch (error) {
    toast.error('R² calculation failed');
    throw error;
  }
}

// Best-Fit Function Estimator
export function bestFit(xArr, yArr) {
  try {
    if (!Array.isArray(xArr) || !Array.isArray(yArr) || xArr.length !== yArr.length) {
      toast.error('X and Y must be arrays of the same length');
      throw new Error('x and y must be arrays of same length');
    }

    if (xArr.length < 2) {
      toast.error('Need at least 2 data points for curve fitting');
      throw new Error('Insufficient data points');
    }

    if (xArr.some((x) => !isFinite(x)) || yArr.some((y) => !isFinite(y))) {
      toast.error('All data points must be finite numbers');
      throw new Error('Non-finite data points');
    }

    const n = xArr.length;
    const linCoeffs = _polyFit(xArr, yArr, 1);
    const linPred = _predictPoly(linCoeffs, xArr);
    const r2Lin = _r2(yArr, linPred);

    const quadCoeffs = _polyFit(xArr, yArr, 2);
    const quadPred = _predictPoly(quadCoeffs, xArr);
    const r2Quad = _r2(yArr, quadPred);

    let r2Exp = -Infinity; let expA = 0; let expB = 0;
    if (yArr.every((v) => v > 0)) {
      try {
        const ly = yArr.map((v) => Math.log(v));
        const coeffs = _polyFit(xArr, ly, 1);
        const predLog = _predictPoly(coeffs, xArr);
        const pred = predLog.map((v) => Math.exp(v));
        r2Exp = _r2(yArr, pred);
        expA = Math.exp(coeffs[0]); expB = coeffs[1];
      } catch (e) {
        // Exponential fit failed, skip it
      }
    }

    let r2Log = -Infinity; let logA = 0; let logB = 0;
    if (xArr.every((v) => v > 0)) {
      try {
        const lx = xArr.map((v) => Math.log(v));
        const coeffs = _polyFit(lx, yArr, 1);
        const pred = _predictPoly(coeffs, lx);
        r2Log = _r2(yArr, pred);
        logA = coeffs[0]; logB = coeffs[1];
      } catch (e) {
        // Logarithmic fit failed, skip it
      }
    }

    const results = [
      { name: 'linear', r2: r2Lin, info: { coeffs: linCoeffs } },
      { name: 'quadratic', r2: r2Quad, info: { coeffs: quadCoeffs } },
    ];
    if (r2Exp !== -Infinity && isFinite(r2Exp)) {
      results.push({ name: 'exponential', r2: r2Exp, info: { a: expA, b: expB } });
    }
    if (r2Log !== -Infinity && isFinite(r2Log)) {
      results.push({ name: 'logarithmic', r2: r2Log, info: { a: logA, b: logB } });
    }

    results.sort((a, b) => b.r2 - a.r2);
    const best = results[0];

    if (!best || !isFinite(best.r2)) {
      toast.error('Could not find valid curve fit');
      throw new Error('No valid fit found');
    }

    return { best_fit: best.name, r2: Number((best.r2 || 0).toFixed(4)), info: best.info };
  } catch (error) {
    if (!error.message.includes('X and Y') && !error.message.includes('data points')) {
      toast.error(`Curve Fitting Error: ${error.message}`);
    }
    throw error;
  }
}

// Optimal Threshold Finder
export function optimalThreshold(scores, labels, metric = 'f1') {
  try {
    if (!scores || !labels || scores.length !== labels.length) {
      toast.error('Scores and labels must be same-length arrays');
      throw new Error('scores and labels must be same-length arrays');
    }

    if (scores.length === 0) {
      toast.error('Need at least one data point for threshold optimization');
      throw new Error('Empty arrays');
    }

    if (scores.some((s) => !isFinite(s)) || labels.some((l) => !isFinite(l))) {
      toast.error('All scores and labels must be finite numbers');
      throw new Error('Non-finite values');
    }

    if (!labels.every((l) => l === 0 || l === 1)) {
      toast.error('Labels must be binary (0 or 1)');
      throw new Error('Non-binary labels');
    }

    const pairs = scores.map((s, i) => ({ s, lab: labels[i] })).sort((a, b) => a.s - b.s);
    const thresholds = [...new Set(pairs.map((p) => p.s))];
    let best = {
      thr: thresholds[0], metric: -Infinity, precision: 0, recall: 0, f1: 0, acc: 0,
    };

    for (const t of thresholds) {
      let tp = 0; let fp = 0; let tn = 0; let fn = 0;
      for (let i = 0; i < pairs.length; i += 1) {
        const pred = pairs[i].s >= t ? 1 : 0;
        const { lab } = pairs[i];
        if (pred === 1 && lab === 1) tp += 1;
        if (pred === 1 && lab === 0) fp += 1;
        if (pred === 0 && lab === 0) tn += 1;
        if (pred === 0 && lab === 1) fn += 1;
      }
      const prec = tp + fp === 0 ? 0 : tp / (tp + fp);
      const rec = tp + fn === 0 ? 0 : tp / (tp + fn);
      const f1 = prec + rec === 0 ? 0 : 2 * prec * rec / (prec + rec);
      const acc = (tp + tn) / (tp + tn + fp + fn);
      const val = metric === 'accuracy' ? acc : f1;
      if (val > best.metric) {
        best = {
          thr: t, metric: val, precision: prec, recall: rec, f1, acc,
        };
      }
    }

    if (best.metric === -Infinity) {
      toast.error('Could not find optimal threshold');
      throw new Error('No valid threshold');
    }

    return {
      best_threshold: Number(best.thr), metric, value: Number((best.metric || 0).toFixed(4)), details: best,
    };
  } catch (error) {
    if (!error.message.includes('Scores and labels') && !error.message.includes('binary')) {
      toast.error(`Threshold Optimization Error: ${error.message}`);
    }
    throw error;
  }
}

// Learning Rate Estimator
export function estimateLearningRate(losses, steps) {
  try {
    if (!Array.isArray(losses) || !Array.isArray(steps) || losses.length !== steps.length) {
      toast.error('Losses and steps must be same-length arrays');
      throw new Error('losses and steps must be same-length arrays');
    }

    if (losses.length === 0) {
      toast.error('Need at least one data point for LR estimation');
      throw new Error('Empty arrays');
    }

    if (losses.some((l) => !isFinite(l)) || steps.some((s) => !isFinite(s))) {
      toast.error('All losses and steps must be finite numbers');
      throw new Error('Non-finite values');
    }

    const valid = steps.every((s) => s > 0);
    if (!valid) {
      toast.error('All learning rate steps must be positive');
      return { optimal_lr: null, note: 'steps (learning rates) must be positive' };
    }

    const x = steps.map((s) => Math.log(s));
    if (x.some((v) => !isFinite(v))) {
      toast.error('Learning rate steps resulted in numerical issues');
      throw new Error('Numerical issues with steps');
    }

    const coeffs = _polyFit(x, losses, 2);
    const a = coeffs[2] || 0; const b = coeffs[1] || 0;
    let optimal_lr = null;

    if (Math.abs(a) > 1e-12) {
      const x_min = -b / (2 * a);
      optimal_lr = Math.exp(x_min);
      if (!isFinite(optimal_lr)) {
        toast.error('Optimal learning rate calculation resulted in overflow');
        throw new Error('LR overflow');
      }
    } else {
      const idx = losses.indexOf(Math.min(...losses));
      optimal_lr = steps[idx];
    }

    return { optimal_lr: Number(optimal_lr), coeffs: coeffs.map((c) => Number(c)), note: 'quadratic fit on log(steps)' };
  } catch (error) {
    if (!error.message.includes('Losses and steps') && !error.message.includes('learning rate')) {
      toast.error(`Learning Rate Estimation Error: ${error.message}`);
    }
    throw error;
  }
}

// Weight Optimizer for Weighted Averages
export function optimizeWeights(Xs, Y) {
  try {
    if (!Array.isArray(Xs) || !Array.isArray(Y)) {
      toast.error('Xs and Y must be arrays');
      throw new Error('Xs and Y required');
    }

    if (Xs.length === 0 || Y.length === 0) {
      toast.error('Need at least one feature and target value');
      throw new Error('Empty arrays');
    }

    // Validate all Xs arrays have same length
    const n = Xs[0].length;
    if (Xs.some((col) => col.length !== n)) {
      toast.error('All feature columns must have same length');
      throw new Error('Column length mismatch');
    }

    if (Y.length !== n) {
      toast.error(`Target length (${Y.length}) must match feature rows (${n})`);
      throw new Error('Length mismatch');
    }

    if (Xs.some((col) => col.some((v) => !isFinite(v))) || Y.some((v) => !isFinite(v))) {
      toast.error('All values must be finite numbers');
      throw new Error('Non-finite values');
    }

    const m = Xs.length;
    const X = new Array(n).fill(0).map((_, i) => Xs.map((col) => col[i]));
    const Xt = transpose(X);
    const XtX = Xt.map((r) => r.map((_, c) => dot(r, X.map((row) => row[c]))));
    const Xty = Xt.map((r) => dot(r, Y));
    const weights = solveLinearSystem(XtX, Xty);

    if (weights.some((w) => !isFinite(w))) {
      toast.error('Weight optimization resulted in invalid values');
      throw new Error('Invalid weights');
    }

    return weights;
  } catch (error) {
    if (!error.message.includes('Xs and Y') && !error.message.includes('feature')) {
      toast.error(`Weight Optimization Error: ${error.message}`);
    }
    throw error;
  }
}

// Feature Correlation and Importance Analyzer
export function featureImportance(features, target) {
  try {
    if (!Array.isArray(features) || !Array.isArray(target)) {
      toast.error('Features and target must be arrays');
      throw new Error('Invalid input');
    }

    const n = features.length;
    if (n === 0) {
      toast.error('Need at least one data point for feature importance');
      return [];
    }

    if (target.length !== n) {
      toast.error(`Target length (${target.length}) must match number of feature rows (${n})`);
      throw new Error('Length mismatch');
    }

    if (features.some((row) => row.some((v) => !isFinite(v))) || target.some((v) => !isFinite(v))) {
      toast.error('All values must be finite numbers');
      throw new Error('Non-finite values');
    }

    const m = features[0].length;
    const res = [];
    const tmean = mean(target);
    const t_std = Math.sqrt(target.reduce((s, v) => s + (v - tmean) ** 2, 0) / (n - 1 || 1));

    if (!isFinite(t_std)) {
      toast.error('Target standard deviation calculation failed');
      throw new Error('Invalid target std');
    }

    for (let j = 0; j < m; j += 1) {
      const col = features.map((r) => r[j]);
      const meanC = mean(col);
      const stdC = Math.sqrt(col.reduce((s, v) => s + (v - meanC) ** 2, 0) / (n - 1 || 1));

      if (!isFinite(stdC)) {
        toast.error(`Feature ${j} standard deviation calculation failed`);
        throw new Error('Invalid feature std');
      }

      let cov = 0;
      for (let i = 0; i < n; i += 1) cov += (col[i] - meanC) * (target[i] - tmean);
      cov /= (n - 1 || 1);

      const corr = (stdC === 0 || t_std === 0) ? 0 : cov / (stdC * t_std);

      if (!isFinite(corr)) {
        toast.error(`Correlation calculation failed for feature ${j}`);
        throw new Error('Invalid correlation');
      }

      res.push({ feature: j, correlation: Number(corr.toFixed(4)), importance: Number(Math.abs(corr).toFixed(4)) });
    }

    res.sort((a, b) => b.importance - a.importance);
    return res;
  } catch (error) {
    if (!error.message.includes('Features and target') && !error.message.includes('data point')) {
      toast.error(`Feature Importance Error: ${error.message}`);
    }
    throw error;
  }
}
