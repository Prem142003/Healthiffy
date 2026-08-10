export const BranchSelector = ({ branches, selectedBranchId, onSelectBranch }) => (
  <div className="branch-selector" role="group" aria-label="Choose ordering branch">
    {branches.map((branch) => (
      <button
        key={branch._id}
        className={selectedBranchId === branch._id ? 'is-active' : ''}
        aria-pressed={selectedBranchId === branch._id}
        onClick={() => onSelectBranch(branch._id)}
        type="button"
      >
        <span>{branch.name}</span>
        <small>{branch.status === 'OPEN' ? 'Open now' : branch.status}</small>
      </button>
    ))}
  </div>
);
