import { useLayoutEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrandReveal } from './BrandReveal';
import { SaladAssembly, SALAD_SPRITES } from './SaladAssembly';
import { SceneBackground } from './SceneBackground';
import { BUBBLES, BUBBLES_MOBILE, HERB_PARTICLES, HERB_PARTICLES_MOBILE } from './particles';
import { useIsMobile, usePrefersReducedMotion } from './useLandingMedia';

gsap.registerPlugin(ScrollTrigger);

interface HarvestScrollyHeroProps {
  onExploreClick?: () => void;
  onSubscriptionClick?: () => void;
}

export const HarvestScrollyHero = ({ onExploreClick, onSubscriptionClick }: HarvestScrollyHeroProps) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLDivElement | null>(null);
  const scrollPromptRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const context = gsap.context(() => {
      const bowlBase = container.querySelector('.salad-bowl-base');
      const bowlFinal = container.querySelector('.salad-bowl-final');
      const hud = container.querySelector('.salad-hud');
      const intro = introRef.current;
      const brand = brandRef.current;
      const scrollPrompt = scrollPromptRef.current;

      if (prefersReducedMotion) {
        gsap.set(bowlBase, { opacity: 0 });
        gsap.set(bowlFinal, { opacity: 1, scale: 1 });
        gsap.set(hud, { opacity: 1, y: 0 });
        gsap.set(intro, { opacity: 0 });
        gsap.set(brand, { opacity: 1, y: 0 });
        gsap.set(scrollPrompt, { opacity: 0 });
        SALAD_SPRITES.forEach(({ id }) => {
          gsap.set(container.querySelector(`[data-salad-piece="${id}"]`), { opacity: 0 });
        });
        return;
      }

      gsap.set(bowlBase, { opacity: 1, scale: 1, y: 0 });
      gsap.set(bowlFinal, { opacity: 0, scale: 0.98 });
      gsap.set(hud, { opacity: 0, y: -12 });
      gsap.set(intro, { opacity: 1, y: 0 });
      gsap.set(brand, { opacity: 0, y: 25 });
      gsap.set(scrollPrompt, { opacity: 1, y: 0 });

      SALAD_SPRITES.forEach((sprite) => {
        gsap.set(container.querySelector(`[data-salad-piece="${sprite.id}"]`), {
          xPercent: sprite.dx,
          yPercent: sprite.dy,
          rotation: sprite.rot,
          scale: sprite.s,
          opacity: 0,
        });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=240%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
        },
      });

      timeline.to(intro, { opacity: 0, y: -25, duration: 0.14, ease: 'power2.in' }, 0);
      timeline.to(scrollPrompt, { opacity: 0, y: 10, duration: 0.1, ease: 'power2.in' }, 0);

      SALAD_SPRITES.forEach((sprite, index) => {
        timeline.to(
          container.querySelector(`[data-salad-piece="${sprite.id}"]`),
          { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.18, ease: 'power3.out' },
          0.1 + (index / SALAD_SPRITES.length) * 0.46,
        );
      });

      timeline.to(bowlBase, { scale: 1.02, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.45);
      timeline.to(hud, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.66);
      timeline.to(bowlFinal, { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' }, 0.7);

      SALAD_SPRITES.forEach(({ id }) => {
        timeline.to(container.querySelector(`[data-salad-piece="${id}"]`), { opacity: 0, duration: 0.06 }, 0.78);
      });

      timeline.to(stageRef.current, { y: isMobile ? -10 : -22, duration: 0.16, ease: 'power2.out' }, 0.76);
      timeline.to(brand, { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' }, 0.8);
    }, container);

    return () => context.revert();
  }, [isMobile, prefersReducedMotion]);

  const bubbles = isMobile ? BUBBLES_MOBILE : BUBBLES;
  const herbs = isMobile ? HERB_PARTICLES_MOBILE : HERB_PARTICLES;

  return (
    <section
      id="top"
      ref={containerRef}
      className="landing-hero relative isolate flex h-screen w-full flex-col items-center justify-center overflow-hidden"
      aria-label="Healthiffy fresh bowl assembly"
    >
      <SceneBackground bubbles={bubbles} herbs={herbs} />

      <div className="landing-hero__grid relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[300px_1fr] items-center gap-1 px-5 pb-5 pt-28 sm:grid-rows-[320px_1fr] sm:px-8 sm:pt-32 lg:grid-cols-[0.84fr_1.16fr] lg:grid-rows-1 lg:gap-10 lg:px-12 xl:px-[4.5rem]">
        <div className="relative z-30 h-full w-full">
          <div ref={introRef} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
            <div className="mb-4 inline-flex whitespace-nowrap items-center gap-2 rounded-full border border-[#ede383]/15 bg-[#ede383]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#ede383] shadow-sm backdrop-blur-sm">
              <Sparkles size={14} className="text-[#925e06]" />
              <span>Healthiffy cafe</span>
            </div>
            <h1 className="landing-display max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.04em] text-[#ede383] sm:text-6xl lg:text-7xl">
              Fresh, assembled. <span className="italic text-[#8da432]">However you want it.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#ede383]/70 sm:text-lg">
              Choose a branch, browse its live menu, and see its monthly plans before signing in.
            </p>
          </div>

          <div ref={brandRef} className="absolute inset-0 z-30 flex items-center justify-center opacity-0 lg:justify-start">
            <BrandReveal onExploreClick={onExploreClick} onSubscriptionClick={onSubscriptionClick} />
          </div>
        </div>

        <div ref={stageRef} className="relative z-20 flex h-full w-full flex-col items-center justify-center">
          <div className="landing-hero__showcase"><SaladAssembly /></div>
        </div>
      </div>

      <div ref={scrollPromptRef} className="pointer-events-none absolute bottom-2 z-30 flex flex-col items-center gap-1.5 text-xs font-bold text-[#ede383]/70 lg:bottom-7">
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#ede383]/15 bg-[#304704]/90 px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <Sparkles size={13} className="text-[#925e06]" />
          <span>Scroll to build your bowl</span>
        </div>
        <ChevronDown size={18} className="harvest-bob text-[#8da432]" />
      </div>
    </section>
  );
};
