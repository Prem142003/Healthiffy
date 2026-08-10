import SafeImage from "./SafeImage";

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
        {items.map((item) => (
          <article className="popular-menu-card" key={item._id}>
            <SafeImage
              src={item.image?.url || item.image}
              alt={item.name}
              className="popular-menu-card__image"
              fallback="HF"
            />
            <div className="popular-menu-card__body">
              <div>
                <span className={`food-dot food-dot--${String(item.foodType || "veg").toLowerCase()}`} aria-label={item.foodType || "Food item"} />
                <h3>{item.name}</h3>
              </div>
              <p>{item.description || "Freshly prepared at your selected Healthiffy cafe."}</p>
              <div className="popular-menu-card__footer">
                <strong>Rs. {Number(item.price || 0).toFixed(0)}</strong>
                <button type="button" onClick={() => onAdd(item)}>Add</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <p className="dashboard-inline-message">Select a branch to see its most popular menu items.</p>
    )}
  </section>
);

export default PopularMenu;
