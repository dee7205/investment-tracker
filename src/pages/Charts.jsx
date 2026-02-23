import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { useTheme } from '../hooks/useTheme';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="card" style={{ padding: '12px 16px', minWidth: '160px', border: '1px solid var(--border-primary)' }}>
      <p className="font-semibold" style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: '12px', color: entry.color, marginTop: '2px' }}>
          {entry.name}: ₱{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Charts({ store }) {
  const { theme } = useTheme();

  const gridColor = theme === 'dark' ? 'rgba(148,163,184,0.06)' : 'rgba(0,0,0,0.06)';
  const axisColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  const returnsData = store.returns.map(r => ({
    month: format(parseISO(r.date), 'MMM yyyy'),
    received: r.amount,
    expected: r.expected,
  }));

  let cumulative = 0;
  const profitData = store.returns.map(r => {
    cumulative += r.amount;
    return { month: format(parseISO(r.date), 'MMM yyyy'), cumulative, invested: store.totalInvested };
  });

  const balanceData = store.transactions.map(tx => ({
    date: format(parseISO(tx.date), 'MMM dd'),
    balance: tx.balanceAfter,
    capital: store.activeCapital,
  }));

  const hasData = store.returns.length > 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)' }}>Performance</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visual overview of your investment performance</p>
      </div>

      {!hasData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center" style={{ padding: '80px 32px' }}>
          <p className="font-semibold" style={{ fontSize: '1.125rem', color: 'var(--text-tertiary)' }}>No data to chart yet</p>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Record your first return to see charts.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '24px' }}>
          {/* Monthly Returns */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '28px 28px 20px' }}>
            <h3 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '24px' }}>Monthly Returns</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={returnsData}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} tickMargin={8} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickMargin={6} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '16px' }} />
                <Line type="monotone" dataKey="received" name="Received" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981' }} />
                <Line type="monotone" dataKey="expected" name="Expected" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Profit Growth */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '28px 28px 20px' }}>
            <h3 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '24px' }}>Profit Growth</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} tickMargin={8} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickMargin={6} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '16px' }} />
                <Area type="monotone" dataKey="cumulative" name="Cumulative Returns" stroke="#10b981" fill="url(#grad-green)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="invested" name="Total Invested" stroke="#3b82f6" fill="url(#grad-blue)" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Balance Timeline */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card lg:col-span-2" style={{ padding: '28px 28px 20px' }}>
            <h3 className="font-semibold" style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '24px' }}>Balance Timeline</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={balanceData} barCategoryGap="20%">
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 11 }} tickMargin={8} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} tickMargin={6} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '16px' }} />
                <Bar dataKey="balance" name="Available Balance" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={80} />
                <Bar dataKey="capital" name="Active Capital" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.7} maxBarSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
}
