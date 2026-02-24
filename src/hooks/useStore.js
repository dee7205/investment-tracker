import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';

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
  const [isLoading, setIsLoading] = useState(true);

  // --- Initial Load from Supabase ---
  useEffect(() => {
    async function loadCloudData() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: investments } = await supabase.from('investments').select('*');
        const { data: returns } = await supabase.from('returns').select('*');
        const { data: manualTransactions } = await supabase.from('manual_transactions').select('*');
        const { data: ledger } = await supabase.from('ledger').select('*').order('date', { ascending: true });
        const { data: settings } = await supabase.from('settings').select('*').single();

        if (settings) {
          setState({
            totalMoneyPool: parseFloat(settings.total_money_pool),
            investments: (investments || []).map(i => ({ ...i, amount: parseFloat(i.amount) })),
            returns: (returns || []).map(r => ({ ...r, amount: parseFloat(r.amount), expected: parseFloat(r.expected) })),
            manualTransactions: (manualTransactions || []).map(t => ({ ...t, amount: parseFloat(t.amount) })),
            transactions: (ledger || []).map(l => ({ ...l, amount: parseFloat(l.amount), balanceAfter: parseFloat(l.balance_after) })),
            settings: { 
              setupComplete: settings.setup_complete, 
              setupDate: settings.created_at 
            },
          });
        }
      } catch (e) {
        console.error('Cloud load failed:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadCloudData();
  }, []);

  // Sync to LocalStorage (Legacy fallback)
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
  const initializePool = useCallback(async (amount) => {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    // Cloud Sync
    if (supabase) {
      await Promise.all([
        supabase.from('settings').upsert({ 
          id: '00000000-0000-0000-0000-000000000000', 
          total_money_pool: amount, 
          setup_complete: true 
        }),
        supabase.from('ledger').insert({
          id,
          date: now,
          type: 'Initial Setup',
          description: `Total money pool initialized at ₱${amount.toLocaleString()}`,
          amount,
          balance_after: amount
        })
      ]);
    }

    setState(prev => ({
      ...prev,
      totalMoneyPool: amount,
      settings: { setupComplete: true, setupDate: now },
      transactions: [{
        id,
        date: now,
        type: 'Initial Setup',
        description: `Total money pool initialized at ₱${amount.toLocaleString()}`,
        amount: amount,
        balanceAfter: amount,
      }],
    }));
  }, []);

  const addInvestment = useCallback(async (date, amount, notes) => {
    const invId = uuidv4();
    const ledgerId = uuidv4();
    
    setState(prev => {
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance - amount;

      // Cloud Sync
      if (supabase) {
        supabase.from('investments').insert({
          id: invId,
          date,
          amount,
          notes,
          status: 'Active'
        }).then();
        supabase.from('ledger').insert({
          id: ledgerId,
          date,
          type: 'Capital Given',
          description: `Capital investment: ${notes || 'No notes'}`,
          amount: -amount,
          balance_after: newBalance
        }).then();
      }

      return {
        ...prev,
        investments: [...prev.investments, {
          id: invId,
          date,
          amount,
          notes,
          status: 'Active',
          expectedReturn: amount * 0.10,
        }],
        transactions: [...prev.transactions, {
          id: ledgerId,
          date,
          type: 'Capital Given',
          description: `Capital investment: ${notes || 'No notes'}`,
          amount: -amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  const closeInvestment = useCallback(async (investmentId) => {
    setState(prev => {
      const inv = prev.investments.find(i => i.id === investmentId);
      if (!inv || inv.status === 'Closed') return prev;
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance + inv.amount;
      const ledgerId = uuidv4();
      const now = new Date().toISOString();

      // Cloud Sync
      if (supabase) {
        supabase.from('investments').update({ status: 'Closed' }).eq('id', investmentId).then();
        supabase.from('ledger').insert({
          id: ledgerId,
          date: now,
          type: 'Capital Returned',
          description: `Investment closed — capital returned (${inv.notes || 'No notes'})`,
          amount: inv.amount,
          balance_after: newBalance
        }).then();
      }

      return {
        ...prev,
        investments: prev.investments.map(i =>
          i.id === investmentId ? { ...i, status: 'Closed' } : i
        ),
        transactions: [...prev.transactions, {
          id: ledgerId,
          date: now,
          type: 'Capital Returned',
          description: `Investment closed — capital returned (${inv.notes || 'No notes'})`,
          amount: inv.amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  // Updated: now takes investmentId to link return to specific investment
  const recordReturn = useCallback(async (date, amount, investmentId) => {
    const returnId = uuidv4();
    const ledgerId = uuidv4();
    
    setState(prev => {
      const investment = prev.investments.find(i => i.id === investmentId);
      const expected = investment ? investment.amount * 0.10 : 0;
      const warning = amount < expected;
      const invLabel = investment ? (investment.notes || `₱${investment.amount.toLocaleString()} investment`) : 'Unknown';
      const lastBalance = prev.transactions.length > 0
        ? prev.transactions[prev.transactions.length - 1].balanceAfter
        : prev.totalMoneyPool;
      const newBalance = lastBalance + amount;

      // Cloud Sync
      if (supabase) {
        supabase.from('returns').insert({
          id: returnId,
          date,
          amount,
          expected,
          warning,
          investment_id: investmentId,
          investment_notes: invLabel
        }).then();
        supabase.from('ledger').insert({
          id: ledgerId,
          date,
          type: 'Return Received',
          description: `Return from: ${invLabel}${warning ? ' ⚠️ Below expected' : ''}`,
          amount: amount,
          balance_after: newBalance
        }).then();
      }

      return {
        ...prev,
        returns: [...prev.returns, {
          id: returnId,
          date,
          amount,
          expected,
          warning,
          investmentId,
          investmentNotes: invLabel,
        }],
        transactions: [...prev.transactions, {
          id: ledgerId,
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
  const addManualTransaction = useCallback(async (date, type, description, amount, sourceType = 'general', sourceId = null) => {
    const transId = uuidv4();
    const ledgerId = uuidv4();
    
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

      // Cloud Sync
      if (supabase) {
        supabase.from('manual_transactions').insert({
          id: transId,
          date,
          type,
          description,
          amount,
          source_type: sourceType,
          source_id: sourceId
        }).then();
        supabase.from('ledger').insert({
          id: ledgerId,
          date,
          type,
          description: `${description}${sourceLabel}`,
          amount: -amount,
          balance_after: newBalance
        }).then();
      }

      return {
        ...prev,
        manualTransactions: [...prev.manualTransactions, {
          id: transId,
          date,
          type,
          description,
          amount,
          sourceType,
          sourceId,
        }],
        transactions: [...prev.transactions, {
          id: ledgerId,
          date,
          type,
          description: `${description}${sourceLabel}`,
          amount: -amount,
          balanceAfter: newBalance,
        }],
      };
    });
  }, []);

  const resetAll = useCallback(async () => {
    if (supabase) {
      await Promise.all([
        supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('returns').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('manual_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('ledger').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);
    }
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
    isLoading,
  };
}
