import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Zap, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CyberDataBackground } from '../components/ui/CyberDataBackground';

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset fields and errors when switching between Login and Register
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = register(email, password);
      if (res.success) {
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate('/');
      } else {
        setError(res.error || 'Registration failed');
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = login(email, password);
      if (res.success) {
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate('/');
      } else {
        setError(res.error || 'Authentication failed');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#05050f]">
      {/* Cyber + Data Science Node Network Canvas */}
      <CyberDataBackground />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10, 10, 30, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(34, 211, 238, 0.12)',
            boxShadow: '0 0 60px rgba(34, 211, 238, 0.08), 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />

          <div className="p-10">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center mb-8"
            >
              {/* Animated Shield Logo */}
              <div className="relative mb-5">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1)',
                      '0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(168,85,247,0.2)',
                      '0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-purple-600 flex items-center justify-center"
                >
                  <ShieldCheck className="text-white" size={40} strokeWidth={1.8} />
                </motion.div>

                {/* Orbiting ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-3 rounded-2xl border border-cyan-400/20"
                  style={{ borderRadius: '20px' }}
                />
              </div>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 dark:from-cyan-300 dark:via-cyan-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                PhishShield AI
              </h1>
              <p className="text-slate-400 text-sm mt-2 tracking-wide text-center">
                {isRegistering ? 'Create a secure manager database account' : 'Secure your digital world'}
              </p>
            </motion.div>

            {/* Login/Register Form */}
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 gap-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center"
                  >
                    <ShieldCheck className="text-green-400" size={32} />
                  </motion.div>
                  <p className="text-green-400 font-semibold text-lg">{isRegistering ? 'Account Created' : 'Access Granted'}</p>
                  <p className="text-slate-500 text-sm">Redirecting to dashboard...</p>
                </motion.div>
              ) : (
                <motion.form
                  key={isRegistering ? 'register-form' : 'login-form'}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0, x: isRegistering ? 15 : -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRegistering ? -15 : 15 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={12} className="text-cyan-400" />
                      Email Address
                    </label>
                    <div className="relative group">
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="admin@gmail.com"
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3.5 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm font-mono"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={12} className="text-purple-400" />
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••••"
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3.5 px-4 pr-12 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm font-mono"
                        autoComplete={isRegistering ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field (Register Only) */}
                  {isRegistering && (
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock size={12} className="text-purple-400" />
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                          placeholder="••••••••••"
                          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3.5 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm font-mono"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2"
                      >
                        <Zap size={14} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.01 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group ${
                      isLoading
                        ? 'bg-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_25px_rgba(34,211,238,0.2)] hover:shadow-[0_0_35px_rgba(34,211,238,0.35)]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span className="text-sm">{isRegistering ? 'Registering...' : 'Authenticating...'}</span>
                      </>
                    ) : (
                      <>
                        {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                        <span className="text-sm tracking-wide">
                          {isRegistering ? 'Create Database Account' : 'Sign In to Dashboard'}
                        </span>
                        <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  {/* Toggle Link */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors font-medium hover:underline"
                    >
                      {isRegistering
                        ? 'Already have an account? Sign In'
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-800/50 text-center"
            >
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                Local Secure Credentials Database Active
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-medium">All systems operational</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
