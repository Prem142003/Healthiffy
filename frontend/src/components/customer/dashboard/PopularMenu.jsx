import { MenuCard } from '../MenuCard';

const PopularMenu = ({ items, loading, onAdd }) => (
  <section className="dashboard-section" aria-labelledby="popular-menu-title">
    <div className="dashboard-section__heading">
      <div>
        <p className="dashboard-eyebrow">Popular right now</p>
        <h2 id="popular-menu-title">Cafe favourites</h2>
      </div>
      <a className="dashboard-text-link" href="#menu">See full menu &#8594;</a>
    </div>

    {loading ? (
      <div className="popular-menu-grid" aria-label="Loading popular menu items">
        {[1, 2, 3, 4].map((item) => <div key={item} className="dashboard-skeleton dashboard-skeleton--menu" />)}
      </div>
    ) : items.length ? (
      <div className="popular-menu-grid">
        {items.map((item) => <MenuCard key={item._id} item={item} variant="featured" onOrder={onAdd} />)}
      </div>
    ) : (
      <p className="dashboard-inline-message">Select a branch to see its most popular menu items.</p>
    )}
  </section>
);

export default PopularMenu;
