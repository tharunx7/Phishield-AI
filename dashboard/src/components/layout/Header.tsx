import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, ShieldAlert, AlertTriangle, ShieldCheck, UserCheck, Settings as SettingsIcon, Database, Terminal, LogOut, Lock, Trash2, Send, Zap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFromStorage } from '../../services/storageAdapter';

export function Header() {
  const { settings, t } = useAppContext();
  const navigate = useNavigate();
  const { user, logout, updatePassword } = useAuth();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [usersDb, setUsersDb] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [dbError, setDbError] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const getDisplayName = () => {
    if (!user?.email) return 'Admin User';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .split(/[\._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getUserRole = () => {
    if (!user?.email) return 'Guest';
    return user.email.toLowerCase().startsWith('admin') ? t('role.admin') : t('role.user');
  };

  const isAdmin = () => {
    if (!user?.email) return false;
    return user.email.toLowerCase().startsWith('admin');
  };

  // Load users database from storage when the profile dropdown is shown
  useEffect(() => {
    if (!showProfile) return;
    
    const loadDb = () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get('users_db', (result: any) => {
          if (result.users_db) {
            setUsersDb(result.users_db);
          } else {
            const defaultDb = [{ email: 'admin@gmail.com', password: 'admin123' }];
            chrome.storage.local.set({ users_db: defaultDb }, () => {
              setUsersDb(defaultDb);
            });
          }
        });
      } else {
        try {
          const db = JSON.parse(localStorage.getItem('phishShield_users_db') || '[]');
          if (db.length === 0) {
            const defaultDb = [{ email: 'admin@gmail.com', password: 'admin123' }];
            localStorage.setItem('phishShield_users_db', JSON.stringify(defaultDb));
            setUsersDb(defaultDb);
          } else {
            setUsersDb(db);
          }
        } catch {
          setUsersDb([{ email: 'admin@gmail.com', password: 'admin123' }]);
        }
      }
    };
    
    loadDb();
    setDbError('');
  }, [showProfile]);

  const handleAddUserCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setDbError('');

    const emailToSave = newEmail.trim().toLowerCase();
    const passwordToSave = newPassword.trim();

    if (!emailToSave || !passwordToSave) {
      setDbError('Both fields are required.');
      return;
    }

    if (passwordToSave.length < 6) {
      setDbError('Password must be at least 6 characters.');
      return;
    }

    const exists = usersDb.some((u: any) => u.email === emailToSave);
    if (exists) {
      setDbError('User email already exists.');
      return;
    }

    const updatedDb = [...usersDb, { email: emailToSave, password: passwordToSave }];
    setUsersDb(updatedDb);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ users_db: updatedDb });
    }
    localStorage.setItem('phishShield_users_db', JSON.stringify(updatedDb));

    setNewEmail('');
    setNewPassword('');
    setIsAddingUser(false);
  };

  const handleDeleteUser = (emailToDelete: string) => {
    if (emailToDelete === 'admin@gmail.com') return;

    const updatedDb = usersDb.filter((u: any) => u.email !== emailToDelete);
    setUsersDb(updatedDb);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ users_db: updatedDb });
    }
    localStorage.setItem('phishShield_users_db', JSON.stringify(updatedDb));

    // Force sign out if the deleted user is the currently logged-in user
    if (user?.email === emailToDelete) {
      logout();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.remove('extension_auth');
      } else {
        localStorage.removeItem('phishShield_ext_auth');
      }
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPasswordValue.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    const res = updatePassword(newPasswordValue);
    if (res.success) {
      setPasswordSuccess(true);
      setNewPasswordValue('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(false);
      }, 1500);
    } else {
      setPasswordError(res.error || 'Failed to change password.');
    }
  };

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [userNotifs, setUserNotifs] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      const stored = await getFromStorage<any[]>('userNotifications');
      if (stored) setUserNotifs(stored);
    };
    loadNotifs();

    const handleStorage = () => loadNotifs();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alerts: any[] = [];

  return (
    <header
      className="h-20 flex items-center justify-between px-8 backdrop-blur-md border-b sticky top-0 z-40 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Live Cyber Threat Ticker Banner */}
      <div className="flex-1 max-w-xl mx-4 overflow-hidden rounded-full border px-4 py-2 flex items-center gap-3 bg-slate-950/80 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex-shrink-0 animate-pulse">
          <Zap size={12} className="text-cyan-400" /> LIVE THREAT FEED
        </span>
        <div className="overflow-hidden relative w-full text-xs font-mono text-slate-300">
          <div className="animate-marquee flex items-center gap-8">
            <span className="flex items-center gap-1.5"><ShieldAlert size={13} className="text-red-400 flex-shrink-0" /><strong className="text-red-400">ALERT:</strong> Active Quishing Phishing Campaign Detected (98.4% Risk)</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" /><strong className="text-emerald-400">TELEMETRY:</strong> 1,420 Phishing URLs Classified Today</span>
            <span className="flex items-center gap-1.5"><AlertTriangle size={13} className="text-yellow-400 flex-shrink-0" /><strong className="text-yellow-400">ZERO-DAY:</strong> Deceptive Typosquatting Trap Intercepted</span>
            {/* Duplicated for seamless 360-degree looping */}
            <span className="flex items-center gap-1.5"><ShieldAlert size={13} className="text-red-400 flex-shrink-0" /><strong className="text-red-400">ALERT:</strong> Active Quishing Phishing Campaign Detected (98.4% Risk)</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" /><strong className="text-emerald-400">TELEMETRY:</strong> 1,420 Phishing URLs Classified Today</span>
            <span className="flex items-center gap-1.5"><AlertTriangle size={13} className="text-yellow-400 flex-shrink-0" /><strong className="text-yellow-400">ZERO-DAY:</strong> Deceptive Typosquatting Trap Intercepted</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Panel */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className={`relative p-2 rounded-lg transition-colors duration-200 ${showNotifications ? 'text-cyan-400 bg-slate-800/40' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/20'}`}
          >
            <Bell size={20} />
            {settings.notifications && (
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-pink-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="absolute right-0 mt-3 w-80 rounded-2xl border p-4 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200"
              style={{
                backgroundColor: 'var(--bg-dropdown-opaque)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b mb-3" style={{ borderColor: 'var(--border-color-subtle)' }}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white" style={{ color: 'var(--text-heading)' }}>Recent Threat Alerts</h4>
                <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-400/10">{alerts.length + (!isAdmin() ? userNotifs.length : 0)} Alerts</span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {!isAdmin() && userNotifs.map((notif: any) => (
                  <div 
                    key={notif.id} 
                    className="p-3 rounded-xl border flex gap-3 transition-colors bg-purple-500/10 border-purple-500/30"
                  >
                    <Send className="flex-shrink-0 mt-0.5 text-purple-600" size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-semibold text-purple-800">{notif.title}</span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{notif.time}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{notif.desc}</p>
                    </div>
                  </div>
                ))}
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-xl border flex gap-3 transition-colors ${alert.bgColor}`}
                  >
                    <alert.icon className={`flex-shrink-0 mt-0.5 ${alert.color}`} size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{alert.title}</span>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{alert.time}</span>
                      </div>
                      <p className="text-[10px] leading-relaxed truncate" style={{ color: 'var(--text-secondary)' }}>{alert.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: 'var(--border-color-subtle)' }}>
                <button 
                  onClick={() => { navigate('/history'); setShowNotifications(false); }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  View Complete Threat Logs &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
        
        {/* Admin User Panel */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className={`flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl transition-all duration-200 ${showProfile ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                {getDisplayName()}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{getUserRole()}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border group-hover:border-cyan-500/50 transition-colors"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-color)',
              }}
            >
              <User size={18} className="text-slate-400 group-hover:text-cyan-400" />
            </div>
          </div>

          {/* Profile Dropdown */}
          {showProfile && (
            <div 
              className="absolute right-0 mt-3 w-72 rounded-2xl border p-5 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200"
              style={{
                backgroundColor: 'var(--bg-dropdown-opaque)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="flex items-center gap-3 pb-4 border-b mb-4" style={{ borderColor: 'var(--border-color-subtle)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center border bg-slate-850" style={{ borderColor: 'var(--border-color-subtle)' }}>
                  <User size={22} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white" style={{ color: 'var(--text-heading)' }}>{getDisplayName()}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || 'admin@gmail.com'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-2"><UserCheck size={14} className="text-cyan-400" /> Username</span>
                  <span className="font-mono text-slate-300 text-[11px] select-all">{user?.email || 'admin@gmail.com'}</span>
                </div>
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChangeSubmit} className="p-2 rounded-lg border bg-slate-900/30 space-y-1.5" style={{ borderColor: 'var(--border-color-subtle)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-purple-400 uppercase">Change Password</span>
                      <button 
                        type="button" 
                        onClick={() => { setIsChangingPassword(false); setPasswordError(''); }}
                        className="text-[9px] text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPasswordValue}
                        onChange={(e) => setNewPasswordValue(e.target.value)}
                        className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500/50 font-mono"
                      />
                      <button 
                        type="submit"
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-[10px] font-bold text-white transition-colors"
                      >
                        Save
                      </button>
                    </div>
                    {passwordError && <p className="text-[8px] text-red-400 leading-tight">{passwordError}</p>}
                    {passwordSuccess && <p className="text-[8px] text-green-400 leading-tight">Password changed successfully!</p>}
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-2"><Lock size={14} className="text-purple-400" /> Password</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300 text-[11px] select-all">{(user as any)?.password || 'admin123'}</span>
                      <button 
                        onClick={() => setIsChangingPassword(true)} 
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-lg text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-2"><Database size={14} className="text-purple-400" /> Database</span>
                  <span className="text-[10px] font-mono text-slate-400">Local Encrypted</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-2"><Terminal size={14} className="text-cyan-400" /> Security Level</span>
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    {isAdmin() ? 'ADMINISTRATOR' : 'STANDARD USER'}
                  </span>
                </div>
              </div>

              {/* Credentials Database Panel */}
              {isAdmin() && (
                <div className="border-t pt-3 mt-3 flex flex-col gap-2" style={{ borderColor: 'var(--border-color-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Credentials DB ({usersDb.length})
                    </span>
                    <button 
                      onClick={() => { setIsAddingUser(!isAddingUser); setDbError(''); }}
                      className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isAddingUser ? 'Cancel' : '+ Add User'}
                    </button>
                  </div>

                  {/* DB list */}
                  {!isAddingUser && (
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
                      {usersDb.map((u: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="p-1.5 rounded-lg border flex flex-col gap-0.5 text-[10px] font-mono transition-colors" 
                          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-subtle)' }}
                        >
                          <div className="flex justify-between items-center text-slate-350">
                            <span className="text-cyan-400 truncate max-w-[120px]" title={u.email}>{u.email}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 select-all">{u.password}</span>
                              {u.email !== 'admin@gmail.com' && (
                                <button
                                  onClick={() => handleDeleteUser(u.email)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                                  title="Delete User"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add User Form */}
                  {isAddingUser && (
                    <form onSubmit={handleAddUserCredentials} className="space-y-2 p-2 rounded-xl border bg-slate-900/30" style={{ borderColor: 'var(--border-color-subtle)' }}>
                      <div className="flex flex-col gap-1">
                        <input 
                          type="email" 
                          placeholder="user@example.com" 
                          value={newEmail}
                          onChange={(e) => { setNewEmail(e.target.value); setDbError(''); }}
                          className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                        />
                        <input 
                          type="text" 
                          placeholder="password" 
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setDbError(''); }}
                          className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                        />
                      </div>
                      {dbError && (
                        <div className="text-[9px] text-red-400 font-semibold leading-tight">
                          {dbError}
                        </div>
                      )}
                      <button 
                        type="submit"
                        className="w-full py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-[10px] font-bold text-white transition-colors"
                      >
                        Save Credentials
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border-color-subtle)' }}>
                <button 
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors text-white"
                >
                  <SettingsIcon size={12} /> System Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
