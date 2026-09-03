import type { AmbientBubble, HerbParticle } from './particles';

interface SceneBackgroundProps {
  bubbles: AmbientBubble[];
  herbs?: HerbParticle[];
}

export const SceneBackground = ({ bubbles, herbs = [] }: SceneBackgroundProps) => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
    <div className="absolute inset-0 bg-[var(--healthiffy-forest)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(96,132,105,0.25),transparent_44%),radial-gradient(circle_at_82%_32%,rgba(141,164,50,0.12),transparent_42%),radial-gradient(circle_at_52%_88%,rgba(22,58,41,0.42),transparent_52%)]" />
    <div
      className="absolute inset-0 opacity-[0.032]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />

    {bubbles.map((bubble) => (
      <span
        key={bubble.id}
        className={`absolute rounded-full blur-3xl ${bubble.floatClass}`}
        style={{
          left: `${bubble.x}%`,
          top: `${bubble.y}%`,
          width: `${bubble.size}px`,
          height: `${bubble.size}px`,
          backgroundColor: bubble.color,
          opacity: bubble.opacity,
          animationDelay: `${bubble.delay}s`,
        }}
      />
    ))}

    {herbs.map((herb) => (
      <span
        key={herb.id}
        className="harvest-drift absolute opacity-60"
        style={{
          left: `${herb.x}%`,
          top: `${herb.y}%`,
          width: `${herb.size}px`,
          height: `${herb.size}px`,
          rotate: `${herb.rotation}deg`,
          animationDelay: `${herb.delay}s`,
        }}
      >
        {herb.type === 'leaf' && (
          <svg viewBox="0 0 24 24" fill="#8da432" className="h-full w-full opacity-30">
            <path d="M12 2C6 6 2 12 6 18C10 24 22 22 22 22C22 22 18 10 12 2Z" />
          </svg>
        )}
        {herb.type === 'seed' && <span className="block h-3 w-2 rotate-45 rounded-full bg-[#925e06] opacity-40" />}
        {herb.type === 'flake' && <span className="block h-1.5 w-1.5 rounded-sm bg-[#ede383] opacity-30" />}
      </span>
    ))}
  </div>
);
