import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuItemApi } from '../../services/menuItemApi';
import './PublicLanding.css';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (progress, start, end) => clamp((progress - start) / (end - start));
const mix = (from, to, amount) => from + (to - from) * amount;

const ingredients = [
  { type: 'tomato', scatter: [-39, -29, -15], bowl: [-14, -5, 12], glass: [-6, 5, -8], size: 66, delay: 0 },
  { type: 'leaf', scatter: [37, -33, 28], bowl: [7, -9, -20], glass: [4, -13, 24], size: 72, delay: 0.018 },
  { type: 'cucumber', scatter: [43, 1, 55], bowl: [17, 2, 16], glass: [-5, -2, 75], size: 58, delay: 0.032 },
  { type: 'carrot', scatter: [-42, 14, -62], bowl: [-4, 7, -8], glass: [4, 6, -35], size: 61, delay: 0.048 },
  { type: 'avocado', scatter: [31, 30, 18], bowl: [12, 8, 17], glass: [0, -3, 10], size: 76, delay: 0.06 },
  { type: 'radish', scatter: [-30, 34, 40], bowl: [-19, 6, 30], glass: [5, 12, 95], size: 55, delay: 0.078 },
  { type: 'pepper', scatter: [9, -37, -28], bowl: [1, -1, 38], glass: [-3, 10, 54], size: 66, delay: 0.094 },
  { type: 'tomato', scatter: [-7, 34, 20], bowl: [20, -6, -18], glass: [3, 1, -74], size: 49, delay: 0.112 },
  { type: 'leaf', scatter: [-47, -2, 92], bowl: [-10, -11, 61], glass: [-5, 10, 32], size: 60, delay: 0.13 },
  { type: 'cucumber', scatter: [46, 29, -35], bowl: [1, 11, -27], glass: [6, -9, 6], size: 50, delay: 0.145 },
  { type: 'carrot', scatter: [26, -16, 68], bowl: [10, 3, 24], glass: [0, 11, 120], size: 50, delay: 0.162 },
  { type: 'berry', scatter: [-18, -34, 8], bowl: [-2, -8, 0], glass: [-1, -15, 0], size: 42, delay: 0.18 },
  { type: 'banana', scatter: [48, -19, -22], bowl: [16, -11, 15], glass: [5, -16, -12], size: 62, delay: 0.198 },
  { type: 'leaf', scatter: [-48, 27, -55], bowl: [-17, -3, -38], glass: [-5, -14, -28], size: 48, delay: 0.216 },
  { type: 'berry', scatter: [17, 35, 38], bowl: [5, 8, 0], glass: [4, -12, 0], size: 36, delay: 0.232 },
  { type: 'pepper', scatter: [3, -23, 106], bowl: [-8, 2, 83], glass: [-2, 4, 140], size: 48, delay: 0.25 }
];

const IngredientArt = ({ type }) => {
  if (type === 'tomato') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="43" r="29" fill="#f05a3e" />
        <path d="M40 18c-2-8 4-11 4-11M40 20 28 13l3 12-10 3 15 5 4-13Zm0 0 12-7-3 12 10 3-15 5-4-13Z" fill="#2e7d4f" stroke="#174d30" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 38c5-10 12-13 20-14" fill="none" stroke="#ff8b72" strokeWidth="5" strokeLinecap="round" opacity=".75" />
      </svg>
    );
  }

  if (type === 'leaf') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M12 64C12 31 31 9 68 10c-1 38-20 57-56 54Z" fill="#45975c" />
        <path d="M15 61c15-14 27-27 47-44M29 48l-1-20M40 37l18 1" fill="none" stroke="#d7e9b5" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'cucumber') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="31" fill="#dce9a7" stroke="#509458" strokeWidth="7" />
        <ellipse cx="40" cy="25" rx="4" ry="8" fill="#f5f0c8" />
        <ellipse cx="54" cy="43" rx="4" ry="8" transform="rotate(60 54 43)" fill="#f5f0c8" />
        <ellipse cx="27" cy="46" rx="4" ry="8" transform="rotate(-55 27 46)" fill="#f5f0c8" />
        <circle cx="40" cy="40" r="5" fill="#b6cf77" />
      </svg>
    );
  }

  if (type === 'carrot') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="m27 19 38 11-39 40c-5 4-11 0-10-6l11-45Z" fill="#ff8b3d" />
        <path d="m28 21-9-14M30 20 37 6M27 22 8 18" fill="none" stroke="#397a46" strokeWidth="7" strokeLinecap="round" />
        <path d="m28 38 11 3M24 50l9 3" fill="none" stroke="#e96a27" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'avocado') {
    return (
      <svg viewBox="0 0 80 90" aria-hidden="true">
        <path d="M40 5c13 0 31 42 31 58 0 15-13 24-31 24S9 78 9 63C9 47 27 5 40 5Z" fill="#527a3c" />
        <path d="M40 13c10 0 24 36 24 49 0 11-10 18-24 18s-24-7-24-18c0-13 14-49 24-49Z" fill="#c5db74" />
        <circle cx="40" cy="61" r="13" fill="#b86a3c" />
        <circle cx="35" cy="56" r="4" fill="#d78c5a" opacity=".75" />
      </svg>
    );
  }

  if (type === 'radish') {
    return (
      <svg viewBox="0 0 80 90" aria-hidden="true">
        <path d="M40 19c19 0 28 13 25 31-2 13-11 24-25 34-14-10-23-21-25-34-3-18 6-31 25-31Z" fill="#ed5c75" />
        <path d="M40 68c-4 7-2 13 0 18M33 22C21 19 14 13 10 5M43 21c2-10 9-15 17-19M49 23c10-7 17-7 24-4" fill="none" stroke="#3c8651" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 39c4-8 9-11 16-12" fill="none" stroke="#ff9bac" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'pepper') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M14 56C24 31 41 18 66 16c-9 22-24 39-45 51-8 4-11-3-7-11Z" fill="#ffd34c" />
        <path d="M62 18c4-6 5-10 3-15" fill="none" stroke="#347344" strokeWidth="6" strokeLinecap="round" />
        <path d="M20 57c17-7 30-19 39-34" fill="none" stroke="#ffea86" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'berry') {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="42" r="27" fill="#7350a0" />
        <path d="m40 19-8-10 8 4 8-4-3 11 11 2-12 5-4-8-4 8-12-5 11-2" fill="#3a7c4d" />
        <circle cx="31" cy="34" r="6" fill="#9776bd" opacity=".7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path d="M13 45c19 21 42 18 55-9-7 8-15 12-24 11-12-1-20-8-24-18-3 5-5 10-7 16Z" fill="#ffd85f" stroke="#e5a936" strokeWidth="5" strokeLinejoin="round" />
      <path d="M22 39c11 11 24 14 38 5" fill="none" stroke="#fff1a8" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
};

const FloatingIngredient = ({ ingredient, progress, index }) => {
  // Phase 0 (0–15%): scattered ambient field.
  // Phase 1 (15–55%): a short, staggered plating motion.
  const convergence = range(progress, 0.15 + ingredient.delay * 0.45, 0.55 + ingredient.delay * 0.15);
  // Phase 2 (55–100%): transforms stay frozen in their finished bowl positions.
  const x = mix(ingredient.scatter[0], ingredient.bowl[0], convergence);
  const y = mix(ingredient.scatter[1], ingredient.bowl[1], convergence);
  const rotation = mix(ingredient.scatter[2], ingredient.bowl[2], convergence);
  const scale = mix(1.12, 1, convergence);

  return (
    <div
      className={`harvest-ingredient harvest-ingredient--${ingredient.type}`}
      style={{
        '--x': `${x}vw`,
        '--y': `${y}vh`,
        '--rotation': `${rotation}deg`,
        '--scale': scale,
        '--ingredient-size': `${ingredient.size * 1.18}px`,
        '--float-delay': `${index * -0.37}s`
      }}
    >
      <IngredientArt type={ingredient.type} />
    </div>
  );
};

const storyCopy = [
  {
    phase: 'SCROLL TO GATHER',
    title: <>Fresh, assembled.<br /><em>However you want it.</em></>,
    body: 'Real ingredients, chopped each morning and made your way. Follow the harvest from leaf to lunch.',
    className: 'harvest-copy--hero'
  },
  {
    phase: '01 — THE BOWL',
    title: <>Grown close.<br />Tossed closer.</>,
    body: 'Crisp leaves, market vegetables and house-made dressings settle into one seriously good bowl.',
    className: 'harvest-copy--bowl'
  }
];

const StoryCopy = ({ progress }) => {
  const activeIndex = progress < 0.28 ? 0 : 1;

  return (
    <div className="harvest-copy-stage">
      {storyCopy.map((copy, index) => (
        <div className={`harvest-copy ${copy.className} ${activeIndex === index ? 'is-active' : ''}`} key={copy.phase}>
          <p className="harvest-eyebrow">{copy.phase}</p>
          <h1>{copy.title}</h1>
          <p className="harvest-copy__body">{copy.body}</p>
          {index === 0 && (
            <a className="harvest-button harvest-button--primary" href="#menu">
              See the menu <span aria-hidden="true">↘</span>
            </a>
          )}
          {index === 1 && (
            <Link className="harvest-text-link" to="/register">Build your bowl <span aria-hidden="true">→</span></Link>
          )}
        </div>
      ))}
    </div>
  );
};

const blenderDrops = [
  { type: 'banana', left: '30%', delay: '0s' },
  { type: 'berry', left: '52%', delay: '-1.1s' },
  { type: 'leaf', left: '68%', delay: '-2.2s' },
  { type: 'berry', left: '40%', delay: '-3.3s' }
];

const getMenuType = (item) => {
  const categoryName = item.category?.name?.toLowerCase() || '';
  return /(blend|drink|juice|smoothie|shake)/.test(categoryName) ? 'blend' : 'bowl';
};

const BlenderLoop = () => {
  const blenderRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const blender = blenderRef.current;
    if (!blender) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsPlaying(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(blender);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`harvest-blend ${isPlaying ? 'is-playing' : ''}`} ref={blenderRef}>
      <div className="harvest-blend__visual" aria-label="Illustrated fruit and greens blending into a smoothie">
        <div className="harvest-blender">
          <div className="harvest-blender__lid" />
          <div className="harvest-blender__jar">
            <div className="harvest-blender__liquid">
              <span />
              <span />
              <span />
            </div>
            <div className="harvest-blender__blade">
              <i />
              <i />
            </div>
            {blenderDrops.map((drop, index) => (
              <div
                className="harvest-blender__drop"
                key={`${drop.type}-${index}`}
                style={{ '--drop-left': drop.left, '--drop-delay': drop.delay }}
              >
                <IngredientArt type={drop.type} />
              </div>
            ))}
            <div className="harvest-blender__shine" />
          </div>
          <div className="harvest-blender__base">
            <span />
          </div>
          <div className="harvest-blender__shadow" />
        </div>
        <p className="harvest-blend__loop-note">DROP · SPIN · SIP · REPEAT</p>
      </div>
      <div className="harvest-blend__copy">
        <p className="harvest-eyebrow">02 — THE BLEND</p>
        <h2>Same fresh ingredients.<br /><em>Blended, not chopped.</em></h2>
        <p>Whole fruit, leafy greens and creamy yogurt tumble together in a cold, bright loop—blended only when you ask.</p>
        <Link className="harvest-button harvest-button--primary" to="/register">Blend your own <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
};

const MenuMark = ({ type }) => (
  <span className={`harvest-menu-mark harvest-menu-mark--${type}`} aria-hidden="true">
    {type === 'bowl' ? '◡' : '┃'}
  </span>
);

export const PublicLanding = () => {
  const storyRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bestsellers, setBestsellers] = useState([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const [bestsellersError, setBestsellersError] = useState('');

  useEffect(() => {
    let frame;
    const updateProgress = () => {
      const story = storyRef.current;
      if (!story) return;
      const rect = story.getBoundingClientRect();
      const travel = story.offsetHeight - window.innerHeight;
      setProgress(clamp(-rect.top / Math.max(travel, 1)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadBestsellers = async () => {
      try {
        setBestsellersError('');
        const response = await menuItemApi.getPublicMenuItems({
          isBestseller: true,
          limit: 6,
          sort: '-createdAt'
        });

        if (isCurrent) {
          setBestsellers(response.data.data.menuItems);
        }
      } catch (apiError) {
        if (isCurrent) {
          setBestsellers([]);
          setBestsellersError(apiError.response?.data?.message || 'Unable to load bestsellers right now.');
        }
      } finally {
        if (isCurrent) {
          setBestsellersLoading(false);
        }
      }
    };

    loadBestsellers();
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="harvest-site">
      <header className="harvest-nav">
        <a className="harvest-logo" href="#top" aria-label="Healthiffy home">
          <span className="harvest-logo__leaf">h</span>
          <span>healthiffy</span>
        </a>
        <button
          className="harvest-nav__toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
        </button>
        <nav className={`harvest-nav__links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#menu" onClick={() => setMenuOpen(false)}>Menu</a>
          <a href="#location" onClick={() => setMenuOpen(false)}>Location</a>
          <Link to="/login">Log in</Link>
          <Link className="harvest-button harvest-button--small" to="/register">Order now <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="harvest-story" id="top" ref={storyRef}>
        <div className="harvest-story__sticky">
          <div className="harvest-grain" />
          <p className="harvest-side-note">BOWLS · BLENDS · BETTER DAYS</p>
          <StoryCopy progress={progress} />

          <div className="harvest-scene" id="ingredients" aria-label="Ingredients assembling into a salad bowl, then a smoothie">
            <div className="harvest-orbit harvest-orbit--one" />
            <div className="harvest-orbit harvest-orbit--two" />

            <div className={`harvest-bowl ${progress >= 0.55 ? 'is-settled' : ''}`}>
              <div className="harvest-bowl__rim" />
              <div className="harvest-bowl__salad" aria-hidden="true">
                <svg viewBox="0 0 480 190">
                  <defs>
                    <linearGradient id="saladLeaf" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#76a957" />
                      <stop offset="1" stopColor="#2f7748" />
                    </linearGradient>
                    <linearGradient id="avocadoFan" x1="0" x2="1">
                      <stop offset="0" stopColor="#dbea84" />
                      <stop offset="1" stopColor="#8fb952" />
                    </linearGradient>
                  </defs>

                  <g className="harvest-salad__greens">
                    <ellipse cx="238" cy="104" rx="192" ry="68" fill="#315f3d" />
                    <path d="M52 111C42 70 80 39 133 62c6 40-24 70-81 49Z" fill="url(#saladLeaf)" />
                    <path d="M116 79c12-48 61-57 91-19-10 45-47 57-91 19Z" fill="#4f9457" />
                    <path d="M190 68c26-40 72-31 88 12-28 36-65 31-88-12Z" fill="#75aa59" />
                    <path d="M272 73c42-32 81-8 77 36-42 25-72 7-77-36Z" fill="#48884f" />
                    <path d="M338 92c36-28 76-8 80 30-31 27-67 15-80-30Z" fill="#6ba358" />
                    <path d="M83 129c20-36 57-36 79-2-22 33-55 34-79 2Z" fill="#8db35e" />
                    <path d="M289 130c27-36 69-30 82 8-29 29-63 25-82-8Z" fill="#397c49" />
                  </g>

                  <g className="harvest-salad__cabbage" fill="none" stroke="#8b5a93" strokeLinecap="round" strokeWidth="9">
                    <path d="m74 112 43-16 35 20 41-17" />
                    <path d="m283 112 33-20 36 15 38-14" />
                  </g>

                  <g className="harvest-salad__cucumber">
                    <circle cx="125" cy="91" r="27" fill="#dce9a7" stroke="#55935b" strokeWidth="6" />
                    <circle cx="125" cy="91" r="9" fill="none" stroke="#f7f1c9" strokeDasharray="4 5" strokeWidth="6" />
                    <circle cx="352" cy="105" r="25" fill="#dce9a7" stroke="#55935b" strokeWidth="6" />
                    <circle cx="352" cy="105" r="8" fill="none" stroke="#f7f1c9" strokeDasharray="4 5" strokeWidth="6" />
                  </g>

                  <g className="harvest-salad__tomatoes">
                    <circle cx="182" cy="113" r="24" fill="#ef6047" />
                    <circle cx="182" cy="113" r="15" fill="none" stroke="#ff9a7e" strokeDasharray="7 4" strokeWidth="4" />
                    <circle cx="308" cy="84" r="23" fill="#ef6047" />
                    <circle cx="308" cy="84" r="14" fill="none" stroke="#ff9a7e" strokeDasharray="7 4" strokeWidth="4" />
                  </g>

                  <g className="harvest-salad__avocado" fill="url(#avocadoFan)" stroke="#477c3e" strokeWidth="3">
                    <path d="M215 137c-4-48 5-75 22-82 10 24 4 54-22 82Z" />
                    <path d="M234 139c2-51 16-75 35-78 4 27-8 55-35 78Z" />
                    <path d="M253 141c9-46 27-66 45-65-1 27-16 49-45 65Z" />
                  </g>

                  <g className="harvest-salad__dressing" fill="none" stroke="#f4d58a" strokeLinecap="round" strokeWidth="7">
                    <path d="M89 79c55 38 95 48 145 23s97-25 153 11" />
                    <path d="M110 137c57-21 103-16 147 3s77 14 111-2" />
                  </g>

                  <g className="harvest-salad__seeds" fill="#f7edc1">
                    <ellipse cx="142" cy="122" rx="3" ry="7" transform="rotate(-28 142 122)" />
                    <ellipse cx="204" cy="77" rx="3" ry="7" transform="rotate(31 204 77)" />
                    <ellipse cx="274" cy="116" rx="3" ry="7" transform="rotate(-17 274 116)" />
                    <ellipse cx="329" cy="132" rx="3" ry="7" transform="rotate(36 329 132)" />
                    <ellipse cx="369" cy="77" rx="3" ry="7" transform="rotate(-31 369 77)" />
                    <circle cx="166" cy="72" r="4" />
                    <circle cx="295" cy="56" r="4" />
                    <circle cx="391" cy="118" r="4" />
                  </g>

                  <g className="harvest-salad__herbs" fill="none" stroke="#dce77e" strokeLinecap="round" strokeWidth="5">
                    <path d="m97 105-15-30m7 15-16-3m12-5 8-13" />
                    <path d="m376 126 20-31m-11 16 17-1m-12-8-5-15" />
                  </g>
                </svg>
              </div>
              <div className="harvest-bowl__body" />
              <div className="harvest-bowl__shadow" />
            </div>

            {ingredients.slice(0, 12).map((ingredient, index) => (
              <FloatingIngredient ingredient={ingredient} index={index} key={`${ingredient.type}-${index}`} progress={progress} />
            ))}
          </div>

          <div className="harvest-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
            <small>{String(Math.round(progress * 100)).padStart(2, '0')}</small>
          </div>
        </div>
      </section>

      {/* Independent mechanism: viewport-triggered, time-based loop; never tied to scroll progress. */}
      <BlenderLoop />

      {/* Closing content is normal document flow with no scroll-canvas dependency. */}
      <section className="harvest-menu" id="menu">
        <div className="harvest-section-heading">
          <p className="harvest-eyebrow">HEALTHIFFY BESTSELLERS</p>
          <h2>Most loved.<br /><em>For good reason.</em></h2>
          <p>Our community favorites, picked most often for lunch runs, slow afternoons and everything in between.</p>
        </div>
        <div className="harvest-menu-list">
          {bestsellersLoading && (
            <p className="harvest-menu-state">Loading today&apos;s bestsellers…</p>
          )}
          {!bestsellersLoading && bestsellersError && (
            <p className="harvest-menu-state harvest-menu-state--error">{bestsellersError}</p>
          )}
          {!bestsellersLoading && !bestsellersError && bestsellers.length === 0 && (
            <p className="harvest-menu-state">No bestsellers are available right now. Check back soon.</p>
          )}
          {!bestsellersLoading && !bestsellersError && bestsellers.map((item) => (
            <article key={item._id}>
              <MenuMark type={getMenuType(item)} />
              <div>
                <div className="harvest-menu-title">
                  <h3>{item.name}</h3>
                  <span className="harvest-bestseller-badge">Bestseller</span>
                </div>
                <p>{item.description}</p>
              </div>
              <strong>₹{item.offerPrice ?? item.price}</strong>
            </article>
          ))}
        </div>
        <Link className="harvest-button harvest-button--dark" to="/register">Start an order <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="harvest-location" id="location">
        <div className="harvest-location__art" aria-hidden="true">
          <span className="harvest-location__sun" />
          <span className="harvest-location__counter" />
          <span className="harvest-location__awning" />
          <span className="harvest-location__door" />
          <span className="harvest-location__plant">✦</span>
        </div>
        <div className="harvest-location__copy">
          <p className="harvest-eyebrow">COME SAY HI</p>
          <h2>Fresh tastes better<br />around the corner.</h2>
          <p className="harvest-location__address">Healthiffy Kitchen<br />Your nearest neighborhood branch</p>
          <Link className="harvest-text-link" to="/register">Find your branch <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <footer className="harvest-footer">
        <div>
          <p className="harvest-eyebrow">FRESH, EVERY DAY.</p>
          <h2>Eat well.<br /><em>Feel bright.</em></h2>
        </div>
        <div className="harvest-footer__links">
          <div><span>EXPLORE</span><a href="#menu">Menu</a><a href="#ingredients">Our ingredients</a><a href="#location">Locations</a></div>
          <div><span>FOLLOW</span><a href="#instagram">Instagram</a><a href="#facebook">Facebook</a><a href="#tiktok">TikTok</a></div>
        </div>
        <div className="harvest-footer__bottom">
          <a className="harvest-logo harvest-logo--light" href="#top"><span className="harvest-logo__leaf">h</span><span>healthiffy</span></a>
          <p>Eat well. Feel bright. Repeat.</p>
          <p>© {new Date().getFullYear()} Healthiffy</p>
        </div>
      </footer>
    </main>
  );
};
