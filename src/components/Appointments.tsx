import React, {useEffect, useMemo, useState} from 'react';
import {collection, onSnapshot, orderBy, query, where} from 'firebase/firestore';
import {format} from 'date-fns';
import {CalendarClock, CheckCircle2, CircleDashed, Clock3, Video} from 'lucide-react';
import {db} from '../firebase';
import {useAuth} from '../context/AuthContext';
import {getLocalAppointments} from '../services/doctorDataService';
import {cn} from '../lib/utils';

type Appointment = {
  id: string;
  doctorName?: string;
  date?: string;
  status?: string;
  type?: string;
};

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function Appointments() {
  const {profile, user} = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    if (!profile) return;

    if (user?.uid === 'local-admin') {
      setAppointments(getLocalAppointments(profile.uid));
      return;
    }

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', profile.uid),
      orderBy('date', 'desc'),
    );

    return onSnapshot(appointmentsQuery, (snapshot) => {
      const firebaseAppointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Appointment, 'id'>),
      }));
      const localAppointments = getLocalAppointments(profile.uid);
      setAppointments([...firebaseAppointments, ...localAppointments].sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    }, (error) => {
      console.error('Appointments subscription failed:', error);
      setAppointments(getLocalAppointments(profile.uid));
    });
  }, [profile, user]);

  const filteredAppointments = useMemo(() => {
    if (selectedStatus === 'all') return appointments;
    return appointments.filter((appointment) => appointment.status === selectedStatus);
  }, [appointments, selectedStatus]);

  const upcomingCount = appointments.filter((appointment) => {
    const appointmentDate = toDate(appointment.date);
    return appointmentDate && appointmentDate > new Date();
  }).length;

  return (
    <div className="space-y-8">
      <section className="future-hero rounded-[2rem] p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="future-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm">
              Care schedule
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-cyan-50">Appointments and follow-ups</h1>
            <p className="text-base leading-7 text-slate-300">
              Keep every consultation, pending review, and specialist callback in one place, just like the
              healthcare flow described in the reference video.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MetricCard label="Total" value={appointments.length} icon={CalendarClock} tone="sky" />
            <MetricCard label="Upcoming" value={upcomingCount} icon={Clock3} tone="emerald" />
            <MetricCard
              label="Completed"
              value={appointments.filter((item) => item.status === 'completed').length}
              icon={CheckCircle2}
              tone="violet"
            />
            <MetricCard
              label="Remote care"
              value={appointments.filter((item) => item.type === 'video').length}
              icon={Video}
              tone="amber"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="future-panel rounded-[2rem] p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Appointment timeline</h2>
              <p className="mt-1 text-sm text-slate-300">Filter by status to review the patient journey.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    selectedStatus === status
                      ? 'future-button text-white'
                      : 'future-button-secondary',
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="future-panel-soft rounded-3xl border-dashed p-10 text-center text-sm text-slate-300">
                No appointments found for this filter yet.
              </div>
            ) : (
              filteredAppointments.map((appointment) => {
                const appointmentDate = toDate(appointment.date);

                return (
                  <div
                    key={appointment.id}
                    className="future-panel-soft rounded-[1.5rem] p-5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {appointment.type || 'general consultation'}
                        </p>
                        <h3 className="mt-2 text-lg font-bold text-cyan-50">
                          {appointment.doctorName || 'Doctor assigned soon'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">
                          {appointmentDate ? format(appointmentDate, 'EEEE, d MMM yyyy · p') : 'Date pending'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <StatusBadge status={appointment.status || 'pending'} />
                        <button className="future-button-secondary rounded-full px-4 py-2 text-sm font-semibold">
                          View details
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
            <h2 className="text-xl font-bold text-cyan-50">Care pathway</h2>
            <div className="mt-5 space-y-4">
              <JourneyStep
                title="Book a specialist"
                detail="Search doctors by specialty and reserve a slot."
                active={appointments.length > 0}
              />
              <JourneyStep
                title="Upload scan or records"
                detail="Use AI image analysis or attach medical context before the visit."
                active={true}
              />
              <JourneyStep
                title="Attend consultation"
                detail="Handle in-person or video follow-ups with reminders."
                active={appointments.some((item) => item.status === 'confirmed' || item.status === 'completed')}
              />
              <JourneyStep
                title="Review treatment plan"
                detail="Track medication, next steps, and repeat appointments."
                active={appointments.some((item) => item.status === 'completed')}
                last
              />
            </div>
          </div>

          <div className="future-hero rounded-[2rem] p-6 text-white shadow-sm">
            <p className="future-badge inline-flex text-xs font-semibold uppercase tracking-[0.24em]">Reference fit</p>
            <h2 className="mt-3 text-2xl font-bold">Why this page matches the video</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The video emphasizes search, scheduling, appointment history, and minimal-click healthcare flows.
              This page now focuses on that appointment lifecycle instead of reusing the home dashboard.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{size?: number; className?: string}>;
  tone: 'sky' | 'emerald' | 'violet' | 'amber';
}) {
  const tones = {
    sky: 'bg-sky-100 text-sky-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    violet: 'bg-violet-100 text-violet-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="future-panel-soft rounded-[1.5rem] p-4 shadow-sm">
      <div className={cn('inline-flex rounded-2xl p-2', tones[tone])}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl font-bold text-cyan-50">{value}</p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

function JourneyStep({
  title,
  detail,
  active,
  last,
}: {
  title: string;
  detail: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border',
            active
              ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
              : 'border-slate-200 bg-slate-100 text-slate-400',
          )}
        >
          {active ? <CheckCircle2 size={18} /> : <CircleDashed size={18} />}
        </div>
        {!last && <div className="mt-2 h-full w-px bg-slate-200" />}
      </div>

      <div className="pb-5">
        <h3 className="font-semibold text-cyan-50">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-300">{detail}</p>
      </div>
    </div>
  );
}

function StatusBadge({status}: {status: string}) {
  const styles: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    confirmed: 'border-sky-200 bg-sky-50 text-sky-700',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        styles[status] ?? 'border-slate-200 bg-slate-100 text-slate-600',
      )}
    >
      {status}
    </span>
  );
}
