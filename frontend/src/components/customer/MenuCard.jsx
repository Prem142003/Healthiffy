import SafeImage from './dashboard/SafeImage';

const PriceLabel = ({ item }) => {
  if (item.offerPrice !== undefined && item.offerPrice !== null) {
    return (
      <div className="menu-card__prices">
        <strong>Rs. {Number(item.offerPrice).toFixed(0)}</strong>
        <span>Rs. {Number(item.price).toFixed(0)}</span>
      </div>
    );
  }

  return <strong className="menu-card__price">Rs. {Number(item.price || 0).toFixed(0)}</strong>;
};

export const MenuCard = ({ item, onOrder }) => (
  <article className="menu-card">
    <div className="menu-card__media">
      <SafeImage
        className="menu-card__image"
        src={item.image?.url || item.image}
        alt={item.name}
        fallback="HF"
      />
      {item.isBestseller ? <span className="menu-card__bestseller">Bestseller</span> : null}
    </div>
    <div className="menu-card__body">
      <div className="menu-card__title-row">
        <h3>{item.name}</h3>
        <span
          className={`food-dot food-dot--${String(item.foodType || 'veg').toLowerCase()}`}
          aria-label={item.foodType === 'NON_VEG' ? 'Non vegetarian' : 'Vegetarian'}
        />
      </div>
      <p>{item.description || 'Freshly prepared at your selected Healthiffy cafe.'}</p>
      <div className="menu-card__details">
        <PriceLabel item={item} />
        <span>{item.preparationTime} min</span>
      </div>
      <div className="menu-card__footer">
        <span>{item.category?.name || 'Healthiffy menu'}</span>
        {onOrder ? (
          <button type="button" onClick={() => onOrder(item)}>Add to cart</button>
        ) : null}
      </div>
    </div>
  </article>
);
