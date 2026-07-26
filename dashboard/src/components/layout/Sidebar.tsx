import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  History, 
  ShieldAlert, 
  FileText, 
  BarChart3, 
  Settings,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  { name: 'Website Analysis', path: '/analysis', icon: Search, key: 'nav.analysis' },
  { name: 'Scan History', path: '/history', icon: History, key: 'nav.history' },
  { name: 'User Reports', path: '/user-reports', icon: ShieldAlert, key: 'nav.userReports' },
  { name: 'Threat Intelligence', path: '/intelligence', icon: ShieldAlert, key: 'nav.intelligence' },
  { name: 'Email Analyzer', path: '/email-analyzer', icon: Mail, key: 'nav.emailAnalyzer' },
  { name: 'Reports', path: '/reports', icon: FileText, key: 'nav.reports' },
  { name: 'Statistics', path: '/statistics', icon: BarChart3, key: 'nav.statistics' },
  { name: 'Settings', path: '/settings', icon: Settings, key: 'nav.settings' },
];

export function Sidebar() {
  const { t } = useAppContext();
  const { user } = useAuth();

  const isAdmin = user?.email?.toLowerCase().startsWith('admin');

  const filteredNavItems = navItems.filter(item => {
    if (item.key === 'nav.userReports' && !isAdmin) return false;
    return true;
  });

  return (
    <aside 
      className="w-64 h-screen flex flex-col backdrop-blur-xl border-r sticky top-0 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,123,255,0.3)] dark:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-cyan-400 dark:from-cyan-400 dark:to-cyan-200 bg-clip-text text-transparent">
              PhishShield AI
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Manager Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 no-scrollbar">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${isActive 
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                : 'hover:bg-slate-800/50 border border-transparent'}`}
            style={({ isActive }) => ({
              color: isActive ? undefined : 'var(--text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400 group-hover:scale-110'}`} />
                <span className={`relative z-10 font-medium text-sm transition-colors duration-300 ${isActive ? '' : 'group-hover:text-cyan-400'}`}>{t(item.key)}</span>
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-md transition-all duration-200 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  />
                )}
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div
          className="rounded-xl p-4 border relative overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color-subtle)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t('sidebar.systemActive')}</span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('sidebar.systemActiveSub')}</p>
        </div>
      </div>
    </aside>
  );
}
