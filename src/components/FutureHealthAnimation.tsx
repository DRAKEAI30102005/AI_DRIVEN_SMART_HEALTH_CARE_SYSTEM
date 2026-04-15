import React from 'react';

type FutureHealthAnimationProps = {
  compact?: boolean;
  className?: string;
};

export default function FutureHealthAnimation({compact, className = ''}: FutureHealthAnimationProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.16),_transparent_34%),linear-gradient(180deg,rgba(245,250,255,0.72)_0%,rgba(236,246,255,0.88)_100%)] ${compact ? 'min-h-[420px]' : 'min-h-[620px]'} ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_18%),radial-gradient(circle_at_80%_24%,rgba(96,165,250,0.12),transparent_16%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.1),transparent_24%)]" />
      <div className="login-grid absolute inset-0 opacity-50" />
      <div className="login-particles absolute inset-0">
        <span className="particle left-[18%] top-[20%]" />
        <span className="particle left-[78%] top-[24%]" />
        <span className="particle left-[66%] top-[62%]" />
        <span className="particle left-[28%] top-[72%]" />
        <span className="particle left-[52%] top-[14%]" />
      </div>

      <div className={`login-orbit orbit-one ${compact ? 'scale-[0.76]' : ''}`} />
      <div className={`login-orbit orbit-two ${compact ? 'scale-[0.76]' : ''}`} />
      <div className={`login-orbit orbit-three ${compact ? 'scale-[0.76]' : ''}`} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div className="login-core-glow absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <svg
            viewBox="0 0 240 520"
            className={`${compact ? 'h-[400px] w-[186px]' : 'h-[520px] w-[240px]'} login-human-figure`}
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
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-500">Health mesh</p>
          <p className="mt-2 text-sm text-slate-500">Rotating digital body model with predictive orbit motion</p>
        </div>
      </div>
    </div>
  );
}
