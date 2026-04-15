import React, {useMemo} from 'react';
import {
  Activity,
  AlertTriangle,
  Clock3,
  Download,
  HeartPulse,
  MonitorDot,
  PhoneCall,
  Share2,
  Users,
  WifiOff,
} from 'lucide-react';
import {format} from 'date-fns';
import {useAuth} from '../context/AuthContext';
import {getMonitoringHistory, getOfflineSyncQueue} from '../services/healthDataService';
import {cn} from '../lib/utils';

function downloadEntrySummary(summary: string, filename: string) {
  const blob = new Blob([summary], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CareTeamDashboard() {
  const {profile, user} = useAuth();

  const history = useMemo(() => {
    if (!user) return [];
    return getMonitoringHistory(user.uid);
  }, [user]);

  const offlineQueue = useMemo(() => {
    if (!user) return [];
    return getOfflineSyncQueue(user.uid);
  }, [user]);

  const latest = history[0];
  const highRiskCount = history.filter((entry) => entry.result.outcome === 'High risk').length;
  const moderateRiskCount = history.filter((entry) => entry.result.outcome === 'Moderate risk').length;

  return (
    <div className="space-y-8">
      <section className="future-hero rounded-[2rem] p-8 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="future-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
              Care team dashboard
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Doctor and caregiver monitoring view for shared patient risk reports
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This page gives caregivers and providers a lightweight dashboard for trend review, alerts,
              teleconsultation readiness, report sharing, and exportable health summaries.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard icon={Users} label="Patient profiles" value={profile ? 1 : 0} tone="emerald" />
            <SummaryCard icon={AlertTriangle} label="High risk reports" value={highRiskCount} tone="rose" />
            <SummaryCard icon={MonitorDot} label="Daily reports logged" value={history.length} tone="sky" />
            <SummaryCard icon={WifiOff} label="Offline sync queue" value={offlineQueue.length} tone="amber" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="future-panel rounded-[2rem] p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-cyan-50">Shared monitoring timeline</h2>
              <p className="mt-1 text-sm text-slate-300">
                Review recent reports, risk outcomes, and body-zone predictions across daily submissions.
              </p>
            </div>
            <div className="future-button-secondary rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              Moderate reports: {moderateRiskCount}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {history.length === 0 ? (
              <div className="future-panel-soft rounded-[1.5rem] border-dashed p-8 text-sm text-slate-300">
                No monitoring history yet. Submit the daily monitoring form to populate doctor and caregiver insights.
              </div>
            ) : (
              history.map((entry) => {
                const isHighRisk = entry.result.outcome === 'High risk';

                return (
                  <div key={entry.id} className="future-panel-soft rounded-[1.5rem] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-cyan-50">{entry.patientName}</h3>
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                              isHighRisk
                                ? 'bg-rose-100 text-rose-700'
                                : entry.result.outcome === 'Moderate risk'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700',
                            )}
                          >
                            {entry.result.outcome}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                          Logged {format(new Date(entry.createdAt), 'dd MMM yyyy, p')}
                        </p>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{entry.result.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {entry.result.highlightedZones.map((zone) => (
                            <span
                              key={zone}
                              className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(`${window.location.origin}/shared-report/${entry.shareId}`)
                          }
                          className="future-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          <Share2 size={16} />
                          Copy shared view
                        </button>
                        <button
                          onClick={() =>
                            downloadEntrySummary(
                              [
                                `HealthPulse patient report`,
                                `Patient: ${entry.patientName}`,
                                `Date: ${entry.createdAt}`,
                                `Risk outcome: ${entry.result.outcome}`,
                                `Risk percentage: ${entry.result.riskPercentage}%`,
                                `Body zones: ${entry.result.highlightedZones.join(', ')}`,
                                `Summary: ${entry.result.summary}`,
                                `Risk drivers: ${entry.result.riskDrivers.join(' | ')}`,
                                `Recommendations: ${entry.result.recommendations.join(' | ')}`,
                              ].join('\n'),
                              `healthpulse-report-${entry.id}.txt`,
                            )
                          }
                          className="future-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                        >
                          <Download size={16} />
                          Export summary
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="future-panel rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <HeartPulse className="text-emerald-600" size={20} />
              <h2 className="text-xl font-bold text-cyan-50">Teleconsultation readiness</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use this care-team block to escalate a patient to video follow-up when the latest trend shows a high
              or worsening risk pattern.
            </p>
            <div className="future-panel-soft mt-5 rounded-[1.5rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Recommended action</p>
              <p className="mt-2 text-lg font-bold text-cyan-50">
                {latest?.result.outcome === 'High risk' ? 'Book teleconsultation in the next 24 hours' : 'Continue remote observation and scheduled check-ins'}
              </p>
              <button className="future-button mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                <PhoneCall size={16} />
                Start teleconsult workflow
              </button>
            </div>
          </div>

          <div className="future-panel rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="text-sky-600" size={20} />
              <h2 className="text-xl font-bold text-cyan-50">Remote monitoring notes</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Live wearable mode can auto-refresh the monitoring form with simulated IoT vitals.</li>
              <li>Threshold-based alerts are now generated when readings cross warning ranges.</li>
              <li>Each daily report can be copied as a shared live-view link for caregiver review.</li>
              <li>Offline data is queued locally so rural or unstable connections do not block patient logging.</li>
            </ul>
          </div>

          <div className="future-panel-soft rounded-[2rem] border-amber-300/20 p-6 shadow-sm">
            <p className="future-badge inline-flex text-xs font-semibold uppercase tracking-[0.24em]">Rural support layer</p>
            <h2 className="mt-3 text-2xl font-bold text-cyan-50">Low-bandwidth and offline-friendly mode</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The latest patient report and any unsynced form submissions remain available locally, which improves
              reliability for remote areas with unstable networks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{size?: number}>;
  label: string;
  value: number;
  tone: 'emerald' | 'rose' | 'sky' | 'amber';
}) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    sky: 'bg-sky-100 text-sky-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur">
      <div className={cn('inline-flex rounded-2xl p-2', tones[tone])}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}
