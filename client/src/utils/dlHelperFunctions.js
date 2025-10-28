import { toast } from 'react-toastify';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const maxSafeDim = 1e5;
const maxSafeChannels = 1e4;

const validateInput = (name, value, options = {}) => {
  const {
    max = maxSafeDim,
    isGroups = false,
    isStride = false,
    isOpad = false,
    isDilation = false,
    stride = null,
  } = options;

  // Reject empty/null values
  if (value === '' || value == null) {
    toast.error(`${name} cannot be empty`);
    throw new ValidationError(`Invalid ${name}: empty input`);
  }

  const num = Number(value);

  // Basic numeric validation
  if (!Number.isFinite(num)) {
    toast.error(`${name} must be a finite number`);
    throw new ValidationError(`Invalid ${name}: not finite`);
  }

  if (!Number.isInteger(num)) {
    toast.error(`${name} must be an integer`);
    throw new ValidationError(`Invalid ${name}: not integer`);
  }

  if (num > max) {
    toast.error(`${name} exceeds safe computation limit (${max})`);
    throw new ValidationError(`Invalid ${name}: exceeds limit`);
  }

  // Special cases
  if (isGroups && num < 1) {
    toast.error('Groups must be at least 1');
    throw new ValidationError('Invalid groups: below 1');
  }

  if (isStride && num === 0) {
    toast.error('Stride cannot be zero');
    throw new ValidationError('Invalid stride: zero');
  }

  if (isOpad && stride) {
    if (num < 0 || num >= stride) {
      toast.error(`Output padding must be between 0 and stride-1 (${stride - 1})`);
      throw new ValidationError('Invalid output padding');
    }
  }

  if (isDilation && num < 1) {
    toast.error(`${name} must be at least 1`);
    throw new ValidationError(`Invalid ${name}: dilation below 1`);
  }

  return num;
};

const validateGroupedChannels = (cIn, cOut, groups) => {
  if (cIn % groups !== 0) {
    toast.error(`Input channels (${cIn}) must be divisible by groups (${groups})`);
    throw new ValidationError('Invalid group configuration: input channels');
  }
  if (cOut % groups !== 0) {
    toast.error(`Output channels (${cOut}) must be divisible by groups (${groups})`);
    throw new ValidationError('Invalid group configuration: output channels');
  }
  if (cOut < groups) {
    toast.error(`Output channels (${cOut}) must be >= groups (${groups})`);
    throw new ValidationError('Invalid group configuration: insufficient outputs');
  }
};

const validateKernelSize = (lIn, k, p, d = 1, name = '') => {
  const effectiveKernel = d * (k - 1) + 1;
  const paddedInput = lIn + 2 * p;

  if (effectiveKernel > paddedInput) {
    toast.error(`${name}: Effective kernel size (${effectiveKernel}) exceeds padded input (${paddedInput})`);
    throw new ValidationError(`Invalid kernel configuration: ${name}`);
  }
};

// central catch handler that short-circuits when ValidationError already shown
const handleCatch = (error, fallbackMsg) => {
  if (error instanceof ValidationError) {
    throw error;
  }
  if (!error.message.includes('Invalid') && !error.message.includes('Negative')) {
    toast.error(fallbackMsg);
  }
  throw error;
};

/**
 * Compute output length for 1D convolution.
 * Formula: L_out = floor((L_in + 2P - d*(K - 1) - 1) / S) + 1
 */
export function convOut1D({
  lIn, k, s, p, d = 1,
}) {
  try {
    const inputs = {
      lIn: validateInput('Input length', lIn),
      k: validateInput('Kernel size', k),
      s: validateInput('Stride', s, { isStride: true }),
      p: validateInput('Padding', p),
      d: validateInput('Dilation', d, { isDilation: true }),
    };

    validateKernelSize(inputs.lIn, inputs.k, inputs.p, inputs.d, 'Conv1D');

    const lOut = Math.floor((inputs.lIn + 2 * inputs.p - inputs.d * (inputs.k - 1) - 1) / inputs.s) + 1;

    if (lOut < 1) {
      toast.error(`Invalid output length (${lOut}): configuration results in zero or negative output size`);
      throw new Error('Invalid output length');
    }

    return {
      lOut,
      explain: `Output length ${lOut} computed with lIn=${lIn}, k=${k}, s=${s}, p=${p}, d=${d}`,
    };
  } catch (error) {
    handleCatch(error, 'Convolution calculation failed');
  }
}

/**
 * Compute output length for 1D transposed convolution.
 * Formula: L_out = (L_in - 1) * S - 2P + d*(K - 1) + opad + 1
 */
export function transOut1D({
  lIn, k, s, p, oPad = 0, d = 1,
}) {
  try {
    const inputs = {
      lIn: validateInput('Input length', lIn),
      k: validateInput('Kernel size', k),
      s: validateInput('Stride', s, { isStride: true }),
      p: validateInput('Padding', p),
      oPad: validateInput('Output padding', oPad, { isOpad: true, stride: s }),
      d: validateInput('Dilation', d, { isDilation: true }),
    };

    const lOut = (inputs.lIn - 1) * inputs.s - 2 * inputs.p + inputs.d * (inputs.k - 1) + inputs.oPad + 1;

    if (lOut < 1) {
      toast.error(`Invalid output length (${lOut}): configuration results in zero or negative output size`);
      throw new Error('Invalid output length');
    }

    return {
      lOut,
      explain: `Output length ${lOut} computed with lIn=${lIn}, k=${k}, s=${s}, p=${p}, oPad=${oPad}, d=${d}`,
    };
  } catch (error) {
    handleCatch(error, 'Transposed convolution calculation failed');
  }
}

/**
 * Compute SAME padding per side to maintain output length ≈ ceil(L_in / S).
 */
export function padSame1D({
  lIn, k, s, d = 1,
}) {
  try {
    const inputs = {
      lIn: validateInput('Input length', lIn),
      k: validateInput('Kernel size', k),
      s: validateInput('Stride', s, { isStride: true }),
      d: validateInput('Dilation', d, { isDilation: true }),
    };

    if (inputs.k > inputs.lIn * 2) {
      toast.error(`Kernel size (${inputs.k}) too large for SAME padding with input length (${inputs.lIn})`);
      throw new Error('Invalid kernel for SAME padding');
    }

    const lOut = Math.ceil(inputs.lIn / inputs.s);
    const p = Math.max(0, Math.ceil(((lOut - 1) * inputs.s + inputs.d * (inputs.k - 1) + 1 - inputs.lIn) / 2));

    return {
      p,
      explain: 'Padding (per side) to achieve SAME output length.',
    };
  } catch (error) {
    handleCatch(error, 'SAME padding calculation failed');
  }
}

/**
 * Compute padding required to reach a desired output length.
 */
export function padDiff1D({
  lIn, k, s, desiredLOut, d = 1,
}) {
  try {
    const inputs = {
      lIn: validateInput('Input length', lIn),
      k: validateInput('Kernel size', k),
      s: validateInput('Stride', s, { isStride: true }),
      desiredLOut: validateInput('Desired output length', desiredLOut),
      d: validateInput('Dilation', d, { isDilation: true }),
    };

    if (inputs.desiredLOut < Math.ceil(inputs.lIn / inputs.s)) {
      toast.error(`Desired output length (${inputs.desiredLOut}) too small for input length (${inputs.lIn})`);
      throw new Error('Invalid desired output length');
    }

    const p = Math.ceil(((inputs.desiredLOut - 1) * inputs.s + inputs.d * (inputs.k - 1) + 1 - inputs.lIn) / 2);

    return {
      p,
      explain: 'Padding (per side) to reach a specific desired output length.',
    };
  } catch (error) {
    handleCatch(error, 'Padding difference calculation failed');
  }
}

/**
 * Compute output length for 1D max/avg pooling.
 * Formula: L_out = floor((L_in + 2P - K) / S) + 1
 */
export function poolOut1D({
  lIn, k, s, p,
}) {
  try {
    const inputs = {
      lIn: validateInput('Input length', lIn),
      k: validateInput('Kernel size', k),
      s: validateInput('Stride', s, { isStride: true }),
      p: validateInput('Padding', p),
    };

    if (inputs.k > inputs.lIn + 2 * inputs.p) {
      toast.error(`Pool kernel (${inputs.k}) larger than padded input (${inputs.lIn + 2 * inputs.p})`);
      throw new Error('Invalid pool size');
    }

    const lOut = Math.floor((inputs.lIn + 2 * inputs.p - inputs.k) / inputs.s) + 1;

    if (!isFinite(lOut)) {
      toast.error('Pooling output length is invalid: computation resulted in infinity or NaN');
      throw new Error('Invalid output length');
    }
    if (lOut < 1) {
      toast.error(`Pooling output length (${lOut}) is invalid: Kernel size (${k}) is too large for input length (${lIn}) with current stride (${s}) and padding (${p})`);
      throw new Error('Invalid pooling output length < 1');
    }

    return {
      lOut,
      explain: `Pooling output length ${lOut} computed with lIn=${lIn}, k=${k}, s=${s}, p=${p}`,
    };
  } catch (error) {
    handleCatch(error, 'Pooling calculation failed');
  }
}

/**
 * Compute trainable parameter count for a 1D convolution layer.
 */
export function convParams1D({
  cIn, cOut, k, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      cIn: validateInput('Input channels', cIn, { max: maxSafeChannels }),
      cOut: validateInput('Output channels', cOut, { max: maxSafeChannels }),
      k: validateInput('Kernel size', k),
      groups: validateInput('Groups', groups, { isGroups: true }),
    };

    validateGroupedChannels(inputs.cIn, inputs.cOut, inputs.groups);

    const weightParams = inputs.cOut * (inputs.cIn / inputs.groups) * inputs.k;
    const biasParams = biasFlag ? inputs.cOut : 0;
    const totalParams = weightParams + biasParams;

    if (!Number.isSafeInteger(weightParams) || !Number.isSafeInteger(biasParams)) {
      toast.error('Parameter count exceeds safe integer limit');
      throw new Error('Invalid parameter count: overflow');
    }

    return {
      params: totalParams,
      explain: `Trainable parameters: ${totalParams} (weights: ${weightParams}, bias: ${biasParams})`,
    };
  } catch (error) {
    handleCatch(error, 'Parameter counting failed');
  }
}

/**
 * Compute trainable parameter count for a 1D transposed convolution layer.
 */
export function transParams1D({
  cIn, cOut, k, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      cIn: validateInput('Input channels', cIn, { max: maxSafeChannels }),
      cOut: validateInput('Output channels', cOut, { max: maxSafeChannels }),
      k: validateInput('Kernel size', k),
      groups: validateInput('Groups', groups, { isGroups: true }),
    };

    validateGroupedChannels(inputs.cIn, inputs.cOut, inputs.groups);

    const weightParams = inputs.cOut * (inputs.cIn / inputs.groups) * inputs.k;
    const biasParams = biasFlag ? inputs.cOut : 0;
    const totalParams = weightParams + biasParams;

    if (!Number.isSafeInteger(weightParams) || !Number.isSafeInteger(biasParams)) {
      toast.error('Parameter count exceeds safe integer limit');
      throw new Error('Invalid parameter count: overflow');
    }

    return {
      params: totalParams,
      explain: `Trainable parameters: ${totalParams} (weights: ${weightParams}, bias: ${biasParams})`,
    };
  } catch (error) {
    handleCatch(error, 'Transposed parameter counting failed');
  }
}

/**
 * Compute trainable parameter count for a 2D convolution layer.
 */
export function convParams2D({
  cIn, cOut, kH, kW, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      cIn: validateInput('Input channels', cIn),
      cOut: validateInput('Output channels', cOut),
      kH: validateInput('Kernel height', kH),
      kW: validateInput('Kernel width', kW),
      groups: validateInput('Groups', groups),
    };

    validateGroupedChannels(inputs.cIn, inputs.cOut, inputs.groups);

    const weightParams = inputs.cOut * (inputs.cIn / inputs.groups) * inputs.kH * inputs.kW;
    const biasParams = biasFlag ? inputs.cOut : 0;
    const totalParams = weightParams + biasParams;

    if (!Number.isSafeInteger(weightParams) || !Number.isSafeInteger(biasParams)) {
      toast.error('Parameter count exceeds safe integer limit');
      throw new Error('Invalid parameter count: overflow');
    }

    return {
      params: totalParams,
      explain: 'Trainable parameter count for a 2D convolution layer.',
    };
  } catch (error) {
    handleCatch(error, '2D convolution parameter counting failed');
  }
}

/**
 * Compute trainable parameter count for a 2D transposed convolution layer.
 */
export function transParams2D({
  cIn, cOut, kH, kW, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      cIn: validateInput('Input channels', cIn),
      cOut: validateInput('Output channels', cOut),
      kH: validateInput('Kernel height', kH),
      kW: validateInput('Kernel width', kW),
      groups: validateInput('Groups', groups),
    };

    validateGroupedChannels(inputs.cIn, inputs.cOut, inputs.groups);

    const weightParams = inputs.cOut * (inputs.cIn / inputs.groups) * inputs.kH * inputs.kW;
    const biasParams = biasFlag ? inputs.cOut : 0;
    const totalParams = weightParams + biasParams;

    if (!Number.isSafeInteger(weightParams) || !Number.isSafeInteger(biasParams)) {
      toast.error('Parameter count exceeds safe integer limit');
      throw new Error('Invalid parameter count: overflow');
    }

    return {
      params: totalParams,
      explain: 'Trainable parameter count for a 2D transposed convolution layer.',
    };
  } catch (error) {
    handleCatch(error, '2D transposed convolution parameter counting failed');
  }
}
