import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const config = {
  warning: { icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)' },
  danger: { icon: AlertCircle, color: 'var(--color-negative)', bg: 'var(--color-negative-bg)', border: 'var(--color-negative-border)' },
  info: { icon: Info, color: 'var(--color-active)', bg: 'var(--color-active-bg)', border: 'var(--color-active-border)' },
  success: { icon: CheckCircle, color: 'var(--color-positive)', bg: 'var(--color-positive-bg)', border: 'var(--color-positive-border)' },
};

export default function AlertBanner({ type = 'info', message, className = '' }) {
  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl ${className}`}
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
    >
      <Icon size={18} style={{ color: c.color, marginTop: '2px', flexShrink: 0 }} />
      <span className="text-sm font-medium" style={{ color: c.color }}>{message}</span>
    </motion.div>
  );
}
