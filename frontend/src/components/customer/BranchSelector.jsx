import SafeImage from './dashboard/SafeImage';

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
        <SafeImage
          className="branch-selector__image"
          src={branch.image?.url || branch.image}
          alt={branch.name}
          fallback="HF"
        />
        <span className="branch-selector__copy">
          <strong>{branch.name}</strong>
          <small>{branch.address || (branch.status === 'OPEN' ? 'Open now' : branch.status)}</small>
        </span>
      </button>
    ))}
  </div>
);
