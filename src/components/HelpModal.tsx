import React from 'react';
import {
  X,
  MousePointer,
  Move,
  Magnet,
  Maximize,
  Layers,
  CheckCircle2,
  Zap,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-cyan-500/60 rounded-sm shadow-[0_0_35px_rgba(6,182,212,0.3)] p-6 text-slate-200 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4 sticky top-0 bg-slate-950 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <h2 className="text-base font-tech font-bold text-white tracking-wider">
              GUÍA DE OPERACIÓN // CAD 3D V3.0
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playClick(600);
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions Grid */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">1. Motor de Física & Gravedad Realista (Cannon.js)</strong>
              <p className="text-slate-400">
                Activa el botón <strong>Física ON</strong> en la barra superior. Las piezas desacopladas experimentan gravedad real (-9.82 m/s²), caen rebotando sobre la mesa de trabajo y colisionan entre sí sin atravesarse. Puedes levantarlas con el Gizmo y acoplarlas nuevamente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <GraduationCap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300 block mb-0.5">2. Modo Tutorial Guiado (Paso a Paso)</strong>
              <p className="text-slate-400">
                Selecciona <strong>Tutorial Guiado</strong> (Ensamble o Desensamble). El sistema resalta en ámbar la pieza objetivo en 3D, proporciona instrucciones técnicas y consejos de taller, y avanza automáticamente conforme acoplas o desacoplas cada elemento.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block mb-0.5">3. Optimización con Instancing & LOD Dinámico</strong>
              <p className="text-slate-400">
                Las partes repetitivas (birlos, esferas de rodamientos, pernos ARP, dientes y perforaciones) usan <strong>THREE.InstancedMesh</strong> para minimizar llamadas de dibujado. El sistema <strong>LOD</strong> ajusta la complejidad geométrica según la distancia de la cámara.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <Move className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300 block mb-0.5">4. Desensamble Manual (Gizmo Transform)</strong>
              <p className="text-slate-400">
                Usa los modos <strong>Mover</strong> o <strong>Rotar</strong> para desplazar componentes en los ejes 3D y extraerlos libremente del conjunto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <Magnet className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-teal-300 block mb-0.5">5. Auto-Acople Magnético ("Snap-to-Fit")</strong>
              <p className="text-slate-400">
                Al aproximar una pieza desarmada a su posición nominal, se activa la silueta holográfica azul y la línea guía. Al entrar en el radio de tolerancia, se acopla magnéticamente con destello y sonido metálico de bloqueo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 bg-slate-900/70 border border-slate-800 rounded">
            <Maximize className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300 block mb-0.5">6. Vista Explotada Cinemática</strong>
              <p className="text-slate-400">
                Usa el control deslizante de <strong>Explosión (0% a 100%)</strong> o los botones <strong>"Desarmar Todo"</strong> y <strong>"Reensamblar Todo"</strong> para expandir o contraer suavemente el modelo.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick(700);
              onClose();
            }}
            className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 text-xs font-mono rounded-xs transition shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Entendido / Continuar Simulación</span>
          </button>
        </div>
      </div>
    </div>
  );
};
