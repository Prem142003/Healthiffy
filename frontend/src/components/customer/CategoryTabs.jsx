export const CategoryTabs = ({ categories, selectedCategoryId, onSelectCategory }) => (
  <div className="category-tabs" role="group" aria-label="Filter by category">
    <button
      className={!selectedCategoryId ? 'is-active' : ''}
      aria-pressed={!selectedCategoryId}
      onClick={() => onSelectCategory('')}
      type="button"
    >
      All
    </button>
    {categories.map((category) => (
      <button
        key={category._id}
        className={selectedCategoryId === category._id ? 'is-active' : ''}
        aria-pressed={selectedCategoryId === category._id}
        onClick={() => onSelectCategory(category._id)}
        type="button"
      >
        {category.name}
      </button>
    ))}
  </div>
);
