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

export const MenuCard = ({ item, onOrder, onOpen, quantity = 0, onIncrease, onDecrease }) => (
  <article className="menu-card">
    <div className="menu-card__media">
      <button className="menu-card__open" type="button" aria-label={`View ${item.name}`} onClick={() => onOpen?.(item)}>
        <SafeImage
          className="menu-card__image"
          src={item.image?.url || item.image}
          alt={item.name}
          fallback="HF"
        />
      </button>
      {item.isBestseller ? <span className="menu-card__bestseller">Bestseller</span> : null}
    </div>
    <div className="menu-card__body">
      <div className="menu-card__title-row">
        <button className="menu-card__name" type="button" onClick={() => onOpen?.(item)}><h3>{item.name}</h3></button>
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
        {quantity > 0 ? (
          <div className="menu-card__quantity" aria-label={`${item.name} quantity`}>
            <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onDecrease(item)}>-</button>
            <strong>{quantity}</strong>
            <button type="button" aria-label={`Add one ${item.name}`} onClick={() => onIncrease(item)}>+</button>
          </div>
        ) : onOrder ? (
          <button type="button" onClick={() => onOrder(item, 1)}>Add to cart</button>
        ) : null}
      </div>
    </div>
  </article>
);
