import React from 'react';
import {
  X,
  Sun,
  Moon,
  Ghost,
  Activity,
  Box,
  Radio,
  Layers,
  Eye,
  Compass,
  Zap,
  Tag,
  GraduationCap,
  Volume2,
  VolumeX,
  HelpCircle,
  Download,
  FolderTree,
} from 'lucide-react';
import { RenderMode, ThemeMode } from '../types/cad';
import { sound } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  showGhostSilhouette: boolean;
  onToggleGhostSilhouette: () => void;
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  showPartsTree: boolean;
  onTogglePartsTree: () => void;
  renderMode: RenderMode;
  onSetRenderMode: (mode: RenderMode) => void;
  onSetCameraPreset: (preset: string) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  physicsEnabled: boolean;
  onTogglePhysics: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartTutorial: (mode: 'assemble' | 'disassemble') => void;
  onOpenHelp: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  themeMode,
  onToggleTheme,
  showGhostSilhouette,
  onToggleGhostSilhouette,
  showTelemetry,
  onToggleTelemetry,
  showPartsTree,
  onTogglePartsTree,
  renderMode,
  onSetRenderMode,
  onSetCameraPreset,
  showLabels,
  onToggleLabels,
  physicsEnabled,
  onTogglePhysics,
  soundEnabled,
  onToggleSound,
  onStartTutorial,
  onOpenHelp,
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const isLight = themeMode === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:hidden">
      {/* Semi-transparent blur backdrop: Tapping anywhere on 3D canvas closes drawer */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sound.playClick(500);
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Off-canvas Drawer Panel */}
      <div
        className={`relative z-10 w-[84%] max-w-sm h-full flex flex-col backdrop-blur-xl shadow-2xl border-l transition-transform duration-300 font-mono select-none overflow-y-auto ${
          isLight
            ? 'bg-slate-100/95 border-slate-300 text-slate-800'
            : 'bg-slate-950/95 border-cyan-900/60 text-slate-100 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
        }`}
        style={{
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 24px))',
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 12px))',
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚙️</span>
            <span className="font-tech text-xs tracking-wider uppercase font-semibold text-cyan-500">
              HERRAMIENTAS CAD
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick(550);
              onClose();
            }}
            className={`p-1.5 rounded-sm border transition flex items-center justify-center active:scale-95 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Cerrar Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content Sections */}
        <div className="p-4 space-y-4 text-xs flex-1">
          {/* SECTION 1: VISUALIZACIÓN & TEMA */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              1. VISUALIZACIÓN & TEMA
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Modo Claro / Oscuro */}
              <button
                onClick={() => {
                  sound.playClick(650);
                  onToggleTheme();
                }}
                className={`p-2.5 rounded-sm border flex items-center justify-between font-medium transition active:scale-95 ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  <span className="truncate">{isLight ? 'Modo Oscuro' : 'Modo Claro'}</span>
                </div>
              </button>

              {/* Silueta Ensamble */}
              <button
                onClick={() => {
                  sound.playClick(showGhostSilhouette ? 500 : 750);
                  onToggleGhostSilhouette();
                }}
                className={`p-2.5 rounded-sm border flex items-center justify-between font-medium transition active:scale-95 ${
                  showGhostSilhouette
                    ? isLight
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                      : 'bg-indigo-950/70 border-cyan-400 text-cyan-200'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Ghost className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">👻 Silueta</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    showGhostSilhouette ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-500'
                  }`}
                />
              </button>

              {/* Etiquetas 3D */}
              <button
                onClick={() => {
                  sound.playClick(showLabels ? 500 : 750);
                  onToggleLabels();
                }}
                className={`p-2.5 rounded-sm border flex items-center justify-between font-medium transition active:scale-95 ${
                  showLabels
                    ? isLight
                      ? 'bg-cyan-50 border-cyan-400 text-cyan-700'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="truncate">Etiquetas 3D</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    showLabels ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-500'
                  }`}
                />
              </button>

              {/* Física Cannon.js */}
              <button
                onClick={() => {
                  sound.playClick(physicsEnabled ? 500 : 900);
                  onTogglePhysics();
                }}
                className={`p-2.5 rounded-sm border flex items-center justify-between font-medium transition active:scale-95 ${
                  physicsEnabled
                    ? 'bg-amber-950/80 border-amber-400 text-amber-300'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Zap className={`w-3.5 h-3.5 ${physicsEnabled ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">⚡ Gravedad</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    physicsEnabled ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-slate-500'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SECTION 2: SOMBREADO 3D (PBR, RAYOS X, HOLOGRAMA, ALAMBRE) */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              2. MODO DE SOMBREADO 3D
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  sound.playClick(600);
                  onSetRenderMode('pbr');
                }}
                className={`p-2 rounded-sm border flex items-center gap-2 text-left transition ${
                  renderMode === 'pbr'
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span className="truncate">PBR Metálico</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick(600);
                  onSetRenderMode('xray');
                }}
                className={`p-2 rounded-sm border flex items-center gap-2 text-left transition ${
                  renderMode === 'xray'
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Rayos X</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick(600);
                  onSetRenderMode('hologram');
                }}
                className={`p-2 rounded-sm border flex items-center gap-2 text-left transition ${
                  renderMode === 'hologram'
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Holograma</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick(600);
                  onSetRenderMode('wireframe');
                }}
                className={`p-2 rounded-sm border flex items-center gap-2 text-left transition ${
                  renderMode === 'wireframe'
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Alambre CAD</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: VISTAS DE CÁMARA */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              3. ÁNGULOS DE CÁMARA
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'iso', label: 'ISO' },
                { id: 'front', label: 'Frente' },
                { id: 'side', label: 'Lado' },
                { id: 'top', label: 'Arriba' },
              ].map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    sound.playClick(650);
                    onSetCameraPreset(cam.id);
                  }}
                  className={`p-2 rounded-sm border text-center transition font-semibold active:scale-95 ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-cyan-300'
                  }`}
                >
                  <Compass className="w-3 h-3 mx-auto mb-1 text-cyan-500" />
                  <span className="text-[10px] block">{cam.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: PANELES Y HERRAMIENTAS */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              4. PANELES & MEDIDAS
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Árbol de Componentes */}
              <button
                onClick={() => {
                  sound.playClick(showPartsTree ? 500 : 700);
                  onTogglePartsTree();
                  onClose();
                }}
                className={`w-full p-2.5 rounded-sm border flex items-center justify-between transition ${
                  showPartsTree
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-200 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-cyan-500" />
                  <span>📁 Árbol de Componentes</span>
                </div>
                <span className="text-[10px] opacity-70">
                  {showPartsTree ? 'Abierto' : 'Abrir'}
                </span>
              </button>

              {/* Panel de Telemetría */}
              <button
                onClick={() => {
                  sound.playClick(showTelemetry ? 500 : 700);
                  onToggleTelemetry();
                  onClose();
                }}
                className={`w-full p-2.5 rounded-sm border flex items-center justify-between transition ${
                  showTelemetry
                    ? isLight
                      ? 'bg-cyan-100 border-cyan-500 text-cyan-900 font-semibold'
                      : 'bg-cyan-950 border-cyan-400 text-cyan-200 font-semibold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  <span>📊 Panel de Telemetría</span>
                </div>
                <span className="text-[10px] opacity-70">
                  {showTelemetry ? 'Abierto' : 'Abrir'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 5: TUTORIAL GUIADO */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              5. APRENDIZAJE GUIADO
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick(750);
                  onStartTutorial('assemble');
                  onClose();
                }}
                className={`p-2.5 rounded-sm border text-left transition flex flex-col ${
                  isLight
                    ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-400 text-cyan-900'
                    : 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/60 text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ensamble</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">Paso a paso guiado</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick(750);
                  onStartTutorial('disassemble');
                  onClose();
                }}
                className={`p-2.5 rounded-sm border text-left transition flex flex-col ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-950'
                    : 'bg-amber-950/70 hover:bg-amber-900 border-amber-500/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desensamble</span>
                </div>
                <span className="text-[10px] opacity-75 mt-0.5">Extracción secuencial</span>
              </button>
            </div>
          </div>

          {/* SECTION 6: PWA, SONIDO & AYUDA */}
          <div>
            <div className="text-[10px] uppercase font-tech tracking-wider text-cyan-500 font-bold mb-2">
              6. APLICACIÓN & AUDIO
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Audio Toggle */}
              <button
                onClick={() => {
                  onToggleSound();
                }}
                className={`w-full p-2.5 rounded-sm border flex items-center justify-between transition ${
                  isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                  <span>Sonido Sintetizado</span>
                </div>
                <span className={`text-[10px] font-semibold ${soundEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {soundEnabled ? 'ACTIVADO' : 'MUTED'}
                </span>
              </button>

              {/* Install PWA Button */}
              {!isInstalled && (
                <button
                  onClick={async () => {
                    sound.playClick(800);
                    if (isInstallable) {
                      await install();
                    } else if (isIOS) {
                      alert('Para instalar en iOS:\n1. Toca el botón Compartir en Safari.\n2. Selecciona "Agregar a pantalla de inicio".');
                    } else {
                      alert('Aplicación lista para instalar. Toca el menú de tu navegador (⋮) y selecciona "Instalar aplicación" o "Agregar a pantalla principal".');
                    }
                  }}
                  className={`w-full p-2.5 rounded-sm border flex items-center justify-between transition font-semibold text-xs ${
                    isLight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-md'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>📲 Instalar Aplicación PWA</span>
                  </div>
                  <span className="text-[10px] uppercase font-tech bg-black/20 px-1.5 py-0.5 rounded">
                    Offline Ready
                  </span>
                </button>
              )}

              {/* Help Modal Button */}
              <button
                onClick={() => {
                  sound.playClick(600);
                  onOpenHelp();
                  onClose();
                }}
                className={`w-full p-2.5 rounded-sm border flex items-center justify-between transition ${
                  isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-500" />
                  <span>Manual & Atajos de Control</span>
                </div>
                <span className="text-[10px] text-cyan-500">Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
