import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Plus, PiggyBank, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Investments({ store }) {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const fmt = (n) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    store.addInvestment(new Date(date).toISOString(), amt, notes);
    setAmount(''); setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(false);
  };

  const allInvestments = [...store.investments].reverse();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="page-header">
          <h1 style={{ color: 'var(--text-primary)' }}>Investments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your capital investments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Investment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid grid-cols-1 sm:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Active Capital</div>
          <div className="font-bold text-active-blue" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.activeCapital)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{store.activeInvestments.length} active investments</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Expected Monthly</div>
          <div className="font-bold text-positive" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.expectedMonthlyIncome)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>10% return rate</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card">
          <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Total Invested</div>
          <div className="font-bold text-active-blue" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{fmt(store.totalInvested)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{store.investments.length} total investments</div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ overflow: 'hidden' }}>
        {allInvestments.length === 0 ? (
          <div className="text-center" style={{ padding: '64px 32px' }}>
            <PiggyBank size={48} className="mx-auto" style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: '16px' }} />
            <p className="font-medium" style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No investments yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>Click "Add Investment" to get started</p>
          </div>
        ) : (
          <div className="table-wrapper overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr><th>Date</th><th>Amount</th><th>Expected Return</th><th>Notes</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {allInvestments.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.04 }}>
                    <td className="font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{format(parseISO(inv.date), 'MMM dd, yyyy')}</td>
                    <td className="font-bold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{fmt(inv.amount)}</td>
                    <td className="text-positive font-medium whitespace-nowrap">{fmt(inv.expectedReturn)}/mo</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }} className="truncate">{inv.notes || '—'}</td>
                    <td>
                      <span className={`badge ${inv.status === 'Active' ? 'badge-active' : 'badge-closed'}`}>
                        {inv.status === 'Active' ? <CheckCircle size={12} style={{ marginRight: '4px' }} /> : <XCircle size={12} style={{ marginRight: '4px' }} />}
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.status === 'Active' && (
                        <button onClick={() => store.closeInvestment(inv.id)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>Close</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Capital Investment">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
          <div><label>Amount (₱)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" min="0" step="0.01" required /></div>
          <div><label>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={3} /></div>
          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-xl" style={{ padding: '16px 20px', backgroundColor: 'var(--color-positive-bg)', border: '1px solid var(--color-positive-border)' }}>
              <div className="text-positive font-semibold" style={{ fontSize: '12px' }}>Expected Monthly Return</div>
              <div className="text-positive font-bold" style={{ fontSize: '1.25rem', marginTop: '6px' }}>{fmt(parseFloat(amount) * 0.10)}</div>
            </div>
          )}
          <div className="flex" style={{ gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Add Investment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
