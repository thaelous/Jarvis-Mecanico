import React from 'react';
import {
  X,
  Magnet,
  CheckCircle2,
  AlertCircle,
  Move,
  Activity,
  Layers,
  Zap,
  Gauge,
  Cpu,
  ShieldAlert,
} from 'lucide-react';
import { MechanicalModelDefinition, MechanicalPartConfig, PartRuntimeState } from '../types/cad';
import { ViewportTelemetry } from '../cad/CADViewport';
import { sound } from '../utils/audio';

interface PartDetailsHUDProps {
  isOpen: boolean;
  onClose: () => void;
  partConfig: MechanicalPartConfig | null;
  runtimeState: PartRuntimeState | null;
  modelDef: MechanicalModelDefinition;
  telemetry?: ViewportTelemetry;
  assemblyPercentage: number;
  physicsEnabled: boolean;
  onSnapPart: (id: string) => void;
  onExplodePart: (id: string) => void;
  themeMode?: 'dark' | 'light';
}

export const PartDetailsHUD: React.FC<PartDetailsHUDProps> = ({
  isOpen,
  onClose,
  partConfig,
  runtimeState,
  modelDef,
  telemetry,
  assemblyPercentage,
  physicsEnabled,
  onSnapPart,
  onExplodePart,
  themeMode = 'dark',
}) => {
  if (!isOpen) return null;

  const isLight = themeMode === 'light';

  const isSnapped = runtimeState ? runtimeState.isSnapped : true;
  const distance = runtimeState ? runtimeState.distanceToTarget : 0;
  const tolerance = partConfig?.snapTolerance ?? 0.8;

  // Proximity percentage to snap tolerance (100% when at 0 distance, 0% when far)
  const proximityRatio = Math.max(0, Math.min(1, (tolerance * 2.5 - distance) / (tolerance * 2.5)));
  const proximityPercent = Math.round(proximityRatio * 100);
  const isInsideSnapZone = distance <= tolerance;

  const posX = runtimeState?.currentPosition.x.toFixed(2) ?? '0.00';
  const posY = runtimeState?.currentPosition.y.toFixed(2) ?? '0.00';
  const posZ = runtimeState?.currentPosition.z.toFixed(2) ?? '0.00';

  return (
    <aside
      className={`absolute top-14 right-4 z-20 w-84 md:w-96 max-h-[calc(100vh-120px)] overflow-y-auto backdrop-blur-md border rounded-sm p-4 shadow-2xl select-none animate-fadeIn transition-colors duration-200 pointer-events-auto ${
        isLight
          ? 'bg-white/95 border-slate-300 text-slate-800 shadow-xl'
          : 'bg-slate-950/92 border-cyan-500/50 text-slate-100 shadow-[0_0_24px_rgba(6,182,212,0.25)]'
      }`}
    >
      {/* HUD Header */}
      <div className="flex items-start justify-between border-b border-cyan-900/60 pb-2.5 mb-3">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            TELEMETRÍA & DIAGNÓSTICO CAD
          </span>
          <h3 className="text-sm font-tech font-bold tracking-wide truncate max-w-[240px]">
            {modelDef.name}
          </h3>
        </div>

        <button
          onClick={() => {
            sound.playClick(600);
            onClose();
          }}
          className={`p-1 rounded transition ${
            isLight
              ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Cerrar Panel de Telemetría"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Global Viewport Engine Telemetry */}
      <div className={`mb-3.5 p-2.5 rounded-sm border ${
        isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-500 uppercase mb-2">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" /> Rendimiento WebGL
          </span>
          <span className="text-emerald-500 font-semibold">100% MÁXIMO CONSTANTE</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
          <div className={`p-1 rounded ${isLight ? 'bg-white' : 'bg-slate-950/70 border border-slate-800'}`}>
            <span className="text-[9px] text-slate-400 block">FPS</span>
            <span className="font-bold text-emerald-400">{telemetry?.fps ?? 60}</span>
          </div>
          <div className={`p-1 rounded ${isLight ? 'bg-white' : 'bg-slate-950/70 border border-slate-800'}`}>
            <span className="text-[9px] text-slate-400 block">DRAWS</span>
            <span className="font-bold text-cyan-400">{telemetry?.drawCalls ?? 0}</span>
          </div>
          <div className={`p-1 rounded ${isLight ? 'bg-white' : 'bg-slate-950/70 border border-slate-800'}`}>
            <span className="text-[9px] text-slate-400 block">TRIS</span>
            <span className="font-bold text-slate-200">
              {telemetry ? (telemetry.triangles > 999 ? `${(telemetry.triangles / 1000).toFixed(1)}k` : telemetry.triangles) : '0'}
            </span>
          </div>
          <div className={`p-1 rounded ${isLight ? 'bg-white' : 'bg-slate-950/70 border border-slate-800'}`}>
            <span className="text-[9px] text-slate-400 block">FÍSICA</span>
            <span className={`font-bold ${physicsEnabled ? 'text-amber-400' : 'text-slate-400'}`}>
              {physicsEnabled ? 'GRAV' : 'OFF'}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Progreso Total de Ensamble:</span>
          <span className={`font-semibold ${assemblyPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {assemblyPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${assemblyPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Selected Part Inspection OR Model Specs */}
      {partConfig ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase flex items-center gap-1">
              <Cpu className="w-3 h-3" /> PIEZA SELECCIONADA
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-xs flex items-center gap-1 font-semibold ${
                isSnapped
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/50'
              }`}
            >
              {isSnapped ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ACOPLADO</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>DESACOPLADO</span>
                </>
              )}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-tech font-bold text-cyan-300">{partConfig.name}</h4>
            <p className="text-[10px] text-slate-400 font-mono">{partConfig.technicalName}</p>
          </div>

          {/* Magnetic Proximity Radar */}
          <div className={`p-2.5 rounded-sm border ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Magnet className="w-3 h-3 text-cyan-400" />
                Proximidad al Asiento:
              </span>
              <span
                className={`font-mono font-medium ${
                  isInsideSnapZone ? 'text-emerald-400 animate-pulse' : 'text-slate-300'
                }`}
              >
                {distance.toFixed(3)} u / Tol: ±{tolerance.toFixed(2)}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${
                  isInsideSnapZone
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                    : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                }`}
                style={{ width: `${proximityPercent}%` }}
              />
            </div>

            {isInsideSnapZone && !isSnapped && (
              <p className="text-[10px] font-mono text-emerald-400 text-center mt-1 animate-bounce">
                ⚡ DENTRO DE ZONA DE ATRACCIÓN // SUELTA PARA ACOPLAR
              </p>
            )}
          </div>

          {/* Realtime Spatial Coordinates (X, Y, Z) */}
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className={`p-1.5 rounded-sm border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className="text-[9px] text-red-400 block font-bold">EJE X</span>
              <span className="text-xs font-semibold">{posX}</span>
            </div>
            <div className={`p-1.5 rounded-sm border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className="text-[9px] text-emerald-400 block font-bold">EJE Y</span>
              <span className="text-xs font-semibold">{posY}</span>
            </div>
            <div className={`p-1.5 rounded-sm border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
              <span className="text-[9px] text-blue-400 block font-bold">EJE Z</span>
              <span className="text-xs font-semibold">{posZ}</span>
            </div>
          </div>

          {/* Materials & Mechanical Specification */}
          <div className={`space-y-1 text-[11px] font-mono p-2.5 rounded-sm border ${
            isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
          }`}>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[10px]">
              <Layers className="w-3.5 h-3.5" />
              <span>{partConfig.materialName}</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              {partConfig.materialDescription}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
            <button
              onClick={() => onSnapPart(partConfig.id)}
              disabled={isSnapped}
              className={`py-2 px-3 rounded-xs border flex items-center justify-center gap-1.5 transition ${
                isSnapped
                  ? 'opacity-40 border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                  : 'border-cyan-400 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Magnet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto-Acoplar</span>
            </button>

            <button
              onClick={() => {
                sound.playWhoosh(true);
                onExplodePart(partConfig.id);
              }}
              className="py-2 px-3 rounded-xs border border-slate-700 bg-slate-900 hover:bg-slate-850 hover:border-slate-500 text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Separar Eje</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          <div className={`p-3 rounded-sm border text-center ${
            isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-slate-900/50 border-slate-800 text-slate-400'
          }`}>
            <ShieldAlert className="w-5 h-5 mx-auto mb-1 text-cyan-400 opacity-80" />
            <p className="text-[11px] leading-snug">
              Haz clic sobre cualquier componente 3D para examinar su posición vectorial, material y tolerancias de montaje.
            </p>
          </div>

          <div className={`p-3 rounded-sm border space-y-1.5 ${
            isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[10px] text-cyan-400 uppercase font-semibold block mb-1">
              ESPECIFICACIONES DEL SUBSISTEMA
            </span>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Peso Total:</span>
              <span className="font-semibold">{modelDef.specs.weightKg}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Material Estructural:</span>
              <span className="font-semibold">{modelDef.specs.material}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Resistencia / Par:</span>
              <span className="font-semibold">{modelDef.specs.torqueOrPower}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Tolerancia Nominal:</span>
              <span className="font-semibold text-emerald-400">{modelDef.specs.tolerance}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
