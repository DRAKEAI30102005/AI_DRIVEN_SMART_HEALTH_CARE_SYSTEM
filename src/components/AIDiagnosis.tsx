import React, {useEffect, useState} from 'react';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {
  Activity,
  AlertCircle,
  Brain,
  CheckCircle2,
  Loader2,
  ScanSearch,
  Stethoscope,
  Upload,
  X,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useAuth} from '../context/AuthContext';
import {db} from '../firebase';
import {cn} from '../lib/utils';
import {diagnoseWithYolo, getYoloStatus, type YoloDiagnosisResult, type YoloServiceStatus} from '../services/yoloService';

export default function AIDiagnosis() {
  const {profile} = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [type, setType] = useState<'skin' | 'dental'>('skin');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YoloDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<YoloServiceStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      setCheckingStatus(true);
      const status = await getYoloStatus();
      setServiceStatus(status);
      setCheckingStatus(false);
    };

    void loadStatus();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    if (!image || !profile) return;

    setLoading(true);
    setError(null);

    try {
      const diagnosis = await diagnoseWithYolo(image, type);
      const status = await getYoloStatus();
      setServiceStatus(status);

      setResult(diagnosis);

      await addDoc(collection(db, 'ai_scans'), {
        patientId: profile.uid,
        imageUrl: image,
        type,
        result: diagnosis.summary,
        detections: diagnosis.detections,
        findings: diagnosis.findings,
        modelName: diagnosis.modelName,
        confidence:
          diagnosis.detections.length > 0
            ? diagnosis.detections.reduce((total, entry) => total + entry.confidence, 0) / diagnosis.detections.length
            : 0,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to process YOLO diagnosis. Please try again.');
      const status = await getYoloStatus();
      setServiceStatus(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-cyan-50">YOLO Medical Scan Support</h1>
        <p className="mt-2 text-slate-300">
          Upload a skin or dental image to run it through your local YOLO screening model and review the marked regions.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="future-panel rounded-2xl p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-cyan-50">1. Select Scan Type</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setType('skin')}
                className={cn(
                  'flex-1 rounded-xl border p-4 text-center transition-all',
                  type === 'skin'
                    ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200'
                    : 'border-cyan-300/10 bg-slate-950/20 text-slate-300 hover:border-cyan-300/30',
                )}
              >
                <Activity className="mx-auto mb-2" />
                <span className="text-sm font-medium">Skin Scan</span>
              </button>
              <button
                  onClick={() => setType('dental')}
                  className={cn(
                    'flex-1 rounded-xl border p-4 text-center transition-all',
                    type === 'dental'
                      ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200'
                      : 'border-cyan-300/10 bg-slate-950/20 text-slate-300 hover:border-cyan-300/30',
                  )}
                >
                  <Stethoscope className="mx-auto mb-2" />
                <span className="text-sm font-medium">Dental Scan</span>
              </button>
            </div>
          </div>

          <div className="future-panel rounded-2xl p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-cyan-50">2. Upload Image</h2>
            <div className="future-panel-soft relative aspect-video w-full overflow-hidden rounded-xl border-2 border-dashed border-cyan-300/15 transition-colors hover:border-cyan-300/40">
              {image ? (
                <img src={image} alt="Upload preview" className="h-full w-full object-cover" />
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-slate-300">
                  <Upload size={32} />
                  <span className="text-sm font-medium">Click to upload or drag and drop</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}

              {image && (
                <button
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  aria-label="Remove uploaded image"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              disabled={!image || loading}
              onClick={handleDiagnose}
              className="future-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ScanSearch size={20} />}
              {loading ? 'Running YOLO scan...' : 'Start YOLO Scan'}
            </button>

            <div className="mt-4 rounded-xl border border-cyan-300/10 bg-slate-950/25 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">YOLO service status</p>
                <button
                  onClick={async () => {
                    setCheckingStatus(true);
                    const status = await getYoloStatus();
                    setServiceStatus(status);
                    setCheckingStatus(false);
                  }}
                  className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs font-semibold text-cyan-100 transition-colors hover:border-cyan-300/35"
                  type="button"
                >
                  {checkingStatus ? 'Checking...' : 'Refresh'}
                </button>
              </div>

              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>
                  Service: {' '}
                  <span className={serviceStatus?.service === 'online' ? 'text-emerald-300' : 'text-rose-300'}>
                    {checkingStatus ? 'Checking...' : serviceStatus?.service === 'online' ? 'Online' : 'Offline'}
                  </span>
                </p>
                <p>
                  Skin model: {' '}
                  <span className={serviceStatus?.availableModels.skin ? 'text-emerald-300' : 'text-amber-300'}>
                    {serviceStatus?.availableModels.skin ? 'Available' : 'Missing'}
                  </span>
                </p>
                <p>
                  Dental model: {' '}
                  <span className={serviceStatus?.availableModels.dental ? 'text-emerald-300' : 'text-amber-300'}>
                    {serviceStatus?.availableModels.dental ? 'Available' : 'Missing'}
                  </span>
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex gap-3 rounded-xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-200">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="future-panel-soft flex gap-3 rounded-xl border-amber-300/20 p-4 text-amber-200">
            <AlertCircle className="shrink-0" size={20} />
            <p className="text-xs leading-relaxed">
              <strong>Important:</strong> This flow now expects a local YOLO medical model service at
              `http://127.0.0.1:8765/predict`. You still need trained skin and dental weights for medically meaningful
              results.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="future-panel h-full rounded-2xl p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-2 text-green-400">
                  <CheckCircle2 size={24} />
                  <h2 className="text-xl font-bold text-cyan-50">Analysis Complete</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/30">
                      <img
                        src={result.annotatedImage || image || undefined}
                        alt="YOLO scan result"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="future-panel-soft rounded-2xl p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Brain size={18} className="text-cyan-300" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Model summary</h3>
                      </div>
                      <p className="text-sm leading-7 text-slate-200">{result.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="future-panel-soft rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Model used</p>
                      <p className="mt-2 text-lg font-bold text-white">{result.modelName}</p>
                    </div>

                    <div className="future-panel-soft rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Detections</p>
                      <div className="mt-3 space-y-3">
                        {result.detections.length > 0 ? (
                          result.detections.map((detection, index) => (
                            <div key={`${detection.label}-${index}`} className="rounded-xl border border-cyan-300/10 bg-slate-950/30 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-white">{detection.label}</p>
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                  {(detection.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-slate-400">
                                Box: {detection.bbox.map((value) => value.toFixed(1)).join(', ')}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-cyan-300/10 p-4 text-sm text-slate-300">
                            No suspicious bounding boxes were returned by the current YOLO model.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="future-panel-soft rounded-2xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Screening notes</p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-200">
                        {result.findings.map((finding) => (
                          <li key={finding}>{finding}</li>
                        ))}
                      </ul>
                    </div>

                    {result.warning && (
                      <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                        {result.warning}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="future-panel-soft flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-dashed text-slate-300">
                <Loader2
                  size={48}
                  className={cn('mb-4', loading ? 'animate-spin text-blue-600' : 'opacity-20')}
                />
                <p className="text-sm font-medium">
                  {loading ? 'YOLO is analyzing your image...' : 'YOLO scan results will appear here'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
