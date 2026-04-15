import React, {useState} from 'react';
import {BrowserRouter as Router, Navigate, Outlet, Route, Routes} from 'react-router-dom';
import {Activity, AlertCircle, Loader2, LockKeyhole, UserRound} from 'lucide-react';
import {AuthProvider, useAuth} from './context/AuthContext';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import Appointments from './components/Appointments';
import CareTeamDashboard from './components/CareTeamDashboard';
import DailyMonitoring from './components/DailyMonitoring';
import DailyMonitoringAnalysis from './components/DailyMonitoringAnalysis';
import Dashboard from './components/Dashboard';
import AIDiagnosis from './components/AIDiagnosis';
import Doctors from './components/Doctors';
import {findSharedReport} from './services/healthDataService';

function ProtectedLayout() {
  const {user, loading} = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function Login() {
  const {authError, clearAuthError, login, loginPending, user} = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearAuthError();
    await login({username, password});
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_32%),linear-gradient(180deg,#08152c_0%,#071126_58%,#030814_100%)] p-4">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-white shadow-2xl shadow-cyan-950/40 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="login-tech-panel hidden p-10 text-white lg:block">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Patient portal
          </span>
          <div className="mt-8 grid gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.38em] text-cyan-300">Technology</p>
              <h1 className="mt-6 text-5xl font-bold leading-tight text-white">
                Futuristic care access with an animated health intelligence portal
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Log in to monitor daily health, review AI-supported scans, book specialists, and keep your
                patient care journey in one immersive interface.
              </p>

              <div className="mt-8 inline-flex items-center rounded-full border border-cyan-300/30 px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Digital health gateway
              </div>

              <div className="mt-10 space-y-4">
                <FeatureBlurb
                  icon={Activity}
                  title="AI-assisted health review"
                  description="Upload a skin or dental image and keep results attached to your patient record."
                />
                <FeatureBlurb
                  icon={UserRound}
                  title="Specialist marketplace"
                  description="Search doctors, compare consultation modes, and reserve follow-up visits."
                />
                <FeatureBlurb
                  icon={LockKeyhole}
                  title="Secure patient login"
                  description="Use your local patient username and password to access your protected dashboard."
                />
              </div>
            </div>

            <LoginTechVisual />
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Patient login</p>
                <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-500">
              Sign in with your local patient account credentials. This temporary login screen does not use
              Firebase and keeps access simple while you continue building the app.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {authError && (
                <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loginPending || !username.trim() || !password}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 py-4 font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginPending ? <Loader2 size={18} className="animate-spin" /> : <LockKeyhole size={18} />}
                {loginPending ? 'Signing in...' : 'Login to HealthPulse'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-800">
              Local demo login is enabled for now. Use username `admin` and password `admin123` to enter the app.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBlurb({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{size?: number}>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-cyan-300/10 bg-white/5 p-5 backdrop-blur">
      <div className="inline-flex rounded-2xl bg-cyan-300/10 p-2 text-cyan-200">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function LoginTechVisual() {
  return (
    <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_transparent_34%),linear-gradient(180deg,rgba(6,15,35,0.9)_0%,rgba(2,9,24,0.98)_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_18%),radial-gradient(circle_at_80%_24%,rgba(96,165,250,0.12),transparent_16%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.1),transparent_24%)]" />
      <div className="login-grid absolute inset-0 opacity-40" />
      <div className="login-particles absolute inset-0">
        <span className="particle left-[18%] top-[20%]" />
        <span className="particle left-[78%] top-[24%]" />
        <span className="particle left-[66%] top-[62%]" />
        <span className="particle left-[28%] top-[72%]" />
        <span className="particle left-[52%] top-[14%]" />
      </div>

      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <div className="login-orbit orbit-three" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div className="login-core-glow absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <svg
            viewBox="0 0 240 520"
            className="login-human-figure h-[520px] w-[240px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="120" cy="54" r="28" className="stroke-cyan-300/90" strokeWidth="2.5" />
            <path d="M120 82V188" className="stroke-cyan-300/90" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M74 128C90 114 103 108 120 108C137 108 150 114 166 128" className="stroke-cyan-300/80" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M72 142L48 214" className="stroke-cyan-300/80" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M168 142L192 214" className="stroke-cyan-300/80" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M96 188L120 248L144 188" className="stroke-cyan-300/85" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M120 188L92 314" className="stroke-cyan-300/85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M120 188L148 314" className="stroke-cyan-300/85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M92 314L78 458" className="stroke-cyan-300/85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M148 314L162 458" className="stroke-cyan-300/85" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M120 104L96 144L120 178L144 144L120 104Z" className="stroke-cyan-200/80" strokeWidth="2" />
            <path d="M72 142L120 162L168 142" className="stroke-cyan-200/60" strokeWidth="1.5" />
            <path d="M92 314L120 274L148 314" className="stroke-cyan-200/60" strokeWidth="1.5" />
            <path d="M103 348L120 384L137 348" className="stroke-cyan-200/50" strokeWidth="1.5" />
            <circle cx="120" cy="144" r="8" className="fill-cyan-300/90" />
            <circle cx="120" cy="220" r="7" className="fill-cyan-200/80" />
            <circle cx="120" cy="300" r="6" className="fill-cyan-300/75" />
            <circle cx="72" cy="142" r="4.5" className="fill-cyan-200/80" />
            <circle cx="168" cy="142" r="4.5" className="fill-cyan-200/80" />
            <circle cx="92" cy="314" r="4.5" className="fill-cyan-200/80" />
            <circle cx="148" cy="314" r="4.5" className="fill-cyan-200/80" />
          </svg>
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-300">Bio signal mesh</p>
          <p className="mt-2 text-sm text-slate-300">Animated patient model with rotating health orbit visualization</p>
        </div>
      </div>
    </div>
  );
}

function SharedReportView() {
  const shareId = window.location.pathname.split('/').pop() || '';
  const report = findSharedReport(shareId);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Shared report not found</h1>
          <p className="mt-3 text-sm text-slate-500">
            This shared patient report is unavailable in the current browser session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Shared live patient report
        </span>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">{report.patientName}</h1>
        <p className="mt-2 text-sm text-slate-500">Risk outcome: {report.result.outcome}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Risk percentage</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{report.result.riskPercentage}%</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Body zones</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">{report.result.highlightedZones.join(', ')}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Alerts raised</p>
            <p className="mt-3 text-sm font-semibold text-slate-900">{report.result.alerts.length}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Clinical summary</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{report.result.summary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Risk drivers</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {report.result.riskDrivers.map((driver) => (
                  <li key={driver}>{driver}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Recommendations</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {report.result.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/shared-report/:shareId" element={<SharedReportView />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
            <Route path="/care-team" element={<CareTeamDashboard />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/daily-monitoring" element={<DailyMonitoring />} />
            <Route path="/daily-monitoring/analysis" element={<DailyMonitoringAnalysis />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
