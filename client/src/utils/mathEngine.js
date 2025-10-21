import math from "./mathSetup";
  // convert input string for mathjs - handle pi, e, factorial token compatibility, and degree mode for trig
  export const preprocess = (expr,lastAnswer,angleMode) => {
    
    let s = expr.replace(/Ans/g, lastAnswer || "0"); // allow Ans
    // s = s.replace(/pi/g, "pi"); // mathjs understands pi
    // s = s.replace(/√/g, "sqrt"); // optional
    // For degree mode we wrap trig functions: sin(x) -> sin(x * pi/180)
    if (angleMode === "deg") {
      // simpler approach: replace sin( with sin(deg2rad( ... ) ), implement deg2rad
      // define deg2rad in math scope below
      s = s.replace(/sin\(([^)]+)\)/g, "sin(deg2rad($1))")
     .replace(/cos\(([^)]+)\)/g, "cos(deg2rad($1))")
     .replace(/tan\(([^)]+)\)/g, "tan(deg2rad($1))")
     .replace(/asin\(([^)]+)\)/g, "rad2deg(asin($1))")
     .replace(/acos\(([^)]+)\)/g, "rad2deg(acos($1))")
     .replace(/atan\(([^)]+)\)/g, "rad2deg(atan($1))");
    }
    return s;
  };



  // Evaluate expression using mathjs
  export const evaluateExpression = (expr,lastAnswer,angleMode) => {
    if (!expr || expr.trim() === "") throw new Error("Empty expression");
    const pre = preprocess(expr,lastAnswer,angleMode);
    // allow matrix literal like [[1,2],[3,4]]
    const scope = { i: math.complex(0,1) }; // complex unit
    const node = math.parse(pre);
    // evaluate
    const res = node.evaluate(scope);
    return res;
  };