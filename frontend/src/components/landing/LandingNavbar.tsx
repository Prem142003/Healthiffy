import { useEffect, useState } from 'react';
import { ChevronDown, Leaf, MapPin, Menu, ShoppingBag, UserRound, X } from 'lucide-react';

interface PublicBranch {
  _id: string;
  name: string;
  status?: string;
}

interface LandingNavbarProps {
  onLogin: () => void;
  onOrder: () => void;
  branches: PublicBranch[];
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  branchesLoading?: boolean;
}

const navItems = [
  ['Menu', 'harvest-menu'],
  ['Bowls', 'harvest-menu'],
  ['Ingredients', 'ingredients'],
  ['Locations', 'location'],
  ['About', 'about'],
] as const;

export const LandingNavbar = ({
  onLogin,
  onOrder,
  branches,
  selectedBranchId,
  onSelectBranch,
  branchesLoading = false,
}: LandingNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const selectedBranch = branches.find((branch) => branch._id === selectedBranchId);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setBranchOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    setBranchOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="landing-header">
      <div className="landing-announcement">Freshly prepared <span aria-hidden="true">•</span> Delivered with care <span aria-hidden="true">•</span> Order from your nearest cafe</div>
      <div className="landing-nav-shell">
        <button type="button" onClick={() => scrollTo('top')} className="landing-brand" aria-label="Healthiffy home">
          <span className="landing-brand__mark"><Leaf aria-hidden="true" /></span>
          <span className="landing-brand__copy"><strong>HEALTHIFFY</strong><small>Pure veg cafe</small></span>
        </button>

        <nav className="landing-nav-links" aria-label="Main navigation">
          {navItems.map(([label, id]) => <button type="button" onClick={() => scrollTo(id)} key={label}>{label}</button>)}
        </nav>

        <div className="landing-nav-actions">
          <div className="landing-branch-switcher">
            <button
              type="button"
              className="landing-branch-trigger"
              onClick={() => setBranchOpen((open) => !open)}
              aria-expanded={branchOpen}
              aria-controls="landing-branch-menu"
            >
              <MapPin aria-hidden="true" />
              <span>{branchesLoading ? 'Loading…' : selectedBranch?.name || 'Choose branch'}</span>
              <ChevronDown aria-hidden="true" className={branchOpen ? 'is-open' : ''} />
            </button>
            {branchOpen ? (
              <div className="landing-branch-menu" id="landing-branch-menu">
                <p>Choose cafe location</p>
                {branches.map((branch) => (
                  <button
                    type="button"
                    key={branch._id}
                    className={branch._id === selectedBranchId ? 'is-selected' : ''}
                    onClick={() => {
                      onSelectBranch(branch._id);
                      setBranchOpen(false);
                    }}
                  >
                    <span>{branch.name}</span>
                    {branch._id === selectedBranchId ? <span className="landing-branch-menu__dot" aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" className="landing-icon-button landing-account-button" onClick={onLogin} aria-label="Customer sign in"><UserRound aria-hidden="true" /></button>
          <button type="button" className="landing-icon-button landing-cart-button" onClick={onLogin} aria-label="Sign in to view cart"><ShoppingBag aria-hidden="true" /></button>
          <button type="button" className="landing-order-button" onClick={onOrder}>Order now <span aria-hidden="true">↗</span></button>
          <button type="button" className="landing-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="landing-mobile-menu">
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="landing-mobile-menu" id="landing-mobile-menu" aria-label="Mobile navigation">
          <div className="landing-mobile-branches">
            <p>Ordering from</p>
            <select value={selectedBranchId} onChange={(event) => onSelectBranch(event.target.value)} aria-label="Choose cafe branch">
              {branches.map((branch) => <option value={branch._id} key={branch._id}>{branch.name}</option>)}
            </select>
          </div>
          {navItems.map(([label, id]) => <button type="button" onClick={() => scrollTo(id)} key={label}>{label}</button>)}
          <button type="button" className="landing-mobile-menu__signin" onClick={onLogin}>Sign in</button>
        </nav>
      ) : null}
    </header>
  );
};
