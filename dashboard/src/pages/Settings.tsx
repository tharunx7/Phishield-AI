import { useState } from 'react';
import { Moon, Sun, Bell, BellOff, Shield, ShieldOff, Globe, MonitorSmartphone, Save, Check, Zap, ZapOff } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { useAppContext } from '../context/AppContext';

export function Settings() {
  const { settings, updateSettings, t } = useAppContext();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    // Settings are already saved on toggle, but this gives user feedback
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>{t('header.settings')}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('header.settingsSub')}</p>
      </div>

      <div className="grid gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <MonitorSmartphone className="text-cyan-400" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>{t('settings.appearance')}</h3>
          </div>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <SettingRow
              icon={settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
              iconColor={settings.darkMode ? 'text-cyan-400' : 'text-amber-400'}
              title={settings.darkMode ? t('settings.darkMode') : t('settings.lightMode')}
              description={settings.darkMode ? t('settings.darkModeSub') : t('settings.lightModeSub')}
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />

            {/* Notifications Toggle */}
            <SettingRow
              icon={settings.notifications ? <Bell size={18} /> : <BellOff size={18} />}
              iconColor={settings.notifications ? 'text-cyan-400' : 'text-slate-400'}
              title={t('settings.notifications')}
              description={settings.notifications ? t('settings.notificationsSub') : t('settings.notificationsDisabled')}
              checked={settings.notifications}
              onChange={() => handleToggle('notifications')}
            />
            
            {/* Language */}
            <div
              className="flex items-center justify-between p-4 rounded-lg border transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg text-cyan-400" style={{ backgroundColor: 'var(--bg-card)' }}><Globe size={18} /></div>
                <div>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('settings.language')}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('settings.languageSub')}</div>
                </div>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-purple-400" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>{t('settings.security')}</h3>
          </div>
          
          <div className="space-y-4">
            {/* Real-Time Protection */}
            <SettingRow
              icon={settings.realTimeProtection ? <Shield size={18} /> : <ShieldOff size={18} />}
              iconColor={settings.realTimeProtection ? 'text-purple-400' : 'text-slate-400'}
              title={t('settings.realTime')}
              description={settings.realTimeProtection ? t('settings.realTimeSub') : t('settings.realTimeDisabled')}
              checked={settings.realTimeProtection}
              onChange={() => handleToggle('realTimeProtection')}
            />

            {/* Auto-Scan */}
            <SettingRow
              icon={settings.autoScan ? <Zap size={18} /> : <ZapOff size={18} />}
              iconColor={settings.autoScan ? 'text-cyan-400' : 'text-slate-400'}
              title={t('settings.autoScan')}
              description={settings.autoScan ? t('settings.autoScanSub') : t('settings.autoScanDisabled')}
              checked={settings.autoScan}
              onChange={() => handleToggle('autoScan')}
            />
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-6 py-2.5 text-white font-medium rounded-lg transition-all flex items-center gap-2 ${
              saveStatus === 'saved'
                ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : saveStatus === 'saving'
                  ? 'bg-slate-600 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]'
            }`}
          >
            {saveStatus === 'saved' ? (
              <><Check size={18} /> {t('settings.saved')}</>
            ) : saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('settings.saving')}
              </>
            ) : (
              <><Save size={18} /> {t('settings.save')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, iconColor, title, description, checked, onChange }: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border transition-all duration-300"
      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color-subtle)' }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconColor} transition-colors`} style={{ backgroundColor: 'var(--bg-card)' }}>
          {icon}
        </div>
        <div>
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div 
      className={`relative inline-block w-11 h-6 align-middle select-none transition-all duration-300 ease-in cursor-pointer rounded-full ${
        checked
          ? 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
          : 'bg-slate-600'
      }`}
      onClick={onChange}
    >
      <span
        className={`absolute block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
        style={{ top: '2px' }}
      />
    </div>
  );
}
