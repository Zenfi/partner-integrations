const fs = require('fs');
const path = require('path');
global.btoa = require('btoa');
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

describe('.calculateRemainingPayments', () => {
  it('calculates the approximate amount of payments to end the credit', () => {
    const data = {
      amount: 220000,
      monthlyPayment: 11000,
      interestRate: 10,
    };
    const result = calculateRemainingPayments(data);
    expect(result).toBe(22);
  });

  it('returns a maximum when the credit seems impossible to pay', () => {
    const data = {
      amount: 220000,
      monthlyPayment: 1,
      interestRate: 100,
    };
    const result = calculateRemainingPayments(data);
    expect(result).toBe(360);
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

describe('.buildYaveLink', () => {
  it('returns the simple savings calculation', () => {
    const result = buildYaveLink({
      credit_balance: 500000,
      monthly_payment: 12000,
      credit_opening_month: 1,
      credit_opening_year: 2019,
      credit_term_years: 20,
      total_value: 1200000,
      last_name1: 'Del Toro',
      last_name2: 'Gonzalez',
      street: 'José Clemente Orozco',
      names: 'Guillermo',
      ext_number: '320',
      rfc: 'DEGO56010197A',
      employment_status: '1',
      postal_code: '55000',
      email: 'g@deltoro.com',
      state_id: 14,
      monthly_income: 50000,
    });
    expect(result).toBe('https://yave.mx/zenfi?p=eyJiYWxhbmNlX3BheWFibGUiOjUwMDAwMCwiY3VycmVudF9wYXltZW50IjoxMjAwMCwiY3JlZGl0X3N0YXJ0X21vbnRoIjoxLCJjcmVkaXRfc3RhcnRfeWVhciI6MjAxOSwib3JpZ2luYWxfdGVybSI6MjAsInBheW1lbnRfdHlwZSI6bnVsbCwieWVhcnNfZW1wbG95ZWQiOm51bGwsIm1vbnRoc19lbXBsb3llZCI6bnVsbCwiaGFzX2NvYXBwbGljYW50IjpudWxsLCJwcm9wZXJ0eV92YWx1ZSI6MTIwMDAwMCwibGFzdF9uYW1lIjoiRGVsIFRvcm8iLCJzZWNvbmRfbGFzdF9uYW1lIjoiR29uemFsZXoiLCJzdHJlZXQiOiJKb3PpIENsZW1lbnRlIE9yb3pjbyIsImNpdHkiOm51bGwsIm5hbWVzIjoiR3VpbGxlcm1vIiwiZXh0X251bSI6IjMyMCIsImludF9udW0iOm51bGwsImFkZHJlc3NfbmVpZ2hib3Job29kIjpudWxsLCJyZmMiOiJERUdPNTYwMTAxOTdBIiwiaW5jb21lX3R5cGUiOjEsImNwIjoiNTUwMDAiLCJlbWFpbCI6ImdAZGVsdG9yby5jb20iLCJzdGF0ZSI6MTQsInNhbGFyeSI6NTAwMDB9');
  });
});
