# Black Box Testing

This directory contains all **black box testing** test suites for the Web Calculator application. Black box testing validates the system's external behavior without considering internal code structure.

## Testing Methodologies

### 1. Boundary Analysis (`/boundary-analysis/`)
Tests the behavior at and around boundary values of input domains.

**Test Files:**
- `TC-BB-BA-001-Auth-Login.test.js` - Authentication login boundaries (25 tests)
- `TC-BB-BA-002-Calculator-Input.test.js` - Calculator input boundaries (53 tests)
- `TC-BB-BA-003-Matrix-Operations.test.js` - Matrix operation boundaries (42 tests)

**Coverage:**
- Email/username/password length boundaries
- Number range boundaries (MIN_VALUE, MAX_VALUE, MAX_SAFE_INTEGER)
- Decimal precision limits
- Expression length limits (1-500+ characters)
- Matrix dimension boundaries (1x1 to 10x10)
- Special values (Infinity, NaN, 0, negative numbers)
- Edge cases for mathematical operations

### 2. Equivalence Class Partitioning (`/equivalence-class-partitioning/`)
Divides input domain into classes where all members should behave identically.

**Test Files:**
- `TC-BB-ECP-001-User-Registration.test.js` - User registration input classes (45+ tests)

**Coverage:**
- Valid/invalid email formats
- Strong/weak/invalid passwords
- Valid/invalid usernames
- Valid/invalid full names
- Valid/invalid/expired OTP codes

## Running Black Box Tests

### Run all black box tests:
```bash
npm test -- blackbox-testing/
```

### Run specific methodology:
```bash
# Boundary Analysis only
npm test -- blackbox-testing/boundary-analysis/

# Equivalence Class Partitioning only
npm test -- blackbox-testing/equivalence-class-partitioning/
```

### Run specific test file:
```bash
npm test -- TC-BB-BA-001-Auth-Login.test.js
```

## Test Statistics

| Methodology | Test Files | Total Tests | Status |
|------------|-----------|-------------|--------|
| Boundary Analysis | 3 | 120 | ✅ Complete |
| Equivalence Class Partitioning | 1 | 45+ | ✅ Complete |
| **TOTAL** | **4** | **165+** | **✅** |

## Test Naming Convention

All test files follow the format:
```
TC-BB-{METHODOLOGY}-{NUMBER}-{MODULE}.test.js
```

Where:
- `TC` = Test Case
- `BB` = Black Box
- `{METHODOLOGY}` = BA (Boundary Analysis) or ECP (Equivalence Class Partitioning)
- `{NUMBER}` = Sequential identifier (001, 002, etc.)
- `{MODULE}` = Module name being tested

Example: `TC-BB-BA-001-Auth-Login.test.js`

## Coverage Goals

- ✅ **Boundary Analysis**: Test all critical boundaries for inputs
- ✅ **Equivalence Classes**: Test representative from each input class
- ✅ **Edge Cases**: Cover extreme values, special cases, and error conditions
- ✅ **Error Handling**: Verify proper error messages and status codes

## Key Testing Principles

1. **No Code Knowledge**: Tests focus only on input/output behavior
2. **User Perspective**: Tests simulate real user interactions
3. **Specification-Based**: Tests validate against requirements
4. **External Behavior**: Only observable behavior is tested

## Next Steps

- [ ] Add more boundary analysis tests for plotting functionality
- [ ] Add more ECP tests for calculator expressions
- [ ] Add ECP tests for matrix input classes
- [ ] Add boundary tests for angle conversions
- [ ] Add ECP tests for admin functionality
