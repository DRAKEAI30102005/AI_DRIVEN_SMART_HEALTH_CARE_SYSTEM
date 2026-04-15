# HealthPulse - Complete Source Code

Here is the complete source code for the HealthPulse application, consolidated into a single file for easy copying.

## `src/App.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AIDiagnosis from './components/AIDiagnosis';
import Doctors from './components/Doctors';
import { Activity } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function Login() {
  const { login, user } = useAuth();
  if (user) return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Activity size={32} />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">HealthPulse</h1>
          <p className="mt-2 text-slate-600">Your all-in-one healthcare companion.</p>
        </div>

        <button
          onClick={login}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white border-2 border-slate-200 py-4 font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
          Sign in with Google
        </button>
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
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/appointments" element={<Dashboard />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

## `src/components/Layout.tsx`
```tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Calendar, Activity, Shield, Menu, X, Stethoscope, Heart, Home, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Calendar', path: '/appointments', icon: Calendar },
    { name: 'Stats', path: '/stats', icon: BarChart2 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Top Header - Desktop Only */}
      <nav className="hidden md:block sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                <Activity size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">HealthPulse</span>
            </div>

            <div className="flex items-center gap-8">
              <Link to="/ai-diagnosis" className="text-sm font-bold text-slate-600 hover:text-blue-600">AI Diagnosis</Link>
              <Link to="/doctors" className="text-sm font-bold text-slate-600 hover:text-blue-600">Doctors</Link>
              {profile && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={profile.photoURL}
                      alt={profile.displayName}
                      className="h-8 w-8 rounded-full border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-semibold">{profile.displayName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {children}
      </main>

      {/* Bottom Navigation Bar - Mobile App Style */}
      <div className="fixed bottom-8 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2">
        <div className="flex items-center justify-between rounded-[2rem] bg-blue-600 p-2 shadow-2xl shadow-blue-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex h-14 w-14 items-center justify-center rounded-full text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <item.icon size={24} />
            </Link>
          ))}
          {/* Active indicator for Home */}
          <div className="absolute left-4 h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-600">
            <Home size={24} />
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => navigate('/ai-diagnosis')}
        className="fixed bottom-8 right-8 z-50 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-700 text-white shadow-2xl shadow-blue-300 transition-transform hover:scale-110 active:scale-95"
      >
        <div className="relative">
          <Heart size={40} fill="currentColor" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-700">
            <Activity size={14} />
          </div>
        </div>
      </button>
    </div>
  );
}
```

## `src/components/Dashboard.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const qAppts = query(
      collection(db, 'appointments'),
      where('patientId', '==', profile.uid),
      orderBy('date', 'desc')
    );

    const qScans = query(
      collection(db, 'ai_scans'),
      where('patientId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubAppts = onSnapshot(qAppts, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubScans = onSnapshot(qScans, (snapshot) => {
      setScans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubAppts();
      unsubScans();
    };
  }, [profile]);

  if (loading) return <div className="flex h-64 items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 p-8 md:p-12">
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold leading-tight text-slate-900">
            Your Body<br />Problems
          </h1>
          
          <div className="mt-10 space-y-6">
            <div>
              <p className="text-4xl font-bold text-slate-900">04</p>
              <p className="text-lg font-medium text-slate-400">Diseases</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900">13</p>
              <p className="text-lg font-medium text-slate-400">Medication</p>
            </div>
          </div>
        </div>

        {/* Anatomical Model Placeholder */}
        <div className="absolute right-0 top-0 h-full w-1/2 md:w-2/5">
          <img 
            src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1000" 
            alt="Anatomical Model" 
            className="h-full w-full object-contain object-right opacity-80 mix-blend-multiply"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Disease History Section */}
      <section>
        <div className="mb-6 flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-slate-900">Disease History</h2>
          <button className="text-sm font-bold text-slate-400 hover:text-blue-600">View all &gt;</button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {scans.length === 0 ? (
            <div className="w-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
              No disease history found.
            </div>
          ) : (
            scans.map((scan) => (
              <motion.div 
                key={scan.id}
                whileHover={{ y: -5 }}
                className="min-w-[320px] snap-center rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-100 border border-slate-50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://picsum.photos/seed/${scan.id}/100/100`} 
                      className="h-10 w-10 rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {scan.type === 'skin' ? 'Dermatologist' : 'Dentist'}
                      </p>
                      <p className="text-sm font-bold text-slate-900">Dr. Specialist</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-400">
                    {format(new Date(scan.createdAt), 'dd MMM yyyy')}
                  </div>
                </div>

                <h3 className="mb-4 text-xl font-bold text-slate-900 capitalize">
                  {scan.type} {scan.type === 'skin' ? 'Scan' : 'X-Ray'}
                </h3>

                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
                  <img 
                    src={scan.imageUrl} 
                    className="h-32 w-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src={`https://picsum.photos/seed/scan-${scan.id}/400/400`} 
                    className="h-32 w-full object-cover opacity-50 grayscale" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Recent Appointments */}
      <section className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-100 border border-slate-50">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming</h2>
          <button className="text-sm font-bold text-blue-600">View all</button>
        </div>
        <div className="space-y-4">
          {appointments.slice(0, 2).map((appt) => (
            <div key={appt.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{appt.doctorName}</p>
                  <p className="text-xs font-medium text-slate-400">{format(new Date(appt.date), 'PPP p')}</p>
                </div>
              </div>
              <StatusBadge status={appt.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", styles[status])}>
      {status}
    </span>
  );
}
```

## `src/components/AIDiagnosis.tsx`
```tsx
import React, { useState } from 'react';
import { Upload, Shield, AlertCircle, CheckCircle2, Loader2, Activity, Stethoscope, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { diagnoseImage } from '../services/geminiService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function AIDiagnosis() {
  const { profile } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<'skin' | 'dental'>('skin');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!image || !profile) return;
    setLoading(true);
    setError(null);
    try {
      const diagnosis = await diagnoseImage(image, type);
      setResult(diagnosis || "No diagnosis generated.");
      
      await addDoc(collection(db, 'ai_scans'), {
        patientId: profile.uid,
        imageUrl: image,
        type,
        result: diagnosis,
        confidence: 0.85 + Math.random() * 0.1, // Mock confidence
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError("Failed to process diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">AI Diagnosis Support</h1>
        <p className="mt-2 text-slate-600">Upload an image for instant AI-powered health insights (Skin or Dental).</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">1. Select Scan Type</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setType('skin')}
                className={cn(
                  "flex-1 rounded-xl border p-4 text-center transition-all",
                  type === 'skin' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Activity className="mx-auto mb-2" />
                <span className="text-sm font-medium">Skin Scan</span>
              </button>
              <button
                onClick={() => setType('dental')}
                className={cn(
                  "flex-1 rounded-xl border p-4 text-center transition-all",
                  type === 'dental' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Stethoscope className="mx-auto mb-2" />
                <span className="text-sm font-medium">Dental Scan</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">2. Upload Image</h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-blue-400">
              {image ? (
                <img src={image} alt="Upload" className="h-full w-full object-cover" />
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-400">
                  <Upload size={32} />
                  <span className="text-sm font-medium">Click to upload or drag & drop</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
              {image && (
                <button
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              disabled={!image || loading}
              onClick={handleDiagnose}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Shield size={20} />}
              {loading ? "Analyzing..." : "Start AI Diagnosis"}
            </button>
          </div>

          <div className="rounded-xl bg-amber-50 p-4 text-amber-800 border border-amber-200 flex gap-3">
            <AlertCircle className="shrink-0" size={20} />
            <p className="text-xs leading-relaxed">
              <strong>Disclaimer:</strong> This AI tool is for informational purposes only and does not replace professional medical advice. Always consult with a qualified healthcare provider.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full"
              >
                <div className="mb-4 flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={24} />
                  <h2 className="text-xl font-bold">Analysis Complete</h2>
                </div>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                <Loader2 size={48} className={cn("mb-4", loading ? "animate-spin text-blue-600" : "opacity-20")} />
                <p className="text-sm font-medium">
                  {loading ? "AI is analyzing your image..." : "Diagnosis results will appear here"}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

## `src/components/Doctors.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Doctors() {
  const { profile } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleBook = async () => {
    if (!profile || !selectedDoctor || !bookingDate || !bookingTime) return;
    setIsBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: profile.uid,
        patientName: profile.displayName,
        doctorId: selectedDoctor.uid,
        doctorName: selectedDoctor.displayName || 'Dr. Specialist',
        date: `${bookingDate}T${bookingTime}:00`,
        status: 'pending',
        type: 'general',
        createdAt: serverTimestamp(),
      });
      alert("Appointment booked successfully!");
      setSelectedDoctor(null);
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  // Mock doctors if none exist
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : [
    { uid: '1', displayName: 'Dr. Sarah Johnson', specialization: 'Cardiologist', rating: 4.9, clinicName: 'Heart & Wellness Center', photoURL: 'https://picsum.photos/seed/doc1/200/200' },
    { uid: '2', displayName: 'Dr. Michael Chen', specialization: 'Dentist', rating: 4.8, clinicName: 'Bright Smile Dental', photoURL: 'https://picsum.photos/seed/doc2/200/200' },
    { uid: '3', displayName: 'Dr. Elena Rodriguez', specialization: 'Dermatologist', rating: 4.7, clinicName: 'Skin Care Institute', photoURL: 'https://picsum.photos/seed/doc3/200/200' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find a Doctor</h1>
          <p className="mt-2 text-slate-600">Book an appointment with top-rated specialists in your area.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayDoctors.map((doc) => (
          <motion.div
            key={doc.uid}
            layoutId={doc.uid}
            onClick={() => setSelectedDoctor(doc)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <img
                src={doc.photoURL || `https://picsum.photos/seed/${doc.uid}/200/200`}
                alt={doc.displayName}
                className="h-16 w-16 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{doc.displayName}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{doc.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  <span>{doc.clinicName}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
              <span className="text-xs font-medium text-slate-400">Next available: Tomorrow</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <img src={selectedDoctor.photoURL} className="h-16 w-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div>
                <h2 className="text-xl font-bold">{selectedDoctor.displayName}</h2>
                <p className="text-sm text-blue-600 font-medium">{selectedDoctor.specialization}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={!bookingDate || !bookingTime || isBooking}
                onClick={handleBook}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
              >
                {isBooking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
```

## `src/context/AuthContext.tsx`
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'patient' | 'doctor' | 'admin';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'patient',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## `src/services/geminiService.ts`
```ts
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function diagnoseImage(base64Image: string, type: 'skin' | 'dental') {
  const model = "gemini-3-flash-preview";
  const prompt = type === 'skin' 
    ? "Analyze this skin image for potential issues. Provide a brief description, potential concerns, and a recommendation to see a specialist if needed. Format as a clear medical summary."
    : "Analyze this dental image for potential issues like cavities, gum disease, or misalignment. Provide a brief description and recommendation. Format as a clear dental summary.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } }
          ]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("AI Diagnosis failed:", error);
    throw error;
  }
}
```

## `src/firebase.ts`
```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
```

## `src/lib/utils.ts`
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
