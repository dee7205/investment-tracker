import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'investment-tracker-data';

const defaultState = {
  totalMoneyPool: 0,
  investments: [],
  returns: [],
  manualTransactions: [],
  transactions: [],
  settings: { setupComplete: false, setupDate: null },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return { ...defaultState };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function useStore() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // --- Derived values ---
  const activeInvestments = state.investments.filter(i => i.status === 'Active');
  const closedInvestments = state.investments.filter(i => i.status === 'Closed');
  const activeCapital = activeInvestments.reduce((sum, i) => sum + i.amount, 0);
  const totalInvested = state.investments.reduce((sum, i) => sum + i.amount, 0);
  const totalReturns = state.returns.reduce((sum, r) => sum + r.amount, 0);
  const totalWithdrawals = state.manualTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Track via transactions
  const computeAvailableBalance = () => {
    if (state.transactions.length === 0) return state.totalMoneyPool;
    return state.transactions[state.transactions.length - 1].balanceAfter;
  };

  const availBal = computeAvailableBalance();
  const expectedMonthlyIncome = activeCapital * 0.10;
  const netProfit = totalReturns;
  const breakEvenProgress = totalInvested > 0 ? Math.min((totalReturns / totalInvested) * 100, 100) : 0;
  const monthsUntilRecovery = expectedMonthlyIncome > 0 ? Math.ceil((totalInvested - totalReturns) / expectedMonthlyIncome) : null;

  // Helper: find investment by ID
  const getInvestment = (id) => state.investments.find(i => i.id === id);

  // Helper: returns per investment
  const getReturnsForInvestment = (investmentId) =>
    state.returns.filter(r => r.investmentId === investmentId);

  // --- Actions ---
  const initializePool = useCallback((amount) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      totalMoneyPool: amount,
      settings: { setupComplete: true, setupDate: now },
      transactions: [{
        id: uuidv4(),
        date: now,
        type: 'Initial Setup',
        description: `Total money pool initialized at ₱${amount.toLocaleString()}`,
        amount: amount,
        balanceAfter: amount,
      }],
    }));
  }, []);

  const addInvestment = useCallback((date, amount, notes) => {
    const id = uuidv4();
    setState(prev => {
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance - amount;
      return {
        ...prev,
        investments: [...prev.investments, {
          id,
          date,
          amount,
          notes,
          status: 'Active',
          expectedReturn: amount * 0.10,
        }],
        transactions: [...prev.transactions, {
          id: uuidv4(),
          date,
          type: 'Capital Given',
          description: `Capital investment: ${notes || 'No notes'}`,
          amount: -amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  const closeInvestment = useCallback((investmentId) => {
    setState(prev => {
      const inv = prev.investments.find(i => i.id === investmentId);
      if (!inv || inv.status === 'Closed') return prev;
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance + inv.amount;
      return {
        ...prev,
        investments: prev.investments.map(i =>
          i.id === investmentId ? { ...i, status: 'Closed' } : i
        ),
        transactions: [...prev.transactions, {
          id: uuidv4(),
          date: new Date().toISOString(),
          type: 'Capital Returned',
          description: `Investment closed — capital returned (${inv.notes || 'No notes'})`,
          amount: inv.amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  // Updated: now takes investmentId to link return to specific investment
  const recordReturn = useCallback((date, amount, investmentId) => {
    const id = uuidv4();
    setState(prev => {
      const investment = prev.investments.find(i => i.id === investmentId);
      const expected = investment ? investment.amount * 0.10 : 0;
      const warning = amount < expected;
      const invLabel = investment ? (investment.notes || `₱${investment.amount.toLocaleString()} investment`) : 'Unknown';
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance + amount;
      return {
        ...prev,
        returns: [...prev.returns, {
          id,
          date,
          amount,
          expected,
          warning,
          investmentId,
          investmentNotes: invLabel,
        }],
        transactions: [...prev.transactions, {
          id: uuidv4(),
          date,
          type: 'Return Received',
          description: `Return from: ${invLabel}${warning ? ' ⚠️ Below expected' : ''}`,
          amount: amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  // Updated: now takes sourceType and sourceId for linking
  const addManualTransaction = useCallback((date, type, description, amount, sourceType = 'general', sourceId = null) => {
    const id = uuidv4();
    setState(prev => {
      let sourceLabel = '';
      if (sourceType === 'investment' && sourceId) {
        const inv = prev.investments.find(i => i.id === sourceId);
        sourceLabel = inv ? ` (from investment: ${inv.notes || `₱${inv.amount.toLocaleString()}`})` : '';
      } else if (sourceType === 'return' && sourceId) {
        const ret = prev.returns.find(r => r.id === sourceId);
        sourceLabel = ret ? ` (from return: ${ret.investmentNotes || `₱${ret.amount.toLocaleString()}`})` : '';
      }

      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance - amount;
      return {
        ...prev,
        manualTransactions: [...prev.manualTransactions, {
          id,
          date,
          type,
          description,
          amount,
          sourceType,
          sourceId,
        }],
        transactions: [...prev.transactions, {
          id: uuidv4(),
          date,
          type,
          description: `${description}${sourceLabel}`,
          amount: -amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState({ ...defaultState });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    ...state,
    activeCapital,
    activeInvestments,
    closedInvestments,
    totalReturns,
    totalWithdrawals,
    availableBalance: availBal,
    expectedMonthlyIncome,
    netProfit,
    breakEvenProgress,
    monthsUntilRecovery,
    totalInvested,
    getInvestment,
    getReturnsForInvestment,
    initializePool,
    addInvestment,
    closeInvestment,
    recordReturn,
    addManualTransaction,
    resetAll,
  };
}
