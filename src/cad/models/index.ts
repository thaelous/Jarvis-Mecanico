import { axleModel } from './axleModel';
import { brakeModel } from './brakeModel';
import { pistonModel } from './pistonModel';
import { shockModel } from './shockModel';
import { gearboxModel } from './gearboxModel';
import { MechanicalModelDefinition } from '../../types/cad';

export const MECHANICAL_MODELS: Record<string, MechanicalModelDefinition> = {
  axle: axleModel,
  brake: brakeModel,
  piston: pistonModel,
  shock: shockModel,
  gearbox: gearboxModel,
};

export const MODEL_LIST = [
  { id: 'brake', label: 'Frenos de Disco', sub: 'Rotor Ventilado & Pinza Monobloque' },
  { id: 'axle', label: 'Eje Automotriz', sub: 'Diferencial / Palier & Engranajes' },
  { id: 'gearbox', label: 'Caja de Transmisión', sub: 'Transmisión Manual de 4 Velocidades' },
  { id: 'shock', label: 'Amortiguador Coilover', sub: 'Suspensión Regulable & Muelle' },
  { id: 'piston', label: 'Pistón y Biela', sub: 'Motor de Combustión Interna' },
];
