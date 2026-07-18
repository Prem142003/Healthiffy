const getPriceLabel = (item) => {
  if (item.offerPrice !== undefined && item.offerPrice !== null) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-slate-950">₹{item.offerPrice}</span>
        <span className="text-sm text-slate-500 line-through">₹{item.price}</span>
      </div>
    );
  }

  return <span className="text-lg font-semibold text-slate-950">₹{item.price}</span>;
};

export const MenuCard = ({ item, onOrder }) => (
  <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="aspect-[4/3] bg-slate-100">
      {item.image?.url ? (
        <img className="h-full w-full object-cover" src={item.image.url} alt={item.name} />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
          Image coming soon
        </div>
      )}
    </div>
    <div className="space-y-3 p-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">{item.name}</h3>
          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${item.foodType === 'VEG' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {item.foodType === 'VEG' ? 'Veg' : 'Non Veg'}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        {getPriceLabel(item)}
        <span className="text-sm text-slate-500">{item.preparationTime} min</span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500">{item.category?.name}</span>
        {item.isBestseller && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Bestseller</span>}
      </div>
      {onOrder && (
        <button className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" onClick={() => onOrder(item)} type="button">
          Add to Cart
        </button>
      )}
    </div>
  </article>
);
