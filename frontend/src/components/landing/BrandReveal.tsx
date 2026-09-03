import { ArrowRight, CalendarDays, MapPin, Salad } from 'lucide-react';

interface BrandRevealProps {
  onExploreClick?: () => void;
  onSubscriptionClick?: () => void;
}

export const BrandReveal = ({ onExploreClick, onSubscriptionClick }: BrandRevealProps) => (
  <div className="pointer-events-auto flex w-full max-w-2xl select-none flex-col items-center px-2 text-center lg:items-start lg:px-0 lg:text-left">
    <h2 className="landing-display text-3xl font-normal leading-[1.04] tracking-[-0.04em] text-[#ede383] sm:text-5xl lg:text-6xl">
      Your Healthiffy order, <span className="italic text-[#8da432]">assembled fresh.</span>
    </h2>
    <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#ede383]/70 sm:text-base">
      Pick your branch, explore the cafe menu, and order the meal that fits your day.
    </p>

    <div className="mt-4 hidden flex-wrap items-center justify-center gap-2 text-sm font-semibold text-[#ede383] sm:flex lg:justify-start">
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#ede383]/15 bg-[#ede383]/5 px-3 py-1.5 shadow-sm">
        <Salad className="h-3.5 w-3.5 text-[#8da432]" /> Cafe menu
      </span>
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#ede383]/15 bg-[#ede383]/5 px-3 py-1.5 shadow-sm">
        <MapPin className="h-3.5 w-3.5 text-[#925e06]" /> Branch ordering
      </span>
      <span className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-[#ede383]/15 bg-[#ede383]/5 px-3 py-1.5 shadow-sm">
        <CalendarDays className="h-3.5 w-3.5 text-[#8da432]" /> Monthly plans
      </span>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      <button
        type="button"
        onClick={onExploreClick}
        className="group inline-flex items-center gap-2.5 rounded-full bg-[#ede383] px-6 py-3 text-xs font-bold text-[#351903] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#8da432] active:translate-y-0 sm:text-sm"
      >
        Explore the menu
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
      <button
        type="button"
        onClick={onSubscriptionClick}
        className="inline-flex items-center gap-2 rounded-full border border-[#ede383]/20 bg-[#ede383]/5 px-5 py-3 text-xs font-bold text-[#ede383] transition-all hover:-translate-y-0.5 hover:bg-[#ede383]/10 active:translate-y-0 sm:text-sm"
      >
        View monthly plans
      </button>
    </div>
  </div>
);
