import React, {useEffect, useState} from 'react';
import {ArrowRight, HeartPulse, LineChart, MoonStar, Radio, Save, Syringe, WifiOff} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {analyzeDailyMonitoring, DailyMonitoringInput, DailyMonitoringResult} from '../services/dailyMonitoringService';
import {queueOfflineSync, saveMonitoringHistoryEntry} from '../services/healthDataService';

const defaultForm: DailyMonitoringInput = {
  bloodSugar: 110,
  systolicBp: 120,
  diastolicBp: 80,
  heartRate: 76,
  sleepHours: 7,
  exerciseMinutes: 30,
  waterIntakeLiters: 2,
  stressLevel: 4,
  symptoms: '',
  foodNotes: '',
  medicationNotes: '',
};

export default function DailyMonitoring() {
  const {profile, user} = useAuth();
  const navigate = useNavigate();
  const storageKey = `healthpulse-daily-monitoring-${user?.uid ?? 'demo'}`;
  const [form, setForm] = useState<DailyMonitoringInput>(defaultForm);
  const [liveMode, setLiveMode] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {form: DailyMonitoringInput; result: DailyMonitoringResult | null};
      setForm(parsed.form);
    } catch (error) {
      console.error('Failed to restore daily monitoring draft:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!liveMode) return;

    const interval = window.setInterval(() => {
      setForm((current) => ({
        ...current,
        heartRate: clampReading(current.heartRate + randomShift(-4, 5), 55, 122),
        bloodSugar: clampReading(current.bloodSugar + randomShift(-8, 9), 70, 220),
        systolicBp: clampReading(current.systolicBp + randomShift(-3, 4), 105, 155),
        diastolicBp: clampReading(current.diastolicBp + randomShift(-2, 3), 65, 98),
        waterIntakeLiters: Number(
          Math.min(4, Math.max(0.8, current.waterIntakeLiters + randomShift(-0.1, 0.2))).toFixed(1),
        ),
      }));
    }, 2500);

    return () => window.clearInterval(interval);
  }, [liveMode]);

  const updateNumberField =
    (field: keyof DailyMonitoringInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: Number(e.target.value),
      }));
    };

  const updateTextField =
    (field: keyof DailyMonitoringInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleAnalyze = () => {
    const nextResult = analyzeDailyMonitoring(form);
    localStorage.setItem(storageKey, JSON.stringify({form, result: nextResult}));
    if (user) {
      saveMonitoringHistoryEntry({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        patientId: user.uid,
        patientName: profile?.displayName || 'Patient',
        form,
        result: nextResult,
        shareId: crypto.randomUUID(),
      });
    }
    navigate('/daily-monitoring/analysis');
  };

  const handleSaveOffline = () => {
    if (!user) return;
    queueOfflineSync(user.uid, form);
    setSavedOffline(true);
    window.setTimeout(() => setSavedOffline(false), 2500);
  };

  return (
    <div className="space-y-8">
      <section className="future-hero rounded-[2rem] p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="future-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm">
              Daily monitoring
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-cyan-50">
              Upload your daily health routine and open a full body risk analysis
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Record blood sugar, blood pressure, sleep, exercise, hydration, stress, symptoms, and medication
              notes. After submission, HealthPulse opens a dedicated analysis report with highlighted body zones.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatChip icon={Syringe} title="Glucose trends" description="Blood sugar risk patterning" />
            <StatChip icon={HeartPulse} title="Cardio status" description="Heart rate and pressure review" />
            <StatChip icon={MoonStar} title="Recovery signals" description="Sleep, hydration, and stress" />
            <StatChip icon={LineChart} title="Outcome forecast" description="Risk percentage and body-zone report" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        <div className="future-panel-soft rounded-[1.75rem] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Radio className={liveMode ? 'text-emerald-600' : 'text-slate-400'} size={20} />
            <div>
              <h2 className="font-bold text-cyan-50">Wearable live mode</h2>
              <p className="text-sm text-slate-300">Simulates near-real-time IoT vital updates.</p>
            </div>
          </div>
          <button
            onClick={() => setLiveMode((current) => !current)}
            className={buttonClassName(liveMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700')}
          >
            {liveMode ? 'Stop live feed' : 'Start live feed'}
          </button>
        </div>

        <div className="future-panel-soft rounded-[1.75rem] border-amber-300/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <WifiOff className="text-amber-700" size={20} />
            <div>
              <h2 className="font-bold text-cyan-50">Low-bandwidth support</h2>
              <p className="text-sm text-slate-300">Save patient entries locally when connectivity is unstable.</p>
            </div>
          </div>
          <button onClick={handleSaveOffline} className={buttonClassName('bg-amber-600 text-white')}>
            <Save size={16} />
            {savedOffline ? 'Saved offline' : 'Save for offline sync'}
          </button>
        </div>

        <div className="future-panel-soft rounded-[1.75rem] p-5 shadow-sm">
          <h2 className="font-bold text-cyan-50">Shared care-team view</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Each analysis now creates a history record for shared review, export, and caregiver follow-up.
          </p>
        </div>
      </section>

      <section className="future-panel rounded-[2rem] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-cyan-50">Daily health log</h2>
          <p className="mt-1 text-sm text-slate-300">
            Fill in today&apos;s metrics. The next page will visualize likely risk areas on the body figure.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumberField label="Blood sugar (mg/dL)" value={form.bloodSugar} onChange={updateNumberField('bloodSugar')} />
          <NumberField label="Heart rate (bpm)" value={form.heartRate} onChange={updateNumberField('heartRate')} />
          <NumberField label="Systolic BP" value={form.systolicBp} onChange={updateNumberField('systolicBp')} />
          <NumberField label="Diastolic BP" value={form.diastolicBp} onChange={updateNumberField('diastolicBp')} />
          <NumberField label="Sleep hours" value={form.sleepHours} onChange={updateNumberField('sleepHours')} />
          <NumberField label="Exercise minutes" value={form.exerciseMinutes} onChange={updateNumberField('exerciseMinutes')} />
          <NumberField
            label="Water intake (liters)"
            value={form.waterIntakeLiters}
            step="0.1"
            onChange={updateNumberField('waterIntakeLiters')}
          />
          <NumberField
            label="Stress level (1-10)"
            value={form.stressLevel}
            min="1"
            max="10"
            onChange={updateNumberField('stressLevel')}
          />
        </div>

        <div className="mt-6 grid gap-4">
          <TextAreaField
            label="Symptoms today"
            value={form.symptoms}
            onChange={updateTextField('symptoms')}
            placeholder="Fatigue, dizziness, headache, chest discomfort, numbness..."
          />
          <TextAreaField
            label="Food and work routine"
            value={form.foodNotes}
            onChange={updateTextField('foodNotes')}
            placeholder="Meals, sugar intake, office work, walking, gym, shift workload..."
          />
          <TextAreaField
            label="Medication notes"
            value={form.medicationNotes}
            onChange={updateTextField('medicationNotes')}
            placeholder="Medicines taken, skipped doses, insulin timing, supplements..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          className="future-button mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
        >
          Analyze daily health risk
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

function randomShift(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clampReading(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buttonClassName(className: string) {
  return `mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${className}`;
}

function NumberField({
  label,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        step={step}
        min={min}
        max={max}
        className="future-input w-full rounded-2xl p-3 text-sm focus:border-cyan-300 focus:outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="future-input w-full rounded-2xl p-3 text-sm focus:border-cyan-300 focus:outline-none"
      />
    </div>
  );
}

function StatChip({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{size?: number}>;
  title: string;
  description: string;
}) {
  return (
    <div className="future-panel-soft rounded-[1.5rem] p-4 shadow-sm">
      <div className="inline-flex rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 font-semibold text-cyan-50">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </div>
  );
}
