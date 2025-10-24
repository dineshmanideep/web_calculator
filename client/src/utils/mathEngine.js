import math from './mathSetup';

export const preprocess = (expr, angleMode) => {
  // For degree mode we wrap trig functions: sin(x) -> sin(x * pi/180)
  if (angleMode === 'deg') {
    // simpler approach: replace sin( with sin(deg2rad( ... ) ), implement deg2rad
    // define deg2rad in math scope below
    expr = expr.replace(/sin\(([^)]+)\)/g, 'sin(deg2rad($1))')
      .replace(/cos\(([^)]+)\)/g, 'cos(deg2rad($1))')
      .replace(/tan\(([^)]+)\)/g, 'tan(deg2rad($1))')
      .replace(/asin\(([^)]+)\)/g, 'rad2deg(asin($1))')
      .replace(/acos\(([^)]+)\)/g, 'rad2deg(acos($1))')
      .replace(/atan\(([^)]+)\)/g, 'rad2deg(atan($1))');
  }
  return expr;
};

// Evaluate expression using mathjs
export const evaluateExpression = (expr, angleMode) => {
  if (!expr || expr.trim() === '') throw new Error('Empty expression');
  const pre = preprocess(expr, angleMode);
  // allow matrix literal like [[1,2],[3,4]]
  const scope = { i: math.complex(0, 1) }; // complex unit
  const node = math.parse(pre);
  // evaluate
  const res = node.evaluate(scope);
  return res;
};

// ---------------- ML / Conv helper utilities (ML mode) ----------------

// small numeric helpers
const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const transpose = (m) => m[0].map((_, i) => m.map((r) => r[i]));

// solve linear system Ax=b using Gaussian elimination with partial pivoting
function solveLinearSystem(aIn, bIn) {
  const n = aIn.length;
  const A = aIn.map((r) => r.slice());
  const b = bIn.slice();
  for (let i = 0; i < n; i += 1) {
    // pivot
    let maxRow = i; let maxVal = Math.abs(A[i][i]);
    for (let r = i + 1; r < n; r += 1) { if (Math.abs(A[r][i]) > maxVal) { maxVal = Math.abs(A[r][i]); maxRow = r; } }
    if (maxRow !== i) { [A[i], A[maxRow]] = [A[maxRow], A[i]]; [b[i], b[maxRow]] = [b[maxRow], b[i]]; }
    const pivot = A[i][i];
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
  }
  return x;
}

// 1) Optimal Padding & Stride Finder
export function optimalPaddingStride(hIn, wIn, k, opts = {}) {
  // Improved objective:
  // - favor high spatial retention (output area / input area)
  // - prefer output size close to input size (minimize lost border pixels)
  // - prefer smaller strides (denser sampling)
  // - slight preference for larger padding that preserves spatial dims
  const maxP = opts.maxP != null ? opts.maxP : Math.max(0, Math.floor(k / 2) + 1);
  const maxS = opts.maxS != null ? opts.maxS : Math.max(1, k);
  const best = { score: -Infinity };
  for (let p = 0; p <= maxP; p += 1) {
    for (let s = 1; s <= maxS; s += 1) {
      const hOut = Math.floor((hIn + 2 * p - k) / s) + 1;
      const wOut = Math.floor((wIn + 2 * p - k) / s) + 1;
      if (hOut <= 0 || wOut <= 0) continue;
      // basic retention percent
      const retention = (hOut * wOut) / (hIn * wIn);
      // size match: 1.0 when equal sizes, lower otherwise
      const sizeDiff = Math.abs(hOut - hIn) + Math.abs(wOut - wIn);
      const sizeMatch = 1 - sizeDiff / (hIn + wIn); // in (-inf,1]
      const sizeMatchClamped = Math.max(0, sizeMatch);
      // stride penalty: prefer smaller strides (denser sampling)
      const strideScore = 1 / s;
      // receptive field for single layer is K, but effective coverage depends on stride
      // define coverage ~ min(1, (K / Math.max(1, Math.min(H_in, W_in))) )
  const rfCoverage = Math.min(1, k / Math.max(1, Math.min(hIn, wIn)));
      // border loss proxy: how many input pixels are not aligned to outputs roughly
  const borderLoss = Math.abs(hIn - (hOut * s)) + Math.abs(wIn - (wOut * s));
  const borderLossNorm = borderLoss / (hIn + wIn);

      // combined score weights (can be tuned)
      const w_ret = 0.6;
      const w_size = 0.25;
      const w_stride = 0.1;
      const w_border = 0.05;

      const score = w_ret * retention + w_size * sizeMatchClamped + w_stride * strideScore - w_border * borderLossNorm + 0.0001 * p;

      if (score > best.score) {
        best.score = score;
        best.p = p; best.s = s; best.retention = retention * 100; // percent
        best.H_out = hOut; best.W_out = wOut; best.sizeMatch = sizeMatchClamped;
        best.borderLoss = borderLoss;
      }
    }
  }
  return {
    best_padding: best.p ?? 0,
    best_stride: best.s ?? 1,
    info_retention_percent: Number(((best.retention) || 0).toFixed(3)),
    output_size: [best.H_out || 0, best.W_out || 0],
    size_match: Number(((best.sizeMatch || 0) * 100).toFixed(3)),
    border_loss: best.borderLoss || 0,
  };
}

// 2) Receptive Field Calculator
export function receptiveField(options = {}) {
  // stride can be number or array
  const {
    kernel_size: kernelSize = 3,
    stride = 1,
    num_layers: numLayers = 1,
  } = options;
  const k = kernelSize;
  const L = numLayers;
  const sArr = Array.isArray(stride) ? stride.slice(0, L) : Array(L).fill(stride);
  // RF = 1 + (k-1) * sum_{i=0}^{L-1} prod_{j=0}^{i-1} s_j
  let sum = 0;
  for (let i = 0; i < L; i += 1) {
    let prod = 1;
    for (let j = 0; j <= i - 1; j += 1) prod *= sArr[j];
    sum += prod;
  }
  const RF = 1 + (k - 1) * sum;
  return RF;
}

// 3) Parameter Count Estimator
export function paramCount({ in_channels = 1, out_channels = 1, kernel_size = 1 } = {}) {
  const inChannels = in_channels;
  const outChannels = out_channels;
  const kernelSize = kernel_size;
  const k2 = kernelSize * kernelSize;
  const params = inChannels * outChannels * k2 + outChannels; // include biases
  return params;
}

// 4) Output Shape Calculator for Convs
export function convOutputShape(options = {}) {
  const {
    H_in: hIn, W_in: wIn, K: k, P = 0, S = 1,
  } = options;
  const hOut = Math.floor((hIn + 2 * P - k) / S) + 1;
  const wOut = Math.floor((wIn + 2 * P - k) / S) + 1;
  return { H_out: hOut, W_out: wOut };
}

// 10) FLOPs Calculator
export function flopsCount(options = {}) {
  const {
    in_channels: inChannels = 1,
    out_channels: outChannels = 1,
    kernel_size: kernelSize = 1,
    H_out: hOut = 1,
    W_out: wOut = 1,
  } = options;
  const k2 = kernelSize * kernelSize;
  const flops = 2 * hOut * wOut * (inChannels * outChannels * k2);
  return flops;
}

// Helper: fit polynomial of degree d with normal equations, returns coeffs [c0,c1,...]
function _polyFit(x, y, degree) {
  const n = x.length;
  const m = degree + 1;
  const X = new Array(n).fill(0).map(() => new Array(m).fill(0));
  for (let i = 0; i < n; i += 1) for (let j = 0; j < m; j += 1) X[i][j] = x[i] ** j;
  const Xt = transpose(X);
  const XtX = Xt.map((r) => r.map((_, c) => dot(r, X.map((row) => row[c]))));
  const Xty = Xt.map((r) => dot(r, y));
  const coeffs = solveLinearSystem(XtX, Xty);
  return coeffs;
}

function _predictPoly(coeffs, xArr) {
  return xArr.map((xv) => coeffs.reduce((s, c, i) => s + c * xv ** i, 0));
}

function _r2(yArr, yPred) {
  const ym = mean(yArr);
  const ssRes = yArr.reduce((s, v, i) => s + (v - yPred[i]) ** 2, 0);
  const ssTot = yArr.reduce((s, v) => s + (v - ym) ** 2, 0);
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

// Best-Fit Function Estimator
export function bestFit(xArr, yArr) {
  if (!Array.isArray(xArr) || !Array.isArray(yArr) || xArr.length !== yArr.length) throw new Error('x and y must be arrays of same length');
  const n = xArr.length;
  // linear
  const linCoeffs = _polyFit(xArr, yArr, 1);
  const linPred = _predictPoly(linCoeffs, xArr);
  const r2Lin = _r2(yArr, linPred);
  // polynomial degree 2
  const quadCoeffs = _polyFit(xArr, yArr, 2);
  const quadPred = _predictPoly(quadCoeffs, xArr);
  const r2Quad = _r2(yArr, quadPred);
  // exponential y = a * exp(b x) -> log y = log a + b x  (need y>0)
  let r2Exp = -Infinity; let expA = 0; let expB = 0;
  if (yArr.every((v) => v > 0)) {
    const ly = yArr.map((v) => Math.log(v));
    const coeffs = _polyFit(xArr, ly, 1);
    const predLog = _predictPoly(coeffs, xArr);
    const pred = predLog.map((v) => Math.exp(v));
    r2Exp = _r2(yArr, pred);
    expA = Math.exp(coeffs[0]); expB = coeffs[1];
  }
  // logarithmic y = a + b log(x)
  let r2Log = -Infinity; let logA = 0; let logB = 0;
  if (xArr.every((v) => v > 0)) {
    const lx = xArr.map((v) => Math.log(v));
    const coeffs = _polyFit(lx, yArr, 1);
    const pred = _predictPoly(coeffs, lx);
    r2Log = _r2(yArr, pred);
    logA = coeffs[0]; logB = coeffs[1];
  }
  const results = [
    { name: 'linear', r2: r2Lin, info: { coeffs: linCoeffs } },
    { name: 'quadratic', r2: r2Quad, info: { coeffs: quadCoeffs } },
  ];
  if (r2Exp !== -Infinity) results.push({ name: 'exponential', r2: r2Exp, info: { a: expA, b: expB } });
  if (r2Log !== -Infinity) results.push({ name: 'logarithmic', r2: r2Log, info: { a: logA, b: logB } });
  results.sort((a, b) => b.r2 - a.r2);
  const best = results[0];
  return { best_fit: best.name, r2: Number((best.r2 || 0).toFixed(4)), info: best.info };
}

// Optimal Threshold Finder
export function optimalThreshold(scores, labels, metric = 'f1') {
  if (!scores || !labels || scores.length !== labels.length) throw new Error('scores and labels must be same-length arrays');
  const pairs = scores.map((s, i) => ({ s, lab: labels[i] })).sort((a, b) => a.s - b.s);
  const thresholds = [...new Set(pairs.map((p) => p.s))];
  let best = {
    thr: thresholds[0], metric: -Infinity, precision: 0, recall: 0, f1: 0, acc: 0,
  };
  for (const t of thresholds) {
    let tp = 0; let fp = 0; let tn = 0; let
      fn = 0;
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
  return {
    best_threshold: Number(best.thr), metric, value: Number((best.metric || 0).toFixed(4)), details: best,
  };
}

// Learning Rate Estimator (assumes steps are candidate LR values >0)
export function estimateLearningRate(losses, steps) {
  if (!Array.isArray(losses) || !Array.isArray(steps) || losses.length !== steps.length) throw new Error('losses and steps must be same-length arrays');
  // work in log-space for steps
  const valid = steps.every((s) => s > 0);
  if (!valid) return { optimal_lr: null, note: 'steps (learning rates) must be positive' };
  const x = steps.map((s) => Math.log(s));
  const coeffs = _polyFit(x, losses, 2); // quadratic fit: a x^2 + b x + c
  const a = coeffs[2] || 0; const b = coeffs[1] || 0;
  let optimal_lr = null;
  if (Math.abs(a) > 1e-12) {
    const x_min = -b / (2 * a);
    optimal_lr = Math.exp(x_min);
  } else {
    // fallback to lr at minimum observed loss
    const idx = losses.indexOf(Math.min(...losses));
    optimal_lr = steps[idx];
  }
  return { optimal_lr: Number(optimal_lr), coeffs: coeffs.map((c) => Number(c)), note: 'quadratic fit on log(steps)' };
}

// Weight Optimizer for Weighted Averages (linear regression without intercept)
export function optimizeWeights(Xs, Y) {
  // Xs: array of arrays [[x1,x2,...], ...] where each is a feature column or rows? Accept both shapes.
  // Expect Xs as array of columns (m arrays length n). Convert to design matrix n x m
  if (!Array.isArray(Xs) || !Array.isArray(Y)) throw new Error('Xs and Y required');
  const m = Xs.length;
  const n = Xs[0].length;
  const X = new Array(n).fill(0).map((_, i) => Xs.map((col) => col[i]));
  const Xt = transpose(X);
  const XtX = Xt.map((r) => r.map((_, c) => dot(r, X.map((row) => row[c]))));
  const Xty = Xt.map((r) => dot(r, Y));
  const weights = solveLinearSystem(XtX, Xty);
  return weights;
}

// Feature Correlation and Importance Analyzer
export function featureImportance(features, target) {
  // features: n x m (array of rows). target: length n
  const n = features.length;
  if (n === 0) return [];
  const m = features[0].length;
  const res = [];
  const tmean = mean(target);
  const t_std = Math.sqrt(target.reduce((s, v) => s + (v - tmean) ** 2, 0) / (n - 1 || 1));
  for (let j = 0; j < m; j += 1) {
    const col = features.map((r) => r[j]);
    const meanC = mean(col);
    const stdC = Math.sqrt(col.reduce((s, v) => s + (v - meanC) ** 2, 0) / (n - 1 || 1));
    let cov = 0;
    for (let i = 0; i < n; i += 1) cov += (col[i] - meanC) * (target[i] - tmean);
    cov /= (n - 1 || 1);
    const corr = (stdC === 0 || t_std === 0) ? 0 : cov / (stdC * t_std);
    res.push({ feature: j, correlation: Number(corr.toFixed(4)), importance: Number(Math.abs(corr).toFixed(4)) });
  }
  // sort by importance desc
  res.sort((a, b) => b.importance - a.importance);
  return res;
}