import { toast } from 'react-toastify';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const MAX_SAFE_DIM = 1e5;
const MAX_SAFE_CHANNELS = 1e4;

const validateInput = (name, value, options = {}) => {
  const { 
    max = MAX_SAFE_DIM,
    isGroups = false,
    isStride = false,
    isOpad = false,
    isDilation = false,
    stride = null 
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
      toast.error(`Output padding must be between 0 and stride-1 (${stride-1})`);
      throw new ValidationError('Invalid output padding');
    }
  }

  if (isDilation && num < 1) {
    toast.error(`${name} must be at least 1`);
    throw new ValidationError(`Invalid ${name}: dilation below 1`);
  }

  return num;
};

const validateGroupedChannels = (Cin, Cout, groups) => {
  if (Cin % groups !== 0) {
    toast.error(`Input channels (${Cin}) must be divisible by groups (${groups})`);
    throw new ValidationError('Invalid group configuration: input channels');
  }
  if (Cout % groups !== 0) {
    toast.error(`Output channels (${Cout}) must be divisible by groups (${groups})`);
    throw new ValidationError('Invalid group configuration: output channels');
  }
  if (Cout < groups) {
    toast.error(`Output channels (${Cout}) must be >= groups (${groups})`);
    throw new ValidationError('Invalid group configuration: insufficient outputs');
  }
};

const validateKernelSize = (L_in, K, P, d = 1, name = '') => {
  const effectiveKernel = d * (K - 1) + 1;
  const paddedInput = L_in + 2 * P;
  
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
  L_in, K, S, P, d = 1,
}) {
  try {
    const inputs = {
      L_in: validateInput('Input length', L_in),
      K: validateInput('Kernel size', K),
      S: validateInput('Stride', S, { isStride: true }),
      P: validateInput('Padding', P),
      d: validateInput('Dilation', d, { isDilation: true })
    };

    validateKernelSize(inputs.L_in, inputs.K, inputs.P, inputs.d, 'Conv1D');

    const L_out = Math.floor((inputs.L_in + 2 * inputs.P - inputs.d * (inputs.K - 1) - 1) / inputs.S) + 1;

    if (L_out < 1) {
      toast.error(`Invalid output length (${L_out}): configuration results in zero or negative output size`);
      throw new Error('Invalid output length');
    }

    return {
      L_out,
      explain: `Output length ${L_out} computed with L_in=${L_in}, K=${K}, S=${S}, P=${P}, d=${d}`,
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
  L_in, K, S, P, opad = 0, d = 1,
}) {
  try {
    const inputs = {
      L_in: validateInput('Input length', L_in),
      K: validateInput('Kernel size', K),
      S: validateInput('Stride', S, { isStride: true }),
      P: validateInput('Padding', P),
      opad: validateInput('Output padding', opad, { isOpad: true, stride: S }),
      d: validateInput('Dilation', d, { isDilation: true })
    };

    const L_out = (inputs.L_in - 1) * inputs.S - 2 * inputs.P + inputs.d * (inputs.K - 1) + inputs.opad + 1;

     if (L_out < 1) {
      toast.error(`Invalid output length (${L_out}): configuration results in zero or negative output size`);
      throw new Error('Invalid output length');
    }

    return {
      L_out,
      explain: `Output length ${L_out} computed with L_in=${L_in}, K=${K}, S=${S}, P=${P}, opad=${opad}, d=${d}`,
    };
  } catch (error) {
    handleCatch(error, 'Transposed convolution calculation failed');
  }
}

/**
 * Compute SAME padding per side to maintain output length ≈ ceil(L_in / S).
 */
export function padSame1D({
  L_in, K, S, d = 1,
}) {
  try {
    const inputs = {
      L_in: validateInput('Input length', L_in),
      K: validateInput('Kernel size', K),
      S: validateInput('Stride', S, { isStride: true }),
      d: validateInput('Dilation', d, { isDilation: true })
    };

    if (inputs.K > inputs.L_in * 2) {
      toast.error(`Kernel size (${inputs.K}) too large for SAME padding with input length (${inputs.L_in})`);
      throw new Error('Invalid kernel for SAME padding');
    }

    const L_out = Math.ceil(inputs.L_in / inputs.S);
    const P = Math.max(0, Math.ceil(((L_out - 1) * inputs.S + inputs.d * (inputs.K - 1) + 1 - inputs.L_in) / 2));

    return {
      P,
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
  L_in, K, S, L_out_desired, d = 1,
}) {
  try {
    const inputs = {
      L_in: validateInput('Input length', L_in),
      K: validateInput('Kernel size', K),
      S: validateInput('Stride', S, { isStride: true }),
      L_out_desired: validateInput('Desired output length', L_out_desired),
      d: validateInput('Dilation', d, { isDilation: true })
    };

    if (inputs.L_out_desired < Math.ceil(inputs.L_in / inputs.S)) {
      toast.error(`Desired output length (${inputs.L_out_desired}) too small for input length (${inputs.L_in})`);
      throw new Error('Invalid desired output length');
    }

    const P = Math.ceil(((inputs.L_out_desired - 1) * inputs.S + inputs.d * (inputs.K - 1) + 1 - inputs.L_in) / 2);

    return {
      P,
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
  L_in, K, S, P,
}) {
  try {
    const inputs = {
      L_in: validateInput('Input length', L_in),
      K: validateInput('Kernel size', K),
      S: validateInput('Stride', S, { isStride: true }),
      P: validateInput('Padding', P),
    };

    if (inputs.K > inputs.L_in + 2 * inputs.P) {
      toast.error(`Pool kernel (${inputs.K}) larger than padded input (${inputs.L_in + 2 * inputs.P})`);
      throw new Error('Invalid pool size');
    }

    const L_out = Math.floor((inputs.L_in + 2 * inputs.P - inputs.K) / inputs.S) + 1;

    if (!isFinite(L_out)) {
      toast.error('Pooling output length is invalid: computation resulted in infinity or NaN');
      throw new Error('Invalid output length');
    }
    if (L_out < 1) {
      toast.error(`Pooling output length (${L_out}) is invalid: Kernel size (${K}) is too large for input length (${L_in}) with current stride (${S}) and padding (${P})`);
      throw new Error('Invalid pooling output length < 1');
    }

    return {
      L_out,
      explain: `Pooling output length ${L_out} computed with L_in=${L_in}, K=${K}, S=${S}, P=${P}`,
    };
  } catch (error) {
    handleCatch(error, 'Pooling calculation failed');
  }
}

/**
 * Compute trainable parameter count for a 1D convolution layer.
 */
export function convParams1D({
  Cin, Cout, K, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      Cin: validateInput('Input channels', Cin, { max: MAX_SAFE_CHANNELS }),
      Cout: validateInput('Output channels', Cout, { max: MAX_SAFE_CHANNELS }),
      K: validateInput('Kernel size', K),
      groups: validateInput('Groups', groups, { isGroups: true })
    };

    validateGroupedChannels(inputs.Cin, inputs.Cout, inputs.groups);
    
    const weightParams = inputs.Cout * (inputs.Cin / inputs.groups) * inputs.K;
    const biasParams = biasFlag ? inputs.Cout : 0;
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
  Cin, Cout, K, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      Cin: validateInput('Input channels', Cin, { max: MAX_SAFE_CHANNELS }),
      Cout: validateInput('Output channels', Cout, { max: MAX_SAFE_CHANNELS }),
      K: validateInput('Kernel size', K),
      groups: validateInput('Groups', groups, { isGroups: true })
    };

    validateGroupedChannels(inputs.Cin, inputs.Cout, inputs.groups);
    
    const weightParams = inputs.Cout * (inputs.Cin / inputs.groups) * inputs.K;
    const biasParams = biasFlag ? inputs.Cout : 0;
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
  Cin, Cout, Kh, Kw, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      Cin: validateInput('Input channels', Cin),
      Cout: validateInput('Output channels', Cout),
      Kh: validateInput('Kernel height', Kh),
      Kw: validateInput('Kernel width', Kw),
      groups: validateInput('Groups', groups)
    };

    validateGroupedChannels(inputs.Cin, inputs.Cout, inputs.groups);

    const weightParams = inputs.Cout * (inputs.Cin / inputs.groups) * inputs.Kh * inputs.Kw;
    const biasParams = biasFlag ? inputs.Cout : 0;
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
  Cin, Cout, Kh, Kw, groups = 1, biasFlag = 1,
}) {
  try {
    const inputs = {
      Cin: validateInput('Input channels', Cin),
      Cout: validateInput('Output channels', Cout),
      Kh: validateInput('Kernel height', Kh),
      Kw: validateInput('Kernel width', Kw),
      groups: validateInput('Groups', groups)
    };

    validateGroupedChannels(inputs.Cin, inputs.Cout, inputs.groups);

    const weightParams = inputs.Cout * (inputs.Cin / inputs.groups) * inputs.Kh * inputs.Kw;
    const biasParams = biasFlag ? inputs.Cout : 0;
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
