import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  Check
} from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { currentUser, availableUsers, switchUser, login, isLoading } = useAuth();

  const [activeMode, setActiveMode] = useState<'demo' | 'custom'>('demo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('requester');
  const [location, setLocation] = useState('Bengaluru');
  const [error, setError] = useState<string | null>(null);

  const handleSelectDemoPersona = (user: any) => {
    switchUser(user);
    setCurrentTab('dashboard');
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError('Please provide your name and email.');
      return;
    }

    try {
      setError(null);
      await login(email.trim(), name.trim(), role, location.trim());
      setCurrentTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Banner */}
        <div className="p-8 bg-gradient-to-r from-navy-900 to-navy-950 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-3">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Access Sahaay
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            Choose a demo persona for testing multi-user coordination or register a new identity.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveMode('demo')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeMode === 'demo'
                ? 'border-b-2 border-brand-600 text-brand-700 bg-brand-50/40'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            ⚡ 1-Click Demo Personas (Recommended for Judges)
          </button>
          <button
            onClick={() => setActiveMode('custom')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              activeMode === 'custom'
                ? 'border-b-2 border-brand-600 text-brand-700 bg-brand-50/40'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            Custom Sign In / Register
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          
          {activeMode === 'demo' ? (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl text-xs leading-relaxed">
                🌟 <strong>Multi-Session Hackathon Testing:</strong> Select <strong>Anjali (Requester)</strong> in this window and create an assistance request. Then open an incognito window, select <strong>Rahul (Volunteer)</strong>, and accept the request to see the live Nexconn chat immediately sync!
              </div>

              <div className="space-y-3 pt-2">
                {availableUsers.map((user) => {
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectDemoPersona(user)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-brand-500 bg-brand-50/60 shadow-md ring-1 ring-brand-500'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-navy-950">{user.name}</h3>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                user.role === 'requester'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {user.location} • {user.email}
                          </p>
                          {user.bio && (
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                              "{user.bio}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-100/80 px-3 py-1.5 rounded-xl">
                            <Check className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <button className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                            Select Persona
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  I want to join as *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('requester')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
                      role === 'requester'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    🙋 Requester (Need Help)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('volunteer')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-xs transition-all ${
                      role === 'volunteer'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    🤝 Volunteer (Offer Help)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Neighborhood / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Whitefield, Bengaluru"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-navy-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                {isLoading ? 'Creating Account...' : 'Continue to Sahaay'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
