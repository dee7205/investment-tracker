import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Wallet, TrendingUp, PiggyBank, DollarSign,
  BarChart3, Target, Clock
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';

export default function Dashboard({ store }) {
  const fmt = (n) => `₱${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (n) => `${n.toFixed(1)}%`;

  const alerts = [];
  if (store.availableBalance < 0) {
    alerts.push({ type: 'danger', message: `Available balance is negative: ${fmt(store.availableBalance)}` });
  }
  if (store.activeCapital > 0 && store.returns.length > 0) {
    const lastReturn = store.returns[store.returns.length - 1];
    if (lastReturn.warning) {
      alerts.push({ type: 'warning', message: `Last return (${fmt(lastReturn.amount)}) was below expected (${fmt(lastReturn.expected)})` });
    }
  }
  if (store.activeCapital > 0 && store.returns.length === 0) {
    alerts.push({ type: 'warning', message: 'No monthly returns recorded yet. Remember to log your returns!' });
  }
  if (store.monthsUntilRecovery !== null && store.monthsUntilRecovery > 0) {
    alerts.push({ type: 'info', message: `~${store.monthsUntilRecovery} month${store.monthsUntilRecovery > 1 ? 's' : ''} remaining until capital fully recovered` });
  }
  if (store.breakEvenProgress >= 100) {
    alerts.push({ type: 'success', message: '🎉 Capital fully recovered! All returns from here are pure profit.' });
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of your investment portfolio</p>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert, i) => (
            <AlertBanner key={i} type={alert.type} message={alert.message} />
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: '20px' }}>
        <StatCard title="Total Money Pool" value={fmt(store.totalMoneyPool)} icon={Wallet} color="blue" delay={0} />
        <StatCard title="Active Capital" value={fmt(store.activeCapital)} subtitle={`${store.activeInvestments.length} active`} icon={PiggyBank} color="blue" delay={1} />
        <StatCard title="Available Balance" value={fmt(store.availableBalance)} icon={DollarSign} color={store.availableBalance >= 0 ? 'green' : 'red'} delay={2} />
        <StatCard title="Expected Monthly" value={fmt(store.expectedMonthlyIncome)} subtitle="10% of active" icon={TrendingUp} color="teal" delay={3} />
        <StatCard title="Net Profit" value={fmt(store.netProfit)} subtitle={`${store.returns.length} returns`} icon={Target} color="green" delay={4} />
      </div>

      {/* Break-even Progress */}
      {store.totalInvested > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card"
          style={{ padding: '28px 32px' }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <Target size={20} style={{ color: 'var(--color-positive)' }} />
              <span className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Break-even Progress</span>
            </div>
            <span className="font-bold" style={{ fontSize: '1.25rem', color: 'var(--color-positive)' }}>
              {pct(store.breakEvenProgress)}
            </span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(store.breakEvenProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {fmt(store.totalReturns)} recovered
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {fmt(store.totalInvested)} invested
            </span>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="card"
        style={{ padding: '28px 32px' }}
      >
        <h3 className="font-semibold flex items-center" style={{ fontSize: '15px', color: 'var(--text-primary)', gap: '10px', marginBottom: '20px' }}>
          <Clock size={20} style={{ color: 'var(--text-tertiary)' }} />
          Recent Activity
        </h3>
        {store.transactions.length === 0 ? (
          <p className="text-center" style={{ fontSize: '14px', color: 'var(--text-tertiary)', padding: '48px 0' }}>
            No transactions yet. Start by adding an investment!
          </p>
        ) : (
          <div>
            {store.transactions.slice(-5).reverse().map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between"
                style={{
                  padding: '16px 0',
                  borderBottom: i < Math.min(store.transactions.length, 5) - 1 ? '1px solid var(--border-secondary)' : 'none',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{tx.type}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {format(parseISO(tx.date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="text-right" style={{ marginLeft: '24px' }}>
                  <div className={`font-bold ${tx.amount >= 0 ? 'text-positive' : 'text-negative'}`} style={{ fontSize: '14px' }}>
                    {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Bal: {fmt(tx.balanceAfter)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
