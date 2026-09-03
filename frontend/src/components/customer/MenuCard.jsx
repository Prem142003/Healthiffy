import { Clock3, Minus, Plus, Star } from 'lucide-react';
import SafeImage from './dashboard/SafeImage';

const PriceLabel = ({ item }) => {
  if (item.offerPrice !== undefined && item.offerPrice !== null) {
    return (
      <div className="menu-card__prices">
        <strong>₹{Number(item.offerPrice).toFixed(0)}</strong>
        <span>₹{Number(item.price).toFixed(0)}</span>
      </div>
    );
  }
  return <strong className="menu-card__price">₹{Number(item.price || 0).toFixed(0)}</strong>;
};

export const MenuCard = ({ item, onOrder, onOpen, quantity = 0, onIncrease, onDecrease, variant = 'menu' }) => (
  <article className={`menu-card menu-card--${variant}`}>
    <div className="menu-card__media">
      <button className="menu-card__open" type="button" aria-label={`View ${item.name}`} onClick={() => onOpen?.(item)}>
        <SafeImage className="menu-card__image" src={item.image?.url || item.image} alt={item.name} fallback="HF" loading="lazy" />
      </button>
      {item.isBestseller ? <span className="menu-card__bestseller"><Star aria-hidden="true" /> Bestseller</span> : null}
      <span className="food-dot food-dot--veg" aria-label="Pure vegetarian"><span /></span>
    </div>
    <div className="menu-card__body">
      <p className="menu-card__category">{item.category?.name || 'Healthiffy menu'}</p>
      <button className="menu-card__name" type="button" onClick={() => onOpen?.(item)}><h3>{item.name}</h3></button>
      <p className="menu-card__description">{item.description || 'Freshly prepared at your selected Healthiffy cafe.'}</p>
      <div className="menu-card__details">
        <PriceLabel item={item} />
        <span><Clock3 aria-hidden="true" /> {item.preparationTime || 'Fresh'}{item.preparationTime ? ' min' : ''}</span>
      </div>
      <div className="menu-card__footer">
        {quantity > 0 ? (
          <div className="menu-card__quantity" aria-label={`${item.name} quantity`}>
            <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onDecrease(item)}><Minus aria-hidden="true" /></button>
            <strong>{quantity}</strong>
            <button type="button" aria-label={`Add one ${item.name}`} onClick={() => onIncrease(item)}><Plus aria-hidden="true" /></button>
          </div>
        ) : onOrder ? (
          <button className="menu-card__add" type="button" onClick={() => onOrder(item, 1)}><Plus aria-hidden="true" /> Add</button>
        ) : null}
      </div>
    </div>
  </article>
);
