import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChefHat,
  Clock3,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import avocadoImage from '../../assets/images/avocado_slices_1788424146185.jpg';
import cucumberImage from '../../assets/images/cucumber_radish_1788424260138.jpg';
import finalBowlImage from '../../assets/images/delightful_final_salad_1788424754145.jpg';
import fetaImage from '../../assets/images/feta_pomegranate_gems_1788424806569.jpg';
import greensImage from '../../assets/images/salad_greens_bed_1788424240208.jpg';
import tomatoImage from '../../assets/images/tomato_slices_1788424182429.jpg';
import { HarvestScrollyHero } from '../../components/landing/HarvestScrollyHero';
import { LandingNavbar } from '../../components/landing/LandingNavbar';
import SafeImage from '../../components/customer/dashboard/SafeImage';
import { branchApi } from '../../services/branchApi';
import { menuItemApi } from '../../services/menuItemApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import './PublicLanding.css';

const getPrice = (item) => item.offerPrice ?? item.price;

const trustItems = [
  { Icon: Leaf, title: 'Fresh ingredients', copy: 'Colorful produce prepared for the day.' },
  { Icon: ChefHat, title: 'Prepared daily', copy: 'Made by your selected Healthiffy cafe.' },
  { Icon: SlidersHorizontal, title: 'Built for your day', copy: 'Browse bowls, favourites and flexible plans.' },
  { Icon: ShieldCheck, title: 'Secure checkout', copy: 'Protected payments and clear order tracking.' }
];

const assemblySteps = [
  { number: '01', title: 'Choose your cafe', copy: 'Set your location to see what that branch is serving.' },
  { number: '02', title: 'Find your favourite', copy: 'Browse the live pure-vegetarian menu and bestsellers.' },
  { number: '03', title: 'Make it your routine', copy: 'Order once or explore a monthly meal plan.' },
  { number: '04', title: 'Follow every step', copy: 'Sign in for secure payment and order tracking.' }
];

const galleryItems = [
  { image: avocadoImage, label: 'Creamy avocado', className: 'gallery-card--tall' },
  { image: tomatoImage, label: 'Bright tomatoes', className: '' },
  { image: finalBowlImage, label: 'The finished bowl', className: 'gallery-card--wide' },
  { image: cucumberImage, label: 'Crisp vegetables', className: '' },
  { image: fetaImage, label: 'Finishing touches', className: 'gallery-card--tall' }
];

const routineCards = [
  { title: 'A clearer lunch break', copy: 'Choose your branch first, then browse only what is available there.', detail: 'Branch-first ordering' },
  { title: 'Favourites within reach', copy: 'Bestsellers stay prominent while the complete cafe menu remains easy to scan.', detail: 'Simple menu discovery' },
  { title: 'A routine that can flex', copy: 'Compare monthly plans from the same cafe before deciding to sign in.', detail: 'Plan before you commit' }
];

const MenuCard = ({ item, onOrder, compact = false }) => (
  <article className={`premium-menu-card ${compact ? 'premium-menu-card--compact' : ''}`}>
    <div className="premium-menu-card__media">
      <SafeImage src={item.image?.url || item.image} alt={item.name} fallback="HF" />
      {item.isBestseller ? <span className="premium-menu-card__badge"><Star aria-hidden="true" /> Bestseller</span> : null}
      <span className="premium-menu-card__veg" aria-label="Pure vegetarian"><span /></span>
    </div>
    <div className="premium-menu-card__body">
      <p>{item.category?.name || 'Healthiffy menu'}</p>
      <h3>{item.name}</h3>
      <span className="premium-menu-card__description">{item.description || 'Freshly prepared at your selected Healthiffy cafe.'}</span>
      <div className="premium-menu-card__footer">
        <div><strong>₹{getPrice(item)}</strong><span><Clock3 aria-hidden="true" /> {item.preparationTime || 'Fresh'}{item.preparationTime ? ' min' : ''}</span></div>
        <button type="button" onClick={onOrder} aria-label={`Sign in to order ${item.name}`}>+</button>
      </div>
    </div>
  </article>
);

export const PublicLanding = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [plansError, setPlansError] = useState('');
  const [communityMessage, setCommunityMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const loadBranches = async () => {
      try {
        setBranchesError('');
        const response = await branchApi.getPublicBranches({ limit: 100, sort: 'name' });
        if (!isCurrent) return;
        const loadedBranches = response.data.data.branches || [];
        let savedBranchId = '';
        try {
          savedBranchId = window.localStorage.getItem('healthiffy_public_branch') || '';
        } catch {
          savedBranchId = '';
        }
        setBranches(loadedBranches);
        setSelectedBranchId(loadedBranches.some((branch) => branch._id === savedBranchId) ? savedBranchId : loadedBranches[0]?._id || '');
      } catch (error) {
        if (isCurrent) {
          setBranches([]);
          setBranchesError(error.response?.data?.message || 'Unable to load branches right now.');
        }
      } finally {
        if (isCurrent) setBranchesLoading(false);
      }
    };
    loadBranches();
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setMenuItems([]);
      setPlans([]);
      return undefined;
    }

    let isCurrent = true;
    setMenuLoading(true);
    setPlansLoading(true);
    setMenuError('');
    setPlansError('');

    Promise.allSettled([
      menuItemApi.getPublicMenuItems({ branch: selectedBranchId, limit: 100, sort: '-isBestseller name', foodType: 'VEG' }),
      subscriptionApi.getPlans({ branch: selectedBranchId, limit: 100 })
    ]).then(([menuResult, plansResult]) => {
      if (!isCurrent) return;
      if (menuResult.status === 'fulfilled') {
        const items = menuResult.value.data.data.menuItems || [];
        setMenuItems([...items].sort((left, right) => Number(right.isBestseller) - Number(left.isBestseller)));
      } else {
        setMenuItems([]);
        setMenuError(menuResult.reason.response?.data?.message || 'Unable to load this branch menu.');
      }
      if (plansResult.status === 'fulfilled') {
        setPlans(plansResult.value.data.data.plans || []);
      } else {
        setPlans([]);
        setPlansError(plansResult.reason.response?.data?.message || 'Unable to load this branch’s monthly plans.');
      }
      setMenuLoading(false);
      setPlansLoading(false);
    });

    return () => { isCurrent = false; };
  }, [selectedBranchId]);

  const selectedBranch = branches.find((branch) => branch._id === selectedBranchId);
  const menuIsLoading = branchesLoading || menuLoading;
  const plansAreLoading = branchesLoading || plansLoading;
  const featuredItems = useMemo(() => menuItems.slice(0, 4), [menuItems]);
  const categories = useMemo(() => {
    const seen = new Set();
    return menuItems.reduce((result, item) => {
      const name = item.category?.name;
      if (!name || seen.has(name) || result.length >= 6) return result;
      seen.add(name);
      result.push({ name, image: item.image?.url || item.image, description: item.description });
      return result;
    }, []);
  }, [menuItems]);

  const selectBranch = (branchId) => {
    setSelectedBranchId(branchId);
    try {
      window.localStorage.setItem('healthiffy_public_branch', branchId);
    } catch {
      // The selection still works when browser storage is unavailable.
    }
  };

  const goToLogin = () => navigate('/login');
  const scrollToMenu = () => document.getElementById('full-menu')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="premium-landing">
      <LandingNavbar
        onLogin={goToLogin}
        onOrder={scrollToMenu}
        branches={branches}
        selectedBranchId={selectedBranchId}
        onSelectBranch={selectBranch}
        branchesLoading={branchesLoading}
      />

      <HarvestScrollyHero
        onExploreClick={scrollToMenu}
        onSubscriptionClick={() => document.getElementById('harvest-subscriptions')?.scrollIntoView({ behavior: 'smooth' })}
      />

      <section className="trust-strip" aria-label="Why order from Healthiffy">
        <div className="landing-container trust-strip__grid">
          {trustItems.map(({ Icon, title, copy }) => (
            <article key={title}><span><Icon aria-hidden="true" /></span><div><h2>{title}</h2><p>{copy}</p></div></article>
          ))}
        </div>
      </section>

      <section className="landing-section category-section" id="ingredients" aria-labelledby="categories-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--center">
            <p className="landing-eyebrow">Start with what feels good</p>
            <h2 className="landing-display" id="categories-title">Find your <em>perfect plate.</em></h2>
            <p>Categories shown from {selectedBranch?.name || 'your selected Healthiffy cafe'}.</p>
          </div>
          {menuIsLoading ? (
            <div className="category-grid" aria-label="Loading menu categories">{[1, 2, 3, 4, 5].map((item) => <div className="landing-skeleton category-skeleton" key={item} />)}</div>
          ) : categories.length ? (
            <div className="category-grid">
              {categories.map((category) => (
                <button type="button" key={category.name} onClick={scrollToMenu} className="category-card">
                  <span className="category-card__image"><SafeImage src={category.image} alt="" fallback="HF" /></span>
                  <strong>{category.name}</strong>
                  <small>{category.description || 'Fresh from this branch'}</small>
                </button>
              ))}
            </div>
          ) : <p className="landing-empty">Choose an active cafe to explore its live categories.</p>}
        </div>
      </section>

      <section className="landing-section featured-section" id="harvest-menu" aria-labelledby="featured-title">
        <div className="landing-container featured-layout">
          <div className="featured-editorial">
            <p className="landing-eyebrow">{selectedBranch ? `${selectedBranch.name} favourites` : 'Branch favourites'}</p>
            <h2 className="landing-display" id="featured-title">The bowls people <em>reach for first.</em></h2>
            <p>Live pure-vegetarian bestsellers from your selected cafe, available to browse before sign in.</p>
            <a href="#full-menu" className="landing-text-link">View full menu <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="featured-products">
            {menuIsLoading ? [1, 2, 3, 4].map((item) => <div className="landing-skeleton menu-skeleton" key={item} />) : null}
            {!menuIsLoading && menuError ? <p className="landing-alert">{menuError}</p> : null}
            {!menuIsLoading && !menuError && !featuredItems.length ? <p className="landing-empty">No menu items are currently available at this branch.</p> : null}
            {!menuIsLoading && !menuError ? featuredItems.map((item) => <MenuCard item={item} onOrder={goToLogin} key={item._id} />) : null}
          </div>
        </div>
      </section>

      <section className="landing-section plan-section" id="harvest-subscriptions" aria-labelledby="plans-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--split">
            <div><p className="landing-eyebrow">Monthly meals, less daily decision-making</p><h2 className="landing-display" id="plans-title">A better routine, <em>one meal at a time.</em></h2></div>
            <p>Every plan below comes directly from {selectedBranch?.name || 'the selected cafe'}.</p>
          </div>
          <div className="plan-grid">
            {plansAreLoading ? [1, 2, 3].map((item) => <div className="landing-skeleton plan-skeleton" key={item} />) : null}
            {!plansAreLoading && plansError ? <p className="landing-alert landing-alert--light">{plansError}</p> : null}
            {!plansAreLoading && !plansError && !plans.length ? <p className="landing-empty landing-empty--light">No monthly plans are currently available at this branch.</p> : null}
            {!plansAreLoading && !plansError ? plans.map((plan) => (
              <article className="premium-plan-card" key={plan._id}>
                <SafeImage src={plan.image?.url || plan.menuItem?.image?.url} alt={plan.name} fallback="HF" />
                <div className="premium-plan-card__body">
                  <p>{plan.menuItem?.name || 'Monthly meal plan'}</p>
                  <h3>{plan.name}</h3>
                  <span>{plan.description || plan.menuItem?.description || 'A flexible meal plan from your selected branch.'}</span>
                  <dl><div><dt>Price</dt><dd>₹{plan.price}</dd></div><div><dt>Duration</dt><dd>{plan.durationDays} days</dd></div><div><dt>Meals</dt><dd>{plan.totalMeals}</dd></div></dl>
                  <button type="button" onClick={goToLogin}>Choose this plan <ArrowRight aria-hidden="true" /></button>
                </div>
              </article>
            )) : null}
          </div>
        </div>
      </section>

      <section className="landing-section process-section" aria-labelledby="process-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--center"><p className="landing-eyebrow">Made better, step by step</p><h2 className="landing-display" id="process-title">From your cafe to <em>your table.</em></h2></div>
          <div className="process-grid">
            {assemblySteps.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="landing-promo" aria-labelledby="promo-title">
        <div className="landing-container landing-promo__panel">
          <div className="landing-promo__image"><img src={finalBowlImage} alt="A finished Healthiffy vegetable bowl" loading="lazy" decoding="async" /></div>
          <div><p className="landing-eyebrow">Fresh food, made your way</p><h2 className="landing-display" id="promo-title">Your next bowl starts <em>right here.</em></h2></div>
          <button type="button" onClick={scrollToMenu}>Explore the menu <ArrowRight aria-hidden="true" /></button>
        </div>
      </section>

      <section className="landing-section gallery-section" aria-labelledby="gallery-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--split"><div><p className="landing-eyebrow">Fresh from every angle</p><h2 className="landing-display" id="gallery-title">Ingredients with <em>nothing to hide.</em></h2></div><p>Vibrant produce and satisfying textures, assembled into food that feels as good as it looks.</p></div>
          <div className="food-gallery">
            {galleryItems.map((item) => <figure className={`gallery-card ${item.className}`} key={item.label}><img src={item.image} alt={item.label} loading="lazy" decoding="async" /><figcaption>{item.label}</figcaption></figure>)}
          </div>
        </div>
      </section>

      <section className="landing-section routine-section" aria-labelledby="routine-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--center"><p className="landing-eyebrow">Designed for everyday eating</p><h2 className="landing-display" id="routine-title">A cafe experience that <em>stays simple.</em></h2><p>What the Healthiffy ordering flow is built to make easier.</p></div>
          <div className="routine-grid">
            {routineCards.map((card) => <article key={card.title}><div><Leaf aria-hidden="true" /><span>Healthiffy principle</span></div><blockquote>“{card.copy}”</blockquote><h3>{card.title}</h3><p>{card.detail}</p></article>)}
          </div>
        </div>
      </section>

      <section className="landing-section location-section" id="location" aria-labelledby="location-title">
        <div className="landing-container location-layout">
          <div className="location-visual"><img src={greensImage} alt="Fresh greens prepared for a Healthiffy bowl" loading="lazy" decoding="async" /><span><MapPin aria-hidden="true" /></span></div>
          <div>
            <p className="landing-eyebrow">Your nearest Healthiffy</p>
            <h2 className="landing-display" id="location-title">Start with the <em>right cafe.</em></h2>
            <h3>{selectedBranch?.name || 'Choose your branch'}</h3>
            <p>{selectedBranch?.address || 'Your selected branch controls live menu availability and monthly meal plans.'}</p>
            {selectedBranch?.openingTime && selectedBranch?.closingTime ? <span className="location-hours"><Clock3 aria-hidden="true" /> Open {selectedBranch.openingTime}–{selectedBranch.closingTime}</span> : null}
            {branchesError ? <p className="landing-alert landing-alert--light">{branchesError}</p> : null}
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Switch branch <MapPin aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section className="community-section" aria-labelledby="community-title">
        <div className="landing-container community-layout">
          <div><p className="landing-eyebrow">The Healthiffy community</p><h2 className="landing-display" id="community-title">Good food news, <em>without the clutter.</em></h2><p>Leave your email to register interest in future menu and branch updates.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); setCommunityMessage('Thanks — updates are not connected yet, so no email has been stored.'); }}>
            <label htmlFor="community-email">Email address</label>
            <div><Mail aria-hidden="true" /><input id="community-email" type="email" required placeholder="you@example.com" /><button type="submit">Register interest</button></div>
            {communityMessage ? <p role="status">{communityMessage}</p> : null}
          </form>
        </div>
      </section>

      <section className="full-menu-section" id="full-menu" aria-labelledby="full-menu-title">
        <div className="landing-container">
          <div className="landing-heading landing-heading--split"><div><p className="landing-eyebrow">Everything available today</p><h2 className="landing-display" id="full-menu-title">The full <em>{selectedBranch?.name || 'branch'} menu.</em></h2></div><button type="button" onClick={goToLogin}>Sign in to order <ArrowRight aria-hidden="true" /></button></div>
          {menuIsLoading ? <div className="full-menu-grid" role="status" aria-label="Loading full branch menu">{[1, 2, 3, 4].map((item) => <div className="landing-skeleton menu-skeleton" key={item} />)}</div> : null}
          {!menuIsLoading && menuError ? <p className="landing-alert landing-alert--light">{menuError}</p> : null}
          {!menuIsLoading && !menuError && !menuItems.length ? <p className="landing-empty landing-empty--light">No menu items are currently available at this branch.</p> : null}
          {!menuIsLoading && !menuError && menuItems.length ? <div className="full-menu-grid">{menuItems.map((item) => <MenuCard compact item={item} onOrder={goToLogin} key={item._id} />)}</div> : null}
        </div>
      </section>

      <footer className="landing-footer" id="about">
        <div className="landing-container landing-footer__grid">
          <div className="landing-footer__brand"><span><Leaf aria-hidden="true" /></span><h2>HEALTHIFFY</h2><p>Pure-vegetarian branch-based cafe ordering, secure payments, order tracking, and monthly meal plans.</p></div>
          <div><h3>Menu</h3><a href="#harvest-menu">Bestsellers</a><a href="#full-menu">Full menu</a><a href="#harvest-subscriptions">Monthly plans</a></div>
          <div><h3>Explore</h3><a href="#ingredients">Ingredients</a><a href="#location">Locations</a><a href="#top">Our story</a></div>
          <div><h3>Account</h3><Link to="/login">Customer sign in</Link><Link to="/staff-login">Staff sign in</Link></div>
          <div><h3>Legal &amp; contact</h3><span>Legal name: OMKAR RAJENDRA JAGDALE</span><a href="mailto:healthiffy1@gmail.com"><Mail aria-hidden="true" /> healthiffy1@gmail.com</a><a href="tel:+918263045675"><Phone aria-hidden="true" /> +91 82630 45675</a></div>
        </div>
        <div className="landing-container landing-footer__bottom"><p>© {new Date().getFullYear()} Healthiffy. All rights reserved.</p><p>Eat well. Feel bright.</p></div>
      </footer>
    </main>
  );
};
