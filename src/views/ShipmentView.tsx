import React, { useState, useCallback } from 'react';
import {
  ArrowLeft, ChevronDown, Euro, Loader2, MapPin,
  Package, Plane, Ship, ShieldCheck, Truck, User, Zap,
  Calendar, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ShipmentViewProps {
  onNavigate: (page: Page) => void;
  sessionId: string;
  onShipmentCreated: (id: string) => void;
}

type VehicleType = 'ground' | 'air' | 'sea';
type Priority = 'Standard' | 'Priority' | 'Critical';
type StepId = 1 | 2 | 3;

// ─── Helpers ────────────────────────────────────────────────────────────────────
function generateTrackingId(name: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = 'EVR';
  const initial = (name || 'ADM').substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${initial}-${timestamp}-${random}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

/** Clean field card */
const Field = ({
  label, children, full = false,
}: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div
    className={`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(30,136,200,.1)] ${full ? 'col-span-full' : ''}`}
  >
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
    {children}
  </div>
);

const FieldInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-transparent border-none outline-none text-[.9rem] font-bold text-slate-900 placeholder:text-slate-300"
  />
);

/** Toggle switch */
const Toggle = ({
  on, onChange, danger = false,
}: { on: boolean; onChange: () => void; danger?: boolean }) => (
  <button
    type="button"
    onClick={onChange}
    className="relative flex-shrink-0 w-12 h-[26px] rounded-full transition-colors duration-250"
    style={{ background: on ? (danger ? '#ef4444' : '#1E88C8') : '#e2e8f0' }}
    aria-checked={on}
    role="switch"
  >
    <motion.div
      animate={{ x: on ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm"
    />
  </button>
);

/** Vehicle selector button */
const VehicleBtn = ({
  icon: Icon, label, active, onClick,
}: { icon: React.ComponentType<any>; label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
      active
        ? 'border-blue-400 bg-blue-50 text-blue-600'
        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

/** Priority button */
const PriorityBtn = ({
  label, desc, active, variant, onClick,
}: { label: string; desc: string; active: boolean; variant: 'green' | 'amber' | 'red'; onClick: () => void }) => {
  const colors = {
    green: { border: 'border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    amber: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    red:   { border: 'border-red-400',   bg: 'bg-red-50',   text: 'text-red-700'   },
  };
  const c = colors[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${
        active ? `${c.border} ${c.bg} ${c.text}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-wider">{label}</p>
      <p className="text-[10px] mt-0.5 opacity-65">{desc}</p>
    </button>
  );
};

/** Animated 3D wireframe box (SVG) */
const WireframeBox = ({ l, w, h }: { l: number; w: number; h: number }) => {
  const scaleX = Math.min(l / 120, 1.4);
  const scaleY = Math.min(h / 100, 1.4);
  const vol = Math.round((l * w * h) / 1000);

  // Box geometry (isometric-ish)
  const ox = 80, oy = 95;
  const bw = 52 * scaleX, bh = 48 * scaleY, depth = 16;
  const pts = {
    fl: { x: ox - bw / 2, y: oy },
    fr: { x: ox + bw / 2, y: oy },
    br: { x: ox + bw / 2 + depth, y: oy - depth * 0.6 },
    bl: { x: ox - bw / 2 + depth, y: oy - depth * 0.6 },
    tfl: { x: ox - bw / 2, y: oy - bh },
    tfr: { x: ox + bw / 2, y: oy - bh },
    tbr: { x: ox + bw / 2 + depth, y: oy - bh - depth * 0.6 },
    tbl: { x: ox - bw / 2 + depth, y: oy - bh - depth * 0.6 },
  };
  const poly = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-blue-400 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        3D Scan
      </div>

      <motion.svg
        viewBox="0 0 160 130"
        className="w-44 h-36"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Bottom face */}
        <polygon points={poly([pts.fl, pts.fr, pts.br, pts.bl])} fill="rgba(59,130,246,.05)" stroke="#93c5fd" strokeWidth="1" />
        {/* Right face */}
        <polygon points={poly([pts.fr, pts.br, pts.tbr, pts.tfr])} fill="rgba(59,130,246,.06)" stroke="#60a5fa" strokeWidth="1.2" />
        {/* Front face */}
        <polygon points={poly([pts.fl, pts.fr, pts.tfr, pts.tfl])} fill="rgba(59,130,246,.08)" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Top face */}
        <polygon points={poly([pts.tfl, pts.tfr, pts.tbr, pts.tbl])} fill="rgba(59,130,246,.12)" stroke="#3b82f6" strokeWidth="1.5" />
        {/* Dimension dashes */}
        <line x1={pts.fl.x} y1={pts.fl.y + 8} x2={pts.fr.x} y2={pts.fr.y + 8} stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
        <line x1={pts.fr.x + 4} y1={pts.fr.y} x2={pts.tfr.x + 4} y2={pts.tfr.y} stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
        {/* Dots at corners */}
        {[pts.tfl, pts.tfr, pts.tbr, pts.tbl].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#3b82f6" opacity=".6" />
        ))}
      </motion.svg>

      <div className="flex gap-5 text-center">
        <div>
          <p className="text-sm font-black text-slate-900">{vol}L</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volume</p>
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{l}×{w}×{h}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">cm</p>
        </div>
      </div>
    </div>
  );
};

/** Step progress bar */
const StepProgress = ({ step }: { step: StepId }) => {
  const steps = [
    { id: 1, label: 'Sender' },
    { id: 2, label: 'Cargo' },
    { id: 3, label: 'Deploy' },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              step > s.id
                ? 'bg-blue-500 text-white shadow-[0_0_0_4px_rgba(30,136,200,.15)]'
                : step === s.id
                  ? 'bg-blue-500 text-white shadow-[0_0_0_4px_rgba(30,136,200,.15),0_0_18px_rgba(30,136,200,.3)]'
                  : 'bg-slate-200 text-slate-400'
            }`}>
              {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
              step >= s.id ? (step === s.id ? 'text-blue-500' : 'text-slate-500') : 'text-slate-300'
            }`}>{s.label}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all duration-500 ${step > s.id ? 'bg-blue-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Hero section labels per step ──────────────────────────────────────────────
const STEP_HERO = [
  { step: 'Step 1 / 3', title: 'Core Logistics',    sub: 'Sender information & route mapping' },
  { step: 'Step 2 / 3', title: 'Cargo Profiling',   sub: 'Dimensions, weight & cargo type' },
  { step: 'Step 3 / 3', title: 'Final Deployment',  sub: 'Priority, value & security clearance' },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export function ShipmentView({ onNavigate, sessionId, onShipmentCreated }: ShipmentViewProps) {
  const { t, language } = useLanguage();
  const es = language === 'es';

  const [step, setStep] = useState<StepId>(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('ground');

  // Step 2
  const [weight, setWeight] = useState('100');
  const [dimL, setDimL] = useState('120');
  const [dimW, setDimW] = useState('80');
  const [dimH, setDimH] = useState('100');
  const [cargoType, setCargoType] = useState('Electronics');

  // Step 3
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState<Priority>('Standard');
  const [hazardous, setHazardous] = useState(false);
  const [includeETA, setIncludeETA] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const volume = Math.round((Number(dimL) * Number(dimW) * Number(dimH)) / 1000);

  const goTo = useCallback((n: StepId) => {
    setError(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tryNext = useCallback(() => {
    if (step === 1) {
      if (!senderName.trim() || !origin.trim() || !dest.trim()) {
        setError(es ? 'Remplissez les champs requis (nom, origine, destination).' : 'Fill in the required fields (name, origin, destination).');
        return;
      }
    }
    setError(null);
    goTo((step + 1) as StepId);
  }, [step, senderName, origin, dest, es, goTo]);

  const handleBack = useCallback(() => {
    if (step > 1) goTo((step - 1) as StepId);
    else onNavigate('home');
  }, [step, goTo, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) { setError(es ? 'Valeur déclarée requise.' : 'Declared value required.'); return; }
    setLoading(true);
    setError(null);

    const trackingId = generateTrackingId(senderName);
    const drivers = ['Jean-Pierre L.', 'Sophie M.', 'Aleksei V.', 'Amara D.', 'Carlos R.', 'Elena S.'];

    try {
      const { error: dbError } = await supabase.from('shipments').insert([{
        id: trackingId,
        session_id: sessionId,
        origin,
        dest,
        date: includeETA ? new Date(estimatedArrival).toLocaleDateString(es ? 'es-ES' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
        status: 'Pending',
        value: es ? `€${Number(value).toLocaleString('es-ES')}` : `$${Number(value).toLocaleString('en-US')}`,
        driver: drivers[Math.floor(Math.random() * drivers.length)],
        progress: 0,
        vehicle_type: vehicleType,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        weight: Number(weight),
        dimensions: `${dimL}x${dimW}x${dimH}`,
        cargo_type: cargoType,
        priority,
        hazardous,
        animation_speed: priority === 'Critical' ? 10 : priority === 'Priority' ? 20 : 35,
        estimated_arrival: includeETA ? estimatedArrival : null,
      }]);

      if (dbError) throw dbError;
      setSubmitted(true);
      setTimeout(() => onShipmentCreated(trackingId), 1200);
    } catch (err: any) {
      setError(es ? 'Erreur de déploiement. Réessayez.' : 'Deployment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hero = STEP_HERO[step - 1];
  const vehicleLabel = vehicleType === 'ground' ? (es ? 'Camion' : 'Truck') : vehicleType === 'air' ? (es ? 'Avion' : 'Air') : (es ? 'Navire' : 'Ship');

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">

      {/* NAV */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>

        <span className="text-[11px] font-black uppercase tracking-[.22em] text-blue-600">
          EVRI Admin
        </span>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </header>

      {/* Main container scrollable with extra space at the bottom (pb-40) */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-40">

        {/* STEP PROGRESS */}
        <div className="mb-5">
          <StepProgress step={step} />
        </div>

        {/* HERO CARD */}
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#0F72A6] to-[#1E88C8] px-6 py-5 text-white mb-4 shadow-xl shadow-blue-500/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 left-1/3 w-28 h-28 rounded-full bg-white/[.04]" />
          <p className="text-[10px] font-black uppercase tracking-[.25em] text-white/60 mb-1">{hero.step}</p>
          <h2 className="text-2xl font-black tracking-tight mb-0.5">{hero.title}</h2>
          <p className="text-sm text-white/70">{hero.sub}</p>
        </div>

        {/* ── PANELS ── */}
        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-5"
            >
              {/* Sender */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                    {es ? 'Informations expéditeur' : 'Sender Information'}
                  </p>
                </div>
                <div className="grid gap-3">
                  <Field label={es ? 'Nom complet *' : 'Full Name *'} full>
                    <FieldInput
                      placeholder={es ? 'Jean-Pierre Leclerc' : 'John Smith'}
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <FieldInput type="email" placeholder="contact@evri.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
                    </Field>
                    <Field label={es ? 'Téléphone' : 'Phone'}>
                      <FieldInput type="tel" placeholder="+33 6 00 00 00" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Route */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                    {es ? 'Itinéraire' : 'Route Mapping'}
                  </p>
                </div>
                <div className="grid gap-3">
                  <Field label={es ? 'Origine *' : 'Origin *'} full>
                    <FieldInput placeholder={es ? 'Paris, France' : 'Chicago, IL'} value={origin} onChange={e => setOrigin(e.target.value)} />
                  </Field>
                  <Field label={es ? 'Destination *' : 'Destination *'} full>
                    <FieldInput placeholder={es ? 'Lyon, France' : 'New York, NY'} value={dest} onChange={e => setDest(e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Transport mode */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-3">
                  {es ? 'Mode de transport' : 'Transport Mode'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <VehicleBtn icon={Truck} label={es ? 'Camion' : 'Truck'} active={vehicleType === 'ground'} onClick={() => setVehicleType('ground')} />
                  <VehicleBtn icon={Plane} label={es ? 'Avion' : 'Air'} active={vehicleType === 'air'} onClick={() => setVehicleType('air')} />
                  <VehicleBtn icon={Ship} label={es ? 'Navire' : 'Ship'} active={vehicleType === 'sea'} onClick={() => setVehicleType('sea')} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={tryNext}
                className="w-full h-14 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-[.2em] flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[.98] transition-all shadow-lg shadow-blue-500/25"
              >
                {es ? 'Continuer' : 'Continue'}
                <Zap className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-5"
            >
              {/* 3D visualization */}
              <WireframeBox l={Number(dimL) || 1} w={Number(dimW) || 1} h={Number(dimH) || 1} />

              {/* Weight + type */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-3">
                  {es ? 'Composition du cargo' : 'Cargo Composition'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={es ? 'Poids (kg)' : 'Weight (kg)'}>
                    <FieldInput type="number" value={weight} onChange={e => setWeight(e.target.value)} />
                  </Field>
                  <Field label={es ? 'Type' : 'Cargo Type'}>
                    <div className="relative">
                      <select
                        value={cargoType}
                        onChange={e => setCargoType(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[.9rem] font-bold text-slate-900 appearance-none pr-5"
                      >
                        {['Electronics', 'Medical', 'Industrial', 'Luxury'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0 top-0.5 w-4 h-4 text-blue-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-3">
                  {es ? 'Dimensions (cm)' : 'Dimensions (cm)'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'L', val: dimL, set: setDimL },
                    { label: 'W', val: dimW, set: setDimW },
                    { label: 'H', val: dimH, set: setDimH },
                  ].map(({ label, val, set }) => (
                    <Field key={label} label={label}>
                      <FieldInput
                        type="number"
                        value={val}
                        onChange={e => set(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[.9rem] font-bold text-slate-900 text-center"
                      />
                    </Field>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <button
                  onClick={() => goTo(1)}
                  className="col-span-2 h-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  ← {es ? 'Retour' : 'Back'}
                </button>
                <button
                  onClick={tryNext}
                  className="col-span-3 h-12 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[.98] transition-all"
                >
                  {es ? 'Analyser' : 'Analyse & Proceed'}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.form
              key="s3"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 space-y-5"
            >
              {/* Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400 mb-2">
                  {es ? 'Récapitulatif' : 'Shipment Summary'}
                </p>
                {[
                  { key: es ? 'Itinéraire' : 'Route', val: `${origin} → ${dest}` },
                  { key: es ? 'Transport' : 'Transport', val: vehicleLabel },
                  { key: es ? 'Cargo' : 'Cargo', val: `${weight} kg · ${volume}L` },
                ].map(row => (
                  <div key={row.key} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{row.key}</span>
                    <span className="text-xs font-black text-slate-800">{row.val}</span>
                  </div>
                ))}
              </div>

              {/* Priority */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
                    {es ? 'Priorité de transit' : 'Transit Priority'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <PriorityBtn label={es ? 'Standard' : 'Standard'} desc={es ? '3–7 jours' : '3–7 days'} active={priority === 'Standard'} variant="green" onClick={() => setPriority('Standard')} />
                  <PriorityBtn label={es ? 'Priorité' : 'Priority'} desc={es ? '1–2 jours' : '1–2 days'} active={priority === 'Priority'} variant="amber" onClick={() => setPriority('Priority')} />
                  <PriorityBtn label={es ? 'Critique' : 'Critical'} desc={es ? 'Jour J' : 'Same day'} active={priority === 'Critical'} variant="red" onClick={() => setPriority('Critical')} />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{es ? 'Matières dangereuses' : 'Hazardous Materials'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{es ? 'Documentation requise' : 'Compliance documentation required'}</p>
                  </div>
                  <Toggle on={hazardous} onChange={() => setHazardous(h => !h)} danger />
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{es ? 'Date d\'arrivée estimée' : 'Include Estimated Arrival'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{es ? 'Optionnel' : 'Optional'}</p>
                    </div>
                  </div>
                  <Toggle on={includeETA} onChange={() => setIncludeETA(v => !v)} />
                </div>

                <AnimatePresence>
                  {includeETA && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">{es ? 'Date estimée' : 'Estimated Date'}</p>
                        <input
                          type="date"
                          value={estimatedArrival}
                          onChange={e => setEstimatedArrival(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Value */}
              <div className="border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-blue-400 focus-within:shadow-[0_0_0_3px_rgba(30,136,200,.1)] transition-all">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400 mb-2">
                  {es ? 'Valeur déclarée' : 'Declared Value'}
                </p>
                <div className="flex items-baseline gap-2">
                  <Euro className="w-7 h-7 text-slate-300 flex-shrink-0" />
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none outline-none text-3xl font-black text-slate-900 placeholder:text-slate-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              {/* Submit - Label changed to "Save" */}
              <button
                type="submit"
                disabled={loading || submitted}
                className="relative w-full h-14 rounded-2xl text-white text-xs font-black uppercase tracking-[.22em] flex items-center justify-center gap-2.5 overflow-hidden transition-all active:scale-[.98] disabled:opacity-60"
                style={{ background: submitted ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#1565C0,#1E88C8)', boxShadow: '0 12px 30px rgba(30,136,200,.3)' }}
              >
                {!loading && !submitted && (
                  <motion.div
                    animate={{ x: ['-60%', '160%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-y-0 w-1/3 bg-white/15 -skew-x-12 pointer-events-none"
                  />
                )}
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{es ? 'Sauvegarde…' : 'Saving…'}</>
                ) : submitted ? (
                  <><CheckCircle className="w-5 h-5" />{es ? 'Enregistré !' : 'Saved!'}</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" />{es ? 'Sauvegarder' : 'Save'}</>
                )}
              </button>

              <button
                type="button"
                onClick={() => goTo(2)}
                className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-500 transition-colors py-2"
              >
                ← {es ? 'Retour au cargo' : 'Back to Cargo'}
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}