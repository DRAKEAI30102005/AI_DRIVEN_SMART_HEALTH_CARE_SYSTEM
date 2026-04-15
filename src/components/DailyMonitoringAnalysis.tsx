import React, {useMemo} from 'react';
import {
  Activity,
  AlertTriangle,
  Download,
  Droplets,
  HeartPulse,
  LineChart,
  MapPinned,
  PhoneCall,
  Share2,
  ShieldAlert,
  TimerReset,
} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {BodyRiskZone, DailyMonitoringInput, DailyMonitoringResult} from '../services/dailyMonitoringService';
import {getMonitoringHistory} from '../services/healthDataService';
import {cn} from '../lib/utils';

type StoredMonitoringPayload = {
  form: DailyMonitoringInput;
  result: DailyMonitoringResult | null;
};

const zonePositions: Record<BodyRiskZone, string> = {
  head: 'left-[50%] top-[10%]',
  chest: 'left-[50%] top-[28%]',
  'left-arm': 'left-[33%] top-[34%]',
  'right-arm': 'left-[67%] top-[34%]',
  abdomen: 'left-[50%] top-[44%]',
  pelvis: 'left-[50%] top-[58%]',
  'left-leg': 'left-[44%] top-[79%]',
  'right-leg': 'left-[56%] top-[79%]',
};

export default function DailyMonitoringAnalysis() {
  const {user} = useAuth();
  const storageKey = `healthpulse-daily-monitoring-${user?.uid ?? 'demo'}`;

  const payload = useMemo(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;

    try {
      return JSON.parse(saved) as StoredMonitoringPayload;
    } catch (error) {
      console.error('Failed to read monitoring analysis:', error);
      return null;
    }
  }, [storageKey]);

  if (!payload?.result) {
    return (
      <div className="future-panel rounded-[2rem] p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-cyan-50">No analysis available yet</h1>
        <p className="mt-3 text-sm text-slate-300">
          Complete the daily monitoring form first so HealthPulse can generate the body-risk report.
        </p>
        <Link
          to="/daily-monitoring"
          className="future-button mt-6 inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold"
        >
          Go to monitoring form
        </Link>
      </div>
    );
  }

  const {form, result} = payload;
  const latestSharedEntry = user ? getMonitoringHistory(user.uid)[0] : null;

  const handleShare = async () => {
    if (!latestSharedEntry) return;
    const shareUrl = `${window.location.origin}/shared-report/${latestSharedEntry.shareId}`;
    await navigator.clipboard.writeText(shareUrl);
    window.alert(`Shared report link copied:\n${shareUrl}`);
  };

  const handleExport = () => {
    const summary = [
      'HealthPulse daily monitoring export',
      `Risk outcome: ${result.outcome}`,
      `Risk percentage: ${result.riskPercentage}%`,
      `Body zones: ${result.highlightedZones.join(', ')}`,
      `Alerts: ${result.alerts.map((alert) => `${alert.metric} (${alert.status})`).join(' | ')}`,
      `Summary: ${result.summary}`,
      `Recommendations: ${result.recommendations.join(' | ')}`,
    ].join('\n');

    const blob = new Blob([summary], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'healthpulse-daily-monitoring-summary.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="future-panel rounded-[2rem] shadow-xl shadow-slate-950/40">
      <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-cyan-300/10 bg-gradient-to-b from-slate-950/35 to-transparent p-6 xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Diagnosis history</p>
              <h1 className="mt-2 text-2xl font-bold text-cyan-50">Body risk map</h1>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                result.outcome === 'High risk'
                  ? 'bg-rose-100 text-rose-700'
                  : result.outcome === 'Moderate risk'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700',
              )}
            >
              {result.outcome}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-[64px_1fr] gap-4">
            <div className="space-y-5 border-r border-dashed border-cyan-300/10 pr-4 text-xs text-slate-400">
              <p>2026</p>
              <p>2025</p>
              <p>2024</p>
              <p>2023</p>
              <p>2022</p>
            </div>

            <div className="relative mx-auto min-h-[520px] w-full max-w-[300px] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.10),_transparent_28%),linear-gradient(180deg,#0c1524_0%,#101a2b_55%,#09101c_100%)]">
              <img
                src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200"
                alt="Human anatomy report"
                className="h-full w-full object-cover object-center mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />

              {result.highlightedZones.map((zone) => (
                <div
                  key={zone}
                  className={cn(
                    'absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.18)]',
                    zonePositions[zone],
                  )}
                />
              ))}
            </div>
          </div>

          <div className="future-panel-soft mt-6 rounded-[1.5rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Complaint distribution
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{result.summary}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-emerald-200">Risk percentage</span>
              <span className="text-2xl font-bold text-emerald-100">{result.riskPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              onClick={handleShare}
              disabled={!latestSharedEntry}
              className="future-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              <Share2 size={16} />
              Share live report
            </button>
            <button
              onClick={handleExport}
              className="future-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            >
              <Download size={16} />
              Export EHR summary
            </button>
            <button className="future-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              <PhoneCall size={16} />
              Start teleconsultation
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Activity}
              label="Blood pressure"
              value={`${form.systolicBp}/${form.diastolicBp} mmHg`}
              state={result.metrics.bloodPressureState}
            />
            <MetricCard
              icon={HeartPulse}
              label="Heart rate"
              value={`${form.heartRate} bpm`}
              state={result.metrics.heartRateState}
            />
            <MetricCard
              icon={ShieldAlert}
              label="Glucose"
              value={`${form.bloodSugar} mg/dL`}
              state={result.metrics.bloodSugarState}
            />
            <MetricCard
              icon={Droplets}
              label="Waters"
              value={`${form.waterIntakeLiters.toFixed(1)} L`}
              state={result.metrics.hydrationState}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="future-panel-soft rounded-[1.5rem] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Statistic</p>
                  <h2 className="mt-2 text-xl font-bold text-cyan-50">Daily body response curve</h2>
                </div>
                <LineChart className="text-slate-300" size={20} />
              </div>

              <div className="mt-6 flex h-40 items-end gap-3">
                {[42, 68, 54, 77, 49, 72, 59, result.riskPercentage].map((point, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-full bg-gradient-to-t from-emerald-500 to-emerald-200" style={{height: `${point}%`}} />
                    <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Day {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="future-panel-soft rounded-[1.5rem] p-5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-amber-500" size={20} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Alert center</p>
                    <p className="mt-1 text-sm text-slate-500">Threshold alerts generated from today&apos;s vitals.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {result.alerts.map((alert) => (
                    <div
                      key={`${alert.metric}-${alert.message}`}
                      className="future-panel-soft rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-cyan-50">{alert.metric}</p>
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                            alert.status === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : alert.status === 'Warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700',
                          )}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="future-panel-soft rounded-[1.5rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Daily progress</p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#22c55e_var(--progress),#e2e8f0_0deg)]" style={{['--progress' as string]: `${Math.round((100 - result.riskPercentage) * 3.6)}deg`}}>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-2xl font-bold text-cyan-50">
                      {100 - result.riskPercentage}%
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">
                    Keep improving the quality of your daily routine to lower the highlighted body risks.
                  </p>
                </div>
              </div>

              <div className="future-panel-soft rounded-[1.5rem] p-5">
                <div className="flex items-center gap-3">
                  <MapPinned className="text-slate-300" size={20} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Body zones</p>
                    <p className="mt-1 text-sm text-slate-300">Highlighted areas predicted from today&apos;s inputs.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.highlightedZones.map((zone) => (
                    <span key={zone} className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="future-panel-soft mt-5 rounded-[1.5rem] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-50">List alerts</h2>
              <TimerReset className="text-slate-300" size={18} />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 font-semibold">Metric</th>
                    <th className="pb-3 font-semibold">Reading</th>
                    <th className="pb-3 font-semibold">Risk note</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Blood glucose', `${form.bloodSugar} mg/dL`, result.riskDrivers[0] || 'Stable trend', result.metrics.bloodSugarState],
                    ['Blood pressure', `${form.systolicBp}/${form.diastolicBp}`, result.riskDrivers[1] || 'No strong pressure signal', result.metrics.bloodPressureState],
                    ['Heart rate', `${form.heartRate} bpm`, result.riskDrivers[2] || 'Heart response looks stable', result.metrics.heartRateState],
                    ['Hydration', `${form.waterIntakeLiters.toFixed(1)} L`, result.recommendations[0] || 'Hydration maintained', result.metrics.hydrationState],
                    ['Alerts raised', `${result.alerts.length}`, result.alerts[0]?.message || 'No active alert', result.alerts[0]?.status || 'Normal'],
                  ].map(([label, value, note, status]) => (
                    <tr key={label} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-4 font-medium text-cyan-50">{label}</td>
                      <td className="py-4 text-slate-300">{value}</td>
                      <td className="py-4 text-slate-300">{note}</td>
                      <td className="py-4">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                            status === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : status === 'Warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700',
                          )}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  state,
}: {
  icon: React.ComponentType<{size?: number}>;
  label: string;
  value: string;
  state: string;
}) {
  return (
    <div className="future-panel-soft rounded-[1.5rem] p-4 shadow-sm">
      <div className="inline-flex rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">{label}</p>
      <p className="mt-2 text-lg font-bold text-cyan-50">{value}</p>
      <p className="mt-2 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
        {state}
      </p>
    </div>
  );
}
