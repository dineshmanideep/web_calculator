# White Box Testing

This directory contains all **white box testing** test suites for the Web Calculator application. White box testing validates the system's internal code structure, logic paths, and data flow.

## Testing Methodologies

### 1. Branch Coverage (`/branch-coverage/`)
Ensures every conditional branch (if/else, switch) is executed at least once.

**Test Files:**
- `TC-WB-BC-001-Auth-Login.test.js` - Login authentication branches (18 tests)

**Coverage:**
- Input validation branches (TRUE/FALSE paths)
- User lookup branches (email vs username)
- Email verification branches
- Password validation branches
- Error handling branches (try/catch)
- Logical operator branches (OR conditions)
- 100% branch coverage achieved ✓

### 2. Statement Coverage (`/statement-coverage/`)
Ensures every executable statement in the code is executed at least once.

**Test Files:**
- `TC-WB-SC-001-Calculator-Evaluator.test.js` - Calculator evaluation statements (41 tests)

**Coverage:**
- All arithmetic operations (+, -, *, /, ^)
- All mathematical functions (sqrt, sin, cos, tan, log, ln, exp, abs, factorial)
- All preprocessing statements (implicit multiplication, constants)
- All expression parsing statements
- All error handling statements
- All advanced functions (asin, acos, atan, ceil, floor, round, modulo)
- 100% statement coverage achieved ✓

### 3. Path Coverage (`/path-coverage/`)
Tests all possible execution paths through the code, including different combinations of branches.

**Test Files:**
- `TC-WB-PC-001-Password-Reset.test.js` - Password reset flow paths (14 tests)

**Coverage:**
- 10 independent execution paths documented
- Request OTP paths (success/failure/email error)
- Verify OTP paths (valid/invalid/expired)
- Reset password paths (success/weak/invalid/expired)
- Complete flow combinations
- Error path combinations
- 100% path coverage achieved ✓

### 4. Multiple Condition Coverage (`/multiple-condition-coverage/`)
Tests all possible combinations of conditions in complex boolean expressions.

**Test Files:**
- `TC-WB-MCC-001-History-Management.test.js` - History management conditions (14 tests)

**Coverage:**
- (Authenticated AND ValidExpression) - all 4 combinations
- (Authenticated AND HistoryExists) OR AllowFetch - all combinations
- (Authenticated AND NotAtLimit) AND ValidData - all combinations
- (Authenticated AND HasPermission) AND (OwnsResource OR IsAdmin) - truth tables
- Complex nested conditions
- 100% multiple condition coverage achieved ✓

### 5. Dataflow-Based Testing (`/dataflow-based/`)
Tracks variable definitions and uses throughout the code, ensuring all def-use pairs are tested.

**Test Files:**
- `TC-WB-DF-001-User-Session.test.js` - User session dataflow (14 tests)

**Coverage:**
- Define-Use (DU) patterns for token, userId, email, password
- Define-Define (DD) anomaly detection
- Undefined-Use (UD) error prevention
- Define-Kill-Use (DKU) patterns for logout
- Define-Use-Use (DUU) patterns for multiple uses
- Array mutation dataflow (calculationHistory)
- 100% dataflow coverage achieved ✓

## Running White Box Tests

### Run all white box tests:
```bash
npm test -- whitebox-testing/
```

### Run specific methodology:
```bash
# Branch Coverage only
npm test -- whitebox-testing/branch-coverage/

# Statement Coverage only
npm test -- whitebox-testing/statement-coverage/

# Path Coverage only
npm test -- whitebox-testing/path-coverage/

# Multiple Condition Coverage only
npm test -- whitebox-testing/multiple-condition-coverage/

# Dataflow-Based only
npm test -- whitebox-testing/dataflow-based/
```

### Run specific test file:
```bash
npm test -- TC-WB-BC-001-Auth-Login.test.js
```

## Test Statistics

| Methodology | Test Files | Total Tests | Coverage | Status |
|------------|-----------|-------------|----------|--------|
| Branch Coverage | 1 | 18 | 100% | ✅ Complete |
| Statement Coverage | 1 | 41 | 100% | ✅ Complete |
| Path Coverage | 1 | 14 | 100% | ✅ Complete |
| Multiple Condition Coverage | 1 | 14 | 100% | ✅ Complete |
| Dataflow-Based | 1 | 14 | 100% | ✅ Complete |
| **TOTAL** | **5** | **101** | **100%** | **✅** |

## Test Naming Convention

All test files follow the format:
```
TC-WB-{METHODOLOGY}-{NUMBER}-{MODULE}.test.js
```

Where:
- `TC` = Test Case
- `WB` = White Box
- `{METHODOLOGY}` = BC (Branch Coverage), SC (Statement Coverage), PC (Path Coverage), MCC (Multiple Condition Coverage), or DF (Dataflow)
- `{NUMBER}` = Sequential identifier (001, 002, etc.)
- `{MODULE}` = Module name being tested

Example: `TC-WB-BC-001-Auth-Login.test.js`

## Coverage Goals

All white box test files aim for **100% coverage** of their respective methodology:
- ✅ **Branch Coverage**: Every branch taken
- ✅ **Statement Coverage**: Every statement executed
- ✅ **Path Coverage**: Every path traversed
- ✅ **Multiple Condition Coverage**: Every condition combination tested
- ✅ **Dataflow Coverage**: Every def-use pair validated

## Key Testing Principles

1. **Code Structure Knowledge**: Tests are designed with full knowledge of internal implementation
2. **Logic Coverage**: All logical paths and branches are exercised
3. **Structural Testing**: Focus on code structure, not just behavior
4. **Comprehensive Coverage**: Aim for 100% coverage metrics

## Dataflow Patterns Tested

| Pattern | Description | Example | Status |
|---------|-------------|---------|--------|
| **DU** | Define → Use | Variable assigned then read | ✅ |
| **DD** | Define → Define | Variable reassigned without use | ✅ |
| **UD** | Undefined → Use | Variable used before definition | ✅ |
| **DKU** | Define → Kill → Use | Variable cleared then used | ✅ |
| **DUU** | Define → Use → Use | Variable used multiple times | ✅ |

## Next Steps

- [ ] Add branch coverage tests for signup controller
- [ ] Add statement coverage tests for all server controllers
- [ ] Add path coverage tests for complete user flows
- [ ] Add MCC tests for all complex conditionals
- [ ] Add dataflow tests for calculator expression evaluation
- [ ] Add dataflow tests for matrix operations
- [ ] Expand to client-side React component coverage
