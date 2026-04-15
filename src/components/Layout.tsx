import React from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {Activity, Calendar, Heart, Home, LineChart, LogOut, Stethoscope, Users} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {cn} from '../lib/utils';

type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({children}: LayoutProps) {
  const {profile, logout} = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {name: 'Home', path: '/', icon: Home},
    {name: 'Appointments', path: '/appointments', icon: Calendar},
    {name: 'Doctors', path: '/doctors', icon: Stethoscope},
    {name: 'Monitoring', path: '/daily-monitoring', icon: LineChart},
    {name: 'Care Team', path: '/care-team', icon: Users},
    {name: 'AI Scan', path: '/ai-diagnosis', icon: Activity},
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-future-shell min-h-screen font-sans text-slate-100">
      <nav className="sticky top-0 z-50 hidden border-b border-cyan-300/10 bg-slate-950/65 backdrop-blur-xl md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200 shadow-lg shadow-cyan-950/30">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-cyan-50">HealthPulse</span>
            </div>

            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({isActive}) =>
                    cn(
                      'text-sm font-bold transition-colors',
                      isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-cyan-200',
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              {profile && (
                <div className="flex items-center gap-4 border-l border-cyan-300/10 pl-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="h-8 w-8 rounded-full border border-cyan-300/20"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-semibold text-slate-200">{profile.displayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 transition-colors hover:text-rose-400"
                    aria-label="Log out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8">{children}</main>

      <div className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 md:hidden">
        <div className="flex items-center justify-between rounded-[2rem] border border-cyan-300/15 bg-slate-950/80 p-2 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({isActive}) =>
                cn(
                  'flex h-14 w-14 items-center justify-center rounded-full transition-all',
                  isActive
                    ? 'bg-cyan-400/15 text-cyan-200 shadow-lg shadow-cyan-950/30'
                    : 'text-slate-400 hover:bg-cyan-400/10 hover:text-cyan-100',
                )
              }
              aria-label={item.name}
            >
              <item.icon size={24} />
            </NavLink>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/ai-assistant')}
        className="future-button fixed bottom-28 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-3xl transition-transform hover:scale-110 active:scale-95 md:bottom-8 md:right-8 md:h-20 md:w-20"
        aria-label="Open AI assistant"
      >
        <div className="relative">
          <Heart size={32} fill="currentColor" className="md:h-10 md:w-10" />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 text-sky-700 md:h-6 md:w-6">
            <Activity size={12} className="md:h-[14px] md:w-[14px]" />
          </div>
        </div>
      </button>
    </div>
  );
}
