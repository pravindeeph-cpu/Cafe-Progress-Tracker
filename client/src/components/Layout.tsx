import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/', num: '1', label: 'Command Centre' },
  { to: '/tasks', num: '2', label: 'Master Tasks' },
  { to: '/financial', num: '3', label: 'Financial Model' },
  { to: '/licences', num: '4', label: 'Licences & Compliance' },
  { to: '/menu-suppliers', num: '5', label: 'Menu & Suppliers' },
  { to: '/property', num: '6', label: 'Property & Fit-Out' },
  { to: '/people', num: '7', label: 'People & SOPs' },
  { to: '/pre-opening', num: '8', label: 'Pre-Opening' },
  { to: '/gates', num: 'G', label: 'Go/No-Go Gates' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="name">☕ Launch Control Centre</div>
          <div className="tag">Cafe Opening Tracker · Malaysia</div>
        </div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="num">{item.num}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
