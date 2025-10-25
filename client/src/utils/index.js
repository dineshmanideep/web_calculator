import math from './mathCore';
import { basicOperations } from './operations/basicOperations';
import { trigFunctions } from './operations/trigFunctions';
import { angleConversions } from './operations/angleConversions';
import { advancedMath } from './operations/advancedMath';
import { combinatorics } from './operations/combinatorics';

// Import all functions into math
math.import({
  ...basicOperations,
  ...trigFunctions,
  ...angleConversions,
  ...advancedMath,
  ...combinatorics,
  defInt: (exprStr, a, b, n = 1000) => {
    const f = math.parse(exprStr).compile();
    const step = (b - a) / n;
    let sum = 0;
    for (let i = 0; i <= n; i++) {
        const x = a + i * step;
        const fx = f.evaluate({ x });
        sum += (i === 0 || i === n ? fx / 2 : fx);
    }
    return sum * step;
}
}, { override: true });

export default math;