export const CategoryTabs = ({ categories, selectedCategoryId, onSelectCategory }) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    <button
      className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium ${
        !selectedCategoryId
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 bg-white text-slate-700'
      }`}
      onClick={() => onSelectCategory('')}
      type="button"
    >
      All
    </button>
    {categories.map((category) => (
      <button
        key={category._id}
        className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium ${
          selectedCategoryId === category._id
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 bg-white text-slate-700'
        }`}
        onClick={() => onSelectCategory(category._id)}
        type="button"
      >
        {category.name}
      </button>
    ))}
  </div>
);
