import React, {useEffect, useMemo, useState} from 'react';
import {addDoc, collection, onSnapshot, serverTimestamp} from 'firebase/firestore';
import {
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
  Star,
  Video,
} from 'lucide-react';
import {motion} from 'motion/react';
import {db} from '../firebase';
import {useAuth} from '../context/AuthContext';
import {getDoctorCatalog, saveLocalAppointment, type Doctor} from '../services/doctorDataService';
import {cn} from '../lib/utils';

const specializations = ['All', 'Dermatology', 'Dentist', 'Cardiology', 'General'];

export default function Doctors() {
  const {profile, user} = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid === 'local-admin') {
      setDoctors([]);
      return;
    }

    const unsub = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      setDoctors(
        snapshot.docs.map((doc) => ({
          uid: doc.id,
          consultationMode: 'hybrid',
          availability: 'tomorrow',
          ...(doc.data() as Omit<Doctor, 'uid'>),
        })),
      );
    }, (error) => {
      console.error('Doctors subscription failed:', error);
      setDoctors([]);
    });

    return () => unsub();
  }, [user]);

  const displayDoctors: Doctor[] = doctors.length > 0
    ? doctors
    : getDoctorCatalog();

  const filteredDoctors = useMemo(() => {
    return displayDoctors.filter((doctor) => {
      const matchesSearch =
        doctor.specialization?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.clinicName?.toLowerCase().includes(search.toLowerCase());

      const matchesSpecialty =
        specialtyFilter === 'All' || doctor.specialization.toLowerCase() === specialtyFilter.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [displayDoctors, search, specialtyFilter]);

  const handleBook = async () => {
    if (!profile || !selectedDoctor || !bookingDate || !bookingTime) return;

    setIsBooking(true);
    setBookingMessage(null);

    const appointmentPayload = {
      patientId: profile.uid,
      patientName: profile.displayName,
      doctorId: selectedDoctor.uid,
      doctorName: selectedDoctor.displayName,
      date: `${bookingDate}T${bookingTime}:00`,
      status: 'pending',
      type: selectedDoctor.consultationMode === 'video' ? 'video' : 'general',
    };

    try {
      if (user?.uid === 'local-admin') {
        saveLocalAppointment(appointmentPayload);
      } else {
        await addDoc(collection(db, 'appointments'), {
          ...appointmentPayload,
          createdAt: serverTimestamp(),
        });
      }

      setBookingMessage(`Appointment booked with ${selectedDoctor.displayName}.`);
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      console.error('Firebase booking failed, saving locally instead:', err);
      saveLocalAppointment(appointmentPayload);
      setBookingMessage(`Appointment booked locally with ${selectedDoctor.displayName}.`);
    } finally {
      setIsBooking(false);
      window.setTimeout(() => {
        setSelectedDoctor(null);
        setBookingMessage(null);
      }, 1200);
    }
  };

  return (
    <div className="space-y-8">
      <section className="future-hero rounded-[2rem] p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="future-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm">
              Care marketplace
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-cyan-50">Find the right healthcare specialist</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              This page maps directly to the “doctor appointment app” and “therapist marketplace” ideas repeated
              throughout the video.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <HighlightCard title="Verified doctors" value={displayDoctors.length} icon={BadgeCheck} tone="sky" />
            <HighlightCard title="Video consults" value={displayDoctors.filter((doctor) => doctor.consultationMode !== 'in-person').length} icon={Video} tone="violet" />
            <HighlightCard title="Fast booking" value={24} suffix="h" icon={CalendarDays} tone="emerald" />
          </div>
        </div>
      </section>

      <section className="future-panel rounded-[2rem] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by doctor, clinic, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="future-input w-full rounded-full py-3 pl-11 pr-4 text-sm focus:border-cyan-300 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {specializations.map((specialization) => (
              <button
                key={specialization}
                onClick={() => setSpecialtyFilter(specialization)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  specialtyFilter === specialization
                    ? 'future-button text-white'
                    : 'future-button-secondary',
                )}
              >
                {specialization}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <motion.button
            key={doctor.uid}
            whileHover={{y: -4}}
            onClick={() => setSelectedDoctor(doctor)}
            className="future-panel-soft group rounded-[1.75rem] p-6 text-left transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <img
                src={doctor.photoURL || `https://picsum.photos/seed/${doctor.uid}/200/200`}
                alt={doctor.displayName}
                className="h-16 w-16 rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="truncate text-lg font-bold text-cyan-50">{doctor.displayName}</h2>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-600">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{doctor.rating ?? 'N/A'}</span>
                  </div>
                </div>

                <p className="mt-1 text-sm font-semibold text-cyan-300">{doctor.specialization}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                  <MapPin size={14} />
                  <span className="truncate">{doctor.clinicName || 'Clinic details pending'}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Tag label={doctor.consultationMode || 'hybrid'} tone="violet" />
              <Tag label={doctor.availability || 'tomorrow'} tone="emerald" />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Recommended for</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {doctor.specialization === 'Dermatology'
                    ? 'Skin analysis follow-up'
                    : doctor.specialization === 'Dentist'
                      ? 'Dental imaging review'
                      : 'Routine care and monitoring'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200 transition-colors group-hover:bg-cyan-400/20 group-hover:text-white">
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.button>
        ))}
      </section>

      {filteredDoctors.length === 0 && (
        <div className="future-panel-soft rounded-[2rem] border-dashed p-10 text-center text-sm text-slate-300">
          No doctors match your current filters.
        </div>
      )}

      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{opacity: 0, scale: 0.96}}
            animate={{opacity: 1, scale: 1}}
            className="future-panel w-full max-w-lg rounded-[2rem] p-7 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <img
                src={selectedDoctor.photoURL || `https://picsum.photos/seed/${selectedDoctor.uid}/200/200`}
                alt={selectedDoctor.displayName}
                className="h-20 w-20 rounded-3xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-cyan-50">{selectedDoctor.displayName}</h2>
                  <Sparkles size={18} className="text-sky-500" />
                </div>
                <p className="mt-1 text-sm font-semibold text-cyan-300">{selectedDoctor.specialization}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Match patient needs to the right specialist quickly, then confirm a slot with a lightweight
                  booking flow.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Select date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="future-input w-full rounded-2xl p-3 focus:border-cyan-300 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Select time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="future-input w-full rounded-2xl p-3 focus:border-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="future-panel-soft mt-6 rounded-[1.5rem] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Consultation mode</span>
                <span className="text-sm font-semibold capitalize text-cyan-50">
                  {selectedDoctor.consultationMode || 'hybrid'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Next availability</span>
                <span className="text-sm font-semibold capitalize text-cyan-50">
                  {selectedDoctor.availability || 'tomorrow'}
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="future-button-secondary flex-1 rounded-full py-3 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!bookingDate || !bookingTime || isBooking}
                onClick={handleBook}
                className="future-button flex-1 rounded-full py-3 font-semibold disabled:opacity-50"
              >
                {isBooking ? 'Booking...' : 'Confirm booking'}
              </button>
            </div>

            {bookingMessage && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {bookingMessage}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function HighlightCard({
  title,
  value,
  icon: Icon,
  tone,
  suffix,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{size?: number}>;
  tone: 'sky' | 'violet' | 'emerald';
  suffix?: string;
}) {
  const tones = {
    sky: 'bg-sky-100 text-sky-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
      <div className={cn('inline-flex rounded-2xl p-2', tones[tone])}>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
        {suffix}
      </p>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  );
}

function Tag({label, tone}: {label: string; tone: 'violet' | 'emerald'}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span className={cn('rounded-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em]', tones[tone])}>
      {label}
    </span>
  );
}
