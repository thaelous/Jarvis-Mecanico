import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Magnet,
  Maximize2,
  ListFilter,
  Info,
} from 'lucide-react';
import { MechanicalModelDefinition, PartRuntimeState } from '../types/cad';
import { sound } from '../utils/audio';

interface PartsListPanelProps {
  modelDef: MechanicalModelDefinition;
  partStates: Map<string, PartRuntimeState>;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onIsolatePart: (id: string) => void;
  onSnapPart: (id: string) => void;
  onShowAllParts: () => void;
  themeMode?: 'dark' | 'light';
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const PartsListPanel: React.FC<PartsListPanelProps> = ({
  modelDef,
  partStates,
  selectedPartId,
  onSelectPart,
  onToggleVisibility,
  onIsolatePart,
  onSnapPart,
  onShowAllParts,
  themeMode = 'dark',
  isOpen = false,
  onToggleOpen,
}) => {
  const [showSpecs, setShowSpecs] = useState(false);
  const isLight = themeMode === 'light';

  const { parts } = modelDef.createParts();

  const totalParts = parts.length;
  const snappedCount = parts.filter((p) => {
    const st = partStates.get(p.id);
    return st ? st.isSnapped : true;
  }).length;
  const percent = Math.round((snappedCount / (totalParts || 1)) * 100);

  return (
    <aside
      id="parts-tree-sidebar"
      className={`parts-tree-sidebar ${
        isOpen ? 'visible open' : ''
      } fixed md:absolute top-0 left-0 z-30 h-full w-80 max-w-[85vw] flex flex-col ${
        isLight
          ? 'bg-slate-100/95 border-r border-slate-300 text-slate-800 shadow-2xl'
          : 'bg-slate-950/95 border-r border-cyan-900/40 text-slate-200 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
      } backdrop-blur-md select-none`}
    >
      {/* Collapse/Expand Toggle Tab on the right edge */}
      <button
        onClick={() => {
          sound.playClick(600);
          if (onToggleOpen) {
            onToggleOpen();
          } else {
            const el = document.getElementById('parts-tree-sidebar');
            el?.classList.toggle('visible');
          }
        }}
        className={`absolute -right-7 top-1/2 -translate-y-1/2 z-40 w-7 h-14 border ${
          isLight
            ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            : 'bg-slate-900 border-cyan-500/50 text-cyan-400 hover:bg-cyan-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
        } rounded-r-md flex items-center justify-center transition cursor-pointer`}
        title={isOpen ? 'Colapsar Árbol de Componentes' : 'Expandir Árbol de Componentes'}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Full hierarchical tree with fixed layout */}
      <div className="flex flex-col h-full overflow-hidden w-full">
        {/* Header & Model Summary */}
        <div
          className={`p-3.5 border-b overflow-hidden ${
            isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-cyan-950/80'
          }`}
        >
          <div className="flex items-center justify-between mb-1 overflow-hidden">
            <span className="text-[10px] font-mono text-cyan-500 tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"></span>
              ÁRBOL DE COMPONENTES
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick(650);
                  setShowSpecs(!showSpecs);
                }}
                className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition whitespace-nowrap"
              >
                <Info className="w-3 h-3 text-cyan-500 shrink-0" />
                <span>{showSpecs ? 'Ocultar Ficha' : 'Ficha'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick(500);
                  if (onToggleOpen) onToggleOpen();
                  else document.getElementById('parts-tree-sidebar')?.classList.remove('visible');
                }}
                className="text-xs text-slate-400 hover:text-white p-1 rounded"
                title="Cerrar panel"
              >
                ✕
              </button>
            </div>
          </div>

            <h2 className="text-sm font-tech font-bold truncate whitespace-nowrap">
              {modelDef.name}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate whitespace-nowrap">
              {modelDef.category}
            </p>

            {/* Assembly Progress Meter */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1 whitespace-nowrap">
                <span className="text-slate-400">Estado de Ensamble:</span>
                <span
                  className={`font-semibold ${
                    percent === 100 ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {snappedCount} / {totalParts} ({percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-300 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-700/30">
                <div
                  className={`h-full transition-all duration-300 ${
                    percent === 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'bg-gradient-to-r from-amber-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Technical Specs Drawer */}
            {showSpecs && (
              <div
                className={`mt-3 p-2.5 rounded text-[11px] font-mono space-y-1 animate-fadeIn border ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-950/90 border-cyan-900/60 text-slate-300'
                }`}
              >
                <div className="flex justify-between border-b border-slate-700/20 pb-1 whitespace-nowrap overflow-hidden">
                  <span className="text-slate-400">Masa Total:</span>
                  <span className="text-cyan-500 font-medium">{modelDef.specs.weightKg}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/20 pb-1 whitespace-nowrap overflow-hidden">
                  <span className="text-slate-400">Material Base:</span>
                  <span className="truncate max-w-[140px]">{modelDef.specs.material}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/20 pb-1 whitespace-nowrap overflow-hidden">
                  <span className="text-slate-400">Régimen / Par:</span>
                  <span className="text-amber-500">{modelDef.specs.torqueOrPower}</span>
                </div>
                <div className="flex justify-between whitespace-nowrap overflow-hidden">
                  <span className="text-slate-400">Tolerancia CAD:</span>
                  <span className="text-emerald-500">{modelDef.specs.tolerance}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action bar for visibility */}
          <div
            className={`px-3.5 py-1.5 border-b flex items-center justify-between text-[11px] font-mono overflow-hidden whitespace-nowrap ${
              isLight ? 'bg-slate-200/50 border-slate-200 text-slate-600' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
            }`}
          >
            <span>{parts.length} PIEZAS REGISTRADAS</span>
            <button
              onClick={() => {
                sound.playClick(600);
                onShowAllParts();
              }}
              className="text-cyan-500 hover:text-cyan-400 transition hover:underline"
            >
              Mostrar Todas
            </button>
          </div>

          {/* Parts Scroll List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 overflow-x-hidden">
            {parts.map((part) => {
              const state = partStates.get(part.id);
              const isSelected = selectedPartId === part.id;
              const isSnapped = state ? state.isSnapped : true;
              const isVisible = state ? state.isVisible : true;

              return (
                <div
                  key={part.id}
                  onClick={() => {
                    sound.playSelect();
                    onSelectPart(part.id);
                  }}
                  className={`group relative p-2.5 rounded-sm border transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? isLight
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                        : 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-white'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 overflow-hidden">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSnapped
                              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                              : 'bg-amber-400 animate-ping'
                          }`}
                        />
                        <h4 className="text-xs font-mono font-medium truncate whitespace-nowrap">
                          {part.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate whitespace-nowrap mt-0.5">
                        {part.category} // {part.materialName}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-xs flex items-center gap-1 whitespace-nowrap ${
                          isSnapped
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {isSnapped ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                            <span>ACOPLADO</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                            <span>SEPARADO</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons per Item */}
                  <div className="mt-2 pt-1.5 border-t border-slate-700/20 flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick(500);
                          onToggleVisibility(part.id);
                        }}
                        className={`p-1 rounded transition ${
                          isVisible
                            ? 'text-slate-400 hover:text-cyan-500'
                            : 'text-slate-600 bg-red-950/30'
                        }`}
                        title={isVisible ? 'Ocultar Pieza' : 'Mostrar Pieza'}
                      >
                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick(650);
                          onIsolatePart(part.id);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-500 rounded transition"
                        title="Aislar esta pieza en el visor"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isSnapped && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSnapPart(part.id);
                        }}
                        className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-xs flex items-center gap-1 transition whitespace-nowrap"
                        title="Auto-acoplar de inmediato"
                      >
                        <Magnet className="w-3 h-3 text-cyan-400" />
                        <span>Acoplar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </aside>
  );
};
