import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Plus, TrendingUp, AlertTriangle, CheckCircle2, PiggyBank } from 'lucide-react';
import Modal from '../components/Modal';
import AlertBanner from '../components/AlertBanner';

export default function Returns({ store }) {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('');

  const fmt = (n) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Selected investment details
  const selectedInvestment = store.activeInvestments.find(i => i.id === selectedInvestmentId);
  const expectedReturn = selectedInvestment ? selectedInvestment.amount * 0.10 : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !selectedInvestmentId) return;
    store.recordReturn(new Date(date).toISOString(), amt, selectedInvestmentId);
    setAmount('');
    setSelectedInvestmentId('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(false);
  };

  const handleOpenModal = () => {
    // Auto-select first investment if only one
    if (store.activeInvestments.length === 1) {
      setSelectedInvestmentId(store.activeInvestments[0].id);
    }
    setShowModal(true);
  };

  const allReturns = [...store.returns].reverse();

  return (
    <div className="page-container">
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)' }}>Monthly Returns</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your 10% monthly returns per investment</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleOpenModal}
          disabled={store.activeInvestments.length === 0}
          style={store.activeInvestments.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <Plus size={18} /> Record Return
        </button>
      </div>

      {store.activeInvestments.length === 0 && (
        <AlertBanner type="info" message="Add an investment first before recording returns." />
      )}

      <div className="summary-grid grid-cols-1 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Expected Monthly</div>
          <div className="font-bold" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--color-teal)' }}>{fmt(store.expectedMonthlyIncome)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{store.activeInvestments.length} active investment{store.activeInvestments.length !== 1 ? 's' : ''}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Total Received</div>
          <div className="font-bold text-positive" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.totalReturns)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{store.returns.length} return{store.returns.length !== 1 ? 's' : ''} recorded</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Average Return</div>
          <div className="font-bold text-warning" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{store.returns.length > 0 ? fmt(store.totalReturns / store.returns.length) : '—'}</div>
        </motion.div>
      </div>

      {store.activeCapital > 0 && store.returns.length === 0 && (
        <AlertBanner type="warning" message="You have active investments but no returns recorded yet." />
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ overflow: 'hidden' }}>
        {allReturns.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 32px' }}>
            <TrendingUp size={48} className="mx-auto" style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '16px' }} />
            <p className="font-medium" style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No returns recorded yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Click "Record Return" to log your first return</p>
          </div>
        ) : (
          <div className="table-wrapper overflow-x-auto">
            <table className="ledger-table">
              <thead><tr><th>Date</th><th>Investment</th><th>Amount Received</th><th>Expected</th><th>Difference</th><th>Status</th></tr></thead>
              <tbody>
                {allReturns.map((ret, i) => {
                  const diff = ret.amount - ret.expected;
                  return (
                    <motion.tr key={ret.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}>
                      <td className="font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{format(parseISO(ret.date), 'MMM dd, yyyy')}</td>
                      <td>
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          <div className="flex items-center justify-center shrink-0" style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            backgroundColor: 'var(--color-active-bg)', border: '1px solid var(--color-active-border)'
                          }}>
                            <PiggyBank size={14} style={{ color: 'var(--color-active)' }} />
                          </div>
                          <span className="font-medium" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                            {ret.investmentNotes || 'Unlinked'}
                          </span>
                        </div>
                      </td>
                      <td className="text-positive font-bold whitespace-nowrap">{fmt(ret.amount)}</td>
                      <td style={{ color: 'var(--text-secondary)' }} className="whitespace-nowrap">{fmt(ret.expected)}</td>
                      <td className={`font-semibold whitespace-nowrap ${diff >= 0 ? 'text-positive' : 'text-negative'}`}>{diff >= 0 ? '+' : ''}{fmt(diff)}</td>
                      <td>
                        {ret.warning ? (
                          <span className="badge badge-warning"><AlertTriangle size={12} style={{ marginRight: '4px' }} />Below</span>
                        ) : (
                          <span className="badge badge-active"><CheckCircle2 size={12} style={{ marginRight: '4px' }} />On Target</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Record Return Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedInvestmentId(''); }} title="Record Monthly Return">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Investment Selector */}
          <div>
            <label>Select Investment</label>
            <select
              value={selectedInvestmentId}
              onChange={e => setSelectedInvestmentId(e.target.value)}
              required
            >
              <option value="">Choose an investment...</option>
              {store.activeInvestments.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.notes || 'Untitled'} — {fmt(inv.amount)} ({fmt(inv.expectedReturn)}/mo)
                </option>
              ))}
            </select>
          </div>

          {/* Show selected investment details */}
          {selectedInvestment && (
            <div className="rounded-xl" style={{ padding: '16px 20px', backgroundColor: 'var(--color-active-bg)', border: '1px solid var(--color-active-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ fontSize: '12px', color: 'var(--color-active)' }}>Selected Investment</div>
                  <div className="font-bold" style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedInvestment.notes || 'Untitled'}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Capital: {fmt(selectedInvestment.amount)}</div>
                  <div className="font-bold" style={{ fontSize: '14px', color: 'var(--color-teal)', marginTop: '2px' }}>Expected: {fmt(expectedReturn)}/mo</div>
                </div>
              </div>
            </div>
          )}

          <div><label>Date Received</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div>
            <label>Amount Received (₱)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={selectedInvestment ? `Expected: ${fmt(expectedReturn)}` : 'Select investment first'} min="0" step="0.01" required />
          </div>

          {amount && parseFloat(amount) > 0 && selectedInvestment && parseFloat(amount) < expectedReturn && (
            <AlertBanner type="warning" message={`Amount is ${fmt(expectedReturn - parseFloat(amount))} below expected`} />
          )}

          <div className="flex" style={{ gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => { setShowModal(false); setSelectedInvestmentId(''); }} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1" disabled={!selectedInvestmentId}>Record Return</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
