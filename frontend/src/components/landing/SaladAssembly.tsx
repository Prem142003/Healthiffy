import { CalendarDays, MapPin, Salad } from 'lucide-react';
import finalSaladBowlImg from '../../assets/images/delightful_final_salad_1788424754145.jpg';
import emptyBowlImg from '../../assets/images/empty_salad_bowl_1788424127920.jpg';
import greensImg from '../../assets/images/salad_greens_bed_1788424240208.jpg';
import avocadoImg from '../../assets/images/avocado_slices_1788424146185.jpg';
import tomatoImg from '../../assets/images/tomato_slices_1788424182429.jpg';
import goldenCornImg from '../../assets/images/golden_corn_chickpeas_1788424774494.jpg';
import purpleCabbageImg from '../../assets/images/purple_cabbage_onions_1788424793240.jpg';
import sweetPeppersImg from '../../assets/images/sweet_peppers_carrots_1788424823527.jpg';
import cucumberRadishImg from '../../assets/images/cucumber_radish_1788424260138.jpg';
import fetaPomegranateImg from '../../assets/images/feta_pomegranate_gems_1788424806569.jpg';

export interface SaladSprite {
  id: string;
  image: string;
  cx: number;
  cy: number;
  w: number;
  dx: number;
  dy: number;
  rot: number;
  s: number;
  zIndex: number;
}

export const SALAD_SPRITES: SaladSprite[] = [
  { id: 'greens-bed', image: greensImg, cx: 0.5, cy: 0.5, w: 0.72, dx: 0, dy: -210, rot: -8, s: 0.55, zIndex: 10 },
  { id: 'avocado-fan', image: avocadoImg, cx: 0.34, cy: 0.36, w: 0.42, dx: -260, dy: -140, rot: 28, s: 0.5, zIndex: 12 },
  { id: 'heirloom-tomatoes', image: tomatoImg, cx: 0.66, cy: 0.36, w: 0.42, dx: 260, dy: -140, rot: -28, s: 0.5, zIndex: 14 },
  { id: 'golden-corn', image: goldenCornImg, cx: 0.69, cy: 0.56, w: 0.39, dx: 270, dy: 70, rot: 22, s: 0.5, zIndex: 16 },
  { id: 'purple-cabbage', image: purpleCabbageImg, cx: 0.31, cy: 0.56, w: 0.39, dx: -270, dy: 70, rot: -24, s: 0.5, zIndex: 18 },
  { id: 'sweet-peppers', image: sweetPeppersImg, cx: 0.41, cy: 0.67, w: 0.38, dx: -130, dy: 230, rot: 16, s: 0.5, zIndex: 20 },
  { id: 'cucumber-radish', image: cucumberRadishImg, cx: 0.59, cy: 0.67, w: 0.38, dx: 130, dy: 230, rot: -18, s: 0.5, zIndex: 22 },
  { id: 'feta-pomegranate', image: fetaPomegranateImg, cx: 0.5, cy: 0.46, w: 0.4, dx: 0, dy: -250, rot: 12, s: 0.5, zIndex: 24 },
];

const hudItems = [
  { Icon: Salad, label: 'Made fresh', color: '#365004' },
  { Icon: MapPin, label: 'Choose your branch', color: '#925e06' },
  { Icon: CalendarDays, label: 'Monthly meal plans', color: '#365004' },
];

export const SaladAssembly = () => (
  <div className="relative flex w-full select-none flex-col items-center justify-center">
    <div className="salad-hud pointer-events-none mb-2 flex flex-wrap items-center justify-center gap-2 opacity-0 sm:mb-3">
      {hudItems.map(({ Icon, label, color }) => (
        <span key={label} className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#ede383]/15 bg-[#304704]/90 px-3 py-1.5 text-xs font-semibold text-[#ede383] shadow-lg backdrop-blur-md">
          <Icon size={13} style={{ color }} />
          {label}
        </span>
      ))}
    </div>

    <div className="hero-bowl-stage relative aspect-square w-[min(78vw,40vh,420px)] sm:w-[min(72vw,46vh,500px)] lg:w-[min(45vw,56vh,540px)] [perspective:1000px]">
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-black/35 blur-2xl sm:-inset-6" />

      <div className="salad-bowl-base pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="hero-bowl-surface relative h-full w-full overflow-hidden rounded-full bg-[#f4eca4] ring-4 ring-[#ede383]/25 sm:ring-[6px]">
          <img src={emptyBowlImg} alt="Empty ceramic bowl viewed from above" className="h-full w-full select-none object-cover" fetchPriority="high" decoding="async" />
        </div>
      </div>

      {SALAD_SPRITES.map((sprite) => (
        <div
          key={sprite.id}
          className="pointer-events-none absolute"
          style={{
            left: `${sprite.cx * 100}%`,
            top: `${sprite.cy * 100}%`,
            width: `${sprite.w * 100}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: sprite.zIndex,
          }}
        >
          <div data-salad-piece={sprite.id} className="relative flex aspect-square w-full items-center justify-center opacity-0">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f4eca4] shadow-xl ring-[3px] ring-[#ede383]/70 sm:ring-4">
              <img src={sprite.image} alt="" className="pointer-events-none h-full w-full scale-105 select-none object-cover" decoding="async" />
            </div>
          </div>
        </div>
      ))}

      <div className="salad-bowl-final pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0">
        <div className="hero-bowl-surface relative h-full w-full overflow-hidden rounded-full bg-[#f4eca4] ring-4 ring-[#ede383]/25 sm:ring-[6px]">
          <img src={finalSaladBowlImg} alt="Healthiffy harvest salad viewed from above" className="h-full w-full select-none object-cover" decoding="async" />
        </div>
      </div>
    </div>
  </div>
);
