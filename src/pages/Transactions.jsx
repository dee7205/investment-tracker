import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Plus, ArrowDownLeft, Receipt, PiggyBank, TrendingUp, Layers } from 'lucide-react';
import Modal from '../components/Modal';

const TX_TYPES = [
  { value: 'Personal Withdrawal', label: 'Personal Withdrawal' },
  { value: 'Personal Expense', label: 'Personal Expense' },
  { value: 'Manual Adjustment', label: 'Manual Adjustment' },
];

export default function Transactions({ store }) {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState(TX_TYPES[0].value);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceType, setSourceType] = useState('general');
  const [sourceId, setSourceId] = useState('');

  const fmt = (n) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim()) return;
    const sid = sourceType !== 'general' && sourceId ? sourceId : null;
    store.addManualTransaction(new Date(date).toISOString(), type, description, amt, sourceType, sid);
    setAmount(''); setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(TX_TYPES[0].value);
    setSourceType('general');
    setSourceId('');
    setShowModal(false);
  };

  // Get source label for display
  const getSourceLabel = (tx) => {
    if (!tx.sourceType || tx.sourceType === 'general') return null;
    if (tx.sourceType === 'investment') {
      const inv = store.getInvestment(tx.sourceId);
      return { label: inv ? (inv.notes || `₱${inv.amount.toLocaleString()}`) : 'Unknown', type: 'investment' };
    }
    if (tx.sourceType === 'return') {
      const ret = store.returns.find(r => r.id === tx.sourceId);
      return { label: ret ? (ret.investmentNotes || `₱${ret.amount.toLocaleString()}`) : 'Unknown', type: 'return' };
    }
    return null;
  };

  const manualTxs = [...store.manualTransactions].reverse();

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)' }}>Manual Transactions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Withdrawals, expenses & adjustments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      <div className="summary-grid grid-cols-1 sm:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Total Withdrawn</div>
          <div className="font-bold text-negative" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.totalWithdrawals)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{store.manualTransactions.length} transaction{store.manualTransactions.length !== 1 ? 's' : ''}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Available Balance</div>
          <div className={`font-bold ${store.availableBalance >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.availableBalance)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>after all deductions</div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card" style={{ overflow: 'hidden' }}>
        {manualTxs.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 32px' }}>
            <Receipt size={48} className="mx-auto" style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '16px' }} />
            <p className="font-medium" style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No manual transactions yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Click "Add Transaction" to record one</p>
          </div>
        ) : (
          <div className="table-wrapper overflow-x-auto">
            <table className="ledger-table">
              <thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Source</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {manualTxs.map((tx, i) => {
                  const source = getSourceLabel(tx);
                  return (
                    <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.04 }}>
                      <td className="font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{format(parseISO(tx.date), 'MMM dd, yyyy')}</td>
                      <td><span className="badge badge-warning">{tx.type}</span></td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{tx.description}</td>
                      <td>
                        {source ? (
                          <div className="flex items-center" style={{ gap: '6px' }}>
                            <div className="flex items-center justify-center shrink-0" style={{
                              width: '24px', height: '24px', borderRadius: '6px',
                              backgroundColor: source.type === 'investment' ? 'var(--color-active-bg)' : 'var(--color-positive-bg)',
                              border: `1px solid ${source.type === 'investment' ? 'var(--color-active-border)' : 'var(--color-positive-border)'}`,
                            }}>
                              {source.type === 'investment'
                                ? <PiggyBank size={12} style={{ color: 'var(--color-active)' }} />
                                : <TrendingUp size={12} style={{ color: 'var(--color-positive)' }} />
                              }
                            </div>
                            <span className="font-medium" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{source.label}</span>
                          </div>
                        ) : (
                          <span className="flex items-center" style={{ gap: '6px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            <Layers size={12} /> General
                          </span>
                        )}
                      </td>
                      <td className="text-negative font-bold whitespace-nowrap" style={{ textAlign: 'right' }}>−{fmt(tx.amount)}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSourceType('general'); setSourceId(''); }} title="Add Manual Transaction">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div><label>Type</label><select value={type} onChange={e => setType(e.target.value)}>{TX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label>Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What was this for?" required /></div>
          <div><label>Amount (₱)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" min="0" step="0.01" required /></div>

          {/* Source Selector */}
          <div>
            <label>Deduct From (Source)</label>
            <select
              value={sourceType}
              onChange={e => { setSourceType(e.target.value); setSourceId(''); }}
            >
              <option value="general">General (No specific source)</option>
              <option value="investment">From an Investment</option>
              <option value="return">From a Return</option>
            </select>
          </div>

          {/* Investment source picker */}
          {sourceType === 'investment' && (
            <div>
              <label>Select Investment</label>
              <select value={sourceId} onChange={e => setSourceId(e.target.value)} required>
                <option value="">Choose investment...</option>
                {store.investments.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.notes || 'Untitled'} — {fmt(inv.amount)} ({inv.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Return source picker */}
          {sourceType === 'return' && (
            <div>
              <label>Select Return</label>
              <select value={sourceId} onChange={e => setSourceId(e.target.value)} required>
                <option value="">Choose return...</option>
                {[...store.returns].reverse().map(ret => (
                  <option key={ret.id} value={ret.id}>
                    {format(parseISO(ret.date), 'MMM dd, yyyy')} — {fmt(ret.amount)} ({ret.investmentNotes || 'Unlinked'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex" style={{ gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => { setShowModal(false); setSourceType('general'); setSourceId(''); }} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Add Transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
