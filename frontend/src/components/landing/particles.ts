function mulberry32(seed: number) {
  let value = seed;

  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260903);
const between = (min: number, max: number) => min + random() * (max - min);
const pick = <T,>(values: T[]): T => values[Math.floor(random() * values.length)];

export interface AmbientBubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  delay: number;
  floatClass: 'harvest-float' | 'harvest-drift';
}

export interface HerbParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'leaf' | 'seed' | 'flake';
  delay: number;
}

const HARVEST_PALETTE = [
  'rgba(220, 231, 126, 0.45)',
  'rgba(46, 125, 79, 0.28)',
  'rgba(239, 120, 68, 0.24)',
  'rgba(217, 100, 58, 0.20)',
  'rgba(152, 179, 148, 0.35)',
];
const FLOAT_CLASSES: AmbientBubble['floatClass'][] = ['harvest-float', 'harvest-drift'];
const PARTICLE_TYPES: HerbParticle['type'][] = ['leaf', 'seed', 'flake'];

function makeAmbientBubbles(count: number): AmbientBubble[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `bubble-${index}`,
    x: Math.round(between(4, 94)),
    y: Math.round(between(6, 92)),
    size: Math.round(between(120, 320)),
    color: pick(HARVEST_PALETTE),
    opacity: Number(between(0.35, 0.75).toFixed(2)),
    delay: Number(between(-8, 0).toFixed(1)),
    floatClass: pick(FLOAT_CLASSES),
  }));
}

function makeHerbParticles(count: number): HerbParticle[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `herb-${index}`,
    x: Math.round(between(5, 95)),
    y: Math.round(between(10, 90)),
    size: Math.round(between(8, 22)),
    rotation: Math.round(between(-180, 180)),
    type: pick(PARTICLE_TYPES),
    delay: Number(between(-6, 0).toFixed(1)),
  }));
}

export const BUBBLES = makeAmbientBubbles(8);
export const BUBBLES_MOBILE = makeAmbientBubbles(4);
export const HERB_PARTICLES = makeHerbParticles(12);
export const HERB_PARTICLES_MOBILE = makeHerbParticles(5);
