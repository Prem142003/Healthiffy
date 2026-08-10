import SafeImage from "./SafeImage";

const BranchSpotlight = ({ branch }) => {
  if (!branch) {
    return (
      <section className="branch-spotlight branch-spotlight--empty" aria-label="Selected branch">
        <p className="dashboard-eyebrow">Your cafe</p>
        <h2>Select a branch to begin</h2>
        <p>Choose the Healthiffy location you want to order from in the menu section.</p>
        <a href="#menu" className="dashboard-text-link">Choose branch &#8594;</a>
      </section>
    );
  }

  return (
    <section className="branch-spotlight" aria-labelledby="selected-branch-title">
      <SafeImage
        src={branch.image?.url || branch.image}
        alt={branch.name}
        className="branch-spotlight__image"
        fallback="HF"
      />
      <div className="branch-spotlight__content">
        <p className="dashboard-eyebrow">Your selected cafe</p>
        <h2 id="selected-branch-title">{branch.name}</h2>
        <p>{branch.address || "Fresh meals are available from this Healthiffy branch."}</p>
        <div className="branch-spotlight__details">
          {branch.contactNumber ? <span>{branch.contactNumber}</span> : null}
          {branch.openingTime || branch.closingTime ? (
            <span>{branch.openingTime || "Open"} - {branch.closingTime || "Close"}</span>
          ) : null}
        </div>
        <a href="#branch-picker" className="dashboard-text-link">Change branch &#8594;</a>
      </div>
    </section>
  );
};

export default BranchSpotlight;
