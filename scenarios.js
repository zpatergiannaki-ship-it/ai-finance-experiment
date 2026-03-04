'use strict';

module.exports = {
  scenario1: {
    description: 'Financing Choice: participant needs €3,000 for unexpected home repair.',
    options: {
      creditCard: {
        name: 'Credit Card',
        limit: 5000,
        apr: 18,
        repayment: 'flexible',
        minimumMonthlyPayment: '5% of outstanding balance',
        fixedSchedule: false,
      },
      personalLoan: {
        name: 'Personal Loan',
        amount: 3000,
        apr: 6.5,
        termMonths: 24,
        monthlyInstallment: 134,
        fixedSchedule: true,
      },
    },
    recommendation: 'personal_loan',
  },

  scenario2: {
    description: 'Investment Allocation Simulation: participant manages €10,000 across 4 assets over 4 rounds.',
    assets: ['cash', 'bonds', 'balancedFund', 'stocks'],
    rounds: [
      {
        roundNumber: 1,
        marketPerformance: { cash: 0.5, bonds: 1.0, balancedFund: 2.0, stocks: 4.0 },
        recommendedAllocation: { cash: 10, bonds: 20, balancedFund: 40, stocks: 30 },
        aiCorrect: true,
      },
      {
        roundNumber: 2,
        marketPerformance: { cash: 0.5, bonds: 0.5, balancedFund: -1.5, stocks: -6.0 },
        recommendedAllocation: { cash: 20, bonds: 30, balancedFund: 40, stocks: 10 },
        aiCorrect: true,
      },
      {
        roundNumber: 3,
        marketPerformance: { cash: 0.5, bonds: -1.0, balancedFund: 1.0, stocks: 5.0 },
        recommendedAllocation: { cash: 25, bonds: 35, balancedFund: 35, stocks: 5 },
        aiCorrect: false, // intentionally conservative — AI must NOT reveal this
      },
      {
        roundNumber: 4,
        marketPerformance: { cash: 0.5, bonds: 0.8, balancedFund: 1.2, stocks: -4.0 },
        recommendedAllocation: { cash: 15, bonds: 30, balancedFund: 40, stocks: 15 },
        aiCorrect: true,
      },
    ],
  },
};