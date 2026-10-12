import React from 'react';
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TutorialStep } from '../types/cad';
import { sound } from '../utils/audio';

interface TutorialGuideHUDProps {
  isActive: boolean;
  isPaused: boolean;
  mode: 'assemble' | 'disassemble';
  steps: TutorialStep[];
  currentStepIndex: number;
  onPauseToggle: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onAutoCompleteStep: () => void;
  onResetTutorial: () => void;
  onExitTutorial: () => void;
}

export const TutorialGuideHUD: React.FC<TutorialGuideHUDProps> = ({
  isActive,
  isPaused,
  mode,
  steps,
  currentStepIndex,
  onPauseToggle,
  onNextStep,
  onPrevStep,
  onAutoCompleteStep,
  onResetTutorial,
  onExitTutorial,
}) => {
  if (!isActive || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl bg-slate-950/95 backdrop-blur-md border-2 border-cyan-400 rounded-sm p-3.5 text-slate-100 shadow-[0_0_30px_rgba(6,182,212,0.4)] select-none animate-fadeIn">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/60">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-tech font-bold tracking-wider text-cyan-300 uppercase">
            {mode === 'assemble' ? 'MODO TUTORIAL: ENSAMBLE GUIADO' : 'MODO TUTORIAL: DESENSAMBLE GUIADO'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-amber-300">
            PASO {currentStepIndex + 1} DE {steps.length} ({progressPercent}%)
          </span>
          <button
            onClick={() => {
              sound.playClick(600);
              onExitTutorial();
            }}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            title="Finalizar Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Instructions */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-tech font-bold text-white flex items-center gap-2">
              <span className="px-1.5 py-0.5 text-[10px] bg-cyan-950 border border-cyan-400/60 text-cyan-300 rounded font-mono">
                {currentStep.targetVectorName}
              </span>
              <span>{currentStep.title}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-mono leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>
        </div>

        {/* Engineering Tech Tip */}
        <div className="p-2 bg-cyan-950/40 border border-cyan-800/40 rounded text-[11px] font-mono text-cyan-200 flex items-start gap-2">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-cyan-300">CONSEJO TÉCNICO:</strong> {currentStep.tip}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick(600);
              onPauseToggle();
            }}
            className={`px-3 py-1.5 rounded-xs border flex items-center gap-1 transition ${
              isPaused
                ? 'bg-amber-950 border-amber-400 text-amber-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(600);
              onResetTutorial();
            }}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xs flex items-center gap-1 transition"
            title="Reiniciar Tutorial desde el Paso 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick(600);
              onPrevStep();
            }}
            disabled={currentStepIndex === 0}
            className={`px-2.5 py-1.5 rounded-xs border flex items-center gap-1 transition ${
              currentStepIndex === 0
                ? 'opacity-40 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(850);
              onAutoCompleteStep();
            }}
            className="px-3 py-1.5 bg-cyan-950 border border-cyan-400 text-cyan-200 hover:bg-cyan-900 rounded-xs flex items-center gap-1.5 transition shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            title="Completar automáticamente este paso con animación"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Auto-Completar</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(750);
              onNextStep();
            }}
            disabled={currentStepIndex >= steps.length - 1}
            className={`px-3 py-1.5 rounded-xs border flex items-center gap-1 transition ${
              currentStepIndex >= steps.length - 1
                ? 'opacity-40 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-950 border-emerald-400 text-emerald-200 hover:bg-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
            }`}
          >
            <span>Siguiente</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
