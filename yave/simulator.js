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

function zenfiController() {
  const webhook = 'https://hooks.zapier.com/hooks/catch/6693237/ov3n98i/';
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
      dataKey: 'zipcode',
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

  const sendData = (data) => fetch(webhook, {
    body: JSON.stringify(data),
    method: 'post',
    mode: 'no-cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  });

  const simulateCredit = async (data) => {
    const newInterestRate = defaultYaveInterest;
    const termYears = parseInt(data.credit_remaining_years);
    const currentPayment = parseInt(data.monthly_payment);
    const yaveTerms = Math.min(20, termYears);
    const simulationInput = {
      product_name: 'FIXED_PAYMENT',
      term: yaveTerms,
      rate: data.interest_rate,
      property_value: data.total_value,
      loan_requested: data.credit_balance,
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
    console.log('INPUT', simulationInput);
    console.log('OUTPUT', payload);
    const payment = payload.payment;
    const totalYavePayment = 12 * yaveTerms * payment;
    const totalCurrentPayment = 12 * termYears * currentPayment;
    const totalSavings = totalCurrentPayment - totalYavePayment;
    const monthlySavings = totalSavings / (12 * yaveTerms);
    mergeInCookie({
      yave_monthly_payment: payment,
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
