import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

import './App.css';

const App = () => {
  const [inputs, setInputs] = useState({
    currentBalance: 50000,
    monthlyContribution: 1000,
    expectedReturn: 7,
    yearsToRetirement: 30
  });
  
  const [results, setResults] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [errors, setErrors] = useState({});

  /**
   * Calculate future value using compound interest with monthly contributions
   * Formula: FV = P * (1 + r/n)^(n*t) + C * (((1 + r/n)^(n*t) - 1) / (r/n))
   * Where:
   * P = Principal (current balance)
   * r = Annual interest rate (as decimal)
   * n = Number of times interest compounds per year (12 for monthly)
   * t = Number of years
   * C = Monthly contribution
   */
  const calculateFutureValue = (principal, monthlyContrib, annualRate, years) => {
    const r = annualRate / 100; // Convert percentage to decimal
    const n = 12; // Monthly compounding
    const t = years;
    
    // Future value of current principal
    const fvPrincipal = principal * Math.pow(1 + r/n, n*t);
    
    // Future value of monthly contributions (annuity)
    const monthlyRate = r/n;
    const fvContributions = monthlyContrib * (Math.pow(1 + monthlyRate, n*t) - 1) / monthlyRate;
    
    return fvPrincipal + fvContributions;
  };

  /**
   * Calculate monthly income from a 20-year fixed annuity at 4% annual interest
   * Formula: PMT = PV * (r * (1 + r)^n) / ((1 + r)^n - 1)
   * Where:
   * PV = Present value (retirement balance)
   * r = Monthly interest rate (4%/12)
   * n = Total number of payments (20 years * 12 months)
   */
  const calculateMonthlyIncome = (retirementBalance) => {
    const annualRate = 0.04; // 4% annual interest
    const monthlyRate = annualRate / 12;
    const totalPayments = 20 * 12; // 20 years * 12 months
    
    const monthlyIncome = retirementBalance * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return monthlyIncome;
  };

  /**
   * Generate year-by-year portfolio growth data for charting
   */
  const generateYearlyData = (principal, monthlyContrib, annualRate, years) => {
    const data = [];
    for (let year = 0; year <= years; year++) {
      const balance = calculateFutureValue(principal, monthlyContrib, annualRate, year);
      data.push({
        year,
        balance: Math.round(balance)
      });
    }
    return data;
  };

  /**
   * Validate input values
   */
  const validateInputs = (inputValues) => {
    const newErrors = {};
    
    if (!inputValues.currentBalance || inputValues.currentBalance < 0) {
      newErrors.currentBalance = 'Current balance must be a positive number';
    }
    
    if (inputValues.monthlyContribution < 0) {
      newErrors.monthlyContribution = 'Monthly contribution cannot be negative';
    }
    
    if (!inputValues.expectedReturn || inputValues.expectedReturn < -20 || inputValues.expectedReturn > 50) {
      newErrors.expectedReturn = 'Expected return should be between -20% and 50%';
    }
    
    if (!inputValues.yearsToRetirement || inputValues.yearsToRetirement < 1 || inputValues.yearsToRetirement > 70) {
      newErrors.yearsToRetirement = 'Years to retirement should be between 1 and 70';
    }
    
    return newErrors;
  };

  /**
   * Calculate results for all scenarios
   */
  const calculateResults = () => {
    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setResults(null);
      setScenarios([]);
      setChartData([]);
      return;
    }

    const { currentBalance, monthlyContribution, expectedReturn, yearsToRetirement } = inputs;
    
    // Base scenario calculation
    const projectedValue = calculateFutureValue(currentBalance, monthlyContribution, expectedReturn, yearsToRetirement);
    const monthlyIncome = calculateMonthlyIncome(projectedValue);
    
    const baseResult = {
      projected_value: Math.round(projectedValue * 100) / 100,
      monthly_income: Math.round(monthlyIncome * 100) / 100
    };
    
    setResults(baseResult);

    // Three-scenario simulation
    const conservativeRate = Math.max(expectedReturn - 2, 1); // Conservative: -2%
    const optimisticRate = expectedReturn + 2; // Optimistic: +2%
    
    const scenarioData = [
      {
        name: 'Conservative',
        rate: conservativeRate,
        projectedValue: calculateFutureValue(currentBalance, monthlyContribution, conservativeRate, yearsToRetirement),
        color: '#ef4444'
      },
      {
        name: 'Base Case',
        rate: expectedReturn,
        projectedValue: projectedValue,
        color: '#3b82f6'
      },
      {
        name: 'Optimistic',
        rate: optimisticRate,
        projectedValue: calculateFutureValue(currentBalance, monthlyContribution, optimisticRate, yearsToRetirement),
        color: '#10b981'
      }
    ];
    
    scenarioData.forEach(scenario => {
      scenario.monthlyIncome = calculateMonthlyIncome(scenario.projectedValue);
    });
    
    setScenarios(scenarioData);

    // Generate chart data
    const chartYears = Math.min(yearsToRetirement, 40); // Limit chart to 40 years for readability
    const data = [];
    
    for (let year = 0; year <= chartYears; year++) {
      const dataPoint = { year };
      scenarioData.forEach(scenario => {
        const balance = calculateFutureValue(currentBalance, monthlyContribution, scenario.rate, year);
        dataPoint[scenario.name] = Math.round(balance);
      });
      data.push(dataPoint);
    }
    
    setChartData(data);
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [inputs]);

  /**
   * Format currency for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  /**
   * Format large numbers with commas
   */
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Retirement Portfolio Forecasting Tool</h1>
              <p className="text-gray-600 mt-1">Project your retirement savings and estimate future income</p>
            </div>
          </div>

          {/* Input Form */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Portfolio Balance ($)
              </label>
              <input
                type="number"
                value={inputs.currentBalance}
                onChange={(e) => handleInputChange('currentBalance', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentBalance ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50000"
                min="0"
                step="1000"
              />
              {errors.currentBalance && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.currentBalance}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                value={inputs.monthlyContribution}
                onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.monthlyContribution ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1000"
                min="0"
                step="100"
              />
              {errors.monthlyContribution && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.monthlyContribution}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                value={inputs.expectedReturn}
                onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expectedReturn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="7"
                min="-20"
                max="50"
                step="0.5"
              />
              {errors.expectedReturn && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.expectedReturn}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Years Until Retirement
              </label>
              <input
                type="number"
                value={inputs.yearsToRetirement}
                onChange={(e) => handleInputChange('yearsToRetirement', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.yearsToRetirement ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
                min="1"
                max="70"
                step="1"
              />
              {errors.yearsToRetirement && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.yearsToRetirement}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Plain Text Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Projection Results</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Projected Value at Retirement:</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(results.projected_value)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Estimated Monthly Income (20-year annuity at 4%):</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(results.monthly_income)}</p>
                </div>
              </div>
            </div>

            {/* JSON Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-mono">{'{}'}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">JSON Output</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
{JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Three-Scenario Analysis */}
        {scenarios.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Three-Scenario Analysis</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {scenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4" style={{borderColor: scenario.color}}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: scenario.color}}></div>
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    <span className="text-sm text-gray-500">({scenario.rate}%)</span>
                  </div>
                  <p className="text-sm text-gray-600">Portfolio Value:</p>
                  <p className="text-lg font-bold" style={{color: scenario.color}}>
                    {formatCurrency(scenario.projectedValue)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Monthly Income:</p>
                  <p className="text-md font-semibold" style={{color: scenario.color}}>
                    {formatCurrency(scenario.monthlyIncome)}
                  </p>
                </div>
              ))}
            </div>

            {/* Portfolio Growth Chart */}
            <div className="h-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Growth Projection</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    label={{ value: 'Years', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                    label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelFormatter={(year) => `Year ${year}`}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc', 
                      borderRadius: '6px' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Conservative" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Base Case" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Optimistic" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Formula Reference */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Formulas Used</h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold">Future Value with Monthly Contributions:</h3>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                FV = P × (1 + r/n)^(n×t) + C × (((1 + r/n)^(n×t) - 1) / (r/n))
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Where: P = Principal, r = Annual rate, n = 12 (monthly), t = Years, C = Monthly contribution
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Monthly Annuity Income (20 years at 4%):</h3>
              <p className="font-mono bg-gray-100 p-2 rounded mt-1">
                PMT = PV × (r × (1 + r)^n) / ((1 + r)^n - 1)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Where: PV = Retirement balance, r = Monthly rate (4%/12), n = 240 payments (20×12)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;