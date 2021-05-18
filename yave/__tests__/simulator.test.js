const fs = require('fs');
const path = require('path');
eval(`${fs.readFileSync(path.join(__dirname, '../simulator.js'))}`);

describe('.getSimpleSavingsPercentage', () => {
  it('returns the first element', () => {
    const result = getSimpleSavingsPercentage(20, 8.5);
    expect(result).toBe(0.0);
  });

  it('returns the last element', () => {
    const result = getSimpleSavingsPercentage(5, 14.75);
    expect(result).toBe(13.25);
  });

  it('returns an element in the middle', () => {
    const result = getSimpleSavingsPercentage(12, 12.25);
    expect(result).toBe(30.09);
  });

  it('returns the nearest element when inputs is not in the exact range', () => {
    const result = getSimpleSavingsPercentage(25, 11.05);
    expect(result).toBe(39.45);
  });
});

describe('.getSimpleSavings', () => {
  it('returns the simple savings calculation', () => {
    const result = getSimpleSavings({
      creditBalance: 1000000,
      interestRate: 9.8,
      remainingYears: 16,
    });
    expect(result).toBe(143600);
  });
});
