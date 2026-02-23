import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw, Settings,
  CreditCard, ScrollText
} from 'lucide-react';

const typeConfig = {
  'Initial Setup': { icon: Settings, color: 'var(--color-active)' },
  'Capital Given': { icon: ArrowDownLeft, color: 'var(--color-negative)' },
  'Capital Returned': { icon: ArrowUpRight, color: 'var(--color-active)' },
  'Return Received': { icon: ArrowUpRight, color: 'var(--color-positive)' },
  'Personal Withdrawal': { icon: CreditCard, color: 'var(--color-negative)' },
  'Personal Expense': { icon: CreditCard, color: 'var(--color-warning)' },
  'Manual Adjustment': { icon: RefreshCw, color: 'var(--color-purple)' },
};

export default function Ledger({ store }) {
  const txs = [...store.transactions].reverse();
  const credits = store.transactions.filter(t => t.amount > 0).length;
  const debits = store.transactions.filter(t => t.amount < 0).length;

  const fmtBal = (n) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Transaction Ledger</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Complete financial history</p>
      </div>

      <div className="summary-grid grid-cols-1 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Credits</div>
          <div className="font-bold text-positive" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{credits}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>incoming transactions</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Debits</div>
          <div className="font-bold text-negative" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{debits}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>outgoing transactions</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Current Balance</div>
          <div className={`font-bold ${store.availableBalance >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
            {fmtBal(store.availableBalance)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>after all transactions</div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ overflow: 'hidden' }}>
        {txs.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 32px' }}>
            <ScrollText size={48} className="mx-auto" style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '16px' }} />
            <p className="font-medium" style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No transactions yet</p>
          </div>
        ) : (
          <div className="table-wrapper overflow-x-auto">
            <table className="ledger-table">
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ textAlign: 'right' }}>Balance</th></tr></thead>
              <tbody>
                {txs.map((tx, i) => {
                  const cfg = typeConfig[tx.type] || typeConfig['Manual Adjustment'];
                  const Icon = cfg.icon;
                  return (
                    <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.03 }}>
                      <td className="font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                        {format(parseISO(tx.date), 'MMM dd, yyyy')}
                      </td>
                      <td>
                        <span className="flex items-center whitespace-nowrap" style={{ gap: '10px' }}>
                          <Icon size={16} style={{ color: cfg.color }} />
                          <span className="font-semibold" style={{ fontSize: '13px', color: cfg.color }}>{tx.type}</span>
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '280px' }} className="truncate">{tx.description}</td>
                      <td style={{ textAlign: 'right' }} className={`font-bold whitespace-nowrap ${tx.amount >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {tx.amount >= 0 ? '+' : '−'}₱{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-semibold whitespace-nowrap" style={{ textAlign: 'right', color: 'var(--text-primary)' }}>
                        ₱{Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
