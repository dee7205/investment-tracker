import { motion } from 'framer-motion';

const colorMap = {
  green: { icon: 'var(--color-positive)', bg: 'var(--color-positive-bg)', border: 'var(--color-positive-border)' },
  red: { icon: 'var(--color-negative)', bg: 'var(--color-negative-bg)', border: 'var(--color-negative-border)' },
  blue: { icon: 'var(--color-active)', bg: 'var(--color-active-bg)', border: 'var(--color-active-border)' },
  yellow: { icon: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)' },
  purple: { icon: 'var(--color-purple)', bg: 'var(--color-purple-bg)', border: 'var(--color-purple-border)' },
  teal: { icon: 'var(--color-teal)', bg: 'var(--color-teal-bg)', border: 'var(--color-teal-border)' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'green', delay = 0 }) {
  const c = colorMap[color] || colorMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card card-hover"
      style={{ padding: '24px 28px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: c.bg,
            border: `1px solid ${c.border}`,
          }}
        >
          {Icon && <Icon size={20} style={{ color: c.icon }} />}
        </div>
      </div>
      <div className="font-bold" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
        {value}
      </div>
      <div className="font-semibold uppercase" style={{ fontSize: '11px', letterSpacing: '0.06em', color: 'var(--text-tertiary)', marginTop: '4px' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', opacity: 0.8 }}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
