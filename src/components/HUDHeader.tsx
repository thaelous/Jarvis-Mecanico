import React, { useState } from 'react';
import {
  Layers,
  Volume2,
  VolumeX,
  HelpCircle,
  Eye,
  Box,
  Cpu,
  Compass,
  Zap,
  GraduationCap,
  Activity,
  ChevronDown,
  Sun,
  Moon,
  Tag,
  Scan,
  Radio,
  Ghost,
  Menu,
  Download,
} from 'lucide-react';
import { MODEL_LIST } from '../cad/models';
import { RenderMode, ThemeMode } from '../types/cad';
import { ViewportTelemetry } from '../cad/CADViewport';
import { sound } from '../utils/audio';
import { MobileDrawer } from './MobileDrawer';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HUDHeaderProps {
  currentModelId: string;
  onSelectModel: (id: string) => void;
  renderMode: RenderMode;
  onSetRenderMode: (mode: RenderMode) => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showGhostSilhouette: boolean;
  onToggleGhostSilhouette: () => void;
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  showPartsTree: boolean;
  onTogglePartsTree: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  physicsEnabled: boolean;
  onTogglePhysics: () => void;
  isTutorialActive: boolean;
  onStartTutorial: (mode: 'assemble' | 'disassemble') => void;
  onOpenHelp: () => void;
  onSetCameraPreset: (preset: string) => void;
  assemblyPercentage: number;
  telemetry?: ViewportTelemetry;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  currentModelId,
  onSelectModel,
  renderMode,
  onSetRenderMode,
  themeMode,
  onToggleTheme,
  showLabels,
  onToggleLabels,
  showGhostSilhouette,
  onToggleGhostSilhouette,
  showTelemetry,
  onToggleTelemetry,
  showPartsTree,
  onTogglePartsTree,
  soundEnabled,
  onToggleSound,
  physicsEnabled,
  onTogglePhysics,
  isTutorialActive,
  onStartTutorial,
  onOpenHelp,
  onSetCameraPreset,
  assemblyPercentage,
  telemetry,
}) => {
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const [showShadingMenu, setShowShadingMenu] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();

  const currentModel = MODEL_LIST.find((m) => m.id === currentModelId) || MODEL_LIST[0];
  const isLight = themeMode === 'light';

  return (
    <>
      <header
        className={`relative z-30 w-full px-3 md:px-4 py-2 border-b transition-colors duration-200 flex items-center justify-between gap-2 shadow-md select-none ${
          isLight
            ? 'bg-slate-100/95 border-slate-300 text-slate-800'
            : 'bg-slate-950/92 border-cyan-900/40 text-slate-100'
        }`}
        style={{
          paddingTop: 'max(0.5rem, env(safe-area-inset-top, 8px))',
        }}
      >
        {/* Left Side: Brand & Active Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-sm border shrink-0 ${
              isLight
                ? 'bg-white border-slate-300 text-cyan-600 shadow-sm'
                : 'bg-cyan-950/80 border-cyan-400/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
          </div>

          {/* Model Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick(650);
                setShowModelsDropdown(!showModelsDropdown);
                setShowTutorialMenu(false);
                setShowShadingMenu(false);
                setShowCameraMenu(false);
              }}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-sm border text-xs font-mono flex items-center gap-1.5 sm:gap-2 transition active:scale-95 ${
                isLight
                  ? 'bg-white border-slate-300 hover:border-cyan-600 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-500/70 hover:bg-slate-850'
              }`}
            >
              <div className="text-left">
                <span className="text-[9px] sm:text-[10px] text-cyan-500 block uppercase font-tech leading-none mb-0.5">
                  MODELO ACTIVO
                </span>
                <span className="font-semibold text-[11px] sm:text-xs block truncate max-w-[110px] sm:max-w-none">
                  {currentModel.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            </button>

            {showModelsDropdown && (
              <div
                className={`absolute left-0 mt-1.5 w-64 rounded-sm border shadow-2xl p-1 z-40 font-mono text-xs animate-fadeIn ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-cyan-500/60 text-slate-100'
                }`}
              >
                <div className="px-2 py-1 text-[10px] text-cyan-500 uppercase font-tech border-b border-inherit opacity-80">
                  BIBLIOTECA MECÁNICA (5 MODELOS)
                </div>
                {MODEL_LIST.map((model) => {
                  const isActive = model.id === currentModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        sound.playClick(750);
                        onSelectModel(model.id);
                        setShowModelsDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 my-0.5 rounded transition flex flex-col ${
                        isActive
                          ? isLight
                            ? 'bg-cyan-50 text-cyan-700 font-semibold border-l-2 border-cyan-500'
                            : 'bg-cyan-950/80 text-cyan-200 font-semibold border-l-2 border-cyan-400'
                          : isLight
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{model.label}</span>
                      <span className="text-[10px] opacity-70">{model.sub}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assembly Status Badge (Always Visible, Compact on Mobile) */}
          <div
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded border text-[10px] sm:text-xs font-mono shrink-0 ${
              isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span className="text-slate-400 hidden xs:inline">Ensamble:</span>
            <span
              className={`font-bold ${
                assemblyPercentage === 100 ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {Math.round(assemblyPercentage)}%
            </span>
          </div>
        </div>

        {/* MOBILE VIEW ONLY: Hamburger / Tools Button (Strict Requirement 2) */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick(700);
              setMobileDrawerOpen(true);
            }}
            className={`px-2.5 py-1.5 rounded-sm border text-xs font-mono flex items-center gap-1.5 transition active:scale-95 font-semibold ${
              isLight
                ? 'bg-cyan-100 hover:bg-cyan-200 border-cyan-400 text-cyan-900 shadow-sm'
                : 'bg-cyan-950 hover:bg-cyan-900 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
            }`}
            title="Abrir Menú de Herramientas y Opciones"
          >
            <Menu className="w-4 h-4 text-cyan-500" />
            <span className="font-tech text-xs">⚙️ Herramientas</span>
          </button>
        </div>

        {/* DESKTOP VIEW ONLY (hidden on md and down): Full Desktop Header Toolbar */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* 📁 Árbol Button */}
          <button
            id="btn-tree-toggle"
            onClick={() => {
              sound.playClick(showPartsTree ? 500 : 700);
              onTogglePartsTree();
              const panel = document.getElementById('parts-tree-sidebar');
              if (panel) {
                panel.classList.toggle('visible');
              }
            }}
            className={`p-1.5 px-2.5 rounded-sm border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
              showPartsTree ? 'active' : ''
            } ${
              showPartsTree
                ? isLight
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-800 font-semibold shadow-sm'
                  : 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-semibold'
                : isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-cyan-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500'
            }`}
            title={showPartsTree ? 'Ocultar Árbol de Componentes' : 'Desplegar Árbol de Componentes (📁)'}
          >
            <span className="text-xs">📁</span>
            <span className="font-medium text-[11px]">Árbol</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showPartsTree ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-500'
              }`}
            />
          </button>

          {/* Render Shading Mode Dropdown (PBR, HOLO, CAD, X-RAY) */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick(600);
                setShowShadingMenu(!showShadingMenu);
                setShowModelsDropdown(false);
                setShowTutorialMenu(false);
                setShowCameraMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-sm border text-xs font-mono flex items-center gap-1.5 transition ${
                isLight
                  ? 'bg-white border-slate-300 hover:border-cyan-600'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-500'
              }`}
              title="Seleccionar Modo de Sombreado 3D"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-500" />
              <span className="uppercase font-semibold">{renderMode}</span>
              <ChevronDown className="w-3 h-3 text-cyan-500" />
            </button>

            {showShadingMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-52 rounded-sm border shadow-2xl p-1 z-40 font-mono text-xs animate-fadeIn ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-cyan-500/60'
                }`}
              >
                <div className="px-2 py-1 text-[10px] text-cyan-500 uppercase font-tech border-b border-slate-800/20">
                  MODOS DE VISUALIZACIÓN
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSetRenderMode('pbr');
                    setShowShadingMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    renderMode === 'pbr' ? 'bg-cyan-900/40 text-cyan-300 font-semibold' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PBR Metálico Sólido</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSetRenderMode('xray');
                    setShowShadingMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    renderMode === 'xray' ? 'bg-cyan-900/40 text-cyan-300 font-semibold' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <span>Modo Rayos X (Interno)</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSetRenderMode('hologram');
                    setShowShadingMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    renderMode === 'hologram' ? 'bg-cyan-900/40 text-cyan-300 font-semibold' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Holograma Translúcido</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onSetRenderMode('wireframe');
                    setShowShadingMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    renderMode === 'wireframe' ? 'bg-cyan-900/40 text-cyan-300 font-semibold' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modo Alambre CAD</span>
                </button>
              </div>
            )}
          </div>

          {/* 3D Camera Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick(600);
                setShowCameraMenu(!showCameraMenu);
                setShowModelsDropdown(false);
                setShowShadingMenu(false);
                setShowTutorialMenu(false);
              }}
              className={`px-2.5 py-1.5 rounded-sm border text-xs font-mono flex items-center gap-1 transition ${
                isLight
                  ? 'bg-white border-slate-300 hover:border-cyan-600'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-500'
              }`}
              title="Ángulos y Vistas de Cámara"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-500" />
              <span>Vistas</span>
              <ChevronDown className="w-3 h-3 text-cyan-500" />
            </button>

            {showCameraMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-44 rounded-sm border shadow-2xl p-1 z-40 font-mono text-xs animate-fadeIn ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-cyan-500/60'
                }`}
              >
                <button
                  onClick={() => { sound.playClick(600); onSetCameraPreset('iso'); setShowCameraMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800/40 transition"
                >
                  Isométrica (3D)
                </button>
                <button
                  onClick={() => { sound.playClick(600); onSetCameraPreset('front'); setShowCameraMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800/40 transition"
                >
                  Frontal (X/Y)
                </button>
                <button
                  onClick={() => { sound.playClick(600); onSetCameraPreset('side'); setShowCameraMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800/40 transition"
                >
                  Lateral (Z/Y)
                </button>
                <button
                  onClick={() => { sound.playClick(600); onSetCameraPreset('top'); setShowCameraMenu(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800/40 transition"
                >
                  Superior / Cenital (X/Z)
                </button>
              </div>
            )}
          </div>

          {/* 3D Info Tags Toggle Button */}
          <button
            onClick={() => {
              sound.playClick(showLabels ? 500 : 750);
              onToggleLabels();
            }}
            className={`p-1.5 px-2 rounded-sm border text-xs font-mono transition flex items-center gap-1 ${
              showLabels
                ? isLight
                  ? 'bg-cyan-100 border-cyan-400 text-cyan-700'
                  : 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : isLight
                ? 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={showLabels ? 'Ocultar Etiquetas 3D' : 'Mostrar Etiquetas de Información 3D sobre las Piezas'}
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[11px]">Etiquetas</span>
          </button>

          {/* Telemetry & Details Panel Toggle Button */}
          <button
            onClick={() => {
              sound.playClick(showTelemetry ? 500 : 750);
              onToggleTelemetry();
            }}
            className={`p-1.5 px-2 rounded-sm border text-xs font-mono transition flex items-center gap-1.5 ${
              showTelemetry
                ? isLight
                  ? 'bg-cyan-100 border-cyan-500 text-cyan-800 font-semibold shadow-sm'
                  : 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-semibold'
                : isLight
                ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:border-cyan-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500'
            }`}
            title={showTelemetry ? 'Ocultar Panel de Telemetría' : 'Abrir Panel de Telemetría y Detalles Técnicos'}
          >
            <Activity className={`w-3.5 h-3.5 ${showTelemetry ? 'text-cyan-400 animate-pulse' : 'text-cyan-500'}`} />
            <span className="text-[11px] font-medium">Telemetría</span>
          </button>

          {/* 👻 Silueta Ensamble Toggle Button */}
          <button
            onClick={() => {
              sound.playClick(showGhostSilhouette ? 500 : 750);
              onToggleGhostSilhouette();
            }}
            className={`p-1.5 px-2 rounded-sm border text-xs font-mono transition flex items-center gap-1.5 ${
              showGhostSilhouette
                ? isLight
                  ? 'bg-indigo-100 border-indigo-400 text-indigo-800 font-semibold shadow-sm'
                  : 'bg-indigo-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-semibold'
                : isLight
                ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:border-cyan-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500'
            }`}
            title={showGhostSilhouette ? 'Ocultar Silueta Holográfica de Ensamble' : 'Mostrar Silueta Holográfica del Modelo Acoplado'}
          >
            <Ghost className={`w-3.5 h-3.5 ${showGhostSilhouette ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[11px] font-medium">👻 Silueta</span>
          </button>

          {/* Cannon.js Physics Gravity Toggle */}
          <button
            onClick={() => {
              sound.playClick(physicsEnabled ? 500 : 900);
              onTogglePhysics();
            }}
            className={`p-1.5 px-2 rounded-sm border text-xs font-mono transition flex items-center gap-1 ${
              physicsEnabled
                ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                : isLight
                ? 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={physicsEnabled ? 'Desactivar Gravedad' : 'Activar Motor de Física (Gravedad y Colisiones)'}
          >
            <Zap className={`w-3.5 h-3.5 ${physicsEnabled ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="text-[11px]">Física</span>
          </button>

          {/* Guided Tutorial Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick(700);
                setShowTutorialMenu(!showTutorialMenu);
                setShowModelsDropdown(false);
                setShowShadingMenu(false);
                setShowCameraMenu(false);
              }}
              className={`p-1.5 px-2 rounded-sm border text-xs font-mono transition flex items-center gap-1 ${
                isTutorialActive
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-700 hover:border-cyan-600'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500'
              }`}
              title="Modo Tutorial Paso a Paso"
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-[11px]">Tutorial</span>
            </button>

            {showTutorialMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-52 rounded-sm border shadow-2xl p-1 z-40 font-mono text-xs animate-fadeIn ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-cyan-500/60'
                }`}
              >
                <button
                  onClick={() => {
                    setShowTutorialMenu(false);
                    onStartTutorial('assemble');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-cyan-900/30 transition flex flex-col"
                >
                  <span className="font-semibold text-cyan-400">Ensamble Guiado</span>
                  <span className="text-[10px] opacity-70">Paso a paso para armar</span>
                </button>
                <div className="h-px bg-slate-800/40 my-1"></div>
                <button
                  onClick={() => {
                    setShowTutorialMenu(false);
                    onStartTutorial('disassemble');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-900/30 transition flex flex-col"
                >
                  <span className="font-semibold text-amber-400">Desensamble Guiado</span>
                  <span className="text-[10px] opacity-70">Secuencia de extracción</span>
                </button>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Theme Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={() => {
              sound.playClick(650);
              onToggleTheme();
            }}
            className={`p-1.5 px-2.5 rounded-sm border transition flex items-center gap-1.5 text-xs font-mono font-medium ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
            }`}
            title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600/30" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? '🌙 Oscuro' : '☀️ Claro'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-sm border transition ${
              soundEnabled
                ? isLight
                  ? 'bg-white border-slate-300 text-cyan-600'
                  : 'bg-slate-900 border-slate-800 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Silenciar Efectos de Audio' : 'Activar Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Desktop PWA Install Button if available */}
          {!isInstalled && isInstallable && (
            <button
              onClick={() => install()}
              className="p-1.5 px-2 rounded-sm border text-xs font-mono font-medium flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-sm transition active:scale-95"
              title="Instalar CAD Workshop 3D como Progressive Web App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          {/* Help Modal */}
          <button
            onClick={() => {
              sound.playClick(600);
              onOpenHelp();
            }}
            className={`p-1.5 rounded-sm border transition ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:border-cyan-600'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500'
            }`}
            title="Manual & Atajos de Teclado"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Responsive Off-Canvas Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        showGhostSilhouette={showGhostSilhouette}
        onToggleGhostSilhouette={onToggleGhostSilhouette}
        showTelemetry={showTelemetry}
        onToggleTelemetry={onToggleTelemetry}
        showPartsTree={showPartsTree}
        onTogglePartsTree={onTogglePartsTree}
        renderMode={renderMode}
        onSetRenderMode={onSetRenderMode}
        onSetCameraPreset={onSetCameraPreset}
        showLabels={showLabels}
        onToggleLabels={onToggleLabels}
        physicsEnabled={physicsEnabled}
        onTogglePhysics={onTogglePhysics}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onStartTutorial={onStartTutorial}
        onOpenHelp={onOpenHelp}
      />
    </>
  );
};
