export const BranchSelector = ({ branches, selectedBranchId, onSelectBranch }) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    {branches.map((branch) => (
      <button
        key={branch._id}
        className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium ${
          selectedBranchId === branch._id
            ? 'border-emerald-700 bg-emerald-700 text-white'
            : 'border-slate-300 bg-white text-slate-700'
        }`}
        onClick={() => onSelectBranch(branch._id)}
        type="button"
      >
        {branch.name}
      </button>
    ))}
  </div>
);
