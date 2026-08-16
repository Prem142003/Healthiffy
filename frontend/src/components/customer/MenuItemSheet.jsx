import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import SafeImage from './dashboard/SafeImage';

export const MenuItemSheet = ({ item, onClose, onAdd }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    if (!item) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [item, onClose]);

  if (!item) return null;

  const price = item.offerPrice ?? item.price;

  return (
    <div className="menu-sheet-layer">
      <button className="menu-sheet-layer__backdrop" type="button" aria-label="Close item details" onClick={onClose} />
      <section className="menu-item-sheet" role="dialog" aria-modal="true" aria-labelledby="menu-sheet-title">
        <div className="menu-item-sheet__handle" aria-hidden="true" />
        <button className="menu-item-sheet__close" type="button" aria-label="Close item details" title="Close item details" onClick={onClose}><X aria-hidden="true" /></button>
        <SafeImage
          className="menu-item-sheet__image"
          src={item.image?.url || item.image}
          alt={item.name}
          fallback="HF"
          eager
        />
        <div className="menu-item-sheet__content">
          <div className="menu-item-sheet__title-row">
            <div>
              <p>{item.category?.name || 'Healthiffy menu'}</p>
              <h2 id="menu-sheet-title">{item.name}</h2>
            </div>
            <strong>Rs. {Number(price || 0).toFixed(0)}</strong>
          </div>
          <p className="menu-item-sheet__description">{item.description}</p>
          <div className="menu-item-sheet__meta">
            <span>{item.foodType === 'NON_VEG' ? 'Non vegetarian' : 'Vegetarian'}</span>
            <span>{item.preparationTime} min</span>
          </div>
          <div className="menu-item-sheet__action-row">
            <div className="quantity-stepper" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(value - 1, 1))}>-</button>
              <strong>{quantity}</strong>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(value + 1, 50))}>+</button>
            </div>
            <button
              className="menu-item-sheet__add"
              type="button"
              onClick={() => {
                onAdd(item, quantity);
                onClose();
              }}
            >
              Add for Rs. {Number(price || 0) * quantity}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
