import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  HeartHandshake, 
  UserCheck, 
  Type, 
  Contrast, 
  LogOut, 
  PlusCircle, 
  LayoutDashboard, 
  HelpCircle,
  Menu,
  X,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, availableUsers, switchUser, logout } = useAuth();
  const { largeFont, highContrast, toggleLargeFont, toggleHighContrast } = useAccessibility();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-navy-900 group-hover:text-brand-600 transition-colors">
                  Sahaay
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 rounded-full border border-brand-200">
                  MVP
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Connecting people. Empowering communities.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'landing'
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            {currentUser && (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {currentUser.role === 'requester' ? 'My Requests' : 'Volunteer Feed'}
                </button>

                {currentUser.role === 'requester' && (
                  <button
                    onClick={() => setCurrentTab('create-request')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      currentTab === 'create-request'
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Request Help
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setCurrentTab('nexconn-status')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'nexconn-status'
                  ? 'bg-teal-50 text-teal-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              Nexconn SDK
            </button>
          </nav>

          {/* Right Actions: Accessibility + User Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Accessibility Controls */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={toggleLargeFont}
                title="Toggle Large Font Mode"
                className={`p-1.5 rounded text-xs font-bold transition-all ${
                  largeFont ? 'bg-white shadow text-brand-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Toggle large font"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={toggleHighContrast}
                title="Toggle High Contrast Mode"
                className={`p-1.5 rounded transition-all ${
                  highContrast ? 'bg-white shadow text-brand-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Toggle high contrast"
              >
                <Contrast className="w-4 h-4" />
              </button>
            </div>

            {/* User Switcher & Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
                >
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-navy-900 leading-tight">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {currentUser.role}
                    </p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${currentUser.role === 'requester' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 pb-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Switch Demo Persona</p>
                      <p className="text-[11px] text-slate-400">
                        Test 2-user coordination in separate browser tabs
                      </p>
                    </div>

                    <div className="py-1">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                            user.id === currentUser.id ? 'bg-brand-50/70 font-semibold text-brand-900' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-xs font-medium leading-none">{user.name}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{user.role} • {user.location?.split(',')[0]}</p>
                            </div>
                          </div>
                          {user.id === currentUser.id && (
                            <UserCheck className="w-4 h-4 text-brand-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 px-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setCurrentTab('login');
                          setShowUserMenu(false);
                        }}
                        className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                      >
                        + Add / Login Persona
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          setCurrentTab('landing');
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
              >
                Sign In / Demo
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-navy-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setCurrentTab('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
          >
            Home
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
              >
                {currentUser.role === 'requester' ? 'My Requests' : 'Volunteer Feed'}
              </button>
              {currentUser.role === 'requester' && (
                <button
                  onClick={() => {
                    setCurrentTab('create-request');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm font-medium"
                >
                  Request Help
                </button>
              )}
            </>
          )}
          <button
            onClick={() => {
              setCurrentTab('nexconn-status');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-teal-700 bg-teal-50 text-sm font-semibold"
          >
            Nexconn Integration Info
          </button>
        </div>
      )}
    </header>
  );
};
