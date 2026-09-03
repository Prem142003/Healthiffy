import { Clock3, MapPin } from 'lucide-react';
import SafeImage from './SafeImage';

const BranchSpotlight = ({ branch }) => {
  if (!branch) {
    return (
      <section className="branch-spotlight branch-spotlight--empty" aria-label="Selected branch">
        <div><p className="dashboard-eyebrow">Your current cafe</p><h2>Select a branch to begin</h2><p>Choose the Healthiffy location you want to order from in the menu section.</p><a href="#menu" className="dashboard-button dashboard-button--light">Choose branch</a></div>
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
        <p className="dashboard-eyebrow">Your current cafe</p>
        <h2 id="selected-branch-title">{branch.name}</h2>
        <p>{branch.address || "Fresh meals are available from this Healthiffy branch."}</p>
        <div className="branch-spotlight__details">
          {branch.address ? <span><MapPin aria-hidden="true" /> Selected location</span> : null}
          {branch.contactNumber ? <span>{branch.contactNumber}</span> : null}
          {branch.openingTime || branch.closingTime ? (
            <span><Clock3 aria-hidden="true" /> {branch.openingTime || "Open"} – {branch.closingTime || "Close"}</span>
          ) : null}
        </div>
        <a href="#menu" className="dashboard-button dashboard-button--light">Explore this menu</a>
        <a href="#branch-picker" className="dashboard-text-link">Change cafe &#8594;</a>
      </div>
    </section>
  );
};

export default BranchSpotlight;
