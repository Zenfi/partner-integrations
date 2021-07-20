// Requires: https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js

function formatNumber(num, decimals = 0) {
  const options = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return parseFloat(num).toLocaleString('en-US', options);
}

function formatMoney(num, decimals = 0) {
  return `$${formatNumber(num, decimals)}`
}

function formatPercentage(num, decimals = 0) {
  return `${formatNumber(num, decimals)}%`
}

function b64DecodeUnicode(str) {
  // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
  return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function getSimpleSavingsPercentage(remainingYears, interest) {
  const clampInt = (min, max, value) => Math.max(min, Math.min(max, parseInt(value)));
  const savings = [
    // Remaining years: 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5
    [0.0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00], // 8.50%
    [3.81, 3.56, 3.31, 3.06, 2.81, 2.57, 2.32, 2.08, 1.84, 1.61, 1.39, 1.17, 0.97, 0.77, 0.59, 0.43], // 8.75%
    [7.66, 7.16, 6.66, 6.16, 5.66, 5.16, 4.67, 4.19, 3.71, 3.25, 2.80, 2.36, 1.95, 1.56, 1.20, 0.87], // 9.00%
    [11.53, 10.78, 10.03, 9.28, 8.53, 7.79, 7.05, 6.32, 5.61, 4.91, 4.23, 3.57, 2.94, 2.36, 1.81, 1.32], // 9.25%
    [15.43, 14.43, 13.43, 12.43, 11.43, 10.44, 9.45, 8.48, 7.52, 6.59, 5.67, 4.80, 3.96, 3.17, 2.44, 1.77], // 9.50%
    [19.37, 18.12, 16.86, 15.61, 14.36, 13.12, 11.88, 10.66, 9.46, 8.29, 7.14, 6.04, 4.99, 3.99, 3.07, 2.24], // 9.75%
    [23.33, 21.83, 20.32, 18.82, 17.32, 15.82, 14.34, 12.87, 11.43, 10.01, 8.63, 7.30, 6.03, 4.83, 3.72, 2.71], // 10.00%
    [27.32, 25.56, 23.81, 22.05, 20.30, 18.55, 16.82, 15.10, 13.41, 11.76, 10.14, 8.58, 7.09, 5.69, 4.38, 3.19], // 10.25%
    [31.33, 29.33, 27.32, 25.31, 23.31, 21.31, 19.32, 17.36, 15.42, 13.52, 11.67, 9.88, 8.17, 6.55, 5.05, 3.68], // 10.50%
    [35.38, 33.12, 30.86, 28.60, 26.34, 24.09, 21.85, 19.64, 17.45, 15.31, 13.22, 11.20, 9.26, 7.43, 5.73, 4.18], // 10.75%
    [39.45, 36.94, 34.43, 31.92, 29.40, 26.90, 24.41, 21.94, 19.51, 17.12, 14.79, 12.53, 10.37, 8.32, 6.42, 4.69], // 11.00%
    [43.54, 40.79, 38.03, 35.26, 32.49, 29.73, 26.99, 24.27, 21.58, 18.94, 16.37, 13.88, 11.49, 9.23, 7.12, 5.20], // 11.25%
    [47.67, 44.66, 41.64, 38.62, 35.60, 32.59, 29.59, 26.61, 23.68, 20.79, 17.98, 15.25, 12.63, 10.15, 7.83, 5.72], // 11.50%
    [51.81, 48.56, 45.29, 42.01, 38.74, 35.47, 32.21, 28.99, 25.80, 22.66, 19.60, 16.63, 13.78, 11.08, 8.55, 6.26], // 11.75%
    [55.98, 52.48, 48.96, 45.43, 41.90, 38.37, 34.86, 31.38, 27.93, 24.55, 21.24, 18.03, 14.94, 12.02, 9.29, 6.80], // 12.00%
    [60.18, 56.42, 52.65, 48.86, 45.08, 41.30, 37.53, 33.79, 30.09, 26.46, 22.90, 19.44, 16.13, 12.97, 10.03, 7.34], // 12.25%
    [64.40, 60.39, 56.36, 52.32, 48.28, 44.24, 40.22, 36.23, 32.27, 28.38, 24.57, 20.88, 17.32, 13.94, 10.78, 7.90], // 12.50%
    [68.64, 64.38, 60.10, 55.81, 51.51, 47.21, 42.93, 38.68, 34.47, 30.33, 26.27, 22.32, 18.53, 14.92, 11.55, 8.46], // 12.75%
    [72.90, 68.39, 63.86, 59.31, 54.76, 50.21, 45.67, 41.16, 36.69, 32.29, 27.98, 23.79, 19.75, 15.91, 12.32, 9.03], // 13.00%
    [77.19, 72.42, 67.64, 62.84, 58.03, 53.22, 48.42, 43.65, 38.93, 34.27, 29.71, 25.27, 20.99, 16.92, 13.10, 9.61], // 13.25%
    [81.49, 76.48, 71.44, 66.39, 61.32, 56.25, 51.20, 46.17, 41.18, 36.27, 31.45, 26.76, 22.24, 17.93, 13.90, 10.20], // 13.50%
    [85.82, 80.56, 75.27, 69.95, 64.63, 59.30, 53.99, 48.70, 43.46, 38.29, 33.21, 28.27, 23.50, 18.96, 14.70, 10.79], // 13.75%
    [90.17, 84.65, 79.11, 73.54, 67.96, 62.38, 56.80, 51.25, 45.75, 40.32, 34.99, 29.79, 24.78, 20.00, 15.52, 11.40], // 14.00%
    [94.53, 88.77, 82.97, 77.15, 71.31, 65.47, 59.63, 53.82, 48.06, 42.37, 36.78, 31.33, 26.07, 21.05, 16.34, 12.01], // 14.25%
    [98.92, 92.91, 86.85, 80.78, 74.68, 68.58, 62.48, 56.41, 50.39, 44.44, 38.59, 32.89, 27.38, 22.11, 17.17, 12.63], // 14.50%
    [103.33, 97.06, 90.76, 84.42, 78.07, 71.71, 65.35, 59.02, 52.73, 46.52, 40.41, 34.45, 28.69, 23.19, 18.01, 13.25], // 14.75%
  ];
  const indexPerInterestRate = clampInt(0, 25, interest * 4 - 34);
  const indexPerRemainingYears = clampInt(0, 15, 20 - remainingYears);
  return savings[indexPerInterestRate][indexPerRemainingYears];
}

function getSimpleSavings({ creditBalance, remainingYears, interestRate }) {
  const savingsPercentage = getSimpleSavingsPercentage(remainingYears, interestRate);
  return creditBalance * savingsPercentage / 100.0;
}

function calculateRemainingPayments({ amount, monthlyPayment, interestRate, count = 0 }) {
  if (count >= 360 || amount <= 0) return count;
  const interest = amount * (interestRate / (12 * 100));
  const capital = monthlyPayment - interest;
  return calculateRemainingPayments({
    monthlyPayment,
    interestRate,
    amount: amount - capital,
    count: count + 1,
  });
};

function buildYaveLink(data) {
  const get = (key) => (data || {})[key] || null;
  const yaveData = {
    balance_payable: get('credit_balance'),
    current_payment: get('monthly_payment'),
    credit_start_month: get('credit_opening_month'),
    credit_start_year: get('credit_opening_year'),
    original_term: get('credit_term_years'),
    payment_type: null,
    years_employed: null,
    months_employed: null,
    has_coapplicant: null,
    property_value: get('total_value'),
    last_name: get('last_name1'),
    second_last_name: get('last_name2'),
    street: get('street'),
    city: null,
    names: get('names'),
    ext_num: get('ext_number'),
    int_num: get('int_number'),
    address_neighborhood: null,
    rfc: get('rfc'),
    income_type: get('employment_status') ? parseInt(get('employment_status')) : null,
    cp: get('postal_code'),
    email: get('email'),
    state: get('state_id'),
    salary: get('monthly_income'),
  };
  const baseLink = 'https://yave.mx/zenfi?utm_source=Zenfi&utm_medium=Preaprobador&utm_campaign=01-07-2021-Link_Refinanciamiento-PA';
  return `${baseLink}&p=${btoa(JSON.stringify(yaveData, null, 2))}`;
}

function zenfiController() {
  const leadsWebhook = 'https://hooks.zapier.com/hooks/catch/6693237/ov3n98i/';
  const simulatorUrl = 'https://api.yave.mx/simulador/api/v2/simulations/';
  const cookieName = 'zfdata';
  const urlParamName = 'zfdata';
  const defaultYaveInterest = 8.5;
  const minIncome = 20000;
  const fields = [
    // 1st form
    {
      dataKey: 'total_value',
      inputSelector: '#total-value-input',
    },
    {
      dataKey: 'credit_balance',
      inputSelector: '#credit-balance-input',
    },
    {
      dataKey: 'interest_rate',
      inputSelector: '#interest-input',
    },
    {
      dataKey: 'credit_opening_year',
      inputSelector: '#year-input',
    },
    {
      dataKey: 'credit_remaining_years',
      inputSelector: '#remaining-years-input',
    },
    {
      dataKey: 'monthly_payment',
      inputSelector: '#monthly-payment-input',
    },
    {
      dataKey: 'postal_code',
      inputSelector: '#zipcode-input',
    },
    // 2nd form
    {
      dataKey: 'phone_form',
      inputSelector: '#phone-input',
    },
    {
      dataKey: 'employment_status',
      inputSelector: '#employment-input',
    },
    {
      dataKey: 'monthly_income',
      inputSelector: '#monthly-income-input',
    },
  ];
  const labels = [
    {
      dataKey: 'total_savings',
      inputSelector: '#total-savings',
      format: (val) => formatMoney(val, 2)
    },
    {
      dataKey: 'monthly_savings',
      inputSelector: '#monthly-savings',
      format: (val) => formatMoney(val, 2)
    },
    {
      dataKey: 'monthly_payment',
      inputSelector: '#monthly-payment',
      format: (val) => formatMoney(val, 0)
    },
    {
      dataKey: 'yave_monthly_payment',
      inputSelector: '#yave-monthly-payment',
      format: (val) => formatMoney(val, 0)
    },
    {
      dataKey: 'interest_rate',
      inputSelector: '#interest-rate',
      format: (val) => formatPercentage(val, 2)
    },
    {
      dataKey: 'yave_interest_rate',
      inputSelector: '#yave-interest-rate',
      format: (val) => formatPercentage(val, 2)
    },
  ]

  const storeInCookie = data => Cookies.set(cookieName, JSON.stringify(data));

  const loadFromCookie = () => {
    try {
      return JSON.parse(Cookies.get(cookieName)) || {};
    } catch(e) {
      return {};
    }
  };

  const mergeInCookie = data => storeInCookie(Object.assign(loadFromCookie(), data));

  const loadDataFromUrl = () => {
    const urlData = new URLSearchParams(location.search).get(urlParamName);
    if (!urlData) return null;
    try {
      const parsed = JSON.parse(b64DecodeUnicode(urlData));
      parsed.phone_form = parsed.phone // Copy phone
      mergeInCookie(parsed);
      return parsed;
    } catch(e) {
      return null;
    }
  }

  const loadData = () => {
    loadDataFromUrl();
    return loadFromCookie();
  };

  const fillData = () => {
    const data = loadData();
    fields.forEach(field => fillElement(field, data, 'input'));
  };

  const fillLabels = () => {
    const data = loadData();
    labels.forEach(label => fillElement(label, data, 'div'));
  };

  const fillElement = (element, data, type = null) => {
    const value = data[element.dataKey];
    if (!value) return;

    const input = $(element.inputSelector);
    if (!input) return;

    const formatted = element.format ? element.format(value) : value;
    if (type === 'input') input.val(formatted);
    if (type === 'div') input.text(formatted);
  };

  const validateInput = (params) => {
    const input = $(params.inputSelector);
    if (!input) return true;

    const value = input.val();
    if (!value) return false;

    mergeInCookie({ [params.dataKey]: value });
    return true;
  };

  const submitForm = (callback) => {
    fields.forEach(params => validateInput(params));
    if (callback) callback(loadFromCookie());
  };

  const getRejectionReason = (data) => {
    if (parseInt(data.monthly_income) < minIncome) return 'LOW_INCOME';

    // Skipping EMPLOYMENT_STATUS and HIGH_LEVERAGE validations while Yave team tests response.
    // if (String(data.employment_status) !== '1') return 'EMPLOYMENT_STATUS';
    // const leverage = parseInt(data.credit_balance) / parseInt(data.total_value);
    // if (leverage > 0.85) return 'HIGH_LEVERAGE';

    return null;
  };

  const getCreditApproval = (data) => {
    const reason = getRejectionReason(data);
    const status = reason ? 'REJECTED' : 'SUCCEEDED';
    return { status, reason };
  };

  const sendData = (data, webhook) => fetch(webhook || leadsWebhook, {
    body: JSON.stringify(data),
    method: 'post',
    mode: 'no-cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });

  const getSimulatedSavings = async ({ yaveTerms, newInterestRate, totalCurrentPayment, propertyValue, creditBalance }) => {
    const simulationInput = {
      product_name: 'FIXED_PAYMENT',
      term: yaveTerms,
      rate: newInterestRate,
      property_value: propertyValue,
      loan_requested: creditBalance,
      get_table: false
    };
    const response = await fetch(simulatorUrl, {
      body: JSON.stringify(simulationInput),
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'sl-origin': 'service_zenfi'
      },
    });
    const payload = await response.json();
    const monthlyPayment = payload.payment;
    const totalPayment = 12 * yaveTerms * monthlyPayment;
    return totalCurrentPayment - totalPayment;
  };

  const simulateCredit = async (data) => {
    const newInterestRate = defaultYaveInterest;
    const currentInterestRate = parseFloat(data.interest_rate);
    const creditBalance = parseFloat(data.credit_balance);
    const currentPayment = parseInt(data.monthly_payment);
    const inputTerms = parseInt(data.credit_remaining_years);
    const calculatedTerms = Math.ceil(calculateRemainingPayments({
      amount: creditBalance,
      monthlyPayment: currentPayment,
      interestRate: currentInterestRate,
    }) / 12);
    const currentTerms = Math.min(inputTerms, calculatedTerms);
    const yaveTerms = Math.min(20, currentTerms);
    const totalCurrentPayment = 12 * currentTerms * currentPayment;
    const simulatedSavings = await getSimulatedSavings({
      yaveTerms,
      newInterestRate,
      totalCurrentPayment,
      propertyValue: data.total_value,
      creditBalance: data.credit_balance,
    });
    const simpleSavings = getSimpleSavings({
      creditBalance: data.credit_balance,
      interestRate: currentInterestRate,
      remainingYears: yaveTerms,
    });
    const totalSavings = Math.max(simulatedSavings, simpleSavings, 0);
    const monthlySavings = totalSavings / (12 * currentTerms);
    const yaveMonthlyPayment = currentPayment - monthlySavings;
    mergeInCookie({
      yave_monthly_payment: yaveMonthlyPayment,
      yave_interest_rate: newInterestRate,
      monthly_savings: monthlySavings,
      total_savings: totalSavings,
    });
    return { monthlySavings, totalSavings };
  };

  return {
    loadData,
    sendData,
    fillData,
    fillLabels,
    submitForm,
    simulateCredit,
    getCreditApproval,
  };
}

function handleFormSubmit(formSelector, fn) {
  Webflow = Webflow || [];
  Webflow.push(function() {
    $(document).off('submit'); // unbind webflow form handling
    $(formSelector).submit((evt) => { 
      evt.preventDefault();
      window.zenfi.submitForm(fn);
    });
  });
}
