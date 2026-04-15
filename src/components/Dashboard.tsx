import React, {useEffect, useMemo, useState} from 'react';
import {collection, onSnapshot, orderBy, query, where} from 'firebase/firestore';
import {format} from 'date-fns';
import {
  Activity,
  AlertCircle,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
} from 'lucide-react';
import {motion} from 'motion/react';
import {Link} from 'react-router-dom';
import FutureHealthAnimation from './FutureHealthAnimation';
import {db} from '../firebase';
import {useAuth} from '../context/AuthContext';
import {getLocalAppointments} from '../services/doctorDataService';
import {cn} from '../lib/utils';

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

type Appointment = {
  id: string;
  doctorName?: string;
  date?: string;
  status?: string;
  type?: string;
};

type Scan = {
  id: string;
  type: 'skin' | 'dental';
  imageUrl: string;
  createdAt?: string | Date | FirestoreTimestampLike | null;
};

function toDate(value: Scan['createdAt'] | Appointment['date']) {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export default function Dashboard() {
  const {profile, user} = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataWarning, setDataWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !user) {
      setLoading(false);
      return;
    }

    if (user.uid === 'local-admin') {
      setAppointments(getLocalAppointments(profile.uid));
      setScans([]);
      setLoading(false);
      setDataWarning('You are viewing the demo account. Appointments are stored locally for this user.');
      return;
    }

    let active = true;
    let settledListeners = 0;

    const markSettled = () => {
      settledListeners += 1;
      if (settledListeners >= 2 && active) {
        setLoading(false);
      }
    };

    const loadingFallback = window.setTimeout(() => {
      if (active) {
        setLoading(false);
        setDataWarning('Live healthcare data is taking longer than expected to load. Showing the dashboard without records for now.');
      }
    }, 4000);

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', profile.uid),
      orderBy('date', 'desc'),
    );

    const scansQuery = query(
      collection(db, 'ai_scans'),
      where('patientId', '==', profile.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsubAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        if (!active) return;

        setAppointments(
          [
            ...snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Appointment, 'id'>),
            })),
            ...getLocalAppointments(profile.uid),
          ].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
        );
        markSettled();
      },
      (error) => {
        console.error('Appointments subscription failed:', error);
        if (!active) return;
        setAppointments(getLocalAppointments(profile.uid));
        setDataWarning('Appointments could not be loaded from Firebase, so local bookings are being shown instead.');
        markSettled();
      },
    );

    const unsubScans = onSnapshot(
      scansQuery,
      (snapshot) => {
        if (!active) return;

        setScans(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Scan, 'id'>),
          })),
        );
        markSettled();
      },
      (error) => {
        console.error('Scans subscription failed:', error);
        if (!active) return;
        setScans([]);
        setDataWarning('AI scan records could not be loaded from Firebase. You can still use the rest of the dashboard.');
        markSettled();
      },
    );

    return () => {
      active = false;
      window.clearTimeout(loadingFallback);
      unsubAppointments();
      unsubScans();
    };
  }, [profile, user]);

  const nextAppointment = useMemo(() => {
    return appointments.find((appointment) => {
      const appointmentDate = toDate(appointment.date);
      return appointmentDate && appointmentDate > new Date();
    });
  }, [appointments]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-8 pb-20">
      {dataWarning && (
        <div className="future-panel-soft flex gap-3 rounded-[1.5rem] border-amber-300/20 p-4 text-sm text-amber-200">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{dataWarning}</p>
        </div>
      )}

      <section className="future-hero relative overflow-hidden rounded-[2.25rem] p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="relative z-10 max-w-2xl">
            <span className="future-badge inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm backdrop-blur">
              Smart care companion
            </span>
            <h1 className="future-text-main mt-5 text-4xl font-bold tracking-tight md:text-5xl">
              Healthcare scheduling, records, and AI support in one patient dashboard
            </h1>
            <p className="future-text-muted mt-4 max-w-xl text-base leading-7">
              Inspired by the healthcare product flow described in the video: search specialists, manage
              appointments, review scans, and guide patients toward the next best action with minimal clicks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/doctors"
                className="future-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                Find a doctor
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/ai-diagnosis"
                className="future-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                Run AI skin check
                <Sparkles size={16} />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <HeroMetric label="Appointments" value={appointments.length} icon={CalendarClock} tone="sky" />
              <HeroMetric label="AI scans" value={scans.length} icon={BrainCircuit} tone="violet" />
              <HeroMetric
                label="Care readiness"
                value={nextAppointment ? 92 : 68}
                suffix="%"
                icon={ShieldCheck}
                tone="emerald"
              />
            </div>
          </div>

          <div className="relative">
            <div className="future-panel-soft rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">Patient file</p>
                  <h2 className="mt-2 text-2xl font-bold text-cyan-50">{profile?.displayName || 'Patient'}</h2>
                </div>
                <img
                  src={profile?.photoURL || 'https://picsum.photos/seed/patient/200/200'}
                  alt={profile?.displayName || 'Patient'}
                  className="h-14 w-14 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-cyan-300/10 bg-slate-950/55 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-sky-200">Next visit</p>
                    <p className="mt-2 text-lg font-semibold">
                      {nextAppointment?.doctorName || 'Book your first specialist'}
                    </p>
                  </div>
                  <HeartPulse className="text-sky-300" size={24} />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  {nextAppointment && toDate(nextAppointment.date)
                    ? format(toDate(nextAppointment.date)!, 'EEE, dd MMM · p')
                    : 'No future visits scheduled yet.'}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniInfoCard
                  icon={Stethoscope}
                  label="Specialist search"
                  value="Dermatology, Dental, GP"
                  tone="bg-sky-100 text-sky-700"
                />
                <MiniInfoCard
                  icon={Activity}
                  label="AI support"
                  value="Skin image recognition"
                  tone="bg-violet-100 text-violet-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="future-panel overflow-hidden rounded-[2rem] shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="p-6 md:p-8">
                <FutureHealthAnimation compact />
              </div>

              <div className="flex items-center p-6 md:p-8">
                <div>
                  <span className="future-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                    Live visual intelligence
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">Animated digital health avatar</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    This panel now uses a futuristic animated body model inspired by your reference video. It gives
                    the dashboard a more modern AI-health identity and visually connects the app to predictive
                    monitoring, scan intelligence, and next-step care guidance.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <TextureCard
                      title="Orbit motion"
                      description="Rotating energy rings create a dynamic health-tech visual similar to the video style."
                    />
                    <TextureCard
                      title="Digital body mesh"
                      description="A glowing human figure keeps the dashboard focused on patient-centered body intelligence."
                    />
                    <TextureCard
                      title="Predictive identity"
                      description="The animation supports the app story around AI risk prediction, reports, and monitoring."
                    />
                    <TextureCard
                      title="Modern presentation"
                      description="This section is now better suited for demos, judges, and futuristic healthcare branding."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="future-panel rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-cyan-50">Upcoming appointment</h2>
                <p className="mt-1 text-sm text-slate-300">Fast access to the next care milestone.</p>
              </div>
              <UserRound size={20} className="text-slate-300" />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-cyan-300/10 bg-slate-950/60 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
                {nextAppointment?.status || 'Not booked'}
              </p>
              <h3 className="mt-3 text-2xl font-bold">{nextAppointment?.doctorName || 'Choose a specialist'}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {nextAppointment && toDate(nextAppointment.date)
                  ? format(toDate(nextAppointment.date)!, 'EEEE, dd MMMM · p')
                  : 'Once you book an appointment, it will appear here with reminders and next-step actions.'}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {appointments.slice(0, 3).map((appointment) => {
                const appointmentDate = toDate(appointment.date);
                return (
                  <div key={appointment.id} className="future-panel-soft rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{appointment.doctorName || 'Doctor pending'}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {appointmentDate ? format(appointmentDate, 'dd MMM · p') : 'Date pending'}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {appointment.status || 'pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {appointments.length === 0 && (
                <div className="future-panel-soft rounded-2xl border-dashed p-6 text-sm text-slate-300">
                  No appointments booked yet.
                </div>
              )}
            </div>
          </div>

          <div className="future-hero rounded-[2rem] p-6 shadow-sm">
            <p className="future-badge inline-flex text-xs font-semibold uppercase tracking-[0.24em]">Daily monitoring</p>
            <h2 className="mt-3 text-2xl font-bold text-cyan-50">AI-assisted daily health monitoring system</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Log your daily work routine, blood sugar, blood pressure, heart rate, sleep, hydration, stress,
              symptoms, and medication notes. The monitoring system estimates likely outcomes and shows a risk
              percentage for today.
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Uploads blood sugar and cardio metrics into one daily health report</li>
              <li>Tracks exercise, sleep, stress, hydration, and symptom notes</li>
              <li>Predicts low, moderate, or high daily risk with percentage scoring</li>
              <li>Highlights what may drive the outcome and what to monitor next</li>
            </ul>
            <Link
              to="/daily-monitoring"
              className="future-button mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              <LineChart size={16} />
              Open daily monitoring
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{size?: number}>;
  suffix?: string;
  tone: 'sky' | 'violet' | 'emerald';
}) {
  const tones = {
    sky: 'bg-sky-100 text-sky-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="future-panel-soft rounded-[1.5rem] p-4 backdrop-blur">
      <div className={cn('inline-flex rounded-2xl p-2', tones[tone])}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-3xl font-bold text-cyan-50">
        {value}
        {suffix}
      </p>
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

function MiniInfoCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{size?: number}>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="future-panel-soft rounded-[1.25rem] p-4">
      <div className={cn('inline-flex rounded-2xl p-2', tone)}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">{label}</p>
      <p className="mt-2 text-sm font-semibold text-cyan-50">{value}</p>
    </div>
  );
}

function TextureCard({title, description}: {title: string; description: string}) {
  return (
    <div className="future-panel-soft rounded-[1.5rem] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
