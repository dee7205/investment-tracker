import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PiggyBank, TrendingUp, ArrowDownLeft,
  ScrollText, BarChart3, ChevronLeft, ChevronRight, Wallet,
  Sun, Moon, Menu, X, LogOut
} from 'lucide-react';
import { useStore } from './hooks/useStore';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import Returns from './pages/Returns';
import Transactions from './pages/Transactions';
import Ledger from './pages/Ledger';
import Charts from './pages/Charts';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'investments', label: 'Investments', icon: PiggyBank },
  { id: 'returns', label: 'Returns', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: ArrowDownLeft },
  { id: 'ledger', label: 'Ledger', icon: ScrollText },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
];

function SetupScreen({ onComplete }) {
  const [pool, setPool] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(pool);
    if (amount > 0) onComplete(amount);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 btn btn-ghost p-2.5 rounded-xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="card w-full max-w-sm text-center"
        style={{ padding: '40px 36px' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          }}
        >
          <Wallet className="text-white" size={28} />
        </motion.div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>InvestTracker</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>10% Fixed Monthly Return Tracker</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label>Total Money Pool</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>₱</span>
              <input
                type="number"
                value={pool}
                onChange={e => setPool(e.target.value)}
                placeholder="100,000"
                min="0"
                step="0.01"
                required
                style={{ paddingLeft: '28px' }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ padding: '14px' }}
          >
            Initialize Portfolio
          </button>
        </form>

        <p className="text-xs mt-5" style={{ color: 'var(--text-tertiary)' }}>
          Stored locally in your browser
        </p>
      </motion.div>
    </div>
  );
}

function AuthScreen({ onVerify }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'admin123';
    if (password === correctPassword) {
      onVerify();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 btn btn-ghost p-2.5 rounded-xl"
        style={{ color: 'var(--text-secondary)' }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-sm text-center"
        style={{ padding: '40px 36px' }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
          }}
        >
          <Wallet className="text-white" size={28} />
        </motion.div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Secure Access</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Enter password to unlock InvestTracker</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className={error ? 'border-negative' : ''}
              style={{
                transition: 'all 0.2s ease',
                borderColor: error ? 'var(--color-negative)' : 'var(--border-primary)'
              }}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary w-full ${error ? 'bg-negative' : ''}`}
            style={{ 
              padding: '14px',
              backgroundColor: error ? 'var(--color-negative)' : 'var(--color-active)'
            }}
          >
            {error ? 'Wrong Password' : 'Unlock App'}
          </button>
        </form>

        <p className="text-xs mt-6" style={{ color: 'var(--text-tertiary)' }}>
          Private Portfolio Tracker
        </p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const { theme, toggleTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('invest-tracker-auth') === 'true';
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuth = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('invest-tracker-auth', 'true');
  };

  if (!isAuthenticated) {
    return <AuthScreen onVerify={handleAuth} />;
  }

  if (!store.settings.setupComplete) {
    return <SetupScreen onComplete={store.initializePool} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard store={store} />;
      case 'investments': return <Investments store={store} />;
      case 'returns': return <Returns store={store} />;
      case 'transactions': return <Transactions store={store} />;
      case 'ledger': return <Ledger store={store} />;
      case 'charts': return <Charts store={store} />;
      default: return <Dashboard store={store} />;
    }
  };

  const fmt = (n) => `₱${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ backgroundColor: 'var(--bg-modal-overlay)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          width: sidebarCollapsed ? '80px' : '264px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-primary)',
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: '76px',
            padding: sidebarCollapsed ? '0 16px' : '0 24px',
            borderBottom: '1px solid var(--border-primary)',
            gap: '14px'
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #10b981)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
          >
            <Wallet className="text-white" size={20} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>InvestTracker</div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>10% Fixed Return</div>
            </div>
          )}
        </div>

        {/* Balance summary */}
        {!sidebarCollapsed && (
          <div
            className="rounded-xl"
            style={{
              margin: '20px 20px 8px',
              padding: '16px 20px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>Available Balance</div>
            <div className={`text-xl font-bold ${store.availableBalance >= 0 ? 'text-positive' : 'text-negative'}`}>
              {fmt(store.availableBalance)}
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="rounded-lg text-center" style={{ margin: '16px 12px 8px', padding: '10px 4px', backgroundColor: 'var(--bg-tertiary)' }}>
            <div className="text-[10px] font-bold" style={{ color: 'var(--color-positive)' }}>
              {fmt(store.availableBalance).replace('₱', '')}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: sidebarCollapsed ? '8px 10px' : '8px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {PAGES.map(page => {
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => {
                    setCurrentPage(page.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    padding: sidebarCollapsed ? '12px' : '12px 16px',
                    gap: '14px',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08))'
                      : 'transparent',
                    color: isActive ? 'var(--color-active)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.12)' : '1px solid transparent',
                  }}
                  title={sidebarCollapsed ? page.label : undefined}
                >
                  <page.icon size={20} className="shrink-0" />
                  {!sidebarCollapsed && <span>{page.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="shrink-0" style={{
          padding: sidebarCollapsed ? '12px 10px 16px' : '12px 16px 20px',
          borderTop: '1px solid var(--border-secondary)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-tertiary)]"
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                gap: '14px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark' ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
              {!sidebarCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>

            <button
              onClick={() => setSidebarCollapsed(c => !c)}
              className="w-full hidden md:flex items-center rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-tertiary)]"
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                gap: '14px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                color: 'var(--text-tertiary)',
              }}
            >
              {sidebarCollapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>

            <button
              onClick={() => { if (confirm('Reset all data? This cannot be undone.')) store.resetAll(); }}
              className="w-full flex items-center rounded-xl text-sm font-medium transition-all hover:bg-[var(--color-negative-bg)]"
              style={{
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                gap: '14px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                color: 'var(--color-negative)',
              }}
            >
              <LogOut size={20} className="shrink-0" />
              {!sidebarCollapsed && <span>Reset Data</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ '--sidebar-w': sidebarCollapsed ? '80px' : '264px' }}
      >
        <style>{`
          @media (min-width: 768px) {
            main.flex-1 { margin-left: var(--sidebar-w) !important; }
          }
          @media (max-width: 767px) {
            main.flex-1 { margin-left: 0 !important; }
          }
        `}</style>

        {/* Mobile top bar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between h-14 md:hidden"
          style={{
            padding: '0 20px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <button onClick={() => setMobileMenuOpen(true)} className="btn btn-ghost p-2">
            <Menu size={22} style={{ color: 'var(--text-primary)' }} />
          </button>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>InvestTracker</span>
          <button onClick={toggleTheme} className="btn btn-ghost p-2">
            {theme === 'dark' ? <Sun size={20} style={{ color: 'var(--text-secondary)' }} /> : <Moon size={20} style={{ color: 'var(--text-secondary)' }} />}
          </button>
        </div>

        <div style={{ padding: '32px 36px', maxWidth: '1280px', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
