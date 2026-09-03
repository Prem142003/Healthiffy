import { CalendarDays, ChevronDown, CircleUserRound, ClipboardList, House, Leaf, MapPin, ShoppingBag, UtensilsCrossed, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import avocadoImage from '../../assets/images/avocado_slices_1788424146185.jpg';
import bowlImage from '../../assets/images/delightful_final_salad_1788424754145.jpg';
import tomatoImage from '../../assets/images/tomato_slices_1788424182429.jpg';
import { CategoryTabs } from '../../components/customer/CategoryTabs';
import RecentOrders from '../../components/customer/dashboard/RecentOrders';
import WelcomeSection from '../../components/customer/dashboard/WelcomeSection';
import { MenuCard } from '../../components/customer/MenuCard';
import './CustomerDashboard.css';

const branch = { _id: 'preview-branch', name: 'Healthiffy Central Cafe' };

const categories = [
  { _id: 'bowls', name: 'Signature bowls' },
  { _id: 'breakfast', name: 'Breakfast' },
  { _id: 'salads', name: 'Fresh salads' },
  { _id: 'drinks', name: 'Coolers' }
];

const menuItems = [
  ['preview-bowl', 'Harvest Power Bowl', 'Garden greens, roasted chickpeas, vegetables and house dressing.', 249, 18, true, categories[0], bowlImage],
  ['preview-avocado', 'Avocado Garden Toast', 'Creamy avocado, herbs, tomatoes and toasted multigrain bread.', 189, 12, true, categories[1], avocadoImage],
  ['preview-tomato', 'Heirloom Tomato Salad', 'Juicy tomatoes, cucumber, paneer and a bright citrus dressing.', 219, 10, false, categories[2], tomatoImage],
  ['preview-paneer', 'Smoky Paneer Bowl', 'Charred paneer, herbed rice, greens and a creamy mint dressing.', 269, 20, true, categories[0], bowlImage],
  ['preview-toast', 'Garden Hummus Toast', 'House hummus, crisp vegetables and seeds on multigrain toast.', 179, 12, false, categories[1], avocadoImage],
  ['preview-salad', 'Citrus Crunch Salad', 'Seasonal greens, cucumber, tomato, seeds and citrus vinaigrette.', 209, 10, false, categories[2], tomatoImage],
  ['preview-protein', 'Protein Garden Bowl', 'Paneer, chickpeas, fresh vegetables and a tangy house sauce.', 279, 18, true, categories[0], bowlImage],
  ['preview-cooler', 'Mint Cucumber Cooler', 'Cucumber, mint, lime and a touch of natural sweetness.', 119, 6, false, categories[3], avocadoImage]
].map(([id, name, description, price, preparationTime, isBestseller, category, image]) => ({
  _id: id,
  name,
  description,
  price,
  preparationTime,
  isBestseller,
  category,
  image,
  foodType: 'VEG'
}));

const orders = [{
  _id: 'preview-order',
  orderNumber: 'HF2048',
  paymentStatus: 'PAID',
  totalAmount: 438,
  createdAt: new Date().toISOString(),
  branch: { name: branch.name },
  items: [
    { nameSnapshot: 'Harvest Power Bowl', quantity: 1 },
    { nameSnapshot: 'Avocado Garden Toast', quantity: 1 }
  ]
}];

const PreviewHeader = () => (
  <header className="authenticated-header sticky top-0 z-[70] border-b border-[#ede383]/10 text-[#ede383] backdrop-blur-xl">
    <div className="authenticated-header__inner mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
      <span className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-[50%_50%_50%_12px] bg-[#8da432] text-[#351903]"><Leaf size={20} /></span>
        <span className="hidden sm:block"><strong className="font-heading block text-lg font-black tracking-[-0.04em]">HEALTHIFFY</strong><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#ede383]/75">Pure veg cafe</span></span>
      </span>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Preview customer navigation">
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#8da432] px-3 py-2 text-sm font-bold text-[#351903]"><House size={16} /> Home</span>
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-[#ede383]/75"><ClipboardList size={16} /> Orders</span>
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-[#ede383]/75"><CalendarDays size={16} /> Monthly</span>
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#ede383]/15 px-3 py-2 text-sm font-bold"><ShoppingBag size={16} /> Cart</span>
      </nav>
      <label className="relative flex min-w-0 items-center text-[#8da432]">
        <MapPin className="pointer-events-none absolute left-3" size={16} />
        <span className="sr-only">Ordering branch</span>
        <select className="h-11 w-[clamp(8.5rem,16vw,12rem)] appearance-none truncate rounded-full border border-[#ede383]/15 bg-[#ede383]/5 py-2 pl-9 pr-7 text-sm font-bold text-[#ede383] outline-none" defaultValue={branch._id}>
          <option className="text-[#351903]" value={branch._id}>{branch.name}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5" size={14} />
      </label>
      <span className="hidden h-11 w-11 place-items-center rounded-full bg-[#8da432] text-[#351903] md:grid"><UserRound size={18} /></span>
    </div>
  </header>
);

export const CustomerDashboardPreview = () => (
  <div className="customer-app">
    <div className="bg-[var(--healthiffy-forest)] px-4 py-2 text-center text-sm font-bold text-[#ede383]">
      Development preview — sample data only. <Link className="text-[#ede383] underline" to="/login">Go to real sign in</Link>
    </div>
    <div onClickCapture={(event) => {
      if (event.target.closest('a, button')) event.preventDefault();
    }}>
      <PreviewHeader />
      <main className="customer-app customer-dashboard">
        <div className="customer-dashboard__container customer-dashboard__intro">
          <WelcomeSection name="Aarav Sharma" branchName={branch.name} cartCount={2} />
        </div>

        <section id="menu" className="customer-menu" aria-labelledby="preview-menu-title">
          <div className="customer-menu__inner">
            <div className="dashboard-section__heading customer-menu__heading">
              <div><p className="dashboard-eyebrow">Made fresh at your cafe</p><h2 id="preview-menu-title">{branch.name} menu</h2></div>
              <label className="customer-search customer-search--header"><span className="sr-only">Search menu</span><input type="search" placeholder="Search dishes or ingredients" /></label>
            </div>
            <div className="customer-menu__controls">
              <div className="customer-filter-group"><CategoryTabs categories={categories} selectedCategoryId="" onSelectCategory={() => {}} bestsellersOnly={false} onToggleBestsellers={() => {}} /></div>
              <p className="customer-menu__count">{menuItems.length} items</p>
            </div>
            <div className="customer-menu-grid">
              {menuItems.map((item) => <MenuCard key={item._id} item={item} quantity={item._id === 'preview-bowl' ? 1 : 0} onOrder={() => {}} onIncrease={() => {}} onDecrease={() => {}} />)}
            </div>
          </div>
        </section>

        <section className="customer-activity" aria-label="Your recent activity">
          <div className="customer-dashboard__container"><RecentOrders orders={orders} loading={false} error="" /></div>
        </section>
        <footer className="customer-footer"><div><strong>HEALTHIFFY</strong><span>Pure veg cafe · {branch.name}</span><span>Order history</span><span>Monthly plans</span></div></footer>
      </main>
      <div className="mobile-role-nav__spacer" aria-hidden="true" />
      <nav className="mobile-role-nav mobile-role-nav--customer" aria-label="Preview mobile navigation">
        {[
          ['Home', House],
          ['Menu', UtensilsCrossed],
          ['Cart', ShoppingBag],
          ['Orders', ClipboardList],
          ['Profile', CircleUserRound]
        ].map(([label, Icon], index) => (
          <button className={`mobile-role-nav__item ${index === 0 ? 'is-active' : ''}`} type="button" key={label}>
            <span className="mobile-role-nav__indicator" aria-hidden="true" />
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  </div>
);
